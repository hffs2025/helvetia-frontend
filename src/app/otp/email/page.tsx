import { NextRequest, NextResponse } from "next/server";

// 1) Dev: OTP_EMAIL_API_URL
// 2) Prod: OTP_EMAIL_API_URL_PROD
// 3) Fallback: NEXT_PUBLIC_OTP_EMAIL_API_URL
const API_URL =
  process.env.OTP_EMAIL_API_URL ||
  process.env.OTP_EMAIL_API_URL_PROD ||
  process.env.NEXT_PUBLIC_OTP_EMAIL_API_URL ||
  "";

export async function POST(req: NextRequest) {
  if (!API_URL) {
    console.error(
      "OTP_EMAIL API URL not defined (OTP_EMAIL_API_URL / OTP_EMAIL_API_URL_PROD / NEXT_PUBLIC_OTP_EMAIL_API_URL)"
    );
    return NextResponse.json(
      { sent: false, verified: false, error: "missing_api_url" },
      { status: 500 }
    );
  }

  // Leggo il body così com’è (action: 'send' | 'verify', email, code, ecc.)
  const body = await req.json().catch(() => ({}));

  // Faccio da semplice proxy verso la Lambda otp-email-svc
  const upstream = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch((err) => {
    console.error("Error calling OTP_EMAIL upstream:", err);
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

  // Propago direttamente la risposta della Lambda
  return NextResponse.json(data, { status: upstream.status });
}
