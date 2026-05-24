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

describe('US1: Core Grid Interaction', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('clicking an already-selected generator copies its value to numbers grid', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = within(genGrid).getAllByRole('button')
    // Click the pre-placed generator at index 0 (value=1) to select it
    await userEvent.click(genCells[0])
    // Click again to GENERATE_NUMBER
    await userEvent.click(genCells[0])
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const numCells = within(numGrid).getAllByRole('button')
    const filled = numCells.filter(c => c.textContent !== '')
    expect(filled.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })

  it('merging two numbers grid cells applies active operator and increments score', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = within(genGrid).getAllByRole('button')

    // Select generator, then generate twice (generator stays selected after each generate)
    await userEvent.click(genCells[0])
    await userEvent.click(genCells[0])
    await userEvent.click(genCells[0])

    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const numCells = () => within(numGrid).getAllByRole('button')

    // Select first filled cell, click second filled cell to merge
    const filled = numCells().filter(c => c.textContent !== '')
    expect(filled.length).toBeGreaterThanOrEqual(2)
    await userEvent.click(filled[0])
    await userEvent.click(filled[1])

    // After merge (1+1=2) one cell should contain "2"
    expect(within(numGrid).getByText('2')).toBeInTheDocument()
    // Score should be 3 (generate + generate + merge)
    expect(screen.getByText(/action score:\s*3/i)).toBeInTheDocument()
  })

  it('clicking a second generator when one is selected re-selects it without merging (US2)', async () => {
    vi.spyOn(gameStateModule, 'generateInitialState').mockReturnValue(
      makeInitialState({ generatorsGrid: [3, 5, null, null] })
    )
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = () => within(genGrid).getAllByRole('button')
    await userEvent.click(genCells()[0])
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(genCells()[1])
    // Re-selection: first deselected, second selected, values unchanged, no score
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'false')
    expect(genCells()[1]).toHaveAttribute('aria-pressed', 'true')
    expect(genCells()[0].textContent).toBe('3')
    expect(genCells()[1].textContent).toBe('5')
    expect(screen.getByText(/action score:\s*0/i)).toBeInTheDocument()
  })

  it('generator remains selected after copying its value to Numbers Grid', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = () => within(genGrid).getAllByRole('button')
    // Select generator at index 0 (value 1)
    await userEvent.click(genCells()[0])
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'true')
    // Copy value to Numbers Grid (first click on already-selected generator)
    await userEvent.click(genCells()[0])
    // Generator should still be selected
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'true')
    // Copy value again without re-selecting
    await userEvent.click(genCells()[0])
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const numCells = within(numGrid).getAllByRole('button')
    const filled = numCells.filter(c => c.textContent !== '')
    expect(filled.length).toBe(2)
    // Score: 2 (two generate actions)
    expect(screen.getByText(/action score:\s*2/i)).toBeInTheDocument()
  })

  it('[US3] clicking the game-board background clears all selection', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = () => within(genGrid).getAllByRole('button')

    // Select the generator at index 0
    await userEvent.click(genCells()[0])
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'true')

    // Click the game-board container itself (not a cell or button)
    const board = document.querySelector('.game-board') as HTMLElement
    await userEvent.click(board)

    // All cells should be deselected
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'false')
  })

  it('[US2] clicking an empty Numbers Grid cell while Generators Grid is selected clears all selection', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = () => within(genGrid).getAllByRole('button')

    // Select the generator at index 0
    await userEvent.click(genCells()[0])
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'true')

    // Click an empty Numbers Grid cell (numbers grid starts fully empty)
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const numCells = within(numGrid).getAllByRole('button')
    await userEvent.click(numCells[0])

    // Generator should be deselected and no numbers cell selected
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'false')
    numCells.forEach(cell => expect(cell).toHaveAttribute('aria-pressed', 'false'))
  })

  it('[US2] clicking an empty Generators Grid cell while Numbers Grid is selected clears all selection', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = () => within(genGrid).getAllByRole('button')

    // Generate a number so Numbers Grid is non-empty
    await userEvent.click(genCells()[0])
    await userEvent.click(genCells()[0]) // GENERATE_NUMBER

    // Select the Numbers Grid cell
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const numCells = () => within(numGrid).getAllByRole('button')
    const filledNumCell = numCells().find(c => c.textContent !== '')!
    await userEvent.click(filledNumCell)
    expect(filledNumCell).toHaveAttribute('aria-pressed', 'true')

    // Click an empty Generators Grid cell (index 1 starts empty)
    await userEvent.click(genCells()[1])

    // Numbers cell should be deselected and no generators cell selected
    expect(filledNumCell).toHaveAttribute('aria-pressed', 'false')
    genCells().forEach(cell => expect(cell).toHaveAttribute('aria-pressed', 'false'))
  })

  it('[US1] selecting a non-empty cell in the other grid clears the current grid selection', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = () => within(genGrid).getAllByRole('button')

    // Select the generator at index 0 and generate a number so Numbers Grid is non-empty
    await userEvent.click(genCells()[0])
    await userEvent.click(genCells()[0]) // GENERATE_NUMBER — generator stays selected

    // Generator cell at index 0 should be selected
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'true')

    // Click the non-empty Numbers Grid cell
    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const numCells = within(numGrid).getAllByRole('button')
    const filledNumCell = numCells.find(c => c.textContent !== '')!
    await userEvent.click(filledNumCell)

    // Generator should be deselected, Numbers cell should be selected
    expect(genCells()[0]).toHaveAttribute('aria-pressed', 'false')
    expect(filledNumCell).toHaveAttribute('aria-pressed', 'true')
  })

  it('moving a selected cell to an empty slot does NOT increment score', async () => {
    render(<GameBoard />)
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = within(genGrid).getAllByRole('button')

    // Place a number (score becomes 1)
    await userEvent.click(genCells[0])
    await userEvent.click(genCells[0])

    const numGrid = screen.getByRole('grid', { name: /numbers grid/i })
    const numCells = within(numGrid).getAllByRole('button')

    // Select the filled cell, click an empty cell (MOVE_CELL — no score)
    const filledCell = numCells.find(c => c.textContent !== '')!
    const emptyCell = numCells.find(c => c.textContent === '')!
    await userEvent.click(filledCell)
    await userEvent.click(emptyCell)

    // Score should still be 1
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
  })
})
