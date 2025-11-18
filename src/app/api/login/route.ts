import { NextRequest, NextResponse } from 'next/server';

// usa LOGIN_API_URL se c'è, altrimenti NEXT_PUBLIC_LOGIN_API_URL
const LOGIN_API_URL =
  process.env.LOGIN_API_URL || process.env.NEXT_PUBLIC_LOGIN_API_URL;

export async function POST(req: NextRequest) {
  if (!LOGIN_API_URL) {
    console.error('LOGIN_API_URL / NEXT_PUBLIC_LOGIN_API_URL not defined in env');
    return NextResponse.json(
      { authenticated: false, error: 'Login backend not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Login Lambda returned non-JSON:', text);
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Invalid response from login backend',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error in /api/login route:', err);
    return NextResponse.json(
      { authenticated: false, error: 'Internal login API error' },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { authenticated: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
