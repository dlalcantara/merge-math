import { describe, it, expect } from 'vitest'
import { applyOperator } from '../../../src/engine/operators'

describe('applyOperator', () => {
  it('adds two numbers', () => {
    expect(applyOperator(3, 4, '+')).toBe(7)
  })

  it('subtracts b from a', () => {
    expect(applyOperator(10, 3, '-')).toBe(7)
  })

  it('multiplies two numbers', () => {
    expect(applyOperator(4, 5, '*')).toBe(20)
  })

  it('divides a by b using truncating integer division', () => {
    expect(applyOperator(10, 3, '/')).toBe(3)
  })

  it('returns 0 when dividing by zero', () => {
    expect(applyOperator(5, 0, '/')).toBe(0)
  })

  it('handles negative operands for subtraction', () => {
    expect(applyOperator(-3, 4, '-')).toBe(-7)
  })

  it('truncates toward zero for negative division', () => {
    expect(applyOperator(-7, 2, '/')).toBe(-3)
  })
})
