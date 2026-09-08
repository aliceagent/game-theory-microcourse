// Theme choice: the learner's explicit pick, or the OS preference when they
// have not picked. The tokens themselves are `light-dark()` pairs in
// styles/index.css, so switching only means changing `color-scheme` — which is
// what the `data-theme` attribute on <html> does. index.html applies the stored
// choice before first paint so a dark-mode learner never sees a cream flash.

import { useSyncExternalStore } from 'react'

export const THEME_KEY = 'gt-course-theme-v1'

export type ThemeChoice = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function readChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light'
}

let choice: ThemeChoice = readChoice()
let resolved: ResolvedTheme = choice === 'system' ? systemTheme() : choice
const listeners = new Set<() => void>()

function snapshot(): ResolvedTheme {
  return resolved
}

function publish(next: ResolvedTheme): void {
  if (next === resolved) return
  resolved = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  const media = window.matchMedia?.(DARK_QUERY)
  const onSystemChange = () => {
    // An explicit choice outranks the OS; only `system` follows it.
    if (choice === 'system') publish(systemTheme())
  }
  media?.addEventListener('change', onSystemChange)
  return () => {
    listeners.delete(listener)
    media?.removeEventListener('change', onSystemChange)
  }
}

export function useTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

/** Flips to the opposite of whatever is currently showing, and remembers it. */
export function toggleTheme(): void {
  const next: ResolvedTheme = resolved === 'dark' ? 'light' : 'dark'
  choice = next
  document.documentElement.dataset.theme = next
  try {
    window.localStorage.setItem(THEME_KEY, next)
  } catch {
    // Session-only theming is an acceptable fallback.
  }
  publish(next)
}
