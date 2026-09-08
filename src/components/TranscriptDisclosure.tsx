import { useState } from 'react'
import type { TranscriptBlock } from '../lesson'
import { strings } from '../strings'

interface TranscriptDisclosureProps {
  blocks: TranscriptBlock[]
  excerpt: string
}

/** Decision 18b: the per-lesson transcript window is collapsed by default. */
export function TranscriptDisclosure({ blocks, excerpt }: TranscriptDisclosureProps) {
  const [open, setOpen] = useState(false)

  return (
    <details className="card transcript" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>
        <span className="transcript__caret" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        {open ? strings.transcript.hide : strings.transcript.show}
      </summary>
      <div className="transcript__body">
        <h3>{strings.transcript.heading}</h3>
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <div className="transcript__block" key={`${block.start}-${block.end}`}>
              <p className="transcript__time">
                {strings.lesson.windowLabel(block.start, block.end)}
              </p>
              <p className="transcript__text">{block.text}</p>
            </div>
          ))
        ) : (
          <p className="transcript__text">{excerpt}</p>
        )}
        <p className="transcript__note">{strings.transcript.note}</p>
      </div>
    </details>
  )
}
