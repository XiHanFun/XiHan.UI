// 流体族：连续色域在画面里缓慢翻涌。
// 三者共用同一套域扭曲流场，区别只在最后怎么上色与是否透明。

import type { EffectContext, UniformMap } from '../types'
import { num, rgb } from '../params'
import {
  boolSpec,
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

const FLOW_SHARED = `
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform vec3 u_colorD;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_pointerGain;
uniform float u_grain;
uniform float u_seed;

/* 指针把流体推开，推力随距离指数衰减 */
vec2 push(vec2 p, float aspect) {
  vec2 pm = vec2(u_pointer.x * aspect, u_pointer.y);
  vec2 dir = p - pm;
  float infl = exp(-dot(dir, dir) * 7.0) * u_pointerAmt * u_pointerGain;
  return p + normalize(dir + vec2(1e-4)) * infl * 0.30;
}

/* 三级域扭曲。xy 是一级扭曲量，z 是最终密度 */
vec3 flowField(vec2 p, float t) {
  vec3 b = vec3(p * 1.35, t);
  vec2 q = vec2(fbm3(b), fbm3(b + vec3(4.3, 1.7, 0.0)));
  vec2 r = vec2(fbm3(b + vec3(q * 2.4, 0.0) + vec3(1.9, 9.2, 0.0)),
                fbm3(b + vec3(q * 2.4, 0.0) + vec3(8.3, 2.8, 0.0)));
  return vec3(q, fbm(b + vec3(r * 3.0, 0.0)));
}
`

const FLOW_MOTES = `
void particle(int id, out vec2 pos, out float size, out vec4 color) {
  float fid = float(id);
  vec3 h = hash33(fid * 2.11 + u_seed * 9.0);
  float aspect = aspectOf();

  float life = 5.0 + h.z * 7.0;
  float ph = fract(u_time * max(u_speed, 0.02) / life + h.x * 3.77);
  float age = ph * life;

  vec2 p = vec2(h.x * aspect, h.y);
  float t = u_time * 0.09 * u_speed + u_seed;
  p += curl(p * 1.5 + h.xy * 4.0, t) * 0.030 * age;
  p += curl(p * 1.5, t + 0.6) * 0.022 * age;
  p = push(p, aspect);

  float fade = smoothstep(0.0, 0.16, ph) * (1.0 - smoothstep(0.72, 1.0, ph));
  vec3 tint = mix(u_colorA, u_colorD, h.z);

  pos = vec2(p.x / aspect, p.y);
  size = 2.0 + h.z * 9.0;
  color = vec4(mix(tint * 0.75, vec3(1.0), h.x * 0.55), fade * (0.10 + h.y * 0.26) * u_opacity);
}
`

function flowUniforms(ctx: EffectContext): UniformMap {
  const p = ctx.params
  return {
    u_colorA: rgb(p, 'colorA'),
    u_colorB: rgb(p, 'colorB'),
    u_colorC: rgb(p, 'colorC'),
    u_colorD: rgb(p, 'colorD'),
    u_speed: num(p, 'speed'),
    u_intensity: num(p, 'intensity'),
    u_opacity: num(p, 'opacity'),
    u_pointerGain: num(p, 'pointer'),
    u_grain: num(p, 'grain'),
    u_seed: num(p, 'seed'),
  }
}

const FLOW_COLORS = {
  colorA: colorSpec('主色', '#ff2f92'),
  colorB: colorSpec('副色', '#ff9a3c'),
  colorC: colorSpec('高光', '#ffd2e2'),
  colorD: colorSpec('点缀', '#ff5aa5'),
}

/** 流体墨色：整块画面缓慢翻涌，颜料微粒悬浮其中。 */
export const fluidEffect = defineEffect({
  name: 'fluid',
  scale: 0.6,
  params: {
    ...FLOW_COLORS,
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    pointer: POINTER,
    grain: GRAIN,
    density: numberSpec('微粒密度', 0, 1, 0.01, 0.5),
    seed: SEED,
  },
  shared: FLOW_SHARED,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = aspectOf();
  float t = u_time * 0.09 * u_speed + u_seed;
  vec2 p = push(vec2(uv.x * aspect, uv.y), aspect);

  vec3 fl = flowField(p, t);
  vec2 q = fl.xy;
  float f = fl.z;

  vec3 col = mix(u_colorA, u_colorB, clamp(f * 2.1, 0.0, 1.0));
  col = mix(col, u_colorC, clamp(length(q) * 1.25 - 0.18, 0.0, 1.0));
  col = mix(col, u_colorD, clamp(q.y * 1.7 - 0.25, 0.0, 1.0));
  col *= 0.86 + 0.50 * f * u_intensity;
  col += grain(uv, t) * u_grain * 0.06;

  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  particles: {
    mode: 'procedural',
    count: params => Math.round(520 * (typeof params.density === 'number' ? params.density : 0.5) * 2),
    body: FLOW_MOTES,
    blend: 'normal',
  },
  uniforms: flowUniforms,
  fallback: params =>
    `linear-gradient(135deg, ${params.colorA as string}, ${params.colorB as string} 45%, ${params.colorD as string})`,
})

/**
 * 流体玻璃：同一套流场，但整体半透明并带高光与焦散，
 * 铺在组件背景上时底下的内容仍然透得出来。
 */
export const glassEffect = defineEffect({
  name: 'glass',
  scale: 0.7,
  params: {
    colorA: colorSpec('主色', '#3aa0ff'),
    colorB: colorSpec('副色', '#7b5cff'),
    colorC: colorSpec('高光', '#8ffff0'),
    colorD: colorSpec('阴影', '#0b1b3a'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: numberSpec('不透明度', 0, 1, 0.01, 0.55),
    pointer: POINTER,
    grain: numberSpec('噪点', 0, 1, 0.01, 0.1),
    sheen: numberSpec('镜面高光', 0, 2, 0.05, 1),
    seed: SEED,
  },
  shared: `${FLOW_SHARED}
uniform float u_sheen;
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = aspectOf();
  float t = u_time * 0.08 * u_speed + u_seed;
  vec2 p = push(vec2(uv.x * aspect, uv.y), aspect);

  vec3 fl = flowField(p, t);
  vec2 q = fl.xy;
  float f = fl.z;

  float body = smoothstep(0.18, 0.86, f * 0.62 + length(q) * 0.38);
  vec3 col = mix(u_colorA, u_colorB, body);
  float shade = smoothstep(0.42, 0.85, fbm3(vec3(q * 2.6, t)) * 0.7 + 0.3);
  col = mix(col, u_colorD, shade * 0.62);

  /* 高光与焦散：玻璃的厚度感几乎全靠这两项 */
  float spec = pow(clamp(1.0 - abs(f - 0.52) * 2.0, 0.0, 1.0), 5.0);
  float caustic = pow(clamp(0.52 + 0.48 * sin((q.x - q.y) * 5.2 + f * 7.0 - t * 1.8), 0.0, 1.0), 7.0);
  col = mix(col, u_colorC, (spec * 0.30 + caustic * 0.16) * u_sheen);

  /* 指针处玻璃变厚一点 */
  vec2 dir = vec2(uv.x * aspect, uv.y) - vec2(u_pointer.x * aspect, u_pointer.y);
  float lens = exp(-dot(dir, dir) * 6.0) * u_pointerAmt * u_pointerGain;

  float alpha = clamp((0.30 + body * 0.46 + spec * 0.20 + lens * 0.25) * u_intensity, 0.0, 1.0) * u_opacity;
  col += grain(uv, t) * u_grain * 0.05;
  fragColor = vec4(col * alpha, alpha);
}
`,
  uniforms: (ctx: EffectContext): UniformMap => ({
    ...flowUniforms(ctx),
    u_sheen: num(ctx.params, 'sheen'),
  }),
  fallback: params =>
    `linear-gradient(120deg, ${params.colorA as string}55, ${params.colorB as string}66 60%, ${params.colorC as string}44)`,
})

/** 网格渐变：最轻的一档，只有柔和的多色晕染，适合大面积常驻背景。 */
export const meshEffect = defineEffect({
  name: 'mesh',
  scale: 0.4,
  params: {
    ...FLOW_COLORS,
    speed: numberSpec('速度', 0, 3, 0.05, 0.5),
    intensity: INTENSITY,
    opacity: OPACITY,
    pointer: numberSpec('指针影响', 0, 2, 0.05, 0.5),
    grain: numberSpec('噪点', 0, 1, 0.01, 0.1),
    softness: numberSpec('柔和度', 0, 1, 0.01, 0.7),
    seed: SEED,
  },
  shared: `${FLOW_SHARED}
uniform float u_softness;
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = aspectOf();
  float t = u_time * 0.05 * u_speed + u_seed;
  vec2 p = push(vec2(uv.x * aspect, uv.y), aspect);

  /* 四个缓慢游走的色心，按距离加权混合 */
  vec2 c0 = vec2(aspect * 0.28 + 0.16 * sin(t * 0.9 + u_seed), 0.30 + 0.14 * cos(t * 0.7));
  vec2 c1 = vec2(aspect * 0.74 + 0.14 * cos(t * 0.6 - u_seed), 0.26 + 0.16 * sin(t * 0.8));
  vec2 c2 = vec2(aspect * 0.34 + 0.18 * sin(t * 0.5), 0.76 + 0.12 * cos(t * 0.9 + u_seed));
  vec2 c3 = vec2(aspect * 0.80 + 0.12 * cos(t * 0.8), 0.72 + 0.15 * sin(t * 0.6 - u_seed));

  float k = mix(6.0, 1.6, u_softness);
  float w0 = exp(-dot(p - c0, p - c0) * k);
  float w1 = exp(-dot(p - c1, p - c1) * k);
  float w2 = exp(-dot(p - c2, p - c2) * k);
  float w3 = exp(-dot(p - c3, p - c3) * k);
  float sum = max(w0 + w1 + w2 + w3, 1e-4);

  vec3 col = (u_colorA * w0 + u_colorB * w1 + u_colorC * w2 + u_colorD * w3) / sum;
  col *= 0.82 + 0.42 * fbm3(vec3(p * 1.1, t)) * u_intensity;
  col += grain(uv, t) * u_grain * 0.05;

  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  uniforms: (ctx: EffectContext): UniformMap => ({
    ...flowUniforms(ctx),
    u_softness: num(ctx.params, 'softness'),
  }),
  fallback: params =>
    `radial-gradient(at 25% 30%, ${params.colorA as string}, transparent 55%), radial-gradient(at 78% 26%, ${params.colorB as string}, transparent 55%), radial-gradient(at 32% 76%, ${params.colorC as string}, transparent 55%), ${params.colorD as string}`,
})

/** 胶片颗粒：只叠一层动态噪点，配合任何底色使用。 */
export const grainEffect = defineEffect({
  name: 'grain',
  params: {
    color: colorSpec('颗粒色', '#ffffff'),
    opacity: numberSpec('不透明度', 0, 1, 0.01, 0.12),
    scale: numberSpec('颗粒粗细', 0.2, 4, 0.05, 1),
    speed: numberSpec('速度', 0, 3, 0.05, 1),
    monochrome: boolSpec('单色', true),
  },
  fragment: `
uniform vec3 u_color;
uniform float u_opacity;
uniform float u_scale;
uniform float u_speed;
uniform float u_mono;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = floor(u_time * u_speed * 24.0);
  vec2 g = uv * u_resolution / max(u_scale, 0.05);
  float n = hash13(vec3(g, t));
  vec3 col = u_mono > 0.5
    ? u_color * n
    : vec3(hash13(vec3(g, t)), hash13(vec3(g, t + 7.0)), hash13(vec3(g, t + 19.0))) * u_color;
  float a = u_opacity * n;
  fragColor = vec4(col * a, a);
}
`,
  uniforms: (ctx: EffectContext): UniformMap => ({
    u_color: rgb(ctx.params, 'color'),
    u_opacity: num(ctx.params, 'opacity'),
    u_scale: num(ctx.params, 'scale'),
    u_speed: num(ctx.params, 'speed'),
    u_mono: ctx.params.monochrome === true ? 1 : 0,
  }),
  fallback: () => 'transparent',
})
