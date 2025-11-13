import { NextRequest, NextResponse } from "next/server";

const RAW_API_URL =
  process.env.CHECK_MOBILE_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_MOBILE_API_URL ||
  "";

const API_URL = RAW_API_URL.trim();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { mobileE164 } = await req.json().catch(() => ({}));

    if (!mobileE164) {
      return NextResponse.json({ available: false }, { status: 200 });
    }

    if (!API_URL) {
      console.error("❌ CHECK_MOBILE_API_URL is missing");
      return NextResponse.json(
        { available: false, error: "missing_api_url" },
        { status: 200 }
      );
    }

    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mobileE164 }),
      cache: "no-store",
    });

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
    console.error("❌ check-mobile route error:", err);
    return NextResponse.json(
      { available: false, error: "temporary_error" },
      { status: 200 }
    );
  }
}
