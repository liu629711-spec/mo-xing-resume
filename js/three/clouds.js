// 云海/云雾：着色器流动云海 + 山腰体积雾（sprite 堆叠）。
const THREE = window.THREE;

export const cloudVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cloudFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uPaperColor;
  uniform vec3 uInkColor;
  uniform float uFlowSpeed;
  varying vec2 vUv;

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
    for(int i=0;i<5;i++){ v+=a*snoise(p); p*=2.0; a*=0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    // 流动
    vec2 q = uv * vec2(6.0, 2.0);
    q.x += uTime * uFlowSpeed;
    float cloud = fbm(q);
    cloud = smoothstep(-0.1, 0.6, cloud);

    // 边缘淡化
    float edge = smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
    float alpha = cloud * edge * 0.7;

    // 云色：纸色到淡墨
    vec3 col = mix(uPaperColor, uInkColor, cloud * 0.25);
    gl_FragColor = vec4(col, alpha);
  }
`;

// 大平面云海
export function createCloudSea(opts = {}) {
  const {
    width = 200, depth = 30, uniforms = null,
  } = opts;
  const geo = new THREE.PlaneGeometry(width, depth, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    vertexShader: cloudVertexShader,
    fragmentShader: cloudFragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: uniforms || {
      uTime: { value: 0 },
      uPaperColor: { value: new THREE.Color(0.93, 0.89, 0.83) },
      uInkColor: { value: new THREE.Color(0.08, 0.08, 0.08) },
      uFlowSpeed: { value: 0.15 },
    },
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.3;
  mesh.frustumCulled = false;
  return mesh;
}

// 体积雾：半透明 sprite 堆叠在山腰
export function createMistVolume(opts = {}) {
  const { count = 6, xCenter = 0, uniforms = null } = opts;
  const group = new THREE.Group();
  // 生成一个柔光纹理
  const tex = makeSoftCircleTexture();
  for (let i = 0; i < count; i++) {
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      color: 0xffffff,
    });
    const sprite = new THREE.Sprite(mat);
    const w = 6 + Math.random() * 4;
    sprite.scale.set(w, w * 0.5, 1);
    sprite.position.set(
      xCenter + (Math.random() - 0.5) * 8,
      0.8 + Math.random() * 1.2,
      -2 + (Math.random() - 0.5) * 2,
    );
    group.add(sprite);
  }
  return group;
}

function makeSoftCircleTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.3)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
