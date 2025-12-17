'use client'

import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Track = { title: string; src: string }

// --- util: deterministic random
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// --- big heart glow background
function HeartBackground({ reduced }: { reduced: boolean }) {
  const anim = reduced
    ? {}
    : { scale: [0.98, 1.03, 0.98], rotate: [0, 2, 0, -2, 0], opacity: [0.45, 0.6, 0.45] }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center"
      animate={anim}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="75vmin" height="75vmin" viewBox="0 0 200 200" className="opacity-70 blur-3xl">
        <defs>
          <radialGradient id="heartGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="rgb(236,72,153)" stopOpacity="0.7" />
            <stop offset="60%" stopColor="rgb(244,114,182)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M100 178 C 20 120, 10 70, 45 45 C 70 27, 95 37, 100 55 C 105 37, 130 27, 155 45 C 190 70, 180 120, 100 178 Z"
          fill="url(#heartGrad)"
        />
      </svg>
    </motion.div>
  )
}

export default function SurprisePage() {
  // --- music state
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('all')
  const audioRef = useRef<HTMLAudioElement>(null)

  // --- animations helpers
  const prefersReduced = useReducedMotion()
  const rng = useMemo(() => mulberry32(42), [])
  const hearts = useMemo(() => {
    const count = 22
    return Array.from({ length: count }).map((_, i) => {
      const left = rng() * 100
      const top = rng() * 100
      const size = 16 + Math.floor(rng() * 18)
      const opacity = 0.25 + rng() * 0.55
      const drift = 28 + rng() * 40
      const xdrift = 10 + rng() * 30
      const duration = 6 + rng() * 6
      const delay = rng() * 3
      return { id: i, left: `${left}%`, top: `${top}%`, size, opacity, drift, xdrift, duration, delay }
    })
  }, [rng])

  // --- fetch tracks
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/musics', { cache: 'no-store' })
        const data = await res.json()
        if (Array.isArray(data?.tracks) && data.tracks.length > 0) {
          setTracks(data.tracks)
          setCurrentIndex(0)
        }
      } catch {}
    })()
  }, [])

  // auto-play on track change if playing
  useEffect(() => {
    const el = audioRef.current
    if (!el || tracks.length === 0) return
    el.load()
    if (playing) el.play().catch(() => {})
  }, [currentIndex, tracks, playing])

  const togglePlay = async () => {
    const el = audioRef.current
    if (!el) return
    try {
      if (el.paused) {
        await el.play()
        setPlaying(true)
      } else {
        el.pause()
        setPlaying(false)
      }
    } catch {}
  }

  const nextIndex = useCallback(() => {
    if (tracks.length === 0) return 0
    if (shuffle) {
      let r = Math.floor(Math.random() * tracks.length)
      if (tracks.length > 1 && r === currentIndex) r = (r + 1) % tracks.length
      return r
    }
    return (currentIndex + 1) % tracks.length
  }, [tracks, currentIndex, shuffle])

  const prevIndex = useCallback(() => {
    if (tracks.length === 0) return 0
    if (shuffle) {
      let r = Math.floor(Math.random() * tracks.length)
      if (tracks.length > 1 && r === currentIndex) r = (r + 1) % tracks.length
      return r
    }
    return (currentIndex - 1 + tracks.length) % tracks.length
  }, [tracks, currentIndex, shuffle])

  const onEnded = () => {
    if (repeat === 'one') {
      audioRef.current?.play().catch(() => {})
      return
    }
    if (repeat === 'all' || shuffle) {
      setCurrentIndex(nextIndex())
      return
    }
    if (currentIndex < tracks.length - 1) setCurrentIndex(currentIndex + 1)
    else setPlaying(false)
  }

  const current = tracks[currentIndex]

  return (
    <main className="relative min-h-dvh flex items-center justify-center overflow-hidden">
      {/* glow heart */}
      <HeartBackground reduced={!!prefersReduced} />

      {/* floating hearts */}
      {!prefersReduced &&
        hearts.map((h) => (
          <motion.span
            key={h.id}
            className="absolute select-none will-change-transform -z-5"
            style={{
              left: h.left,
              top: h.top,
              fontSize: `${h.size}px`,
              color: 'rgba(244,114,182,.92)',
              textShadow: '0 2px 8px rgba(244,114,182,.45)',
            }}
            animate={{
              y: [0, -h.drift, 0],
              x: [0, h.xdrift, 0, -h.xdrift * 0.7, 0],
              opacity: [h.opacity * 0.6, h.opacity, h.opacity * 0.6],
              scale: [0.95, 1.12, 0.95],
              rotate: [0, 6, 0, -6, 0],
            }}
            transition={{
              duration: h.duration,
              repeat: Infinity,
              delay: h.delay,
              ease: 'easeInOut',
            }}
          >
            ❤️
          </motion.span>
        ))}

      {/* audio element (not visible) */}
      <audio
        ref={audioRef}
        src={current?.src}
        loop={repeat === 'one'}
        preload="auto"
        playsInline
        onEnded={onEnded}
        aria-label="Playlist"
      />

      {/* card with controls */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-4 w-full max-w-md rounded-3xl border border-white/30 bg-white/40 p-6 text-center shadow-xl backdrop-blur-xl
                   pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 -z-10 rounded-[2rem] blur-2xl"
          style={{
            background:
              'radial-gradient(600px circle at 50% 0%, rgba(236,72,153,.25), transparent 40%), radial-gradient(500px circle at 0% 100%, rgba(59,130,246,.25), transparent 40%)',
          }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[18px] sm:text-[20px] font-semibold font-dancing text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-pink-200 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.4)]"
        >
          Ажилд нь ажлын өндрөөс өндөр амжилтыг хүсье 🔥
        </motion.h1>

        {/* now playing */}
        <div className="mt-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          <div className="text-xs uppercase tracking-wide opacity-80">Одоо тоглож буй</div>
          <div className="mt-1 text-sm font-medium line-clamp-1">{current ? current.title : '—'}</div>
          <div className="mt-1 text-[11px] opacity-80">{tracks.length} дуу</div>
        </div>

        {/* controls */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShuffle((s) => !s)}
              className={`rounded-full px-3 py-2 text-xs font-medium shadow-md transition-all ${
                shuffle ? 'bg-rose-500 text-white' : 'bg-white/70 text-rose-600'
              }`}
              aria-pressed={shuffle}
              aria-label="Shuffle"
              title="Shuffle"
            >
              🔀 Shuffle
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setRepeat((r) => (r === 'off' ? 'one' : r === 'one' ? 'all' : 'off'))}
              className="rounded-full px-3 py-2 text-xs font-medium shadow-md bg-white/70 text-rose-600 transition-all"
              aria-label={`Repeat: ${repeat}`}
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'off' ? '🔁 Off' : repeat === 'one' ? '🔂 One' : '🔁 All'}
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentIndex(prevIndex())}
              className="rounded-full bg-white/80 p-3 text-rose-700 text-lg font-medium shadow-md hover:scale-105 transition"
              aria-label="Өмнөх дуу"
            >
              ⏮
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={togglePlay}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-8 py-3 text-white font-semibold shadow-lg hover:brightness-110 transition"
              aria-pressed={playing}
              aria-label={playing ? 'Дууг түр зогсоох' : 'Дууг асаах'}
            >
              {playing ? '⏸ Түр зогсоох' : '🎵 Дуу асаах'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentIndex(nextIndex())}
              className="rounded-full bg-white/80 p-3 text-rose-700 text-lg font-medium shadow-md hover:scale-105 transition"
              aria-label="Дараагийн дуу"
            >
              ⏭
            </motion.button>
          </div>
        </div>

        {/* playlist */}
        <div className="mt-4 max-h-[140px] overflow-y-auto text-left pr-1">
          <ul className="space-y-1 text-[12.5px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {tracks.map((t, i) => (
              <li key={t.src}>
                <button
                  onClick={() => {
                    setCurrentIndex(i)
                    setPlaying(true)
                  }}
                  className={`w-full text-left px-2 py-1 rounded-md transition ${
                    i === currentIndex ? 'bg-rose-400/30 font-semibold text-white' : 'hover:bg-white/20'
                  }`}
                  aria-current={i === currentIndex}
                >
                  {i === currentIndex ? '▶ ' : ''}
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>
    </main>
  )
}
