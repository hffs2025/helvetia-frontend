'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

// === Palette (flat dark blue) ===
const BACKGROUND = '#071C2C';
const ACCENT = '#4FD1C5';
const DISABLED_BG = '#9CA3AF';

const STORAGE_KEY = 'authUser';

type LoginResponse = {
  authenticated: boolean;
  idUser?: string;
  name?: string;
  surname?: string;
  email?: string;
  country?: string;
  country2?: string;
  mobileE164?: string;
  sessionToken?: string;
  error?: string;
};

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordOk = password.trim().length > 0;
  const canSubmit = emailOk && passwordOk && !loading;

  const normalizedEmail = (raw: string) => (raw || '').trim().toLowerCase();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailOk || !passwordOk) {
      setError('Please enter a valid email and password.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail(email),
          password,
        }),
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok || !data.authenticated) {
        setError(data.error || 'Invalid email or password.');
        return;
      }

      const authUser = {
        idUser: data.idUser || '',
        name: data.name || '',
        surname: data.surname || '',
        email: data.email || normalizedEmail(email),
        country: data.country || '',
        country2: data.country2 || '',
        mobileE164: data.mobileE164 || '',
        sessionToken: data.sessionToken,
      };

      try {
        if (typeof window !== 'undefined') {
          const serialized = JSON.stringify(authUser);
          window.sessionStorage.setItem(STORAGE_KEY, serialized);
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-4"
      style={{ backgroundColor: BACKGROUND }}
    >
      {/* LOGO */}
      <div className="flex flex-col items-center justify-center mt-[5px] mb-[5px]">
        <Image
          src="/images/Logo.png"
          alt="Helvetia Logo"
          width={150}
          height={150}
          priority
          className="object-contain"
        />
      </div>

      {/* CARD LOGIN */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-slate-100 shadow-xl">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="text-slate-300 text-sm mt-1">Welcome back — please log in</p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          {/* Email */}
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>

          {/* Password con SHOW/HIDE */}
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm text-slate-200">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl bg-white/10 border border-white/20 px-3 pr-10 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm rounded-lg p-3 bg-rose-500/10 text-rose-200 border border-rose-500/20">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-11 rounded-xl font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: canSubmit ? ACCENT : DISABLED_BG, color: BACKGROUND }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {/* Legal */}
          <p className="text-xs text-slate-400 text-center">
            By signing in you agree to our{' '}
            <a className="underline hover:text-slate-200" href="#">
              Terms
            </a>{' '}
            and{' '}
            <a className="underline hover:text-slate-200" href="#">
              Privacy Policy
            </a>.
          </p>

          {/* Sign Up link */}
          <p className="text-sm text-slate-300 text-center mt-1">
            If you’re not registered yet, go to{' '}
            <Link
              href="/signup/individual"
              className="underline font-medium hover:text-slate-100 transition-colors"
            >
              Sign Up
            </Link>
            .
          </p>

          {/* Customer service */}
          <p className="text-xs text-slate-400 text-center mt-2">
            For any inquiries, please contact our customer service at{' '}
            <a href="mailto:support@hfss.ch" className="underline hover:text-slate-200">
              support@hfss.ch
            </a>.
          </p>
        </form>
      </div>
    </div>
  );
}
