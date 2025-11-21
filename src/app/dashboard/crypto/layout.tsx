'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { AuthUser, getStoredUser, STORAGE_KEY } from '@/lib/authUser'

const BACKGROUND = '#071C2C'
const ACCENT = '#4FD1C5'
const BORDER_LIGHT = 'rgba(255,255,255,0.12)'

type MenuItem = {
  key: string
  label: string
  href: string
}

const MENU: MenuItem[] = [
  { key: 'home', label: 'Home', href: '/dashboard' },
  { key: 'kycKyb', label: 'KYC • KYB', href: '/dashboard/kyc-kyb' },
  { key: 'account', label: 'Account', href: '/dashboard/account' },
  { key: 'payment', label: 'Payments', href: '/dashboard/payments' },
  { key: 'crypto', label: 'Crypto', href: '/dashboard/crypto' },
  { key: 'card', label: 'Card', href: '/dashboard/card' },
  { key: 'security', label: 'Security status', href: '/dashboard/security' },
  { key: 'tools', label: 'Tools', href: '/dashboard/tools' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // LOGIN GUARD comune a tutta l'area /dashboard
  useEffect(() => {
    const u = getStoredUser()
    if (!u) {
      router.replace('/login')
      return
    }
    setUser(u)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(STORAGE_KEY)
    }
    router.replace('/login')
  }

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: BACKGROUND }}
      >
        <p className="text-sm text-slate-200">Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: BACKGROUND, color: 'white' }}
    >
      {/* HEADER UNICO */}
      <header className="w-full border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/Logo.png"
              alt="HFSS Logo"
              width={150}
              height={150}
              priority
              className="object-contain"
            />

            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.15em] text-slate-300">
                Dashboard
              </span>
              <span className="text-sm font-medium text-slate-50">
                Welcome, {user.name} {user.surname}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-xl border border-white/30 bg-white/10 text-slate-50 hover:bg-white/20 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* LAYOUT CON MENU + CONTENUTO */}
      <div className="flex flex-1 justify-center">
        <div className="flex flex-1 max-w-6xl px-4 py-6 gap-6">
          {/* MENU VERTICALE UNICO */}
          <aside
            className="w-56 shrink-0 flex flex-col pr-4 border-r"
            style={{ borderColor: BORDER_LIGHT }}
          >
            <nav className="space-y-1">
              {MENU.map((item) => {
                // Home attiva solo su /dashboard
                let isActive = false
                if (item.href === '/dashboard') {
                  isActive = pathname === '/dashboard'
                } else {
                  isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + '/')
                }

                return (
                  <button
                    key={item.key}
                    onClick={() => router.push(item.href)}
                    className="w-full text-left"
                  >
                    <div
                      className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                        isActive ? 'font-medium' : 'font-normal'
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: ACCENT, color: BACKGROUND }
                          : {
                              backgroundColor: 'transparent',
                              color: 'rgba(226,232,240,0.9)',
                            }
                      }
                    >
                      {item.label}
                    </div>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* CONTENUTO DELLA PAGINA (Home, Crypto, ecc.) */}
          <main className="flex-1 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
