'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getStoredUser } from '@/lib/authUser'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'

const ACCENT = '#4FD1C5'
const BACKGROUND = '#071C2C'

const CRYPTO_SUBMENU = [
  { label: 'Market', href: '/dashboard/crypto/market' },
  { label: 'Trading', href: '/dashboard/crypto/trading' },
  { label: 'Wallet', href: '/dashboard/crypto/wallet' },
  { label: 'Whitelist Wallet', href: '/dashboard/crypto/whitelist-wallet' },
  { label: 'Transaction', href: '/dashboard/crypto/transaction' },
]

type PairMode = 'EUR_CRYPTO' | 'CRYPTO_CRYPTO'

type PairOption = {
  value: string
  label: string
  krakenPair: string
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y'

type CandlePoint = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

type LinePoint = {
  time: string
  close: number
}

// 10 EUR/CRYPTO pairs (label BTC, internal XBT)
const EUR_CRYPTO_OPTIONS: PairOption[] = [
  { value: 'BTC_EUR', label: 'EUR / BTC', krakenPair: 'BTC/EUR' },
  { value: 'ETH_EUR', label: 'EUR / ETH', krakenPair: 'ETH/EUR' },
  { value: 'USDT_EUR', label: 'EUR / USDT', krakenPair: 'USDT/EUR' },
  { value: 'XRP_EUR', label: 'EUR / XRP', krakenPair: 'XRP/EUR' },
  { value: 'ADA_EUR', label: 'EUR / ADA', krakenPair: 'ADA/EUR' },
  { value: 'SOL_EUR', label: 'EUR / SOL', krakenPair: 'SOL/EUR' },
  { value: 'DOGE_EUR', label: 'EUR / DOGE', krakenPair: 'DOGE/EUR' },
  { value: 'LTC_EUR', label: 'EUR / LTC', krakenPair: 'LTC/EUR' },
  { value: 'DOT_EUR', label: 'EUR / DOT', krakenPair: 'DOT/EUR' },
  { value: 'LINK_EUR', label: 'EUR / LINK', krakenPair: 'LINK/EUR' },
]

// 10 CRYPTO/CRYPTO pairs (BTC label, XBT internal)
const CRYPTO_CRYPTO_OPTIONS: PairOption[] = [
  { value: 'BTC_USDT', label: 'BTC / USDT', krakenPair: 'BTC/USDT' },
  { value: 'ETH_USDT', label: 'ETH / USDT', krakenPair: 'ETH/USDT' },
  { value: 'SOL_USDT', label: 'SOL / USDT', krakenPair: 'SOL/USDT' },
  { value: 'XRP_USDT', label: 'XRP / USDT', krakenPair: 'XRP/USDT' },
  { value: 'ADA_USDT', label: 'ADA / USDT', krakenPair: 'ADA/USDT' },
  { value: 'DOGE_USDT', label: 'DOGE / USDT', krakenPair: 'DOGE/USDT' },
  { value: 'LTC_USDT', label: 'LTC / USDT', krakenPair: 'LTC/USDT' },
  { value: 'DOT_USDT', label: 'DOT / USDT', krakenPair: 'DOT/USDT' },
  { value: 'LINK_USDT', label: 'LINK / USDT', krakenPair: 'LINK/USDT' },
  { value: 'BTC_ETH', label: 'BTC / ETH', krakenPair: 'XBT/ETH' },
]

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
]

const TIMEFRAME_CONFIG: Record<
  Timeframe,
  { interval: number; maxPoints: number }
> = {
  '1D': { interval: 5, maxPoints: 288 },
  '1W': { interval: 30, maxPoints: 336 },
  '1M': { interval: 240, maxPoints: 180 },
  '3M': { interval: 1440, maxPoints: 90 },
  '6M': { interval: 1440, maxPoints: 180 },
  '1Y': { interval: 1440, maxPoints: 365 },
}

const formatDateTimeClock = (d: Date) => {
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  const ss = d.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

const formatFullDateTime = (unixSeconds: number) => {
  const d = new Date(unixSeconds * 1000)
  const dd = d.getDate().toString().padStart(2, '0')
  const mo = (d.getMonth() + 1).toString().padStart(2, '0')
  const yy = d.getFullYear()
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  const ss = d.getSeconds().toString().padStart(2, '0')
  return `${dd}/${mo}/${yy} ${hh}:${mm}:${ss}`
}

const formatTimeLabel = (unixSeconds: number, tf: Timeframe) => {
  const d = new Date(unixSeconds * 1000)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  const dd = d.getDate().toString().padStart(2, '0')
  const mo = (d.getMonth() + 1).toString().padStart(2, '0')

  if (tf === '1D' || tf === '1W') return `${hh}:${mm}`
  return `${dd}/${mo}`
}

function downsample<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data
  const out: T[] = []
  const step = Math.ceil(data.length / maxPoints)
  for (let i = 0; i < data.length; i += step) {
    out.push(data[i])
  }
  if (out[out.length - 1] !== data[data.length - 1]) {
    out.push(data[data.length - 1])
  }
  return out
}

