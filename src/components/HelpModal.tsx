import { useEffect, useRef } from 'react'
import {
  helpIntroTitle,
  helpIntroBody,
  helpDisclaimerTitle,
  helpDisclaimerBody,
} from '../content/helpContent'

interface HelpModalProps {
  onClose: () => void
}

function splitParagraphs(body: string): string[] {
  return body.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0)
}

export function HelpModal({ onClose }: HelpModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')

    const firstFocusable = dialog.querySelector<HTMLElement>(
      'button, [href], input, [tabindex="0"]'
    )
    firstFocusable?.focus()

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusables = Array.from(
        dialog!.querySelectorAll<HTMLElement>('button, [href], input, [tabindex="0"]')
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      trapFocus(e)
    }

    dialog.addEventListener('keydown', handleKeyDown)
    return () => dialog.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  const introParagraphs = splitParagraphs(helpIntroBody)
  const disclaimerParagraphs = splitParagraphs(helpDisclaimerBody)

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      data-testid="help-modal"
      className="help-modal"
      onClick={handleBackdropClick}
    >
      <div className="help-modal-content">
        <h2 id="help-modal-title">{helpIntroTitle}</h2>
        {introParagraphs.map((p, i) => (
          <p key={`intro-${i}`}>{p}</p>
        ))}
        {helpDisclaimerTitle && <h2>{helpDisclaimerTitle}</h2>}
        {disclaimerParagraphs.map((p, i) => (
          <p key={`disc-${i}`}>{p}</p>
        ))}
      </div>
      <div className="help-modal-actions">
        <button type="button" aria-label="Close help" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  )
}
