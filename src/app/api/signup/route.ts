// src/app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import argon2 from 'argon2';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REGION = process.env.AWS_REGION || 'eu-central-1';
const SECRET_ID = process.env.DB_SECRET_ID || 'hffs-app-sqlserver';

let pool: sql.ConnectionPool | null = null;
let secretCache: { host: string; port?: number; username: string; password: string; database: string } | null = null;

type SignupBody = {
  firstName: string;
  lastName: string;
  country: string;          // Nome Paese (es. "Italy")
  mobileCountry: string;    // non usato qui, arriva dal client
  dialCode: string;         // es. "39", "41"
  phone: string;            // raw digits dal form
  email: string;
  password: string;
  type?: string;            // "individual"
};

function isIso2(v: unknown) {
  return typeof v === 'string' && /^[A-Z]{2}$/i.test(v);
}
function isEmail(v: unknown) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function toE169(dialCode: string, raw: string) {
  const dc = String(dialCode || '').replace(/\D/g, '');
  const digits = String(raw || '').replace(/\D/g, '');
  if (!dc || digits.length < 5) return null;
  const e = `+${dc}${digits}`;
  return e.length <= 16 ? e : null; // MobileE169 NVARCHAR(16)
}

async function getSecretCfg() {
  if (secretCache) return secretCache;
  const sm = new SecretsManagerClient({ region: REGION });
  const out = await sm.send(new GetSecretValueCommand({ SecretId: SECRET_ID }));
  if (!out.SecretString) throw new Error('Missing DB secret payload');
  const s = JSON.parse(out.SecretString);
  secretCache = {
    host: s.host,
    port: Number(s.port || 1433),
    username: s.username,
    password: s.password,
    database: s.database || 'hffs_app',
  };
  return secretCache;
}

async function getPool() {
  if (pool) return pool;
  const cfg = await getSecretCfg();
  pool = await new sql.ConnectionPool({
    server: cfg.host,
    port: cfg.port ?? 1433,
    user: cfg.username,
    password: cfg.password,
    database: cfg.database,
    options: { encrypt: true, trustServerCertificate: false },
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
  }).connect();
  return pool;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SignupBody>;

    // --- Validazioni minime server-side ---
    const firstName = (body.firstName || '').trim();
    const lastName  = (body.lastName  || '').trim();
    const country   = (body.country   || '').trim();            // nome paese (NVARCHAR(50))
    const country2  = (body.mobileCountry || '').trim().toUpperCase() || (body.country || '').trim().toUpperCase(); // fallback
    const dialCode  = (body.dialCode  || '').trim();
    const phoneRaw  = (body.phone     || '').trim();
    const emailRaw  = (body.email     || '').trim().toLowerCase();
    const password  = body.password || '';

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (!country) {
      return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
    }
    if (!isIso2(country2)) {
      return NextResponse.json({ error: 'Invalid country code' }, { status: 400 });
    }
    if (!isEmail(emailRaw)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Weak password' }, { status: 400 });
    }

    const mobileE169 = toE169(dialCode, phoneRaw);
    if (!mobileE169) {
      return NextResponse.json({ error: 'Invalid mobile format' }, { status: 400 });
    }

    // --- Hash password (Argon2id) ---
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    if (passwordHash.length > 200) {
      // molto improbabile, ma rispettiamo NVARCHAR(200)
      return NextResponse.json({ error: 'Password hash too long' }, { status: 400 });
    }

    // --- LoginUsername: usiamo l'email (lowercase) per garantire unicità ---
    const loginUsername = emailRaw;

    // --- INSERT parametrizzata nella tabella aggiornata ---
    const p = await getPool();
    await p.request()
      .input('LoginUsername', sql.NVarChar(100), loginUsername)
      .input('Email',         sql.NVarChar(320), emailRaw)
      .input('PasswordHash',  sql.NVarChar(200), passwordHash)
      // CreatedDate: default SYSDATETIME() in tabella → non lo settiamo
      .input('Country',       sql.NVarChar(50),  country)
      .input('Country2',      sql.NVarChar(2),   country2)
      .input('MobileE169',    sql.NVarChar(16),  mobileE169)
      .query(`
        INSERT INTO dbo.IdUser (
          LoginUsername,
          Email,
          PasswordHash,
          Country,
          Country2,
          MobileE169
          -- CreatedDate ha default: SYSDATETIME()
        )
        VALUES (
          @LoginUsername,
          @Email,
          @PasswordHash,
          @Country,
          @Country2,
          @MobileE169
        );
      `);

    return NextResponse.json({ ok: true }, { status: 201 });

  } catch (e: any) {
    // 2627/2601 = unique violation su Email / MobileE169 / LoginUsername
    if (e?.number === 2627 || e?.number === 2601) {
      return NextResponse.json({ error: 'Conflict' }, { status: 409 });
    }
    console.error('signup insert error:', { name: e?.name, code: e?.code, number: e?.number, message: e?.message });
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
