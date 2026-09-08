import { strings } from '../strings'

interface VideoStageProps {
  /** Poster shown while no film exists yet; also the real poster later. */
  poster: string
  /** Sprint 1 ships placeholders only; real MP4s arrive with the media pipeline. */
  videoSrc?: string
}

/**
 * Reserves its 16:9 box before anything loads, and never autoplays with audio.
 * Sprint 1 renders the deterministic placeholder poster for every lesson.
 */
export function VideoStage({ poster, videoSrc }: VideoStageProps) {
  return (
    <figure className="video-stage" aria-label={strings.video.stageLabel}>
      <div className="video-stage__frame">
        {videoSrc ? (
          <video className="video-stage__poster" controls preload="metadata" poster={poster}>
            <source src={videoSrc} type="video/mp4" />
          </video>
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
