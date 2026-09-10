import { useEffect, useRef, useState } from 'react'
import { strings } from '../strings'

interface VideoStageProps {
  /** Poster shown while no film exists yet; also the real poster later. */
  poster: string
  /** Sprint 1 ships placeholders only; real MP4s arrive with the media pipeline. */
  videoSrc?: string
}

const SPEED_RATES = [1, 1.25, 1.5, 2] as const
const SPEED_STORAGE_KEY = 'gtm.playbackRate'

type VideoEl = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void
  webkitSupportsFullscreen?: boolean
}

function readStoredRate(): number {
  try {
    const raw = localStorage.getItem(SPEED_STORAGE_KEY)
    const n = raw == null ? 1 : Number(raw)
    return SPEED_RATES.includes(n as (typeof SPEED_RATES)[number]) ? n : 1
  } catch {
    return 1
  }
}

function formatRate(rate: number): string {
  return `${rate}×`
}

/**
 * Reserves its 16:9 box before anything loads, and never autoplays with audio.
 * Native play/scrub/volume stay. Papercraft speed + fullscreen sit *below* the
 * frame so iOS native controls cannot hide them (Fable 1a).
 */
export function VideoStage({ poster, videoSrc }: VideoStageProps) {
  const videoRef = useRef<VideoEl>(null)
  const [rate, setRate] = useState(readStoredRate)

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate
  }, [videoSrc, rate])

  function applyRate(next: number) {
    setRate(next)
    if (videoRef.current) videoRef.current.playbackRate = next
    try {
      localStorage.setItem(SPEED_STORAGE_KEY, String(next))
    } catch {
      /* private mode */
    }
  }

  async function enterFullscreen() {
    const el = videoRef.current
    if (!el) return
    try {
      if (typeof el.webkitEnterFullscreen === 'function') {
        el.webkitEnterFullscreen()
        return
      }
      if (el.requestFullscreen) {
        await el.requestFullscreen()
        return
      }
    } catch {
      /* user gesture / iOS restriction — leave native controls as fallback */
    }
  }

  return (
    <figure className="video-stage" aria-label={strings.video.stageLabel}>
      <div className="video-stage__frame">
        {videoSrc ? (
          <video
            ref={videoRef}
            className="video-stage__poster"
            controls
            playsInline
            preload="metadata"
            poster={poster}
            onLoadedMetadata={() => {
              if (videoRef.current) videoRef.current.playbackRate = rate
            }}
          >
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
      {videoSrc ? (
        <div className="video-stage__chrome" role="toolbar" aria-label={strings.video.chromeLabel}>
          <div className="video-stage__speeds" role="group" aria-label={strings.video.speedLabel}>
            {SPEED_RATES.map((option) => (
              <button
                key={option}
                type="button"
                className={
                  option === rate
                    ? 'video-stage__chip video-stage__chip--active'
                    : 'video-stage__chip'
                }
                aria-pressed={option === rate}
                onClick={() => applyRate(option)}
              >
                {formatRate(option)}
              </button>
            ))}
          </div>
          <button type="button" className="video-stage__fullscreen" onClick={() => void enterFullscreen()}>
            {strings.video.fullscreen}
          </button>
        </div>
      ) : null}
    </figure>
  )
}
