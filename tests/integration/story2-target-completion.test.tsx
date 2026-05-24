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
    targets: [
      { value: 1, accomplished: false },
      { value: 2, accomplished: false },
      { value: 5, accomplished: false },
      { value: 12, accomplished: false },
      { value: 25, accomplished: false },
      { value: 67, accomplished: false },
      { value: 69, accomplished: false },
      { value: -420, accomplished: false },
    ],
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

  it('clicking an available target marks it accomplished, number stays in grid, score unchanged', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [1, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    await userEvent.click(within(targetList).getByRole('button', { name: 'Claim target 1' }))
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).getByText('1')).toBeInTheDocument()
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('clicking a target when all targets are accomplished shows win modal', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({
        numbersGrid: [1, null, null, null, null, null, null, null, null],
        targets: [
          { value: 1, accomplished: false },
        ],
      })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    await userEvent.click(within(targetList).getByRole('button', { name: 'Claim target 1' }))
    expect(screen.getByRole('dialog', { name: /you won/i })).toBeInTheDocument()
  })

  it('clicking a target with no matching cell in numbersGrid changes nothing', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: Array(9).fill(null) })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    await userEvent.click(within(targetList).getAllByRole('button')[0])
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('undo after claiming a target reverts accomplished status', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [1, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    await userEvent.click(within(targetList).getByRole('button', { name: 'Claim target 1' }))
    await userEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })
})
