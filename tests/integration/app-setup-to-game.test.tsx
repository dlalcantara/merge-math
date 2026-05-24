import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from '../../src/App'

describe('App setup-to-game flow', () => {
  it('shows SetupScreen on initial load', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('transitions to GameBoard after completing setup with valid values', async () => {
    render(<App />)
    // SetupScreen pre-fills valid values; just click Start Game
    await userEvent.click(screen.getByRole('button', { name: /start game/i }))
    expect(screen.queryByRole('button', { name: /start game/i })).not.toBeInTheDocument()
    expect(screen.getByRole('grid', { name: /numbers grid/i })).toBeInTheDocument()
  })

  it('shows 8 tutorial target inputs by default (US5)', () => {
    render(<App />)
    expect(screen.getAllByRole('spinbutton')).toHaveLength(8)
  })

  it('Randomize replaces values and game starts with randomized targets (US5)', async () => {
    render(<App />)
    const inputsBefore = screen.getAllByRole('spinbutton').map(i => (i as HTMLInputElement).value)
    await userEvent.click(screen.getByRole('button', { name: /randomize/i }))
    const inputsAfter = screen.getAllByRole('spinbutton').map(i => (i as HTMLInputElement).value)
    // Values changed after randomize
    expect(inputsAfter).not.toEqual(inputsBefore)
    // Game starts with randomized values
    await userEvent.click(screen.getByRole('button', { name: /start game/i }))
    expect(screen.getByRole('grid', { name: /numbers grid/i })).toBeInTheDocument()
  })
})
