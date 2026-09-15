import { strings } from '../strings'

interface VideoStageProps {
  poster: string
  youtubeId?: string
  aspect?: '16/9' | '9/16'
}

/**
 * YouTube-hosted films. Native YouTube controls (play/scrub/volume/fullscreen).
 * Reserves the aspect box before anything loads.
 */
export function VideoStage({ poster, youtubeId, aspect = '16/9' }: VideoStageProps) {
  const embedSrc = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0&modestbranding=1`
    : undefined

  return (
    <figure className="video-stage" aria-label={strings.video.stageLabel}>
      <div
        className="video-stage__frame"
        style={aspect === '9/16' ? { aspectRatio: '9 / 16', maxInlineSize: '420px', marginInline: 'auto' } : undefined}
      >
        {embedSrc ? (
          <iframe
            className="video-stage__embed"
            src={embedSrc}
            title={strings.video.stageLabel}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <>
            <img className="video-stage__poster" src={poster} alt={strings.video.posterAlt} />
            <figcaption className="video-stage__overlay">
              <strong>{strings.video.placeholderHeading}</strong>
              <p>{strings.video.placeholderBody}</p>
            </figcaption>
          </>
        )}
      </div>
    </figure>
  )
}
