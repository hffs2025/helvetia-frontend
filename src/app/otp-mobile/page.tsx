'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
const safeDecode = (v?: string | null) => (v ? decodeURIComponent(v) : '');
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
  return match ? match.split('=')[1] : '';
};
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const isValidMobile = (v: string) => /^(\+)?\d{6,15}$/.test(v.trim());
const validateCode = (v: string) => /^\d{6}$/.test(v.trim());

export default function OtpMobileClient() {
  const router = useRouter();
  const search = useSearchParams();

  const registrationId = useMemo(
    () => safeDecode(search.get('rid')) || safeDecode(getCookie('regId')),
    [search]
  );
  const initialMobileFromQuery = useMemo(
    () => safeDecode(search.get('mobile')),
    [search]
  );

  // === State ===
  const [mobile, setMobile] = useState(initialMobileFromQuery);
  const [isEditing, setIsEditing] = useState(false);
  const [mobileDirty, setMobileDirty] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [nextTimer, setNextTimer] = useState(0); // countdown “Next code in mm:ss”
  const [ttl, setTtl] = useState(EXPIRE_SECONDS);
  const isExpired = ttl <= 0;

  // OTP validity countdown
  useEffect(() => {
    if (!isExpired) {
      const t = setInterval(() => setTtl(s => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
  }, [isExpired]);

  // “Next code in mm:ss” countdown
  useEffect(() => {
    if (nextTimer > 0) {
      const t = setInterval(() => setNextTimer(s => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
  }, [nextTimer]);

  // === API ===
  const saveMobile = useCallback(async () => {
    if (!registrationId) {
      setError('Session not found. Please restart the signup.');
      return false;
    }
    if (!mobileDirty) {
      setIsEditing(false);
      return true;
    }
    if (!isValidMobile(mobile)) {
      setError('Enter a valid mobile number (e.g., +41790000000).');
      return false;
    }
    try {
      setInfo('Updating mobile…');
      const res = await fetch('/api/signup/update-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, mobile }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || data?.updated !== true)
        throw new Error(data?.error || 'Failed to update mobile');
      setMobileDirty(false);
      setIsEditing(false);
      setInfo('Mobile updated.');
      return true;
    } catch (e: any) {
      setInfo(null);
      setError(e?.message || 'Unable to update the mobile number.');
      return false;
    }
  }, [mobile, mobileDirty, registrationId]);

  const sendOtp = useCallback(async () => {
    if (!registrationId) {
      setError('Session not found. Please restart the signup.');
      return;
    }
    if (isEditing || mobileDirty) {
      setError('Please save the mobile number before sending the code.');
      return;
    }
    try {
      setSending(true);
      setError(null);
      setInfo('Sending code…');
      setTtl(EXPIRE_SECONDS);
      setNextTimer(EXPIRE_SECONDS); // avvia timer “Next code in mm:ss”

      const res = await fetch('/api/signup/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, channel: 'sms' }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || data?.sent !== true)
        throw new Error(data?.error || 'Failed to send code');
      setInfo('Code sent. Check your SMS.');
    } catch (e: any) {
      setInfo(null);
      setError(e?.message || 'Unable to send the code right now.');
    } finally {
      setSending(false);
    }
  }, [registrationId, isEditing, mobileDirty]);

  const onVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setInfo(null);

      if (!registrationId)
        return setError('Session not found. Please restart the signup.');
      if (isExpired)
        return setError('Code expired. Please request a new one.');
      if (isEditing || mobileDirty)
        return setError('Please save the mobile number before validating.');
      if (!validateCode(code))
        return setError('Enter the 6-digit code you received via SMS.');

      try {
        setLoading(true);
        const res = await fetch('/api/signup/verify-mobile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationId, code }),
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok || data?.verified !== true)
          throw new Error(data?.error || 'Invalid code');
        router.push('/signup/verify-email');
      } catch (e: any) {
        setError(e?.message || 'Verification failed. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [code, isExpired, isEditing, mobileDirty, registrationId, router]
  );

  // === UI ===
  const nextMm = Math.floor(nextTimer / 60);
  const nextSs = nextTimer % 60;
  const nextLabel =
    nextTimer > 0
      ? `Next code in ${pad2(nextMm)}:${pad2(nextSs)}`
      : 'Send the code !';

  return (
    <div className="min-h-screen flex flex-col items-center px-4" style={{ backgroundColor: BACKGROUND }}>
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
        <div className="text-center mb-5">
          <h1 className="text-2xl font-semibold">Verify your mobile</h1>
        </div>

        <form id="otp-form" className="grid gap-4" onSubmit={onVerify}>
          {/* MOBILE */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-200">Mobile number</label>
            <div className="flex gap-2">
              <input
                inputMode="tel"
                autoComplete="tel"
                value={mobile}
                readOnly={!isEditing}
                onChange={e => { setMobile(e.target.value); setMobileDirty(true); }}
                placeholder="+41790000000"
                className={`flex-1 h-11 rounded-xl px-3 text-slate-100 placeholder-slate-400 outline-none tabular-nums
                  ${isEditing ? 'bg-white/10 border border-white/20 focus:ring-2 focus:ring-white/30' : 'bg-white/5 border border-white/10'}
                `}
                aria-invalid={isEditing && mobileDirty && !isValidMobile(mobile)}
              />
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => { setIsEditing(true); setError(null); setInfo(null); }}
                  className="h-11 rounded-xl font-medium"
                  style={{ backgroundColor: ACCENT, color: '#071C2C', width: '100px' }}
                >
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={saveMobile}
                  disabled={!mobileDirty || !isValidMobile(mobile)}
                  className="h-11 rounded-xl font-medium"
                  style={{
                    backgroundColor: (!mobileDirty || !isValidMobile(mobile)) ? DISABLED_BG : ACCENT,
                    color: '#071C2C',
                    width: '100px',
                  }}
                >
                  Save
                </button>
              )}
            </div>
            {isEditing && mobileDirty && !isValidMobile(mobile) && (
              <p className="text-xs text-rose-300">Enter a valid mobile number (6–15 digits, optional +).</p>
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
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
              disabled={sending || nextTimer > 0 || isEditing || mobileDirty}
              className="h-11 w-[300px] rounded-xl font-medium transition-colors"
              style={{
                backgroundColor:
                  sending || nextTimer > 0 || isEditing || mobileDirty
                    ? DISABLED_BG
                    : ACCENT,
                color: '#071C2C',
              }}
            >
              {sending ? 'Sending…' : nextLabel}
            </button>

            <button
              type="submit"
              disabled={
                loading || !validateCode(code) || isExpired || isEditing || mobileDirty
              }
              className="h-11 w-[300px] rounded-xl font-medium transition-colors"
              style={{
                backgroundColor:
                  loading || !validateCode(code) || isExpired || isEditing || mobileDirty
                    ? DISABLED_BG
                    : ACCENT,
                color: '#071C2C',
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
            Didn’t receive the code? Make sure your phone has coverage and the number is correct.
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
