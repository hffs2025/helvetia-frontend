// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.SIGNUP_COMPLETE_API_URL ||
  process.env.NEXT_PUBLIC_SIGNUP_COMPLETE_API_URL ||
  "";

export async function POST(req: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { created: false, error: "missing_api_url" },
      { status: 500 }
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { created: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  // 👇 LOG IMPORTANTE: vediamo se il frontend MANDA ipAddress e ipCountry
  console.log("NEXT API /signup/complete BODY:", body);

  try {
    const upstreamRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),   // 👈 MANDIAMO TUTTO IL BODY ORIGINALE
      cache: "no-store",
    });

    const data = await upstreamRes.json().catch(() => ({}));

    if (!upstreamRes.ok || data?.created !== true) {
      return NextResponse.json(
        {
          created: false,
          error: data?.error || "upstream_error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ created: true });
  } catch (err) {
    console.error("NEXT signup-complete upstream_fetch_failed:", err);
    return NextResponse.json(
      {
        created: false,
        error: "upstream_fetch_failed",
      },
      { status: 500 }
    );
  }
}
