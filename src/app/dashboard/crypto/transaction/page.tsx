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

export default function CryptoTransactionsPage() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const u = getStoredUser()
    if (!u) router.replace('/login')
  }, [router])

  return (
    <>
      {/* Titolo sezione Crypto */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-50">Crypto</h1>
        <p className="text-sm text-slate-300">
          Manage your crypto services and tools.
        </p>
      </div>

      {/* Barra orizzontale */}
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

      {/* Container TRANSACTIONS */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
        <h2 className="text-sm font-semibold mb-2">Transactions</h2>
        <p className="text-sm text-slate-300">
          Here you will see the full history of crypto deposits, withdrawals and
          trades linked to your accounts. (placeholder)
        </p>
      </section>
    </>
  )
}
