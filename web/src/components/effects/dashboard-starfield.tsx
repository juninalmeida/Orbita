import { useEffect, useRef } from 'react'

// ─── Noise (same engine as aurora.tsx) ───────────────────────────

const N = 256
const perm: number[] = []
for (let i = 0; i < N; i++) perm[i] = i
for (let i = N - 1; i > 0; i--) {
  const j = Math.floor(Math.abs(Math.sin(i * 137.508) * 43758.5453) % (i + 1))
  const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp
}
const vals: number[] = []
for (let i = 0; i < N; i++) {
  vals[i] = Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1
}

function sm(t: number) { return t * t * (3 - 2 * t) }
function h(x: number, y: number) { return perm[(perm[x & (N - 1)] + y) & (N - 1)] }
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const sx = sm(xf), sy = sm(yf)
  const a = vals[h(xi, yi)], b = vals[h(xi + 1, yi)]
  const c = vals[h(xi, yi + 1)], d = vals[h(xi + 1, yi + 1)]
  return a + sx * (b - a) + sy * (c - a + sx * (d - b - c + a))
}
function fbm(x: number, y: number) {
  return noise(x, y) * 0.5 + noise(x * 2, y * 2) * 0.3 + noise(x * 4, y * 4) * 0.2
}

// ─── Pseudo-random ───────────────────────────────────────────────

function pr(i: number) {
  const n = Math.sin(i * 137.508 + 0.1) * 43758.5453
  return n - Math.floor(n)
}

// ─── Types ───────────────────────────────────────────────────────

interface OrbitRing {
  tiltX: number       // tilt around X axis (radians)
  tiltZ: number       // tilt around Z axis (radians)
  radiusMul: number   // radius multiplier
  speed: number       // rotation speed (rad/s)
  direction: number   // 1 or -1
  particles: OrbitalParticle[]
  color: [number, number, number]
  lineOpacity: number
}

interface OrbitalParticle {
  angle: number
  offset: number      // radial offset from perfect ring
  size: number
  baseOpacity: number
  phase: number
}

interface AmbientStar {
  x: number
  y: number
  z: number
  size: number
  baseOpacity: number
  twinkleSpeed: number
  phase: number
  r: number
  g: number
  b: number
}

interface PulseRing {
  x: number
  y: number
  radius: number
  maxRadius: number
  life: number
  maxLife: number
  r: number
  g: number
  b: number
}

// ─── Generate orbital rings (armillary sphere) ──────────────────

const RING_CONFIGS: {
  tiltX: number; tiltZ: number; radiusMul: number
  speed: number; direction: number; count: number
  color: [number, number, number]; lineOpacity: number
}[] = [
  // Main ring — large, slow, emerald
  { tiltX: 1.1, tiltZ: 0.3, radiusMul: 1.0, speed: 0.04, direction: 1, count: 80, color: [16, 185, 129], lineOpacity: 0.04 },
  // Second ring — medium, different tilt, teal
  { tiltX: 0.5, tiltZ: -0.8, radiusMul: 0.75, speed: 0.06, direction: -1, count: 55, color: [20, 184, 166], lineOpacity: 0.03 },
  // Third ring — smaller, fast, blue-emerald
  { tiltX: 1.4, tiltZ: 1.2, radiusMul: 0.55, speed: 0.09, direction: 1, count: 40, color: [52, 211, 153], lineOpacity: 0.025 },
]

function generateRings(): OrbitRing[] {
  return RING_CONFIGS.map((cfg, ri) => {
    const particles: OrbitalParticle[] = []
    for (let i = 0; i < cfg.count; i++) {
      const seed = ri * 1000 + i
      particles.push({
        angle: (i / cfg.count) * Math.PI * 2 + (pr(seed) - 0.5) * 0.1,
        offset: (pr(seed + 100) - 0.5) * 0.06,
        size: 0.4 + pr(seed + 200) * 1.4,
        baseOpacity: 0.15 + pr(seed + 300) * 0.55,
        phase: pr(seed + 400) * Math.PI * 2,
      })
    }
    return {
      tiltX: cfg.tiltX,
      tiltZ: cfg.tiltZ,
      radiusMul: cfg.radiusMul,
      speed: cfg.speed,
      direction: cfg.direction,
      particles,
      color: cfg.color,
      lineOpacity: cfg.lineOpacity,
    }
  })
}

