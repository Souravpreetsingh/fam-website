interface RewardTier {
  name: string
  points: number
  color: string
  benefits: string[]
}

const tiers: RewardTier[] = [
  { name: 'Silver', points: 0, color: 'from-gray-400 to-gray-300', benefits: ['Welcome drink', '10% off food'] },
  { name: 'Gold', points: 500, color: 'from-amber-400 to-yellow-300', benefits: ['Welcome drink', '15% off food', 'Early check-in'] },
  { name: 'Platinum', points: 1500, color: 'from-purple-400 to-pink-300', benefits: ['Welcome drink', '20% off food', 'Early check-in', 'Room upgrade', 'Airport transfer'] },
  { name: 'Diamond', points: 3000, color: 'from-cyan-400 to-blue-300', benefits: ['All Platinum benefits', 'Complimentary spa', 'Personal concierge', 'Late checkout'] },
]

export default function Rewards({ points = 850 }: { points?: number }) {
  const currentTier = tiers.reduce((prev, curr) => (points >= curr.points ? curr : prev), tiers[0])
  const nextTier = tiers.find((t) => t.points > points)
  const progress = nextTier ? ((points - currentTier.points) / (nextTier.points - currentTier.points)) * 100 : 100

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-display text-sm">Mountain Rewards</h3>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${currentTier.color} text-black`}>
          {currentTier.name}
        </span>
      </div>
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-white">{points}</span>
        <span className="text-white/40 text-sm ml-1">points</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${currentTier.color} transition-all duration-700`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {nextTier && (
        <p className="text-white/30 text-xs text-center mb-3">
          {nextTier.points - points} more points to {nextTier.name}
        </p>
      )}
      <div className="space-y-1.5">
        {currentTier.benefits.map((b) => (
          <div key={b} className="flex items-center gap-2 text-white/60 text-xs">
            <span className="material-symbols-outlined text-[14px] text-[#C9A86A]">check_circle</span>
            {b}
          </div>
        ))}
      </div>
    </div>
  )
}
