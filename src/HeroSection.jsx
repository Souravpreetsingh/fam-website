import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] },
  },
};

export default function HeroSection() {
  return (
    <motion.div
      className="hero-content-inner"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="hero-label">
        FLAMINGO AUR MAINA
      </motion.div>

      <motion.h1 variants={item} className="hero-fam">
        FAM
      </motion.h1>

      <motion.div variants={item} className="hero-welcome">
        Welcome Home
      </motion.div>

      <motion.div variants={item} className="hero-sub-label">
        Luxury Boutique Café & Mountain Stays
      </motion.div>

      <motion.p variants={item} className="hero-tagline">
        Some Places Stay in Your Heart Forever
      </motion.p>

      <motion.p variants={item} className="hero-desc">
        Discover peaceful mornings, breathtaking mountain sunsets, cozy boutique stays, and unforgettable memories at Flamingo aur Maina. Nestled in the heart of Jibhi, FAM is a place where nature, comfort, and heartfelt hospitality come together to make every stay feel like home.
      </motion.p>

      <motion.div variants={item} className="hero-btns">
        <a href="pages/rooms.html" className="hero-btn-primary">
          <span>Book Your Stay</span>
          <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
        </a>
        <a href="#story" className="hero-btn-secondary">
          Explore Rooms
        </a>
      </motion.div>
    </motion.div>
  );
}