function generateAmbientStars(): AmbientStar[] {
  const stars: AmbientStar[] = []
  for (let i = 0; i < 120; i++) {
    const s = i + 5000
    let r = 255, g = 255, b = 255
    const cs = pr(s + 800)
    if (cs < 0.10) { r = 255; g = 245; b = 200 }
    else if (cs < 0.18) { r = 195; g = 220; b = 255 }
    else if (cs < 0.25) { r = 180; g = 255; b = 220 }

    stars.push({
      x: pr(s),
      y: pr(s + 100),
      z: 0.1 + pr(s + 200) * 0.9,
      size: 0.3 + pr(s + 300) * 1.0,
      baseOpacity: 0.08 + pr(s + 400) * 0.35,
      twinkleSpeed: 0.2 + pr(s + 500) * 0.9,
      phase: pr(s + 600) * Math.PI * 2,
      r, g, b,
    })
  }
  return stars
}

const rings = generateRings()
const ambientStars = generateAmbientStars()

// ─── 3D projection helpers ──────────────────────────────────────

function project3D(
  theta: number,
  radiusX: number,
  radiusY: number,
  tiltX: number,
  tiltZ: number,
  offset: number,
) {
  const rx = radiusX * (1 + offset)
  const ry = radiusY * (1 + offset)

  // Position on flat ring
  const px = Math.cos(theta) * rx
  const py = Math.sin(theta) * ry

  // Tilt around X axis
  const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX)
  const y1 = py * cosX
  const z1 = py * sinX

  // Tilt around Z axis
  const cosZ = Math.cos(tiltZ), sinZ = Math.sin(tiltZ)
  const x2 = px * cosZ - y1 * sinZ
  const y2 = px * sinZ + y1 * cosZ

  return { x: x2, y: y2, z: z1 }
}

// ─── Component ──────────────────────────────────────────────────

