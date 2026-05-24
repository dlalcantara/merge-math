import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SetupScreen } from '../../../src/components/SetupScreen'

describe('SetupScreen', () => {
  it('renders 8 pre-filled inputs with tutorial default values', () => {
    render(<SetupScreen onStart={vi.fn()} />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(8)
    inputs.forEach(input => {
      expect((input as HTMLInputElement).value).not.toBe('')
    })
  })

  it('first input defaults to 1 (first tutorial target)', () => {
    render(<SetupScreen onStart={vi.fn()} />)
    const inputs = screen.getAllByRole('spinbutton')
    expect((inputs[0] as HTMLInputElement).value).toBe('1')
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

  it('renders a Randomize button', () => {
    render(<SetupScreen onStart={vi.fn()} />)
    expect(screen.getByRole('button', { name: /randomize/i })).toBeInTheDocument()
  })

  it('clicking Randomize replaces all 8 values with new numbers', async () => {
    render(<SetupScreen onStart={vi.fn()} />)
    const inputs = screen.getAllByRole('spinbutton')
    const valuesBefore = inputs.map(i => (i as HTMLInputElement).value)
    await userEvent.click(screen.getByRole('button', { name: /randomize/i }))
    const valuesAfter = inputs.map(i => (i as HTMLInputElement).value)
    // At least some values should change
    expect(valuesAfter).not.toEqual(valuesBefore)
    // All 8 fields should still have values
    valuesAfter.forEach(v => expect(v).not.toBe(''))
  })

  it('clicking Randomize produces values in range −1023..1024', async () => {
    render(<SetupScreen onStart={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /randomize/i }))
    const inputs = screen.getAllByRole('spinbutton')
    inputs.forEach(input => {
      const v = parseInt((input as HTMLInputElement).value, 10)
      expect(v).toBeGreaterThanOrEqual(-1023)
      expect(v).toBeLessThanOrEqual(1024)
    })
  })

  it('calls onStart with 8 numbers when all fields are valid', async () => {
    const onStart = vi.fn()
    render(<SetupScreen onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: /start game/i }))
    expect(onStart).toHaveBeenCalledOnce()
    const [targets] = onStart.mock.calls[0] as [number[]]
    expect(targets).toHaveLength(8)
    targets.forEach(t => {
      expect(Number.isInteger(t)).toBe(true)
      expect(t).toBeGreaterThanOrEqual(-9999)
      expect(t).toBeLessThanOrEqual(9999)
    })
  })
})
