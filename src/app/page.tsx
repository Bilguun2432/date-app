'use client'
import Image from 'next/image'
import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

function mulberry32(seed:number){
  return function(){
    let t=(seed+=0x6d2b79f5)
    t=Math.imul(t^(t>>>15),t|1)
    t^=t+Math.imul(t^(t>>>7),t|61)
    return((t^(t>>>14))>>>0)/4294967296
  }
}

// Том зүрхэн хэлбэрийн зөөлөн, амьсгалж буй glow арын эффект
function HeartBackground({reduced}:{reduced:boolean}) {
  // анимейшнийг арай удаан, тайван байлгая
  const anim = reduced ? {} : {
    scale: [0.98, 1.03, 0.98],
    rotate: [0, 2, 0, -2, 0],
    opacity: [0.45, 0.6, 0.45]
  }
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center"
      animate={anim}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* SVG зүрхэн хэлбэр (том, бүдэг, blur-тай) */}
      <svg
        width="75vmin" height="75vmin" viewBox="0 0 200 200"
        className="opacity-70 blur-3xl"
      >
        <defs>
          <radialGradient id="heartGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="rgb(236,72,153)" stopOpacity="0.7"/>
            <stop offset="60%" stopColor="rgb(244,114,182)" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)" stopOpacity="0"/>
          </radialGradient>
        </defs>
        {/* Зүрхэн хэлбэрийн path (симметрик) */}
        <path
          d="M100 178
             C 20 120, 10 70, 45 45
             C 70 27, 95 37, 100 55
             C 105 37, 130 27, 155 45
             C 190 70, 180 120, 100 178 Z"
          fill="url(#heartGrad)"
        />
      </svg>
    </motion.div>
  )
}

export default function HomePage() {
  const prefersReduced = useReducedMotion()
  const rng = useMemo(()=>mulberry32(42),[])

  // Илүү олон, зөөлөн тархалттай зүрхэнүүд
  const hearts = useMemo(()=> {
    const count = 26 // өмнөхөөс илүү
    const arr = Array.from({length: count}).map((_,i)=>{
      const left = rng()*100
      const top = rng()*100
      const size = 16 + Math.floor(rng()*18) // жижиг~дунд хэмжээ
      const opacity = 0.25 + rng()*0.55
      const drift = 28 + rng()*40     // босоо савлагаа
      const xdrift = 10 + rng()*30    // хөндлөн савлагаа
      const duration = 6 + rng()*6
      const delay = rng()*3
      return { id:i, left:`${left}%`, top:`${top}%`, size, opacity, drift, xdrift, duration, delay }
    })
    return arr
  },[rng])

  return (
    <main className="relative min-h-dvh flex items-center justify-center overflow-hidden">
      {/* Background image (GPU friendly) */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <Image
          src="/background.jpg"
          alt=""
          priority
          quality={80}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Том зүрхэн glow ар талд */}
      <HeartBackground reduced={!!prefersReduced} />

      {/* Floating hearts (disable if reduce motion) */}
      {!prefersReduced && hearts.map(h=>(
        <motion.span
          key={h.id}
          className="absolute select-none will-change-transform"
          style={{
            left: h.left,
            top: h.top,
            fontSize: `${h.size}px`,
            color: 'rgba(244,114,182,.92)',
            textShadow: '0 2px 8px rgba(244,114,182,.45)'
          }}
          animate={{
            y: [0, -h.drift, 0],
            x: [0, h.xdrift, 0, -h.xdrift*0.7, 0],
            opacity: [h.opacity*0.6, h.opacity, h.opacity*0.6],
            scale: [0.95, 1.12, 0.95],
            rotate: [0, 6, 0, -6, 0]
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: 'easeInOut'
          }}
        >❤️</motion.span>
      ))}

      {/* Card */}
      <motion.section
        initial={{opacity:0,y:12}}
        animate={{opacity:1,y:0}}
        transition={{duration:.5}}
        className="relative mx-4 w-full max-w-md rounded-3xl border border-white/30 bg-white/40 p-7 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/30
                   pt-[calc(1.2rem+env(safe-area-inset-top))] pb-[calc(1.2rem+env(safe-area-inset-bottom))]"
      >
        <div aria-hidden className="pointer-events-none absolute -inset-1 -z-10 rounded-[2rem] blur-2xl"
             style={{background:'radial-gradient(600px circle at 50% 0%, rgba(236,72,153,.25), transparent 40%), radial-gradient(500px circle at 0% 100%, rgba(59,130,246,.25), transparent 40%)'}}/>

        <h1 className="text-3xl font-bold text-pink-600 drop-shadow-sm dark:text-pink-300">
          Сайн уу, Ганболорт — 💖
        </h1>
        <p className="mt-4 text-lg text-gray-800/90 dark:text-gray-200/90">
          2025.10.9 бид хоёрын <strong>ядаргаа тайлах</strong> өдөр 🌿
        </p>

        <motion.a href="/plan" whileHover={{scale:1.05}} whileTap={{scale:.98}}
          className="mt-7 inline-block rounded-full bg-pink-500 px-6 py-3 font-medium text-white shadow-md ring-1 ring-white/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-300 dark:ring-white/10">
          Төлөвлөгөөг үзэх 💌
        </motion.a>
      </motion.section>
    </main>
  )
}
