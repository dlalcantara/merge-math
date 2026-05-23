import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { GameBoard } from '../../src/components/GameBoard'

describe('US1: Core Grid Interaction', () => {
  it('generates a generator — places value 1 in generators grid and increments score', async () => {
    render(<GameBoard />)
    const genButton = screen.getByRole('button', { name: /generate generator/i })
    await userEvent.click(genButton)
    // generatorsGrid starts with [1, null, null, null]; after GENERATE_GENERATOR, index 1 = 1
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const cells = within(genGrid).getAllByRole('button')
    // At least 2 cells should show "1"
    const filledCells = cells.filter(c => c.textContent === '1')
    expect(filledCells.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/action score:\s*1/i)).toBeInTheDocument()
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

  it('merges two generators using active operator', async () => {
    render(<GameBoard />)
    // Generate a second generator so both index 0 and 1 are filled (both value 1)
    const genButton = screen.getByRole('button', { name: /generate generator/i })
    await userEvent.click(genButton)
    // Score is 1 after generating
    const genGrid = screen.getByRole('grid', { name: /generators grid/i })
    const genCells = () => within(genGrid).getAllByRole('button')
    // Select index 0, then click index 1 to merge (1+1=2)
    await userEvent.click(genCells()[0])
    await userEvent.click(genCells()[1])
    // Source (index 0) should be empty, target (index 1) should show 2
    const cells = genCells()
    expect(cells[1].textContent).toBe('2')
    expect(cells[0].textContent).toBe('')
    // Score: 1 (generate) + 1 (merge) = 2
    expect(screen.getByText(/action score:\s*2/i)).toBeInTheDocument()
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
