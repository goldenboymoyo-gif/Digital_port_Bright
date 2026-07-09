export class InteractionManager {
  constructor() {
    this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0, velocity: { x: 0, y: 0 } }
    this.touch = { x: 0, y: 0 }
    this.isTouching = false
    this.listeners = new Map()
    this._boundHandlers = {}
  }

  init() {
    this._boundHandlers.mousemove = this._onMouseMove.bind(this)
    this._boundHandlers.touchstart = this._onTouchStart.bind(this)
    this._boundHandlers.touchmove = this._onTouchMove.bind(this)
    this._boundHandlers.touchend = this._onTouchEnd.bind(this)

    document.addEventListener('mousemove', this._boundHandlers.mousemove)
    document.addEventListener('touchstart', this._boundHandlers.touchstart, { passive: true })
    document.addEventListener('touchmove', this._boundHandlers.touchmove, { passive: true })
    document.addEventListener('touchend', this._boundHandlers.touchend)
  }

  _onMouseMove(e) {
    this.mouse.prevX = this.mouse.x
    this.mouse.prevY = this.mouse.y
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    this.mouse.velocity.x = this.mouse.x - this.mouse.prevX
    this.mouse.velocity.y = this.mouse.y - this.mouse.prevY
    this._emit('mousemove', this.mouse)
  }

  _onTouchStart(e) {
    this.isTouching = true
    if (e.touches.length > 0) {
      this.touch.x = e.touches[0].clientX
      this.touch.y = e.touches[0].clientY
    }
    this._emit('touchstart', this.touch)
  }

  _onTouchMove(e) {
    if (!this.isTouching) return
    if (e.touches.length > 0) {
      this.touch.x = e.touches[0].clientX
      this.touch.y = e.touches[0].clientY
    }
    const x = (this.touch.x / window.innerWidth) * 2 - 1
    const y = -(this.touch.y / window.innerHeight) * 2 + 1
    this._emit('touchmove', { x, y })
  }

  _onTouchEnd() {
    this.isTouching = false
    this._emit('touchend')
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
    return () => this.listeners.get(event)?.delete(callback)
  }

  _emit(event, data) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(cb => cb(data))
    }
  }

  getNormalized() {
    return {
      x: this.mouse.x,
      y: this.mouse.y,
      velocity: this.mouse.velocity
    }
  }

  dispose() {
    document.removeEventListener('mousemove', this._boundHandlers.mousemove)
    document.removeEventListener('touchstart', this._boundHandlers.touchstart)
    document.removeEventListener('touchmove', this._boundHandlers.touchmove)
    document.removeEventListener('touchend', this._boundHandlers.touchend)
    this.listeners.clear()
  }
}
