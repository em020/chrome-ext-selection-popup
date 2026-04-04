import React from 'react'
import ReactDOM from 'react-dom/client'
import SelectionPopup from './SelectionPopup'
import contentStyles from './content.css?inline'

function mount() {
  // Avoid mounting twice (e.g. if the script is somehow injected again)
  if (document.getElementById('__selection-popup-root__')) return

  // Create a fixed-position host element that does NOT interfere with the page.
  // pointer-events:none on the host lets all clicks fall through to the page
  // except where the React component explicitly re-enables pointer-events.
  const host = document.createElement('div')
  host.id = '__selection-popup-root__'
  host.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;'

  // Shadow DOM isolates our styles from the host page and vice-versa
  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = contentStyles as string
  shadow.appendChild(style)

  const appRoot = document.createElement('div')
  shadow.appendChild(appRoot)

  // Attach to <html> rather than <body> so we survive body replacements
  document.documentElement.appendChild(host)

  ReactDOM.createRoot(appRoot).render(
    <React.StrictMode>
      <SelectionPopup />
    </React.StrictMode>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
