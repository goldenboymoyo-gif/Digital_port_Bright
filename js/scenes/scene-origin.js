import { ParticleSystem } from '../modules/particle-system.js'

export class SceneOrigin {
  constructor(threeSetup) {
    this.threeSetup = threeSetup
    this.container = document.getElementById('originCanvas')
    this.sceneData = null
    this.particles = null
    this.mistParticles = null
    this.originLines = document.querySelectorAll('.origin__line')
    this.originInfo = document.querySelector('.origin__info')
    this.infoCards = document.querySelectorAll('.origin__info-card')
    this.elapsed = 0
    this.hasRevealed = false
  }

  init() {
    if (!this.container) return

    this.sceneData = this.threeSetup.createScene('origin')
    const { scene, camera } = this.sceneData
    camera.position.set(0, 1, 6)

    scene.fog = new THREE.FogExp2(0x0a1628, 0.04)

    // Mist particles (floating upward)
    this.mistParticles = new ParticleSystem(scene, {
      count: 1500,
      size: 0.08,
      radius: 8,
      color: '#88ccff',
      opacity: 0.15,
      speed: 0.08
    })
    this.mistParticles.init()

    // Floating light orbs
    const orbGeo = new THREE.SphereGeometry(0.08, 8, 8)
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x64ffda, transparent: true, opacity: 0.2 })
    this.orbs = []
    for (let i = 0; i < 20; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat.clone())
      orb.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6 - 2
      )
      orb.userData = {
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.5 + Math.random() * 0.5,
        baseY: orb.position.y
      }
      scene.add(orb)
      this.orbs.push(orb)
    }

    // Light rays (planes with gradient)
    this.rays = []
    for (let i = 0; i < 8; i++) {
      const rayGeo = new THREE.PlaneGeometry(0.5, 3 + Math.random() * 4)
      const rayMat = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.02 + Math.random() * 0.04,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const ray = new THREE.Mesh(rayGeo, rayMat)
      ray.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4 - 2
      )
      ray.rotation.x = Math.random() * Math.PI
      ray.rotation.z = Math.random() * Math.PI
      scene.add(ray)
      this.rays.push(ray)
    }

    return this
  }

  activate() {
    this.threeSetup.switchScene('origin')
    this._revealText()
  }

  _revealText() {
    if (this.hasRevealed) return
    this.hasRevealed = true

    const tl = gsap.timeline()

    this.originLines.forEach((line, i) => {
      const delay = parseFloat(line.dataset.delay) || i * 1.5
      tl.to(line, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: delay - (i > 0 ? parseFloat(this.originLines[i - 1].dataset.delay) || 1.5 : 0)
      }, `+=${delay > 0 ? 0 : 0}`)
    })

    tl.to(this.originInfo, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    }, '+=0.5')

    tl.to(this.infoCards, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    }, '-=0.8')
  }

  update(time) {
    if (!this.sceneData) return
    this.elapsed = time

    if (this.mistParticles) {
      this.mistParticles.update(time)
      this.mistParticles.particles.position.y += Math.sin(time * 0.1) * 0.001
    }

    this.orbs?.forEach((orb) => {
      orb.position.y = orb.userData.baseY + Math.sin(time * orb.userData.floatSpeed + orb.userData.phase) * 0.3
      orb.material.opacity = 0.15 + Math.sin(time * orb.userData.speed + orb.userData.phase) * 0.1
    })

    this.rays?.forEach((ray, i) => {
      ray.material.opacity = 0.02 + Math.sin(time * 0.5 + i) * 0.03
      ray.rotation.z += 0.001
    })
  }

  deactivate() {}

  dispose() {
    this.mistParticles?.dispose()
    this.orbs?.forEach(o => {
      this.sceneData?.scene.remove(o)
      o.geometry.dispose()
      o.material.dispose()
    })
    this.rays?.forEach(r => {
      this.sceneData?.scene.remove(r)
      r.geometry.dispose()
      r.material.dispose()
    })
  }
}
