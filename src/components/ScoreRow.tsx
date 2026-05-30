import { useEffect, useRef, useState } from 'react'
import { HelpModal } from './HelpModal'

interface ScoreRowProps {
  score: number
  onUndo: () => void
  undoDisabled: boolean
  onShare?: () => void
  copyState?: 'idle' | 'copied' | 'fallback'
  fallbackUrl?: string | null
}

export function ScoreRow({ score, onUndo, undoDisabled, onShare, copyState = 'idle', fallbackUrl = null }: ScoreRowProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const helpButtonRef = useRef<HTMLButtonElement>(null)
  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (prevOpenRef.current && !isHelpOpen) {
      helpButtonRef.current?.focus()
    }
    prevOpenRef.current = isHelpOpen
  }, [isHelpOpen])

  return (
    <div
      data-testid="score-row"
      className="action-buttons"
      style={{ justifyContent: 'space-between', alignItems: 'center' }}
    >
      <p aria-live="polite" className="score" style={{ textAlign: 'left' }}>
        Action Score: {score}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {copyState === 'copied' && <span aria-live="polite">Copied!</span>}
        {copyState === 'fallback' && fallbackUrl !== null && (
          <textarea
            readOnly
            value={fallbackUrl}
            aria-label="Share URL"
            style={{ width: '16rem', fontSize: '0.75rem' }}
          />
        )}
        <button
          ref={helpButtonRef}
          type="button"
          aria-label="Help"
          onClick={() => setIsHelpOpen(true)}
        >
          ?
        </button>
        <button aria-label="Share" onClick={onShare}>
          &#x1F517;
        </button>
        <button onClick={onUndo} disabled={undoDisabled} aria-disabled={undoDisabled}>
          Undo
        </button>
      </div>
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
    </div>
  )
}
