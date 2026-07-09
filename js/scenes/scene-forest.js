import { ParticleSystem } from '../modules/particle-system.js'

const PROJECTS = [
  {
    name: 'Victoria Falls TeleVivi',
    desc: 'Tourism platform showcasing Victoria Falls attractions, accommodations, and experiences.',
    tech: ['React', 'Firebase', 'GSAP'],
    demo: 'https://vic-falls-televivi.vercel.app',
    github: 'https://github.com/goldenboymoyo-gif'
  },
  {
    name: 'HomeLink',
    desc: 'Real estate platform connecting buyers, sellers, and agents in Zimbabwe.',
    tech: ['React', 'Firebase', 'Tailwind'],
    demo: 'https://homelink-one.vercel.app',
    github: 'https://github.com/goldenboymoyo-gif'
  },
  {
    name: 'VFBA Attendance System',
    desc: 'Attendance management system for the Victoria Falls Basketball Academy.',
    tech: ['React', 'Firebase', 'Node.js'],
    demo: 'https://vfba-attendance.vercel.app',
    github: 'https://github.com/goldenboymoyo-gif'
  },
  {
    name: 'BriefWire',
    desc: 'News platform delivering concise, curated news summaries.',
    tech: ['React', 'Firebase', 'CSS3'],
    demo: 'https://brief-wire.vercel.app',
    github: 'https://github.com/goldenboymoyo-gif'
  },
  {
    name: 'Alyssa Personal Space',
    desc: 'Personal website for Alyssa with a unique, expressive design.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    demo: 'https://alyssapersonalspace.vercel.app',
    github: 'https://github.com/goldenboymoyo-gif'
  },
  {
    name: 'Personal Portfolio',
    desc: 'Software developer portfolio showcasing projects and skills.',
    tech: ['React', 'Three.js', 'GSAP'],
    demo: 'https://bright-moyo-software-portfolio.vercel.app',
    github: 'https://github.com/goldenboymoyo-gif'
  },
  {
    name: 'Ironvale Construction',
    desc: 'Construction platform for Ironvale, showcasing building projects and services.',
    tech: ['React', 'Firebase', 'Tailwind'],
    demo: 'https://ironvale-sonstruction.vercel.app',
    github: 'https://github.com/goldenboymoyo-gif'
  }
]

export class SceneForest {
  constructor(threeSetup) {
    this.threeSetup = threeSetup
    this.container = document.getElementById('forestCanvas')
    this.sceneData = null
    this.trees = []
    this.particles = null
    this.selectedTree = null
    this.projectCard = document.getElementById('projectCard')
    this.projectOverlay = document.getElementById('forestOverlay')
    this.projectTitle = document.getElementById('projectTitle')
    this.projectDesc = document.getElementById('projectDesc')
    this.projectTech = document.getElementById('projectTech')
    this.projectDemo = document.getElementById('projectDemo')
    this.projectGithub = document.getElementById('projectGithub')
    this.projectClose = document.getElementById('projectClose')
    this.heading = document.querySelector('.scene--forest .scene__heading')
    this.description = document.querySelector('.scene--forest .scene__description')
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
  }

