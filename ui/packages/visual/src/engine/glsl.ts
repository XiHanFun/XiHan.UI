// 着色器公共片段。两个绘制通道共用同一份 uniform 声明与噪声工具，
// 效果因此可以在流场里和粒子里引用同一个函数，粒子才能精确落在流场的特征位置上。

/** 全屏三角形：顶点坐标由顶点序号直接算出，不需要顶点缓冲。 */
export const VERT_QUAD: string = `#version 300 es
precision highp float;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

/** 两个通道共用的 uniform 与噪声工具。 */
export const GLSL_COMMON: string = `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_pointerAmt;
uniform float u_px;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(float n) {
  vec3 p = fract(vec3(n * 0.1031, n * 0.1030, n * 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i + vec3(0.0, 0.0, 0.0)), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

float fbm3(vec3 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * vnoise(p); p *= 2.07; a *= 0.5; }
  return s * 1.14;
}

float fbm(vec3 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return s * 1.07;
}

vec2 curl(vec2 p, float t) {
  float e = 0.08;
  float n1 = fbm3(vec3(p.x, p.y + e, t));
  float n2 = fbm3(vec3(p.x, p.y - e, t));
  float n3 = fbm3(vec3(p.x + e, p.y, t));
  float n4 = fbm3(vec3(p.x - e, p.y, t));
  return vec2(n1 - n2, n4 - n3) / (2.0 * e);
}

float grain(vec2 uv, float t) { return hash13(vec3(uv * 1024.0, t)) - 0.5; }

float aspectOf() { return u_resolution.x / max(u_resolution.y, 1.0); }
`

/** 粒子通道的片元着色器：一个软圆点，颜色已预乘 alpha。 */
export const FRAG_POINT: string = `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = exp(-r * r * 3.6) * (1.0 - smoothstep(0.75, 1.0, r));
  a *= v_color.a;
  if (a < 0.002) discard;
  fragColor = vec4(v_color.rgb * a, a);
}`

/** 拼流场通道的片元着色器。 */
export function buildFragment(shared: string, body: string): string {
  return `#version 300 es\n${GLSL_COMMON}\n${shared}\nout vec4 fragColor;\n${body}`
}

/** 拼程序化粒子的顶点着色器。 */
export function buildProceduralVertex(shared: string, body: string): string {
  return `#version 300 es
${GLSL_COMMON}
${shared}
out vec4 v_color;
${body}
void main() {
  vec2 pos; float size; vec4 col;
  particle(gl_VertexID, pos, size, col);
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = max(size * u_px, 1.0);
  v_color = col;
}`
}

/**
 * 拼数据驱动粒子的顶点着色器。
 * 两份点云同时在缓冲里，u_morph 在它们之间插值；随后按 yaw/pitch 旋转再做透视投影，
 * 所以同一套点云既能当平面图案用，也能当立体点阵转起来。
 */
export function buildCloudVertex(shared: string, body: string): string {
  return `#version 300 es
${GLSL_COMMON}
${shared}
in vec3 a_from;
in vec3 a_to;
in vec3 a_colorFrom;
in vec3 a_colorTo;
in vec2 a_meta;
out vec4 v_color;
uniform float u_morph;
uniform float u_yaw;
uniform float u_pitch;
uniform float u_zoom;
uniform float u_pointSize;
uniform float u_depthFade;
uniform float u_alpha;
${body}
void main() {
  float m = smoothstep(0.0, 1.0, u_morph);
  vec3 p = mix(a_from, a_to, m);
  p = displace(p, a_meta.y, u_time);

  float cy = cos(u_yaw), sy = sin(u_yaw);
  vec3 r1 = vec3(p.x * cy - p.z * sy, p.y, p.x * sy + p.z * cy);
  float cp = cos(u_pitch), sp = sin(u_pitch);
  vec3 r2 = vec3(r1.x, r1.y * cp - r1.z * sp, r1.y * sp + r1.z * cp);

  float persp = 4.2 / (4.2 - clamp(r2.z, -3.4, 3.4));
  vec2 uv = vec2(0.5) + vec2(r2.x / aspectOf(), r2.y) * 0.5 * u_zoom * persp;

  gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = max(a_meta.x * u_pointSize * u_px * persp, 1.0);

  vec3 col = mix(a_colorFrom, a_colorTo, m);
  float depth = mix(1.0 - u_depthFade, 1.0, clamp(r2.z * 0.5 + 0.5, 0.0, 1.0));
  v_color = vec4(col, u_alpha * depth);
}`
}
