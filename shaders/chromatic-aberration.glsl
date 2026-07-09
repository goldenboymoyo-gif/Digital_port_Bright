uniform float uTime;
uniform float uIntensity;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
  float intensity = uIntensity * (0.5 + 0.5 * sin(uTime * 0.5));

  float r = texture2D(tDiffuse, vUv + vec2(intensity * 0.01, 0.0)).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - vec2(intensity * 0.01, 0.0)).b;

  vec3 color = vec3(r, g, b);

  float vignette = 1.0 - distance(vUv, vec2(0.5)) * 0.5;
  color *= vignette;

  gl_FragColor = vec4(color, 1.0);
}
