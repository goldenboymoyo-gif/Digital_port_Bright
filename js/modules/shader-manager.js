export class ShaderManager {
  constructor() {
    this.shaders = new Map()
  }

  load(id, vertexSrc, fragmentSrc) {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexSrc,
      fragmentShader: fragmentSrc,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    this.shaders.set(id, material)
    return material
  }

  get(id) {
    return this.shaders.get(id)
  }

  update(time) {
    this.shaders.forEach((material) => {
      if (material.uniforms.uTime) {
        material.uniforms.uTime.value = time
      }
    })
  }

  dispose() {
    this.shaders.forEach((material) => material.dispose())
    this.shaders.clear()
  }
}
