'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/* ====================== Feature flags ====================== */
const SHOW_DASHBOARD = false; // lascia la funzione intatta ma non la renderizza

/* ====================== Palette (flat dark blue) ====================== */
const BACKGROUND = '#071C2C';   // dark blue piatto per lo sfondo
const ACCENT = '#4FD1C5';
const SURFACE_5 = 'rgba(255,255,255,0.05)';  // pannello leggero su dark
const SURFACE_8 = 'rgba(255,255,255,0.08)';  // pannello un pelo più chiaro

/* ====================== Logo (PNG, fill header height) ====================== */
function Logo() {
  return (
    <div className="flex items-center h-full" aria-label="Helvetia Financial Services logo">
      <Image
        src="/images/Logo.png"
        alt="Helvetia Financial Services"
        width={1200}
        height={450}
        priority
        className="select-none pointer-events-none"
        sizes="(max-width: 768px) 240px, (max-width: 1024px) 300px, 380px"
        style={{ height: '170%', width: 'auto', display: 'block' }}
      />
    </div>
  );
}

/* ====================== Header (altezza fissa + responsive) ====================== */
function Header() {
  // scroll fluido alle sezioni
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-white/10 text-white"
      style={{ backgroundColor: BACKGROUND }} // colore pieno, senza trasparenza
    >
      <div
        className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-hidden"
        style={{ height: 'clamp(56px, 7.5vw, 96px)' }}
      >
        {/* Logo */}
        <div className="h-full flex items-center">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-200 leading-none">
          <a className="hover:text-white cursor-pointer" href="#services">Services</a>
          <a className="hover:text-white cursor-pointer" href="#features">Capabilities</a>
          <a className="hover:text-white cursor-pointer" href="#compliance">Security &amp; Compliance</a>
          <button
            onClick={() => handleScroll('how-to-signup')}
            className="hover:text-white cursor-pointer bg-transparent border-none outline-none text-gray-200 text-sm"
          >
            How to Sign Up
          </button>

          {/* Our Dashboard (invisibile ma non cancellato) */}
          <button
            onClick={() => handleScroll('our-dashboard')}
            className="bg-transparent border-none outline-none text-gray-200 text-sm"
            hidden // lo rende invisibile e non accessibile alla tastiera
            aria-hidden="true"
            tabIndex={-1}
          >
            Our Dashboard
          </button>
        </nav>

        {/* Buttons */}
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
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
function IconShield(props: any) { return (<IconBase {...props}><path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z" /></IconBase>); }
function IconSupport(props: any) { return (<IconBase {...props}><path d="M6 9a6 6 0 1112 0v5a4 4 0 01-4 4H10a4 4 0 01-4-4z" /></IconBase>); }

/* ====================== Sezioni ====================== */
function Hero() {
  return (
    <section
      className="relative overflow-hidden w-full text-white"
      style={{ backgroundColor: BACKGROUND }}
    >
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        {/* Colonna sinistra: testo */}
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white/90">
            <IconSparkles className="w-3 h-3" /> Payments • Crypto • Exchange • Card
          </span>

          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
            Helvetia Financial Services
          </h1>

          {/* elenco servizi con spaziatura uniforme */}
          <div className="mt-6 space-y-3 text-white/80 text-lg max-w-xl">
            <p>SEPA | SEPA Instant | TARGET2</p>
            <p>FPS | CHAPS | BACS</p>
            <p>SWIFT Payments</p>
            <p>Currency Exchange</p>
            <p>Crypto Trading</p>
            <p>Debit Cards</p>
          </div>

          {/* Pulsanti */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup/individual"
              className="px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 text-sm"
            >
              Open Individual Account
            </Link>
            <Link
              href="/signup/business"
              className="px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 text-sm"
            >
              Open Business Account
            </Link>
          </div>

          {/* Info di sicurezza */}
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

        {/* Colonna destra: immagine Supind.png */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
            <Image
              src="/images/Supind.png"
              alt="Helvetia signup illustration"
              width={500}
              height={400}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="w-full border-y border-gray-200 bg-white text-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-6 grid sm:grid-cols-3 gap-4 text-sm text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <IconUptime className="w-4 h-4 text-emerald-500" />
          <span>99.99% platform uptime</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <IconShield className="w-4 h-4 text-emerald-500" />
          <span>Bank-grade security</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <IconApi className="w-4 h-4 text-emerald-500" />
          <span>Modern REST &amp; Webhooks</span>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="w-full text-white" style={{ backgroundColor: BACKGROUND }}>
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
          <ServiceCard icon={<IconCrypto className="w-5 h-5" />} title="Wallet for Crypto" desc={<>Store, Send and Receive<br />Any Crypto • Any Network<br />Real-time status &amp; automated reconciliation</>} />
          <ServiceCard icon={<IconEuro className="w-5 h-5" />} title="Currency Exchange" desc={<>24/7 exchange &amp; conversion<br />Top 10 currencies on the market<br />Real-time status &amp; automated reconciliation</>} />
        </div>
      </div>
    </section>
  );
}
function ServiceCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-white/15" style={{ background: SURFACE_5 }}>
      <div className="flex items-center gap-2 text-white font-medium">{icon} {title}</div>
      <div className="mt-1 text-sm text-white/80">{desc}</div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="w-full text-white" style={{ background: SURFACE_5 }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Capabilities</h2>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="SEPA" desc={`SEPA (Single Euro Payments Area) enables cashless euro payments across Europe as easily as domestic transfers.`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="SEPA INSTANT" desc={`Immediate euro credit transfers 24/7/365 within SEPA.`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="EXPRESS PAYMENT" desc={`Faster-than-standard payments, typically settled within hours.`} />
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Dedicated Crypto Account" desc={`EUR account dedicated to Crypto Trading • On/Off Ramp • Multiple networks.`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Crypto Trading" desc={`All trading activities • On/Off Ramp • Crypto/Crypto • Multiple networks.`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Custodian Wallet" desc={`Secure custody with bank-grade infrastructure.`} />
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Currency Exchange" desc={`24/7 conversion with competitive rates.`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Debit Card" desc={`Instant card issuing and management.`} />
          </div>
          <div className="force-preline">
            <Feature icon={<IconZap className="w-5 h-5" />} title="Developer First" desc={`Modern APIs • Webhooks • Sandbox for rapid integration.`} />
          </div>
        </div>
      </div>
    </section>
  );
}
function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl border border-white/15" style={{ background: SURFACE_8 }}>
      <div className="flex items-center gap-2 text-white font-medium">{icon} {title}</div>
      <div className="mt-1 text-sm text-white/80">{desc}</div>
    </div>
  );
}

function Compliance() {
  return (
    <section id="compliance" className="w-full text-white" style={{ backgroundColor: BACKGROUND }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Security &amp; Compliance</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <InfoCard icon={<IconShield className="w-5 h-5 text-emerald-300" />} title="Custody &amp; Infrastructure" desc="Certified HSMs, segregated funds, fraud monitoring, geo-redundant backups in Switzerland." />
          <InfoCard icon={<IconLock className="w-5 h-5 text-emerald-300" />} title="AML / KYC / KYB / KYT / TR" desc="Bank-grade AML procedures, sanctions screening and Travel Rule support." />
          <InfoCard icon={<IconSupport className="w-5 h-5 text-emerald-300" />} title="Dedicated Support" desc="24/7 assistance via chat and email." />
        </div>
      </div>
    </section>
  );
}
function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/15" style={{ background: SURFACE_5 }}>
      <div className="flex items-center gap-2 text-white font-medium">{icon} {title}</div>
      <div className="mt-2 text-sm text-white/80">{desc}</div>
    </div>
  );
}

/* ====================== Nuovi moduli alternati ====================== */
function HowToSignUp() {
  return (
    <section
      id="how-to-signup"
      className="w-full text-white"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        {/* Titolo */}
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">
          How to Sign Up
        </h2>

        {/* Step 1 */}
        <div className="inline-flex items-center justify-center text-sm md:text-base font-semibold px-4 py-2 rounded-full border border-white/30 bg-white/10 text-white mb-8">
          Step 1
        </div>

        {/* Doppia label */}
        <div className="w-full flex flex-col md:flex-row items-stretch gap-4 mb-6">
          <div className="w-full md:w-1/2 h-[60px] flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-4 text-sm leading-snug text-center">
            Helvetia Financial Services only onboards Individual User with residence in
            Switzerland or European Union Countries
          </div>
          <div className="w-full md:w-1/2 h-[60px] flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-4 text-sm leading-snug text-center">
            Helvetia Financial Services only onboards Business User with registered office in
            Switzerland or European Union Countries
          </div>
        </div>

        {/* Testo intermedio */}
        <div className="text-base md:text-lg font-medium text-white/90 mb-10">
          Fill up all fields
        </div>

        {/* Container immagini Step 1 */}
        <div className="w-full flex flex-col md:flex-row items-start gap-6 mb-12">
          {/* Individual */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
              <Image
                src="/images/Supind.png"
                alt="How to sign up — Individual account"
                width={500}
                height={300}
                className="object-contain h-full w-auto"
                priority
              />
            </div>
          </div>

          {/* Business */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
              <Image
                src="/images/Supbus.png"
                alt="How to sign up — Business account"
                width={500}
                height={300}
                className="object-contain h-full w-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* Step 2–5 */}
        <div className="w-full flex flex-col md:flex-row items-start gap-6 mb-12">
          {/* Colonna sinistra (Step 2 + Step 4) */}
          <div className="w-full md:w-1/2 text-left flex flex-col gap-10">
            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center text-sm md:text-base font-semibold px-4 py-2 rounded-full border border-white/30 bg-white/10 text-white">
                  Step 2
                </div>
                <div className="text-sm md:text-base font-medium text-white/90">
                  Verify your Mobile Number
                </div>
              </div>

              <div className="w-full h-[300px] rounded-2xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center p-4">
                <Image
                  src="/images/VerifyInd.png"
                  alt="Verification step — Individual"
                  width={500}
                  height={300}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center text-sm md:text-base font-semibold px-4 py-2 rounded-full border border-white/30 bg-white/10 text-white">
                  Step 4
                </div>
                <div className="text-sm md:text-base font-medium text-white/90">
                  Create Account
                </div>
              </div>

              <div className="w-full h-[300px] rounded-2xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center p-4">
                <Image
                  src="/images/CreateAccount.png"
                  alt="Create account step"
                  width={500}
                  height={300}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Colonna destra (Step 3 + Step 5) */}
          <div className="w-full md:w-1/2 text-left flex flex-col gap-10">
            {/* Step 3 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center text-sm md:text-base font-semibold px-4 py-2 rounded-full border border-white/30 bg-white/10 text-white">
                  Step 3
                </div>
                <div className="text-sm md:text-base font-medium text-white/90">
                  Verify your Email Address
                </div>
              </div>

              <div className="w-full h-[300px] rounded-2xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center p-4">
                <Image
                  src="/images/VerifyBus.png"
                  alt="Verification step — Business"
                  width={500}
                  height={300}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
            </div>

            {/* Step 5 (Summary) */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center text-sm md:text-base font-semibold px-4 py-2 rounded-full border border-white/30 bg-white/10 text-white">
                  Step 5
                </div>
                <div className="text-sm md:text-base font-medium text-white/90">
                  Summary
                </div>
              </div>

              <div className="w-full h-[300px] rounded-2xl border border-white/15 bg-white/5 overflow-hidden flex items-center justify-center p-4">
                <Image
                  src="/images/Summary.png"
                  alt="Summary step"
                  width={500}
                  height={300}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA (pulsanti) */}
        <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-6">
          <Link
            href="/signup/individual"
            className="w-full md:w-1/2 px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 text-sm text-center"
          >
            Open Individual Account
          </Link>
          <Link
            href="/signup/business"
            className="w-full md:w-1/2 px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 text-sm text-center"
          >
            Open Business Account
          </Link>
        </div>
      </div>
    </section>
  );
}












/* ====== OurDashboard TENUTA MA NON RENDERIZZATA (invisibile) ====== */
function OurDashboard() {
  return (
    <section
      id="our-dashboard"
      className="w-full text-white"
      style={{ backgroundColor: BACKGROUND }}
    >
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-10">Our Dashboard</h2>

        {/* Griglia 3x2 di immagini */}
        <div className="grid md:grid-cols-3 gap-8 justify-items-center">
          {/* Dash1 */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
            <Image
              src="/images/Dash1.png"
              alt="Dashboard preview 1"
              width={500}
              height={300}
              className="object-contain"
              priority
            />
          </div>

          {/* Dash2 */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
            <Image
              src="/images/Dash2.png"
              alt="Dashboard preview 2"
              width={500}
              height={300}
              className="object-contain"
              priority
            />
          </div>

          {/* Dash3 */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
            <Image
              src="/images/Dash3.png"
              alt="Dashboard preview 3"
              width={500}
              height={300}
              className="object-contain"
              priority
            />
          </div>

          {/* Dash4 */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
            <Image
              src="/images/Dash4.png"
              alt="Dashboard preview 4"
              width={500}
              height={300}
              className="object-contain"
              priority
            />
          </div>

          {/* Dash5 */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
            <Image
              src="/images/Dash5.png"
              alt="Dashboard preview 5"
              width={500}
              height={300}
              className="object-contain"
              priority
            />
          </div>

          {/* Dash6 */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center p-4">
            <Image
              src="/images/Dash6.png"
              alt="Dashboard preview 6"
              width={500}
              height={300}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}


/* ====================== Footer ====================== */
function Footer() {
  return (
    <footer className="w-full border-t border-white/10 backdrop-blur text-gray-200" style={{ backgroundColor: BACKGROUND + 'E6' }}>
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
  // email non più usata (abbiamo rimosso la CTA), la lascio se vorrai riutilizzarla
  const [email] = useState('');

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: BACKGROUND }}>
      <Header />
      <Hero />
      <TrustBar />
      <Services />
      <Features />
      <Compliance />
      {/* Nuovi moduli a colori alternati */}
      <HowToSignUp />

      {/* OurDashboard non renderizzato quando SHOW_DASHBOARD === false */}
      {SHOW_DASHBOARD && <OurDashboard />}

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return <HomePageInner />;
}
