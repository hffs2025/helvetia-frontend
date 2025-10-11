'use client';

// Next.js home page for Helvetia Financial Services
// Alternanza full-width: NAVY (#0B132B) / DARK BLUE (#122B47)
// Tailwind v4 (globals.css: `@import "tailwindcss";`)
import React, { useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <Hero email={email} setEmail={setEmail} />
      <TrustBar />
      <Services />
      <Features />
      <Compliance />
      <CTA email={email} setEmail={setEmail} />
      <Footer />
    </div>
  );
}

/* ---------------- Header (NAVY) ---------------- */
function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur bg-[#0B132B]/90 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-auto" />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-200">
          <a className="hover:text-white" href="#services">Services</a>
          <a className="hover:text-white" href="#features">Capabilities</a>
          <a className="hover:text-white" href="#compliance">Security & Compliance</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#cta" className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-sm">Login</a>
          <a href="#cta" className="px-4 py-2 rounded-xl bg-emerald-400 text-[#0B0E10] text-sm font-medium hover:bg-emerald-300">Open Individual Account</a>
          <a href="#cta" className="px-4 py-2 rounded-xl bg-emerald-400 text-[#0B0E10] text-sm font-medium hover:bg-emerald-300">Open Business Account</a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero (NAVY full-width) ---------------- */
function Hero({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <section className="relative overflow-hidden w-full bg-[#0B132B] text-white">
      {/* soft glows */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-400/20 blur-3xl rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white/90">
            <IconSparkles className="w-3 h-3" /> Payments • Crypto • Exchange • Card
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Helvetia Financial Services</h1>
          <p className="mt-4 text-white/80 text-lg max-w-xl">SEPA | SEPA Instant | TARGET2 | SWIFT Payments</p>
          <p className="mt-2 text-white/80 text-lg max-w-xl">Fiat/Crypto | Crypto/Crypto |  Crypto Wallet</p>
          <p className="mt-2 text-white/80 text-lg max-w-xl">Currency Exchange</p>
          <p className="mt-2 text-white/80 text-lg max-w-xl">Debit Cards</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#cta" className="px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 text-sm">Open Individual Account</a>
            <a href="#cta" className="px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 text-sm">Open Business Account</a>
          </div>
          <div className="mt-6 text-xs text-white/70 flex items-center gap-2"><IconLock className="w-4 h-4 text-emerald-300" /> AML / KYC / KYB / KYT / TR Compliance</div>
          <div className="mt-2 text-xs text-white/70 flex items-center gap-2"><IconLock className="w-4 h-4 text-emerald-300" /> Accountant access with limited privileges</div>
          <div className="mt-2 text-xs text-white/70 flex items-center gap-2"><IconLock className="w-4 h-4 text-emerald-300" /> Secure custody</div>
        </div>
        <div className="relative p-6 rounded-3xl border border-white/15 bg-white/5">
          {/* simple hero visualization: branded debit card */}
          <div className="relative mx-auto w-full max-w-md h-56 rounded-3xl bg-gradient-to-b from-white/10 to-white/0 border border-white/15">
            <div className="absolute left-6 top-5"><Logo className="h-10 w-auto" /></div>
            <div className="absolute right-6 bottom-5"><MastercardLogo className="h-8" /></div>
            <div className="absolute left-6 bottom-6 text-white/90 tracking-widest text-xl">1234 5678 9012 3456</div>
            <div className="absolute left-6 top-5 translate-y-10 text-xs text-white/70">Debit • 12/25</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Trust bar (bianco separatore) ---------------- */
function TrustBar() {
  return (
    <section className="w-full border-y border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6 grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2"><IconUptime className="w-4 h-4 text-emerald-500" /> 99.99% platform uptime</div>
        <div className="flex items-center gap-2"><IconShield className="w-4 h-4 text-emerald-500" /> Bank-grade security</div>
        <div className="flex items-center gap-2"><IconApi className="w-4 h-4 text-emerald-500" /> Modern REST & Webhooks</div>
      </div>
    </section>
  );
}

/* ---------------- Services (DARK BLUE full-width) ---------------- */
function Services() {
  return (
    <section id="services" className="w-full bg-[#122B47] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Services</h2>
        <p className="mt-2 text-white/80 max-w-3xl">
          One platform for Payments, Crypto Exchange, Digital Custody, Currency Exchange and Debit Cards
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <ServiceCard
            icon={<IconEuro className="w-5 h-5" />}
            title="IBAN for Payments"
            desc={<>Dedicated Account for Payment Rails<br /><br />Real-time status & automated reconciliation</>}
          />
          <ServiceCard
            icon={<IconCrypto className="w-5 h-5" />}
            title="IBAN for Crypto Trading"
            desc={<>Dedicated Account for Crypto Trading<br /><br />Real-time status & automated reconciliation</>}
          />
          <ServiceCard
            icon={<IconCard className="w-5 h-5" />}
            title="Debit Card"
            desc={<>Dedicated Account for Debit Card<br /><br />Real-time status & automated reconciliation</>}
          />
          <ServiceCard
            icon={<IconCrypto className="w-5 h-5" />}
            title="Internal Transfer"
            desc={<>Moving funds for free among your accounts instantly<br /><br />Real-time status & automated reconciliation</>}
          />
          <ServiceCard
            icon={<IconCrypto className="w-5 h-5" />}
            title="Wallet for Crypto"
            desc={<>Store, Send and Receive<br />Any Crypto ... Any Network<br />Real-time status & automated reconciliation</>}
          />
          <ServiceCard
            icon={<IconEuro className="w-5 h-5" />}
            title="Currency Exchange"
            desc={<>24/7 exchange & conversion<br />Top 10 currencies on the market<br />Real-time status & automated reconciliation</>}
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-white/15 bg-white/5">
      <div className="flex items-center gap-2 text-white font-medium">{icon} {title}</div>
      <div className="mt-1 text-sm text-white/80">{desc}</div>
    </div>
  );
}

/* ---------------- Features (NAVY full-width) ---------------- */
function Features() {
  return (
    <section id="features" className="w-full bg-[#0B132B] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Capabilities</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Feature icon={<IconZap className="w-5 h-5" />} title="Instant EUR" desc="SEPA Instant 24/7 with notifications." />
        <Feature icon={<IconGlobe className="w-5 h-5" />} title="Global SWIFT" desc="Multi-currency payouts and collections." />
        <Feature icon={<IconDev className="w-5 h-5" />} title="Developer-first" desc="Clean APIs, sandbox, webhooks and strong idempotency." />
        </div>
       </div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl border border-white/15 bg-white/5">
      <div className="flex items-center gap-2 text-white font-medium">{icon} {title}</div>
      <div className="mt-1 text-sm text-white/80">{desc}</div>
    </div>
  );
}

/* ---------------- Compliance (DARK BLUE full-width) ---------------- */
function Compliance() {
  return (
    <section id="compliance" className="w-full bg-[#122B47] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Security & Compliance</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <InfoCard icon={<IconShield className="w-5 h-5 text-emerald-300" />} title="Custody & Infrastructure" desc="Certified HSMs, segregated funds, fraud monitoring and geo-redundant backups in Switzerland." />
          <InfoCard icon={<IconLock className="w-5 h-5 text-emerald-300" />} title="AML/KYC" desc="Bank-grade AML procedures, sanctions screening and Travel Rule support" />
          <InfoCard icon={<IconSupport className="w-5 h-5 text-emerald-300" />} title="Dedicated Support" desc="24/7 assistance via chat, bot chat and email" />
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/15 bg-white/5">
      <div className="flex items-center gap-2 text-white font-medium">{icon} {title}</div>
      <div className="mt-2 text-sm text-white/80">{desc}</div>
    </div>
  );
}

/* ---------------- CTA (NAVY full-width) ---------------- */
function CTA({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <section id="cta" className="w-full bg-[#0B132B] text-white">
      <div className="max-w-7xl mx-auto px-4 pb-20 pt-16">
        <div className="p-6 md:p-8 rounded-3xl border border-white/15 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold">Ready to get started?</h3>
            <p className="mt-1 text-white/80">Open an account and access instant payments, crypto, and corporate cards.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-auto gap-2" aria-label="Get started form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Business email"
              aria-label="Business email"
              className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 focus:outline-none border border-white/15"
            />
            <button className="px-5 py-3 rounded-2xl bg-emerald-400 text-[#0B0E10] font-medium hover:bg-emerald-300">Get started</button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer (NAVY) ---------------- */
function Footer() {
  return (
    <footer className="w-full border-t border-white/10 backdrop-blur bg-[#0B132B]/90 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-2">
          <Logo className="h-8 w-auto" />
          <p className="text-gray-300">© {new Date().getFullYear()} Helvetia Financial Services & Software SA. All rights reserved.</p>
        </div>
        <div>
          <div className="font-medium text-white">Products</div>
          <ul className="mt-2 space-y-1 text-gray-300">
            <li><a className="hover:text-white" href="#services">Payments</a></li>
            <li><a className="hover:text-white" href="#services">Crypto</a></li>
            <li><a className="hover:text-white" href="#services">Currency Exchange</a></li>
            <li><a className="hover:text-white" href="#services">Debit Card</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-orange">Company</div>
          <ul className="mt-2 space-y-1 text-gray-300">
            <li><a className="hover:text-white" href="#compliance">Security</a></li>
            <li><a className="hover:text-white" href="#features">Documentation</a></li>
            <li><a className="hover:text-white" href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-white">Contact</div>
          <ul className="mt-2 space-y-1 text-gray-300">
            <li>Zurich, Switzerland</li>
            <li>+41 44 000 00 00</li>
            <li>support@hfss.ch</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Components: brand & icons ---------------- */
function Logo({ className = '' }: { className?: string }) {
  // Inline wordmark to avoid missing assets
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Helvetia Financial Services logo">
      <svg viewBox="0 0 48 48" className="h-full" aria-hidden>
        <circle cx="24" cy="24" r="22" fill="#10B981" opacity="0.15" />
        <path d="M8 28c6-1 10-9 16-9s10 8 16 9" stroke="#10B981" strokeWidth="2" fill="none" />
        <path d="M10 34h28" stroke="#10B981" strokeWidth="2" />
      </svg>
      <span className="text-white font-semibold tracking-tight">Helvetia FS</span>
    </div>
  );
}

function MastercardLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden>
      <circle cx="25" cy="20" r="10" fill="#EA001B" />
      <circle cx="39" cy="20" r="10" fill="#FF9900" />
    </svg>
  );
}

function IconBase({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}
function IconSparkles(props: any) { return (<IconBase {...props}><path d="M12 3l1.8 3.6L18 9l-4.2.4L12 13l-1.8-3.6L6 9l4.2-.4L12 3z" /></IconBase>); }
function IconLock(props: any) { return (<IconBase {...props}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 118 0v4" /></IconBase>); }
function IconUptime(props: any) { return (<IconBase {...props}><path d="M4 12h4l2 4 4-8 3 6h3" /></IconBase>); }
function IconApi(props: any) { return (<IconBase {...props}><path d="M4 12h6M14 12h6" /><circle cx="12" cy="12" r="2" /></IconBase>); }
function IconEuro(props: any) { return (<IconBase {...props}><path d="M4 10h10M4 14h10" /><path d="M17 7a6 6 0 100 10" /></IconBase>); }
function IconCrypto(props: any) { return (<IconBase {...props}><path d="M6 12a6 6 0 1012 0 6 6 0 10-12 0z" /><path d="M8 12h8" /></IconBase>); }
function IconCard(props: any) { return (<IconBase {...props}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 11h18" /></IconBase>); }
function IconZap(props: any) { return (<IconBase {...props}><path d="M13 2L3 14h7l-1 8 10-12h-7z" /></IconBase>); }
function IconGlobe(props: any) { return (<IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" /></IconBase>); }
function IconDev(props: any) { return (<IconBase {...props}><path d="M7 8l-4 4 4 4" /><path d="M17 8l4 4-4 4" /></IconBase>); }
function IconShield(props: any) { return (<IconBase {...props}><path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z" /></IconBase>); }
function IconSupport(props: any) { return (<IconBase {...props}><path d="M6 9a6 6 0 1112 0v5a4 4 0 01-4 4H10a4 4 0 01-4-4z" /></IconBase>); }
