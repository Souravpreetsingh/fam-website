import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const syncSize = () => {
      const w = canvas.clientWidth || 1280
      const h = canvas.clientHeight || 720
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncSize).observe(canvas)
    }
    syncSize()

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (!gl) return

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
void main() {
    vec2 uv = v_texCoord;
    vec2 mouse = u_mouse / u_resolution;
    float ray = sin(uv.x * 2.0 - uv.y * 3.0 + u_time * 0.2) * 0.5 + 0.5;
    ray *= snoise(uv * 1.5 + u_time * 0.05) * 0.5 + 0.5;
    float fog = snoise(uv * 2.0 + vec2(u_time * 0.1, u_time * 0.05));
    float fog2 = snoise(uv * 4.0 - vec2(u_time * 0.05, u_time * 0.1));
    vec3 sunColor = vec3(1.0, 0.8, 0.5);
    vec3 skyColor = vec3(0.1, 0.15, 0.12);
    vec3 color = mix(skyColor, sunColor, ray * 0.3);
    color += vec3(0.9, 0.9, 1.0) * (fog * 0.05 + fog2 * 0.02);
    float dist = distance(uv, mouse);
    color += sunColor * (1.0 - smoothstep(0.0, 0.6, dist)) * 0.1;
    float vignette = 1.0 - smoothstep(0.4, 1.3, distance(uv, vec2(0.5)));
    color *= vignette;
    gl_FragColor = vec4(color, 0.4);
}`

    const prog = gl.createProgram()!
    const cs = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect()
      if (rect.width && rect.height) {
        mouseX = ((e.clientX - rect.left) / rect.width) * canvas!.width
        mouseY = (1 - (e.clientY - rect.top) / rect.height) * canvas!.height
      }
    }
    window.addEventListener('mousemove', handleMouse)

    let animId: number
    const render = (t: number) => {
      if (typeof ResizeObserver === 'undefined') syncSize()
      gl.viewport(0, 0, canvas!.width, canvas!.height)
      if (uTime) gl.uniform1f(uTime, t * 0.001)
      if (uRes) gl.uniform2f(uRes, canvas!.width, canvas!.height)
      if (uMouse) gl.uniform2f(uMouse, mouseX, mouseY)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animId = requestAnimationFrame(render)
    }
    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouse)
      gl.deleteProgram(prog)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-overlay opacity-60" />
}

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [dateTime, setDateTime] = useState('')
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setDateTime(d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' | ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const id = setInterval(update, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async (data: LoginForm) => {
    setError('')
    try {
      await login(data.email, data.password)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen h-screen w-screen overflow-hidden bg-[#faf6f0] text-[#2e3230] font-['Nunito_Sans',sans-serif]">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida/AP1WRLtwyW4ZxWbSKrIgqdalpRJHc2ovjuammcdxGnsMDxL8XsEuy5xyNldXSlEv06VJJZ8h5ZR4Cv14p-_e2CbR5CJe0iyGSZBvXt7WINwgbG6dJVrk0J6J9DeVRkoSpIG0d3s2ZSQvxUMQFsGNAKMxr5HWbX_YQkR0NLt1sAqdgEZ_8RgxIGuoMAs3_bsMEMDNroG3h83n_-sPAm35ALL25kt9D8MoPZJLR6ViXK2kSf4L1CGqaDI2_jjdVQ"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2e3230]/80 via-[#2e3230]/40 to-transparent" />
        <WebGLShader />
      </div>

      <main className="relative z-10 w-full h-full flex flex-col md:flex-row">
        <section className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[#8ecf9e]" style={{ fontVariationSettings: '"FILL" 1' }}>landscape</span>
            <span className="font-['Literata',serif] text-2xl font-bold tracking-tight text-white drop-shadow-md">FAM Mountain Retreat</span>
          </div>
          <div className="max-w-2xl mt-auto pb-12">
            <h1 className="font-['Literata',serif] text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight drop-shadow-lg mb-6">
              Welcome to <br /> Your Sanctuary.
            </h1>
            <p className="text-lg md:text-xl text-[#f5f1ea]/90 tracking-wide font-light max-w-lg drop-shadow">
              Immerse yourself in rooted warmth and organic luxury. Your mountain escape begins here.
            </p>
          </div>
          <div className="mt-8">
            <a href="#" className="inline-flex items-center gap-2 text-[#f5f1ea] hover:text-white transition-colors text-sm uppercase tracking-widest font-semibold">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              Guest Services
            </a>
          </div>
        </section>

        <section className="w-full md:w-[500px] lg:w-[600px] h-full flex items-center justify-end p-4 md:p-8 lg:pr-16">
          <div className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-in-right flex flex-col">
            <div className="px-8 pt-8 pb-6 border-b border-[#e4e0d8] flex justify-between items-center bg-[#f5f1ea]">
              <div className="flex items-center gap-2 text-[#6b6358]">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
                <span className="text-sm font-semibold tracking-wider uppercase">{dateTime}</span>
              </div>
              <div className="flex items-center gap-2 text-[#705c30]">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>wb_twilight</span>
                <span className="text-sm font-bold">12°C</span>
              </div>
            </div>

            <div className="p-8 bg-[#faf6f0] flex-1 flex flex-col py-10">
              <h2 className="font-['Literata',serif] text-3xl text-[#2e3230] mb-2">Check In</h2>
              <p className="text-[#6b6358] mb-8 text-sm tracking-wide">Please verify your details to access your itinerary.</p>

              {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#74796e]">mail</span>
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className="block w-full pl-12 pr-4 py-4 bg-[#faf6f0] border border-[#c4c8bc] rounded-xl text-[#2e3230] placeholder-[#6b6358] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all duration-300"
                    placeholder="Email Address"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500 ml-2">{errors.email.message}</p>}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#74796e]">lock</span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="block w-full pl-12 pr-12 py-4 bg-[#faf6f0] border border-[#c4c8bc] rounded-xl text-[#2e3230] placeholder-[#6b6358] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] transition-all duration-300"
                    placeholder="Password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#74796e] hover:text-[#4a7c59] transition-colors">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                  {errors.password && <p className="mt-1 text-xs text-red-500 ml-2">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-5 w-5 rounded border-[#c4c8bc] text-[#4a7c59] focus:ring-[#4a7c59] bg-[#faf6f0]" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[#6b6358]">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="font-semibold text-[#705c30] hover:text-[#4a7c59] transition-colors text-sm">Forgot password?</Link>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-['Literata',serif] font-bold text-white bg-[#4a7c59] hover:bg-[#2a6038] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a7c59] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : null}
                    Begin Your Stay
                    <span className="material-symbols-outlined ml-2 text-xl">arrow_right_alt</span>
                  </button>
                </div>
              </form>

              <div className="mt-8 mb-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e4e0d8]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#faf6f0] text-[#6b6358]">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link to="/register" className="w-full flex justify-center items-center py-3 px-4 border border-[#c4c8bc] rounded-xl bg-[#faf6f0] text-sm font-semibold text-[#2e3230] hover:bg-[#f0ece4] transition-colors">
                  <span className="material-symbols-outlined mr-2 text-[20px]">person_add</span>
                  Create Account
                </Link>
                <button type="button" className="w-full flex justify-center items-center py-3 px-4 border border-[#c4c8bc] rounded-xl bg-[#faf6f0] text-sm font-semibold text-[#2e3230] hover:bg-[#f0ece4] transition-colors">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
              </div>

              <div className="mt-auto pt-8 border-t border-[#e4e0d8]/50">
                <h3 className="text-[#6b6358] text-[10px] uppercase tracking-widest font-bold mb-3">Resort Highlights</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#6b6358] text-sm">
                    <span className="w-1 h-1 rounded-full bg-[#705c30]" />
                    Infinity Pool open until 22:00
                  </li>
                  <li className="flex items-center gap-2 text-[#6b6358] text-sm">
                    <span className="w-1 h-1 rounded-full bg-[#705c30]" />
                    Evening Wine Tasting at 19:30
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
