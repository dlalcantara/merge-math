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

  it('Merge All button is enabled for operator - with 2+ numbers', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [3, 5, null, null, null, null, null, null, null], activeOperator: '-' })
    )
    render(<GameBoard />)
    expect(screen.getByRole('button', { name: /merge all numbers/i })).not.toBeDisabled()
  })

  it('Merge All button is enabled for operator / with 2+ numbers', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [3, 5, null, null, null, null, null, null, null], activeOperator: '/' })
    )
    render(<GameBoard />)
    expect(screen.getByRole('button', { name: /merge all numbers/i })).not.toBeDisabled()
  })

  it('Merge All with - subtracts values left-to-right', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [10, 3, null, null, null, null, null, null, null], activeOperator: '-' })
    )
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /merge all numbers/i }))
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).getByText('7')).toBeInTheDocument()
  })

  it('Merge All with / divides values left-to-right', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [12, 3, null, null, null, null, null, null, null], activeOperator: '/' })
    )
    render(<GameBoard />)
    await userEvent.click(screen.getByRole('button', { name: /merge all numbers/i }))
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).getByText('4')).toBeInTheDocument()
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

  it('Reset Generators Grid with cancel makes no change', async () => {
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
})
