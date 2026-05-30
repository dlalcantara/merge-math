import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from '../../src/App'
import {
  helpIntroTitle,
  helpIntroBody,
  helpDisclaimerTitle,
  helpDisclaimerBody,
} from '../../src/content/helpContent'

async function startGame() {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: /start game/i }))
}

async function openHelp() {
  const helpButton = screen.getByRole('button', { name: /^help$/i })
  await userEvent.click(helpButton)
  return helpButton
}

describe('Story 7 — US1: First-time player learns how to play', () => {
  it('shows a "?" help button in the score row after the game starts', async () => {
    await startGame()
    const help = screen.getByRole('button', { name: /^help$/i })
    expect(help).toBeInTheDocument()
    expect(help.closest('[data-testid="score-row"]')).not.toBeNull()
  })

  it('opens the help modal containing the intro title and body', async () => {
    await startGame()
    await openHelp()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog.textContent).toContain(helpIntroTitle)
    // First non-empty word of intro body should appear in the dialog
    const firstWord = helpIntroBody.split(/\s+/).find(w => w.length > 0)
    if (firstWord) expect(dialog.textContent).toContain(firstWord)
  })

  it('dismisses via close button and restores focus to the help trigger', async () => {
    await startGame()
    const help = await openHelp()
    await userEvent.click(screen.getByRole('button', { name: /close help/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(help)
  })

  it('dismisses via Escape and restores focus to the help trigger', async () => {
    await startGame()
    const help = await openHelp()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(help)
  })

  it('dismisses via backdrop click and restores focus to the help trigger', async () => {
    await startGame()
    const help = await openHelp()
    const dialog = screen.getByRole('dialog')
    // Click directly on the dialog element itself — the backdrop region.
    fireEvent.click(dialog, { target: dialog })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(help)
  })

  it('preserves game action score across an open/close cycle', async () => {
    await startGame()
    const scoreBefore = screen.getByText(/action score:/i).textContent
    await openHelp()
    await userEvent.click(screen.getByRole('button', { name: /close help/i }))
    const scoreAfter = screen.getByText(/action score:/i).textContent
    expect(scoreAfter).toBe(scoreBefore)
  })
})

describe('Story 7 — US2: AI & attribution disclaimer in the same view', () => {
  it('renders the disclaimer title in the same dialog as the intro', async () => {
    await startGame()
    await openHelp()
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain(helpDisclaimerTitle)
  })

  it('mentions Claude, programming-only usage, original design, and no AI art', async () => {
    await startGame()
    await openHelp()
    const dialog = screen.getByRole('dialog')
    const text = dialog.textContent ?? ''
    expect(text).toMatch(/claude/i)
    expect(text).toMatch(/programming/i)
    expect(text).toMatch(/original/i)
    expect(text).toMatch(/no .*(ai|art).*assets?/i)
    // Sanity: the body itself is non-empty and present
    expect(helpDisclaimerBody.length).toBeGreaterThan(0)
    expect(text).toContain(helpDisclaimerBody.split(/\s+/)[0])
  })
})
