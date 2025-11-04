import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REGION = process.env.AWS_REGION || 'eu-central-1';
const SECRET_ID = process.env.DB_SECRET_ID || 'hffs-app-sqlserver';

let pool: sql.ConnectionPool | null = null;
let secretCache: any = null;

function isE169(v: unknown): v is string {
  return typeof v === 'string' && /^\+\d{6,15}$/.test(v); // formato E.164/E.169 usato in colonna NVARCHAR(16)
}

async function getSecretCfg() {
  if (secretCache) return secretCache;
  const sm = new SecretsManagerClient({ region: REGION });
  const out = await sm.send(new GetSecretValueCommand({ SecretId: SECRET_ID }));
  if (!out.SecretString) throw new Error('Missing DB secret payload');
  const s = JSON.parse(out.SecretString);
  secretCache = {
    host: s.host, port: Number(s.port || 1433), username: s.username, password: s.password,
    database: s.database || 'hffs_app',
  };
  return secretCache;
}

async function getPool() {
  if (pool) return pool;
  const cfg = await getSecretCfg();
  pool = await new sql.ConnectionPool({
    server: cfg.host,
    port: cfg.port, user: cfg.username, password: cfg.password, database: cfg.database,
    options: { encrypt: true, trustServerCertificate: false },
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
  }).connect();
  return pool;
}

export async function POST(req: NextRequest) {
  try {
    const { mobileE164 } = await req.json().catch(() => ({}));
    if (!isE169(mobileE164)) {
      return NextResponse.json({ error: 'Invalid mobile format' }, { status: 400 });
    }

    const p = await getPool();
    const r = await p.request()
      .input('mobile', sql.NVarChar(16), mobileE164 as string)
      .query(`
        SELECT TOP 1 1
        FROM dbo.IdUser WITH (NOLOCK)
        WHERE MobileE169 = @mobile
      `);

    const exists = r.recordset.length > 0;
    return NextResponse.json({ available: !exists }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
