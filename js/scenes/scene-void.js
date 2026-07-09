import { ParticleSystem } from '../modules/particle-system.js'

export class SceneVoid {
  constructor(threeSetup) {
    this.threeSetup = threeSetup
    this.container = document.getElementById('voidCanvas')
    this.sceneData = null
    this.particles = null
    this.textMesh = null
    this.title = document.querySelector('.scene--void .scene__title-glitch')
    this.subtitle = document.getElementById('voidSubtitle')
    this.location = document.getElementById('voidLocation')
    this.scrollCta = document.getElementById('scrollCta')
    this.mouseX = 0
    this.mouseY = 0
    this.targetRotX = 0
    this.targetRotY = 0
    this.lights = []
  }

  init() {
    if (!this.container) return

    this.sceneData = this.threeSetup.createScene('void')
    const { scene, camera } = this.sceneData
    camera.position.set(0, 0, 8)

    // Ambient particles
    this.particles = new ParticleSystem(scene, {
      count: 3000,
      size: 0.03,
      radius: 12,
      color: '#64ffda',
      opacity: 0.4,
      speed: 0.15
    })
    this.particles.init()

    // Glow fog
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.03)

    // Distant stars
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window
    const starGeo = new THREE.BufferGeometry()
    const starCount = isMobile ? 1500 : 5000
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 200
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)
    this.stars = stars

    // Add floating ambient light
    const ambientLight = new THREE.AmbientLight(0x222244, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x64ffda, 2, 20)
    pointLight.position.set(2, 2, 4)
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0x7c3aed, 1, 20)
    pointLight2.position.set(-3, -1, 3)
    scene.add(pointLight2)

    this.lights = [pointLight, pointLight2]

    // Handle pointer (mouse + touch)
    const onPointer = (x, y) => {
      this.mouseX = (x / window.innerWidth) * 2 - 1
      this.mouseY = -(y / window.innerHeight) * 2 + 1
    }
    document.addEventListener('mousemove', (e) => onPointer(e.clientX, e.clientY))
    document.addEventListener('touchmove', (e) => {
      const t = e.touches[0]
      if (t) onPointer(t.clientX, t.clientY)
    })

    // GSAP reveal animations
    this._animateReveal()

    // Switch to this scene initially
    this.threeSetup.switchScene('void')

    return this
  }

  _animateReveal() {
    const tl = gsap.timeline({ delay: 1.5 })
    tl.fromTo(this.title,
      { opacity: 0, scale: 0.8, filter: 'blur(20px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 2, ease: 'power3.out' }
    )
    tl.fromTo(this.subtitle,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' },
      '-=0.5'
    )
    tl.fromTo(this.location,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
      '-=0.5'
    )
    tl.fromTo(this.scrollCta,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
      '-=0.3'
    )
  }

  update(time) {
    if (!this.sceneData) return

    if (this.particles) {
      this.particles.update(time)
    }

    if (this.stars) {
      this.stars.rotation.y = time * 0.01
    }

    // Smooth camera rotation based on mouse
    this.targetRotX = this.mouseY * 0.05
    this.targetRotY = this.mouseX * 0.05

    const { camera } = this.sceneData
    camera.position.x += (this.mouseX * 0.3 - camera.position.x) * 0.02
    camera.position.y += (-this.mouseY * 0.3 - camera.position.y) * 0.02
    camera.lookAt(0, 0, 0)
  }

  activate() {
    this.threeSetup.switchScene('void')
  }

  deactivate() {}

  dispose() {
    if (this.particles) this.particles.dispose()
    if (this.stars) {
      this.sceneData?.scene.remove(this.stars)
      this.stars.geometry.dispose()
      this.stars.material.dispose()
    }
    this.lights.forEach(l => this.sceneData?.scene.remove(l))
  }
}
