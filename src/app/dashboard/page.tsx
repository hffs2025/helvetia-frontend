'use client'
export const dynamic = 'force-static'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// === HFSS Dark Palette ===
const BACKGROUND = '#071C2C'
const ACCENT = '#4FD1C5'
const BORDER_LIGHT = 'rgba(255,255,255,0.12)'

type MenuKey =
  | 'home'
  | 'kycKyb'
  | 'account'
  | 'payment'
  | 'crypto'
  | 'card'
  | 'security'
  | 'tool'

type AuthUser = {
  idUser: string
  name: string
  surname: string
  email: string
  country: string
  country2: string
  mobileE164: string
  sessionToken?: string
}

const MENU: { key: MenuKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'kycKyb', label: 'KYC • KYB' },
  { key: 'account', label: 'Account' },
  { key: 'payment', label: 'Payments' },
  { key: 'crypto', label: 'Crypto' },
  { key: 'card', label: 'Card' },
  { key: 'security', label: 'Security status' },
  { key: 'tool', label: 'Tools' },
]

const TITLES: Record<MenuKey, string> = {
  home: 'Home',
  kycKyb: 'KYC / KYB',
  account: 'Account',
  payment: 'Payments',
  crypto: 'Crypto',
  card: 'Card',
  security: 'Security status',
  tool: 'Tools',
}

