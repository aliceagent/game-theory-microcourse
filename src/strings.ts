// Every user-visible string in the app lives here. This is the single swap
// point for a future Hebrew pass (plan §3, decision 21b) — no copy is inlined
// in components. Strings sourced verbatim from the content bundle (course
// title, subtitle, assessment convention, outcomes, workflow) are read from
// the generated course module instead of being duplicated here.

export const strings = {
  app: {
    skipToContent: 'Skip to lesson content',
    backToHome: 'Back to the course home',
    loading: 'Loading…',
  },

  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    lightLabel: 'Light',
    darkLabel: 'Dark',
  },

  notFound: {
    heading: 'This page came unstuck',
    body: 'Nothing is cut to shape at that address. The course home has every unit and all 40 lessons.',
    cta: 'Go to the course home',
  },

  disclaimer: {
    label: 'Before you start',
    body:
      "This course teaches one lecturer's argument about success, game theory and social mobility, " +
      'reconstructed from a public talk. It presents his claims so you can understand them — not as ' +
      'endorsed or independently verified fact.',
  },

  source: {
    heading: 'Source lecture',
    body: 'shared by @Dhruvkumar16797 on X · ~53 min',
    linkLabel: 'Watch the original on X',
    playlistLabel: 'Watch the papercraft films on YouTube',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLR-9qisXHS88',
    note: 'The original video is not re-hosted here. This course only reconstructs and teaches it. Approved papercraft films are also on YouTube.',
  },

  home: {
    eyebrow: 'A paper-craft microcourse',
    outcomesHeading: 'What you will be able to do',
    howItWorksHeading: 'How each lesson works',
    unitMapHeading: 'The six units',
    unitMapNote: '40 lessons across 6 units, covering the full 52-minute lecture.',
    startCta: 'Start the course',
    startCtaHint: 'Begins with Lesson 1 — the marshmallow test.',
    continueCta: (lessonId: number) => `Continue — Lesson ${lessonId}`,
    continueCtaHint: (title: string) => `Next up: ${title}`,
    reviewCta: 'See your course results',
    reviewCtaHint: 'All 40 lessons are complete. Every lesson stays open for review.',
    unitLessonRange: (first: number, last: number) => `Lessons ${first}–${last}`,
    unitLessonCount: (count: number) => `${count} lessons`,
    estimatedTime: (minutes: number) => `About ${minutes} minutes of lecture material`,
    courseProgress: (complete: number, total: number) => `${complete} of ${total} lessons complete`,
  },

  unitMap: {
    unitLabel: (unitId: number) => `Unit ${unitId}`,
    progress: (complete: number, total: number) => `${complete}/${total} complete`,
    lessonLinkLabel: (lessonId: number, title: string) => `Lesson ${lessonId}: ${title}`,
    unitProgressLabel: (title: string) => `Progress through ${title}`,
    stateComplete: 'complete',
    stateStarted: 'in progress',
    stateUnseen: 'not started',
    celebrationLink: 'Unit results',
  },

  lesson: {
    breadcrumb: (unitTitle: string, lessonId: number) => `${unitTitle} · Lesson ${lessonId}`,
    durationLabel: (duration: string) => `${duration} of lecture`,
    windowLabel: (start: string, end: string) => `${start}–${end}`,
    objectiveHeading: 'In this lesson',
    keyPointsHeading: 'Key points',
    notFoundHeading: 'That lesson is not part of this course',
    notFoundBody: 'This course has 40 lessons, numbered 1 to 40.',
    loadErrorHeading: 'This lesson could not be loaded',
    loadErrorBody: 'The lesson content failed to load. Reload the page to try again.',
    navLabel: 'Lesson navigation',
    prev: (lessonId: number) => `Lesson ${lessonId}`,
    prevLabel: 'Previous',
    next: (lessonId: number) => `Lesson ${lessonId}`,
    nextLabel: 'Next',
    nextCta: (lessonId: number) => `Continue — Lesson ${lessonId}`,
    unitCompleteCta: (unitId: number) => `Unit ${unitId} complete — see your results`,
    courseCompleteCta: 'You finished the course — see your results',
    footerHeading: 'Where you are',
    footerCourseProgress: (complete: number, total: number) =>
      `${complete} of ${total} lessons complete`,
    footerUnitProgress: (unitTitle: string, complete: number, total: number) =>
      `${unitTitle}: ${complete} of ${total}`,
  },

  video: {
    stageLabel: 'Lesson video',
    placeholderHeading: 'Video in production',
    placeholderBody:
      'The paper-craft film for this lesson is being made. The full lesson below works now.',
    posterAlt: 'Paper-craft placeholder artwork for this lesson',
  },

  quiz: {
    heading: 'Five questions',
    questionLabel: (index: number, total: number) => `Question ${index} of ${total}`,
    answeredCount: (answered: number, total: number) => `${answered} of ${total} answered`,
    submit: 'Check my answers',
    submitBlockedHint: 'Answer all five questions to check them.',
    resubmit: 'Check the corrections',
    resubmitBlockedHint: 'Choose a new answer for each question that is still open.',
    correctVerdict: 'Correct',
    incorrectVerdict: 'Not yet — try again',
    correctedVerdict: 'Corrected',
    previousChoiceLabel: 'Your earlier answer',
    correctionHeading: 'Fix these before the lesson counts as complete',
    correctionBody: (remaining: number) =>
      remaining === 1
        ? 'One question is still open. Choose a different answer, then check again.'
        : `${remaining} questions are still open. Choose a different answer for each, then check again.`,
    completeHeading: 'All five correct',
    completeBody: (firstTry: number, total: number, corrected: number) =>
      corrected === 0
        ? `You answered all ${total} correctly on the first try.`
        : `${firstTry} of ${total} correct on the first try, ${corrected} corrected.`,
    explanationsHeading: 'Why these are the answers',
    explanationLabel: 'Explanation',
    answerLabel: (label: string, text: string) => `${label}. ${text}`,
  },

  summary: {
    heading: 'Section summary',
    lockedHeading: 'Section summary',
    lockedBody: 'The summary unlocks once all five questions are correct.',
  },

  transcript: {
    heading: 'Transcript excerpt',
    show: 'Show the transcript for this window',
    hide: 'Hide the transcript',
    note: 'Verbatim from the supplied transcript of the source lecture.',
  },

  celebration: {
    unitEyebrow: 'Unit complete',
    unitHeading: (unitId: number, unitTitle: string) => `Unit ${unitId} complete — ${unitTitle}`,
    unitScore: (firstTry: number, questions: number) => `${firstTry}/${questions} first try.`,
    unitLessonsLine: (lessons: number) => `${lessons} lessons finished with every question correct.`,
    unitNextCta: (lessonId: number) => `Continue — Lesson ${lessonId}`,
    unitReviewHeading: 'Review this unit',
    lockedEyebrow: 'Not finished yet',
    lockedHeading: (unitId: number, unitTitle: string) => `Unit ${unitId} — ${unitTitle}`,
    lockedBody: (remaining: number) =>
      remaining === 1
        ? 'One lesson in this unit still needs all five questions correct.'
        : `${remaining} lessons in this unit still need all five questions correct.`,
    lockedCta: (lessonId: number) => `Go to Lesson ${lessonId}`,
    courseEyebrow: 'Course complete',
    courseHeading: 'You finished the course.',
    courseLead:
      'All 40 lessons, all 200 questions, every one of them correct before the lesson counted.',
    courseFirstTry: (percent: number) => `${percent}% right on the first try`,
    courseCorrected: (corrected: number) =>
      corrected === 1 ? '1 answer corrected along the way' : `${corrected} answers corrected along the way`,
    courseLessons: (complete: number, total: number) => `${complete} of ${total} lessons`,
    courseLockedHeading: 'The course is not finished yet',
    courseLockedBody: (remaining: number, total: number) =>
      `${remaining} of the ${total} lessons still need all five questions correct.`,
    reviewUnitsHeading: 'The six units',
    statsHeading: 'Your run',
    shareNote: 'Share cards for this screen arrive with the paper-craft media pass.',
    backHome: 'Back to the course home',
    confettiLabel: 'Paper confetti',
  },

  progress: {
    label: 'Lesson progress',
    stateAnswering: 'Answering',
    stateCorrecting: 'Correcting',
    stateComplete: 'Lesson complete',
    percent: (value: number) => `${value}% complete`,
  },
} as const
