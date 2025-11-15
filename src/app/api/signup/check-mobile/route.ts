import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.CHECK_MOBILE_API_URL || "";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const mobileE164 = String(body.mobileE164 || "").trim();

  if (!mobileE164 || !API_URL) {
    return NextResponse.json(
      { available: false, error: "missing_mobile_or_api_url" },
      { status: 500 }
    );
  }

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

  // Se la Lambda segnala un errore, lo propaghiamo
  if (data?.error) {
    return NextResponse.json(
      { available: false, error: data.error },
      { status: 502 }
    );
  }

  // Solo qui decidiamo davvero la disponibilità
  const available = data?.available === true;

  return NextResponse.json({ available });
}
