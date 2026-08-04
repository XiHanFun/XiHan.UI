// 发光族：靠一条会呼吸的亮边或亮带撑起画面。

import type { EffectContext, UniformMap } from '../types'
import { num, rgb } from '../params'
import {
  colorSpec,
  defineEffect,
  GRAIN,
  INTENSITY,
  numberSpec,
  OPACITY,
  SEED,
  SPEED,
} from './define'

/**
 * 等离子：一条被噪声塑形的闪电边界把画面切成已填充与未填充两半，
 * 火花从边界甩向暗区。progress 由外部驱动时就是一根发光进度条。
 */
export const plasmaEffect = defineEffect({
  name: 'plasma',
  params: {
    fill: colorSpec('填充色', '#7d0f24'),
    glow: colorSpec('辉光色', '#ff5a1f'),
    background: colorSpec('底色', '#160d10'),
    progress: numberSpec('进度', 0, 1, 0.001, 0.62),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    turbulence: numberSpec('边界抖动', 0, 2, 0.05, 1),
    sparks: numberSpec('火花密度', 0, 1, 0.01, 0.5),
    grain: GRAIN,
    seed: SEED,
  },
  shared: `
uniform vec3 u_fill;
uniform vec3 u_glow;
uniform vec3 u_bg;
uniform float u_progress;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_turbulence;
uniform float u_grain;
uniform float u_seed;

/* 两个通道共用：火花必须诞生在它出生那一刻的边界上，否则会像贴上去的 */
float edgeAt(float y, float t) {
  float big   = fbm3(vec3(y * 2.6, t * 0.42, u_seed));
  float fine  = fbm3(vec3(y * 9.0, t * 1.35, u_seed + 4.0));
  float razor = vnoise(vec3(y * 26.0, t * 3.1, u_seed + 9.0));
  return u_progress
       + ((big - 0.5) * 0.055 + (fine - 0.5) * 0.030 + (razor - 0.5) * 0.012) * u_turbulence;
}
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = aspectOf();
  float t = u_time * u_speed;

  float edge = edgeAt(uv.y, t);
  float d = (uv.x - edge) * aspect;

  vec3 wp = vec3(uv.x * 2.2, uv.y * 3.0, t * 0.22 + u_seed);
  float w1 = fbm3(wp * 1.9);
  float w2 = fbm3(wp * 1.9 + vec3(3.7, 8.1, 1.2));
  float turb = fbm(wp + vec3(w1, w2, 0.0) * 1.2);

  float dark = fbm3(vec3(uv * vec2(2.2, 3.4), t * 0.11 + u_seed));
  vec3 col = u_bg + u_glow * dark * 0.07;

  vec3 body = u_fill * (0.35 + 1.20 * turb);
  body += u_glow * pow(turb, 3.0) * 0.40;
  float toEdge = clamp(uv.x / max(edge, 0.0001), 0.0, 1.0);
  body *= mix(0.42, 1.28, pow(toEdge, 1.6));
  col = mix(col, body, smoothstep(0.006, -0.006, d));

  float side = d < 0.0 ? 1.35 : 1.0;
  float halo = exp(-abs(d) * 10.0) * 0.50 * side + exp(-abs(d) * 44.0) * 0.85;
  float core = exp(-abs(d) * 170.0);
  col += u_glow * halo * u_intensity;
  col += mix(u_glow, vec3(1.0), 0.72) * core * 1.25 * u_intensity;

  col *= 1.0 - 0.26 * pow(abs(uv.y - 0.5) * 2.0, 3.0);
  col += grain(uv, t) * u_grain * 0.09;
  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  particles: {
    mode: 'procedural',
    count: params => Math.round(1400 * (typeof params.sparks === 'number' ? params.sparks : 0.5)),
    body: `
void particle(int id, out vec2 pos, out float size, out vec4 color) {
  float fid = float(id);
  vec3 h = hash33(fid * 1.37 + u_seed * 13.0);
  float aspect = aspectOf();
  float t = u_time * u_speed;

  float life = 0.55 + h.z * 1.30;
  float ph = fract(t / life + h.x * 7.31);
  float age = ph * life;
  float born = t - age;

  float y0 = h.y;
  vec2 p = vec2(edgeAt(y0, born), y0);

  /* 八成火花甩向未填充侧，两成回卷成填充体内的余烬 */
  float dir = h.z > 0.80 ? -0.55 : 1.0;
  float speed = 0.06 + h.x * 0.42;
  vec2 c = curl(vec2(y0 * 3.2 + h.x * 6.0, born * 0.8), t * 0.25);
  p.x += dir * (age * speed + age * age * 0.30) / aspect;
  p.y += (c.y * 0.045 + (h.x - 0.5) * 0.11) * age;

  float fade = smoothstep(0.0, 0.08, ph) * (1.0 - smoothstep(0.28, 1.0, ph));
  float heat = pow(1.0 - ph, 2.6);

  pos = p;
  size = (0.7 + h.z * 3.4) * (0.35 + heat * 0.9);
  color = vec4(mix(u_glow, vec3(1.0), heat * 0.85), fade * (0.20 + h.z * 0.80) * u_opacity * u_intensity);
}
`,
  },
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    return {
      u_fill: rgb(p, 'fill'),
      u_glow: rgb(p, 'glow'),
      u_bg: rgb(p, 'background'),
      u_progress: num(p, 'progress'),
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_turbulence: num(p, 'turbulence'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `linear-gradient(90deg, ${params.fill as string} 0%, ${params.glow as string} ${Math.round(num(params, 'progress') * 100)}%, ${params.background as string} ${Math.round(num(params, 'progress') * 100) + 2}%)`,
})

/**
 * 虹彩流光：RGB 三个通道在流场里错位采样，于是同一束光在边缘裂成彩虹。
 * 常数基底光保证光带任何时刻都在，不会随噪声漂移整体熄灭。
 */
export const auroraEffect = defineEffect({
  name: 'aurora',
  scale: 0.7,
  params: {
    background: colorSpec('底色', '#0a0a0c'),
    tint: colorSpec('主色', '#ff7a2a'),
    cool: colorSpec('冷色', '#4aa8ff'),
    mote: colorSpec('光尘色', '#ffc79a'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    level: numberSpec('律动', 0, 1, 0.01, 0.6),
    band: numberSpec('光带宽度', 0.5, 4, 0.05, 2.5),
    motes: numberSpec('光尘密度', 0, 1, 0.01, 0.4),
    grain: GRAIN,
    seed: SEED,
  },
  shared: `
uniform vec3 u_bg;
uniform vec3 u_tint;
uniform vec3 u_cool;
uniform vec3 u_mote;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_level;
uniform float u_band;
uniform float u_grain;
uniform float u_seed;

float field(vec2 p, float off, float t) {
  vec3 b = vec3(p * 1.5 + vec2(off, off * 0.35), t);
  float w1 = fbm3(b * 1.25);
  float w2 = fbm3(b * 1.25 + vec3(5.1, 2.3, 0.0));
  return fbm3(b + vec3(w1, w2, 0.0) * 1.7);
}

float streakMask(vec2 uv) {
  float band = exp(-pow((uv.y - 0.5) * u_band, 2.0));
  float right = smoothstep(0.16, 0.92, uv.x);
  return band * right;
}
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.10 * u_speed + u_seed;
  vec2 p = vec2(uv.x * aspectOf() - u_time * 0.025 * u_speed, uv.y);

  vec3 n = vec3(field(p, 0.0, t), field(p, 0.09, t), field(p, 0.18, t));
  n = smoothstep(0.30, 0.74, n);
  float e = smoothstep(0.34, 0.78, n.g);

  float mask = streakMask(uv) * (0.72 + u_level * 0.55);
  vec3 disp = mix(u_tint, u_cool, smoothstep(0.40, 0.92, uv.x));
  /* 常数项让光带任何时刻都在 */
  vec3 lit = (n * 0.55 + e * 0.35 + 0.28) * disp;
  vec3 col = u_bg + lit * mask * 1.7 * u_intensity;
  col += pow(e, 4.0) * mask * 0.5;
  /* 软肩曝光：高光平滑收敛而不是硬切到纯白 */
  col = vec3(1.0) - exp(-col * 1.3);

  col += grain(uv, t) * u_grain * 0.05;
  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  particles: {
    mode: 'procedural',
    count: params => Math.round(900 * (typeof params.motes === 'number' ? params.motes : 0.4)),
    body: `
void particle(int id, out vec2 pos, out float size, out vec4 color) {
  vec3 h = hash33(float(id) * 1.61 + u_seed * 5.0);
  float t = u_time * u_speed;

  float life = 3.0 + h.z * 4.5;
  float ph = fract(t / life + h.x * 4.21);
  float age = ph * life;

  vec2 p = vec2(0.12 + h.x * 0.52, 0.5 + (h.y - 0.5) * 0.62);
  p.x += age * (0.045 + h.z * 0.085) * (0.7 + u_level * 0.6);
  p.y += sin(t * 0.7 + h.x * 9.0) * 0.028
       + curl(vec2(p.x * 3.0, p.y * 3.0), t * 0.2).y * 0.018;

  float fade = smoothstep(0.0, 0.14, ph) * (1.0 - smoothstep(0.62, 1.0, ph));

  pos = p;
  size = 1.4 + h.z * 5.5;
  color = vec4(mix(u_mote, vec3(1.0), h.z * 0.6),
               fade * streakMask(p) * (0.14 + h.y * 0.5) * (0.5 + u_level * 0.8) * u_opacity);
}
`,
  },
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    return {
      u_bg: rgb(p, 'background'),
      u_tint: rgb(p, 'tint'),
      u_cool: rgb(p, 'cool'),
      u_mote: rgb(p, 'mote'),
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_level: num(p, 'level'),
      u_band: num(p, 'band'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `linear-gradient(100deg, ${params.background as string} 20%, ${params.tint as string} 62%, ${params.cool as string})`,
})

/** 极光带：几条斜向光带缓慢横扫，比 aurora 更安静，适合大面积页面背景。 */
export const beamEffect = defineEffect({
  name: 'beam',
  scale: 0.5,
  params: {
    background: colorSpec('底色', '#070a16'),
    colorA: colorSpec('光带一', '#4f7cff'),
    colorB: colorSpec('光带二', '#a45cff'),
    colorC: colorSpec('光带三', '#37e0c8'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    count: numberSpec('光带数量', 1, 6, 1, 3),
    tilt: numberSpec('倾角', -1.5, 1.5, 0.05, 0.5),
    softness: numberSpec('柔和度', 0.05, 1, 0.01, 0.45),
    grain: GRAIN,
    seed: SEED,
  },
  fragment: `
uniform vec3 u_bg;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_count;
uniform float u_tilt;
uniform float u_softness;
uniform float u_grain;
uniform float u_seed;

vec3 beamColor(int i) {
  if (i == 0) return u_colorA;
  if (i == 1) return u_colorB;
  if (i == 2) return u_colorC;
  return mix(u_colorA, u_colorC, float(i) * 0.25);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;
  vec3 col = u_bg;

  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_count) break;
    float fi = float(i);
    float phase = u_seed + fi * 2.37;
    /* 每条光带自己的横向位置与噪声扰动 */
    float axis = uv.x + uv.y * u_tilt;
    float center = 0.5 + 0.42 * sin(t * (0.13 + fi * 0.041) + phase);
    float wobble = (fbm3(vec3(uv.y * 2.2, t * 0.25 + fi, phase)) - 0.5) * 0.22;
    float d = (axis - center - wobble) / max(u_softness, 0.02);
    float band = exp(-d * d);
    col += beamColor(i) * band * (0.55 + 0.45 * sin(t * 0.7 + phase)) * u_intensity;
  }

  col = vec3(1.0) - exp(-col * 1.15);
  col += grain(uv, t) * u_grain * 0.05;
  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    return {
      u_bg: rgb(p, 'background'),
      u_colorA: rgb(p, 'colorA'),
      u_colorB: rgb(p, 'colorB'),
      u_colorC: rgb(p, 'colorC'),
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_count: num(p, 'count'),
      u_tilt: num(p, 'tilt'),
      u_softness: num(p, 'softness'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `linear-gradient(115deg, ${params.background as string}, ${params.colorA as string} 40%, ${params.colorB as string} 65%, ${params.background as string})`,
})
