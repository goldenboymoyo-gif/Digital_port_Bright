import { ParticleSystem } from '../modules/particle-system.js'

const MILESTONES = [
  { year: '2026', event: 'Started Learning Software Development', color: '#64ffda' },
  { year: '2026', event: 'Built TeleVivi — Tourism Platform', color: '#7c3aed' },
  { year: '2026', event: 'Built HomeLink — Real Estate Platform', color: '#3b82f6' },
  { year: '2026', event: 'Built BriefWire — News Platform', color: '#f59e0b' },
  { year: '2026', event: 'Built VFBA Attendance System', color: '#ec4899' },
  { year: '2026', event: 'Built Ironvale Construction — Construction Platform', color: '#f97316' }
]

export class SceneTimeline {
  constructor(threeSetup) {
    this.threeSetup = threeSetup
    this.container = document.getElementById('timelineCanvas')
    this.sceneData = null
    this.milestoneElements = document.querySelectorAll('.timeline__milestone')
    this.particles = null
    this.tunnelParticles = null
    this.tunnelSpeed = 0.5
  }

  init() {
    if (!this.container) return

    this.sceneData = this.threeSetup.createScene('timeline')
    const { scene, camera } = this.sceneData
    camera.position.set(0, 0, 0)

    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.04)

    // Tunnel particles - rushing toward camera
    const tunnelGeo = new THREE.BufferGeometry()
    const count = 2000
    const pos = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = -(Math.random() * 30 + 5)
      sizes[i] = 0.05 + Math.random() * 0.1
      speeds[i] = 0.5 + Math.random() * 1
    }
    tunnelGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    tunnelGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    tunnelGeo.userData = { speeds }

    const tunnelMat = new THREE.PointsMaterial({
      color: 0x8888ff,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
    this.tunnelPoints = new THREE.Points(tunnelGeo, tunnelMat)
    scene.add(this.tunnelPoints)
    this.tunnelSpeeds = speeds

    // Year markers floating
    MILESTONES.forEach((ms, i) => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 80
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = ms.color
      ctx.font = 'bold 40px "Space Grotesk", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ms.year, 128, 40)
      const texture = new THREE.CanvasTexture(canvas)
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
      const sprite = new THREE.Sprite(mat)
      const zPos = -(i * 5 + 8)
      sprite.position.set(
        Math.cos(i * 1.2) * 3,
        Math.sin(i * 0.8) * 1.5 + 1.5,
        zPos
      )
      sprite.scale.set(2, 0.8, 1)
      scene.add(sprite)
    })

    // Ambient particles
    this.particles = new ParticleSystem(scene, {
      count: 800,
      size: 0.02,
      radius: 8,
      color: '#8888ff',
      opacity: 0.15,
      speed: 0.05
    })
    this.particles.init()

    // Reveal milestones on scroll
    this.milestoneElements.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power3.out'
          })
        }
      })
    })

    return this
  }

  activate() {
    this.threeSetup.switchScene('timeline')
  }

  update(time) {
    if (!this.sceneData) return

    this.particles?.update(time)

    // Move tunnel particles toward camera
    if (this.tunnelPoints) {
      const pos = this.tunnelPoints.geometry.attributes.position.array
      const speeds = this.tunnelSpeeds
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 2] += speeds[i] * 0.1
        if (pos[i * 3 + 2] > 5) {
          pos[i * 3 + 2] = -(Math.random() * 30 + 5)
          pos[i * 3] = (Math.random() - 0.5) * 10
          pos[i * 3 + 1] = (Math.random() - 0.5) * 6
        }
      }
      this.tunnelPoints.geometry.attributes.position.needsUpdate = true
    }
  }

  deactivate() {}

  dispose() {
    this.particles?.dispose()
    if (this.tunnelPoints) {
      this.sceneData?.scene.remove(this.tunnelPoints)
      this.tunnelPoints.geometry.dispose()
      this.tunnelPoints.material.dispose()
    }
  }
}
