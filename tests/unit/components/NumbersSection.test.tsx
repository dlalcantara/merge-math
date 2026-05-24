import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NumbersSection } from '../../../src/components/NumbersSection'

describe('NumbersSection', () => {
  const defaultProps = {
    cells: Array(9).fill(null) as (number | null)[],
    selectedIdx: null as number | null,
    onCellClick: vi.fn(),
    onMergeAll: vi.fn(),
    onClearNumbers: vi.fn(),
    onConvertToGenerator: vi.fn(),
    convertDisabled: false,
    mergeAllDisabled: false,
  }

  it('renders the Numbers Grid', () => {
    render(<NumbersSection {...defaultProps} />)
    expect(screen.getByRole('grid', { name: /numbers grid/i })).toBeInTheDocument()
  })

  it('renders a "Merge All Numbers" button', () => {
    render(<NumbersSection {...defaultProps} />)
    expect(screen.getByRole('button', { name: /merge all numbers/i })).toBeInTheDocument()
  })

  it('renders a "Convert to Generator" button', () => {
    render(<NumbersSection {...defaultProps} />)
    expect(screen.getByRole('button', { name: /convert to generator/i })).toBeInTheDocument()
  })

  it('renders a "Clear Numbers Grid" button', () => {
    render(<NumbersSection {...defaultProps} />)
    expect(screen.getByRole('button', { name: /clear numbers grid/i })).toBeInTheDocument()
  })

  it('"Convert to Generator" is disabled when convertDisabled is true', () => {
    render(<NumbersSection {...defaultProps} convertDisabled={true} />)
    expect(screen.getByRole('button', { name: /convert to generator/i })).toBeDisabled()
  })

  it('groups grid and buttons in the same section container', () => {
    render(<NumbersSection {...defaultProps} />)
    const section = screen.getByTestId('numbers-section')
    expect(section).toContainElement(screen.getByRole('grid', { name: /numbers grid/i }))
    expect(section).toContainElement(screen.getByRole('button', { name: /merge all numbers/i }))
    expect(section).toContainElement(screen.getByRole('button', { name: /clear numbers grid/i }))
    expect(section).toContainElement(screen.getByRole('button', { name: /convert to generator/i }))
  })
})
