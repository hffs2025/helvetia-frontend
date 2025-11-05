'use client';
// opzione A – pagina totalmente statica
export const dynamic = 'force-static';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

const NAVY = '#0A2342';
const NAVY_DARK = '#06162A';
const ACCENT = '#4FD1C5';
const ANTHRACITE = '#2B2B2B';
const WHITE = '#FFFFFF';
const PLACEHOLDER = '#A1A1AA';
const DISABLED_BG = '#9CA3AF'; // grigio per Create account disabilitato

type Country = { code: string; name: string; dial: string };

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
];
const DIAL: Record<string, string> = {
  CH: '41', AT: '43', BE: '32', BG: '359', HR: '385', CY: '357', CZ: '420',
  DK: '45', EE: '372', FI: '358', FR: '33', DE: '49', GR: '30', HU: '36',
  IE: '353', IT: '39', LV: '371', LT: '370', LU: '352', MT: '356',
  NL: '31', PL: '48', PT: '351', RO: '40', SK: '421', SI: '386',
  ES: '34', SE: '46',
};
const SWITZERLAND: Country = { code: 'CH', name: 'Switzerland', dial: DIAL['CH'] };
const attachDial = (list: Omit<Country, 'dial'>[]): Country[] =>
  list.map(c => ({ ...c, dial: DIAL[c.code] || '' }));
const flagEmoji = (code: string) =>
  code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));

export default function Page() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [dialCountry, setDialCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accept, setAccept] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Verifiche
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [mobileMsg, setMobileMsg] = useState<string | null>(null);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  const countries = useMemo(() => {
    const sorted = [...EU].sort((a, b) => a.name.localeCompare(b.name, 'en'));
    return [SWITZERLAND, ...attachDial(sorted)];
  }, []);

  useEffect(() => {
    if (country) setDialCountry(country);
  }, [country]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = phone.trim().length >= 5 && !!dialCountry;

  const validate = (): string | null => {
    if (!firstName || !lastName) return 'Please enter your name.';
    if (!country) return 'Please select your country.';
    if (!phoneOk) return 'Please enter your mobile number and prefix.';
    if (!emailOk) return 'Please enter a valid email.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    if (!accept) return 'You must accept the Terms and Privacy Policy.';
    return null;
  };

  // Helpers
  const toE164 = useCallback((dialCode: string, raw: string) => {
    const digits = (raw || '').replace(/\D/g, '');
    return `+${dialCode}${digits}`;
  }, []);
  const normalizedEmail = useCallback((raw: string) => (raw || '').trim().toLowerCase(), []);

  // Reset verifiche se utente cambia i valori
  useEffect(() => {
    setMobileVerified(false);
    setMobileMsg(null);
  }, [dialCountry, phone]);

  useEffect(() => {
    setEmailVerified(false);
    setEmailMsg(null);
  }, [email]);

  // Handlers verifica
  const onVerifyMobile = useCallback(async () => {
    if (!phoneOk) return;
    setMobileMsg(null);
    setError(null);
    setVerifyingMobile(true);
    try {
      const mobileE164 = toE164(DIAL[dialCountry], phone);
      const res = await fetch('/api/signup/check-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileE164 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Verification failed');
      if (data.available === true) {
        setMobileVerified(true);
        setMobileMsg('Mobile verified ✅');
      } else {
        setMobileVerified(false);
        setError('This mobile number is already registered.');
      }
    } catch (e: any) {
      setMobileVerified(false);
      setError(e?.message || 'Verification failed');
    } finally {
      setVerifyingMobile(false);
    }
  }, [dialCountry, phone, phoneOk, toE164]);

  const onVerifyEmail = useCallback(async () => {
    if (!emailOk) return;
    setEmailMsg(null);
    setError(null);
    setVerifyingEmail(true);
    try {
      const emailNorm = normalizedEmail(email);
      const res = await fetch('/api/signup/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNorm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Verification failed');
      if (data.available === true) {
        setEmailVerified(true);
        setEmailMsg('Email verified ✅');
      } else {
        setEmailVerified(false);
        setError('This email is already registered.');
      }
    } catch (e: any) {
      setEmailVerified(false);
      setError(e?.message || 'Verification failed');
    } finally {
      setVerifyingEmail(false);
    }
  }, [email, emailOk, normalizedEmail]);

  // Create account: cliccabile solo se entrambe le verifiche ok + accept
  const canSubmit = mobileVerified && emailVerified && accept && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMobileMsg(null);
    setEmailMsg(null);

    if (!canSubmit) return; // hard guard

    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          country,
          mobileCountry: dialCountry,
          dialCode: DIAL[dialCountry],
          phone,
          email: normalizedEmail(email),
          password,
          type: 'individual',
        }),
      });
      if (!res.ok) throw new Error('Signup failed');
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: `radial-gradient(1200px 600px at 10% -10%, ${ACCENT}20, transparent),
                     linear-gradient(180deg, ${NAVY}, ${NAVY_DARK})`,
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-1">
        <Image
          src="/images/Logo.png" // usa path assoluto dalla public/ (case-sensitivo)
          alt="Helvetia Logo"
          width={150}
          height={150}
          priority
          className="object-contain"
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-[760px] mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-slate-100 shadow-xl">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-semibold">Sign up</h1>
          <p className="text-slate-300 text-sm mt-1">Individual Account</p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-sm text-slate-200">First name</label>
              <input
                className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-200">Last name</label>
              <input
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
            <label className="text-sm text-slate-200">Country</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
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
            <p className="text-xs text-slate-400">
              Includes Switzerland and all European Union member states.
            </p>
          </div>

          {/* Mobile */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Mobile</label>
            <div className="grid gap-3" style={{ gridTemplateColumns: '230px 1fr 150px' }}>
              <select
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

              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Mobile number"
                className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                required
              />

              {/* Bottone Verify Mobile o badge verified */}
              {mobileVerified ? (
                <div
                  className="h-11 flex items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                  style={{ width: 150 }}
                  aria-live="polite"
                >
                  Mobile verified ✅
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onVerifyMobile}
                  disabled={!phoneOk || verifyingMobile}
                  className="h-11 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ width: 150, color: WHITE }}
                  aria-live="polite"
                >
                  {verifyingMobile ? 'Checking…' : 'Verify Mobile'}
                </button>
              )}
            </div>
            {mobileMsg && <p className="text-xs text-emerald-300">{mobileMsg}</p>}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Email</label>
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 150px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                required
              />

              {emailVerified ? (
                <div
                  className="h-11 flex items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                  style={{ width: 150 }}
                  aria-live="polite"
                >
                  Email verified ✅
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onVerifyEmail}
                  disabled={!emailOk || verifyingEmail}
                  className="h-11 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ width: 150, color: WHITE }}
                  aria-live="polite"
                >
                  {verifyingEmail ? 'Checking…' : 'Verify Email'}
                </button>
              )}
            </div>
            {emailMsg && <p className="text-xs text-emerald-300">{emailMsg}</p>}
          </div>

          {/* Password + Confirm */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Password</label>
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-11 w-full rounded-xl bg-white/10 border border-white/20 px-3 pr-10 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="h-11 w-full rounded-xl bg-white/10 border border-white/20 px-3 pr-10 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
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
              className="h-11 w-[300px] rounded-xl font-medium transition-colors"
              style={{ backgroundColor: canSubmit ? ACCENT : DISABLED_BG, color: NAVY_DARK }}
            >
              {loading ? 'Creating account…' : 'Create account'}
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
  );
}
