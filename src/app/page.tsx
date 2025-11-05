'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/* ====================== Logo (PNG, fill header height) ====================== */
function Logo() {
  return (
    <div className="flex items-center h-full" aria-label="Helvetia Financial Services logo">
      <Image
        src="/images/Logo.png"
        alt="Helvetia Financial Services"
        width={1200}           // valori intrinseci alti (per qualità)
        height={450}
        priority
        className="select-none pointer-events-none"
        sizes="(max-width: 768px) 240px, (max-width: 1024px) 300px, 380px"
        style={{
          height: '170%',      // il logo non supera l’altezza della barra
          width: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}

/* ====================== Header (altezza fissa + responsive) ====================== */
function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur bg-[#0B132B]/90 text-white">
      <div
        className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-hidden"
        style={{
          // Altezza BARRA fissa e responsive; regola a piacere
          height: 'clamp(56px, 7.5vw, 96px)',
        }}
      >
        {/* Logo grande ma entro l’altezza della barra */}
        <div className="h-full flex items-center">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-200 leading-none">
          <a className="hover:text-white" href="#services">Services</a>
          <a className="hover:text-white" href="#features">Capabilities</a>
          <a className="hover:text-white" href="#compliance">Security &amp; Compliance</a>
        </nav>

        {/* Buttons (compatti) */}
        <div className="hidden sm:flex items-center gap-2 leading-none">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-sm"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ====================== Icone & brand ====================== */
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

/* ====================== Sezioni ====================== */
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

          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
            Helvetia Financial Services
          </h1>

          <p className="mt-4 text-white/80 text-lg max-w-xl flex items-center gap-3">
            <span>SEPA | SEPA Instant | TARGET2</span>
          </p>

          <p className="mt-4 text-white/80 text-lg max-w-xl flex items-center gap-3">
            <span>FPS | CHAPS | BACS</span>
          </p>

          <p className="mt-4 text-white/80 text-lg max-w-xl flex items-center gap-3">
             <span>SWIFT Payments</span>
          </p>

          <p className="mt-4 text-white/80 text-lg max-w-xl flex items-center gap-3">
            <span>Currency Exchange</span>
          </p>

          <p className="mt-2 text-white/80 text-lg max-w-xl">Crypto Trading</p>
          <p className="mt-2 text-white/80 text-lg max-w-xl">Debit Cards</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/signup/individual" className="px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 text-sm">
              Open Individual Account
            </Link>
            <Link href="/signup/business" className="px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 text-sm">
              Open Business Account
            </Link>
          </div>

          <div className="mt-6 text-xs text-white/70 flex items-center gap-2">
            <IconLock className="w-4 h-4 text-emerald-300" /> AML / KYC / KYB / KYT / TR Compliance
          </div>
          <div className="mt-2 text-xs text-white/70 flex items-center gap-2">
            <IconLock className="w-4 h-4 text-emerald-300" /> Accountant access with limited privileges
          </div>
          <div className="mt-2 text-xs text-white/70 flex items-center gap-2">
            <IconLock className="w-4 h-4 text-emerald-300" /> Secure custody
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="w-full border-y border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6 grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2"><IconUptime className="w-4 h-4 text-emerald-500" /> 99.99% platform uptime</div>
        <div className="flex items-center gap-2"><IconShield className="w-4 h-4 text-emerald-500" /> Bank-grade security</div>
        <div className="flex items-center gap-2"><IconApi className="w-4 h-4 text-emerald-500" /> Modern REST &amp; Webhooks</div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="w-full bg-[#122B47] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Services</h2>
        <p className="mt-2 text-white/80 max-w-3xl">
          One platform for Payments, Crypto Exchange, Digital Custody, Currency Exchange and Debit Cards
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <ServiceCard icon={<IconEuro className="w-5 h-5" />} title="IBAN for Payments" desc={<>Dedicated Account for Payment Rails<br /><br />Real-time status &amp; automated reconciliation</>} />
          <ServiceCard icon={<IconCrypto className="w-5 h-5" />} title="IBAN for Crypto Trading" desc={<>Dedicated Account for Crypto Trading<br /><br />Real-time status &amp; automated reconciliation</>} />
          <ServiceCard icon={<IconCard className="w-5 h-5" />} title="Debit Card" desc={<>Dedicated Account for Debit Card<br /><br />Real-time status &amp; automated reconciliation</>} />
          <ServiceCard icon={<IconCrypto className="w-5 h-5" />} title="Internal Transfer" desc={<>Moving funds for free among your accounts instantly<br /><br />Real-time status &amp; automated reconciliation</>} />
          <ServiceCard icon={<IconCrypto className="w-5 h-5" />} title="Wallet for Crypto" desc={<>Store, Send and Receive<br />Any Crypto ... Any Network<br />Real-time status &amp; automated reconciliation</>} />
          <ServiceCard icon={<IconEuro className="w-5 h-5" />} title="Currency Exchange" desc={<>24/7 exchange &amp; conversion<br />Top 10 currencies on the market<br />Real-time status &amp; automated reconciliation</>} />
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

function Features() {
  return (
    <section id="features" className="w-full bg-[#0B132B] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Capabilities</h2>
       
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          
          <div className="force-preline">
           
            <Feature icon={<IconZap className="w-5 h-5" />} title="SEPA" desc={`SEPA (Single Euro Payments Area) is a European initiative that allows for cashless euro payments to be made across Europe as easily as domestic payments.
            `
              } />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="SEPA ISTANT" desc={`SEPA Instant is a service that allows for immediate credit transfers in euros within the SEPA (Single Euro Payments Area) zone, processing payments, 24 hours a day, 365 days a year.
            `
              } />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="EXPRESS PAYMENT" desc={`"Express payment" refers to any payment method that is faster than Standards SEPA and, usually, takes few hours to complete a payment transaction.
            `

            } />
          </div>
        </div>
      
       <div className="mt-6 grid md:grid-cols-3 gap-4">
          
          <div className="force-preline">
           
            <Feature icon={<IconZap className="w-5 h-5" />} title="Dedicated Crypto Account" desc={`EUR accounnt dedicated for Crypto Trading. 
              On / Off Ramp
              Crytpo / Crypto Trading
              Several Networks`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Crypto Trading" desc={`All Crypto Trading activities 
              On / Off Ramp
              Crytpo / Crypto Trading
              Several Networks`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Custodian Wallet" desc={`Bacs is a secure UK bank-to-bank transfer processed in three working days (Direct Credit / Direct Debit).`} />
          </div>
        </div>
      
 <div className="mt-6 grid md:grid-cols-3 gap-4">
          
          <div className="force-preline">
           
            <Feature icon={<IconZap className="w-5 h-5" />} title="Currency Exchange" desc={`For fast payments in GBP, the Faster Payments Service (FPS) is the standard for near-instant transfers within the UK, available 24/7. 
              Payments are typically sent and received within minutes, even on weekends and bank holidays.`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Debit Card" desc={`CHAPS is a same-day, high-value electronic payment service. 
              Same-day transfer if sent before cut-off. 
              No official upper limit.`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Developer First" desc={`Bacs is a secure UK bank-to-bank transfer processed in three working days (Direct Credit / Direct Debit).`} />
          </div>
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

function Compliance() {
  return (
    <section id="compliance" className="w-full bg-[#122B47] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Security &amp; Compliance</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <InfoCard icon={<IconShield className="w-5 h-5 text-emerald-300" />} title="Custody &amp; Infrastructure" desc="Certified HSMs, segregated funds, fraud monitoring and geo-redundant backups in Switzerland." />
          <InfoCard icon={<IconLock className="w-5 h-5 text-emerald-300" />} title="AML / KYC / KYB / KYT / TR Compliance" desc="Bank-grade AML procedures, sanctions screening and Travel Rule support" />
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

function Footer() {
  return (
    <footer className="w-full border-t border-white/10 backdrop-blur bg-[#0B132B]/90 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-2">
          <div className="h-8"><Logo /></div>
          <p className="text-gray-300">© {new Date().getFullYear()} Helvetia Financial Services &amp; Software SA. All rights reserved.</p>
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
          <div className="font-medium text-white">Company</div>
          <ul className="mt-2 space-y-1 text-gray-300">
             <li><a className="hover:text-white" href="#compliance">Authorization</a></li>
            <li><a className="hover:text-white" href="#compliance">Security</a></li>
            <li><a className="hover:text-white" href="#features">Documentation</a></li>
            <li><a className="hover:text-white" href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-white">Contact</div>
          <ul className="mt-2 space-y-1 text-gray-300">
            <li>Rue Robert-Céard 6</li>
            <li>1204 Geneve</li>
            <li>Switzerland</li>
            <li>support@hfss.ch</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* ====================== Export unico ====================== */
function HomePageInner() {
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

export default function HomePage() {
  return <HomePageInner />;
}
