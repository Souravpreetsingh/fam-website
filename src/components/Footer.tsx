import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06080A]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl text-white mb-3">Flamingo aur Maina</h3>
            <p className="text-white/50 text-sm max-w-md leading-relaxed">
              A luxury mountain retreat nestled in the heart of the Himalayas. Where every moment becomes a cherished memory.
            </p>
          </div>
          <div>
            <h4 className="text-white/70 font-medium text-sm mb-4 tracking-wider uppercase">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-white/50 hover:text-white text-sm transition-colors">Home</Link>
              <Link to="/rooms" className="text-white/50 hover:text-white text-sm transition-colors">Rooms</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white/70 font-medium text-sm mb-4 tracking-wider uppercase">Support</h4>
            <div className="flex flex-col gap-2">
              <a href="tel:9876575673" className="text-white/50 hover:text-white text-sm transition-colors">98765 75673</a>
              <a href="mailto:hello@flamingoaurmaina.com" className="text-white/50 hover:text-white text-sm transition-colors">hello@flamingoaurmaina.com</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/30 text-xs">
          &copy; {new Date().getFullYear()} Flamingo aur Maina. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
