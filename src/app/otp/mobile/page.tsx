'use client';
export const dynamic = 'force-static';

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// === Palette ===
const BACKGROUND = '#071C2C';
const ACCENT = '#4FD1C5';
const DISABLED_BG = '#9CA3AF';

// === Timer ===
const EXPIRE_SECONDS = 900; // 15 minuti

// === Utils ===
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.split('; ').find((r) => r.startsWith(name + '='));
  return match ? match.split('=')[1] : '';
};
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const isValidEmail = (v: string) =>
  /^(?=[^@\s]{1,64}@)[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
const validateCode = (v: string) => /^\d{6}$/.test(v.trim());

// ---- Wrapper per soddisfare Next (useSearchParams sotto <Suspense>) ----
export default function Page() {
  return (
    <Suspense fallback={null}>
      <OtpMobileInner />
    </Suspense>
  );
}

function OtpMobileInner() {
  const router = useRouter();
  const search = useSearchParams();

  // query params
  const registrationId = useMemo(
    () =>
      decodeURIComponent(search.get('rid') || '') ||
      decodeURIComponent(getCookie('regId') || ''),
    [search]
  );

  const initialEmailFromQuery = useMemo(
    () => decodeURIComponent(search.get('email') || ''),
    [search]
  );

  const initialMobileFromQuery = useMemo(
    () => decodeURIComponent(search.get('mobile') || ''),
    [search]
  );

  // === State ===
  const [email, setEmail] = useState(initialEmailFromQuery);
  const [mobile, setMobile] = useState(initialMobileFromQuery); // precompilato
  const [isEditing, setIsEditing] = useState(false);
  const [emailDirty, setEmailDirty] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [nextTimer, setNextTimer] = useState(0); // countdown per “Next code in mm:ss”
  const [ttl, setTtl] = useState(EXPIRE_SECONDS);
  const isExpired = ttl <= 0;

  // countdown OTP validity (15 min)
  useEffect(() => {
    if (!isExpired) {
      const t = setInterval(() => setTtl((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
  }, [isExpired]);

  // countdown per “Next code in mm:ss”
  useEffect(() => {
    if (nextTimer > 0) {
      const t = setInterval(() => setNextTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
  }, [nextTimer]);

  // === API ===
  const saveEmail = useCallback(async () => {
    if (!registrationId) {
      setError('Session not found. Please restart the signup.');
      return false;
    }
    if (!emailDirty) {
      setIsEditing(false);
      return true;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return false;
    }
    try {
      setInfo('Updating email…');
      const res = await fetch('/api/signup/update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, email }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || data?.updated !== true)
        throw new Error(data?.error || 'Failed to update email');
      setEmailDirty(false);
      setIsEditing(false);
      setInfo('Email updated.');
      return true;
    } catch (e: any) {
      setInfo(null);
      setError(e?.message || 'Unable to update the email address.');
      return false;
    }
  }, [email, emailDirty, registrationId]);

  const sendOtp = useCallback(async () => {
    if (!registrationId) {
      setError('Session not found. Please restart the signup.');
      return;
    }
    if (isEditing || emailDirty) {
      setError('Please save the email before sending the code.');
      return;
    }
    try {
      setSending(true);
      setError(null);
      setInfo('Sending code…');
      setTtl(EXPIRE_SECONDS);
      setNextTimer(EXPIRE_SECONDS);

      const res = await fetch('/api/signup/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, channel: 'email' }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || data?.sent !== true)
        throw new Error(data?.error || 'Failed to send code');
      setInfo('Code sent. Check your email.');
    } catch (e: any) {
      setInfo(null);
      setError(e?.message || 'Unable to send the code right now.');
    } finally {
      setSending(false);
    }
  }, [registrationId, isEditing, emailDirty]);

  const onVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setInfo(null);

      if (!registrationId)
        return setError('Session not found. Please restart the signup.');
      if (isExpired)
        return setError('Code expired. Please request a new one.');
      if (isEditing || emailDirty)
        return setError('Please save the email before validating.');
      if (!validateCode(code))
        return setError('Enter the 6-digit code you received via email.');

      try {
        setLoading(true);
        const res = await fetch('/api/signup/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationId, code }),
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok || data?.verified !== true)
          throw new Error(data?.error || 'Invalid code');
        router.push('/signup/complete');
      } catch (e: any) {
        setError(e?.message || 'Verification failed. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [code, isExpired, isEditing, emailDirty, registrationId, router]
  );

  // === UI ===
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
          <h1 className="text-2xl font-semibold">Verify your email</h1>
        </div>

        <form id="otp-form" className="grid gap-4" onSubmit={onVerify}>
          {/* MOBILE (read-only precompilato) */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Mobile number</label>
            <input
              type="tel"
              value={mobile}
              readOnly
              placeholder="+41..."
              className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-slate-100 placeholder-slate-400 outline-none"
            />
          </div>

          {/* EMAIL */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Email address</label>
            <div className="flex gap-2">
              <input
                inputMode="email"
                autoComplete="email"
                type="email"
                value={email}
                readOnly={!isEditing}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailDirty(true);
                }}
                placeholder="you@example.com"
                className={`flex-1 h-11 rounded-xl px-3 text-slate-100 placeholder-slate-400 outline-none tabular-nums
                  ${
                    isEditing
                      ? 'bg-white/10 border border-white/20 focus:ring-2 focus:ring-white/30'
                      : 'bg-white/5 border border-white/10'
                  }
                `}
                aria-invalid={isEditing && emailDirty && !isValidEmail(email)}
              />
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setError(null);
                    setInfo(null);
                  }}
                  className="h-11 rounded-xl font-medium"
                  style={{ backgroundColor: ACCENT, color: BACKGROUND, width: '100px' }}
                >
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={saveEmail}
                  disabled={!emailDirty || !isValidEmail(email)}
                  className="h-11 rounded-xl font-medium"
                  style={{
                    backgroundColor:
                      !emailDirty || !isValidEmail(email) ? DISABLED_BG : ACCENT,
                    color: BACKGROUND,
                    width: '100px',
                  }}
                >
                  Save
                </button>
              )}
            </div>
            {isEditing && emailDirty && !isValidEmail(email) && (
              <p className="text-xs text-rose-300">Enter a valid email address.</p>
            )}
          </div>

          {/* OTP */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Verification code (6 digits)</label>
            <input
              inputMode="numeric"
              pattern="\\d*"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
              disabled={sending || nextTimer > 0 || isEditing || emailDirty}
              className="h-11 w-[300px] rounded-xl font-medium transition-colors"
              style={{
                backgroundColor:
                  sending || nextTimer > 0 || isEditing || emailDirty
                    ? DISABLED_BG
                    : ACCENT,
                color: BACKGROUND,
              }}
            >
              {sending ? 'Sending…' : nextLabel}
            </button>

            <button
              type="submit"
              disabled={
                loading || !validateCode(code) || isExpired || isEditing || emailDirty
              }
              className="h-11 w-[300px] rounded-xl font-medium transition-colors"
              style={{
                backgroundColor:
                  loading || !validateCode(code) || isExpired || isEditing || emailDirty
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

          <div className="text-center mt-2">
            <Link href="/signup" className="underline text-slate-400 hover:text-slate-100 text-xs">
              Back to signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
