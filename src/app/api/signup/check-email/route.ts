// app/api/signup/check-email/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
  process.env.CHECK_EMAIL_API_URL ||
  process.env.NEXT_PUBLIC_CHECK_EMAIL_API_URL ||
  'https://<api-id>.execute-api.<region>.amazonaws.com/signup/check-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isEmail(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) &&
    v.length <= 254
  );
}

// Parsing JSON sicuro (gestisce body vuoto / non-JSON)
async function parseJsonSafe(res: Response) {
  const ct = res.headers.get('content-type') || '';
  const raw = await res.text();
  if (ct.includes('application/json') && raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fallback sotto */
    }
  }
  return { raw };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const email: unknown = body?.email ?? '';

    if (!isEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Timeout difensivo per l’upstream
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 8000);

    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: ac.signal,
      cache: 'no-store',
    }).catch((e) => {
      throw new Error(`upstream_fetch_error: ${e?.message || 'unknown'}`);
    });
    clearTimeout(t);

    const data = await parseJsonSafe(upstream);

    if (!upstream.ok) {
      const message =
        (data && (data.error || data.message)) ||
        (data?.raw as string) ||
        'Service unavailable';
      return NextResponse.json({ error: message }, { status: upstream.status });
    }

    // Normalizza output
    const available =
      typeof data?.available === 'boolean' ? data.available : false;

    return NextResponse.json({ available }, { status: 200 });
  } catch (err: any) {
    console.error('check-email route error:', err);
    const isAbort = String(err?.message || '').includes('AbortError');
    return NextResponse.json(
      { error: isAbort ? 'Upstream timeout' : 'Service unavailable' },
      { status: 503 }
    );
  }
}
