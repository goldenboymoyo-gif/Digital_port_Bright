import { ParticleSystem } from '../modules/particle-system.js'

const SKILLS = [
  { name: 'JavaScript', color: '#f7df1e', size: 0.3 },
  { name: 'TypeScript', color: '#3178c6', size: 0.3 },
  { name: 'Python', color: '#3776ab', size: 0.28 },
  { name: 'HTML', color: '#e34f26', size: 0.25 },
  { name: 'CSS', color: '#1572b6', size: 0.25 },
  { name: 'Three.js', color: '#64ffda', size: 0.35 },
  { name: 'GSAP', color: '#88ce02', size: 0.32 },
  { name: 'Git', color: '#f05032', size: 0.27 },
  { name: 'Firebase', color: '#ffca28', size: 0.3 },
  { name: 'React', color: '#61dafb', size: 0.33 },
  { name: 'Node.js', color: '#339933', size: 0.3 }
]

export class SceneSkills {
  constructor(threeSetup) {
    this.threeSetup = threeSetup
    this.container = document.getElementById('skillsCanvas')
    this.sceneData = null
    this.crystals = []
    this.particles = null
    this.labelsContainer = document.getElementById('skillsLabels')
    this.heading = document.querySelector('.scene--skills .scene__heading')
    this.description = document.querySelector('.scene--skills .scene__description')
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.hoveredCrystal = null
  }

  init() {
    if (!this.container) return

    this.sceneData = this.threeSetup.createScene('skills')
    const { scene, camera } = this.sceneData
    camera.position.set(0, 1, 6)

    scene.fog = new THREE.FogExp2(0x0a1a2a, 0.025)

    // Create skill labels
    SKILLS.forEach(skill => {
      const span = document.createElement('span')
      span.textContent = skill.name
      span.dataset.skill = skill.name
      this.labelsContainer?.appendChild(span)
    })

    // Create crystals
    SKILLS.forEach((skill, i) => {
      const crystal = this._createCrystal(skill, i)
      this.crystals.push(crystal)
      scene.add(crystal)
    })

    // Ambient particles
    this.particles = new ParticleSystem(scene, {
      count: 1500,
      size: 0.02,
      radius: 8,
      color: '#8888ff',
      opacity: 0.2,
      speed: 0.08
    })
    this.particles.init()

    // Interaction
    this.container.addEventListener('mousemove', (e) => this._onMouseMove(e))
    this.container.addEventListener('click', (e) => this._onClick(e))
    this.container.addEventListener('touchmove', (e) => this._onMouseMove(e))
    this.container.addEventListener('touchend', (e) => this._onClick(e))

    // Reveal
    gsap.fromTo(this.heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#scene-skills', start: 'top 60%' } })
    gsap.fromTo(this.description, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#scene-skills', start: 'top 60%' } })

    return this
  }

  _createCrystal(skill, index) {
    const group = new THREE.Group()
    const angle = (index / SKILLS.length) * Math.PI * 2
    const radius = 3.5
    group.position.set(Math.cos(angle) * radius, -0.5 + Math.random() * 1, Math.sin(angle) * radius)
    group.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5)

    // Crystal shape (octahedron)
    const geo = new THREE.OctahedronGeometry(skill.size, 0)
    const mat = new THREE.MeshBasicMaterial({
      color: skill.color,
      transparent: true,
      opacity: 0.8,
      wireframe: false
    })
    const mesh = new THREE.Mesh(geo, mat)
    group.add(mesh)

    // Glow wireframe
    const wireMat = new THREE.MeshBasicMaterial({
      color: skill.color,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    })
    const wire = new THREE.Mesh(new THREE.OctahedronGeometry(skill.size * 1.05, 0), wireMat)
    group.add(wire)

    // Energy glow sprite
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, skill.color + '40')
    grad.addColorStop(1, skill.color + '00')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)
    const texture = new THREE.CanvasTexture(canvas)
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.scale.set(skill.size * 4, skill.size * 4, 1)
    group.add(sprite)

    group.userData = { skill, index, mesh, wire, wireMat, mat, angle, floatSpeed: 0.5 + Math.random(), phase: Math.random() * Math.PI * 2, baseY: group.position.y }

    return group
  }

  _onMouseMove(e) {
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    this.mouse.x = (cx / window.innerWidth) * 2 - 1
    this.mouse.y = -(cy / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.sceneData.camera)

    const meshes = []
    this.crystals.forEach(c => meshes.push(c.children[0]))
    const intersects = this.raycaster.intersectObjects(meshes)

    // Reset all
    this.crystals.forEach(c => {
      const wire = c.children[1]
      const glow = c.children[2]
      if (wire) wire.material.opacity = 0.3
      if (glow) glow.material.opacity = 0.5
      this.labelsContainer?.querySelector(`[data-skill="${c.userData.skill.name}"]`)?.classList.remove('is-active')
    })

    if (intersects.length > 0) {
      const mesh = intersects[0].object
      for (const c of this.crystals) {
        if (c.children[0] === mesh) {
          const wire = c.children[1]
          const glow = c.children[2]
          if (wire) wire.material.opacity = 0.8
          if (glow) glow.material.opacity = 1
          this.hoveredCrystal = c
          this.labelsContainer?.querySelector(`[data-skill="${c.userData.skill.name}"]`)?.classList.add('is-active')
          break
        }
      }
    } else {
      this.hoveredCrystal = null
    }
  }

  _onClick(e) {
    if (!this.sceneData) return
    const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY
    this.mouse.x = (cx / window.innerWidth) * 2 - 1
    this.mouse.y = -(cy / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.sceneData.camera)
    const meshes = []
    this.crystals.forEach(c => meshes.push(c.children[0]))
    const intersects = this.raycaster.intersectObjects(meshes)
    if (intersects.length > 0) {
      const mesh = intersects[0].object
      for (const c of this.crystals) {
        if (c.children[0] === mesh) {
          this.hoveredCrystal = c
          break
        }
      }
    }
    if (this.hoveredCrystal) {
      const skill = this.hoveredCrystal.userData.skill
      // Pulse animation on click
      gsap.to(this.hoveredCrystal.scale, {
        x: 1.5, y: 1.5, z: 1.5,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      })
    }
  }

  activate() {
    this.threeSetup.switchScene('skills')
  }

  update(time) {
    if (!this.sceneData) return

    this.particles?.update(time)

    this.crystals.forEach((crystal) => {
      const data = crystal.userData

      // Float
      crystal.position.y = data.baseY + Math.sin(time * data.floatSpeed + data.phase) * 0.2

      // Rotate
      crystal.rotation.x += 0.005
      crystal.rotation.y += 0.01
      crystal.rotation.z += 0.003

      // Pulse opacity
      data.mat.opacity = 0.7 + Math.sin(time * 1.5 + data.phase) * 0.15

      // Energy particles emit from crystal
      const sprite = crystal.children[2]
      if (sprite) {
        sprite.material.opacity = 0.3 + Math.sin(time * 2 + data.phase) * 0.2
      }
    })
  }

  deactivate() {}

  dispose() {
    this.particles?.dispose()
    this.crystals.forEach(c => {
      this.sceneData?.scene.remove(c.group)
      c.children.forEach(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (child.material.map) child.material.map.dispose()
          child.material.dispose()
        }
      })
    })
  }
}
