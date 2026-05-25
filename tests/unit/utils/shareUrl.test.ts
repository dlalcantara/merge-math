import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { encodeTargets, parseTargets, buildShareUrl, copyToClipboard } from '../../../src/utils/shareUrl'

const VALID_TARGETS = [1, 2, 5, 12, 25, 67, 69, -420]

describe('encodeTargets', () => {
  it('encodes a list of 8 integers as a hash fragment', () => {
    expect(encodeTargets(VALID_TARGETS)).toBe('#targets=1,2,5,12,25,67,69,-420')
  })

  it('handles all-negative values', () => {
    const targets = [-1, -2, -3, -4, -5, -6, -7, -8]
    expect(encodeTargets(targets)).toBe('#targets=-1,-2,-3,-4,-5,-6,-7,-8')
  })

  it('handles zeros', () => {
    const targets = [0, 0, 0, 0, 0, 0, 0, 0]
    expect(encodeTargets(targets)).toBe('#targets=0,0,0,0,0,0,0,0')
  })
})

describe('parseTargets', () => {
  it('parses a valid hash fragment into an array of 8 integers', () => {
    expect(parseTargets('#targets=1,2,5,12,25,67,69,-420')).toEqual(VALID_TARGETS)
  })

  it('returns null for empty string', () => {
    expect(parseTargets('')).toBeNull()
  })

  it('returns null when hash prefix is missing', () => {
    expect(parseTargets('targets=1,2,5,12,25,67,69,-420')).toBeNull()
  })

  it('returns null when hash key is wrong', () => {
    expect(parseTargets('#nums=1,2,5,12,25,67,69,-420')).toBeNull()
  })

  it('returns null when count is fewer than 8', () => {
    expect(parseTargets('#targets=1,2,3')).toBeNull()
  })

  it('returns null when count is more than 8', () => {
    expect(parseTargets('#targets=1,2,3,4,5,6,7,8,9')).toBeNull()
  })

  it('returns null when any value is non-numeric', () => {
    expect(parseTargets('#targets=1,2,abc,4,5,6,7,8')).toBeNull()
  })

  it('returns null when any value is a float', () => {
    expect(parseTargets('#targets=1.5,2,3,4,5,6,7,8')).toBeNull()
  })

  it('returns null for NaN values', () => {
    expect(parseTargets('#targets=NaN,2,3,4,5,6,7,8')).toBeNull()
  })

  it('roundtrips with encodeTargets', () => {
    const encoded = encodeTargets(VALID_TARGETS)
    expect(parseTargets(encoded)).toEqual(VALID_TARGETS)
  })
})

describe('buildShareUrl', () => {
  it('returns origin + pathname + encoded hash', () => {
    const url = buildShareUrl(VALID_TARGETS)
    expect(url).toContain('#targets=1,2,5,12,25,67,69,-420')
    expect(url).toMatch(/^https?:\/\//)
  })

  it('does not include an existing hash from location', () => {
    const url = buildShareUrl(VALID_TARGETS)
    const hashCount = (url.match(/#/g) ?? []).length
    expect(hashCount).toBe(1)
  })
})

describe('copyToClipboard', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })
    writeText.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns "success" when clipboard write succeeds', async () => {
    writeText.mockResolvedValue(undefined)
    const result = await copyToClipboard('http://example.com/#targets=1,2,3,4,5,6,7,8')
    expect(result).toBe('success')
    expect(writeText).toHaveBeenCalledWith('http://example.com/#targets=1,2,3,4,5,6,7,8')
  })

  it('returns "fallback" when clipboard write rejects', async () => {
    writeText.mockRejectedValue(new Error('NotAllowedError'))
    const result = await copyToClipboard('http://example.com/#targets=1,2,3,4,5,6,7,8')
    expect(result).toBe('fallback')
  })

  it('returns "fallback" when navigator.clipboard is undefined', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const result = await copyToClipboard('http://example.com/#targets=1,2,3,4,5,6,7,8')
    expect(result).toBe('fallback')
  })
})
