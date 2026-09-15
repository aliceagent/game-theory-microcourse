interface CourseMarkProps {
  theme: string
}

function PapercraftMark() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" rx="28" fill="var(--mark-paper)" />
      <path
        d="M14 86c18-8 34 6 52 2 16-4 28-16 40-10v28H14Z"
        fill="var(--mark-shadow)"
        opacity="0.55"
      />
      <ellipse cx="60" cy="92" rx="38" ry="10" fill="var(--mark-plate)" />
      <ellipse cx="60" cy="88" rx="30" ry="7" fill="var(--mark-plate-rim)" />
      <g transform="translate(36 28)">
        <rect x="4" y="18" width="40" height="36" rx="14" fill="var(--mark-cut)" />
        <rect x="8" y="8" width="32" height="28" rx="12" fill="var(--accent)" />
        <rect x="12" y="4" width="24" height="22" rx="10" fill="var(--mark-puff)" />
        <circle cx="20" cy="14" r="3.2" fill="var(--mark-paper)" opacity="0.7" />
        <circle cx="28" cy="12" r="2.2" fill="var(--mark-paper)" opacity="0.55" />
      </g>
      <path
        d="M22 38c8-14 18-18 28-10"
        fill="none"
        stroke="var(--highlight)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LedgerMark() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" rx="28" fill="var(--mark-ledger)" />
      <g fill="none" stroke="var(--mark-hatch)" strokeWidth="1.15">
        <path d="M18 22h84M18 28h84M18 34h72" opacity="0.45" />
        <path d="M22 96h76" opacity="0.4" />
      </g>
      <path
        d="M24 78c10-4 18 6 36 4 16-2 28-12 40-6v22H24Z"
        fill="var(--mark-moat)"
      />
      <path d="M38 78V46h44v32" fill="var(--mark-stone)" />
      <path d="M38 46h10v-8h8v8h8v-10h8v10h10v8H38Z" fill="var(--mark-keep)" />
      <rect x="54" y="58" width="12" height="20" rx="1.5" fill="var(--mark-door)" />
      <circle cx="86" cy="40" r="7" fill="var(--highlight)" opacity="0.85" />
    </svg>
  )
}

export function CourseMark({ theme }: CourseMarkProps) {
  const papercraft = theme === 'papercraft'
  return (
    <div className={`course-mark course-mark--${papercraft ? 'papercraft' : 'ledger'}`} aria-hidden="true">
      {papercraft ? <PapercraftMark /> : <LedgerMark />}
    </div>
  )
}

export function LessonCountMark() {
  return (
    <svg className="meta-mark" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="4" width="14" height="12" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 8h6M7 11h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
