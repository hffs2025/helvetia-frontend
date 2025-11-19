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

// === Palette ===
const BACKGROUND = '#071C2C';
const ACCENT = '#4FD1C5';
const DISABLED_BG = '#9CA3AF';

// === Timer ===
const EXPIRE_SECONDS = 900;

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const validateCode = (v: string) => /^\d{6}$/.test(v.trim());

type SignupIndividualPayload = {
  firstName: string;
  lastName: string;
  country: string;
  mobileE164: string;
  email?: string;
  password: string;
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OtpEmailInner />
    </Suspense>
  );
}

function OtpEmailInner() {
  const router = useRouter();

  const [signupData, setSignupData] = useState<SignupIndividualPayload | null>(null);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [nextTimer, setNextTimer] = useState(0);
  const [ttl, setTtl] = useState(EXPIRE_SECONDS);
  const isExpired = ttl <= 0;

  // Carico dati da sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem('signupIndividual');
      if (raw) {
        const parsed = JSON.parse(raw) as SignupIndividualPayload;
        setSignupData(parsed);
        if (parsed.email) setEmail(parsed.email);
      }
      const mv = window.sessionStorage.getItem('signupMobileVerified');
      if (mv === '1') setMobileVerified(true);
    } catch {
      // ignore
    }
  }, []);

  // countdown validità codice
  useEffect(() => {
    if (!isExpired) {
      const t = setInterval(() => setTtl((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
  }, [isExpired]);

  // countdown invio nuovo codice
  useEffect(() => {
    if (nextTimer > 0) {
      const t = setInterval(() => setNextTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
  }, [nextTimer]);

  const sendOtp = useCallback(async () => {
    setError(null);
    if (!email) {
      setError('Email not found. Please restart the signup.');
      return;
    }
    try {
      setSending(true);
      setInfo('Sending code…');
      setTtl(EXPIRE_SECONDS);
      setNextTimer(EXPIRE_SECONDS);

      const res = await fetch('/api/otp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
        }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || data?.sent !== true) {
        throw new Error(data?.error || 'Failed to send code');
      }
      setInfo('Code sent. Check your email.');
    } catch (e: any) {
      setInfo(null);
      setError(e?.message || 'Unable to send the code right now.');
    } finally {
      setSending(false);
    }
  }, [email]);

  const onVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setInfo(null);

      if (!email) {
        setError('Email not found. Please restart the signup.');
        return;
      }
      if (isExpired) {
        setError('Code expired. Please request a new one.');
        return;
      }
      if (!validateCode(code)) {
        setError('Enter the 6-digit code you received via email.');
        return;
      }

      try {
        setLoading(true);
        const res = await fetch('/api/otp/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            email,
            code,
          }),
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok || data?.verified !== true) {
          throw new Error(data?.error || 'Invalid code');
        }

        // qui puoi usare signupData per creare l'utente definitivo
        router.push('/signup/complete');
      } catch (e: any) {
        setError(e?.message || 'Verification failed. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [code, email, isExpired, router]
  );

  const nextMm = Math.floor(nextTimer / 60);
  const nextSs = nextTimer % 60;
  const nextLabel =
    nextTimer > 0
      ? `Next code in ${pad2(nextMm)}:${pad2(nextSs)}`
      : 'Send the code !';

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
      <div className="w-full max-w-[600px] mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-slate-100 shadow-xl">
        {/* Title */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-semibold">Verify your Email</h1>
          {!mobileVerified && (
            <p className="text-xs text-amber-200 mt-1">
              Mobile verification not detected. Make sure you completed the previous step.
            </p>
          )}
        </div>

        <form id="otp-email-form" className="grid gap-4" onSubmit={onVerify}>
          {/* EMAIL (read-only) */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Email address</label>
            <input
              type="email"
              value={email}
              readOnly
              placeholder="you@example.com"
              className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-slate-100 placeholder-slate-400 outline-none"
            />
          </div>

          {/* OTP */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Verification code (6 digits)</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="Enter the 6-digit code"
              className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30 tabular-nums tracking-widest"
              required
              aria-invalid={!!error}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <button
              type="button"
              onClick={sendOtp}
              disabled={sending || nextTimer > 0}
              className="h-11 w-[300px] rounded-xl font-medium transition-colors"
              style={{
                backgroundColor:
                  sending || nextTimer > 0 ? DISABLED_BG : ACCENT,
                color: BACKGROUND,
              }}
            >
              {sending ? 'Sending…' : nextLabel}
            </button>

            <button
              type="submit"
              disabled={loading || !validateCode(code) || isExpired}
              className="h-11 w-[300px] rounded-xl font-medium transition-colors"
              style={{
                backgroundColor:
                  loading || !validateCode(code) || isExpired
                    ? DISABLED_BG
                    : ACCENT,
                color: BACKGROUND,
              }}
            >
              {loading ? 'Verifying…' : 'Validate !'}
            </button>
          </div>

          {/* Info / Error */}
          {error && (
            <div className="text-sm text-center p-3 rounded-lg bg-rose-500/10 text-rose-200 border border-rose-500/20 mt-3">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="text-sm text-center p-3 rounded-lg bg-emerald-400/10 text-emerald-200 border border-emerald-400/20 mt-3">
              {info}
            </div>
          )}

          {isExpired && (
            <div className="text-xs text-center p-2 rounded-lg bg-amber-400/10 text-amber-200 border border-amber-400/20">
              The code has expired. Please tap “Send the code !” again.
            </div>
          )}

          <p className="text-xs text-slate-400 text-center mt-2">
            Didn’t receive the code? Check the spam folder and make sure the email address is correct.
          </p>
        </form>
      </div>
    </div>
  );
}
