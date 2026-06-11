// ============================================================
// WebGL hero — "scan target"
// A noise-displaced point cloud sphere with a sweeping scan band,
// orbital rings, and a drifting particle field. Mouse-parallax.
// ============================================================
import * as THREE from "three";

const canvas = document.getElementById("webgl");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sizes = { w: window.innerWidth, h: window.innerHeight };

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(42, sizes.w / sizes.h, 0.1, 100);
camera.position.set(0, 0, reduced ? 5.4 : 9);
scene.add(camera);

const group = new THREE.Group();
scene.add(group);

// ---- shared simplex noise (Ashima webgl-noise) ----
const NOISE = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+1.0*C.xxx; vec3 x2=x0-i2+2.0*C.xxx; vec3 x3=x0-1.0+3.0*C.xxx;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

// ---- core point cloud ----
const coreGeo = new THREE.IcosahedronGeometry(1.55, 26);
const coreMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: { value: 0 },
    uScan: { value: 0 },
    uIntro: { value: reduced ? 1 : 0 },
    uColorA: { value: new THREE.Color("#2A6E8C") },
    uColorB: { value: new THREE.Color("#6AE0FF") },
    uPx: { value: renderer.getPixelRatio() },
  },
  vertexShader: NOISE + /* glsl */ `
    uniform float uTime; uniform float uScan; uniform float uIntro; uniform float uPx;
    varying float vDisp; varying float vBand;
    void main(){
      vec3 p = position;
      float n  = snoise(p*1.05 + uTime*0.12);
      float n2 = snoise(p*2.4  - uTime*0.09)*0.45;
      float disp = n + n2;
      vDisp = disp;
      vec3 dpos = p + normal * disp * 0.22 * uIntro;
      float band = smoothstep(0.10, 0.0, abs(dpos.y - (uScan*2.0-1.0)*1.7));
      vBand = band;
      vec4 mv = modelViewMatrix * vec4(dpos, 1.0);
      gl_PointSize = (1.6 + band*7.0) * uIntro * uPx * (260.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    precision mediump float;
    uniform vec3 uColorA; uniform vec3 uColorB;
    varying float vDisp; varying float vBand;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if(d > 0.5) discard;
      float a = smoothstep(0.5, 0.08, d);
      vec3 col = mix(uColorA, uColorB, clamp(vDisp*0.5+0.5, 0.0, 1.0));
      col = mix(col, vec3(1.0), vBand);
      gl_FragColor = vec4(col, a * (0.42 + vBand*0.58));
    }`,
});
const core = new THREE.Points(coreGeo, coreMat);
group.add(core);

// ---- faint wireframe shell ----
const shellGeo = new THREE.IcosahedronGeometry(1.62, 2);
const shell = new THREE.LineSegments(
  new THREE.WireframeGeometry(shellGeo),
  new THREE.LineBasicMaterial({ color: 0x6ae0ff, transparent: true, opacity: 0.05 })
);
group.add(shell);

// ---- orbital rings ----
const ringMat = new THREE.MeshBasicMaterial({ color: 0x6ae0ff, transparent: true, opacity: 0.10, side: THREE.DoubleSide });
const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.004, 8, 160), ringMat);
const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.004, 8, 160), ringMat.clone());
ringA.rotation.x = Math.PI * 0.5;
ringB.rotation.x = Math.PI * 0.32;
ringB.rotation.y = Math.PI * 0.2;
group.add(ringA, ringB);

// ---- drifting field ----
const FN = 300;
const fpos = new Float32Array(FN * 3);
for (let i = 0; i < FN; i++) {
  const r = 4 + Math.random() * 8;
  const t = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  fpos[i * 3] = r * Math.sin(ph) * Math.cos(t);
  fpos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(t);
  fpos[i * 3 + 2] = r * Math.cos(ph);
}
const fieldGeo = new THREE.BufferGeometry();
fieldGeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
const field = new THREE.Points(
  fieldGeo,
  new THREE.PointsMaterial({ size: 0.018, color: 0x8b94a0, transparent: true, opacity: 0.5, depthWrite: false })
);
scene.add(field);

// ---- interaction ----
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
if (!reduced) {
  window.addEventListener("mousemove", (e) => {
    mouse.tx = (e.clientX / sizes.w - 0.5) * 2;
    mouse.ty = (e.clientY / sizes.h - 0.5) * 2;
  });
}

// ---- scroll-driven scan position ----
let scrollN = 0;
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollN = max > 0 ? window.scrollY / max : 0;
}, { passive: true });

// ---- resize ----
window.addEventListener("resize", () => {
  sizes.w = window.innerWidth;
  sizes.h = window.innerHeight;
  camera.aspect = sizes.w / sizes.h;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  coreMat.uniforms.uPx.value = renderer.getPixelRatio();
});

// ---- intro + loop ----
const clock = new THREE.Clock();
let introT = reduced ? 1 : 0;

function frame() {
  const t = clock.getElapsedTime();

  if (!reduced && introT < 1) {
    introT = Math.min(1, introT + 0.012);
    const e = 1 - Math.pow(1 - introT, 3); // easeOutCubic
    coreMat.uniforms.uIntro.value = e;
    camera.position.z = 9 - e * 3.6; // dolly 9 -> 5.4
  }

  coreMat.uniforms.uTime.value = t;
  // scan band: continuous sweep, biased by scroll for "live" feel
  coreMat.uniforms.uScan.value = (Math.sin(t * 0.4) * 0.5 + 0.5) * (1 - scrollN * 0.4) + scrollN * 0.3;

  if (!reduced) {
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    group.rotation.y = t * 0.08 + mouse.x * 0.4;
    group.rotation.x = mouse.y * 0.25;
    ringA.rotation.z = t * 0.15;
    ringB.rotation.z = -t * 0.1;
    field.rotation.y = t * 0.02;
    // recede slightly as the user scans down
    group.position.y = scrollN * 0.6;
    group.scale.setScalar(1 - scrollN * 0.12);
  } else {
    group.rotation.y = 0.4;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

// fade canvas in once first frame is up
requestAnimationFrame(() => canvas.classList.add("is-ready"));