const STORAGE_KEY = 'authUser'

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const fromLocal = window.localStorage.getItem(STORAGE_KEY)
    if (fromLocal) return JSON.parse(fromLocal) as AuthUser
    const fromSession = window.sessionStorage.getItem(STORAGE_KEY)
    if (fromSession) return JSON.parse(fromSession) as AuthUser
    return null
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [active, setActive] = useState<MenuKey>('home')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const [kycLoading, setKycLoading] = useState(false)
  const [kybLoading, setKybLoading] = useState(false)

  // stato locale per KYC/KYB verificati (inizialmente NO)
  const [kycVerified, setKycVerified] = useState(false)
  const [kybVerified, setKybVerified] = useState(false)

  // stato per finestra Sumsub
  const [sumsubVisible, setSumsubVisible] = useState(false)
  const [currentCheck, setCurrentCheck] = useState<'kyc' | 'kyb' | null>(null)
  const [sumsubInstance, setSumsubInstance] = useState<any | null>(null)

  // ===== LOGIN GUARD =====
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
      window.localStorage.removeItem(STORAGE_KEY)
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
    router.replace('/login')
  }

  // ===== MENU: abilita solo alcune voci finché KYC non è verificato =====
  function isMenuDisabled(key: MenuKey): boolean {
    // sempre abilitati
    if (key === 'home' || key === 'kycKyb' || key === 'security') return false
    // le altre sezioni richiedono almeno KYC verificato
    return !kycVerified
  }

  // ===== Sumsub helpers =====

  async function fetchSumsubToken(purpose: 'kyc' | 'kyb') {
    const res = await fetch('/api/sumsub-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose }),
    })
    const data = await res.json()
    if (!res.ok || !data?.token) {
      console.error('Sumsub token API error:', data)
      throw new Error(data?.message || data?.error || 'Failed to get Sumsub token')
    }
    return data.token as string
  }

  async function startSumsubFlow(purpose: 'kyc' | 'kyb') {
    // mostra il container Sumsub
    setCurrentCheck(purpose)
    setSumsubVisible(true)

    // 1) Ottieni il token dal backend
    const accessToken = await fetchSumsubToken(purpose)

    // 2) Import dinamico del WebSDK (default export = snsWebSdk)
    const mod = await import('@sumsub/websdk')
    const snsWebSdk = (mod as any).default || mod

    // 3) Configura e costruisci l'istanza
    const instance = snsWebSdk
      .init(
        accessToken,
        // token update callback (ritorna una Promise con un nuovo token)
        async () => {
          const newToken = await fetchSumsubToken(purpose)
          return newToken
        }
      )
      .withConf({
        lang: 'en', // lingua dell'interfaccia
      })
      .withOptions({
        addViewportTag: false,
        adaptIframeHeight: true,
      })
      .onMessage((type: any, payload: any) => {
        console.log('WebSDK onMessage:', type, payload)

        // se la review è completata chiudiamo la finestra
        if (
          type === 'idCheck.onApplicantStatusChanged' &&
          payload?.reviewStatus === 'completed'
        ) {
          const answer = payload?.reviewResult?.reviewAnswer

          if (purpose === 'kyc' && answer === 'GREEN') {
            setKycVerified(true)
          }
          if (purpose === 'kyb' && answer === 'GREEN') {
            setKybVerified(true)
          }

          handleCloseSumsub()
        }
      })
      .build()

    // 4) Lancia il WebSDK nel container
    instance.launch('#sumsub-kyc-container')
    setSumsubInstance(instance)
  }

  function handleCloseSumsub() {
    try {
      if (sumsubInstance?.destroy) {
        sumsubInstance.destroy()
      }
    } catch (e) {
      console.warn('Error destroying Sumsub SDK instance', e)
    }
    setSumsubInstance(null)
    setCurrentCheck(null)
    setSumsubVisible(false)
  }

  async function handleStartKyc() {
    if (!user?.idUser) {
      alert('Missing user id in session')
      return
    }

    try {
      setKycLoading(true)
      console.log('=== STARTING KYC ===')

      console.log('Calling /api/kyc/start ...')
      const res = await fetch('/api/kyc/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUser: user.idUser }),
      })

      const raw = await res.text()
      console.log('KYC START raw response:', raw)
      console.log('KYC START status:', res.status)

      let data: any = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch (e) {
        console.error('KYC START JSON parse error:', e)
      }

      if (!res.ok) {
        console.error('start-kyc error (status != 200):', data || raw)
        alert(
          'Unable to start KYC: ' +
            (data?.message || data?.error || raw || `HTTP ${res.status}`)
        )
        return
      }

      console.log('KYC START parsed data:', data)

      if (!data?.idInd) {
        console.warn('KYC START: no idInd returned')
      } else {
        console.log('IdInd created:', data.idInd, 'reused:', data.reused)
      }

      await startSumsubFlow('kyc')
    } catch (e: any) {
      console.error('KYC ERROR:', e)
      alert('Unexpected error while starting KYC: ' + e.message)
    } finally {
      setKycLoading(false)
    }
  }

  async function handleStartKyb() {
    if (!user?.idUser) {
      alert('Missing user id in session')
      return
    }
    try {
      setKybLoading(true)
      await startSumsubFlow('kyb')
    } catch (e: any) {
      console.error('KYB ERROR:', e)
      alert('Unexpected error while starting KYB: ' + e.message)
    } finally {
      setKybLoading(false)
    }
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
      {/* HEADER FULL WIDTH */}
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

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 justify-center">
        <div className="flex flex-1 max-w-6xl px-4 py-6 gap-6">
          {/* VERTICAL MENU */}
          <aside
            className="w-56 shrink-0 flex flex-col pr-4 border-r"
            style={{ borderColor: BORDER_LIGHT }}
          >
            <nav className="space-y-1">
              {MENU.map((item) => {
                const disabled = isMenuDisabled(item.key)
                const isActive = active === item.key

                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      if (!disabled) setActive(item.key)
                    }}
                    disabled={disabled}
                    className="w-full text-left disabled:cursor-not-allowed"
                  >
                    <div
                      className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                        isActive ? 'font-medium' : 'font-normal'
                      } ${
                        disabled
                          ? 'opacity-50'
                          : 'opacity-100'
                      }`}
                      style={
                        isActive && !disabled
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

          {/* CONTENT AREA */}
          <main className="flex-1 space-y-6">
            {/* Page heading */}
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold text-slate-50">
                {TITLES[active]}
              </h1>
              <p className="text-sm text-slate-300">
                Manage all your HFSS services in one place.
              </p>
            </div>

            {/* HOME */}
            {active === 'home' && (
              <>
{/* Overview container */}
<section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg space-y-4 backdrop-blur">
  <h2 className="text-sm font-semibold">Overview</h2>
  <p className="text-sm text-slate-300">
    Welcome to your HFSS dashboard. Here is a quick summary of your
    profile.
  </p>

  {/* 4 box con i dati utente */}
  <div className="grid sm:grid-cols-2 gap-4 pt-2">
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-300">
        User ID
      </p>
      <p className="mt-1 text-xs font-mono text-slate-50">
        {user.idUser}
      </p>
    </div>

    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-300">
        Email
      </p>
      <p className="mt-1 text-sm text-slate-50">
        {user.email}
      </p>
    </div>

    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-300">
        Country
      </p>
      <p className="mt-1 text-sm text-slate-50">
        {user.country} ({user.country2})
      </p>
    </div>

    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-300">
        Mobile
      </p>
      <p className="mt-1 text-sm text-slate-50">
        {user.mobileE164}
      </p>
    </div>
  </div>

  {/* testo esplicativo su 4 righe */}
  <p className="text-xs text-slate-300 pt-3">
    To use HFSS services, you must complete the required compliance checks.<br />
    <br></br>
    For a personal account, you need to pass <span className="font-semibold">KYC</span>.<br />
    <br></br>
    For a business account, you must pass both <span className="font-semibold">KYC</span> and <span className="font-semibold">KYB</span>.<br />
    <br></br>
    Until you have at least successfully completed your <span className="font-semibold">KYC</span> verification, you will not have access to all sections of this dashboard.
  </p>
</section>

              </>
            )}

            {/* KYC • KYB PAGE with Sumsub */}
            {active === 'kycKyb' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg space-y-5 backdrop-blur">
                <h2 className="text-sm font-semibold text-slate-50">
                  KYC / KYB verification
                </h2>
                <p className="text-sm text-slate-300">
                  Complete your identity (KYC) and business (KYB) verification to
                  unlock all HFSS features.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* KYC card */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-slate-50">
                      KYC (Know Your Customer)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Verify your personal identity to comply with regulatory
                      requirements.
                    </p>
                    <button
                      style={{ backgroundColor: ACCENT, color: BACKGROUND }}
                      className="mt-1 h-9 rounded-xl text-xs font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleStartKyc}
                      disabled={kycLoading}
                    >
                      {kycLoading ? 'Starting KYC…' : 'Start KYC'}
                    </button>
                  </div>

                  {/* KYB card */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-slate-50">
                      KYB (Know Your Business)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Verify your company details and documents for business
                      onboarding.
                    </p>
                    <button
                      style={{ backgroundColor: ACCENT, color: BACKGROUND }}
                      className="mt-1 h-9 rounded-xl text-xs font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleStartKyb}
                      disabled={kybLoading || !kycVerified}

                    >
                      {kybLoading ? 'Starting KYB…' : 'Start KYB'}
                    </button>
                  </div>
                </div>

                {/* Container where Sumsub WebSDK will render its UI */}
                {sumsubVisible && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-300">
                        {currentCheck === 'kyc'
                          ? 'KYC verification in progress.'
                          : currentCheck === 'kyb'
                          ? 'KYB verification in progress.'
                          : 'Verification in progress.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleCloseSumsub}
                        className="text-[11px] px-2 py-1 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <div id="sumsub-kyc-container" className="mt-2" />
                  </div>
                )}
              </section>
            )}

            {/* ACCOUNT */}
            {active === 'account' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg space-y-4 backdrop-blur">
                {/* Titolo "Account information" rimosso */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-300">
                      Full name
                    </p>
                    <p className="mt-1 text-sm text-slate-50">
                      {user.name} {user.surname}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-300">
                      Email
                    </p>
                    <p className="mt-1 text-sm text-slate-50">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-300">
                      Mobile
                    </p>
                    <p className="mt-1 text-sm text-slate-50">
                      {user.mobileE164}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-300">
                      Country
                    </p>
                    <p className="mt-1 text-sm text-slate-50">
                      {user.country} ({user.country2})
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-wide text-slate-300">
                      User ID
                    </p>
                    <p className="mt-1 text-xs font-mono text-slate-50 bg-white/5 border border-white/10 rounded-lg px-2 py-1 inline-block">
                      {user.idUser}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* PAYMENTS */}
            {active === 'payment' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
                <h2 className="text-sm font-semibold">Payments</h2>
                <p className="text-sm text-slate-300">
                  Payments section coming soon.
                </p>
              </section>
            )}

            {/* CRYPTO */}
            {active === 'crypto' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
                <h2 className="text-sm font-semibold">Crypto</h2>
                <p className="text-sm text-slate-300">
                  Crypto features coming soon.
                </p>
              </section>
            )}

            {/* CARD */}
            {active === 'card' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
                <h2 className="text-sm font-semibold">Card</h2>
                <p className="text-sm text-slate-300">
                  Card services coming soon.
                </p>
              </section>
            )}

            {/* SECURITY */}
            {active === 'security' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg space-y-4 backdrop-blur">
                <h2 className="text-sm font-semibold">Security status</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">Email verified</span>
                    <span className="inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium border border-emerald-400/60 text-emerald-100 bg-emerald-500/10">
                      YES
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">Mobile verified</span>
                    <span className="inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium border border-emerald-400/60 text-emerald-100 bg-emerald-500/10">
                      YES
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">KYC verified</span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium border ${
                        kycVerified
                          ? 'border-emerald-400/60 text-emerald-100 bg-emerald-500/10'
                          : 'border-red-400/60 text-red-100 bg-red-500/10'
                      }`}
                    >
                      {kycVerified ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">KYB verified</span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium border ${
                        kybVerified
                          ? 'border-emerald-400/60 text-emerald-100 bg-emerald-500/10'
                          : 'border-red-400/60 text-red-100 bg-red-500/10'
                      }`}
                    >
                      {kybVerified ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 pt-1">
                    Future updates will include login history, password updates,
                    2FA, alerts, and more.
                  </p>
                </div>
              </section>
            )}

            {/* TOOLS */}
            {active === 'tool' && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
                <h2 className="text-sm font-semibold">Tools</h2>
                <p className="text-sm text-slate-300">
                  Tools section coming soon.
                </p>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
