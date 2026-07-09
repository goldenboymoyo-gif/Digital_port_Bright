import { ParticleSystem } from '../modules/particle-system.js'

export class SceneContact {
  constructor(threeSetup) {
    this.threeSetup = threeSetup
    this.container = document.getElementById('contactCanvas')
    this.sceneData = null
    this.particles = null
    this.portal = null
    this.orbitingDots = []
    this.heading = document.querySelector('.scene--contact .scene__heading')
    this.contactLinks = document.querySelectorAll('.contact__link')
  }

  init() {
    if (!this.container) return

    this.sceneData = this.threeSetup.createScene('contact')
    const { scene, camera } = this.sceneData
    camera.position.set(0, 0, 5)

    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.03)

    // Portal - swirling ring
    const portalGeo = new THREE.RingGeometry(1.5, 2, 64)
    const portalMat = new THREE.MeshBasicMaterial({
      color: 0x64ffda,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    this.portal = new THREE.Mesh(portalGeo, portalMat)
    this.portal.rotation.x = -Math.PI / 2
    scene.add(this.portal)

    // Inner glow ring
    const innerRing = new THREE.RingGeometry(1.2, 1.5, 64)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const inner = new THREE.Mesh(innerRing, innerMat)
    inner.rotation.x = -Math.PI / 2
    inner.rotation.z = 0.3
    scene.add(inner)
    this.innerRing = inner

    // Outer glow ring
    const outerRing = new THREE.RingGeometry(2, 2.3, 64)
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x64ffda,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    })
    const outer = new THREE.Mesh(outerRing, outerMat)
    outer.rotation.x = -Math.PI / 2
    outer.rotation.z = -0.2
    scene.add(outer)
    this.outerRing = outer

    // Orbiting particles around portal
    for (let i = 0; i < 60; i++) {
      const dotGeo = new THREE.SphereGeometry(0.03 + Math.random() * 0.04, 4, 4)
      const dotMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x64ffda : 0x7c3aed,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.4
      })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      const radius = 1.8 + Math.random() * 1.5
      const angle = Math.random() * Math.PI * 2
      dot.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 0.5)
      dot.userData = {
        radius,
        angle,
        speed: (0.2 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1),
        floatSpeed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        baseZ: dot.position.z
      }
      scene.add(dot)
      this.orbitingDots.push(dot)
    }

    // Light rays from portal
    for (let i = 0; i < 12; i++) {
      const rayGeo = new THREE.PlaneGeometry(0.05, 1 + Math.random() * 2)
      const rayMat = new THREE.MeshBasicMaterial({
        color: 0x64ffda,
        transparent: true,
        opacity: 0.02 + Math.random() * 0.03,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const ray = new THREE.Mesh(rayGeo, rayMat)
      const angle = (i / 12) * Math.PI * 2
      ray.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, (Math.random() - 0.5) * 0.3)
      ray.rotation.z = angle
      ray.rotation.x = Math.random() * 0.5
      scene.add(ray)
    }

    // Particles
    this.particles = new ParticleSystem(scene, {
      count: 1000,
      size: 0.02,
      radius: 6,
      color: '#64ffda',
      opacity: 0.2,
      speed: 0.05
    })
    this.particles.init()

    // Reveal heading
    gsap.fromTo(this.heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#scene-contact', start: 'top 60%' } })

    // Animate contact links
    this.contactLinks.forEach((link, i) => {
      gsap.fromTo(link,
        { opacity: 0, y: 20, scale: 0.8 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          delay: 0.5 + i * 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#scene-contact', start: 'top 60%' }
        }
      )

      link.addEventListener('click', (e) => this._createRipple(e, link))
    })

    return this
  }

  _createRipple(e, link) {
    const rect = link.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background: rgba(100, 255, 218, 0.4);
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
    `
    link.style.position = 'relative'
    link.style.overflow = 'hidden'
    link.appendChild(ripple)

    gsap.to(ripple, {
      scale: 15,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    })
  }

  activate() {
    this.threeSetup.switchScene('contact')
  }

  update(time) {
    if (!this.sceneData) return

    this.particles?.update(time)

    if (this.portal) {
      this.portal.rotation.z = time * 0.3
    }

    if (this.innerRing) {
      this.innerRing.rotation.z = -time * 0.4 + 0.3
      this.innerRing.material.opacity = 0.1 + Math.sin(time * 1.5) * 0.04
    }

    if (this.outerRing) {
      this.outerRing.rotation.z = time * 0.2 - 0.2
    }

    this.orbitingDots.forEach((dot) => {
      const d = dot.userData
      d.angle += d.speed * 0.02
      dot.position.x = Math.cos(d.angle) * d.radius
      dot.position.y = Math.sin(d.angle) * d.radius
      dot.position.z = d.baseZ + Math.sin(time * d.floatSpeed + d.phase) * 0.2
      dot.material.opacity = 0.3 + Math.sin(time * 2 + d.phase) * 0.2
    })
  }

  deactivate() {}

  dispose() {
    this.particles?.dispose()
    this.orbitingDots.forEach(d => {
      this.sceneData?.scene.remove(d)
      d.geometry.dispose()
      d.material.dispose()
    })
  }
}
