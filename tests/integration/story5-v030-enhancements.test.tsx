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

beforeEach(() => {
  vi.restoreAllMocks()
})

// US1: Convert Number to Generator
describe('US1: Convert Number to Generator', () => {
  it('selecting a number then clicking Convert to Generator moves it to generators grid and increments score', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [7, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    await userEvent.click(within(numGrid).getAllByRole('button')[0])
    await userEvent.click(screen.getByRole('button', { name: /convert to generator/i }))
    expect(within(numGrid).queryByText('7')).toBeNull()
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    expect(within(genGrid).getByText('7')).toBeInTheDocument()
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('undo after Convert to Generator restores number and removes generator', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [7, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    await userEvent.click(within(numGrid).getAllByRole('button')[0])
    await userEvent.click(screen.getByRole('button', { name: /convert to generator/i }))
    await userEvent.click(screen.getByRole('button', { name: /^undo$/i }))
    expect(within(numGrid).getByText('7')).toBeInTheDocument()
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('Convert to Generator button is disabled when no number is selected', async () => {
    render(<GameBoard />)
    expect(screen.getByRole('button', { name: /convert to generator/i })).toBeDisabled()
  })
})

// US4: Two-State Auto-Accomplish Target Display
describe('US4: Auto-Accomplish Target Display', () => {
  it('generating a matching number auto-accomplishes the target without a click', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [1, null, null, null] })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genBtn = within(genGrid).getAllByRole('button')[0]
    await userEvent.click(genBtn)
    await userEvent.click(genBtn)
    const targetList = screen.getByRole('list', { name: /targets/i })
    expect(within(targetList).getByText('1').className).toContain('target-accomplished')
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('number stays in grid after auto-accomplish', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [1, null, null, null] })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genBtn = within(genGrid).getAllByRole('button')[0]
    await userEvent.click(genBtn)
    await userEvent.click(genBtn)
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).getByText('1')).toBeInTheDocument()
  })

  it('undo after auto-accomplish reverts target to pending', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [1, null, null, null] })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genBtn = within(genGrid).getAllByRole('button')[0]
    await userEvent.click(genBtn)
    await userEvent.click(genBtn)
    const targetList = screen.getByRole('list', { name: /targets/i })
    expect(within(targetList).getByText('1').className).toContain('target-accomplished')
    await userEvent.click(screen.getByRole('button', { name: /^undo$/i }))
    expect(within(targetList).getByText('1').className).toContain('target-pending')
  })

  it('all targets accomplished shows win modal', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({
        generatorsGrid: [1, null, null, null],
        targets: [{ value: 1, accomplished: false }],
      })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genBtn = within(genGrid).getAllByRole('button')[0]
    await userEvent.click(genBtn)
    await userEvent.click(genBtn)
    expect(screen.getByRole('dialog', { name: /you won/i })).toBeInTheDocument()
  })
})

// US2: Simplified Generator Selection
describe('US2: Generator Re-selection Instead of Merge', () => {
  it('clicking a second non-null generator when one is selected changes selection without merging', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [3, 5, null, null] })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = () => within(genGrid).getAllByRole('button')
    await userEvent.click(genCells()[0])
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(genCells()[1])
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'false')
    expect(genCells()[1]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })
})

// US3: Reset Generators Grid
describe('US3: Reset Generators Grid', () => {
  it('Reset Generators Grid with confirm resets to [1,null,null,null] and increments score', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [3, 5, 7, null] })
    )
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /reset generators grid/i }))
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    expect(within(genGrid).getByText('1')).toBeInTheDocument()
    expect(within(genGrid).queryByText('3')).toBeNull()
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('Reset with cancel makes no change', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [3, 5, null, null] })
    )
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /reset generators grid/i }))
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    expect(within(genGrid).getByText('3')).toBeInTheDocument()
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('undo after Reset restores previous generators', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [3, 5, null, null] })
    )
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /reset generators grid/i }))
    await userEvent.click(screen.getByRole('button', { name: /^undo$/i }))
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    expect(within(genGrid).getByText('3')).toBeInTheDocument()
    expect(within(genGrid).getByText('5')).toBeInTheDocument()
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })
})
