import { useEffect, useRef } from 'react'

interface CelebrationCanvasProps {
  level: number
  finalStage: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  color: string
  life: number
  decay: number
  gravity: number
  glow: boolean
}

const COLORS = ['#ffdc5d', '#ff5f78', '#59d8ff', '#a77cff', '#55e5a5', '#ffffff']

export function CelebrationCanvas({ level, finalStage }: CelebrationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const particles: Particle[] = []
    let animationFrame = 0
    let width = 0
    let height = 0

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const addConfetti = (amount: number) => {
      for (let index = 0; index < amount; index += 1) {
        const fromSide = index % 3 !== 0
        const leftSide = index % 2 === 0
        particles.push({
          x: fromSide ? (leftSide ? -20 : width + 20) : Math.random() * width,
          y: fromSide ? height * (.62 + Math.random() * .32) : -30 - Math.random() * height * .3,
          vx: fromSide ? (leftSide ? 1 : -1) * (5 + Math.random() * 10) : (Math.random() - .5) * 4,
          vy: fromSide ? -(8 + Math.random() * 13) : 2 + Math.random() * 4,
          size: 5 + Math.random() * 9,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - .5) * .35,
          color: COLORS[index % COLORS.length],
          life: 1,
          decay: .006 + Math.random() * .006,
          gravity: .16 + Math.random() * .11,
          glow: index % 7 === 0,
        })
      }
    }

    const addFirework = (x: number, y: number, color: string, delay: number) => {
      window.setTimeout(() => {
        const amount = reducedMotion ? 24 : 54
        for (let index = 0; index < amount; index += 1) {
          const angle = (Math.PI * 2 * index) / amount + Math.random() * .08
          const speed = 2.5 + Math.random() * 6.5
          particles.push({
            x: x * width,
            y: y * height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3.5,
            rotation: angle,
            spin: 0,
            color,
            life: 1,
            decay: .012 + Math.random() * .009,
            gravity: .045,
            glow: true,
          })
        }
      }, delay)
    }

    resize()
    addConfetti(reducedMotion ? 36 : finalStage ? 230 : 75 + level * 25)
    if (finalStage) {
      addFirework(.18, .24, '#ffdc5d', 80)
      addFirework(.78, .2, '#59d8ff', 240)
      addFirework(.48, .18, '#ff6d9f', 420)
      addFirework(.3, .48, '#a77cff', 650)
      addFirework(.72, .5, '#55e5a5', 820)
      addFirework(.5, .37, '#ffffff', 1080)
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        if (particle.life <= 0) continue
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += particle.gravity
        particle.vx *= .994
        particle.rotation += particle.spin
        particle.life -= particle.decay

        context.save()
        context.globalAlpha = Math.max(0, particle.life)
        context.translate(particle.x, particle.y)
        context.rotate(particle.rotation)
        context.fillStyle = particle.color
        if (particle.glow) {
          context.shadowBlur = finalStage ? 18 : 9
          context.shadowColor = particle.color
        }
        if (particle.spin === 0) {
          context.beginPath()
          context.arc(0, 0, particle.size, 0, Math.PI * 2)
          context.fill()
        } else {
          context.fillRect(-particle.size / 2, -particle.size, particle.size, particle.size * 2)
        }
        context.restore()
      }
      animationFrame = window.requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    animationFrame = window.requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [finalStage, level])

  return <canvas ref={canvasRef} className="exo-celebration-canvas" aria-hidden="true" />
}
