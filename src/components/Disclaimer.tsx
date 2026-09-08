import { strings } from '../strings'

/** Decision 12b: shown on the home page and on every lesson page. */
export function Disclaimer() {
  return (
    <aside className="disclaimer">
      <p className="disclaimer__label">{strings.disclaimer.label}</p>
      <p>{strings.disclaimer.body}</p>
    </aside>
  )
}
