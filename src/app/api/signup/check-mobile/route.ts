import { NextRequest, NextResponse } from "next/server";

function resolveApiUrl() {
  const fromPublic = process.env.NEXT_PUBLIC_CHECK_MOBILE_API_URL;
  const fromServer = process.env.CHECK_MOBILE_API_URL;
  const fromProd = (process.env as any).CHECK_MOBILE_API_URL_PROD;

  const url = (fromPublic || fromServer || fromProd || "").trim();

  if (!url) {
    console.error("[check-mobile] No API_URL found. Env values:", {
      NEXT_PUBLIC_CHECK_MOBILE_API_URL: fromPublic,
      CHECK_MOBILE_API_URL: fromServer,
      CHECK_MOBILE_API_URL_PROD: fromProd,
    });
  } else {
    console.log("[check-mobile] Using API_URL:", url);
  }

  return url;
}

const API_URL = resolveApiUrl();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const mobileE164 = String(body?.mobileE164 ?? "").trim();

    // se manca il mobile → errore client (400)
    if (!mobileE164) {
      return NextResponse.json(
        { available: false, error: "missing_mobile" },
        { status: 400 }
      );
    }

    // se manca la URL di backend → errore server (500)
    if (!API_URL) {
      console.error(
        "[check-mobile] Nessuna API_URL trovata. Verifica le env: NEXT_PUBLIC_CHECK_MOBILE_API_URL / CHECK_MOBILE_API_URL / CHECK_MOBILE_API_URL_PROD"
      );
      return NextResponse.json(
        { available: false, error: "missing_api_url" },
        { status: 500 }
      );
    }

    // chiamata alla Lambda/API Gateway
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
        { status: 502 }
      );
    }

    const text = await upstream.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.warn("[check-mobile] upstream non-JSON response:", text);
    }

    // se la Lambda fornisce "available", usiamo quello; altrimenti default true
    const available =
      typeof data?.available === "boolean" ? data.available : true;

    return NextResponse.json({ available }, { status: 200 });
  } catch (err) {
    console.error("[check-mobile] route error:", err);
    return NextResponse.json(
      { available: false, error: "temporary_error" },
      { status: 500 }
    );
  }
}
