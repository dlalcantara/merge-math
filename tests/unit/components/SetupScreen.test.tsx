import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SetupScreen } from '../../../src/components/SetupScreen'

describe('SetupScreen', () => {
  it('renders 10 pre-filled inputs', () => {
    render(<SetupScreen onStart={vi.fn()} />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(10)
    inputs.forEach(input => {
      expect((input as HTMLInputElement).value).not.toBe('')
    })
  })

  it('shows inline error for a non-integer value', async () => {
    render(<SetupScreen onStart={vi.fn()} />)
    const inputs = screen.getAllByRole('spinbutton')
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '3.5')
    await userEvent.tab()
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
  })

  it('shows inline error when value is out of range (> 9999)', async () => {
    render(<SetupScreen onStart={vi.fn()} />)
    const inputs = screen.getAllByRole('spinbutton')
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '10000')
    await userEvent.tab()
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
  })

  it('shows inline error when value is out of range (< -9999)', async () => {
    render(<SetupScreen onStart={vi.fn()} />)
    const inputs = screen.getAllByRole('spinbutton')
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '-10000')
    await userEvent.tab()
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
  })

  it('disables Start Game button while any field is invalid', async () => {
    render(<SetupScreen onStart={vi.fn()} />)
    const inputs = screen.getAllByRole('spinbutton')
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], 'abc')
    await userEvent.tab()
    expect(screen.getByRole('button', { name: /start game/i })).toBeDisabled()
  })

  it('calls onStart with confirmed numbers when all fields are valid', async () => {
    const onStart = vi.fn()
    render(<SetupScreen onStart={onStart} />)
    // All fields are pre-filled with valid values; just click Start Game
    await userEvent.click(screen.getByRole('button', { name: /start game/i }))
    expect(onStart).toHaveBeenCalledOnce()
    const [targets] = onStart.mock.calls[0] as [number[]]
    expect(targets).toHaveLength(10)
    targets.forEach(t => {
      expect(Number.isInteger(t)).toBe(true)
      expect(t).toBeGreaterThanOrEqual(-9999)
      expect(t).toBeLessThanOrEqual(9999)
    })
  })
})
