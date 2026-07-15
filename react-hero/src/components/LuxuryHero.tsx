import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import BookingBar from './BookingBar'

const WORD_VARIANTS = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.5 },
  },
}

const BUTTON_VARIANTS = {
  hidden: { opacity: 0, y: 35, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: {
      duration: 0.9,
      delay: 1.6 + i * 0.28,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
}

/* ─── Sub-components ─── */

function MagneticButton({
  children, href, primary,
}: {
  children: React.ReactNode; href: string; primary?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const rippleId = useRef(0)

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    setPos({
      x: (e.clientX - cx) * 0.3,
      y: (e.clientY - cy) * 0.3,
    })
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const id = ++rippleId.current
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 800)
  }, [])

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      onClick={handleClick}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.96 }}
      className={`
        relative inline-flex items-center justify-center gap-2.5
        px-9 py-4 md:px-10 md:py-4.5
        rounded-full font-body font-medium text-[13px] tracking-[0.14em] uppercase
        transition-shadow duration-500
        ${primary
          ? 'bg-gradient-to-r from-[#7D4A32] via-[#6B3A2A] to-[#5C3A1E] text-white shadow-[0_4px_20px_rgba(92,58,30,0.35)] hover:shadow-[0_8px_32px_rgba(92,58,30,0.45)]'
          : 'border border-white/25 text-white/85 hover:border-white/60 bg-white/[0.06] backdrop-blur-[6px] hover:bg-white/[0.1] shadow-[0_2px_12px_rgba(0,0,0,0.2)]'
        }
      `}
      variants={BUTTON_VARIANTS}
      custom={primary ? 0 : 1}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute w-5 h-5 rounded-full bg-white/30 pointer-events-none"
          style={{
            left: r.x - 10, top: r.y - 10,
            animation: 'rippleExpand 0.8s ease-out forwards',
          }}
        />
      ))}

      {primary && (
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5A3A] via-[#7D4A32] to-[#6B3A2A] opacity-0 hover:opacity-100 transition-opacity duration-500" />
      )}

      <span className="relative z-10 flex items-center gap-2.5">
        {children}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
          <path d="M3 8h10M9 4l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </motion.a>
  )
}

