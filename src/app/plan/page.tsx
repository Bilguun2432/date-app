'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

export default function PlanPage() {
  const [randomPunishment, setRandomPunishment] = useState<string | null>(null)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * punishments.length)
    setRandomPunishment(punishments[randomIndex])
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-t from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-start p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] overflow-y-auto">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl font-bold text-pink-600 mb-6 text-center drop-shadow-sm"
      >
        Оройн төлөвлөгөө 💞
      </motion.h2>

      <div className="flex flex-col gap-3 w-full max-w-md">
        {plan.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 70 }}
            className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl shadow-lg p-3 flex items-center gap-3 hover:scale-[1.02] transition-transform duration-200"
          >
            <span className="text-3xl">{p.emoji}</span>
            <p className="text-gray-700 text-lg font-medium">{p.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: plan.length * 0.15 + 0.3 }}
        className="mt-6 bg-pink-200/60 backdrop-blur-lg border border-pink-300/40 rounded-3xl p-5 text-center shadow-md max-w-md w-full"
      >
        <p className="text-xl font-bold text-pink-700 mb-2">😶 “Үг хориглох” тоглоом</p>
        <p className="text-gray-700 text-base">
          Хамтдаа байхдаа нэг үгийг (жишээ нь: “за”, “үгүй”, “тэгье”) хэлэх хориотой!
        </p>
        {randomPunishment && (
          <p className="mt-4 text-gray-900 font-semibold bg-white/50 rounded-xl py-2 px-3 inline-block">
            🪄 Таны шийтгэл: {randomPunishment}
          </p>
        )}
      </motion.div>

      <motion.a
        href="/surprise"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mt-8 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg text-lg font-semibold hover:shadow-xl hover:brightness-110 transition-all"
      >
        🎁 Дуу сонсох
      </motion.a>
    </main>
  )
}