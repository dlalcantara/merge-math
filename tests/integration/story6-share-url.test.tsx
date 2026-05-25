import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from '../../src/App'

// ─── Helpers ────────────────────────────────────────────────────────────────

const KNOWN_TARGETS = [1, 2, 5, 12, 25, 67, 69, -420]
const KNOWN_HASH = '#targets=1,2,5,12,25,67,69,-420'

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
    configurable: true,
  })
  return writeText
}

async function startGame() {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: /start game/i }))
}

// ─── US1: Share button ───────────────────────────────────────────────────────

describe('US1 – Share button', () => {
  let writeText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    writeText = mockClipboard()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  it('share button is visible during gameplay', async () => {
    await startGame()
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })

  it('clicking share copies a URL containing target values to the clipboard', async () => {
    await startGame()
    await userEvent.click(screen.getByRole('button', { name: /share/i }))
    expect(writeText).toHaveBeenCalledOnce()
    const calledUrl: string = writeText.mock.calls[0][0]
    expect(calledUrl).toContain('#targets=')
    // Default targets from DEFAULT_TARGETS should all appear
    expect(calledUrl).toMatch(/#targets=[\d,\-]+/)
  })

  it('shows "Copied!" confirmation after clicking share', async () => {
    await startGame()
    await userEvent.click(screen.getByRole('button', { name: /share/i }))
    expect(screen.getByText(/copied!/i)).toBeInTheDocument()
  })

  it('shows fallback textarea when clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    await startGame()
    await userEvent.click(screen.getByRole('button', { name: /share/i }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})

// ─── US2: URL load ───────────────────────────────────────────────────────────

describe('US2 – URL load', () => {
  const originalHash = window.location.hash

  afterEach(() => {
    window.location.hash = originalHash
  })

  it('skips setup screen when URL has valid target hash', () => {
    window.location.hash = KNOWN_HASH
    render(<App />)
    expect(screen.queryByRole('button', { name: /start game/i })).not.toBeInTheDocument()
    expect(screen.getByRole('grid', { name: /numbers grid/i })).toBeInTheDocument()
  })

  it('loads the correct target values from the hash', () => {
    window.location.hash = KNOWN_HASH
    render(<App />)
    const targetList = screen.getByRole('list', { name: /targets/i })
    for (const target of KNOWN_TARGETS) {
      expect(targetList).toHaveTextContent(String(target))
    }
  })

  it('shows setup screen when hash is invalid (non-numeric)', () => {
    window.location.hash = '#targets=abc,def,ghi,jkl,mno,pqr,stu,vwx'
    render(<App />)
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('shows setup screen when hash has wrong count', () => {
    window.location.hash = '#targets=1,2,3'
    render(<App />)
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('shows setup screen when no hash is present', () => {
    window.location.hash = ''
    render(<App />)
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })
})
