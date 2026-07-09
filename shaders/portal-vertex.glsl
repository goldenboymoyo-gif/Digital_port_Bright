uniform float uTime;

varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;

  vec3 pos = position;
  float wave = sin(pos.x * 3.0 + uTime) * 0.05;
  wave += cos(pos.y * 3.0 + uTime * 0.7) * 0.05;
  pos.z += wave;

  vElevation = wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
