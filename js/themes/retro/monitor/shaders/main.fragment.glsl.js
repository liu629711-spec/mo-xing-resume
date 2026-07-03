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
    // 阶段0 静电噪声
    float n = hash13(vec3(floor(vUv * 256.0), floor(uTime * 60.0)));
    color = vec3(n);
  }
  else if (uPhase == 1) {
    // 阶段1 雪花点
    float snow = hash13(vec3(floor(vUv * 300.0), floor(uTime * 50.0))) * 0.6
               + hash13(vec3(floor(vUv * 800.0), floor(uTime * 80.0))) * 0.4;
    float scan = step(0.97, sin(vUv.y * 800.0));
    color = vec3(snow * 0.7) + vec3(scan * 0.3);
    color *= 0.5;
  }
  else if (uPhase == 2) {
    // 阶段2 LOGO 显现
    vec4 logo = texture2D(uLogoTex, vUv);
    float dist = distance(vUv, vec2(0.5));
    float mask = step(uPhaseProgress, dist);
    vec3 snow = vec3(hash13(vec3(floor(vUv * 200.0), floor(uTime * 40.0))) * 0.3);
    color = mix(snow + uBgColor, mix(uBgColor, logo.rgb * uAccentColor, logo.a), 1.0 - mask);
  }
  else if (uPhase == 3) {
    // 阶段3 进度条
    vec2 logoUv = vec2(vUv.x, (vUv.y - 0.6) / 0.4);
    vec4 logo = (vUv.y > 0.6) ? texture2D(uLogoTex, logoUv) : vec4(0.0);
    vec3 logoColor = mix(uBgColor, logo.rgb * uAccentColor, logo.a);
    float bar = step(abs(vUv.y - 0.3), 0.015) * step(vUv.x, uProgress);
    float barSlot = step(abs(vUv.y - 0.3), 0.015) * 0.3;
    float vig = smoothstep(0.9, 0.4, distance(vUv, vec2(0.5)));
    color = logoColor * vig + barSlot * uBgColor * 0.5 + bar * uAccentColor * 1.5;
  }
  else if (uPhase == 4) {
    // 阶段4 白光爆发
    color = vec3(uPhaseProgress);
  }

  gl_FragColor = vec4(color * uEmissive, 1.0);
}
`;
