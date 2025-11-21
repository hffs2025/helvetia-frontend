// src/lib/fireblocks.ts
import { Fireblocks, BasePath } from '@fireblocks/ts-sdk'

let cachedClient: Fireblocks | null = null

export function getFireblocksClient(): Fireblocks {
  if (cachedClient) return cachedClient

  const apiKey = process.env.FIREBLOCKS_API_KEY
  const secretKeyRaw = process.env.FIREBLOCKS_SECRET_KEY
  const basePathEnv = process.env.FIREBLOCKS_BASE_PATH || 'sandbox'

  if (!apiKey || !secretKeyRaw) {
    throw new Error('FIREBLOCKS_API_KEY o FIREBLOCKS_SECRET_KEY mancanti')
  }

  const secretKey = secretKeyRaw.split(String.raw`\n`).join('\n')

  const basePathMap: Record<string, BasePath> = {
    sandbox: BasePath.Sandbox,
    us: BasePath.US,
    eu: BasePath.EU,
    eu2: BasePath.EU2,
  }

  const basePath = basePathMap[basePathEnv] ?? BasePath.Sandbox

  cachedClient = new Fireblocks({
    apiKey,
    secretKey,
    basePath,
  })

  return cachedClient
}