export function DashboardStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0, sx: 0, sy: 0 })
  const pulsesRef = useRef<PulseRing[]>([])
  const pulseTimerRef = useRef(3)

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

    function onMouse(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    const t0 = performance.now()
    let lastTime = t0

    function draw() {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      const time = (now - t0) / 1000
      const w = window.innerWidth
      const h = window.innerHeight
      const dim = Math.min(w, h)

      const m = mouseRef.current
      m.sx += (m.x - m.sx) * 0.03
      m.sy += (m.y - m.sy) * 0.03
      const px = reducedMotion ? 0 : 12

      ctx!.clearRect(0, 0, w, h)

      // ═══ NEBULA (noise-driven flowing clouds) ═══
      // Draw large soft patches of color using fbm noise
      const nebulaConfigs = [
        { color: [16, 185, 129], ox: 0, oy: 0, scale: 0.8 },      // emerald
        { color: [20, 140, 160], ox: 3.5, oy: 2.1, scale: 0.7 },  // teal
        { color: [60, 80, 170], ox: 7.2, oy: 4.8, scale: 0.6 },   // deep blue
        { color: [100, 50, 140], ox: 11, oy: 8, scale: 0.5 },     // purple
      ]

      for (const neb of nebulaConfigs) {
        const [nr, ng, nb] = neb.color
        const timeOff = reducedMotion ? 0 : time * 0.015
        // Sample a few large blobs driven by noise
        const blobCount = 3
        for (let bi = 0; bi < blobCount; bi++) {
          const noiseX = fbm(neb.ox + bi * 2.3 + timeOff, neb.oy + bi * 1.7)
          const noiseY = fbm(neb.ox + bi * 1.1, neb.oy + bi * 3.2 + timeOff)
          const bx = noiseX * w + m.sx * px * 0.15
          const by = noiseY * h + m.sy * px * 0.15
          const blobR = dim * (0.15 + fbm(neb.ox + bi + 5, neb.oy + timeOff * 0.5) * 0.2) * neb.scale
          const blobAlpha = 0.02 + fbm(neb.ox + bi * 4, neb.oy + timeOff * 0.8) * 0.025

          const grad = ctx!.createRadialGradient(bx, by, 0, bx, by, blobR)
          grad.addColorStop(0, `rgba(${nr}, ${ng}, ${nb}, ${blobAlpha})`)
          grad.addColorStop(0.5, `rgba(${nr}, ${ng}, ${nb}, ${blobAlpha * 0.4})`)
          grad.addColorStop(1, `rgba(${nr}, ${ng}, ${nb}, 0)`)

          ctx!.beginPath()
          ctx!.arc(bx, by, blobR, 0, Math.PI * 2)
          ctx!.fillStyle = grad
          ctx!.fill()
        }
      }

      // ═══ AMBIENT STARS ═══
      for (const star of ambientStars) {
        const starPx = px * star.z
        const sx = star.x * w + m.sx * starPx
        const sy = star.y * h + m.sy * starPx
        const twAmp = reducedMotion ? 0.05 : 0.22
        const tw = Math.sin(time * star.twinkleSpeed + star.phase) * twAmp
          + Math.sin(time * star.twinkleSpeed * 0.6 + star.phase * 1.5) * twAmp * 0.2
        const op = Math.max(0.02, star.baseOpacity + tw)

        ctx!.beginPath()
        ctx!.arc(sx, sy, star.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${op})`
        if (star.size > 1.0 && op > 0.35) {
          ctx!.shadowBlur = star.size * 4
          ctx!.shadowColor = `rgba(${star.r}, ${star.g}, ${star.b}, ${op * 0.25})`
        } else {
          ctx!.shadowBlur = 0
        }
        ctx!.fill()
      }
      ctx!.shadowBlur = 0

      // ═══ ORBITAL RINGS (armillary sphere) ═══
      const centerX = w * 0.52
      const centerY = h * 0.48
      const baseRadiusX = dim * 0.38
      const baseRadiusY = dim * 0.36

      // Collect all particles across all rings for depth sorting
      const allProjected: {
        sx: number; sy: number; z: number
        size: number; opacity: number
        r: number; g: number; b: number
      }[] = []

      for (const ring of rings) {
        const rotOffset = reducedMotion ? 0 : time * ring.speed * ring.direction
        const radiusX = baseRadiusX * ring.radiusMul
        const radiusY = baseRadiusY * ring.radiusMul

        // Draw ring path (faint ellipse)
        ctx!.save()
        ctx!.beginPath()
        const pathSteps = 100
        for (let i = 0; i <= pathSteps; i++) {
          const theta = (i / pathSteps) * Math.PI * 2
          const p = project3D(theta, radiusX, radiusY, ring.tiltX, ring.tiltZ, 0)
          const sx = centerX + p.x + m.sx * px * 0.4
          const sy = centerY + p.y + m.sy * px * 0.4
          if (i === 0) ctx!.moveTo(sx, sy)
          else ctx!.lineTo(sx, sy)
        }
        ctx!.closePath()

        // Noise-modulated ring opacity for organic feel
        const ringBreath = 0.7 + 0.3 * Math.sin(time * 0.2 + ring.tiltX)
        ctx!.strokeStyle = `rgba(${ring.color[0]}, ${ring.color[1]}, ${ring.color[2]}, ${ring.lineOpacity * ringBreath})`
        ctx!.lineWidth = 0.8
        ctx!.stroke()
        ctx!.restore()

        // Project particles
        for (const particle of ring.particles) {
          const theta = particle.angle + rotOffset
          const p = project3D(theta, radiusX, radiusY, ring.tiltX, ring.tiltZ, particle.offset)

          // Perspective
          const depthNorm = (p.z / (baseRadiusY * ring.radiusMul) + 1) / 2
          const perspScale = 0.6 + 0.4 * depthNorm
          const depthOp = 0.3 + 0.7 * depthNorm

          // Noise-driven shimmer
          const noiseShimmer = reducedMotion ? 0 : fbm(theta * 2 + ring.tiltX, time * 0.3 + particle.phase) * 0.3 - 0.15
          const twinkle = reducedMotion ? 0 : Math.sin(time * 1.2 + particle.phase) * 0.15

          const op = Math.max(0.03, (particle.baseOpacity + twinkle + noiseShimmer) * depthOp)
          const sz = particle.size * perspScale

          allProjected.push({
            sx: centerX + p.x + m.sx * px * (0.3 + perspScale * 0.4),
            sy: centerY + p.y + m.sy * px * (0.3 + perspScale * 0.4),
            z: p.z,
            size: sz,
            opacity: op,
            r: ring.color[0],
            g: ring.color[1],
            b: ring.color[2],
          })
        }
      }

      // Depth sort (back-to-front)
      allProjected.sort((a, b) => a.z - b.z)

      // Draw orbital particles
      for (const p of allProjected) {
        ctx!.beginPath()
        ctx!.arc(p.sx, p.sy, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.opacity})`

        if (p.size > 1.0 && p.opacity > 0.3) {
          ctx!.shadowBlur = p.size * 5
          ctx!.shadowColor = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.opacity * 0.4})`
        } else {
          ctx!.shadowBlur = 0
        }
        ctx!.fill()
      }
      ctx!.shadowBlur = 0

      // ═══ PULSE BEACONS ═══
      if (!reducedMotion) {
        pulseTimerRef.current -= dt
        if (pulseTimerRef.current <= 0) {
          // Spawn from a random bright orbital particle
          const bright = allProjected.filter(p => p.opacity > 0.4 && p.size > 1.0)
          if (bright.length > 0) {
            const src = bright[Math.floor(Math.random() * bright.length)]
            pulsesRef.current.push({
              x: src.sx,
              y: src.sy,
              radius: 0,
              maxRadius: 40 + Math.random() * 50,
              life: 0,
              maxLife: 1.5 + Math.random() * 1.0,
              r: src.r,
              g: src.g,
              b: src.b,
            })
          }
          pulseTimerRef.current = 3 + Math.random() * 5
        }

        const pulses = pulsesRef.current
        for (let i = pulses.length - 1; i >= 0; i--) {
          const pulse = pulses[i]
          pulse.life += dt
          if (pulse.life > pulse.maxLife) { pulses.splice(i, 1); continue }

          const progress = pulse.life / pulse.maxLife
          pulse.radius = progress * pulse.maxRadius
          const alpha = (1 - progress) * 0.12

          ctx!.beginPath()
          ctx!.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2)
          ctx!.strokeStyle = `rgba(${pulse.r}, ${pulse.g}, ${pulse.b}, ${alpha})`
          ctx!.lineWidth = 1.5 * (1 - progress)
          ctx!.stroke()
        }
      }

      // ═══ INTERSECTION GLOW (where rings visually cross) ═══
      // Subtle glow at the center of the armillary sphere
      const glowPulse = 0.6 + 0.4 * Math.sin(time * 0.15)
      const glowR = dim * 0.06
      const coreGrad = ctx!.createRadialGradient(
        centerX + m.sx * px * 0.3,
        centerY + m.sy * px * 0.3,
        0,
        centerX + m.sx * px * 0.3,
        centerY + m.sy * px * 0.3,
        glowR,
      )
      coreGrad.addColorStop(0, `rgba(16, 185, 129, ${0.06 * glowPulse})`)
      coreGrad.addColorStop(0.5, `rgba(16, 185, 129, ${0.025 * glowPulse})`)
      coreGrad.addColorStop(1, 'rgba(16, 185, 129, 0)')
      ctx!.beginPath()
      ctx!.arc(
        centerX + m.sx * px * 0.3,
        centerY + m.sy * px * 0.3,
        glowR, 0, Math.PI * 2,
      )
      ctx!.fillStyle = coreGrad
      ctx!.fill()

      rafRef.current = requestAnimationFrame(draw)
    }

    if (reducedMotion) {
      draw()
      cancelAnimationFrame(rafRef.current)
    } else {
      rafRef.current = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    />
  )
}
