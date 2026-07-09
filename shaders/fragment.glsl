uniform float uTime;
uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform float uIntensity;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(fresnel, 3.0);

  vec3 color = uColor;
  color += uGlowColor * fresnel * uIntensity;

  float edge = 1.0 - smoothstep(0.0, 0.5, abs(vUv.x - 0.5) + abs(vUv.y - 0.5));
  color += edge * 0.1;

  gl_FragColor = vec4(color, 1.0);
}
