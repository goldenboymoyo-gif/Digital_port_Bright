export class KeyboardNav {
  constructor() {
    this.totalScenes = 8
    this.currentScene = 0
    this.keys = {
      ArrowDown: 1,
      ArrowUp: -1,
      ArrowRight: 1,
      ArrowLeft: -1
    }
    this._boundHandler = this._handleKeydown.bind(this)
  }

  init() {
    document.addEventListener('keydown', this._boundHandler)
  }

  _handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

    if (e.key === 'Home') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('navigate', { detail: { scene: 0 } }))
      return
    }

    if (e.key === 'End') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('navigate', { detail: { scene: this.totalScenes - 1 } }))
      return
    }

    const num = parseInt(e.key)
    if (num >= 1 && num <= this.totalScenes) {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('navigate', { detail: { scene: num - 1 } }))
      return
    }

    if (e.key in this.keys) {
      e.preventDefault()
      const next = this.currentScene + this.keys[e.key]
      if (next >= 0 && next < this.totalScenes) {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { scene: next } }))
      }
    }
  }

  update(sceneIndex) {
    this.currentScene = sceneIndex
  }

  dispose() {
    document.removeEventListener('keydown', this._boundHandler)
  }
}
