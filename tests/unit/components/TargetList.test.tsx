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

describe('TargetList two-state rendering', () => {
  it('pending target (not accomplished) has target-pending class', () => {
    render(<TargetList targets={[{ value: 99, accomplished: false }]} />)
    const list = screen.getByRole('list', { name: /targets/i })
    const item = within(list).getByText('99')
    expect(item.className).toContain('target-pending')
  })

  it('accomplished target has target-accomplished class', () => {
    render(<TargetList targets={[{ value: 10, accomplished: true }]} />)
    const list = screen.getByRole('list', { name: /targets/i })
    const item = within(list).getByText('10')
    expect(item.className).toContain('target-accomplished')
  })

  it('no button elements are rendered (targets are non-interactive)', () => {
    render(<TargetList targets={defaultTargets} />)
    const list = screen.getByRole('list', { name: /targets/i })
    expect(within(list).queryAllByRole('button')).toHaveLength(0)
  })

  it('no target-available class appears in any rendered item', () => {
    const { container } = render(<TargetList targets={defaultTargets} />)
    expect(container.querySelector('.target-available')).toBeNull()
  })

  it('clicking a pending target item does nothing', async () => {
    render(<TargetList targets={[{ value: 99, accomplished: false }]} />)
    const list = screen.getByRole('list', { name: /targets/i })
    const item = within(list).getByText('99')
    await userEvent.click(item)
    expect(item.className).toContain('target-pending')
  })

  it('clicking an accomplished target item does nothing', async () => {
    render(<TargetList targets={[{ value: 10, accomplished: true }]} />)
    const list = screen.getByRole('list', { name: /targets/i })
    const item = within(list).getByText('10')
    await userEvent.click(item)
    expect(item.className).toContain('target-accomplished')
  })

  it('renders both pending and accomplished states simultaneously', () => {
    render(<TargetList targets={defaultTargets} />)
    const list = screen.getByRole('list', { name: /targets/i })
    const item1 = within(list).getByText('1')
    const item5 = within(list).getByText('5')
    const item10 = within(list).getByText('10')
    expect(item1.className).toContain('target-pending')
    expect(item5.className).toContain('target-pending')
    expect(item10.className).toContain('target-accomplished')
  })
})
