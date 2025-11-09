import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.CHECK_EMAIL_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_EMAIL_API_URL ||
  "https://<api-id>.execute-api.<region>.amazonaws.com/signup/check-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmail(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) &&
    (v as string).length <= 254
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const r = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    const text = await r.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || "Upstream error" };
    }

    return NextResponse.json(data, { status: r.status });
  } catch (err) {
    console.error("check-email route error:", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
