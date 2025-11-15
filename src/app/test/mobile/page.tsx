'use client'

import { useState } from 'react'

export default function TestMobilePage() {
  const [mobile, setMobile] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [requestBody, setRequestBody] = useState('')
  const [responseBody, setResponseBody] = useState('')

  async function checkMobile() {
    setLoading(true)
    setResult(null)

    const payload = { mobileE164: mobile.trim() }
    setRequestBody(JSON.stringify(payload, null, 2))

    try {
      const res = await fetch('/api/signup/check-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const text = await res.text()
      setResponseBody(text)

      let data: any = null
      try {
        data = JSON.parse(text)
      } catch {
        setResult('Errore: risposta non JSON')
        return
      }

      if (data.error) {
        setResult(`ERRORE backend: ${data.error} (available=${data.available})`)
      } else {
        setResult(`available: ${data.available}`)
      }
    } catch (err: any) {
      setResponseBody(`ERROR: ${String(err)}`)
      setResult('Errore durante la chiamata fetch')
    }

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

      <div style={{ marginTop: 30 }}>
        <div>Request JSON inviato:</div>
        <textarea
          readOnly
          value={requestBody}
          style={{
            marginTop: 10,
            width: '100%',
            height: 120,
            padding: 10,
            background: '#0B2C40',
            color: 'white',
            borderRadius: 8,
            border: '1px solid white',
            fontFamily: 'monospace',
            fontSize: 13
          }}
        />
      </div>

      <div style={{ marginTop: 30 }}>
        <div>Response raw dall'API:</div>
        <textarea
          readOnly
          value={responseBody}
          style={{
            marginTop: 10,
            width: '100%',
            height: 160,
            padding: 10,
            background: '#0B2C40',
            color: 'white',
            borderRadius: 8,
            border: '1px solid white',
            fontFamily: 'monospace',
            fontSize: 13
          }}
        />
      </div>
    </div>
  )
}
