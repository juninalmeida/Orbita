import { useEffect, useRef } from 'react'

// --- Simple 2D value noise (no dependencies) ---

const NOISE_SIZE = 256

// Permutation table (integer indices for hashing)
const perm: number[] = []
for (let i = 0; i < NOISE_SIZE; i++) perm[i] = i
for (let i = NOISE_SIZE - 1; i > 0; i--) {
  const j = Math.floor(Math.abs(Math.sin(i * 137.508) * 43758.5453) % (i + 1))
  const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp
}
// Random value table
const values: number[] = []
for (let i = 0; i < NOISE_SIZE; i++) {
  values[i] = Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

function hash(xi: number, yi: number): number {
  return perm[(perm[xi & (NOISE_SIZE - 1)] + yi) & (NOISE_SIZE - 1)]
}

function noise2d(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const sx = smoothstep(xf)
  const sy = smoothstep(yf)
  const n00 = values[hash(xi, yi)]
  const n10 = values[hash(xi + 1, yi)]
  const n01 = values[hash(xi, yi + 1)]
  const n11 = values[hash(xi + 1, yi + 1)]
  const nx0 = n00 + sx * (n10 - n00)
  const nx1 = n01 + sx * (n11 - n01)
  return nx0 + sy * (nx1 - nx0)
}

function fbm(x: number, y: number): number {
  return noise2d(x, y) * 0.5 + noise2d(x * 2, y * 2) * 0.3 + noise2d(x * 4, y * 4) * 0.2
}

// --- Aurora ribbon config ---

interface Ribbon {
  yBase: number       // vertical position (0-1)
  height: number      // ribbon height fraction
  speed: number       // wave speed
  freq: number        // wave frequency
  amplitude: number   // wave amplitude
  color: [number, number, number]
  opacity: number
  phaseOffset: number
}

const RIBBONS: Ribbon[] = [
  // Upper warm atmospheric band (orange/red)
  { yBase: 0.28, height: 0.12, speed: 0.08, freq: 1.2, amplitude: 0.03, color: [234, 120, 40], opacity: 0.25, phaseOffset: 0 },
  // Main green band — brightest
  { yBase: 0.38, height: 0.22, speed: 0.12, freq: 0.8, amplitude: 0.05, color: [34, 197, 94], opacity: 0.65, phaseOffset: 2 },
  // Emerald core
  { yBase: 0.42, height: 0.14, speed: 0.1, freq: 1.0, amplitude: 0.035, color: [52, 211, 153], opacity: 0.55, phaseOffset: 4 },
  // Magenta/pink accent
  { yBase: 0.44, height: 0.10, speed: 0.06, freq: 1.5, amplitude: 0.025, color: [236, 72, 153], opacity: 0.3, phaseOffset: 6 },
  // Lower green glow — diffuse
  { yBase: 0.55, height: 0.25, speed: 0.05, freq: 0.6, amplitude: 0.04, color: [22, 163, 74], opacity: 0.3, phaseOffset: 8 },
]

function drawRibbon(
  ctx: CanvasRenderingContext2D,
  ribbon: Ribbon,
  w: number,
  h: number,
  time: number,
) {
  const steps = Math.max(12, Math.floor(w / 60))
  const points: { x: number; y: number }[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const noiseVal = fbm(t * ribbon.freq * 3 + ribbon.phaseOffset, time * ribbon.speed + ribbon.phaseOffset)
    const waveY = Math.sin(t * Math.PI * 2 * ribbon.freq + time * ribbon.speed * 4 + ribbon.phaseOffset) * ribbon.amplitude
    const y = ribbon.yBase + waveY + (noiseVal - 0.5) * ribbon.amplitude * 2
    points.push({ x: t * w, y: y * h })
  }

  const ribbonH = ribbon.height * h
  const breathe = 0.85 + 0.15 * Math.sin(time * 0.3 + ribbon.phaseOffset)
  const [r, g, b] = ribbon.color
  const alpha = ribbon.opacity * breathe

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2)
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)

  // Close bottom
  const lastPt = points[points.length - 1]
  ctx.lineTo(lastPt.x, lastPt.y + ribbonH)
  for (let i = points.length - 1; i >= 0; i--) {
    const bottomY = points[i].y + ribbonH
    if (i > 0) {
      const prev = points[i]
      const curr = points[i - 1]
      const cpx = (prev.x + curr.x) / 2
      ctx.quadraticCurveTo(prev.x, bottomY, cpx, (bottomY + curr.y + ribbonH) / 2)
    } else {
      ctx.lineTo(points[0].x, points[0].y + ribbonH)
    }
  }
  ctx.closePath()

  // Gradient fill
  const grad = ctx.createLinearGradient(0, points[0].y - 20, 0, points[0].y + ribbonH + 40)
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
  grad.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`)
  grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha})`)
  grad.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`)
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

  ctx.fillStyle = grad
  ctx.shadowBlur = ribbon.height * h * 0.8
  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`
  ctx.fill()
  ctx.restore()
}

