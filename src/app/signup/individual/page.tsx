'use client'
export const dynamic = 'force-static'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

// === Palette (flat dark blue) ===
const BACKGROUND = '#071C2C'
const ACCENT = '#4FD1C5'
const ANTHRACITE = '#2B2B2B'
const WHITE = '#FFFFFF'
const PLACEHOLDER = '#A1A1AA'
const DISABLED_BG = '#9CA3AF'

type Country = { code: string; name: string; dial: string }

// --- EU + Switzerland ---
const EU: Omit<Country, 'dial'>[] = [
  { code: 'AT', name: 'Austria' }, { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' }, { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czechia' },
  { code: 'DK', name: 'Denmark' }, { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' }, { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' }, { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' }, { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' }, { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' }, { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' }, { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' }, { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
]
const DIAL: Record<string, string> = {
  CH: '41', AT: '43', BE: '32', BG: '359', HR: '385', CY: '357', CZ: '420',
  DK: '45', EE: '372', FI: '358', FR: '33', DE: '49', GR: '30', HU: '36',
  IE: '353', IT: '39', LV: '371', LT: '370', LU: '352', MT: '356',
  NL: '31', PL: '48', PT: '351', RO: '40', SK: '421', SI: '386',
  ES: '34', SE: '46',
}
const SWITZERLAND: Country = { code: 'CH', name: 'Switzerland', dial: DIAL['CH'] }
const attachDial = (list: Omit<Country, 'dial'>[]): Country[] =>
  list.map(c => ({ ...c, dial: DIAL[c.code] || '' }))
const flagEmoji = (code: string) =>
  code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))

