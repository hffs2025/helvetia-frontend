'use client'

import { useState } from 'react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function checkEmail() {
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/signup/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const data = await res.json()
    setResult(`available: ${data?.available}`)
    setLoading(false)
  }

  return (
    <div style={{ padding: 40, color: 'white', background: '#071C2C', height: '100vh' }}>
      <h1>Test Email Check</h1>

      <input
        type="text"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
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
        onClick={checkEmail}
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
        {loading ? 'Checking…' : 'Check Email'}
      </button>

      {result && (
        <p style={{ marginTop: 20, fontSize: 18 }}>
          {result}
        </p>
      )}
    </div>
  )
}