/* ─── Main Component ─── */
export default function LuxuryHero() {
  const [mounted, setMounted] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingInView = useInView(headingRef, { once: true })

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#06080A] select-none">

      {/* ═══ Cinematic Mountain Background ─── */}

      <div className="absolute inset-0 animate-bgzoom will-change-transform">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080E18]/90 via-[#0F1A2E]/60 via-[#1A2A3A]/40 via-[#0D1B2A]/50 to-[#040A08]/95" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Cpath d='M0 500 Q300 400 600 450 T1200 420' stroke='white' stroke-width='0.3' fill='none' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '100% 100%',
          }}
        />
      </div>

      {/* Volumetric sun rays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[min(90vw,900px)] h-[500px] animate-sunrays">
          <div className="w-full h-full bg-gradient-to-b from-[#FFD700]/[0.06] via-[#FF8C00]/[0.035] to-transparent rounded-full blur-3xl" />
        </div>
        <div className="absolute top-[8%] left-[38%] w-[300px] h-[600px] animate-sunrays"
          style={{ animationDelay: '-3s', transform: 'rotate(-8deg)' }}>
          <div className="w-full h-full bg-gradient-to-b from-[#FFA500]/[0.03] to-transparent blur-[80px]" />
        </div>
        <div className="absolute top-[6%] right-[35%] w-[250px] h-[500px] animate-sunrays"
          style={{ animationDelay: '-6s', transform: 'rotate(6deg)' }}>
          <div className="w-full h-full bg-gradient-to-b from-[#FFD700]/[0.025] to-transparent blur-[80px]" />
        </div>
      </div>

      {/* Fog */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[35%] left-0 w-[130%] h-[22%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent rounded-full animate-fog" />
        <div className="absolute bottom-[28%] right-0 w-[130%] h-[18%] bg-gradient-to-r from-transparent via-white/[0.035] to-transparent rounded-full animate-fog2" />
        <div className="absolute bottom-[45%] left-[10%] w-[100%] h-[12%] bg-gradient-to-r from-transparent via-white/[0.025] to-transparent rounded-full animate-fog"
          style={{ animationDelay: '-7s', animationDuration: '20s' }} />
      </div>

      {/* Mountain Scene Layers */}
      <div className="absolute inset-0">
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b
          from-[#0A1628] via-[#122A48] via-[#1B3A5C] via-30%
          via-[#A06030] via-50% via-[#C8844A] via-62%
          to-[#E8A84C] to-78% to-[#F0C868] to-85% to-[#E8D8C0]" />

        {/* Sun */}
        <div className="absolute top-[11%] left-1/2 -translate-x-1/2 w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(255,248,220,0.5) 0%, rgba(255,215,0,0.2) 30%, rgba(255,165,0,0.08) 50%, transparent 70%)',
            boxShadow: '0 0 60px 20px rgba(255,215,0,0.15), 0 0 120px 40px rgba(255,165,0,0.06), 0 0 200px 60px rgba(255,140,0,0.03)',
          }}
        />
        <div className="absolute top-[14%] left-1/2 -translate-x-1/2 w-[50px] h-[50px] md:w-[70px] md:h-[70px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,238,170,0.4) 40%, rgba(255,200,80,0.08) 70%, transparent 100%)',
          }}
        />

        {/* Far mountains */}
        <div className="absolute bottom-[26%] left-[-8%] w-[116%] h-[42%]"
          style={{
            background: '#162232',
            clipPath: 'polygon(0% 100%, 0% 70%, 3% 60%, 8% 48%, 12% 54%, 18% 38%, 22% 44%, 28% 25%, 32% 32%, 36% 18%, 40% 28%, 44% 10%, 48% 20%, 52% 6%, 56% 16%, 60% 12%, 64% 22%, 68% 14%, 72% 24%, 76% 18%, 80% 30%, 84% 22%, 88% 34%, 92% 28%, 96% 40%, 100% 32%, 100% 100%)',
          }}
        />

        {/* Mid mountains */}
        <div className="absolute bottom-[18%] left-[-5%] w-[110%] h-[36%]"
          style={{
            background: '#1A3828',
            clipPath: 'polygon(0% 100%, 0% 74%, 4% 62%, 10% 52%, 14% 60%, 20% 44%, 24% 52%, 30% 38%, 34% 46%, 38% 32%, 42% 42%, 46% 28%, 50% 38%, 54% 22%, 58% 32%, 62% 20%, 66% 30%, 70% 24%, 74% 34%, 78% 28%, 82% 40%, 86% 32%, 90% 44%, 94% 38%, 98% 50%, 100% 42%, 100% 100%)',
          }}
        />

        {/* Near mountains */}
        <div className="absolute bottom-[12%] left-[-4%] w-[108%] h-[28%]"
          style={{
            background: '#142E1E',
            clipPath: 'polygon(0% 100%, 0% 78%, 4% 66%, 10% 58%, 16% 64%, 22% 52%, 28% 58%, 34% 46%, 40% 52%, 46% 42%, 52% 48%, 58% 38%, 64% 44%, 70% 36%, 76% 42%, 82% 34%, 88% 44%, 94% 38%, 100% 48%, 100% 100%)',
          }}
        />

        {/* Pine forest */}
        <div className="absolute bottom-0 left-[-5%] w-[110%] h-[30%]"
          style={{
            background: '#0D3A1A',
            clipPath: 'polygon(0% 30%, 2% 18%, 4% 28%, 6% 12%, 8% 22%, 10% 8%, 12% 20%, 14% 5%, 16% 18%, 18% 10%, 20% 22%, 22% 8%, 24% 20%, 26% 3%, 28% 16%, 30% 8%, 32% 20%, 34% 5%, 36% 18%, 38% 10%, 40% 24%, 42% 6%, 44% 18%, 46% 2%, 48% 14%, 50% 6%, 52% 20%, 54% 10%, 56% 22%, 58% 5%, 60% 16%, 62% 8%, 64% 22%, 66% 4%, 68% 16%, 70% 8%, 72% 20%, 74% 3%, 76% 14%, 78% 6%, 80% 18%, 82% 10%, 84% 24%, 86% 8%, 88% 20%, 90% 3%, 92% 16%, 94% 8%, 96% 22%, 98% 12%, 100% 18%, 100% 100%, 0% 100%)',
          }}
        />
        <div className="absolute bottom-0 left-[-8%] w-[116%] h-[8%] bg-gradient-to-b from-[#0D3A1A] to-[#072010]" />

        {/* Apple orchard trees */}
        <div className="absolute bottom-[16%] left-[35%] w-[16px] h-[32px] md:w-[20px] md:h-[40px]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3px] h-[60%] bg-[#4A2A14] rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[16px] h-[16px] md:w-[20px] md:h-[20px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(107,58,42,0.35) 0%, rgba(74,42,20,0.18) 60%, transparent 100%)' }} />
        </div>
        <div className="absolute bottom-[18%] left-[42%] w-[14px] h-[26px] md:w-[18px] md:h-[34px]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2.5px] h-[55%] bg-[#4A2A14] rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[14px] h-[14px] md:w-[18px] md:h-[18px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(107,58,42,0.3) 0%, rgba(74,42,20,0.15) 60%, transparent 100%)' }} />
        </div>

        {/* Cabins */}
        <div className="absolute bottom-[28%] left-[16%] w-[30px] h-[22px] md:w-[42px] md:h-[30px] opacity-50">
          <div className="absolute top-0 left-[-2px] w-[34px] h-[10px] md:w-[46px] md:h-[13px]"
            style={{ background: '#4A2A14', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          <div className="absolute bottom-0 left-0 w-[30px] h-[14px] md:w-[42px] md:h-[18px] bg-[#5C3A1E]" />
        </div>
        <div className="absolute bottom-[26%] left-[50%] w-[32px] h-[24px] md:w-[44px] md:h-[32px]">
          <div className="absolute top-0 left-[-2px] w-[36px] h-[10px] md:w-[48px] md:h-[14px]"
            style={{ background: '#4A2A14', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          <div className="absolute bottom-0 left-0 w-[32px] h-[16px] md:w-[44px] md:h-[20px] bg-[#5C3A1E]" />
          <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 w-[8px] h-[6px] md:w-[10px] md:h-[8px] bg-[rgba(255,200,80,0.35)] shadow-[0_0_8px_3px_rgba(255,200,80,0.2)]" />
        </div>
        <div className="absolute bottom-[30%] left-[68%] w-[22px] h-[18px] md:w-[32px] md:h-[24px] opacity-35">
          <div className="absolute top-0 left-[-2px] w-[26px] h-[8px] md:w-[36px] md:h-[11px]"
            style={{ background: '#4A2A14', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          <div className="absolute bottom-0 left-0 w-[22px] h-[12px] md:w-[32px] md:h-[14px] bg-[#5C3A1E]" />
        </div>

      </div>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* ═══ Content Overlay ─── */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 md:px-14 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 md:mb-7"
        >
          <span className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full
            bg-white/[0.06] backdrop-blur-[8px] border border-white/[0.08]
            text-white/65 font-body text-[10px] md:text-[11px] tracking-[0.25em] uppercase
            shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="rgba(200,132,74,0.7)" className="shrink-0">
              <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
            </svg>
            Himalayan Luxury Retreat
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          ref={headingRef}
          variants={CONTAINER_VARIANTS}
          initial="hidden"
          animate={headingInView ? 'visible' : 'hidden'}
          className="font-display leading-[1.05] mb-4 md:mb-5"
        >
          <motion.span variants={WORD_VARIANTS} className="block text-[clamp(2.6rem,6.5vw,5.2rem)] font-bold tracking-[-0.02em] text-white">
            Welcome
          </motion.span>
          <motion.span
            variants={WORD_VARIANTS}
            className="block text-[clamp(2.8rem,7vw,5.6rem)] font-semibold italic tracking-[-0.01em]
              bg-gradient-to-r from-[#F5DEB3] via-[#E8A84C] to-[#C8844A] bg-clip-text text-transparent"
          >
            Home.
          </motion.span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 md:w-20 h-[2px] mb-4 md:mb-5 origin-center"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(200,132,74,0.6), rgba(245,222,179,0.4), rgba(200,132,74,0.6), transparent)',
          }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-[clamp(0.8rem,1.3vw,1.1rem)] text-white/65 leading-[1.7] max-w-[500px] mb-7 md:mb-9"
        >
          Some places are built to impress. We built FAM to make people{' '}
          <span className="text-white/85 italic font-display">feel at home.</span>
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 md:gap-5"
          initial="hidden"
          animate="visible"
        >
          <MagneticButton href="#" primary>
            Book Your Stay
          </MagneticButton>
          <MagneticButton href="#">
            Explore Rooms
          </MagneticButton>
        </motion.div>
      </div>

      <BookingBar />

    </section>
  )
}
