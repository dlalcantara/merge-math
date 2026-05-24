import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GeneratorsSection } from '../../../src/components/GeneratorsSection'

describe('GeneratorsSection', () => {
  const defaultProps = {
    cells: [1, null, null, null] as (number | null)[],
    selectedIdx: null as number | null,
    onCellClick: vi.fn(),
    onResetGenerators: vi.fn(),
  }

  it('renders the Generators Grid', () => {
    render(<GeneratorsSection {...defaultProps} />)
    expect(screen.getByRole('grid', { name: /generators grid/i })).toBeInTheDocument()
  })

  it('does not render a Generate Generator button', () => {
    render(<GeneratorsSection {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /generate generator/i })).not.toBeInTheDocument()
  })

  it('renders a "Reset Generators Grid" button', () => {
    render(<GeneratorsSection {...defaultProps} />)
    expect(screen.getByRole('button', { name: /reset generators grid/i })).toBeInTheDocument()
  })

  it('groups grid and buttons in the same section container', () => {
    render(<GeneratorsSection {...defaultProps} />)
    const section = screen.getByTestId('generators-section')
    expect(section).toContainElement(screen.getByRole('grid', { name: /generators grid/i }))
    expect(section).toContainElement(screen.getByRole('button', { name: /reset generators grid/i }))
  })
})
