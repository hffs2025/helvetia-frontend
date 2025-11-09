import { NextRequest, NextResponse } from "next/server";
const API_URL = process.env.CHECK_MOBILE_API_URL!; // deve esistere

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isE164(v: unknown): v is string {
  return typeof v === "string" && /^\+[1-9]\d{6,14}$/.test(v);
}

export async function POST(req: NextRequest) {
  try {
    const { mobileE164 } = await req.json().catch(() => ({}));
    if (!isE164(mobileE164)) {
      return NextResponse.json({ error: "Invalid mobile format (E.164 required)" }, { status: 400 });
    }
    const r = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mobileE164 }),
    });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
