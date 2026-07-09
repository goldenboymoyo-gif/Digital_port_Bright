export class Compass {
  constructor() {
    this.compass = document.getElementById('compass')
    this.needle = document.getElementById('compassNeedle')
    this.sceneNumber = document.getElementById('sceneNumber')
    this.currentScene = 0
    this.totalScenes = 8
    this.targetRotation = 0
    this.currentRotation = 0
    this.rafId = null
  }

  init() {
    if (!this.needle) return
    this._animate()
    if (this.compass) {
      this.compass.addEventListener('click', () => this._cycleScene())
    }
  }

  update(sceneIndex) {
    this.currentScene = sceneIndex
    if (this.sceneNumber) {
      this.sceneNumber.textContent = sceneIndex + 1
    }
    this.targetRotation = (sceneIndex / this.totalScenes) * 360
  }

  _cycleScene() {
    const next = (this.currentScene + 1) % this.totalScenes
    window.dispatchEvent(new CustomEvent('navigate', { detail: { scene: next } }))
  }

  _animate() {
    this.rafId = requestAnimationFrame(() => this._animate())
    this.currentRotation += (this.targetRotation - this.currentRotation) * 0.08
    if (this.needle) {
      this.needle.style.transform = `rotate(${this.currentRotation}deg)`
      this.needle.style.transformOrigin = '50% 50%'
    }
  }

  dispose() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
  }
}
