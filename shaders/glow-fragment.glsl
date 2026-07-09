uniform float uTime;
uniform vec3 uColor;
uniform vec3 uColor2;

varying vec2 vUv;

void main() {
  float dist = distance(vUv, vec2(0.5));
  if (dist > 0.5) discard;

  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  alpha = pow(alpha, 2.0);

  vec3 color = mix(uColor, uColor2, dist * 2.0);
  color += sin(uTime * 2.0 + vUv.x * 10.0) * 0.05;

  gl_FragColor = vec4(color, alpha * 0.3);
}