/* =========
   Line / area chart with median lines + tooltip
   ========= */
function PriceLineChart({
  candles,
  timeframe,
}: {
  candles: CandlePoint[]
  timeframe: Timeframe
}) {
  if (!candles.length) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        No data available.
      </div>
    )
  }

  const sampled = downsample(candles, 200)

  const lineData: LinePoint[] = sampled.map((c) => ({
    time: formatTimeLabel(c.time, timeframe),
    close: c.close,
  }))

  const closes = sampled.map((c) => c.close)
  const minClose = Math.min(...closes)
  const maxClose = Math.max(...closes)
  const midClose = (minClose + maxClose) / 2

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: '#CBD5F5' }}
          tickMargin={6}
        />
        <YAxis
          domain={[minClose, maxClose]} // dinamico: min in basso, max in alto
          tick={{ fontSize: 11, fill: '#CBD5F5' }}
          tickFormatter={(v) => Number(v).toFixed(4)}
          width={90}
        />

        {/* median lines: only colored, no numeric label */}
        <ReferenceLine
          y={maxClose}
          stroke="#f97373"        // high - red
          strokeDasharray="3 3"
        />
        <ReferenceLine
          y={midClose}
          stroke="#e5e7eb"        // mid - light grey
          strokeDasharray="3 3"
        />
        <ReferenceLine
          y={minClose}
          stroke="#4ade80"        // low - green
          strokeDasharray="3 3"
        />

        <Tooltip
          contentStyle={{
            backgroundColor: '#020617',
            border: '1px solid rgba(148,163,184,0.4)',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: '#E5E7EB' }}
          formatter={(value) => [
            Number(value as number).toFixed(8), // 8 decimali
            'Close',
          ]}
        />

        <Line
          type="monotone"
          dataKey="close"
          stroke={ACCENT}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/* =========
   Main page
   ========= */
