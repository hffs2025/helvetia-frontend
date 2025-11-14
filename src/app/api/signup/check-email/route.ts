import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.CHECK_EMAIL_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_EMAIL_API_URL ||
  "";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({ email: "" }));
    const normalized = String(email || "").trim().toLowerCase();

    if (!normalized || !API_URL) {
      return NextResponse.json({ available: false }, { status: 200 });
    }

    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: normalized }),
      cache: "no-store",
    }).catch(() => null);

    if (!upstream) return NextResponse.json({ available: false }, { status: 200 });

    let data: any = {};
    try {
      data = JSON.parse(await upstream.text());
    } catch {
      data = {};
    }

    const available = data?.available === true;
    return NextResponse.json({ available }, { status: 200 });
  } catch {
    return NextResponse.json({ available: false }, { status: 200 });
  }
}
