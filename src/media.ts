// Which lessons have a finished paper-craft film. Sprint 2 ships none — every
// lesson shows the honest "Video in production" placeholder (plan §5). Sprints
// 6–7 add ids here as `public/media/lesson-NN.mp4` lands, and MEDIA_MAP.md is
// the hash-bound record of what actually exists.

const LESSONS_WITH_VIDEO = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])

export function hasVideo(lessonId: number): boolean {
  return LESSONS_WITH_VIDEO.has(lessonId)
}

export function videoSrc(lessonId: number): string | undefined {
  if (!hasVideo(lessonId)) return undefined
  return `${import.meta.env.BASE_URL}media/lesson-${String(lessonId).padStart(2, '0')}.mp4`
}

export function posterSrc(lessonId: number): string {
  if (!hasVideo(lessonId)) return `${import.meta.env.BASE_URL}media/placeholder-poster.svg`
  return `${import.meta.env.BASE_URL}media/lesson-${String(lessonId).padStart(2, '0')}-poster.webp`
}
