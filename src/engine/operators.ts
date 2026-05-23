import type { Operator } from './types'

export function applyOperator(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': return b === 0 ? 0 : Math.trunc(a / b)
  }
}
