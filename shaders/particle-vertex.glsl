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
