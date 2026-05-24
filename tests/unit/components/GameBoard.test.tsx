import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameBoard } from '../../../src/components/GameBoard'
import * as gameStateModule from '../../../src/engine/gameState'
import type { GameState } from '../../../src/engine/types'

function makeInitialState(overrides: Partial<GameState> = {}): GameState {
  return {
    numbersGrid: Array(9).fill(null),
    generatorsGrid: [1, null, null, null],
    targets: [
      { value: 1, accomplished: false },
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

describe('handleGeneratorsCellClick — re-selection (US2)', () => {
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
    // First deselected, second selected
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'false')
    expect(genCells()[1]).toHaveAttribute('aria-pressed', 'true')
    // Score unchanged — no merge
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
    // Values unchanged — no merge happened
    expect(genCells()[0].textContent).toBe('3')
    expect(genCells()[1].textContent).toBe('5')
  })
})

describe('GameBoard layout order', () => {
  it('renders sections in correct DOM order: ScoreRow → TargetList → NumbersSection → OperatorSelector → GeneratorsSection', () => {
    render(<GameBoard />)

    const scoreRow = screen.getByTestId('score-row')
    const targetList = screen.getByRole('list', { name: /targets/i })
    const numbersSection = screen.getByTestId('numbers-section')
    const operatorSelector = screen.getByRole('group')
    const generatorsSection = screen.getByTestId('generators-section')

    const all = [scoreRow, targetList, numbersSection, operatorSelector, generatorsSection]
    const positions = all.map(el => el.compareDocumentPosition(all[0]))

    // Each element should appear after the previous one (compareDocumentPosition returns FOLLOWING=4 when arg is before the element)
    expect(scoreRow.compareDocumentPosition(targetList) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(targetList.compareDocumentPosition(numbersSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(numbersSection.compareDocumentPosition(operatorSelector) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(operatorSelector.compareDocumentPosition(generatorsSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
