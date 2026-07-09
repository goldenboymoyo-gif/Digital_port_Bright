export class SceneManager {
  constructor() {
    this.scenes = []
    this.currentIndex = 0
    this.isTransitioning = false
    this.scrollProgress = 0
    this.viewports = []
    this.onSceneChange = null
  }

  register(id, element) {
    this.scenes.push({ id, element, index: this.scenes.length })
  }

  init() {
    this.scenes.forEach((scene, i) => {
      const rect = scene.element.getBoundingClientRect()
      this.viewports[i] = {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        height: rect.height
      }
    })

    window.addEventListener('resize', () => this._recalc())
    this._recalc()
  }

  _recalc() {
    this.scenes.forEach((scene, i) => {
      const rect = scene.element.getBoundingClientRect()
      this.viewports[i] = {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        height: rect.height
      }
    })
  }

  update(scrollY) {
    const viewportHeight = window.innerHeight
    const docHeight = document.documentElement.scrollHeight
    this.scrollProgress = scrollY / (docHeight - viewportHeight)

    let newIndex = 0
    this.viewports.forEach((vp, i) => {
      const mid = vp.top + vp.height / 2
      const scrollMid = scrollY + viewportHeight / 2
      if (scrollMid >= vp.top && scrollMid <= vp.bottom) {
        newIndex = i
      }
    })

    if (newIndex !== this.currentIndex && !this.isTransitioning) {
      this.currentIndex = newIndex
      if (this.onSceneChange) this.onSceneChange(this.currentIndex)
    }

    return this.currentIndex
  }

  getSceneProgress(sceneIndex, scrollY) {
    const vp = this.viewports[sceneIndex]
    if (!vp) return 0
    return Math.max(0, Math.min(1, (scrollY - vp.top + window.innerHeight) / (vp.height + window.innerHeight)))
  }

  navigateTo(index) {
    if (index < 0 || index >= this.scenes.length || this.isTransitioning) return
    const vp = this.viewports[index]
    if (!vp) return
    window.scrollTo({
      top: vp.top,
      behavior: 'smooth'
    })
  }
}
