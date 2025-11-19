import { NextRequest, NextResponse } from "next/server";

function resolveApiUrl() {
  const fromPublic = process.env.NEXT_PUBLIC_CHECK_EMAIL_API_URL;
  const fromServer = process.env.CHECK_EMAIL_API_URL;
  const fromProd = (process.env as any).CHECK_EMAIL_API_URL_PROD;

  const url = (fromPublic || fromServer || fromProd || "").trim();

  if (!url) {
    console.error("[check-email] No API_URL found. Env values:", {
      NEXT_PUBLIC_CHECK_EMAIL_API_URL: fromPublic,
      CHECK_EMAIL_API_URL: fromServer,
      CHECK_EMAIL_API_URL_PROD: fromProd,
    });
  } else {
    console.log("[check-email] Using API_URL:", url);
  }

  return url;
}

const API_URL = resolveApiUrl();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const email = String(body?.email ?? "").trim().toLowerCase();

    // se manca l'email → errore client (400)
    if (!email) {
      return NextResponse.json(
        { available: false, error: "missing_email" },
        { status: 400 }
      );
    }

    // se manca la URL di backend → errore server (500)
    if (!API_URL) {
      console.error(
        "[check-email] Nessuna API_URL trovata. Verifica le env: NEXT_PUBLIC_CHECK_EMAIL_API_URL / CHECK_EMAIL_API_URL / CHECK_EMAIL_API_URL_PROD"
      );
      return NextResponse.json(
        { available: false, error: "missing_api_url" },
        { status: 500 }
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
        { status: 502 }
      );
    }

    const text = await upstream.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.warn("[check-email] upstream non-JSON response:", text);
    }

    // diamo priorità al campo "available" se la Lambda lo fornisce
    const available =
      typeof data?.available === "boolean" ? data.available : true;

    return NextResponse.json({ available }, { status: 200 });
  } catch (err) {
    console.error("[check-email] route error:", err);
    return NextResponse.json(
      { available: false, error: "temporary_error" },
      { status: 500 }
    );
  }
}
