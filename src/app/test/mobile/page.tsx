'use client'

import { useState } from 'react'

export default function TestMobilePage() {
  const [mobile, setMobile] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function checkMobile() {
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/signup/check-mobile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileE164: mobile })
    })

    const data = await res.json()
    setResult(`available: ${data?.available}`)
    setLoading(false)
  }

  return (
    <div style={{ padding: 40, color: 'white', background: '#071C2C', height: '100vh' }}>
      <h1>Test Mobile Check</h1>

      <input
        type="text"
        placeholder="+41790000000"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
        style={{
          padding: 10,
          width: 250,
          marginTop: 20,
          borderRadius: 8,
          border: '1px solid white',
          background: 'rgba(255,255,255,0.1)',
          color: 'white'
        }}
      />

      <br />

      <button
        onClick={checkMobile}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          borderRadius: 8,
          background: '#4FD1C5',
          color: '#071C2C',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Checking…' : 'Check Mobile'}
      </button>

      {result && (
        <p style={{ marginTop: 20, fontSize: 18 }}>
          {result}
        </p>
      )}
    </div>
  )
}

