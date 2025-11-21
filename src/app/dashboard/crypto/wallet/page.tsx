'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getStoredUser } from '@/lib/authUser'

const ACCENT = '#4FD1C5'
const BACKGROUND = '#071C2C'

const CRYPTO_SUBMENU = [
  { label: 'Market', href: '/dashboard/crypto/market' },
  { label: 'Trading', href: '/dashboard/crypto/trading' },
  { label: 'Wallet', href: '/dashboard/crypto/wallet' },
  { label: 'Whitelist Wallet', href: '/dashboard/crypto/whitelist-wallet' },
  { label: 'Transaction', href: '/dashboard/crypto/transaction' },
]

const API_BASE =
  process.env.NEXT_PUBLIC_CRYPTO_API_BASE ??
  '' // es. https://.../crypto/fireblocks

type VaultAccount = {
  id: string
  name: string
}

type AssetConfig = {
  id: string
  label: string
  description?: string
}

const ASSETS: AssetConfig[] = [
  { id: 'BTC', label: 'Bitcoin (BTC)' },
  { id: 'ETH', label: 'Ethereum (ETH)' },
  { id: 'USDT', label: 'Tether (USDT)' },
  { id: 'XRP', label: 'XRP (XRP)' },
  { id: 'ADA', label: 'Cardano (ADA)' },
  { id: 'SOL', label: 'Solana (SOL)' },
  { id: 'DOGE', label: 'Dogecoin (DOGE)' },
  { id: 'LTC', label: 'Litecoin (LTC)' },
  { id: 'DOT', label: 'Polkadot (DOT)' },
  { id: 'LINK', label: 'Chainlink (LINK)' },
]

