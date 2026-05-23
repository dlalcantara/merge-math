import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Grid } from '../../../src/components/Grid'

describe('Grid', () => {
  it('renders exactly 9 cells for a numbers grid (cols=3)', () => {
    const cells = Array(9).fill(null)
    render(<Grid cells={cells} cols={3} label="Numbers Grid" selectedIdx={null} onCellClick={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(9)
  })

  it('renders exactly 4 cells for a generators grid (cols=2)', () => {
    const cells = Array(4).fill(null)
    render(<Grid cells={cells} cols={2} label="Generators Grid" selectedIdx={null} onCellClick={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('passes correct CellValue to each Cell', () => {
    const cells = [1, 2, 3, null, null, null, null, null, null]
    render(<Grid cells={cells} cols={3} label="Numbers Grid" selectedIdx={null} onCellClick={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls onCellClick with the correct index when a cell is clicked', async () => {
    const handler = vi.fn()
    const cells = [5, null, null, null, null, null, null, null, null]
    render(<Grid cells={cells} cols={3} label="Numbers Grid" selectedIdx={null} onCellClick={handler} />)
    await userEvent.click(screen.getAllByRole('button')[0])
    expect(handler).toHaveBeenCalledWith(0)
  })
})
