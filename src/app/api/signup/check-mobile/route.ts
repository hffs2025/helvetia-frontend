import { NextRequest, NextResponse } from "next/server";

const RAW_API_URL =
  process.env.CHECK_MOBILE_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_MOBILE_API_URL ||
  "";

const API_URL = RAW_API_URL.trim();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    // dal frontend arriva mobileE164
    const mobileE164 = String(body?.mobileE164 ?? body?.mobile ?? "").trim();

    if (!mobileE164) {
      return NextResponse.json(
        { available: false, error: "missing_mobile" },
        { status: 200 }
      );
    }

    if (!API_URL) {
      console.error(
        "[check-mobile] CHECK_MOBILE_API_URL / NEXT_PUBLIC_CHECK_MOBILE_API_URL non configurata"
      );
      return NextResponse.json(
        { available: false, error: "missing_api_url" },
        { status: 200 }
      );
    }

    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mobileE164 }),
      cache: "no-store",
    }).catch((e) => {
      console.error("[check-mobile] upstream fetch error:", e);
      return null;
    });

    if (!upstream) {
      return NextResponse.json(
        { available: false, error: "upstream_unreachable" },
        { status: 200 }
      );
    }

    const text = await upstream.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.warn("[check-mobile] upstream non-JSON response:", text);
    }

    const available =
      typeof data?.available === "boolean" ? data.available : false;

    return NextResponse.json({ available }, { status: 200 });
  } catch (err) {
    console.error("[check-mobile] route error:", err);
    return NextResponse.json(
      { available: false, error: "temporary_error" },
      { status: 200 }
    );
  }
}
