'use client'
import { useState, useEffect } from 'react'
import { LazyMotion, domAnimation, m, MotionConfig, useReducedMotion } from 'framer-motion'

const plan = [
  { emoji: '☕', text: 'Кофе / Bubble tea хамт уух' },
  { emoji: '🌳', text: 'Гадаа алхах, цэцэрлэгт зураг дарах' },
  { emoji: '🍣', text: 'Оройн хоол идэх' },
  { emoji: '🍪', text: 'Амттан идэх, жижиг dessert' },
  { emoji: '🎥', text: 'Кино үзэх, амттан / popcorn хамт идэх' },
]

const punishments = [
  '🤭 Шийтгэл — “Чи хамгийн хөөрхөн нь” гэж 3 удаа чангаар хэлэх',
  '🎤 Шийтгэл — “Би дэлхийн хамгийн азтай хүн!” гэж чангаар хэлэх',
  '🍫 Шийтгэл — амттан авч өгөх',
  '💞 Шийтгэл — нөгөөдөө нэг өхөөрдөм нэр өгч, түүгээр нь 5 минут дуудах',
  '🫰 Шийтгэл — хамтдаа “heart pose” хийж зураг авахуулах',
  '😍 Шийтгэл — 10 секундийн турш бие биенээ харан инээмсэглэх',
  '🫶 Шийтгэл — гараа зүрхний хэлбэртэйгээр нийлүүлж 5 секунд барих',
  '😝 Шийтгэл — 10 секундийн турш хамгийн тэнэг царай гаргах',
  '🐸 Шийтгэл — “Мэлхий шиг дуугар” гэж 5 секунд дуугарах',
  '👀 Шийтгэл — Нөгөө хүнийхээ нүд рүү 10 секунд инээмсэглэн хар',
  '🌸 Шийтгэл — өөрийн тухай 1 өхөөрдөм зүйл хэлэх',
  '🎈 Шийтгэл — 5 секундийн турш хийсч буй бөмбөлөг шиг хөдөл',
  '🤍 Шийтгэл — нөгөөдөө тэврэлт өгөх',
  '📸 Шийтгэл — селфи авахдаа нэгэн ижил хачин царай гаргах',
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
const EMOJI_POOL = ['💗', '💞', '💖', '💘', '💕', '🌸', '🫶']

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
  const [randomPunishment, setRandomPunishment] = useState<string | null>(null)
  useEffect(() => {
    setRandomPunishment(punishments[Math.floor(Math.random() * punishments.length)])
  }, [])

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
              Оройн төлөвлөгөө 💞
            </m.h2>

            <div className="flex flex-col gap-3 w-full max-w-md">
              {plan.map((p, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 70, damping: 14 }}
                  className="bg-white/70 border border-white/30 rounded-2xl shadow p-3 flex items-center gap-3 hover:scale-[1.01] transition-transform duration-150"
                >
                  <span className="text-3xl">{p.emoji}</span>
                  <p className="text-gray-700 text-lg font-medium">{p.text}</p>
                </m.div>
              ))}
            </div>

            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: plan.length * 0.12 + 0.25 }}
              className="mt-6 bg-pink-200/60 border border-pink-300/40 rounded-3xl p-5 text-center shadow max-w-md w-full"
            >
              <p className="text-xl font-bold text-pink-700 mb-2">😶 “Үг хориглох” тоглоом</p>
              <p className="text-gray-700 text-base">Хамтдаа байхдаа нэг үгийг (жишээ нь: “за”, “үгүй”, “тэгье”) хэлэх хориотой!</p>
              {randomPunishment && (
                <p className="mt-4 text-gray-900 font-semibold bg-white/60 rounded-xl py-2 px-3 inline-block">
                  🪄 Таны шийтгэл: {randomPunishment}
                </p>
              )}
            </m.div>

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