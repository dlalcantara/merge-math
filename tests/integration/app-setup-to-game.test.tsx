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
})
