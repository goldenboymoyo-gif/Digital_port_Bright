export class CinematicLoader {
  constructor() {
    this.loader = document.getElementById('loader')
    this.progressBar = document.getElementById('loaderProgress')
    this.progressText = document.getElementById('loaderPercentage')
    this.loaderText = document.getElementById('loaderText')
    this.canvas = document.getElementById('loaderCanvas')
    this.progress = 0
    this.isComplete = false
    this.ctx = null
    this.particles = []
    this.rafId = null
  }

  init() {
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d')
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      this._createParticles()
      this._animateCanvas()
    }

    return new Promise((resolve) => {
      this._simulateLoad(resolve)
    })
  }

  _createParticles() {
    const count = 100
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (this.canvas?.width || window.innerWidth),
        y: Math.random() * (this.canvas?.height || window.innerHeight),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2
      })
    }
  }

  _animateCanvas() {
    if (!this.ctx || !this.canvas) return
    this.rafId = requestAnimationFrame(() => this._animateCanvas())

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw ambient glow
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.4
    )
    gradient.addColorStop(0, `rgba(100, 255, 218, ${0.02 + this.progress * 0.01})`)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw particles
    this.particles.forEach((p, i) => {
      p.x += p.vx
      p.y += p.vy

      if (p.x < 0) p.x = this.canvas.width
      if (p.x > this.canvas.width) p.x = 0
      if (p.y < 0) p.y = this.canvas.height
      if (p.y > this.canvas.height) p.y = 0

      // Assemble toward center as progress increases
      const targetX = this.canvas.width / 2 + Math.cos(i + this.progress * 10) * 100
      const targetY = this.canvas.height / 2 + Math.sin(i + this.progress * 10) * 100
      p.x += (targetX - p.x) * this.progress * 0.01
      p.y += (targetY - p.y) * this.progress * 0.01

      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      this.ctx.fillStyle = `rgba(100, 255, 218, ${p.alpha * (0.5 + this.progress * 0.5)})`
      this.ctx.fill()
    })

    // Draw progress ring
    const cx = this.canvas.width / 2
    const cy = this.canvas.height / 2
    const radius = Math.min(this.canvas.width, this.canvas.height) * 0.15

    this.ctx.beginPath()
    this.ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + this.progress * Math.PI * 2)
    this.ctx.strokeStyle = `rgba(100, 255, 218, 0.6)`
    this.ctx.lineWidth = 1
    this.ctx.stroke()

    // Draw assembling initials BM
    if (this.progress > 0.3) {
      const p = (this.progress - 0.3) / 0.7
      this.ctx.font = `bold ${40 + p * 20}px "Space Grotesk", sans-serif`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p})`
      this.ctx.fillText('BM', cx, cy - 5)
    }
  }

  _simulateLoad(resolve) {
    const startTime = performance.now()
    const DURATION = 800

    const tick = () => {
      const elapsed = performance.now() - startTime
      const p = Math.min(1, elapsed / DURATION)
      const eased = 1 - Math.pow(1 - p, 3)
      this.progress = eased * 100

      if (this.progressBar) this.progressBar.style.width = `${this.progress}%`
      if (this.progressText) this.progressText.textContent = `${Math.round(this.progress)}%`

      const stages = ['INITIALIZING', 'LOADING ASSETS', 'COMPILING SHADERS', 'CALIBRATING', 'READY']
      const stageIndex = Math.min(Math.floor(this.progress / 25), stages.length - 1)
      if (this.loaderText) this.loaderText.textContent = stages[stageIndex]

      if (p >= 1) {
        setTimeout(() => {
          this.isComplete = true
          this.loader?.classList.add('is-hidden')
          if (this.rafId) cancelAnimationFrame(this.rafId)
          resolve()
        }, 200)
      } else {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  }

  updateProgress(value) {
    this.progress = Math.min(100, value)
    if (this.progressBar) this.progressBar.style.width = `${this.progress}%`
    if (this.progressText) this.progressText.textContent = `${Math.round(this.progress)}%`
  }
}
