// app/api/kyc/start/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Fallback automatico come nel login
const KYC_START_API_URL =
  process.env.KYC_START_API_URL || process.env.NEXT_PUBLIC_KYC_START_API_URL;

export async function POST(req: NextRequest) {
  if (!KYC_START_API_URL) {
    console.error('KYC_START_API_URL / NEXT_PUBLIC_KYC_START_API_URL not defined');
    return NextResponse.json(
      { error: 'KYC backend not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(KYC_START_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('start-kyc-svc returned non-JSON:', text);
      return NextResponse.json(
        { error: 'Invalid response from KYC backend' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('/api/kyc/start error:', err);
    return NextResponse.json(
      { error: 'Internal error in KYC API' },
      { status: 500 }
    );
  }
}
