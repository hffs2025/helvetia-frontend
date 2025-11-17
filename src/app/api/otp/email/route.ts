import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.OTP_EMAIL_API_URL || process.env.NEXT_PUBLIC_OTP_EMAIL_API_URL || "";

export async function POST(req: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { sent: false, verified: false, error: "missing_api_url" },
      { status: 500 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { sent: false, verified: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  try {
    const upstreamRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await upstreamRes.json().catch(() => ({}));

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          sent: false,
          verified: false,
          error: "upstream_non_200",
          status: upstreamRes.status,
          upstream: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[/api/otp/email] upstream_fetch_failed", err);
    return NextResponse.json(
      { sent: false, verified: false, error: "upstream_fetch_failed" },
      { status: 500 }
    );
  }
}
