import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const suggestions = [
  'Suggest a dinner spot near Jibhi',
  'What activities are available today?',
  'Recommend a trekking route',
  'What\'s the best time for a bonfire?',
  'Arrange a cab for tomorrow morning',
]

export default function AIConcierge() {
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([
    { role: 'assistant', text: 'Welcome to FAM Concierge. I can help plan your mountain experience. What would you like to arrange?' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return
    setMessages((prev) => [...prev, { role: 'user', text: text.trim() }])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const responses: Record<string, string> = {
        'Suggest a dinner spot near Jibhi': 'The Riverside Grill at Jibhi offers fresh trout and Himalayan herbs with a view of the river. Open 6–10 PM. Shall I book?',
        'What activities are available today?': 'Today we have: 7 AM Yoga by the river, 10 AM Forest Trek (3 hrs), 2 PM Pottery Workshop, 6 PM Bonfire with storytelling. Book any from your dashboard.',
        'Recommend a trekking route': 'The Serolsar Lake trek (5 km, moderate) starts at 7 AM from the property. Pack water, snacks, and a light jacket. Ready to book?',
        'What\'s the best time for a bonfire?': 'Bonfires are best at 6 PM as the sun sets behind the mountains. We can arrange Himalayan snacks and live acoustic music.',
        'Arrange a cab for tomorrow morning': 'Sure! Please specify the time and destination, and I\'ll arrange a cab from our trusted local fleet.',
      }

      const reply = responses[text.trim()] || 'I\'ll look into that for you. Let me check with the FAM team and get back to you shortly.'

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E5E4E] to-[#1a3a30] flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-white">spa</span>
          </div>
          <div>
            <h3 className="text-white text-sm font-medium">AI Concierge</h3>
            <p className="text-white/30 text-[10px]">Mountain Guide</p>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2E5E4E] text-white rounded-tr-sm'
                    : 'bg-white/10 text-white/80 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            className="text-[11px] text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all border border-white/5"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask anything about your stay..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#2E5E4E] transition-colors"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-[#2E5E4E] text-white text-sm font-medium hover:bg-[#3a705e] disabled:opacity-40 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
