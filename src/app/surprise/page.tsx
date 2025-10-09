'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SurprisePage() {
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.9)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

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
      // mobile autoplay & permission cases – quietly ignore
    }
  }

  return (
    <main className="relative min-h-dvh bg-[url('/background1.jpg')] bg-cover bg-center flex flex-col items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {/* dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      <audio
        ref={audioRef}
        src="/music.mp3"
        loop
        preload="auto"
        playsInline
        aria-label="Романтик хөгжим"
      />

      {/* content card */}
      <section className="relative h-[380px] w-[250px] max-w-[90vw] mx-auto bg-gradient-to-b from-white/35 to-white/15 backdrop-blur-2xl p-6 text-center rounded-2xl shadow-xl ring-1 ring-white/40">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[16px] font-semibold font-dancing text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-pink-200 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.4)]"
        >
          Хаана сонсвол амралт илүү мэдрэгддэг вэ? 💖
        </motion.h1>

        <motion.ul className="mt-4 space-y-2 text-[14.5px] leading-relaxed text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] text-left">
          <motion.li>🌅 Нар жаргах үеэр дээвэр дээр эсвэл балконоос алсыг ширтэнгээ.</motion.li>
          <motion.li>🌳 Тайван цэцэрлэгт сандал дээр, зөөлөн салхины дунд.</motion.li>
          <motion.li>🚗 Холын замд аялахдаа, тэнгэрийн хаяа ажиглангаа.</motion.li>
        </motion.ul>

        {/* controls */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={togglePlay}
            className="rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-[11px] text-white font-medium shadow-md text-[15px] hover:brightness-110 transition-all"
            aria-pressed={playing}
            aria-label={playing ? 'Дууг түр зогсоох' : 'Дууг асаах'}
          >
            {playing ? '⏸ Түр зогсоох' : '🎵 Дуу асаах'}
          </motion.button>

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
      </section>
    </main>
  )
}
