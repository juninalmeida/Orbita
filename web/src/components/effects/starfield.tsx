import { useEffect, useRef } from 'react'

// --- Deterministic pseudo-random ---

function pseudoRandom(i: number): number {
  const n = Math.sin(i * 137.508 + 0.1) * 43758.5453
  return n - Math.floor(n)
}

// --- Orbital star (on the ring) ---

interface OrbitalStar {
  angle: number          // position on orbit (0 - 2π)
  radiusOffset: number   // slight deviation from perfect ring (-1 to 1)
  heightOffset: number   // scatter perpendicular to ring plane
  size: number
  baseOpacity: number
  twinkleSpeed: number
  twinklePhase: number
  colorR: number
  colorG: number
  colorB: number
}

// --- Background ambient star ---

interface AmbientStar {
  x: number
  y: number
  size: number
  baseOpacity: number
  twinkleSpeed: number
  twinklePhase: number
}

// --- Shooting star ---

interface ShootingStar {
  x: number
  y: number
  angle: number
  speed: number
  size: number
  life: number
  maxLife: number
  trail: { x: number; y: number; alpha: number }[]
}

// --- Generate orbital stars (distributed along the ring) ---

const ORBITAL_COUNT = 220
const AMBIENT_COUNT = 90

function generateOrbitalStars(): OrbitalStar[] {
  const stars: OrbitalStar[] = []
  for (let i = 0; i < ORBITAL_COUNT; i++) {
    const r1 = pseudoRandom(i)
    const r2 = pseudoRandom(i + 1000)
    const r3 = pseudoRandom(i + 2000)
    const r4 = pseudoRandom(i + 3000)
    const r5 = pseudoRandom(i + 4000)
    const r6 = pseudoRandom(i + 5000)
    const r7 = pseudoRandom(i + 6000)

    // Distribute stars along the ring with slight clustering
    const angle = (i / ORBITAL_COUNT) * Math.PI * 2 + (r1 - 0.5) * 0.15

    // Spread around the ring path (gaussian-like: most near center, some far)
    const spread = (r2 - 0.5) * 2
    const radiusOffset = spread * Math.abs(spread) * 0.12 // quadratic falloff
    const heightOffset = (r3 - 0.5) * 2 * Math.abs((r3 - 0.5) * 2) * 0.06

    const isKey = r4 > 0.85

    // Color: white, warm gold, cool blue, or faint emerald
    let colorR = 255, colorG = 255, colorB = 255
    if (r7 < 0.12) {
      colorR = 255; colorG = 245; colorB = 200 // warm
    } else if (r7 < 0.22) {
      colorR = 200; colorG = 225; colorB = 255 // cool
    } else if (r7 < 0.30) {
      colorR = 200; colorG = 255; colorB = 230 // faint emerald
    }

    stars.push({
      angle,
      radiusOffset,
      heightOffset,
      size: isKey ? 1.8 + r5 * 1.2 : 0.5 + r5 * 1.0,
      baseOpacity: isKey ? 0.7 + r6 * 0.25 : 0.2 + r6 * 0.5,
      twinkleSpeed: 0.3 + r4 * 1.0,
      twinklePhase: r5 * Math.PI * 2,
      colorR, colorG, colorB,
    })
  }
  return stars
}

function generateAmbientStars(): AmbientStar[] {
  const stars: AmbientStar[] = []
  for (let i = 0; i < AMBIENT_COUNT; i++) {
    const r1 = pseudoRandom(i + 8000)
    const r2 = pseudoRandom(i + 9000)
    const r3 = pseudoRandom(i + 10000)
    const r4 = pseudoRandom(i + 11000)
    const r5 = pseudoRandom(i + 12000)

    stars.push({
      x: r1,
      y: r2,
      size: 0.3 + r3 * 0.8,
      baseOpacity: 0.1 + r4 * 0.3,
      twinkleSpeed: 0.2 + r5 * 0.8,
      twinklePhase: r3 * Math.PI * 2,
    })
  }
  return stars
}

const orbitalStars = generateOrbitalStars()
const ambientStars = generateAmbientStars()

// --- Ring 3D → 2D projection config ---

