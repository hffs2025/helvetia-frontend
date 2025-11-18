import { NextRequest, NextResponse } from 'next/server'

// In Amplify le env disponibili sono quelle NEXT_PUBLIC_*
// Usiamo prima quella, poi facciamo fallback a SUMSUB_TOKEN_API_URL (utile in dev)
const BACKEND_URL =
  process.env.NEXT_PUBLIC_SUMSUB_TOKEN_API_URL ??
  process.env.SUMSUB_TOKEN_API_URL ??
  ''

export async function POST(req: NextRequest) {
  if (!BACKEND_URL) {
    console.error('SUMSUB_TOKEN_API_URL / NEXT_PUBLIC_SUMSUB_TOKEN_API_URL is not defined')
    return NextResponse.json(
      { error: 'Sumsub token backend not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()

    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    let data: any

    try {
      data = text ? JSON.parse(text) : {}
    } catch (err) {
      console.error('sumsub-token-svc returned non-JSON:', text)
      return NextResponse.json(
        { error: 'Invalid response from Sumsub token backend' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error('/api/sumsub-token error:', err?.message || err)
    return NextResponse.json(
      {
        error: 'Internal error in Sumsub token API',
        message: err?.message || String(err),
      },
      { status: 500 }
    )
  }
}
