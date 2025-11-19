import { NextRequest, NextResponse } from "next/server";

// 1) Dev: CHECK_EMAIL_API_URL
// 2) Prod: CHECK_EMAIL_API_URL_PROD
// 3) Fallback: NEXT_PUBLIC_CHECK_EMAIL_API_URL
const API_URL =
  process.env.CHECK_EMAIL_API_URL ||
  process.env.CHECK_EMAIL_API_URL_PROD ||
  process.env.NEXT_PUBLIC_CHECK_EMAIL_API_URL ||
  "";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { available: false, error: "missing_email" },
      { status: 400 }
    );
  }

  if (!API_URL) {
    console.error(
      "CHECK_EMAIL API URL not defined (CHECK_EMAIL_API_URL / CHECK_EMAIL_API_URL_PROD / NEXT_PUBLIC_CHECK_EMAIL_API_URL)"
    );
    return NextResponse.json(
      { available: false, error: "missing_api_url" },
      { status: 500 }
    );
  }

  const upstream = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store"
  }).catch((err) => {
    console.error("Error calling CHECK_EMAIL upstream:", err);
    return null;
  });

  if (!upstream) {
    return NextResponse.json(
      { available: false, error: "upstream_fetch_failed" },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  let data: any = null;

  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { available: false, error: "upstream_not_json", upstreamRaw: text },
      { status: 502 }
    );
  }

  if (data?.error) {
    return NextResponse.json(
      { available: false, error: data.error },
      { status: 502 }
    );
  }

  // Usiamo esattamente quello che dice la Lambda
  return NextResponse.json({ available: data?.available === true });
}
