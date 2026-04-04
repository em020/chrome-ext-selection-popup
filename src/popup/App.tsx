export default function App() {
  return (
    <div className="w-80 bg-white flex flex-col items-center p-6 gap-5">
      {/* Icon */}
      <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-lg font-semibold text-zinc-900">Selection Popup</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Select any text on a webpage to see the action icon.
        </p>
      </div>

      {/* Info box */}
      <div className="w-full bg-zinc-50 rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600 space-y-1">
        <p className="font-medium text-zinc-800">How it works</p>
        <p>
          Highlight text on any page. A chat icon appears below the selection.
          Click it - the selected text is logged to the browser console.
        </p>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
        Extension active on all pages
      </div>
    </div>
  )
}
