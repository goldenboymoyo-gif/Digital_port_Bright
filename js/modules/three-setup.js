export class ThreeSetup {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.scene = null
    this.camera = null
    this.renderer = null
    this.clock = new THREE.Clock()
    this.scenes = new Map()
    this.activeSceneId = null
  }

  init() {
    const container = this.container

    if (!container) return this

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 0, 8)

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    const maxPx = window.innerWidth < 768 || 'ontouchstart' in window ? 1.5 : 2
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPx))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    container.appendChild(this.renderer.domElement)

    this._handleResize()
    return this
  }

  createScene(id) {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.scenes.set(id, { scene, camera })
    return { scene, camera }
  }

  switchScene(id) {
    if (!this.scenes.has(id)) return
    const { scene, camera } = this.scenes.get(id)
    this.activeSceneId = id
    return { scene, camera }
  }

  getActiveScene() {
    if (!this.activeSceneId) return { scene: this.scene, camera: this.camera }
    return this.scenes.get(this.activeSceneId)
  }

  _handleResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth
      const height = window.innerHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      for (const [, { camera }] of this.scenes) {
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      this.renderer.setSize(width, height)
    })
  }

  render() {
    const active = this.getActiveScene()
    this.renderer.render(active.scene, active.camera)
  }

  getDelta() {
    return this.clock.getDelta()
  }

  getElapsedTime() {
    return this.clock.getElapsedTime()
  }
}
