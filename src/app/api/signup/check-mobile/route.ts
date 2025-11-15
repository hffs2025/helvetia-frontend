import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1. Prendo l'URL dell'API mobile
  const API_URL =
    process.env["CHECK_MOBILE_API_URL"] ??
    process.env["NEXT_PUBLIC_CHECK_MOBILE_API_URL"] ??
    "";

  // 2. Leggo il body e ricavo mobileE164
  const body = await req.json().catch(() => ({}));
  const mobileE164 = String(body.mobileE164 || "").trim();

  if (!mobileE164) {
    return NextResponse.json(
      { available: false, error: "missing_mobileE164" },
      { status: 400 }
    );
  }

  if (!API_URL) {
    return NextResponse.json(
      { available: false, error: "missing_api_url" },
      { status: 500 }
    );
  }

  // 3. Chiamo la Lambda MOBILE
  const upstream = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mobileE164 }),
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
    // Propago l'errore della Lambda mobile se ce n'è uno
    return NextResponse.json(
      { available: false, error: data.error },
      { status: 502 }
    );
  }

  return NextResponse.json({ available: data?.available === true });
}
