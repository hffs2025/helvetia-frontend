import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.CHECK_EMAIL_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_EMAIL_API_URL;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({}));

    if (!email) {
      return NextResponse.json(
        { available: false, error: "Missing email" },
        { status: 200 }
      );
    }

    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
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
