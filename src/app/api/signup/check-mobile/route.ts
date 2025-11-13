import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.CHECK_MOBILE_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_MOBILE_API_URL;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { mobileE164 } = await req.json().catch(() => ({}));

    if (!mobileE164) {
      return NextResponse.json(
        { available: false, error: "Missing mobile" },
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
    try { data = JSON.parse(text); } catch {}

    // NORMALIZZIAMO
    return NextResponse.json(
      { available: !!data.available },
      { status: 200 }
    );

  } catch (err) {
    return NextResponse.json(
      { available: false },
      { status: 200 }
    );
  }
}
