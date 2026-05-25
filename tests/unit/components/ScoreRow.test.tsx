import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ScoreRow } from '../../../src/components/ScoreRow'

describe('ScoreRow — share button', () => {
  it('renders a share button with accessible label', () => {
    render(<ScoreRow score={0} onUndo={vi.fn()} undoDisabled={false} onShare={vi.fn()} copyState="idle" fallbackUrl={null} />)
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })

  it('share button is in the same score-row container', () => {
    render(<ScoreRow score={0} onUndo={vi.fn()} undoDisabled={false} onShare={vi.fn()} copyState="idle" fallbackUrl={null} />)
    const share = screen.getByRole('button', { name: /share/i })
    expect(share.closest('[data-testid="score-row"]')).not.toBeNull()
  })

  it('calls onShare when share button is clicked', async () => {
    const onShare = vi.fn()
    render(<ScoreRow score={0} onUndo={vi.fn()} undoDisabled={false} onShare={onShare} copyState="idle" fallbackUrl={null} />)
    await userEvent.click(screen.getByRole('button', { name: /share/i }))
    expect(onShare).toHaveBeenCalledOnce()
  })

  it('shows "Copied!" text when copyState is "copied"', () => {
    render(<ScoreRow score={0} onUndo={vi.fn()} undoDisabled={false} onShare={vi.fn()} copyState="copied" fallbackUrl={null} />)
    expect(screen.getByText(/copied!/i)).toBeInTheDocument()
  })

  it('shows fallback textarea with the URL when copyState is "fallback"', () => {
    render(<ScoreRow score={0} onUndo={vi.fn()} undoDisabled={false} onShare={vi.fn()} copyState="fallback" fallbackUrl="http://localhost/#targets=1,2,3,4,5,6,7,8" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect((textarea as HTMLTextAreaElement).value).toContain('#targets=')
  })

  it('does not show fallback textarea when copyState is "idle"', () => {
    render(<ScoreRow score={0} onUndo={vi.fn()} undoDisabled={false} onShare={vi.fn()} copyState="idle" fallbackUrl={null} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})

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
