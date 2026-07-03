export const fragmentShader = `
uniform float uTime;
uniform int uPhase;
uniform float uPhaseProgress;
uniform float uEmissive;
uniform sampler2D uLogoTex;
uniform vec3 uAccentColor;
uniform vec3 uBgColor;
uniform float uProgress;
varying vec2 vUv;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec3 color = uBgColor;
  if (uPhase == 0) {
    // 静电（任务10填充）
    color = uBgColor;
  } else if (uPhase == 1) {
    // 雪花（任务10填充）
    color = uBgColor;
  } else if (uPhase == 2) {
    // LOGO（任务10填充）
    color = uBgColor;
  } else if (uPhase == 3) {
    // 进度条（任务10填充）
    color = uBgColor;
  } else if (uPhase == 4) {
    color = vec3(uPhaseProgress);
  }
  gl_FragColor = vec4(color * uEmissive, 1.0);
}
`;
