import { motion } from 'framer-motion'

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

export interface GuestDetailsData {
  fullName: string
  email: string
  phone: string
  specialRequests: string
}

export default function GuestDetails({
  data, onChange,
}: {
  data: GuestDetailsData; onChange: (d: GuestDetailsData) => void
}) {
  const update = (partial: Partial<GuestDetailsData>) => onChange({ ...data, ...partial })

  const inputClass = "w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white font-body text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C9A86A]/40 focus:bg-white/[0.08] transition-all duration-300"

  const fields = [
    { key: 'fullName' as const, label: 'Full Name', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', type: 'text', ph: 'Your full name' },
    { key: 'email' as const, label: 'Email Address', icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', type: 'email', ph: 'your@email.com' },
    { key: 'phone' as const, label: 'Phone Number', icon: 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z', type: 'tel', ph: '+91 98765 75673' },
  ]

  return (
    <div className="space-y-4 md:space-y-5">
      {fields.map((field, i) => (
        <motion.div key={field.key} custom={i} variants={fieldVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">{field.label}</div>
          <div className="relative">
            <input
              type={field.type}
              placeholder={field.ph}
              value={data[field.key]}
              onChange={(e) => update({ [field.key]: e.target.value })}
              className={inputClass}
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" viewBox="0 0 24 24" fill="currentColor">
              <path d={field.icon} />
            </svg>
          </div>
        </motion.div>
      ))}
      <motion.div custom={4} variants={fieldVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="text-white/40 font-body text-[10px] tracking-[0.15em] uppercase mb-1.5">Special Requests</div>
        <textarea
          placeholder="Any special requests or preferences..."
          value={data.specialRequests}
          onChange={(e) => update({ specialRequests: e.target.value })}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </motion.div>
    </div>
  )
}
