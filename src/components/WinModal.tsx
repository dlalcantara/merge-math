import { useEffect, useRef } from 'react'
import type { GameAction } from '../engine/types'

interface WinModalProps {
  score: number
  dispatch: (action: GameAction) => void
}

export function WinModal({ score, dispatch }: WinModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    const focusable = dialog.querySelector<HTMLElement>('button, [href], input, [tabindex]')
    focusable?.focus()

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
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      trapFocus(e)
      if (e.key === 'Escape') {
        dispatch({ type: 'NEW_GAME' })
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)
    return () => dialog.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="You won!"
      className="win-modal"
    >
      <h2>You won!</h2>
      <p>Final score: {score}</p>
      <button onClick={() => dispatch({ type: 'NEW_GAME' })}>New Game</button>
    </dialog>
  )
}
