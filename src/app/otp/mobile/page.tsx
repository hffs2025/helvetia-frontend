import { NextRequest, NextResponse } from "next/server";

// 1) Dev: OTP_MOBILE_API_URL
// 2) Prod: OTP_MOBILE_API_URL_PROD
// 3) Fallback: NEXT_PUBLIC_OTP_MOBILE_API_URL
const API_URL =
  process.env.OTP_MOBILE_API_URL ||
  process.env.OTP_MOBILE_API_URL_PROD ||
  process.env.NEXT_PUBLIC_OTP_MOBILE_API_URL ||
  "";

export async function POST(req: NextRequest) {
  if (!API_URL) {
    console.error(
      "OTP_MOBILE API URL not defined (OTP_MOBILE_API_URL / OTP_MOBILE_API_URL_PROD / NEXT_PUBLIC_OTP_MOBILE_API_URL)"
    );
    return NextResponse.json(
      { sent: false, verified: false, error: "missing_api_url" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));

  const upstream = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch((err) => {
    console.error("Error calling OTP_MOBILE upstream:", err);
    return null;
  });

  if (!upstream) {
    return NextResponse.json(
      { sent: false, verified: false, error: "upstream_fetch_failed" },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  let data: any = null;

  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { sent: false, verified: false, error: "upstream_not_json", upstreamRaw: text },
      { status: 502 }
    );
  }

  return NextResponse.json(data, { status: upstream.status });
}
