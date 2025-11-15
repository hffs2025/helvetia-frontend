import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // URL GIUSTA: prima env "server-side", poi eventuale NEXT_PUBLIC
  const API_URL =
    process.env["CHECK_EMAIL_API_URL"] ??
    process.env["NEXT_PUBLIC_CHECK_EMAIL_API_URL"] ??
    "";

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { available: false, error: "missing_email" },
      { status: 400 }
    );
  }

  if (!API_URL) {
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
  }).catch(() => null);

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

  // QUI: usiamo esattamente quello che dice la Lambda
  return NextResponse.json({ available: data?.available === true });
}