export default function CryptoWalletPage() {
  const router = useRouter()
  const pathname = usePathname()

  // === AUTH GUARD ===
  useEffect(() => {
    const u = getStoredUser()
    if (!u) router.replace('/login')
  }, [router])

  // === STATE ACCOUNT FIREBLOCKS ===
  const [vaultAccount, setVaultAccount] = useState<VaultAccount | null>(null)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)

  // === STATE WALLET / ASSET ===
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [walletsCreated, setWalletsCreated] = useState<string[]>([])
  const [walletError, setWalletError] = useState<string | null>(null)
  const [walletLoadingAsset, setWalletLoadingAsset] = useState<string | null>(
    null,
  )

  // === CREA VAULT ACCOUNT FIREBLOCKS tramite Lambda ===
  const handleCreateAccount = async () => {
    if (!API_BASE) {
      setAccountError('API base URL not configured')
      return
    }

    setCreatingAccount(true)
    setAccountError(null)

    try {
      const res = await fetch(`${API_BASE}/vault-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // TODO: customerRefId dal tuo sistema auth (userId, ecc.)
          customerRefId: undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'API error')
      }

      const va = json.vaultAccount as VaultAccount
      setVaultAccount({ id: va.id, name: va.name })
    } catch (err: any) {
      setAccountError(
        err?.message || "Impossibile creare l'account Fireblocks",
      )
    } finally {
      setCreatingAccount(false)
    }
  }

  const toggleAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((a) => a !== assetId)
        : [...prev, assetId],
    )
  }

  // === CREA WALLET via Lambda ===
  const handleCreateWallet = async (assetId: string) => {
    if (!vaultAccount) return
    if (!API_BASE) {
      setWalletError('API base URL not configured')
      return
    }

    setWalletLoadingAsset(assetId)
    setWalletError(null)

    try {
      const res = await fetch(`${API_BASE}/vault-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultAccountId: vaultAccount.id,
          assetId,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'API error')
      }

      setWalletsCreated((prev) =>
        prev.includes(assetId) ? prev : [...prev, assetId],
      )
    } catch (err: any) {
      setWalletError(
        err?.message ||
          'Impossibile creare il wallet. Controlla assetId / permessi.',
      )
    } finally {
      setWalletLoadingAsset(null)
    }
  }

  return (
    <>
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-50">Crypto</h1>
        <p className="text-sm text-slate-300">
          Manage your Fireblocks account and choose which crypto wallets to
          enable.
        </p>
      </div>

      {/* Submenu identico a Market */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {CRYPTO_SUBMENU.map((item) => {
          const active = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="text-sm px-3 py-1.5 rounded-xl transition"
              style={
                active
                  ? { backgroundColor: ACCENT, color: BACKGROUND }
                  : { color: 'rgba(226,232,240,0.9)' }
              }
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* MAIN CARD */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold mb-1 text-slate-100">
              Wallet &amp; Fireblocks account
            </h2>
            <p className="text-xs text-slate-300">
              Create a dedicated Fireblocks vault account for the user and
              activate crypto wallets on it.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {vaultAccount ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  Account created (ID: <strong>{vaultAccount.id}</strong>)
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/50 text-yellow-200">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                <span>No Fireblocks account yet</span>
              </span>
            )}
          </div>
        </div>

        {/* Body: Account + Wallets */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* LEFT: ACCOUNT INFO / CREATE */}
          <div className="w-full lg:w-1/3 rounded-xl border border-white/10 bg-slate-900/60 p-4 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-100">
              Fireblocks vault account
            </h3>
            <p className="text-[11px] text-slate-400">
              The account name is generated automatically by the system using
              the format <code>FWT-XXXX-XXXX-XXXX-XXXX</code>.
            </p>

            {!vaultAccount && (
              <>
                <div className="mt-1 text-[11px] text-slate-400">
                  Once created, the name cannot be changed.
                </div>

                <button
                  onClick={handleCreateAccount}
                  disabled={creatingAccount}
                  className="mt-3 inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-medium bg-teal-400 text-slate-900 hover:bg-teal-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {creatingAccount ? 'Creating account...' : 'Create account'}
                </button>

                {accountError && (
                  <p className="text-[11px] text-red-400 mt-2">
                    {accountError}
                  </p>
                )}
              </>
            )}

            {vaultAccount && (
              <div className="mt-2 flex flex-col gap-1 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400">Account name: </span>
                  <span className="text-slate-100 font-mono">
                    {vaultAccount.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Vault ID: </span>
                  <span className="text-slate-100 font-mono text-[10px]">
                    {vaultAccount.id}
                  </span>
                </div>
                <p className="text-slate-400 mt-1">
                  Use this vault ID for deposits, trading flows and any
                  Fireblocks-related operations for this user.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: WALLET SELECTION */}
          <div className="w-full lg:flex-1 rounded-xl border border-white/10 bg-slate-900/60 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-100">
                  Crypto wallets
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select which assets to activate as wallets on the user vault
                  account.
                </p>
              </div>
              <div className="text-[11px] text-slate-400">
                {vaultAccount ? (
                  <span>Vault ID: {vaultAccount.id}</span>
                ) : (
                  <span>Create the Fireblocks account first</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {ASSETS.map((asset) => {
                const selected = selectedAssets.includes(asset.id)
                const created = walletsCreated.includes(asset.id)
                const loading = walletLoadingAsset === asset.id

                return (
                  <div
                    key={asset.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-xs ${
                      created
                        ? 'border-emerald-500/60 bg-emerald-500/5'
                        : selected
                        ? 'border-teal-400/60 bg-teal-500/5'
                        : 'border-white/10 bg-slate-950/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAsset(asset.id)}
                      disabled={!vaultAccount}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-slate-100 flex items-center gap-2">
                        <span>{asset.label}</span>
                        {created && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-900">
                            Active
                          </span>
                        )}
                      </div>
                      {asset.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {asset.description}
                        </p>
                      )}
                    </button>

                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        disabled={!vaultAccount || loading || created}
                        onClick={() => handleCreateWallet(asset.id)}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-[11px] font-medium bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {created
                          ? 'Created'
                          : loading
                          ? 'Creating...'
                          : 'Create wallet'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {walletError && (
              <p className="text-[11px] text-red-400 mt-2">{walletError}</p>
            )}

            <p className="text-[11px] text-slate-400 mt-3">
              * Asset IDs must match the assets configured in your Fireblocks
              workspace (mainnet or testnet).
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