export default function CryptoMarketPage() {
  const router = useRouter()
  const pathname = usePathname()

  const [pairMode, setPairMode] = useState<PairMode>('EUR_CRYPTO')
  const [selectedPair, setSelectedPair] = useState<string>(
    EUR_CRYPTO_OPTIONS[0].value,
  )
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')

  const [candles, setCandles] = useState<CandlePoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [blink, setBlink] = useState(false)

  // auth guard
  useEffect(() => {
    const u = getStoredUser()
    if (!u) router.replace('/login')
  }, [router])

  const currentOptions = useMemo<PairOption[]>(() => {
    return pairMode === 'EUR_CRYPTO'
      ? EUR_CRYPTO_OPTIONS
      : CRYPTO_CRYPTO_OPTIONS
  }, [pairMode])

  const selectedOption = useMemo<PairOption | undefined>(() => {
    if (!currentOptions.length) return undefined
    return (
      currentOptions.find((o) => o.value === selectedPair) ||
      currentOptions[0]
    )
  }, [currentOptions, selectedPair])

  const krakenPair = selectedOption?.krakenPair ?? ''

  // fetch OHLC every 5 seconds
  useEffect(() => {
    if (!krakenPair) return

    let cancel = false

    const { interval, maxPoints } = TIMEFRAME_CONFIG[timeframe]

    const fetchData = async () => {
      try {
        setBlink(true)
        setIsLoading(true)

        const url = `https://api.kraken.com/0/public/OHLC?pair=${encodeURIComponent(
          krakenPair,
        )}&interval=${interval}`

        const res = await fetch(url)
        if (!res.ok) throw new Error('Bad response')

        const json = await res.json()
        if (json.error?.length) throw new Error('API error')

        const key = Object.keys(json.result).find((k) => k !== 'last')
        if (!key) throw new Error('No OHLC key')

        const ohlc: any[] = json.result[key].slice(-maxPoints)

        const mapped: CandlePoint[] = ohlc.map((row: any[]) => ({
          time: Number(row[0]),
          open: Number(row[1]),
          high: Number(row[2]),
          low: Number(row[3]),
          close: Number(row[4]),
        }))

        if (!cancel) {
          setCandles(mapped)
          setLastUpdated(new Date())
          setHasError(false)
          setIsLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (!cancel) {
          setHasError(true)
          setIsLoading(false)
        }
      } finally {
        setTimeout(() => {
          if (!cancel) setBlink(false)
        }, 400)
      }
    }

    fetchData()
    const id = setInterval(fetchData, 5000) // ⬅️ ogni 5 secondi

    return () => {
      cancel = true
      clearInterval(id)
    }
  }, [krakenPair, timeframe])

  const last = candles.length ? candles[candles.length - 1] : null

  return (
    <>
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-50">Crypto</h1>
        <p className="text-sm text-slate-300">
          Analyze price movements and trends over your selected period.
        </p>
      </div>

      {/* Submenu */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {CRYPTO_SUBMENU.map((item) => {
          const active = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="text-sm px-3 py-1.5 rounded-xl transition"
              style={
                active
                  ? { backgroundColor: ACCENT, color: BACKGROUND }
                  : { color: 'rgba(226,232,240,0.9)' }
              }
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Main card */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold mb-1 text-slate-100">
              Market overview
            </h2>
            <p className="text-xs text-slate-300">
              Line chart of the closing price. Y-axis is automatically fitted
              to the selected period.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  hasError
                    ? 'bg-red-500'
                    : blink
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-slate-300">
                {hasError
                  ? 'Error loading data'
                  : isLoading
                  ? 'Updating...'
                  : 'Live'}
              </span>
            </div>
            <div className="text-slate-400">
              Updated:{' '}
              <span className="text-slate-200">
                {lastUpdated ? formatDateTimeClock(lastUpdated) : '--:--:--'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          {/* Pair type (vertical radios) */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-200">
              Pair type
            </span>
            <div className="flex flex-col gap-2 text-xs">
              <label className="flex gap-2 items-center cursor-pointer">
                <input
                  type="radio"
                  name="pairType"
                  checked={pairMode === 'EUR_CRYPTO'}
                  onChange={() => {
                    setPairMode('EUR_CRYPTO')
                    setSelectedPair(EUR_CRYPTO_OPTIONS[0].value)
                  }}
                  className="h-3 w-3 accent-teal-400"
                />
                <span className="text-slate-200">EUR / Crypto</span>
              </label>
              <label className="flex gap-2 items-center cursor-pointer">
                <input
                  type="radio"
                  name="pairType"
                  checked={pairMode === 'CRYPTO_CRYPTO'}
                  onChange={() => {
                    setPairMode('CRYPTO_CRYPTO')
                    setSelectedPair(CRYPTO_CRYPTO_OPTIONS[0].value)
                  }}
                  className="h-3 w-3 accent-teal-400"
                />
                <span className="text-slate-200">Crypto / Crypto</span>
              </label>
            </div>
          </div>

          {/* Pair dropdown */}
          <div className="flex flex-col gap-2 md:min-w-[220px]">
            <span className="text-xs font-semibold text-slate-200">Pair</span>
            <select
              className="text-xs rounded-xl bg-slate-900/60 border border-white/15 px-3 py-2 text-slate-100 outline-none focus:outline-none"
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
            >
              {currentOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframes 3x2 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-200">
              Timeframe
            </span>
            <div className="grid grid-cols-3 gap-2">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                    timeframe === tf.value
                      ? 'bg-teal-400 text-slate-900 border-transparent'
                      : 'bg-slate-900/40 text-slate-200 border-white/15 hover:border-teal-400/60'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="flex-1 flex items-center lg:justify-end">
            {last && selectedOption && (
              <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-xs flex flex-col gap-1 min-w-[220px]">
                <span className="text-slate-400">Selected pair</span>
                <span className="text-slate-100 font-semibold">
                  {selectedOption.label}
                </span>
                <span className="text-slate-400">
                  Last close:{' '}
                  <span className="text-teal-300 font-semibold">
                    {last.close.toFixed(8)}
                  </span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Last candle: {formatFullDateTime(last.time)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
          {isLoading && !candles.length ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading chart...
            </div>
          ) : hasError ? (
            <div className="h-full flex items-center justify-center text-xs text-red-400">
              Error loading price data.
            </div>
          ) : (
            <PriceLineChart candles={candles} timeframe={timeframe} />
          )}
        </div>

        <p className="text-[11px] text-slate-400">
          * Values refresh every few seconds for a near real-time perspective.
        </p>
      </section>
    </>
  )
}
