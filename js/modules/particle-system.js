export class ParticleSystem {
  constructor(scene, options = {}) {
    this.scene = scene
    this.options = {
      count: options.count || 2000,
      size: options.size || 0.05,
      radius: options.radius || 10,
      color: options.color || '#64ffda',
      opacity: options.opacity || 0.6,
      speed: options.speed || 0.2,
      ...options
    }
    this.particles = null
    this.material = null
  }

  init() {
    const count = this.options.count
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const randomness = new Float32Array(count * 3)
    const phases = new Float32Array(count)

    const color = new THREE.Color(this.options.color)

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * this.options.radius
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      scales[i] = 0.5 + Math.random() * 1.5
      randomness[i * 3] = (Math.random() - 0.5) * 2
      randomness[i * 3 + 1] = (Math.random() - 0.5) * 2
      randomness[i * 3 + 2] = (Math.random() - 0.5) * 2
      phases[i] = Math.random() * Math.PI * 2
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: this.options.size * 100 },
        uSpeed: { value: this.options.speed },
        uColor: { value: color },
        uOpacity: { value: this.options.opacity }
      },
      vertexShader: document.getElementById('particleVertexShader')?.textContent || `
        uniform float uTime;
        uniform float uSize;
        uniform float uSpeed;
        attribute float aScale;
        attribute vec3 aRandomness;
        attribute float aPhase;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          float t = uTime * uSpeed + aPhase;
          pos.x += sin(t * 0.5 + pos.y) * aRandomness.x * 0.5;
          pos.y += cos(t * 0.3 + pos.z) * aRandomness.y * 0.5;
          pos.z += sin(t * 0.7 + pos.x) * aRandomness.z * 0.5;
          vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projPosition = projectionMatrix * viewPosition;
          gl_Position = projPosition;
          float dist = length(viewPosition.xyz);
          float size = uSize * aScale * (200.0 / dist);
          gl_PointSize = size;
          vAlpha = smoothstep(50.0, 0.0, dist) * 0.8;
        }
      `,
      fragmentShader: document.getElementById('particleFragmentShader')?.textContent || `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vAlpha;
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist);
          alpha *= vAlpha * uOpacity;
          float glow = exp(-dist * 6.0);
          vec3 color = uColor + glow * 0.3;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    this.particles = new THREE.Points(geometry, this.material)
    this.scene.add(this.particles)

    return this
  }

  update(time) {
    if (this.material) {
      this.material.uniforms.uTime.value = time
    }
  }

  setPosition(x, y, z) {
    if (this.particles) {
      this.particles.position.set(x, y, z)
    }
  }

  setColor(color) {
    if (this.material) {
      this.material.uniforms.uColor.value = new THREE.Color(color)
    }
  }

  setSize(size) {
    if (this.material) {
      this.material.uniforms.uSize.value = size * 100
    }
  }

  setOpacity(opacity) {
    if (this.material) {
      this.material.uniforms.uOpacity.value = opacity
    }
  }

  dispose() {
    if (this.particles) {
      this.scene.remove(this.particles)
      this.particles.geometry.dispose()
      this.material.dispose()
    }
  }
}
