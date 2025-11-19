// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

// Risoluzione robusta della URL (dev + prod + Amplify)
function resolveApiUrl() {
  const fromPublic = process.env.NEXT_PUBLIC_SIGNUP_COMPLETE_API_URL;
  const fromServer = process.env.SIGNUP_COMPLETE_API_URL;
  const fromProd = (process.env as any).SIGNUP_COMPLETE_API_URL_PROD;

  const url = (fromPublic || fromServer || fromProd || "").trim();

  if (!url) {
    console.error("[signup-complete] Nessuna API_URL trovata. Env:", {
      NEXT_PUBLIC_SIGNUP_COMPLETE_API_URL: fromPublic,
      SIGNUP_COMPLETE_API_URL: fromServer,
      SIGNUP_COMPLETE_API_URL_PROD: fromProd,
    });
  } else {
    console.log("[signup-complete] Using API_URL:", url);
  }

  return url;
}

const API_URL = resolveApiUrl();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Se manca la URL → errore server (500)
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

  // LOG utile: verifichiamo che arrivino ipAddress/ipCountry
  console.log("[signup-complete] BODY ricevuto dal frontend:", body);

  try {
    const upstreamRes = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), // MANDIAMO TUTTO IL BODY
      cache: "no-store",
    });

    const text = await upstreamRes.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.warn("[signup-complete] Upstream risposta NON JSON:", text);
    }

    // Se la Lambda risponde created:true → OK
    if (upstreamRes.ok && data?.created === true) {
      return NextResponse.json({ created: true }, { status: 200 });
    }

    // Se siamo qui → la Lambda ha risposto errore, oppure manca created:true
    return NextResponse.json(
      {
        created: false,
        error: data?.error || "upstream_error",
        lambdaResponse: data,
      },
      { status: 500 }
    );
  } catch (err) {
    console.error("[signup-complete] upstream_fetch_failed:", err);
    return NextResponse.json(
      { created: false, error: "upstream_fetch_failed" },
      { status: 500 }
    );
  }
}
