// 粒子族：画面主体由成千上万个程序化粒子构成，底纹只作陪衬。

import type { EffectContext, UniformMap } from '../types'
import { num, rgb } from '../params'
import {
  colorSpec,
  defineEffect,
  GRAIN,
  INTENSITY,
  numberSpec,
  OPACITY,
  POINTER,
  SEED,
  SPEED,
} from './define'

/** 星野：三层视差星点，指针移动时近层跟得比远层快。 */
export const starfieldEffect = defineEffect({
  name: 'starfield',
  params: {
    background: colorSpec('底色', '#04050c'),
    star: colorSpec('星点色', '#ffffff'),
    accent: colorSpec('点缀色', '#8ab4ff'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    density: numberSpec('星点密度', 0, 1, 0.01, 0.5),
    twinkle: numberSpec('闪烁', 0, 1, 0.01, 0.6),
    drift: numberSpec('漂移', 0, 1, 0.01, 0.25),
    parallax: POINTER,
    grain: GRAIN,
    seed: SEED,
  },
  shared: `
uniform vec3 u_bg;
uniform vec3 u_star;
uniform vec3 u_accent;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_twinkle;
uniform float u_drift;
uniform float u_parallax;
uniform float u_grain;
uniform float u_seed;
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;
  /* 底色带一点极缓慢的星云，避免纯色背景显得死 */
  float haze = fbm3(vec3(uv * vec2(aspectOf(), 1.0) * 1.4, t * 0.03 + u_seed));
  vec3 col = u_bg + u_accent * pow(haze, 3.0) * 0.18 * u_intensity;
  col += grain(uv, t) * u_grain * 0.04;
  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  particles: {
    mode: 'procedural',
    count: params => Math.round(2600 * (typeof params.density === 'number' ? params.density : 0.5)),
    body: `
void particle(int id, out vec2 pos, out float size, out vec4 color) {
  float fid = float(id);
  vec3 h = hash33(fid * 1.29 + u_seed * 3.0);
  float t = u_time * u_speed;

  /* 三层深度，越近的层越大越亮、视差也越强 */
  float layer = floor(h.z * 3.0);
  float depth = (layer + 1.0) / 3.0;

  vec2 p = vec2(h.x, h.y);
  p.x = fract(p.x + t * 0.004 * u_drift * depth);
  vec2 offset = (u_pointer - 0.5) * u_pointerAmt * u_parallax * 0.06 * depth;
  p += offset;

  float phase = h.x * 43.0 + h.y * 17.0;
  float tw = mix(1.0, 0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * (1.2 + h.z * 2.4) + phase), 2.0), u_twinkle);

  pos = fract(p);
  size = (0.6 + h.z * 2.2) * depth * 1.4;
  color = vec4(mix(u_star, u_accent, step(0.86, h.x)),
               tw * depth * (0.25 + h.y * 0.6) * u_opacity * u_intensity);
}
`,
  },
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    return {
      u_bg: rgb(p, 'background'),
      u_star: rgb(p, 'star'),
      u_accent: rgb(p, 'accent'),
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_twinkle: num(p, 'twinkle'),
      u_drift: num(p, 'drift'),
      u_parallax: num(p, 'parallax'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `radial-gradient(ellipse at 50% 40%, ${params.accent as string}22, ${params.background as string} 70%)`,
})

/** 星云：厚重的多层噪声云团，中间嵌着亮星。 */
export const nebulaEffect = defineEffect({
  name: 'nebula',
  scale: 0.6,
  params: {
    background: colorSpec('底色', '#050416'),
    colorA: colorSpec('云色一', '#4c2a86'),
    colorB: colorSpec('云色二', '#0f5fa8'),
    colorC: colorSpec('高光', '#ff9ad4'),
    star: colorSpec('星点色', '#ffffff'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    density: numberSpec('星点密度', 0, 1, 0.01, 0.35),
    contrast: numberSpec('对比', 0.2, 3, 0.05, 1.2),
    grain: GRAIN,
    seed: SEED,
  },
  shared: `
uniform vec3 u_bg;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform vec3 u_star;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_contrast;
uniform float u_grain;
uniform float u_seed;
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = vec2(uv.x * aspectOf(), uv.y);
  float t = u_time * 0.05 * u_speed + u_seed;

  float w1 = fbm3(vec3(p * 1.7, t));
  float w2 = fbm3(vec3(p * 1.7 + vec2(3.4, 7.1), t * 1.3));
  float d = fbm(vec3(p * 2.1 + vec2(w1, w2) * 1.8, t * 0.7));

  float shaped = pow(clamp(d * 1.6 - 0.18, 0.0, 1.0), u_contrast);
  vec3 col = u_bg;
  col = mix(col, u_colorA, shaped);
  col = mix(col, u_colorB, clamp(w2 * 1.4 - 0.35, 0.0, 1.0) * shaped);
  col += u_colorC * pow(shaped, 4.0) * 0.9 * u_intensity;

  col = vec3(1.0) - exp(-col * 1.2);
  col += grain(uv, t) * u_grain * 0.05;
  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  particles: {
    mode: 'procedural',
    count: params => Math.round(1600 * (typeof params.density === 'number' ? params.density : 0.35)),
    body: `
void particle(int id, out vec2 pos, out float size, out vec4 color) {
  vec3 h = hash33(float(id) * 1.71 + u_seed * 11.0);
  float t = u_time * u_speed;
  float tw = 0.4 + 0.6 * pow(0.5 + 0.5 * sin(t * (0.8 + h.z * 2.0) + h.x * 31.0), 2.0);
  pos = vec2(h.x, h.y);
  size = 0.6 + h.z * 2.4;
  color = vec4(mix(u_star, u_colorC, h.z * 0.5), tw * (0.2 + h.y * 0.6) * u_opacity * u_intensity);
}
`,
  },
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    return {
      u_bg: rgb(p, 'background'),
      u_colorA: rgb(p, 'colorA'),
      u_colorB: rgb(p, 'colorB'),
      u_colorC: rgb(p, 'colorC'),
      u_star: rgb(p, 'star'),
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_contrast: num(p, 'contrast'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `radial-gradient(at 35% 35%, ${params.colorA as string}, transparent 55%), radial-gradient(at 70% 65%, ${params.colorB as string}, transparent 55%), ${params.background as string}`,
})

/** 流场：粒子被旋度噪声推着走，画出一片持续变形的丝状纹理。 */
export const flowFieldEffect = defineEffect({
  name: 'flow-field',
  params: {
    background: colorSpec('底色', '#0a0c14'),
    colorA: colorSpec('粒子色一', '#7cf6d0'),
    colorB: colorSpec('粒子色二', '#5b8cff'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    density: numberSpec('粒子密度', 0, 1, 0.01, 0.6),
    scaleField: numberSpec('流场尺度', 0.4, 6, 0.05, 2),
    stride: numberSpec('步长', 0.1, 3, 0.05, 1),
    pointer: POINTER,
    grain: GRAIN,
    seed: SEED,
  },
  shared: `
uniform vec3 u_bg;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_scaleField;
uniform float u_stride;
uniform float u_pointerGain;
uniform float u_grain;
uniform float u_seed;
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;
  vec3 col = u_bg + u_colorB * fbm3(vec3(uv * 2.0, t * 0.05 + u_seed)) * 0.06 * u_intensity;
  col += grain(uv, t) * u_grain * 0.04;
  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  particles: {
    mode: 'procedural',
    count: params => Math.round(4000 * (typeof params.density === 'number' ? params.density : 0.6)),
    body: `
void particle(int id, out vec2 pos, out float size, out vec4 color) {
  float fid = float(id);
  vec3 h = hash33(fid * 1.47 + u_seed * 17.0);
  float aspect = aspectOf();
  float t = u_time * u_speed;

  float life = 2.2 + h.z * 3.4;
  float ph = fract(t / life + h.x * 8.13);
  float age = ph * life;

  vec2 p = vec2(h.x * aspect, h.y);
  /* 两步近似积分：一次用出生时刻的场，一次用当前场 */
  float born = t - age;
  p += curl(p * u_scaleField, born * 0.2 + u_seed) * 0.05 * u_stride * age;
  p += curl(p * u_scaleField, t * 0.2 + u_seed) * 0.04 * u_stride * age;

  vec2 pm = vec2(u_pointer.x * aspect, u_pointer.y);
  vec2 dir = p - pm;
  p += normalize(dir + vec2(1e-4)) * exp(-dot(dir, dir) * 8.0) * u_pointerAmt * u_pointerGain * 0.12;

  float fade = smoothstep(0.0, 0.12, ph) * (1.0 - smoothstep(0.55, 1.0, ph));

  pos = vec2(p.x / aspect, p.y);
  size = 0.8 + h.z * 2.4;
  color = vec4(mix(u_colorA, u_colorB, h.z), fade * (0.12 + h.y * 0.42) * u_opacity * u_intensity);
}
`,
  },
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    return {
      u_bg: rgb(p, 'background'),
      u_colorA: rgb(p, 'colorA'),
      u_colorB: rgb(p, 'colorB'),
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_scaleField: num(p, 'scaleField'),
      u_stride: num(p, 'stride'),
      u_pointerGain: num(p, 'pointer'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `linear-gradient(140deg, ${params.background as string}, ${params.colorB as string}33, ${params.background as string})`,
})
