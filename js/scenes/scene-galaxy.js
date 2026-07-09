import { ParticleSystem } from '../modules/particle-system.js'

const PLANET_PROJECTS = [
  { name: 'TeleVivi', color: '#64ffda', size: 0.45, orbit: 0, speed: 0.3 },
  { name: 'HomeLink', color: '#7c3aed', size: 0.35, orbit: 1.2, speed: 0.35 },
  { name: 'VFBA', color: '#f59e0b', size: 0.3, orbit: 2.4, speed: 0.25 },
  { name: 'BriefWire', color: '#3b82f6', size: 0.4, orbit: 3.6, speed: 0.35 },
  { name: 'Alyssa', color: '#ec4899', size: 0.25, orbit: 4.8, speed: 0.2 },
  { name: 'Portfolio', color: '#ffffff', size: 0.5, orbit: 6.0, speed: 0.3 },
  { name: 'Ironvale', color: '#f97316', size: 0.35, orbit: 7.2, speed: 0.3 }
]

export class SceneGalaxy {
  constructor(threeSetup) {
    this.threeSetup = threeSetup
    this.container = document.getElementById('galaxyCanvas')
    this.sceneData = null
    this.planets = []
    this.particles = null
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.isFlying = false
    this.flyTarget = null
    this.flyProgress = 0
    this.originalCameraPos = new THREE.Vector3(0, 0, 8)
    this.heading = document.querySelector('.scene--galaxy .scene__heading')
    this.description = document.querySelector('.scene--galaxy .scene__description')
  }

  init() {
    if (!this.container) return

    this.sceneData = this.threeSetup.createScene('galaxy')
    const { scene, camera } = this.sceneData
    camera.position.set(0, 1, 8)

    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02)

    // Galaxy background stars
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window
    const starGeo = new THREE.BufferGeometry()
    const starCount = isMobile ? 1200 : 4000
    const pos = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      const r = 5 + Math.random() * 30
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.3
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      sizes[i] = 0.05 + Math.random() * 0.2
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const starMat = new THREE.PointsMaterial({
      color: 0x8888ff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    })
    this.galaxyStars = new THREE.Points(starGeo, starMat)
    scene.add(this.galaxyStars)

    // Create planets
    PLANET_PROJECTS.forEach((proj, i) => {
      const planet = this._createPlanet(proj, i)
      this.planets.push(planet)
      scene.add(planet)
    })

    // Ambient glow particles
    this.particles = new ParticleSystem(scene, {
      count: 2000,
      size: 0.02,
      radius: 15,
      color: '#8888ff',
      opacity: 0.2,
      speed: 0.05
    })
    this.particles.init()

    // Interaction
    this.container.addEventListener('click', (e) => this._onClick(e))
    this.container.addEventListener('mousemove', (e) => this._onMouseMove(e))
    this.container.addEventListener('touchmove', (e) => this._onMouseMove(e))
    this.container.addEventListener('touchend', (e) => this._onClick(e))

    // Reveal texts
    gsap.fromTo(this.heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#scene-galaxy', start: 'top 60%' } })
    gsap.fromTo(this.description, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#scene-galaxy', start: 'top 60%' } })

    return this
  }

  _createPlanet(proj, index) {
    const group = new THREE.Group()
    const angle = (index / PLANET_PROJECTS.length) * Math.PI * 2
    group.position.set(Math.cos(angle) * 4, 0, Math.sin(angle) * 4)
    group.userData = { proj, angle, orbitSpeed: proj.speed * 0.1, basePos: group.position.clone() }

    // Planet sphere
    const geo = new THREE.SphereGeometry(proj.size, 24, 24)
    const mat = new THREE.MeshBasicMaterial({ color: proj.color, transparent: true, opacity: 0.9 })
    const mesh = new THREE.Mesh(geo, mat)
    group.add(mesh)

    // Atmosphere glow
    const glowGeo = new THREE.SphereGeometry(proj.size * 1.3, 16, 16)
    const glowMat = new THREE.MeshBasicMaterial({
      color: proj.color,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    group.add(glow)

    // Ring
    const ringGeo = new THREE.RingGeometry(proj.size * 1.5, proj.size * 2, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: proj.color,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI * 0.4
    ring.rotation.z = Math.random() * Math.PI
    group.add(ring)

    // Label sprite (HTML label on 3D)
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = proj.color
    ctx.font = 'bold 28px Space Grotesk, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(proj.name, 128, 32)

    const texture = new THREE.CanvasTexture(canvas)
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.scale.set(1.5, 0.4, 1)
    sprite.position.y = proj.size * 1.8
    group.add(sprite)

    return group
  }

  _onClick(e) {
    if (this.isFlying) return
    const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY
    this.mouse.x = (cx / window.innerWidth) * 2 - 1
    this.mouse.y = -(cy / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.sceneData.camera)

    const meshes = []
    this.planets.forEach(p => {
      p.children.forEach(c => {
        if (c.isMesh) meshes.push(c)
      })
    })

    const intersects = this.raycaster.intersectObjects(meshes)
    if (intersects.length > 0) {
      const planet = intersects[0].object.parent?.parent || intersects[0].object.parent
      const idx = this.planets.findIndex(p => p === planet)
      if (idx >= 0) this._flyToPlanet(idx)
    }
  }

  _flyToPlanet(index) {
    const planet = this.planets[index]
    if (!planet || this.isFlying) return

    this.isFlying = true
    this.flyTarget = index
    this.flyProgress = 0
    this.originalCameraPos.copy(this.sceneData.camera.position)

    const targetPos = planet.position.clone()
    targetPos.y += 1
    targetPos.z += 3

    gsap.to(this.sceneData.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: 'power3.inOut',
      onComplete: () => {
        setTimeout(() => {
          gsap.to(this.sceneData.camera.position, {
            x: this.originalCameraPos.x,
            y: this.originalCameraPos.y,
            z: this.originalCameraPos.z,
            duration: 1.5,
            ease: 'power3.inOut',
            onComplete: () => {
              this.isFlying = false
              this.flyTarget = null
            }
          })
        }, 2000)
      }
    })
  }

  _onMouseMove(e) {
    if (this.isFlying) return
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    this.mouse.x = (cx / window.innerWidth) * 2 - 1
    this.mouse.y = -(cy / window.innerHeight) * 2 + 1
  }

  activate() {
    this.threeSetup.switchScene('galaxy')
  }

  update(time) {
    if (!this.sceneData) return

    this.particles?.update(time)

    if (this.galaxyStars) {
      this.galaxyStars.rotation.y = time * 0.02
    }

    this.planets.forEach((planet, i) => {
      const data = planet.userData
      const angle = data.angle + time * data.orbitSpeed
      const radius = 4
      planet.position.x = Math.cos(angle) * radius
      planet.position.z = Math.sin(angle) * radius

      planet.rotation.y = time * 0.3

      // Pulse atmosphere
      planet.children.forEach(child => {
        if (child.isMesh && child.geometry.type === 'SphereGeometry' && child.material !== planet.children[0]?.material) {
          child.material.opacity = 0.1 + Math.sin(time * 2 + i) * 0.05
        }
      })
    })
  }

  deactivate() {}

  dispose() {
    this.particles?.dispose()
    this.planets.forEach(p => {
      this.sceneData?.scene.remove(p)
      p.children.forEach(c => {
        if (c.geometry) c.geometry.dispose()
        if (c.material) c.material.dispose()
      })
    })
    if (this.galaxyStars) {
      this.sceneData?.scene.remove(this.galaxyStars)
      this.galaxyStars.geometry.dispose()
      this.galaxyStars.material.dispose()
    }
  }
}
