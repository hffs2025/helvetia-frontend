// src/app/api/fireblocks/vault-wallet/route.ts
import { NextResponse } from 'next/server'
import { getFireblocksClient } from '@/lib/fireblocks'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { vaultAccountId, assetId } = body as {
      vaultAccountId?: string | number
      assetId?: string
    }

    if (!vaultAccountId || !assetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'vaultAccountId e assetId sono obbligatori',
        },
        { status: 400 },
      )
    }

    const fireblocks = getFireblocksClient()

    const resp = await fireblocks.vaults.createVaultAccountAsset({
      vaultAccountId: String(vaultAccountId),
      assetId: String(assetId),
    })

    return NextResponse.json(
      {
        success: true,
        wallet: resp.data,
      },
      { status: 200 },
    )
  } catch (err: any) {
    console.error('Fireblocks createVaultAccountAsset error:', err)
    return NextResponse.json(
      {
        success: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          'Errore nella creazione del wallet Fireblocks',
      },
      { status: 500 },
    )
  }
}
