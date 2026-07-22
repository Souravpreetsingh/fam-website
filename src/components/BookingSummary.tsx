import { motion, AnimatePresence } from 'framer-motion'
import type { Room } from '../data/rooms'

export default function BookingSummary({ room }: { room: Room | null }) {
  return (
    <AnimatePresence>
      {room && (
        <motion.section
          key={room.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[32px] p-[2px] bg-gradient-to-b from-[#C9A86A]/20 to-transparent"
        >
          <div className="rounded-[30px] bg-[#0A0E14] backdrop-blur-[6px] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#C9A86A]/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="#C9A86A" strokeWidth="1.2">
                  <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="font-display text-xl text-white font-semibold">Your Reservation</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">Property</span>
                <span className="text-white/85 font-body text-sm font-medium">Flamingo aur Maina</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">Room</span>
                <span className="text-white font-body text-sm font-medium">{room.name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">Room Type</span>
                <span className="text-white/85 font-body text-sm">{room.type}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">Guests</span>
                <span className="text-white/85 font-body text-sm">Up to {room.capacity}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-white/40 font-body text-[12px] tracking-[0.1em] uppercase">Price</span>
                <div className="text-right">
                  <div className="text-[#C9A86A] font-display text-xl font-semibold tracking-tight">₹{room.price.toLocaleString('en-IN')}</div>
                  <div className="text-white/30 font-body text-[11px]">/ night · Including GST</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <button className="w-full py-3.5 rounded-full font-body text-[12px] font-medium tracking-[0.15em] uppercase transition-all duration-400 bg-gradient-to-r from-[#2E5E4E] to-[#3A7A64] text-white shadow-[0_4px_20px_rgba(46,94,78,0.3)] hover:shadow-[0_8px_32px_rgba(46,94,78,0.45)] hover:scale-[1.02] active:scale-[0.98]">
                Proceed to Book
              </button>
              <p className="text-center text-white/25 font-body text-[11px] mt-3">No payment needed yet</p>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
