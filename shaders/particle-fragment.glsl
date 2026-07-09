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
