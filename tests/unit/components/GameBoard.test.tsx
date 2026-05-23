import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GameBoard } from '../../../src/components/GameBoard'

describe('GameBoard layout order', () => {
  it('renders sections in correct DOM order: ScoreRow → TargetList → NumbersSection → OperatorSelector → GeneratorsSection', () => {
    render(<GameBoard />)

    const scoreRow = screen.getByTestId('score-row')
    const targetList = screen.getByRole('list', { name: /targets/i })
    const numbersSection = screen.getByTestId('numbers-section')
    const operatorSelector = screen.getByRole('group')
    const generatorsSection = screen.getByTestId('generators-section')

    const all = [scoreRow, targetList, numbersSection, operatorSelector, generatorsSection]
    const positions = all.map(el => el.compareDocumentPosition(all[0]))

    // Each element should appear after the previous one (compareDocumentPosition returns FOLLOWING=4 when arg is before the element)
    expect(scoreRow.compareDocumentPosition(targetList) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(targetList.compareDocumentPosition(numbersSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(numbersSection.compareDocumentPosition(operatorSelector) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(operatorSelector.compareDocumentPosition(generatorsSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
