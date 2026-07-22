import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number
  condition: string
  location: string
  icon: string
  humidity: number
  windSpeed: number
}

const MOCK_WEATHER: WeatherData = {
  temp: 18,
  condition: 'Clear Sky',
  location: 'Jibhi, Himachal Pradesh',
  icon: 'clear_day',
  humidity: 65,
  windSpeed: 12,
}

export default function WeatherWidget() {
  const [weather] = useState<WeatherData>(MOCK_WEATHER)
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setTime(d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  const isNight = new Date().getHours() < 6 || new Date().getHours() >= 18

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]">
        <div className={`w-full h-full rounded-full blur-3xl ${isNight ? 'bg-blue-300' : 'bg-amber-300'}`} />
      </div>
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Weather</p>
          <p className="text-3xl font-light text-white">{weather.temp}°C</p>
          <p className="text-white/50 text-sm mt-0.5">{weather.condition}</p>
        </div>
        <span className="material-symbols-outlined text-3xl text-[#C9A86A]" style={{ fontVariationSettings: '"FILL" 1' }}>
          {isNight ? 'bedtime' : weather.icon}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-4 text-white/30 text-xs">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {weather.location}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">water_drop</span>
          {weather.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">air</span>
          {weather.windSpeed} km/h
        </span>
      </div>
      <div className="mt-3 text-white/20 text-[10px]">{time}</div>
    </div>
  )
}
