'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getStoredUser } from '@/lib/authUser'

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
type Side = 'buy' | 'sell'

type PairOption = {
  value: string
  label: string
  krakenPair: string
}

type OrderBookRow = {
  price: number
  volume: number
}

type OrderBookState = {
  bids: OrderBookRow[]
  asks: OrderBookRow[]
}

const formatClock = (d: Date) => {
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  const ss = d.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

// ===== PAIRS =====

// 10 EUR/CRYPTO pairs – BTC uses BTC/EUR
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

// 10 CRYPTO/CRYPTO pairs – BTC uses BTC/*
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
  { value: 'BTC_ETH', label: 'BTC / ETH', krakenPair: 'BTC/ETH' },
]

// ===== ORDER BOOK COMPONENT =====

function OrderBookBookLike({
  orderBook,
}: {
  orderBook: OrderBookState | null
}) {
  if (!orderBook || (!orderBook.bids.length && !orderBook.asks.length)) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        No order book data available.
      </div>
    )
  }

  const maxRows = 14 // 7 asks + 7 bids
  const sortedAsks = [...orderBook.asks].sort((a, b) => a.price - b.price)
  const sortedBids = [...orderBook.bids].sort((a, b) => b.price - a.price)

  const asks = sortedAsks.slice(0, maxRows / 2)
  const bids = sortedBids.slice(0, maxRows / 2)

  const bestAsk = asks[0]?.price ?? null
  const bestBid = bids[0]?.price ?? null
  const spread =
    bestAsk != null && bestBid != null ? bestAsk - bestBid : null
  const spreadPct =
    spread != null && bestAsk !== 0 ? (spread / bestAsk) * 100 : null

  const maxAskVol = Math.max(...asks.map((a) => a.volume), 1)
  const maxBidVol = Math.max(...bids.map((b) => b.volume), 1)

  return (
    <div className="flex flex-col h-full text-xs">
      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
        <span>Price</span>
        <span>Quantity</span>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
        {/* ASKS (red) */}
        <div className="flex-1 flex flex-col-reverse gap-0.5">
          {asks.map((row, idx) => {
            const intensity = Math.min(row.volume / maxAskVol, 1)
            const bg = `rgba(248,113,113,${0.15 + intensity * 0.5})`
            return (
              <div
                key={`ask-${idx}-${row.price}`}
                className="flex justify-between px-2 py-0.5 rounded-sm"
                style={{ backgroundColor: bg }}
              >
                <span className="text-red-300">
                  {row.price.toLocaleString('en-US', {
                    maximumFractionDigits: 8,
                  })}
                </span>
                <span className="text-slate-100">
                  {row.volume.toLocaleString('en-US', {
                    maximumFractionDigits: 4,
                  })}
                </span>
              </div>
            )
          })}
        </div>

        {/* SPREAD ROW */}
        <div className="flex justify-between items-center px-2 py-1 text-[10px] text-slate-300">
          {spread != null && spreadPct != null ? (
            <>
              <span>Spread</span>
              <span>
                {spread.toFixed(8)} ({spreadPct.toFixed(4)}%)
              </span>
            </>
          ) : (
            <span className="mx-auto text-slate-500">
              Spread not available
            </span>
          )}
        </div>

        {/* BIDS (green) */}
        <div className="flex-1 flex flex-col gap-0.5">
          {bids.map((row, idx) => {
            const intensity = Math.min(row.volume / maxBidVol, 1)
            const bg = `rgba(16,185,129,${0.15 + intensity * 0.5})`
            return (
              <div
                key={`bid-${idx}-${row.price}`}
                className="flex justify-between px-2 py-0.5 rounded-sm"
                style={{ backgroundColor: bg }}
              >
                <span className="text-emerald-300">
                  {row.price.toLocaleString('en-US', {
                    maximumFractionDigits: 8,
                  })}
                </span>
                <span className="text-slate-100">
                  {row.volume.toLocaleString('en-US', {
                    maximumFractionDigits: 4,
                  })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ===== MAIN PAGE =====

export default function CryptoTradingPage() {
  const router = useRouter()
  const pathname = usePathname()

  const [pairMode, setPairMode] = useState<PairMode>('EUR_CRYPTO')
  const [selectedPair, setSelectedPair] = useState(EUR_CRYPTO_OPTIONS[0].value)
  const [side, setSide] = useState<Side>('buy')

  // Amount input (quote currency)
  const [quoteAmount, setQuoteAmount] = useState<string>('')

  // Available balances (placeholder, you can wire to real data)
  const [quoteBalance] = useState<number>(0)
  const [baseBalance] = useState<number>(0)

  const [lastPrice, setLastPrice] = useState<number | null>(null)
  const [orderBook, setOrderBook] = useState<OrderBookState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [blink, setBlink] = useState(false)

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

  // derive quote/base symbols from label (e.g. "EUR / BTC")
  const [quoteSymbol, baseSymbol] = useMemo(() => {
    const label = selectedOption?.label ?? ''
    const parts = label.split('/').map((p) => p.trim())
    if (parts.length === 2) {
      return [parts[0], parts[1]]
    }
    return ['', '']
  }, [selectedOption])

  // mid / buy / sell with 40 pips spread
  const { midPrice, buyPrice, sellPrice } = useMemo(() => {
    if (lastPrice == null) {
      return { midPrice: null, buyPrice: null, sellPrice: null }
    }
    const pipSize = 0.0001
    const totalSpread = 40 * pipSize
    const halfSpread = totalSpread / 2
    const mid = lastPrice
    const buy = mid + halfSpread
    const sell = mid - halfSpread
    return { midPrice: mid, buyPrice: buy, sellPrice: sell }
  }, [lastPrice])

  // effective price used for quantity (price - 1%)
  const effectivePriceForQty =
    (() => {
      const basePrice =
        side === 'buy' ? buyPrice ?? null : sellPrice ?? null
      if (basePrice == null) return null
      return basePrice * 0.99 // price - 1%
    })()

  const parsedQuoteAmount = parseFloat(quoteAmount.replace(',', '.'))
  const isAmountValid =
    !Number.isNaN(parsedQuoteAmount) && parsedQuoteAmount > 0

  // quantity in base currency, computed on (buy/sell price - 1%)
  const baseQuantity =
    isAmountValid && effectivePriceForQty
      ? parsedQuoteAmount / effectivePriceForQty
      : null

  // fetch ticker + depth every 5 seconds
  useEffect(() => {
    if (!krakenPair) return

    let cancel = false

    const fetchData = async () => {
      try {
        setBlink(true)
        setIsLoading(true)
        setHasError(false)

        const [tickerRes, depthRes] = await Promise.all([
          fetch(
            `https://api.kraken.com/0/public/Ticker?pair=${encodeURIComponent(
              krakenPair,
            )}`,
          ).catch((e) => {
            console.error('Ticker fetch failed', e)
            return null
          }),
          fetch(
            `https://api.kraken.com/0/public/Depth?pair=${encodeURIComponent(
              krakenPair,
            )}&count=25`,
          ).catch((e) => {
            console.error('Depth fetch failed', e)
            return null
          }),
        ])

        if (cancel) return

        if (!tickerRes || !tickerRes.ok || !depthRes || !depthRes.ok) {
          setHasError(true)
          setIsLoading(false)
          return
        }

        const [tickerJson, depthJson] = await Promise.all([
          tickerRes.json(),
          depthRes.json(),
        ])

        if (tickerJson.error?.length || depthJson.error?.length) {
          console.error('API error', {
            tickerError: tickerJson.error,
            depthError: depthJson.error,
          })
          setHasError(true)
          setIsLoading(false)
          return
        }

        const tickerKey = Object.keys(tickerJson.result || {})[0]
        const depthKey = Object.keys(depthJson.result || {})[0]

        if (!tickerKey || !depthKey) {
          setHasError(true)
          setIsLoading(false)
          return
        }

        const rawLast = tickerJson.result[tickerKey]?.c?.[0]
        const last = parseFloat(rawLast)
        if (!Number.isFinite(last)) {
          console.error('Invalid last price', rawLast)
          setHasError(true)
          setIsLoading(false)
          return
        }

        const rawDepth = depthJson.result[depthKey]
        const bidsRaw: any[] = rawDepth.bids ?? []
        const asksRaw: any[] = rawDepth.asks ?? []

        const bids: OrderBookRow[] = bidsRaw.map((row) => ({
          price: Number(row[0]),
          volume: Number(row[1]),
        }))
        const asks: OrderBookRow[] = asksRaw.map((row) => ({
          price: Number(row[0]),
          volume: Number(row[1]),
        }))

        if (!cancel) {
          setLastPrice(last)
          setOrderBook({ bids, asks })
          setLastUpdated(new Date())
          setIsLoading(false)
          setHasError(false)
        }
      } catch (err) {
        console.error('Trading fetch error', err)
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
    const id = setInterval(fetchData, 5000)

    return () => {
      cancel = true
      clearInterval(id)
    }
  }, [krakenPair])

  const handleMaxQuote = () => {
    // use 100% of quote balance
    setQuoteAmount(quoteBalance ? quoteBalance.toFixed(8) : '')
  }

  const handleSubmit = () => {
    if (!isAmountValid || !effectivePriceForQty || baseQuantity == null) return
    console.log('Submit order (simulation)', {
      side,
      pair: selectedOption?.label,
      quoteAmount: parsedQuoteAmount,
      priceUsed: effectivePriceForQty,
      baseQuantity,
    })
    // here you will call your backend
  }

  return (
    <>
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-50">Crypto</h1>
        <p className="text-sm text-slate-300">
          Place market buy or sell orders with a fixed 40-pip spread and 1%
          fee applied on the effective price.
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

      {/* Grid: ticket + order book (same height) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4 items-stretch">
        {/* Trading ticket */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg backdrop-blur flex flex-col gap-4 h-[500px]">
          {/* Tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                side === 'buy'
                  ? 'bg-emerald-500 text-slate-900 border-emerald-400'
                  : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                side === 'sell'
                  ? 'bg-red-500 text-slate-50 border-red-400'
                  : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
              }`}
            >
              Sell
            </button>

            <div className="ml-4">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs text-slate-200">
                Market
              </span>
            </div>
          </div>

          {/* Pair + status */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Pair</span>
              <select
                className="text-xs rounded-lg bg-slate-900 border border-white/15 px-3 py-1.5 text-slate-100 outline-none focus:outline-none"
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

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
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
                    ? 'Error'
                    : isLoading
                    ? 'Updating...'
                    : 'Live'}
                </span>
              </div>
              <div className="text-slate-400">
                Updated:{' '}
                <span className="text-slate-200">
                  {lastUpdated ? formatClock(lastUpdated) : '--:--:--'}
                </span>
              </div>
            </div>
          </div>

          {/* Available balances (quote + base) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2 flex items-center justify-between">
              <span className="text-slate-300">
                Available {quoteSymbol || 'QUOTE'}
              </span>
              <span className="text-slate-100 font-semibold">
                {quoteBalance.toFixed(4)} {quoteSymbol}
              </span>
            </div>
            <div className="rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2 flex items-center justify-between">
              <span className="text-slate-300">
                Available {baseSymbol || 'BASE'}
              </span>
              <span className="text-slate-100 font-semibold">
                {baseBalance.toFixed(4)} {baseSymbol}
              </span>
            </div>
          </div>

          {/* Market & effective price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Market price (mid)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-100 text-sm font-semibold">
                  {midPrice != null ? midPrice.toFixed(8) : '--'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {quoteSymbol}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-slate-400">
                Price used for quantity (price - 1%)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-100 text-sm font-semibold">
                  {effectivePriceForQty != null
                    ? effectivePriceForQty.toFixed(8)
                    : '--'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  includes spread + 1% fee
                </span>
              </div>
            </div>
          </div>

          {/* Amount (quote) + Quantity (base) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-slate-500">
                  in {quoteSymbol || 'QUOTE'} (8 decimals)
                </span>
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                className="rounded-lg bg-slate-900 border border-white/15 px-3 py-1.5 text-xs text-slate-100 outline-none focus:outline-none focus:border-teal-400/70"
                placeholder="0.00000000"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity (after 1% fee)</span>
                <span className="text-slate-500">
                  in {baseSymbol || 'BASE'}
                </span>
              </div>
              <div className="rounded-lg bg-slate-900 border border-white/15 px-3 py-1.5 text-xs text-slate-100 flex items-center justify-between">
                <span>
                  {baseQuantity != null
                    ? baseQuantity.toFixed(8)
                    : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Slider + MAX */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={100}
                step={25}
                onChange={(e) => {
                  const pct = Number(e.target.value) / 100
                  const amount = quoteBalance * pct
                  setQuoteAmount(amount ? amount.toFixed(8) : '')
                }}
                className="w-full accent-teal-400"
              />
            </div>
            <button
              type="button"
              onClick={handleMaxQuote}
              className="px-2 py-1 rounded-lg border border-slate-600 text-[11px] text-slate-200 hover:border-teal-400/70"
            >
              100%
            </button>
          </div>

          {/* TP/SL placeholder */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>TP / SL</span>
            <span>No</span>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !isAmountValid || effectivePriceForQty == null || baseQuantity == null
            }
            className={`mt-1 inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold transition ${
              side === 'buy'
                ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-emerald-700'
                : 'bg-red-500 text-slate-50 hover:bg-red-400 disabled:bg-red-900 disabled:text-red-300'
            }`}
          >
            {side === 'buy' ? 'Confirm buy order' : 'Confirm sell order'}
          </button>
        </div>

        {/* ORDER BOOK – same height as ticket */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg backdrop-blur flex flex-col gap-3 h-[500px]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-100">Order book</span>
            <span className="text-slate-400 text-[11px]">
              Book view (top levels)
            </span>
          </div>

          <div className="flex-1">
            {isLoading && !orderBook ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading order book...
              </div>
            ) : hasError ? (
              <div className="h-full flex items-center justify-center text-xs text-red-400">
                Error loading order book.
              </div>
            ) : (
              <OrderBookBookLike orderBook={orderBook} />
            )}
          </div>
        </div>
      </section>
    </>
  )
}
