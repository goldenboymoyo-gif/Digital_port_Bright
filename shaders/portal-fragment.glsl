uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;
varying float vElevation;

void main() {
  float dist = distance(vUv, vec2(0.5));
  float angle = atan(vUv.y - 0.5, vUv.x - 0.5);

  float swirl = sin(angle * 5.0 + uTime * 2.0 - dist * 10.0) * 0.5 + 0.5;
  float radial = 1.0 - dist * 2.0;

  vec3 color = mix(uColor1, uColor2, swirl);
  color += vElevation * 0.5;

  float alpha = smoothstep(1.0, 0.0, dist);
  alpha *= smoothstep(0.0, 0.2, dist);

  float glow = exp(-dist * 8.0) * 0.5;
  color += glow;

  gl_FragColor = vec4(color, alpha * 0.8);
}
