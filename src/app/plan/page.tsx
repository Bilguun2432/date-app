'use client'
import { useState, useEffect } from 'react'
import { LazyMotion, domAnimation, m, MotionConfig, useReducedMotion } from 'framer-motion'

const plan = [
  { emoji: '☕', text: 'Кофе амттан авхуулах' },
  { emoji: '🛍️', text: 'Shoppy gift card авах' },
  { emoji: '🎥', text: 'Urgoo gift card авах /киноны тасалбарыг монитагаас авна/' },
]

/** ---------- Animated Background Particles ---------- */
type Particle = {
  id: number
  emoji: string
  left: number // vw
  size: number // px
  duration: number // s
  delay: number // s
  drift: number // px
  rotate: number // deg
  opacity: number // 0-1
}

/** Энд хүссэн emoji-гаа нэмж болно */
const EMOJI_POOL = ['🎄', '🎁', '❄️', '⛄', '✨', '🕯️', '🥂']

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])
  return isMobile
}

function BackgroundParticles({ baseCount = 28 }: { baseCount?: number }) {
  const reduceMotion = useReducedMotion()
  const isMobile = useIsMobile()

  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (reduceMotion) { setParticles([]); return }

    const count = Math.max(6, Math.floor(baseCount * (isMobile ? 0.45 : 1)))
    const arr: Particle[] = []
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        emoji: EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)],
        left: Math.random() * 100,
        size: Math.floor(16 + Math.random() * 24),
        duration: 10 + Math.random() * 12,
        delay: Math.random() * 4,
        drift: (Math.random() - 0.5) * 50,
        rotate: (Math.random() - 0.5) * 30,
        opacity: 0.35 + Math.random() * 0.35,
      })
    }
    setParticles(arr)
  }, [mounted, baseCount, isMobile, reduceMotion])

  // SSR үед эсвэл reduceMotion=true үед огт render хийхгүй
  if (!mounted || reduceMotion || particles.length === 0) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 select-none">
      {particles.map(p => (
        <m.span
          key={p.id}
          initial={{ y: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '-120vh'],
            x: [0, p.drift, 0],
            rotate: [0, p.rotate, -p.rotate, 0],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: `${p.left}vw`,
            bottom: '-10vh',
            fontSize: p.size,
            transformOrigin: 'center',
            willChange: 'transform, opacity',
          }}
        >
          {p.emoji}
        </m.span>
      ))}

      <div className="hidden sm:block absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-pink-50/50 to-transparent" />
      <div className="hidden sm:block absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-blue-50/40 to-transparent" />
    </div>
  )
}


export default function PlanPage() {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const vote = async (index: number) => {
    setSelected(index)

    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: index }),
      })

      setSubmitted(true)
    } catch (e) {
      alert('Алдаа гарлаа ❌')
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <main className="relative overflow-hidden min-h-screen bg-gradient-to-t from-pink-100 via-purple-100 to-blue-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="relative z-10 flex flex-col items-center justify-start">
            <m.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl sm:text-4xl font-bold text-pink-600 mb-6 text-center"
            >
              {selected !== null ? 'Сонгосон бэлэг' : 'Бэлэг сонгох'}
            </m.h2>

            <div className="flex flex-col gap-3 w-full max-w-md">
              {!submitted && (
                plan.map((p, i) => (
                <m.div
                  key={i}
                  onClick={() => vote(i)}
                  initial={{ opacity: 0, y: 10, backgroundColor: 'rgba(255,255,255,0.7)' }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,192,203,0.7)' }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 70, damping: 14 }}
                  className="cursor-pointer bg-white/70 border border-white/30 rounded-2xl shadow p-3 flex items-center gap-3 hover:scale-[1.01] transition-transform duration-150"
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <p className="text-gray-700 text-lg font-medium">{p.text}</p>
                </m.div>
                )))
              }
            </div>

            {submitted && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-8 px-6 py-3 bg-green-500 text-white rounded-full shadow text-lg font-semibold"
              >
                🎉 Баяр хүргэе!
                {selected == 0 && ' Кофе амттанг сонгосон таньд баяр хүргэе!'}
                {selected == 1 && ' Shoppy gift card сонгосон таньд баяр хүргэе!'}
                {selected == 2 && ' Urgoo gift card сонгосон таньд баяр хүргэе!'}
              </m.div>
            )}

            <m.a
              href="/surprise"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
              className="mt-8 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow text-lg font-semibold"
            >
              🎁 Дуу сонсох
            </m.a>
          </div>

          {/* reduceMotion-г хүндэтгэдэг болсон */}
          <BackgroundParticles baseCount={24} />
        </main>
      </LazyMotion>
    </MotionConfig>
  )
}