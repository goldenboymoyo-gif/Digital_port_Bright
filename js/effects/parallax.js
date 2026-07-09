export class Parallax {
  constructor() {
    this.elements = new Map()
    this.mouse = { x: 0, y: 0 }
    this.rafId = null
  }

  init() {
    this._onPointer = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      this.mouse.x = (cx / window.innerWidth - 0.5) * 2
      this.mouse.y = (cy / window.innerHeight - 0.5) * 2
    }
    document.addEventListener('mousemove', this._onPointer)
    document.addEventListener('touchmove', this._onPointer)
    this._animate()
  }

  add(element, options = {}) {
    const config = {
      intensity: options.intensity || 20,
      invertX: options.invertX || false,
      invertY: options.invertY || false,
      rotation: options.rotation || false,
      rotationIntensity: options.rotationIntensity || 5,
      ...options
    }
    this.elements.set(element, config)
  }

  remove(element) {
    this.elements.delete(element)
  }

  _animate() {
    this.rafId = requestAnimationFrame(() => this._animate())
    this.elements.forEach((config, el) => {
      const x = this.mouse.x * config.intensity * (config.invertX ? -1 : 1)
      const y = this.mouse.y * config.intensity * (config.invertY ? -1 : 1)
      let transform = `translate(${x}px, ${y}px)`
      if (config.rotation) {
        const rotX = this.mouse.y * config.rotationIntensity * (config.invertY ? -1 : 1)
        const rotY = this.mouse.x * config.rotationIntensity * (config.invertX ? -1 : 1)
        transform += ` rotateX(${rotX}deg) rotateY(${rotY}deg)`
      }
      el.style.transform = transform
    })
  }

  dispose() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.elements.clear()
  }
}
