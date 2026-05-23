import { useState } from 'react'
import { GameBoard } from './components/GameBoard'
import { SetupScreen } from './components/SetupScreen'

export default function App() {
  const [phase, setPhase] = useState<'setup' | 'playing'>('setup')
  const [confirmedTargets, setConfirmedTargets] = useState<number[] | null>(null)

  function handleStart(targets: number[]) {
    setConfirmedTargets(targets)
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
