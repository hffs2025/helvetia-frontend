'use client'

import { usePathname, useRouter } from 'next/navigation'

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

export default function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <aside
      className="w-56 shrink-0 flex flex-col pr-4 border-r"
      style={{ borderColor: BORDER_LIGHT }}
    >
      <nav className="space-y-1">
        {MENU.map((item) => {
          // Home attivo SOLO su /dashboard
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
                    ? { backgroundColor: ACCENT, color: '#071C2C' }
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
  )
}
