// src/app/api/fireblocks/vault-account/route.ts
import { NextResponse } from 'next/server'
import { getFireblocksClient } from '@/lib/fireblocks'

function generateAccountName() {
  const segment = () =>
    Array.from({ length: 4 })
      .map(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        return chars[Math.floor(Math.random() * chars.length)]
      })
      .join('')

  return `FWT-${segment()}-${segment()}-${segment()}-${segment()}`
}

// ✅ UNICA export consentita: POST
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const customerRefId = body.customerRefId || 'demo-user-123'

    const fireblocks = getFireblocksClient()

    const accountName = generateAccountName()

    const resp = await fireblocks.vaults.createVaultAccount({
      createVaultAccountRequest: {
        name: accountName,
        hiddenOnUI: false,
        autoFuel: false,
        customerRefId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        vaultAccount: resp.data,
      },
      { status: 200 },
    )
  } catch (err: any) {
    console.error('Fireblocks createVaultAccount error:', err)
    return NextResponse.json(
      {
        success: false,
        error:
          err?.message || 'Errore nella creazione dell’account Fireblocks',
      },
      { status: 500 },
    )
  }
}
