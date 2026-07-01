// 水墨着色器：基于高度和噪声生成水墨晕染，高处浓墨、低处淡墨、边缘晕开。
// 山峦地形与卷轴底纹共用。

export const inkVertexShader = /* glsl */ `
  uniform float uTime;
  varying float vHeight;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;
    vPos = position;
    vHeight = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const inkFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uPaperColor;
  uniform vec3 uInkColor;
  uniform vec3 uGoldColor;
  varying float vHeight;
  varying vec2 vUv;
  varying vec3 vPos;

  // 简化 simplex noise（GLSL）
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
    i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m=m*m; m=m*m;
    vec3 x=2.0*fract(p*C.www)-1.0;
    vec3 h=abs(x)-0.5;
    vec3 ox=floor(x+0.5);
    vec3 a0=x-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.0*dot(m,g);
  }

  float fbm(vec2 p){
    float v=0.0; float a=0.5;
    for(int i=0;i<4;i++){ v+=a*snoise(p); p*=2.0; a*=0.5; }
    return v;
  }

  void main(){
    // 高度归一化（假设山峦高度 0~3）
    float h = clamp(vHeight / 3.0, 0.0, 1.0);

    // 笔触噪声：横向拉伸模拟笔锋
    float brush = fbm(vUv * vec2(8.0, 3.0) + uTime * 0.03);
    // 晕染噪声
    float bleed = fbm(vUv * 4.0 - uTime * 0.02);

    // 墨色浓度：高处浓、低处淡，叠加笔触与晕染
    float ink = smoothstep(0.1, 0.95, h) * 0.7 + brush * 0.25 + bleed * 0.15;
    ink = clamp(ink, 0.0, 1.0);

    // 山脚渐隐到纸色（融入云海）
    float foot = smoothstep(0.0, 0.25, h);

    // 边缘晕开（uv 边缘淡化）
    float edgeX = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
    float edgeY = smoothstep(0.0, 0.1, vUv.y);
    float alpha = foot * edgeX * (0.6 + bleed * 0.4);

    vec3 col = mix(uPaperColor, uInkColor, ink);

    // 山顶微金（日落感）
    float goldMix = smoothstep(0.7, 1.0, h) * (0.15 + bleed * 0.1);
    col = mix(col, uGoldColor, goldMix);

    gl_FragColor = vec4(col, alpha);
  }
`;
