export class SceneLaboratory {
  constructor(threeSetup) {
    this.threeSetup = threeSetup
    this.container = document.getElementById('labCanvas')
    this.sceneData = null
    this.furniture = []
    this.floatingCode = []
    this.labUI = document.querySelector('.lab__ui')
    this.terminalBody = document.getElementById('terminalBody')
    this.mouseX = 0
    this.mouseY = 0
  }

  init() {
    if (!this.container) return

    this.sceneData = this.threeSetup.createScene('laboratory')
    const { scene, camera } = this.sceneData
    camera.position.set(0, 2, 6)

    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.03)

    // Floor
    const floorGeo = new THREE.PlaneGeometry(10, 10)
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a1a,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.5
    scene.add(floor)

    // Desk
    const deskGeo = new THREE.BoxGeometry(2, 0.1, 1)
    const deskMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2a, transparent: true, opacity: 0.8 })
    const desk = new THREE.Mesh(deskGeo, deskMat)
    desk.position.set(0, -0.2, 0)
    scene.add(desk)

    // Desk legs
    const legMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3a, transparent: true, opacity: 0.6 })
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), legMat)
      leg.position.set(
        (i < 2 ? -0.9 : 0.9),
        -0.35,
        (i % 2 === 0 ? -0.4 : 0.4)
      )
      scene.add(leg)
    }

    // Monitor (floating screen)
    const screenGeo = new THREE.PlaneGeometry(1.2, 0.8)
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    this._drawCodeScreen(ctx)
    const texture = new THREE.CanvasTexture(canvas)
    const screenMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      emissive: 0x64ffda,
      emissiveIntensity: 0.1
    })
    this.screenMesh = new THREE.Mesh(screenGeo, screenMat)
    this.screenMesh.position.set(0, 0.6, 0.5)
    scene.add(this.screenMesh)

    // Monitor frame
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3a, transparent: true, opacity: 0.5, wireframe: false })
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.05), frameMat)
    frame.position.copy(this.screenMesh.position)
    scene.add(frame)

    // Monitor stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), legMat)
    stand.position.set(0, 0.25, 0.5)
    scene.add(stand)

    // Floating code particles
    const codeParticlesGeo = new THREE.BufferGeometry()
    const codeCount = 200
    const codePos = new Float32Array(codeCount * 3)
    const codeSizes = new Float32Array(codeCount)
    for (let i = 0; i < codeCount; i++) {
      codePos[i * 3] = (Math.random() - 0.5) * 4
      codePos[i * 3 + 1] = Math.random() * 3
      codePos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1
      codeSizes[i] = 0.02 + Math.random() * 0.04
    }
    codeParticlesGeo.setAttribute('position', new THREE.BufferAttribute(codePos, 3))
    codeParticlesGeo.setAttribute('size', new THREE.BufferAttribute(codeSizes, 1))
    const codeMat = new THREE.PointsMaterial({
      color: 0x64ffda,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
    this.codeParticles = new THREE.Points(codeParticlesGeo, codeMat)
    scene.add(this.codeParticles)

    // Coffee cup
    const cupGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.15, 8)
    const cupMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a, transparent: true, opacity: 0.7 })
    const cup = new THREE.Mesh(cupGeo, cupMat)
    cup.position.set(0.5, -0.1, 0.3)
    scene.add(cup)

    // Ambient lights
    const ambient = new THREE.AmbientLight(0x222244, 0.3)
    scene.add(ambient)
    const pointLight = new THREE.PointLight(0x64ffda, 1, 8)
    pointLight.position.set(0, 2, 2)
    scene.add(pointLight)

    // Mouse interaction
    document.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    })

    // Lab UI terminal animation
    this._animateTerminal()

    return this
  }

  _drawCodeScreen(ctx) {
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, 400, 300)

    const lines = [
      '// Building the future...',
      'const universe = new Cosmos();',
      '',
      'function createReality(params) {',
      '  const { matter, energy } = params;',
      '  return universe.bigBang(matter, energy);',
      '}',
      '',
      'class Developer {',
      '  constructor(name) {',
      '    this.name = name;',
      '    this.passion = Infinity;',
      '  }',
      '',
      '  async build(project) {',
      '    while (this.passion > 0) {',
      '      await this.code(project);',
      '      this.learn();',
      '      this.improve();',
      '    }',
      '  }',
      '}',
      '',
      'const bright = new Developer("Bright Moyo");',
      'bright.build("The Future");'
    ]

    ctx.font = '12px "JetBrains Mono", monospace'
    lines.forEach((line, i) => {
      if (line.startsWith('//')) {
        ctx.fillStyle = '#6a9955'
      } else if (line.includes('function') || line.includes('class') || line.includes('async')) {
        ctx.fillStyle = '#569cd6'
      } else if (line.includes('const') || line.includes('let') || line.includes('var')) {
        ctx.fillStyle = '#4fc1ff'
      } else if (line.includes('new')) {
        ctx.fillStyle = '#c586c0'
      } else if (line.includes('this')) {
        ctx.fillStyle = '#dcdcaa'
      } else if (line.includes('return') || line.includes('while') || line.includes('await')) {
        ctx.fillStyle = '#c586c0'
      } else {
        ctx.fillStyle = '#e2e8f0'
      }
      ctx.fillText(line, 10, 20 + i * 18)
    })
  }

  _animateTerminal() {
    if (!this.labUI) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scene-laboratory',
        start: 'top 50%'
      }
    })

    tl.to(this.labUI, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    })

    // Animate terminal typing
    const lines = this.terminalBody?.querySelectorAll('.lab__terminal-line, .lab__terminal-output')
    if (lines) {
      tl.fromTo(lines,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.4, ease: 'power2.out' },
        '-=0.5'
      )
    }
  }

  activate() {
    this.threeSetup.switchScene('laboratory')
  }

  update(time) {
    if (!this.sceneData) return

    const { camera } = this.sceneData

    // Mouse parallax for room
    camera.position.x += (this.mouseX * 0.3 - camera.position.x) * 0.01
    camera.position.y += (-this.mouseY * 0.2 + 2 - camera.position.y) * 0.01
    camera.lookAt(0, 0.3, 0)

    // Floating code animation
    if (this.codeParticles) {
      const positions = this.codeParticles.geometry.attributes.position.array
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.001
        if (positions[i * 3 + 1] > 3) positions[i * 3 + 1] = 0
      }
      this.codeParticles.geometry.attributes.position.needsUpdate = true
      this.codeParticles.rotation.y = Math.sin(time * 0.05) * 0.05
    }

    // Screen flicker
    if (this.screenMesh) {
      this.screenMesh.material.emissiveIntensity = 0.1 + Math.sin(time * 3) * 0.02
    }
  }

  deactivate() {}

  dispose() {
    if (this.codeParticles) {
      this.sceneData?.scene.remove(this.codeParticles)
      this.codeParticles.geometry.dispose()
      this.codeParticles.material.dispose()
    }
    if (this.screenMesh) {
      this.sceneData?.scene.remove(this.screenMesh)
      this.screenMesh.geometry.dispose()
      this.screenMesh.material.map?.dispose()
      this.screenMesh.material.dispose()
    }
  }
}
