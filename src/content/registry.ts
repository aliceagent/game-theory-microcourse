// Hand-maintained mirror of content/registry.json until the content builder
// emits this file. Keep the two in sync.

export type SeriesStatus = 'live' | 'in-production'

export interface SeriesNarrator {
  provider: string
  voice: string
}

export interface SeriesPlaylist {
  title: string
  id: string
  url: string
}

export interface SeriesSource {
  label: string
  url: string
}

export interface SeriesRecord {
  slug: string
  title: string
  subtitle: string
  status: SeriesStatus
  theme: string
  legacy: boolean
  basePath: string
  lessonPath: string
  playlist: SeriesPlaylist | null
  source: SeriesSource
  lessonCount: number
  narrator: SeriesNarrator
}

export interface Catalog {
  catalogTitle: string
  catalogSubtitle: string
  series: SeriesRecord[]
}

export const catalog: Catalog = {
  catalogTitle: 'Lecture courses',
  catalogSubtitle: 'Short illustrated lessons, quizzes and summaries reconstructed from public talks.',
  series: [
    {
      slug: 'game-theory',
      title: 'Game Theory, Success and Social Mobility',
      subtitle:
        'A paper-craft microcourse on the marshmallow test, trust, hierarchy and why success is not only willpower.',
      status: 'live',
      theme: 'papercraft',
      legacy: true,
      basePath: '/',
      lessonPath: '/lesson/:id',
      playlist: {
        title: 'The Marshmallow Experiment',
        id: 'PLR-9qisXHS88',
        url: 'https://www.youtube.com/playlist?list=PLR-9qisXHS88',
      },
      source: {
        label: 'shared by @Dhruvkumar16797 on X · ~53 min',
        url: 'https://x.com/Dhruvkumar16797/status/2096827603508469947',
      },
      lessonCount: 40,
      narrator: { provider: 'xai', voice: 'eve' },
    },
    {
      slug: 'buffett-florida-1998',
      title: 'Buffett at Florida, 1998',
      subtitle: 'Principles of durable investing, reconstructed from Warren Buffett’s University of Florida talk.',
      status: 'in-production',
      theme: 'engraved-ledger',
      legacy: false,
      basePath: '/s/buffett-florida-1998',
      lessonPath: '/s/buffett-florida-1998/lesson/:id',
      playlist: null,
      source: {
        label: 'shared by @HarshBisen143 on X · 51 min cut',
        url: 'https://x.com/HarshBisen143/status/2097897940715200738',
      },
      lessonCount: 0,
      narrator: { provider: 'xai', voice: 'leo' },
    },
  ],
}

export const seriesBySlug = new Map(catalog.series.map((series) => [series.slug, series]))
