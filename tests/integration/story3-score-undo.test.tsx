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

describe('US3: Score Tracking and Undo', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('actionScore increments for GENERATE_NUMBER', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = within(genGrid).getAllByRole('button')
    await userEvent.click(genCells[0])
    await userEvent.click(genCells[0])
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('actionScore increments for RESET_GENERATORS_GRID', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /reset generators grid/i }))
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('MOVE_CELL does NOT change score', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [5, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const cells = within(numGrid).getAllByRole('button')
    await userEvent.click(cells[0])
    await userEvent.click(cells[1])
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('Undo after one scored action restores grids and score', async () => {
    render(<GameBoard />)
    // Score a GENERATE_NUMBER action
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = within(genGrid).getAllByRole('button')
    await userEvent.click(genCells[0])
    await userEvent.click(genCells[0])
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
    // Undo
    await userEvent.click(screen.getByRole('button', { name: /^undo$/i }))
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('repeated Undo steps back through full history', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = within(genGrid).getAllByRole('button')
    // Do 3 scored GENERATE_NUMBER actions (generator stays selected)
    await userEvent.click(genCells[0])
    await userEvent.click(genCells[0])
    await userEvent.click(genCells[0])
    await userEvent.click(genCells[0])
    expect(screen.getByText(/action score:\s*3/i)).toBeInTheDocument()
    // Undo 3 times
    const undoBtn = screen.getByRole('button', { name: /^undo$/i })
    await userEvent.click(undoBtn)
    expect(screen.getByText(/action score:\s*2/i)).toBeInTheDocument()
    await userEvent.click(undoBtn)
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
    await userEvent.click(undoBtn)
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('Undo button is disabled when history is empty', () => {
    render(<GameBoard />)
    const undoBtn = screen.getByRole('button', { name: /^undo$/i })
    expect(undoBtn).toBeDisabled()
  })
})