function drawVerticalRays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
) {
  const rayCount = Math.max(8, Math.floor(w / 80))

  for (let i = 0; i < rayCount; i++) {
    const t = i / rayCount
    const x = t * w + fbm(t * 5, time * 0.05) * 60 - 30
    const noiseVal = fbm(t * 3 + 10, time * 0.08)
    const alpha = noiseVal * 0.18
    if (alpha < 0.02) continue

    const rayTop = h * (0.22 + fbm(t * 2, time * 0.03) * 0.08)
    const rayBottom = h * (0.58 + fbm(t * 2 + 5, time * 0.04) * 0.1)
    const rayWidth = 1 + noiseVal * 2.5

    const grad = ctx.createLinearGradient(x, rayTop, x, rayBottom)
    grad.addColorStop(0, `rgba(74, 222, 128, 0)`)
    grad.addColorStop(0.2, `rgba(74, 222, 128, ${alpha})`)
    grad.addColorStop(0.5, `rgba(34, 197, 94, ${alpha * 1.3})`)
    grad.addColorStop(0.8, `rgba(52, 211, 153, ${alpha * 0.6})`)
    grad.addColorStop(1, `rgba(34, 197, 94, 0)`)

    ctx.save()
    ctx.strokeStyle = grad
    ctx.lineWidth = rayWidth
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(time * 0.5 + i)
    ctx.beginPath()
    ctx.moveTo(x, rayTop)
    ctx.lineTo(x + fbm(t * 4, time * 0.1) * 15 - 7, rayBottom)
    ctx.stroke()
    ctx.restore()
  }
}

export function Aurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas!.width = window.innerWidth * dpr
      canvas!.height = window.innerHeight * dpr
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const startTime = performance.now()

    function draw() {
      const now = performance.now()
      const time = (now - startTime) / 1000
      const w = window.innerWidth
      const h = window.innerHeight

      ctx!.clearRect(0, 0, w, h)

      // Draw ribbons (back to front)
      for (const ribbon of RIBBONS) {
        drawRibbon(ctx!, ribbon, w, h, reducedMotion ? 0 : time)
      }

      // Vertical aurora rays/curtains
      drawVerticalRays(ctx!, w, h, reducedMotion ? 0 : time)

      if (!reducedMotion) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
    if (reducedMotion) {
      // Render one static frame
      return () => window.removeEventListener('resize', resize)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* Dark sky above */}
      <div
        className="absolute top-0 left-0 w-full h-[35%]"
        style={{
          background:
            'linear-gradient(180deg, #000000 0%, rgba(0,0,0,0.85) 45%, transparent 100%)',
        }}
      />

      {/* Bottom fade to pure black */}
      <div
        className="absolute bottom-0 left-0 w-full h-[40%]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 40%, #000000 100%)',
        }}
      />
    </div>
  )
}
