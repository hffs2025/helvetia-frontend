import { NextRequest, NextResponse } from "next/server";

// Cerchiamo la URL in modo robusto sia in dev che in prod.
// 1) NEXT_PUBLIC_CHECK_EMAIL_API_URL (di solito quella corretta, usata anche dal client)
// 2) CHECK_EMAIL_API_URL (fallback lato server)
// Se nessuna è presente → stringa vuota.
const API_URL =
  (
    process.env.NEXT_PUBLIC_CHECK_EMAIL_API_URL ||
    process.env.CHECK_EMAIL_API_URL ||
    ""
  ).trim();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const email = String(body?.email ?? "").trim().toLowerCase();

    // Debug opzionale: vedi cosa arriva dal client
    // console.log("[check-email] BODY:", body, "PARSED EMAIL:", email);

    // se manca l'email → non disponibile
    if (!email) {
      return NextResponse.json(
        { available: false, error: "missing_email" },
        { status: 200 }
      );
    }

    // se manca la URL di backend → log e fallback
    if (!API_URL) {
      console.error(
        "[check-email] Nessuna API_URL trovata. Verifica NEXT_PUBLIC_CHECK_EMAIL_API_URL / CHECK_EMAIL_API_URL"
      );
      return NextResponse.json(
        { available: false, error: "missing_api_url" },
        { status: 200 }
      );
    }

    // chiamata alla Lambda/API Gateway
    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    }).catch((e) => {
      console.error("[check-email] upstream fetch error:", e);
      return null;
    });

    if (!upstream) {
      return NextResponse.json(
        { available: false, error: "upstream_unreachable" },
        { status: 200 }
      );
    }

    const text = await upstream.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.warn("[check-email] upstream non-JSON response:", text);
    }

    const available =
      typeof data?.available === "boolean" ? data.available : false;

    return NextResponse.json({ available }, { status: 200 });
  } catch (err) {
    console.error("[check-email] route error:", err);
    return NextResponse.json(
      { available: false, error: "temporary_error" },
      { status: 200 }
    );
  }
}
