import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REGION = process.env.AWS_REGION || 'eu-central-1';
const SECRET_ID = process.env.DB_SECRET_ID || 'hffs-app-sqlserver';

let pool: sql.ConnectionPool | null = null;
let secretCache:
  | { host: string; port: number; username: string; password: string; database: string }
  | null = null;
let smClient: SecretsManagerClient | null = null;

// E.164: +[1-9][0-9]{6,14}
function isE164(v: unknown): v is string {
  return typeof v === 'string' && /^\+[1-9]\d{6,14}$/.test(v);
}

async function getSecretCfg() {
  if (secretCache) return secretCache;
  if (!smClient) smClient = new SecretsManagerClient({ region: REGION });

  const out = await smClient.send(new GetSecretValueCommand({ SecretId: SECRET_ID }));
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
    port: cfg.port,
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
    const { mobileE164 } = await req.json().catch(() => ({}));
    if (!isE164(mobileE164)) {
      return NextResponse.json({ error: 'Invalid mobile format (E.164 required)' }, { status: 400 });
    }

    const p = await getPool();
    const request = p.request();
    request.input('mobile', sql.NVarChar(16), mobileE164);
    // opzionale: timeout ms lato driver
    // @ts-ignore
    request.timeout = 5000;

    const r = await request.query(`
      SELECT TOP 1 1
      FROM dbo.IdUser
      WHERE MobileE164 = @mobile
    `);

    const exists = r.recordset.length > 0;
    return NextResponse.json({ available: !exists }, { status: 200 });
  } catch (err: any) {
    const msg = (err && typeof err.message === 'string') ? err.message : 'Service unavailable';
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
