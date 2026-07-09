export class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('cursor')
    this.circle = this.cursor?.querySelector('.cursor__inner--circle')
    this.dot = this.cursor?.querySelector('.cursor__inner--dot')
    this.x = 0
    this.y = 0
    this.circleX = 0
    this.circleY = 0
    this.dotX = 0
    this.dotY = 0
    this.isVisible = true
    this.isHovering = false
    this.isOnCanvas = false
    this.rafId = null
  }

  init() {
    if (!this.cursor || !this.circle || !this.dot) return

    document.addEventListener('mousemove', (e) => {
      this.x = e.clientX
      this.y = e.clientY
      this.circleX = this.x
      this.circleY = this.y
      if (!this.rafId) this._animate()
    })

    document.addEventListener('mouseenter', () => { this.isVisible = true })
    document.addEventListener('mouseleave', () => { this.isVisible = false })

    document.querySelectorAll('a, button, input, textarea, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => this.onHover())
      el.addEventListener('mouseleave', () => this.onLeave())
    })

    document.addEventListener('click', () => {
      this.circle?.classList.add('is-clicking')
      setTimeout(() => this.circle?.classList.remove('is-clicking'), 150)
    })
  }

  onHover() {
    if (this.isHovering) return
    this.isHovering = true
    this.circle?.classList.add('is-hovering')
    this.dot?.classList.add('is-hovering')
  }

  onLeave() {
    this.isHovering = false
    this.circle?.classList.remove('is-hovering')
    this.dot?.classList.remove('is-hovering')
  }

  _animate() {
    this.rafId = requestAnimationFrame(() => this._animate())

    if (!this.isVisible) {
      this.circle?.classList.add('is-hidden')
      this.dot?.classList.add('is-hidden')
      return
    }

    this.circle?.classList.remove('is-hidden')
    this.dot?.classList.remove('is-hidden')

    this.circleX += (this.x - this.circleX) * 0.12
    this.circleY += (this.y - this.circleY) * 0.12
    this.dotX += (this.x - this.dotX) * 0.3
    this.dotY += (this.y - this.dotY) * 0.3

    if (this.circle) {
      this.circle.style.transform = `translate(${this.circleX}px, ${this.circleY}px)`
    }
    if (this.dot) {
      this.dot.style.transform = `translate(${this.dotX}px, ${this.dotY}px)`
    }
  }

  dispose() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
  }
}
