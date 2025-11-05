'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const NAVY = '#0A2342';
const NAVY_DARK = '#06162A';
const ACCENT = '#4FD1C5';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);
      // 🔐 Mock login – replace with your API logic
      const ok = email === 'demo@user.com' && password === '1234';
      if (!ok) throw new Error('Invalid credentials');

      document.cookie = 'session=ok; path=/';
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      style={{
        background: `radial-gradient(1200px 600px at 10% -10%, ${ACCENT}20, transparent),
                     linear-gradient(180deg, ${NAVY}, ${NAVY_DARK})`,
      }}
    >
      {/* 🔹 LOGO CENTRALE, distanza minima */}
      <div className="flex flex-col items-center justify-center mb-1">
        <Image
          src="/images/logo.png"    // assicurati che il file sia in public/images/logo.png
          alt="Helvetia Logo"
          width={150}
          height={150}
          priority
          className="object-contain"
        />
      </div>

      {/* 🔹 CARD LOGIN */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-slate-100 shadow-xl">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="text-slate-300 text-sm mt-1">Welcome back — please log in</p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm text-slate-200">Email</label>
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

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm text-slate-200">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>

          {error && (
            <div className="text-sm rounded-lg p-3 bg-rose-500/10 text-rose-200 border border-rose-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl font-medium disabled:opacity-70 transition-colors"
            style={{ backgroundColor: ACCENT, color: NAVY_DARK }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {/* Testo legale */}
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

          {/* 🔹 Link Sign Up */}
          <p className="text-sm text-slate-300 text-center mt-1">
            If you’re not registered yet, go to{' '}
            <Link
              href="/signup"
              className="underline font-medium hover:text-slate-100 transition-colors"
            >
              Sign Up
            </Link>.
          </p>

          {/* 🔹 Riga Servizio Clienti */}
          <p className="text-xs text-slate-400 text-center mt-2">
            For any inquiries, please contact our customer service at{' '}
            <a
              href="mailto:support@hfss.ch"
              className="underline hover:text-slate-200"
            >
              support@hfss.ch
            </a>.
          </p>
        </form>
      </div>
    </div>
  );
}
