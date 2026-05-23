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

describe('US4: Bulk Operations', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('Merge All with + sums all values to single cell', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [3, 5, 7, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /merge all numbers/i }))
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).getByText('15')).toBeInTheDocument()
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('Merge All with * multiplies all values', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [2, 3, 4, null, null, null, null, null, null], activeOperator: '*' })
    )
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /merge all numbers/i }))
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).getByText('24')).toBeInTheDocument()
  })

  it('Merge All button is disabled for operator -', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [3, 5, null, null, null, null, null, null, null], activeOperator: '-' })
    )
    render(<GameBoard />)
    expect(screen.getByRole('button', { name: /merge all numbers/i })).toBeDisabled()
  })

  it('Merge All button is disabled for operator /', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [3, 5, null, null, null, null, null, null, null], activeOperator: '/' })
    )
    render(<GameBoard />)
    expect(screen.getByRole('button', { name: /merge all numbers/i })).toBeDisabled()
  })

  it('Merge All button is disabled with fewer than 2 numbers', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [5, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    expect(screen.getByRole('button', { name: /merge all numbers/i })).toBeDisabled()
  })

  it('Clear Numbers Grid with confirm empties grid and increments score', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [1, 2, 3, null, null, null, null, null, null] })
    )
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /clear numbers grid/i }))
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const filled = within(numGrid).queryAllByText(/\d/)
    expect(filled).toHaveLength(0)
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('Clear Numbers Grid with cancel makes no change', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [1, 2, 3, null, null, null, null, null, null] })
    )
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /clear numbers grid/i }))
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).getByText('1')).toBeInTheDocument()
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('Clear Generators Grid with confirm empties generators and increments score', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [1, 2, null, null] })
    )
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /clear generators grid/i }))
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const filled = within(genGrid).queryAllByText(/\d/)
    expect(filled).toHaveLength(0)
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('Generate Generator adds a 1 to generators grid when slot available', async () => {
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /generate generator/i }))
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const ones = within(genGrid).getAllByText('1')
    expect(ones.length).toBeGreaterThanOrEqual(2)
  })

  it('Generate Generator is disabled when generators grid is full', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [1, 2, 3, 4] })
    )
    render(<GameBoard />)
    expect(screen.getByRole('button', { name: /generate generator/i })).toBeDisabled()
  })
})