const RING_TILT = 1.15        // ~66° tilt from horizontal (radians)
const ROTATION_SPEED = 0.06   // radians per second — slow, majestic
const COS_TILT = Math.cos(RING_TILT)
const SIN_TILT = Math.sin(RING_TILT)

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0, smoothX: 0, smoothY: 0 })
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const nextShootRef = useRef(5)

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

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    const startTime = performance.now()

    function spawnShootingStar(w: number, h: number) {
      const side = Math.random()
      let x: number, y: number
      if (side < 0.5) {
        x = Math.random() * w * 0.6 + w * 0.2
        y = -10
      } else {
        x = w + 10
        y = Math.random() * h * 0.4
      }
      shootingStarsRef.current.push({
        x, y,
        angle: Math.PI * 0.15 + Math.random() * Math.PI * 0.3,
        speed: 400 + Math.random() * 300,
        size: 1.5 + Math.random() * 1.5,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.7,
        trail: [],
      })
    }

    function drawShootingStars(dt: number, w: number, h: number) {
      const active = shootingStarsRef.current
      for (let i = active.length - 1; i >= 0; i--) {
        const s = active[i]
        s.life += dt
        if (s.life > s.maxLife) { active.splice(i, 1); continue }

        const progress = s.life / s.maxLife
        const alpha = progress < 0.1 ? progress / 0.1 : 1 - (progress - 0.1) / 0.9

        s.x += Math.cos(s.angle) * s.speed * dt
        s.y += Math.sin(s.angle) * s.speed * dt

        s.trail.unshift({ x: s.x, y: s.y, alpha })
        if (s.trail.length > 12) s.trail.pop()

        for (let j = 0; j < s.trail.length; j++) {
          const tp = s.trail[j]
          const trailAlpha = tp.alpha * (1 - j / s.trail.length) * 0.8
          if (trailAlpha < 0.01) continue
          const trailSize = s.size * (1 - j / s.trail.length * 0.7)
          ctx!.beginPath()
          ctx!.arc(tp.x, tp.y, trailSize, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(255, 250, 230, ${trailAlpha})`
          ctx!.shadowBlur = j === 0 ? 8 : 0
          ctx!.shadowColor = `rgba(255, 250, 230, ${trailAlpha * 0.6})`
          ctx!.fill()
        }
        ctx!.shadowBlur = 0

        if (s.x < -50 || s.x > w + 50 || s.y > h + 50) {
          active.splice(i, 1)
        }
      }
    }

    let lastTime = performance.now()

    function draw() {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      const time = (now - startTime) / 1000
      const w = window.innerWidth
      const h = window.innerHeight

      // Smooth mouse
      const mouse = mouseRef.current
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.04
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.04
      const parallax = reducedMotion ? 0 : 12

      ctx!.clearRect(0, 0, w, h)

      // --- Draw ambient background stars ---
      for (const star of ambientStars) {
        const sx = star.x * w + mouse.smoothX * parallax * 0.3
        const sy = star.y * h + mouse.smoothY * parallax * 0.3
        const twinkleAmp = reducedMotion ? 0.05 : 0.2
        const opacity = Math.max(0.03, star.baseOpacity +
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * twinkleAmp)

        ctx!.beginPath()
        ctx!.arc(sx, sy, star.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx!.shadowBlur = 0
        ctx!.fill()
      }

      // --- Draw orbital ring stars ---
      const centerX = w * 0.5
      const centerY = h * 0.48
      const radiusX = Math.min(w, h) * 0.42
      const radiusY = radiusX * 0.95
      const rotationOffset = reducedMotion ? 0 : time * ROTATION_SPEED

      // Collect stars with their projected z for depth sorting
      const projected: {
        sx: number; sy: number; z: number
        size: number; opacity: number
        colorR: number; colorG: number; colorB: number
      }[] = []

      for (const star of orbitalStars) {
        const theta = star.angle + rotationOffset

        // 3D position on tilted ring
        const rx = radiusX * (1 + star.radiusOffset)
        const ry = radiusY * (1 + star.radiusOffset)

        const x3d = Math.cos(theta) * rx
        const y3d_flat = Math.sin(theta) * ry
        const y3d = y3d_flat * COS_TILT + star.heightOffset * Math.min(w, h)
        const z3d = y3d_flat * SIN_TILT

        // Perspective scaling (subtle)
        const perspectiveScale = 0.7 + 0.3 * ((z3d / radiusY + 1) / 2)
        const depthOpacity = 0.35 + 0.65 * ((z3d / radiusY + 1) / 2)

        // Screen position
        const sx = centerX + x3d + mouse.smoothX * parallax * (0.5 + perspectiveScale * 0.5)
        const sy = centerY + y3d + mouse.smoothY * parallax * (0.5 + perspectiveScale * 0.5)

        // Twinkle
        const twinkleAmp = reducedMotion ? 0.08 : 0.25
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * twinkleAmp +
          Math.sin(time * star.twinkleSpeed * 0.6 + star.twinklePhase * 1.4) * twinkleAmp * 0.25

        const opacity = Math.max(0.03, (star.baseOpacity + twinkle) * depthOpacity)
        const size = star.size * perspectiveScale

        projected.push({
          sx, sy, z: z3d,
          size, opacity,
          colorR: star.colorR, colorG: star.colorG, colorB: star.colorB,
        })
      }

      // Sort back-to-front
      projected.sort((a, b) => a.z - b.z)

      // Draw faint orbital path (subtle ring line)
      ctx!.save()
      ctx!.beginPath()
      for (let i = 0; i <= 120; i++) {
        const theta = (i / 120) * Math.PI * 2
        const x3d = Math.cos(theta) * radiusX
        const y3d_flat = Math.sin(theta) * radiusY
        const y3d = y3d_flat * COS_TILT
        const px = centerX + x3d + mouse.smoothX * parallax * 0.5
        const py = centerY + y3d + mouse.smoothY * parallax * 0.5
        if (i === 0) ctx!.moveTo(px, py)
        else ctx!.lineTo(px, py)
      }
      ctx!.closePath()
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx!.lineWidth = 1
      ctx!.stroke()
      ctx!.restore()

      // Draw projected stars
      for (const p of projected) {
        ctx!.beginPath()
        ctx!.arc(p.sx, p.sy, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${p.opacity})`

        if (p.size > 1.2 && p.opacity > 0.4) {
          ctx!.shadowBlur = p.size * 5
          ctx!.shadowColor = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${p.opacity * 0.35})`
        } else {
          ctx!.shadowBlur = 0
        }
        ctx!.fill()
      }
      ctx!.shadowBlur = 0

      // --- Shooting stars ---
      if (!reducedMotion) {
        nextShootRef.current -= dt
        if (nextShootRef.current <= 0) {
          spawnShootingStar(w, h)
          nextShootRef.current = 4 + Math.random() * 6
        }
        drawShootingStars(dt, w, h)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 1 }}
    />
  )
}
