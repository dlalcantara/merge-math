import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ScoreRow } from '../../../src/components/ScoreRow'

describe('ScoreRow', () => {
  it('renders the action score value', () => {
    render(<ScoreRow score={42} onUndo={vi.fn()} undoDisabled={false} />)
    expect(screen.getByText(/42/)).toBeInTheDocument()
  })

  it('renders an Undo button', () => {
    render(<ScoreRow score={0} onUndo={vi.fn()} undoDisabled={false} />)
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
  })

  it('score and Undo button are in the same row container', () => {
    render(<ScoreRow score={5} onUndo={vi.fn()} undoDisabled={false} />)
    const score = screen.getByText(/action score/i)
    const undo = screen.getByRole('button', { name: /undo/i })
    expect(score.closest('[data-testid="score-row"]')).toBe(undo.closest('[data-testid="score-row"]'))
  })

  it('disables the Undo button when undoDisabled is true', () => {
    render(<ScoreRow score={0} onUndo={vi.fn()} undoDisabled={true} />)
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
  })

  it('calls onUndo when Undo is clicked', async () => {
    const onUndo = vi.fn()
    render(<ScoreRow score={1} onUndo={onUndo} undoDisabled={false} />)
    await userEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(onUndo).toHaveBeenCalledOnce()
  })
})
