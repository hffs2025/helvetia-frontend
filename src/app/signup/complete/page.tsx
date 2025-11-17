'use client';
export const dynamic = 'force-static';

import React, {
  Suspense,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const BACKGROUND = '#071C2C';
const ACCENT = '#4FD1C5';
const DISABLED_BG = '#9CA3AF';

type SignupIndividualPayload = {
  firstName: string;
  lastName: string;
  country: string;     // codice paese es: "CH"
  mobileE164: string;
  email?: string;
  password: string;
};

// mapping codice paese → nome paese
const COUNTRY_NAMES: Record<string, string> = {
  CH: 'Switzerland',
  IT: 'Italy',
  FR: 'France',
  DE: 'Germany',
  ES: 'Spain',
};

function countryNameFromCode(code: string | undefined) {
  if (!code) return '';
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignupCompleteInner />
    </Suspense>
  );
}

function SignupCompleteInner() {
  const router = useRouter();

  const [signupData, setSignupData] = useState<SignupIndividualPayload | null>(null);

  const [ipAddress, setIpAddress] = useState('');
  const [ipCountry, setIpCountry] = useState('');
  const [loadingIp, setLoadingIp] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  // carica i dati della signup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem('signupIndividual');
      if (!raw) {
        router.replace('/signup/individual');
        return;
      }
      const parsed = JSON.parse(raw) as SignupIndividualPayload;
      setSignupData(parsed);
    } catch {
      router.replace('/signup/individual');
    }
  }, [router]);

  // recupero IP address
  useEffect(() => {
    let cancelled = false;

    const fetchIp = async () => {
      try {
        setLoadingIp(true);
        const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        if (!res.ok) throw new Error('ip_fetch_failed');
        const data = await res.json();
        if (cancelled) return;
        setIpAddress(data?.ip ?? '');
        setIpCountry(data?.country_name ?? data?.country ?? '');
      } catch {
        if (!cancelled) {
          setIpAddress('');
          setIpCountry('');
        }
      } finally {
        if (!cancelled) setLoadingIp(false);
      }
    };

    fetchIp();
    return () => {
      cancelled = true;
    };
  }, []);

  // CREATE ACCOUNT handler
  const handleCreateAccount = useCallback(async () => {
    if (!signupData) return;

    setError(null);
    setInfo(null);

    try {
      setSubmitting(true);

      const payload = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,   // password in chiaro → richiesto
        mobileE164: signupData.mobileE164,
        country: countryNameFromCode(signupData.country), // "Switzerland"
        country2: signupData.country,                      // "CH"
        ipAddress,
        ipCountry,
      };

      const res = await fetch('/api/signup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok || data?.created !== true) {
        throw new Error(data?.error || 'Account creation failed');
      }

      setCreated(true);
      setInfo('Account Created !');

      // pulizia session data
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('signupIndividual');
          window.sessionStorage.removeItem('signupMobileVerified');
        }
      } catch {
        // ignore
      }
    } catch (e: any) {
      setError(e?.message || 'Unable to create account right now.');
    } finally {
      setSubmitting(false);
    }
  }, [signupData, ipAddress, ipCountry]);

  const handleOk = useCallback(() => {
    router.push('/login');
  }, [router]);

  if (!signupData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: BACKGROUND }}
      >
        <p className="text-slate-200 text-sm">Loading…</p>
      </div>
    );
  }

  const country2 = signupData.country;
  const country1 = countryNameFromCode(signupData.country);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4"
      style={{ backgroundColor: BACKGROUND }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center justify-center mt-5 mb-5">
        <Image
          src="/images/Logo.png"
          alt="Helvetia Logo"
          width={150}
          height={150}
          priority
          className="object-contain"
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-[650px] mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-slate-100 shadow-xl">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-semibold">Review Your Details</h1>
          <p className="text-xs text-slate-300 mt-1">
            Make sure everything is correct before creating the account.
          </p>
        </div>

        <div className="grid gap-4">

          {/* Name / Surname */}
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-1">
              <label className="text-sm text-slate-200">Name</label>
              <input
                type="text"
                readOnly
                value={signupData.firstName}
                className="h-11 rounded-xl bg-white/5 border border-white/10 px-3"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-slate-200">Surname</label>
              <input
                type="text"
                readOnly
                value={signupData.lastName}
                className="h-11 rounded-xl bg-white/5 border border-white/10 px-3"
              />
            </div>
          </div>

          {/* Country */}
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-1">
              <label className="text-sm text-slate-200">Country</label>
              <input
                type="text"
                readOnly
                value={country1}
                className="h-11 rounded-xl bg-white/5 border border-white/10 px-3"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-slate-200">Country2 (Code)</label>
              <input
                type="text"
                readOnly
                value={country2}
                className="h-11 rounded-xl bg-white/5 border border-white/10 px-3"
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="grid gap-1">
            <label className="text-sm text-slate-200">Mobile</label>
            <input
              type="tel"
              readOnly
              value={signupData.mobileE164}
              className="h-11 rounded-xl bg-white/5 border border-white/10 px-3"
            />
          </div>

          {/* IP + IP Country */}
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-1">
              <label className="text-sm text-slate-200">
                IP Address{' '}
                {loadingIp && (
                  <span className="text-xs text-slate-400">(loading…)</span>
                )}
              </label>
              <input
                type="text"
                readOnly
                value={ipAddress}
                className="h-11 rounded-xl bg-white/5 border border-white/10 px-3"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm text-slate-200">IP Country</label>
              <input
                type="text"
                readOnly
                value={ipCountry}
                className="h-11 rounded-xl bg-white/5 border border-white/10 px-3"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid gap-1">
            <label className="text-sm text-slate-200">Password</label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                readOnly
                value={signupData.password}
                className="h-11 flex-1 rounded-xl bg-white/5 border border-white/10 px-3"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="h-11 px-3 rounded-xl text-xs font-medium border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Create Account */}
          <div className="flex flex-col items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={submitting || loadingIp}
              className="h-11 w-[260px] rounded-xl font-medium transition-colors"
              style={{
                backgroundColor:
                  submitting || loadingIp ? DISABLED_BG : ACCENT,
                color: BACKGROUND,
              }}
            >
              {submitting || loadingIp ? 'Preparing…' : 'Create Account'}
            </button>
          </div>

          {/* Error / Info */}
          {error && (
            <div className="text-sm text-center p-3 rounded-lg bg-rose-500/10 text-rose-200 border border-rose-500/20 mt-3">
              {error}
            </div>
          )}
          {info && !error && !created && (
            <div className="text-sm text-center p-3 rounded-lg bg-emerald-400/10 text-emerald-200 border border-emerald-400/20 mt-3">
              {info}
            </div>
          )}

          {/* Created Box */}
          {created && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/40 text-center">
              <p className="text-sm text-emerald-100 mb-3">Account Created !</p>
              <button
                type="button"
                onClick={handleOk}
                className="h-9 px-6 rounded-xl text-sm font-medium"
                style={{ backgroundColor: ACCENT, color: BACKGROUND }}
              >
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
