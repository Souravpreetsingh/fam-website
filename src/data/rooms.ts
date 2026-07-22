export interface Room {
  id: string
  name: string
  type: string
  capacity: number
  price: number
  description: string
  image: string
  amenities: string[]
}

export const ROOMS: Room[] = [
  {
    id: 'flamingo-1',
    name: 'Flamingo 1',
    type: 'Duplex',
    capacity: 4,
    price: 6000,
    description: 'Spanning two levels with panoramic valley views, this duplex retreat offers ample space for families or small groups seeking mountain serenity.',
    image: '/images/hero/luxury-hero.jpg',
    amenities: ['Mountain View', 'King Bed', 'Private Balcony', 'Living Room', 'Wi-Fi', 'Heater', 'Hot Water', 'Premium Toiletries'],
  },
  {
    id: 'flamingo-2',
    name: 'Flamingo 2',
    type: 'King Attic',
    capacity: 4,
    price: 5000,
    description: 'A charming attic room with vaulted ceilings and skylights, perfect for a cozy family stay under the stars.',
    image: '/images/hero/luxury-hero.jpg',
    amenities: ['Skylight', 'King Bed', 'Attic Charm', 'Wi-Fi', 'Heater', 'Hot Water', 'Premium Toiletries', 'Mountain View'],
  },
  {
    id: 'flamingo-3',
    name: 'Flamingo 3',
    type: 'Duplex',
    capacity: 4,
    price: 6000,
    description: 'An elegant duplex featuring Himalayan sunrise views, a private living area, and premium comforts for an unforgettable stay.',
    image: '/images/hero/luxury-hero.jpg',
    amenities: ['Sunrise View', 'Duplex Layout', 'Living Room', 'Wi-Fi', 'Heater', 'Hot Water', 'Premium Toiletries'],
  },
  {
    id: 'maina-1',
    name: 'Maina 1',
    type: 'Private Room',
    capacity: 2,
    price: 2500,
    description: 'A serene private room with forest views, ideal for couples seeking quietude and connection with nature.',
    image: '/images/hero/luxury-hero.jpg',
    amenities: ['Forest View', 'Queen Bed', 'Reading Nook', 'Wi-Fi', 'Heater', 'Hot Water'],
  },
  {
    id: 'maina-2',
    name: 'Maina 2',
    type: 'Private Room',
    capacity: 2,
    price: 2000,
    description: 'Minimalist comfort meets mountain charm in this cozy private room — a restful haven for budget-conscious travelers.',
    image: '/images/hero/luxury-hero.jpg',
    amenities: ['Compact Design', 'Queen Bed', 'Mountain View', 'Wi-Fi', 'Heater', 'Hot Water'],
  },
  {
    id: 'maina-3',
    name: 'Maina 3',
    type: 'Private Room',
    capacity: 2,
    price: 2500,
    description: 'A bright and airy private room with garden access, designed for peaceful mornings and tranquil evenings.',
    image: '/images/hero/luxury-hero.jpg',
    amenities: ['Garden Access', 'Queen Bed', 'Workspace', 'Wi-Fi', 'Heater', 'Hot Water', 'Natural Light'],
  },
]