  init() {
    if (!this.container) return

    this.sceneData = this.threeSetup.createScene('forest')
    const { scene, camera } = this.sceneData
    camera.position.set(0, 3, 8)

    scene.fog = new THREE.FogExp2(0x0a1a0a, 0.025)

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(20, 20)
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x0a1a0a,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.5
    scene.add(ground)

    // Create trees
    PROJECTS.forEach((project, i) => {
      const tree = this._createTree(project, i)
      this.trees.push(tree)
      scene.add(tree)
    })

    // Ambient particles
    this.particles = new ParticleSystem(scene, {
      count: 1000,
      size: 0.02,
      radius: 6,
      color: '#64ffda',
      opacity: 0.3,
      speed: 0.1
    })
    this.particles.init()

    // Interaction
    this.container.addEventListener('click', (e) => this._onClick(e))
    this.container.addEventListener('mousemove', (e) => this._onMouseMove(e))

    // Project card close
    if (this.projectClose) {
      this.projectClose.addEventListener('click', () => this._closeProject())
    }

    // Click outside to close
    this.projectOverlay?.addEventListener('click', (e) => {
      if (e.target === this.projectOverlay) this._closeProject()
    })

    // Reveal heading
    gsap.fromTo(this.heading, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#scene-forest', start: 'top 60%' } })
    gsap.fromTo(this.description, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#scene-forest', start: 'top 60%' } })

    return this
  }

  _createTree(project, index) {
    const group = new THREE.Group()
    const angle = (index / PROJECTS.length) * Math.PI * 2 - Math.PI / 2
    const radius = 3 + Math.random() * 1.5
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    group.position.set(x, -1.5, z)

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1 + Math.random() * 0.5, 6)
    const trunkMat = new THREE.MeshBasicMaterial({
      color: 0x2a4a2a,
      transparent: true,
      opacity: 0.8
    })
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = 0.5
    group.add(trunk)

    // Canopy - multiple glowing spheres
    const canopyColor = new THREE.Color().setHSL(0.3 + index * 0.05, 0.8, 0.4)
    const canopyMat = new THREE.MeshBasicMaterial({
      color: canopyColor,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    })

    for (let j = 0; j < 5; j++) {
      const size = 0.2 + Math.random() * 0.3
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), canopyMat.clone())
      sphere.position.set(
        (Math.random() - 0.5) * 0.6,
        1 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.6
      )
      sphere.userData = {
        floatSpeed: 0.5 + Math.random(),
        phase: Math.random() * Math.PI * 2,
        baseY: sphere.position.y,
        baseX: sphere.position.x,
        baseZ: sphere.position.z
      }
      group.add(sphere)
    }

    // Glow point light
    const glowLight = new THREE.PointLight(canopyColor, 0.5, 3)
    glowLight.position.y = 1.5
    group.add(glowLight)

    group.userData = { project, index, canopyMat, canopyColor }

    return group
  }

  _onClick(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.sceneData.camera)

    const meshes = []
    this.trees.forEach(tree => {
      tree.children.forEach(child => {
        if (child.isMesh) {
          child.userData.treeIndex = tree.userData.index
          meshes.push(child)
        }
      })
    })

    const intersects = this.raycaster.intersectObjects(meshes)
    if (intersects.length > 0) {
      const treeIndex = intersects[0].object.userData.treeIndex
      const project = this.trees[treeIndex]?.userData?.project
      const url = project?.demo || project?.github
      if (url) window.open(url, '_blank', 'noopener')
    }
  }

  _onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  _openProject(index) {
    const tree = this.trees[index]
    if (!tree) return
    const project = tree.userData.project

    this.selectedTree = index

    this.projectTitle.textContent = project.name
    this.projectDesc.textContent = project.desc
    this.projectTech.innerHTML = project.tech.map(t => `<span>${t}</span>`).join('')
    this.projectDemo.href = project.demo
    this.projectGithub.href = project.github

    this.projectOverlay.classList.add('is-visible')

    gsap.fromTo(this.projectCard, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' })
  }

  _closeProject() {
    this.projectOverlay.classList.remove('is-visible')
    this.selectedTree = null
  }

  activate() {
    this.threeSetup.switchScene('forest')
  }

  update(time) {
    if (!this.sceneData) return

    this.particles?.update(time)

    this.trees.forEach((tree, i) => {
      tree.children.forEach(child => {
        if (child.isMesh && child.userData.floatSpeed) {
          const d = child.userData
          child.position.y = d.baseY + Math.sin(time * d.floatSpeed + d.phase) * 0.1
        }
      })

      tree.rotation.y += 0.002 * (i % 2 === 0 ? 1 : -1)

      // Highlight selected tree
      if (this.selectedTree !== null && i === this.selectedTree) {
        tree.userData.canopyMat && (tree.userData.canopyMat.opacity = 0.6 + Math.sin(time * 2) * 0.2)
      }
    })
  }

  deactivate() {}

  dispose() {
    this.particles?.dispose()
    this.trees.forEach(t => {
      this.sceneData?.scene.remove(t)
      t.children.forEach(c => {
        if (c.geometry) c.geometry.dispose()
        if (c.material) c.material.dispose()
      })
    })
  }
}
