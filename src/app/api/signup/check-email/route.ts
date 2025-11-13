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
    const { email } = await req.json().catch(() => ({}));

    if (!email) {
      return NextResponse.json({ available: false }, { status: 200 });
    }

    // SE API_URL NON È STATO CONFIGURATO
    if (!API_URL) {
      console.error("❌ CHECK_EMAIL_API_URL is missing in environment variables");
      return NextResponse.json(
        { available: false, error: "missing_api_url" },
        { status: 200 }
      );
    }

    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    // fallback safe parsing
    const text = await upstream.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {}

    return NextResponse.json(
      { available: !!data.available },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ check-email route error:", err);
    return NextResponse.json(
      { available: false, error: "temporary_error" },
      { status: 200 }
    );
  }
}
