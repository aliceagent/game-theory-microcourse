import { strings } from '../strings'
import { toggleTheme, useTheme } from '../theme'

/**
 * Two-state toggle that starts from the OS preference and only pins an
 * explicit choice once the learner touches it.
 */
export function ThemeToggle() {
  const theme = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={dark}
      title={dark ? strings.theme.toLight : strings.theme.toDark}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {dark ? '◐' : '◑'}
      </span>
      <span className="theme-toggle__label" aria-hidden="true">
        {dark ? strings.theme.darkLabel : strings.theme.lightLabel}
      </span>
      <span className="visually-hidden">
        {dark ? strings.theme.toLight : strings.theme.toDark}
      </span>
    </button>
  )
}
