// app/api/signup/check-mobile/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.CHECK_MOBILE_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_MOBILE_API_URL ||
  'https://jx7icndp25.execute-api.eu-central-1.amazonaws.com/signup/check-mobile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isE164(v: unknown): v is string {
  return typeof v === 'string' && /^\+[1-9]\d{6,14}$/.test(v);
}

// Parsing JSON sicuro (gestisce body vuoto / non-JSON)
async function parseJsonSafe(res: Response) {
  const ct = res.headers.get('content-type') || '';
  const raw = await res.text();
  if (ct.includes('application/json') && raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore, cadrà nel fallback */
    }
  }
  return { raw };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    // Supporta entrambe le chiavi: { mobile } o { mobileE164 }
    const candidate: unknown = body.mobileE164 ?? body.mobile ?? '';
    const mobileE164 = typeof candidate === 'string' ? candidate.trim() : '';

    if (!isE164(mobileE164)) {
      return NextResponse.json(
        { error: 'Invalid mobile format (E.164 required)' },
        { status: 400 }
      );
    }

    // Timeout difensivo per l’upstream
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 8000);

    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mobileE164 }),
      signal: ac.signal,
      cache: 'no-store',
    }).catch((e) => {
      // Se abort/connessione fallita, mappiamo a 503 coerente
      throw new Error(`upstream_fetch_error: ${e?.message || 'unknown'}`);
    });
    clearTimeout(t);

    const data = await parseJsonSafe(upstream);

    // Se l’upstream non è ok, propaghiamo lo status e un messaggio sensato
    if (!upstream.ok) {
      const message =
        (data && (data.error || data.message)) ||
        (data?.raw as string) ||
        'Service unavailable';
      return NextResponse.json({ error: message }, { status: upstream.status });
    }

    // Normalizziamo l’output: { available: boolean }
    const available =
      typeof data?.available === 'boolean'
        ? data.available
        : // fallback: se l’upstream non manda il campo, assumiamo false
          false;

    return NextResponse.json({ available }, { status: 200 });
  } catch (err: any) {
    console.error('check-mobile route error:', err);
    // Distinzione minima su abort
    const isAbort = String(err?.message || '').includes('AbortError');
    return NextResponse.json(
      { error: isAbort ? 'Upstream timeout' : 'Service unavailable' },
      { status: 503 }
    );
  }
}
