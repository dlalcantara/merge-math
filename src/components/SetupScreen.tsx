import { useState } from 'react'
import { DEFAULT_TARGETS, generateRandomTargets } from '../engine/gameState'

interface SetupScreenProps {
  onStart: (targets: number[]) => void
}

function validateField(raw: string): string {
  if (raw.trim() === '') return 'Required'
  if (!/^-?\d+$/.test(raw.trim())) return 'Must be a whole number'
  const n = parseInt(raw, 10)
  if (n < -9999 || n > 9999) return 'Must be between −9999 and 9999'
  return ''
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [values, setValues] = useState<string[]>(() =>
    DEFAULT_TARGETS.map(String)
  )
  const [touched, setTouched] = useState<boolean[]>(() => Array(8).fill(false))

  const errors = values.map(validateField)
  const hasErrors = errors.some(e => e !== '')

  function handleChange(idx: number, raw: string) {
    setValues(prev => prev.map((v, i) => (i === idx ? raw : v)))
  }

  function handleBlur(idx: number) {
    setTouched(prev => prev.map((t, i) => (i === idx ? true : t)))
  }

  function handleRandomize() {
    setValues(generateRandomTargets().map(String))
    setTouched(Array(8).fill(false))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasErrors) return
    onStart(values.map(v => parseInt(v, 10)))
  }

  return (
    <div className="app">
      <h1>Merge Math</h1>
      <form onSubmit={handleSubmit}>
        <h2>Set Target Numbers</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {values.map((val, idx) => (
            <div key={idx}>
              <input
                type="number"
                value={val}
                onChange={e => handleChange(idx, e.target.value)}
                onBlur={() => handleBlur(idx)}
                aria-label={`Target ${idx + 1}`}
                style={{ width: '100%' }}
              />
              {touched[idx] && errors[idx] && (
                <span role="alert" style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {errors[idx]}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="action-buttons" style={{ marginTop: 'var(--spacing-lg)' }}>
          <button type="button" onClick={handleRandomize}>
            Randomize
          </button>
          <button type="submit" disabled={hasErrors} aria-disabled={hasErrors}>
            Start Game
          </button>
        </div>
      </form>
    </div>
  )
}
