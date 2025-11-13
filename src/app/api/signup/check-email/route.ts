import { NextRequest, NextResponse } from "next/server";

const RAW_API_URL =
  process.env.CHECK_EMAIL_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_EMAIL_API_URL ||
  "";

const API_URL = RAW_API_URL.trim();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const email = String(body?.email ?? "").trim().toLowerCase();

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
        "[check-email] CHECK_EMAIL_API_URL / NEXT_PUBLIC_CHECK_EMAIL_API_URL non configurata"
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
