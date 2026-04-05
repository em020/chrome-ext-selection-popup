import React, { useState, useEffect, useCallback } from 'react'
import {read} from "../lib/selection-context.esm";

interface PopupPosition {
  /** Horizontal centre of the button, in CSS fixed-position pixels */
  x: number
  /** Top edge of the button, in CSS fixed-position pixels */
  y: number
}

/** Gap between the selection rect edge and the button edge */
const POPUP_OFFSET = 8

function getSelectionRect(): DOMRect | null {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !selection.toString().trim()) {
    return null
  }
  try {
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    // Guard against zero-size rects (can happen briefly during selection)
    if (rect.width === 0 && rect.height === 0) return null
    return rect
  } catch {
    return null
  }
}

function calculatePosition(rect: DOMRect): PopupPosition {
  const vw = window.innerWidth

  // Horizontally centre the button over the selection, clamped to viewport edges
  const halfBtn = POPUP_OFFSET + 14  // half of 36px button + small margin
  const x = Math.max(halfBtn, Math.min(rect.left + rect.width / 2, vw - halfBtn))

  // Always place below the selection so the icon doesn't compete with
  // the system context menu (which typically appears above on mobile)
  const y = rect.bottom + POPUP_OFFSET

  return { x, y }
}

export default function SelectionPopup() {
  const [position, setPosition] = useState<PopupPosition | null>(null)

  // ── show / update popup ───────────────────────────────────────────────────
  const updatePopup = useCallback(() => {
    const rect = getSelectionRect()
    setPosition(rect ? calculatePosition(rect) : null)
  }, [])

  // ── hide popup ────────────────────────────────────────────────────────────
  const hidePopup = useCallback(() => setPosition(null), [])

  // ── event wiring ──────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updatePopup)
    }

    // Mouse selection ends on mouseup
    const onMouseUp = () => scheduleUpdate()

    // Touch selection: allow the browser extra time to finalise the selection
    const onTouchEnd = () => {
      cancelAnimationFrame(rafId)
      rafId = window.setTimeout(updatePopup, 150) as unknown as number
    }

    // selectionchange fires whenever the selection changes or is cleared
    const onSelectionChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        cancelAnimationFrame(rafId)
        hidePopup()
      }
    }

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('selectionchange', onSelectionChange)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [updatePopup, hidePopup])

  // ── click handler ─────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const selection = read()
    if (!selection) return
    window.location.href = `eubridge://query?q=${encodeURIComponent(selection.selectionText)}@@@${encodeURIComponent(selection.context)}`
  }, [])

  if (!position) return null

  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    // Centre horizontally; top edge of button aligns with y (rect.bottom + offset)
    transform: 'translate(-50%, 0%)',
    zIndex: 2147483647,
    pointerEvents: 'all',
  }

  return (
    <div style={style}>
      <button
        className="popup-btn"
        onClick={handleClick}
        onMouseDown={(e) => {
          // Prevent the mousedown from collapsing the text selection
          e.preventDefault()
          e.stopPropagation()
        }}
        onTouchStart={(e) => e.stopPropagation()}
        title="Click to process selection"
        aria-label="Process selected text"
      >
        {/* MessageSquare icon (inline SVG — no external dep needed in shadow DOM) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  )
}
