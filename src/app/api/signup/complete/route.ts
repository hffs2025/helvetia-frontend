// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveApiUrl() {
  const env: any = process.env;

  const fromPublic = env.NEXT_PUBLIC_SIGNUP_COMPLETE_API_URL;
  const fromServer = env.SIGNUP_COMPLETE_API_URL;
  const fromProd = env.SIGNUP_COMPLETE_API_URL_PROD;

  const url =
    (fromPublic && String(fromPublic).trim()) ||
    (fromServer && String(fromServer).trim()) ||
    (fromProd && String(fromProd).trim()) ||
    "";

  console.log("[signup-complete] Env values", {
    NEXT_PUBLIC_SIGNUP_COMPLETE_API_URL: fromPublic,
    SIGNUP_COMPLETE_API_URL: fromServer,
    SIGNUP_COMPLETE_API_URL_PROD: fromProd,
    RESOLVED_API_URL: url,
  });

  return url;
}

export async function POST(req: NextRequest) {
  const apiUrl = resolveApiUrl();

  // se manca la URL -> errore server (500)
  if (!apiUrl) {
    console.error("[signup-complete] missing_api_url");
    return NextResponse.json(
      { created: false, error: "missing_api_url" },
      { status: 500 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch (err) {
    console.error("[signup-complete] invalid_json", err);
    return NextResponse.json(
      { created: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  console.log("[signup-complete] BODY from frontend", body);

  try {
    const upstreamRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstreamRes.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.warn("[signup-complete] upstream non-JSON response", text);
    }

    // Lambda ok
    if (upstreamRes.ok && data && data.created === true) {
      console.log("[signup-complete] Account created OK");
      return NextResponse.json({ created: true }, { status: 200 });
    }

    console.error("[signup-complete] upstream_error", {
      status: upstreamRes.status,
      data,
    });

    return NextResponse.json(
      {
        created: false,
        error: data?.error || "upstream_error",
        lambdaResponse: data,
      },
      { status: 500 }
    );
  } catch (err) {
    console.error("[signup-complete] upstream_fetch_failed", err);
    return NextResponse.json(
      { created: false, error: "upstream_fetch_failed" },
      { status: 500 }
    );
  }
}
