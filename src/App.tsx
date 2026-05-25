import { useState } from 'react'
import { GameBoard } from './components/GameBoard'
import { SetupScreen } from './components/SetupScreen'
import { parseTargets } from './utils/shareUrl'
import type { Target } from './engine/types'

function targetsFromHash(): Target[] | null {
  const parsed = parseTargets(window.location.hash)
  if (!parsed) return null
  return parsed.map(value => ({ value, accomplished: false }))
}

export default function App() {
  const [phase, setPhase] = useState<'setup' | 'playing'>(() =>
    parseTargets(window.location.hash) ? 'playing' : 'setup'
  )
  const [confirmedTargets, setConfirmedTargets] = useState<Target[] | null>(targetsFromHash)

  function handleStart(targets: number[]) {
    setConfirmedTargets(targets.map(value => ({ value, accomplished: false })))
    setPhase('playing')
  }

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStart} />
  }

  return (
    <div className="app">
      <GameBoard initialTargets={confirmedTargets ?? undefined} />
    </div>
  )
}
