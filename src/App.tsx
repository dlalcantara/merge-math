import { useState } from 'react'
import { GameBoard } from './components/GameBoard'
import { SetupScreen } from './components/SetupScreen'
import type { Target } from './engine/types'

export default function App() {
  const [phase, setPhase] = useState<'setup' | 'playing'>('setup')
  const [confirmedTargets, setConfirmedTargets] = useState<Target[] | null>(null)

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
