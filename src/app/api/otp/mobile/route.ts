// app/api/otp/mobile/route.ts
import { NextRequest, NextResponse } from "next/server";

// Leggiamo la URL della Lambda dall'env
const API_URL =
  process.env.OTP_MOBILE_API_URL || process.env.NEXT_PUBLIC_OTP_MOBILE_API_URL || "";

console.log("[/api/otp/mobile] Boot, API_URL =", API_URL);

export async function POST(req: NextRequest) {
  if (!API_URL) {
    console.error("[/api/otp/mobile] missing API_URL env");
    return NextResponse.json(
      { sent: false, verified: false, error: "missing_api_url" },
      { status: 500 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch (err) {
    console.error("[/api/otp/mobile] Error parsing request JSON", err);
    return NextResponse.json(
      { sent: false, verified: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  try {
    console.log("[/api/otp/mobile] Calling upstream", {
      API_URL,
      body,
    });

    const upstreamRes = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await upstreamRes
      .json()
      .catch(() => ({} as Record<string, unknown>));

    if (!upstreamRes.ok) {
      console.error("[/api/otp/mobile] Upstream non-200", {
        status: upstreamRes.status,
        data,
      });
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

    console.log("[/api/otp/mobile] Upstream OK", data);
    // La Lambda ritorna { sent, verified, error? }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[/api/otp/mobile] upstream_fetch_failed", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    });
    return NextResponse.json(
      { sent: false, verified: false, error: "upstream_fetch_failed" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
