import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Cell } from '../../../src/components/Cell'

describe('Cell', () => {
  it('renders the cell value when non-null', () => {
    render(<Cell value={42} index={0} selected={false} onClick={vi.fn()} gridLabel="Numbers Grid" />)
    expect(screen.getByRole('button', { name: /42/ })).toBeInTheDocument()
  })

  it('renders empty button when value is null', () => {
    render(<Cell value={null} index={0} selected={false} onClick={vi.fn()} gridLabel="Numbers Grid" />)
    const btn = screen.getByRole('button')
    expect(btn.textContent).toBe('')
  })

  it('calls onClick handler when clicked', async () => {
    const handler = vi.fn()
    render(<Cell value={5} index={2} selected={false} onClick={handler} gridLabel="Numbers Grid" />)
    await userEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledWith(2)
  })

  it('has aria-label describing value and position', () => {
    render(<Cell value={7} index={3} selected={false} onClick={vi.fn()} gridLabel="Numbers Grid" />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-label')
  })

  it('has aria-pressed="true" when selected', () => {
    render(<Cell value={5} index={0} selected={true} onClick={vi.fn()} gridLabel="Numbers Grid" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('has aria-pressed="false" when not selected', () => {
    render(<Cell value={5} index={0} selected={false} onClick={vi.fn()} gridLabel="Numbers Grid" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })
})
