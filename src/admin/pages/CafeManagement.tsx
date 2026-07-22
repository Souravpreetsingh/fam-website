import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CafeOrder {
  id: string
  guest: string
  room: string
  items: { name: string; qty: number; price: number }[]
  total: number
  status: 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled'
  time: string
  note?: string
}

const initialOrders: CafeOrder[] = [
  { id: 'ORD-001', guest: 'Ananya Sharma', room: 'Pine Suite', items: [{ name: 'Masala Chai', qty: 2, price: 150 }, { name: 'Veg Sandwich', qty: 1, price: 350 }], total: 650, status: 'pending', time: '10 min ago', note: 'Extra spicy' },
  { id: 'ORD-002', guest: 'Rahul Verma', room: 'Riverfront', items: [{ name: 'Pancakes', qty: 1, price: 450 }, { name: 'Fresh Juice', qty: 1, price: 200 }], total: 650, status: 'preparing', time: '5 min ago' },
  { id: 'ORD-003', guest: 'Priya Kapoor', room: 'Mountain Lodge', items: [{ name: 'Coffee', qty: 1, price: 180 }, { name: 'Brownie', qty: 1, price: 250 }], total: 430, status: 'served', time: '2 min ago' },
  { id: 'ORD-004', guest: 'Arjun Mehta', room: 'Garden View', items: [{ name: 'Noodle Bowl', qty: 2, price: 550 }], total: 1100, status: 'pending', time: '15 min ago' },
]

const menuItems = [
  { name: 'Masala Chai', price: 75, category: 'Beverages' },
  { name: 'Coffee', price: 180, category: 'Beverages' },
  { name: 'Fresh Juice', price: 200, category: 'Beverages' },
  { name: 'Smoothie', price: 250, category: 'Beverages' },
  { name: 'Veg Sandwich', price: 350, category: 'Food' },
  { name: 'Pancakes', price: 450, category: 'Food' },
  { name: 'Noodle Bowl', price: 550, category: 'Food' },
  { name: 'Brownie', price: 250, category: 'Desserts' },
  { name: 'Fruit Platter', price: 350, category: 'Desserts' },
]

const statusOrder = ['pending', 'preparing', 'served', 'completed'] as const

export default function CafeManagement() {
  const [orders, setOrders] = useState<CafeOrder[]>(initialOrders)
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders')
  const [filter, setFilter] = useState<string>('all')

  const advanceStatus = (id: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o
      const idx = statusOrder.indexOf(o.status)
      return idx < statusOrder.length - 1 ? { ...o, status: statusOrder[idx + 1] } : o
    }))
  }

  const cancelOrder = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'cancelled' as const } : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    preparing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    served: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-white/5 text-white/40 border-white/10',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Café Management</h1>
          <p className="text-white/40 text-sm mt-1">Track and manage café orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-xl text-sm transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>Orders</button>
          <button onClick={() => setActiveTab('menu')} className={`px-4 py-2 rounded-xl text-sm transition-all ${activeTab === 'menu' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>Menu</button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'preparing', 'served', 'completed', 'cancelled'].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white bg-white/5'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white text-sm font-medium">{order.guest}</p>
                      <p className="text-white/30 text-xs">{order.room}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-medium border ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-white/50">
                        <span>{item.qty}x {item.name}</span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                  {order.note && <p className="text-[10px] text-amber-400/60 mb-2">Note: {order.note}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-white font-medium text-sm">₹{order.total}</span>
                    <div className="flex gap-1.5">
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button onClick={() => advanceStatus(order.id)} className="px-3 py-1.5 rounded-lg bg-[#2E5E4E] text-white text-[10px] font-medium hover:bg-[#3a705e] transition-all">
                          {order.status === 'pending' ? 'Start Prep' : order.status === 'preparing' ? 'Mark Served' : 'Complete'}
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button onClick={() => cancelOrder(order.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-medium hover:bg-red-500/20 transition-all">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-white/20 mt-2">{order.time}</p>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/30 text-sm">No orders found</div>
              )}
            </div>
          </AnimatePresence>
        </>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Item</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-right px-5 py-3 font-medium">Price</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item, i) => (
                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white">{item.name}</td>
                  <td className="px-5 py-3 text-white/50">{item.category}</td>
                  <td className="px-5 py-3 text-white text-right">₹{item.price}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-[#C9A86A] text-xs hover:text-[#d4b87a]">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
