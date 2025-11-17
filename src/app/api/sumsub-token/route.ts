import { NextRequest, NextResponse } from 'next/server';

const SUMSUB_TOKEN_API_URL = process.env.SUMSUB_TOKEN_API_URL;

export async function POST(req: NextRequest) {
  if (!SUMSUB_TOKEN_API_URL) {
    console.error('SUMSUB_TOKEN_API_URL is not defined');
    return NextResponse.json(
      { error: 'Sumsub token backend not configured' },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(SUMSUB_TOKEN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('sumsub-token-svc returned non-JSON:', text);
      return NextResponse.json(
        { error: 'Invalid response from Sumsub token backend' },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('/api/sumsub-token error:', err);
    return NextResponse.json(
      { error: 'Internal error in Sumsub token API' },
      { status: 500 },
    );
  }
}