export default function Page() {
  const router = useRouter()

  // form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('')
  const [dialCountry, setDialCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accept, setAccept] = useState(false)

  // ui state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // flags da mostrare SOLO dopo submit
  const [emailTaken, setEmailTaken] = useState(false)
  const [mobileTaken, setMobileTaken] = useState(false)

  const countries = useMemo(() => {
    const sorted = [...EU].sort((a, b) => a.name.localeCompare(b.name, 'en'))
    return [SWITZERLAND, ...attachDial(sorted)]
  }, [])

  // validazioni base per l’abilitazione del bottone
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const phoneOk = phone.trim().length >= 5 && !!dialCountry

  const normalizedEmail = (raw: string) => (raw || '').trim().toLowerCase()
  const toE164 = (dialCode: string, raw: string) => {
    const digits = (raw || '').replace(/\D/g, '')
    return `+${dialCode}${digits}`
  }

  const validateBasic = (): string | null => {
    if (!firstName || !lastName) return 'Please enter your name.'
    if (!country) return 'Please select your country.'
    if (!phoneOk) return 'Please enter your mobile number and prefix.'
    if (!emailOk) return 'Please enter a valid email.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirm) return 'Passwords do not match.'
    if (!accept) return 'You must accept the Terms and Privacy Policy.'
    return null
  }

  const isComplete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    !!country &&
    phoneOk &&
    emailOk &&
    password.length >= 8 &&
    password === confirm &&
    accept

  const canSubmit = isComplete && !loading

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEmailTaken(false)
    setMobileTaken(false)

    const msg = validateBasic()
    if (msg) return setError(msg)

    try {
      setLoading(true)

      const e164 = toE164(DIAL[dialCountry], phone)

      // 1) check email availability
      const emailRes = await fetch('/api/signup/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail(email) }),
      })
      const emailData = await emailRes.json()

      // 2) check mobile availability
      const mobileRes = await fetch('/api/signup/check-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: e164 }),
      })
      const mobileData = await mobileRes.json()

      if (!emailRes.ok) throw new Error(emailData?.error || 'Email verification failed')
      if (!mobileRes.ok) throw new Error(mobileData?.error || 'Mobile verification failed')

      const emailAvailable = !!emailData?.available
      const mobileAvailable = !!mobileData?.available

      setEmailTaken(!emailAvailable)
      setMobileTaken(!mobileAvailable)

      if (!emailAvailable || !mobileAvailable) {
        const problems = [
          !emailAvailable ? 'This email is already registered with us.' : null,
          !mobileAvailable ? 'This mobile number is already registered with us.' : null,
        ].filter(Boolean)
        setError(problems.join(' '))
        return
      }

      // ✅ NIENTE INSERIMENTO IN UsrTemp
      // Success → redirect con il mobile E.164
      router.push(`/app/signup/check-mobile?mobile=${encodeURIComponent(e164)}`)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ backgroundColor: BACKGROUND }}>
      {/* Logo */}
      <div className="flex flex-col items-center justify-center mt-[5px] mb-[5px]">
        <Image src="/images/Logo.png" alt="Helvetia Logo" width={150} height={150} priority className="object-contain" />
      </div>

      {/* Card */}
      <div className="w-full max-w-[600px] mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-slate-100 shadow-xl">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-semibold">Sign up</h1>
          <p className="text-slate-300 text-sm mt-1">Individual Account</p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-sm text-slate-200" htmlFor="firstName">First name</label>
              <input
                id="firstName"
                className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-200" htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Country */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200" htmlFor="country">Country</label>
            <select
              id="country"
              value={country}
              onChange={e => { setCountry(e.target.value); setDialCountry(e.target.value) }}
              className="h-11 rounded-xl border border-white/20 px-3 outline-none focus:ring-2 focus:ring-white/30"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: country ? WHITE : PLACEHOLDER }}
              required
            >
              <option value="" disabled>Select your country</option>
              {countries.map(({ code, name }) => (
                <option key={code} value={code} style={{ color: ANTHRACITE }}>
                  {flagEmoji(code)} {` ${code} — ${name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200" htmlFor="mobile">Mobile</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                aria-label="Country dial code"
                value={dialCountry}
                onChange={e => setDialCountry(e.target.value)}
                className="h-11 rounded-xl border border-white/20 px-3 outline-none focus:ring-2 focus:ring-white/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: dialCountry ? WHITE : PLACEHOLDER }}
                required
              >
                <option value="" disabled>Select prefix</option>
                {countries.map(({ code, name, dial }) => (
                  <option key={code} value={code} style={{ color: ANTHRACITE }}>
                    {flagEmoji(code)} {` +${dial} — ${code} — ${name}`}
                  </option>
                ))}
              </select>

              <div className="flex flex-col gap-1">
                <input
                  id="mobile"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Mobile number"
                  className="h-11 w-full rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                  aria-invalid={mobileTaken ? 'true' : 'false'}
                  required
                />
                {mobileTaken && <p className="text-xs text-rose-300">This mobile number is already registered.</p>}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200" htmlFor="email">Email</label>
            <div className="flex flex-col gap-1">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                aria-invalid={emailTaken ? 'true' : 'false'}
                required
              />
              {emailTaken && <p className="text-xs text-rose-300">This email is already registered.</p>}
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200" htmlFor="password">Password</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-11 w-full rounded-xl bg-white/10 border border-white/20 px-3 pr-10 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="h-11 w-full rounded-xl bg-white/10 border border-white/20 px-3 pr-10 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                  aria-label={showConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Minimum 8 characters. Use a strong password.</p>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 text-sm text-slate-200 justify-center">
            <input
              type="checkbox"
              checked={accept}
              onChange={e => setAccept(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10"
            />
            <span>
              I accept the <a href="#" className="underline hover:text-slate-100">Terms</a> and{' '}
              <a href="#" className="underline hover:text-slate-100">Privacy Policy</a>.
            </span>
          </label>

          {error && (
            <div className="text-sm text-center p-3 rounded-lg bg-rose-500/10 text-rose-200 border border-rose-500/20">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-11 w-[300px] rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
              style={{ backgroundColor: canSubmit ? ACCENT : DISABLED_BG, color: BACKGROUND }}
              aria-disabled={!canSubmit}
            >
              {loading ? 'Creating account…' : 'Continue !'}
            </button>
          </div>

          {/* Footer */}
          <p className="text-sm text-slate-300 text-center">
            Already have an account?{' '}
            <Link href="/login" className="underline font-medium hover:text-slate-100">Sign in</Link>.
          </p>
          <p className="text-xs text-slate-400 text-center">
            For any inquiries, please contact our customer service at{' '}
            <a href="mailto:support@hfss.ch" className="underline hover:text-slate-200">support@hfss.ch</a>.
          </p>
        </form>
      </div>
    </div>
  )
}
