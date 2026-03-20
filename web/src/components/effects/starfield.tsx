import { useMemo } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 8,
    duration: Math.random() * 4 + 3,
  }))
}

export function Starfield({ count = 150 }: { count?: number }) {
  const stars = useMemo(() => generateStars(count), [count])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {stars.map((star) => (
        <span
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            backgroundColor: 'white',
            animation: `twinkle ${star.duration}s ${star.delay}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  )
}
