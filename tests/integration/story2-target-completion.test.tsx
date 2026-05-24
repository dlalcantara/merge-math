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

async function generateNumber(genGrid: HTMLElement) {
  // Click generator cell once to select, again to generate
  const genBtn = within(genGrid).getAllByRole('button')[0]
  await userEvent.click(genBtn)
  await userEvent.click(genBtn)
}

describe('US2: Target Auto-Completion and Win', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('generating a matching number auto-accomplishes the target, number stays in grid, score increments once', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [1, null, null, null] })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    await generateNumber(genGrid)
    const targetList = screen.getByRole('list', { name: /targets/i })
    const target1 = within(targetList).getByText('1')
    expect(target1.className).toContain('target-accomplished')
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    expect(within(numGrid).getByText('1')).toBeInTheDocument()
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('targets are not interactive — clicking a target does not change state', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ numbersGrid: [1, null, null, null, null, null, null, null, null] })
    )
    render(<GameBoard />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    const target1 = within(targetList).getByText('1')
    await userEvent.click(target1)
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('undo after auto-accomplish reverts target to pending', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [1, null, null, null] })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    await generateNumber(genGrid)
    const targetList = screen.getByRole('list', { name: /targets/i })
    expect(within(targetList).getByText('1').className).toContain('target-accomplished')
    await userEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(within(targetList).getByText('1').className).toContain('target-pending')
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('all targets accomplished triggers win modal', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({
        numbersGrid: Array(9).fill(null),
        generatorsGrid: [1, null, null, null],
        targets: [{ value: 1, accomplished: false }],
      })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    await generateNumber(genGrid)
    expect(screen.getByRole('dialog', { name: /you won/i })).toBeInTheDocument()
  })

  it('target remains accomplished after the matching number is later removed', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [1, null, null, null] })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    await generateNumber(genGrid)
    const targetList = screen.getByRole('list', { name: /targets/i })
    expect(within(targetList).getByText('1').className).toContain('target-accomplished')
    window.confirm = vi.fn(() => true)
    await userEvent.click(screen.getByRole('button', { name: /clear numbers/i }))
    expect(within(targetList).getByText('1').className).toContain('target-accomplished')
  })
})
