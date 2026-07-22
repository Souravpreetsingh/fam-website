import { motion } from 'framer-motion'
import type { Room } from '../data/rooms'

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function RoomCard({
  room, selected, onSelect, index,
}: {
  room: Room; selected: boolean; onSelect: () => void; index: number
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      onClick={onSelect}
      className={`group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-500 bg-[#0A0E14] ${
        selected
          ? 'ring-[2.5px] ring-[#C9A86A] shadow-[0_0_48px_rgba(201,168,106,0.18)]'
          : 'hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] hover:-translate-y-1'
      }`}
    >
      <div className="relative h-56 md:h-64 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${room.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080A] via-[#06080A]/30 to-transparent" />

        {selected && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-[#C9A86A] text-[#06080A] font-body text-[10px] font-bold tracking-[0.15em] uppercase">
            Selected
          </div>
        )}

        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div className="flex items-center gap-2 text-white/70 font-body text-[12px] tracking-wide">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="5.5" cy="5" r="2.5" /><path d="M1 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" strokeLinecap="round" />
            </svg>
            {room.capacity} Guests
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-display text-[22px] text-white font-semibold leading-tight mb-1">{room.name}</h3>
        <div className="text-[#C9A86A]/80 font-body text-[12px] tracking-[0.15em] uppercase mb-3">{room.type}</div>
        <p className="text-white/50 font-body text-sm leading-relaxed mb-5">{room.description}</p>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[#C9A86A] font-display text-2xl font-semibold tracking-tight">₹{room.price.toLocaleString('en-IN')}</span>
          <span className="text-white/35 font-body text-[13px]">/ Night</span>
        </div>
        <div className="text-white/30 font-body text-[11px] tracking-wide mb-5">Including GST</div>

        <div className="space-y-2 mb-6">
          {room.amenities.slice(0, 5).map((a) => (
            <div key={a} className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#C9A86A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M3 7l3 3 5-5" />
              </svg>
              <span className="text-white/55 font-body text-[13px]">{a}</span>
            </div>
          ))}
          {room.amenities.length > 5 && (
            <div className="flex items-center gap-2.5">
              <div className="w-[14px]" />
              <span className="text-white/30 font-body text-[12px]">+{room.amenities.length - 5} more</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect() }}
          className={`w-full py-3.5 rounded-full font-body text-[12px] font-medium tracking-[0.15em] uppercase transition-all duration-400 ${
            selected
              ? 'bg-gradient-to-r from-[#2E5E4E] to-[#3A7A64] text-white shadow-[0_4px_20px_rgba(46,94,78,0.3)]'
              : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white border border-white/[0.08]'
          }`}
        >
          {selected ? 'Selected' : 'Select Room'}
        </button>
      </div>
    </motion.div>
  )
}
