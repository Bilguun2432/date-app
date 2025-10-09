'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

type Track = { title: string; src: string }

export default function SurprisePage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.9)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('all')

  const audioRef = useRef<HTMLAudioElement>(null)

  // fetch tracks from API
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/musics', { cache: 'no-store' })
        const data = await res.json()
        if (Array.isArray(data?.tracks) && data.tracks.length > 0) {
          setTracks(data.tracks)
          setCurrentIndex(0)
        }
      } catch {
        // ignore
      }
    })()
  }, [])

  // apply volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // when track changes, auto-play if previously playing
  useEffect(() => {
    const el = audioRef.current
    if (!el || tracks.length === 0) return
    el.load()
    if (playing) {
      el.play().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, tracks])

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
    } catch {
      // mobile autoplay permission — ignore
    }
  }

  const nextIndex = useCallback(() => {
    if (tracks.length === 0) return 0
    if (shuffle) {
      let r = Math.floor(Math.random() * tracks.length)
      // avoid repeating current when possible
      if (tracks.length > 1 && r === currentIndex) {
        r = (r + 1) % tracks.length
      }
      return r
    }
    return (currentIndex + 1) % tracks.length
  }, [tracks, currentIndex, shuffle])

  const prevIndex = useCallback(() => {
    if (tracks.length === 0) return 0
    if (shuffle) {
      let r = Math.floor(Math.random() * tracks.length)
      if (tracks.length > 1 && r === currentIndex) {
        r = (r + 1) % tracks.length
      }
      return r
    }
    return (currentIndex - 1 + tracks.length) % tracks.length
  }, [tracks, currentIndex, shuffle])

  const onEnded = () => {
    if (repeat === 'one') {
      // restart same song
      audioRef.current?.play().catch(() => {})
      return
    }
    if (repeat === 'all' || shuffle) {
      setCurrentIndex(nextIndex())
      return
    }
    // repeat off: stop at end if last track
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setPlaying(false)
    }
  }

  const current = tracks[currentIndex]

  return (
    <main className="relative min-h-dvh bg-[url('/background1.jpg')] bg-cover bg-center flex flex-col items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden />

      <audio
        ref={audioRef}
        src={current?.src}
        loop={repeat === 'one'}
        preload="auto"
        playsInline
        onEnded={onEnded}
        aria-label="Романтик хөгжим playlist"
      />

      <section className="relative max-w-[320px] w-full mx-auto bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-2xl p-6 text-center rounded-2xl shadow-2xl ring-1 ring-white/40 min-h-[460px] sm:min-h-[500px] flex flex-col justify-between">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[16px] font-semibold font-dancing text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-pink-200 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.4)]"
        >
          Хаана сонсвол амралт илүү мэдрэгддэг вэ? 💖
        </motion.h1>

        <motion.ul className="mt-4 space-y-2 text-[14.5px] leading-relaxed text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] text-left">
          <motion.li>🌅 Нар жаргах үеэр дээвэр дээр эсвэл балконоос алсыг ширтэнгээ.</motion.li>
          <motion.li>🌳 Тайван цэцэрлэгт сандал дээр, зөөлөн салхины дунд суунгаа.</motion.li>
          <motion.li>🚗 Холын замд аялахдаа, тэнгэрийн хаяа ажиглангаа.</motion.li>
        </motion.ul>

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
              className={`rounded-full px-3 py-2 text-xs font-medium shadow-md transition-all ${shuffle ? 'bg-rose-500 text-white' : 'bg-white/70 text-rose-600'}`}
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

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentIndex(prevIndex())}
              className="rounded-full bg-white/80 px-4 py-2 text-rose-700 text-sm font-medium shadow-md hover:brightness-110 transition-all"
              aria-label="Өмнөх дуу"
            >
              ⏮ Prev
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={togglePlay}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-[11px] text-white font-medium shadow-md text-[15px] hover:brightness-110 transition-all"
              aria-pressed={playing}
              aria-label={playing ? 'Дууг түр зогсоох' : 'Дууг асаах'}
            >
              {playing ? '⏸ Түр зогсоох' : '🎵 Дуу асаах'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentIndex(nextIndex())}
              className="rounded-full bg-white/80 px-4 py-2 text-rose-700 text-sm font-medium shadow-md hover:brightness-110 transition-all"
              aria-label="Дараагийн дуу"
            >
              ⏭ Next
            </motion.button>
          </div>

          <label className="flex items-center gap-2 text-white/90 text-sm">
            🔊
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Дууны түвшин"
              className="w-32 accent-rose-400 cursor-pointer"
            />
          </label>
        </div>

        {/* simple list (scrollable) */}
        <div className="mt-4 h-[110px] overflow-auto text-left pr-1">
          <ul className="space-y-1 text-[12.5px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {tracks.map((t, i) => (
              <li key={t.src}>
                <button
                  onClick={() => {
                    setCurrentIndex(i)
                    setPlaying(true)
                  }}
                  className={`w-full text-left px-2 py-1 rounded-md hover:bg-white/20 transition ${i === currentIndex ? 'bg-white/25 font-medium' : ''}`}
                  aria-current={i === currentIndex}
                >
                  {i === currentIndex ? '▶ ' : ''}{t.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
