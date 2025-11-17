import { NextResponse } from 'next/server';

export function GET() {
  const env = process.env || {};
  // prendiamo solo le prime 50 chiavi per non esplodere
  const keys = Object.keys(env).sort();

  return NextResponse.json({
    keys,
    LOGIN_API_URL: env.LOGIN_API_URL || '(missing)',
    NEXT_PUBLIC_LOGIN_API_URL: env.NEXT_PUBLIC_LOGIN_API_URL || '(missing)',
  });
}

