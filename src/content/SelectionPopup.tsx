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

/** Domains where we force the popup above the selection (they have their own downward popups) */
const ABOVE_DOMAINS = ['google.com', 'learning.oreilly.com']

function shouldShowAbove(): boolean {
  const host = window.location.hostname
  return ABOVE_DOMAINS.some(d => host === d || host === 'www.' + d)
}

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
  const above = shouldShowAbove()

  // Horizontally centre the button over the selection, clamped to viewport edges
  const halfBtn = POPUP_OFFSET + 14  // half of 36px button + small margin
  const x = Math.max(halfBtn, Math.min(rect.left + rect.width / 2, vw - halfBtn))

  // On certain sites (e.g. Google, O'Reilly) show above the selection to avoid
  // colliding with their own downward popups; otherwise show below.
  const y = above
    ? rect.top - POPUP_OFFSET
    : rect.bottom + POPUP_OFFSET

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

    // Reposition on scroll so the popup follows the anchor text
    const onScroll = () => scheduleUpdate()

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('selectionchange', onSelectionChange)
    window.addEventListener('scroll', onScroll, true)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('selectionchange', onSelectionChange)
      window.removeEventListener('scroll', onScroll, true)
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

  const above = shouldShowAbove()

  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    // Centre horizontally; shift upward when above so the button's bottom edge meets the selection
    transform: above ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
    zIndex: 2147483647,
    pointerEvents: 'all',
    opacity: 0.45,
    transition: 'opacity 0.15s ease-in-out',
  }

  return (
    <div
      style={style}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.45' }}
    >
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
        {/* Search (magnifying glass) icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  )
}
