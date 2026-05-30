import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { HelpModal } from '../../../src/components/HelpModal'
import {
  helpIntroTitle,
  helpIntroBody,
  helpDisclaimerTitle,
  helpDisclaimerBody,
} from '../../../src/content/helpContent'

describe('HelpModal — accessibility and structure', () => {
  it('renders a dialog with role="dialog" and aria-modal="true"', () => {
    render(<HelpModal onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('is labelled by the intro heading via aria-labelledby', () => {
    render(<HelpModal onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const heading = document.getElementById(labelledBy!)
    expect(heading).not.toBeNull()
    expect(heading!.textContent).toBe(helpIntroTitle)
  })

  it('renders a close button with aria-label="Close help"', () => {
    render(<HelpModal onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /close help/i })).toBeInTheDocument()
  })

  it('moves focus into the dialog (to the close button) on mount', () => {
    render(<HelpModal onClose={vi.fn()} />)
    const closeBtn = screen.getByRole('button', { name: /close help/i })
    expect(document.activeElement).toBe(closeBtn)
  })

  it('renders intro title and at least the first word of intro body', () => {
    render(<HelpModal onClose={vi.fn()} />)
    expect(screen.getByText(helpIntroTitle)).toBeInTheDocument()
    const firstWord = helpIntroBody.split(/\s+/).find(w => w.length > 0)!
    // First paragraph element should contain that word
    expect(screen.getByTestId('help-modal').textContent).toContain(firstWord)
  })

  it('renders the disclaimer heading inside the same dialog', () => {
    render(<HelpModal onClose={vi.fn()} />)
    expect(helpDisclaimerTitle.length).toBeGreaterThan(0)
    expect(screen.getByTestId('help-modal').textContent).toContain(helpDisclaimerTitle)
  })

  it('renders the AI disclaimer body mentioning Claude and disclosing AI scope', () => {
    render(<HelpModal onClose={vi.fn()} />)
    const text = screen.getByTestId('help-modal').textContent ?? ''
    expect(helpDisclaimerBody.length).toBeGreaterThan(0)
    expect(text).toMatch(/claude/i)
    expect(text).toMatch(/programming/i)
    expect(text).toMatch(/original/i)
    expect(text).toMatch(/no .*(ai|art).*assets?/i)
  })

  it('exposes a data-testid for direct queries', () => {
    render(<HelpModal onClose={vi.fn()} />)
    expect(screen.getByTestId('help-modal')).toBeInTheDocument()
  })
})

describe('HelpModal — dismissal', () => {
  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close help/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed inside the dialog', async () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the backdrop (dialog element itself) is clicked', async () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)
    const dialog = screen.getByRole('dialog')
    // Click directly on the dialog element — the backdrop region (not on a child).
    await userEvent.click(dialog)
    expect(onClose).toHaveBeenCalled()
  })

  it('does NOT call onClose when content inside the dialog is clicked', async () => {
    const onClose = vi.fn()
    render(<HelpModal onClose={onClose} />)
    const heading = screen.getByText(helpIntroTitle)
    await userEvent.click(heading)
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('HelpModal — focus trap', () => {
  it('keeps focus on the close button when Tab is pressed (single focusable wraps to itself)', async () => {
    render(<HelpModal onClose={vi.fn()} />)
    const closeBtn = screen.getByRole('button', { name: /close help/i })
    expect(document.activeElement).toBe(closeBtn)
    await userEvent.tab()
    expect(document.activeElement).toBe(closeBtn)
  })

  it('keeps focus on the close button when Shift+Tab is pressed', async () => {
    render(<HelpModal onClose={vi.fn()} />)
    const closeBtn = screen.getByRole('button', { name: /close help/i })
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(closeBtn)
  })
})
