import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TargetList } from '../../../src/components/TargetList'
import type { Target } from '../../../src/engine/types'

const defaultTargets: Target[] = [
  { value: 1, accomplished: false },
  { value: 5, accomplished: false },
  { value: 10, accomplished: true },
]

describe('TargetList three-state rendering', () => {
  it('pending target (not in grid, not accomplished) has target-pending class', () => {
    render(
      <TargetList
        targets={[{ value: 99, accomplished: false }]}
        numbersGrid={[null, null, null]}
        dispatch={vi.fn()}
      />
    )
    const list = screen.getByRole('list', { name: /targets/i })
    const item = within(list).getByText('99').closest('li') ?? within(list).getByText('99').closest('button') ?? within(list).getByText('99')
    // The button or wrapper should have target-pending class
    const btn = within(list).queryByRole('button', { name: /99/i })
    if (btn) {
      expect(btn.className).toContain('target-pending')
    } else {
      expect(item?.className).toContain('target-pending')
    }
  })

  it('available target (value in numbersGrid, not accomplished) has target-available class', () => {
    render(
      <TargetList
        targets={[{ value: 5, accomplished: false }]}
        numbersGrid={[5, null, null]}
        dispatch={vi.fn()}
      />
    )
    const list = screen.getByRole('list', { name: /targets/i })
    const btn = within(list).getByRole('button', { name: /claim target 5/i })
    expect(btn.className).toContain('target-available')
  })

  it('accomplished target has target-accomplished class', () => {
    render(
      <TargetList
        targets={[{ value: 10, accomplished: true }]}
        numbersGrid={[10, null, null]}
        dispatch={vi.fn()}
      />
    )
    const list = screen.getByRole('list', { name: /targets/i })
    const btn = within(list).getByRole('button', { name: /claim target 10/i })
    expect(btn.className).toContain('target-accomplished')
  })

  it('clicking an available target dispatches CLAIM_TARGET', async () => {
    const dispatch = vi.fn()
    render(
      <TargetList
        targets={[{ value: 5, accomplished: false }]}
        numbersGrid={[5, null, null]}
        dispatch={dispatch}
      />
    )
    const list = screen.getByRole('list', { name: /targets/i })
    await userEvent.click(within(list).getByRole('button', { name: /claim target 5/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLAIM_TARGET', targetValue: 5 })
  })

  it('clicking a pending target does NOT dispatch CLAIM_TARGET', async () => {
    const dispatch = vi.fn()
    render(
      <TargetList
        targets={[{ value: 99, accomplished: false }]}
        numbersGrid={[null, null, null]}
        dispatch={dispatch}
      />
    )
    const list = screen.getByRole('list', { name: /targets/i })
    const btn = within(list).queryByRole('button', { name: /claim target 99/i })
    if (btn) {
      await userEvent.click(btn)
    }
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'CLAIM_TARGET' }))
  })

  it('clicking an accomplished target does NOT dispatch CLAIM_TARGET', async () => {
    const dispatch = vi.fn()
    render(
      <TargetList
        targets={[{ value: 10, accomplished: true }]}
        numbersGrid={[10, null, null]}
        dispatch={dispatch}
      />
    )
    const list = screen.getByRole('list', { name: /targets/i })
    const btn = within(list).queryByRole('button', { name: /claim target 10/i })
    if (btn) {
      await userEvent.click(btn)
    }
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'CLAIM_TARGET' }))
  })

  it('renders all three states simultaneously in the same list', () => {
    render(
      <TargetList
        targets={defaultTargets}
        numbersGrid={[5, null, null]}
        dispatch={vi.fn()}
      />
    )
    const list = screen.getByRole('list', { name: /targets/i })
    const btn1 = within(list).getByRole('button', { name: 'Claim target 1' })
    const btn5 = within(list).getByRole('button', { name: 'Claim target 5' })
    const btn10 = within(list).getByRole('button', { name: 'Claim target 10' })
    expect(btn1.className).toContain('target-pending')
    expect(btn5.className).toContain('target-available')
    expect(btn10.className).toContain('target-accomplished')
  })
})
