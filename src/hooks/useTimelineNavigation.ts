import { useRef, useCallback } from 'react'
import { useAnnouncer } from './useAnnouncer'
import type { DayGroup } from '../components/Timeline/TimelineGroup'

interface FocusPos {
  g: number  // group index
  i: number  // item index; -1 = group header
}

const itemKey = (g: number, i: number) => `${g}-${i}`

export function useTimelineNavigation(groups: DayGroup[]) {
  const announce = useAnnouncer()

  const focusPos   = useRef<FocusPos>({ g: 0, i: -1 })
  const headerRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const itemRefs   = useRef<Map<string, HTMLDivElement>>(new Map())

  // Move focus to (g, i), clamping to valid bounds, and announce to screen readers.
  const focusAt = useCallback(
    (g: number, i: number) => {
      const clampedG = Math.max(0, Math.min(g, groups.length - 1))
      const group = groups[clampedG]
      if (!group) return

      const clampedI = Math.max(-1, Math.min(i, group.events.length - 1))
      focusPos.current = { g: clampedG, i: clampedI }

      if (clampedI === -1) {
        headerRefs.current.get(clampedG)?.focus()
        announce(
          `Group ${clampedG + 1} of ${groups.length}: ${group.label}, ${group.events.length} event${group.events.length !== 1 ? 's' : ''}`
        )
      } else {
        itemRefs.current.get(itemKey(clampedG, clampedI))?.focus()
        const ev = group.events[clampedI]
        announce(
          `${ev.title}. ${ev.status}. ${ev.time}, ${ev.location}. Item ${clampedI + 1} of ${group.events.length}`
        )
      }
    },
    [groups, announce]
  )

  // Left/Right move between day groups; Up/Down move within a group.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { g, i } = focusPos.current
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); focusAt(g + 1, i); break
        case 'ArrowLeft':  e.preventDefault(); focusAt(g - 1, i); break
        case 'ArrowDown':  e.preventDefault(); focusAt(g, i + 1); break
        case 'ArrowUp':    e.preventDefault(); focusAt(g, i - 1); break
      }
    },
    [focusAt]
  )

  // When the tree container itself receives focus (not a child), redirect into the tree.
  const onContainerFocus = useCallback(
    (e: React.FocusEvent) => {
      if (e.target !== e.currentTarget) return
      const { g, i } = focusPos.current
      focusAt(g, i === -1 ? 0 : i)
    },
    [focusAt]
  )

  // Returns all navigation props for a given group index so Timeline can spread them.
  const getGroupProps = useCallback(
    (gIdx: number) => ({
      headerTabIndex: focusPos.current.g === gIdx && focusPos.current.i === -1 ? 0 : -1,
      itemTabIndex: (iIdx: number) =>
        focusPos.current.g === gIdx && focusPos.current.i === iIdx ? 0 : -1,
      onHeaderFocus: () => { focusPos.current = { g: gIdx, i: -1 } },
      onItemFocus: (iIdx: number) => { focusPos.current = { g: gIdx, i: iIdx } },
      headerRef: (el: HTMLDivElement | null) => {
        if (el) headerRefs.current.set(gIdx, el)
        else headerRefs.current.delete(gIdx)
      },
      itemRef: (iIdx: number, el: HTMLDivElement | null) => {
        const key = itemKey(gIdx, iIdx)
        if (el) itemRefs.current.set(key, el)
        else itemRefs.current.delete(key)
      },
    }),
    [] // all values read from stable refs at call-time
  )

  return { handleKeyDown, onContainerFocus, getGroupProps }
}
