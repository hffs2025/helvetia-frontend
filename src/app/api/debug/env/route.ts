import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    LOGIN_API_URL: process.env.LOGIN_API_URL || '(missing)',
    NEXT_PUBLIC_LOGIN_API_URL:
      process.env.NEXT_PUBLIC_LOGIN_API_URL || '(missing)',
  });
}
