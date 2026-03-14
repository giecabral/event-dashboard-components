import { useEffect, useRef, useCallback } from 'react'

/**
 * Creates a visually-hidden aria-live region and returns an `announce` function.
 * Clearing the element before setting new text ensures screen readers re-read
 * identical consecutive messages (e.g. "reached end of group" twice in a row).
 */
export function useAnnouncer() {
  const el = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const div = document.createElement('div')
    div.setAttribute('aria-live', 'polite')
    div.setAttribute('aria-atomic', 'true')
    // Visually hidden, still in the a11y tree
    div.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;overflow:hidden;' +
      'clip:rect(0,0,0,0);white-space:nowrap;border:0'
    document.body.appendChild(div)
    el.current = div
    return () => { document.body.removeChild(div) }
  }, [])

  return useCallback((message: string) => {
    if (!el.current) return
    el.current.textContent = ''
    // rAF gives the browser a tick to notice the clear before setting new text
    requestAnimationFrame(() => {
      if (el.current) el.current.textContent = message
    })
  }, [])
}
