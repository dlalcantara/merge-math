import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameBoard } from '../../src/components/GameBoard'
import * as gameStateModule from '../../src/engine/gameState'
import type { GameState } from '../../src/engine/types'

function makeInitialState(overrides: Partial<GameState> = {}): GameState {
  return {
    numbersGrid: Array(9).fill(null),
    generatorsGrid: [1, null, null, null],
    targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    activeOperator: '+',
    actionScore: 0,
    selectedNumbersIdx: null,
    selectedGeneratorsIdx: null,
    ...overrides,
  }
}

describe('US2: Target Completion and Win', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('clicking a target with a matching numbers grid cell removes both and increments score', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [1, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    await userEvent.click(within(targetList).getByRole('button', { name: 'Claim target 1' }))
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).queryByText('1')).toBeNull()
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('clicking the last target shows win modal', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({
        numbersGrid: [1, null, null, null, null, null, null, null, null],
        targets: [1],
      })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    await userEvent.click(within(targetList).getByRole('button', { name: 'Claim target 1' }))
    expect(screen.getByRole('dialog', { name: /you won/i })).toBeInTheDocument()
  })

  it('clicking a target with no matching cell changes nothing', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: Array(9).fill(null) })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    await userEvent.click(within(targetList).getAllByRole('button')[0])
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('remaining targets stay sorted by |value| after a claim', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [1, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    const buttons = within(targetList).getAllByRole('button')
    const values = buttons.map(b => parseInt(b.textContent ?? '0', 10))
    for (let i = 1; i < values.length; i++) {
      expect(Math.abs(values[i])).toBeGreaterThanOrEqual(Math.abs(values[i - 1]))
    }
    await userEvent.click(within(targetList).getByRole('button', { name: 'Claim target 1' }))
    const remaining = within(targetList).getAllByRole('button')
    const remVals = remaining.map(b => parseInt(b.textContent ?? '0', 10))
    for (let i = 1; i < remVals.length; i++) {
      expect(Math.abs(remVals[i])).toBeGreaterThanOrEqual(Math.abs(remVals[i - 1]))
    }
  })
})
