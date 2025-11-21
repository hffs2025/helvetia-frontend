'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getStoredUser } from '@/lib/authUser'

const ACCENT = '#4FD1C5'
const BACKGROUND = '#071C2C'

const CRYPTO_SUBMENU = [
  { label: 'Market', href: '/dashboard/crypto/market' },
  { label: 'Trading', href: '/dashboard/crypto/trading' },
  { label: 'Accounts', href: '/dashboard/crypto/accounts' },
  { label: 'Whitelist Wallet', href: '/dashboard/crypto/whitelist-wallet' },
  { label: 'Transactions', href: '/dashboard/crypto/transactions' },
]

export default function CryptoPage() {
  const router = useRouter()
  const pathname = usePathname()

  // Controllo leggero (il layout fa già la guard principale)
  useEffect(() => {
    const u = getStoredUser()
    if (!u) router.replace('/login')
  }, [router])

  return (
    <>
      {/* TITOLI CRYPTO */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-50">Crypto</h1>
        <p className="text-sm text-slate-300">
          Manage your crypto services and tools.
        </p>
      </div>

      {/* SUBMENU CRYPTO */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {CRYPTO_SUBMENU.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="text-sm px-3 py-1.5 rounded-xl transition"
              style={
                isActive
                  ? { backgroundColor: ACCENT, color: BACKGROUND }
                  : { color: 'rgba(226,232,240,0.9)' }
              }
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Qui sotto potrai aggiungere il contenuto specifico delle sottosezioni */}
    </>
  )
}
