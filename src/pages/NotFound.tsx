export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06080A] px-4">
      <div className="text-center">
        <h1 className="font-display text-8xl text-white/20 mb-4">404</h1>
        <p className="text-white/50 mb-6">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#2E5E4E] text-white text-sm hover:bg-[#3a705e] transition-all"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
