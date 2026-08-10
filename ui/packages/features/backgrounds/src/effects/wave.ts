// 波动族：以某个源点或某条基线为中心的周期性起伏。

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

/** 同心涟漪：波前从热点向外扩散，粒子骑在波前上一路被推到边缘。 */
export const rippleEffect = defineEffect({
  name: 'ripple',
  params: {
    background: colorSpec('底色', '#0d0906'),
    glow: colorSpec('辉光色', '#ff8a1e'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    pulse: numberSpec('脉冲', 0, 1, 0.01, 0),
    density: numberSpec('波纹密度', 20, 320, 1, 150),
    falloff: numberSpec('衰减', 0.5, 10, 0.1, 3.6),
    squash: numberSpec('横向压扁', 0.1, 1, 0.01, 0.42),
    originX: numberSpec('热点横向', 0, 1, 0.01, 0.62),
    originY: numberSpec('热点纵向', 0, 1, 0.01, 0.5),
    pointer: POINTER,
    sparks: numberSpec('粒子密度', 0, 1, 0.01, 0.5),
    grain: GRAIN,
    seed: SEED,
  },
  shared: `
uniform vec3 u_bg;
uniform vec3 u_glow;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_pulse;
uniform float u_density;
uniform float u_falloff;
uniform float u_squash;
uniform vec2 u_origin;
uniform float u_pointerGain;
uniform float u_grain;
uniform float u_seed;

vec2 hotCenter() {
  return mix(u_origin, u_pointer, clamp(u_pointerAmt * u_pointerGain, 0.0, 1.0) * 0.75);
}

/* 波前半径：横向压扁成椭圆 */
float ringRadius(vec2 uv, float aspect) {
  vec2 p = (uv - hotCenter()) * vec2(aspect, 1.0);
  p.x *= u_squash;
  return length(p);
}
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = aspectOf();
  float t = u_time * u_speed;
  vec2 pw = (uv - hotCenter()) * vec2(aspect, 1.0);

  float warp = (fbm3(vec3(pw * 2.6, t * 0.16 + u_seed)) - 0.5) * 0.10;
  float rr = max(ringRadius(uv, aspect) + warp, 0.0);

  float rings = sin(rr * u_density - t * 3.4 - u_pulse * 1.4);
  float band = smoothstep(0.05, 0.92, rings);
  float fall = exp(-rr * u_falloff);

  float lum = band * fall * (0.40 + u_pulse * 0.55) + fall * fall * 0.85 * (0.45 + u_pulse * 0.95);
  float core = exp(-rr * 26.0) * (0.8 + u_pulse * 2.4);

  vec3 col = u_bg + (u_glow * lum + mix(u_glow, vec3(1.0), 0.78) * core) * u_intensity;
  col *= 1.0 - 0.30 * pow(length((uv - 0.5) * vec2(1.05, 1.5)), 2.4);
  col += grain(uv, t) * u_grain * 0.07;
  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  particles: {
    mode: 'procedural',
    count: params => Math.round(1800 * (typeof params.sparks === 'number' ? params.sparks : 0.5)),
    body: `
void particle(int id, out vec2 pos, out float size, out vec4 color) {
  vec3 h = hash33(float(id) * 1.93 + u_seed * 7.0);
  float aspect = aspectOf();
  float t = u_time * u_speed;

  float life = 1.5 + h.z * 2.6;
  float ph = fract(t / life + h.x * 5.13);
  float age = ph * life;

  float ang = h.y * 6.2831853;
  vec2 dir = vec2(cos(ang), sin(ang));
  float r = 0.015 + age * (0.075 + h.z * 0.13) * (0.8 + u_pulse * 0.5);
  vec2 off = vec2(dir.x / max(u_squash, 0.05), dir.y) * r;
  off += curl(off * 7.0 + h.xy * 4.0, t * 0.3) * 0.010;

  float fade = smoothstep(0.0, 0.10, ph) * (1.0 - smoothstep(0.30, 1.0, ph));
  float dist = exp(-r * (u_falloff * 0.9));

  pos = hotCenter() + vec2(off.x / aspect, off.y);
  size = (0.9 + h.z * 3.2) * (0.4 + dist * 0.9);
  color = vec4(mix(u_glow, vec3(1.0), pow(dist, 3.0) * 0.9),
               fade * dist * (0.22 + h.z * 0.7) * (0.6 + u_pulse * 0.7) * u_opacity * u_intensity);
}
`,
  },
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    return {
      u_bg: rgb(p, 'background'),
      u_glow: rgb(p, 'glow'),
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_pulse: num(p, 'pulse'),
      u_density: num(p, 'density'),
      u_falloff: num(p, 'falloff'),
      u_squash: num(p, 'squash'),
      u_origin: [num(p, 'originX'), num(p, 'originY')],
      u_pointerGain: num(p, 'pointer'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `radial-gradient(circle at 62% 50%, ${params.glow as string}, ${params.background as string} 62%)`,
})

/** 光球：一枚会呼吸、边缘被噪声啃出毛边的发光球体。 */
export const orbEffect = defineEffect({
  name: 'orb',
  scale: 0.7,
  params: {
    background: colorSpec('底色', '#05060c'),
    core: colorSpec('核心色', '#ffffff'),
    glow: colorSpec('辉光色', '#5b8cff'),
    rim: colorSpec('边缘色', '#b45cff'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    radius: numberSpec('半径', 0.05, 0.9, 0.01, 0.32),
    breath: numberSpec('呼吸幅度', 0, 1, 0.01, 0.18),
    fuzz: numberSpec('毛边', 0, 1, 0.01, 0.4),
    pointer: POINTER,
    grain: GRAIN,
    seed: SEED,
  },
  fragment: `
uniform vec3 u_bg;
uniform vec3 u_core;
uniform vec3 u_glow;
uniform vec3 u_rim;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_radius;
uniform float u_breath;
uniform float u_fuzz;
uniform float u_pointerGain;
uniform float u_grain;
uniform float u_seed;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = aspectOf();
  float t = u_time * u_speed;

  vec2 center = mix(vec2(0.5), u_pointer, clamp(u_pointerAmt * u_pointerGain, 0.0, 1.0) * 0.6);
  vec2 p = (uv - center) * vec2(aspect, 1.0);
  float r = length(p);

  float ang = atan(p.y, p.x);
  float edge = (fbm3(vec3(cos(ang) * 1.6, sin(ang) * 1.6, t * 0.5 + u_seed)) - 0.5) * u_fuzz * 0.22;
  float radius = u_radius * (1.0 + sin(t * 1.1 + u_seed) * u_breath) + edge;

  float body = smoothstep(radius, radius * 0.35, r);
  float halo = exp(-max(r - radius, 0.0) * 5.5);
  float rim = smoothstep(radius * 1.05, radius * 0.82, r) - smoothstep(radius * 0.82, radius * 0.45, r);

  vec3 col = u_bg;
  col += u_glow * halo * 0.55 * u_intensity;
  col += u_rim * max(rim, 0.0) * 0.9 * u_intensity;
  col += u_core * body * (0.55 + 0.35 * fbm3(vec3(p * 3.0, t * 0.6))) * u_intensity;
  col = vec3(1.0) - exp(-col * 1.25);
  col += grain(uv, t) * u_grain * 0.06;

  fragColor = vec4(col * u_opacity, u_opacity);
}
`,
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    return {
      u_bg: rgb(p, 'background'),
      u_core: rgb(p, 'core'),
      u_glow: rgb(p, 'glow'),
      u_rim: rgb(p, 'rim'),
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_radius: num(p, 'radius'),
      u_breath: num(p, 'breath'),
      u_fuzz: num(p, 'fuzz'),
      u_pointerGain: num(p, 'pointer'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `radial-gradient(circle at 50% 50%, ${params.core as string}, ${params.glow as string} 32%, ${params.background as string} 70%)`,
})

/** 波浪：几条正弦带自下而上层叠推移，像慢速的水面剖面。 */
export const waveEffect = defineEffect({
  name: 'wave',
  scale: 0.6,
  params: {
    background: colorSpec('底色', '#04121c'),
    colorA: colorSpec('近处', '#0ea5b7'),
    colorB: colorSpec('远处', '#1e3a8a'),
    speed: SPEED,
    intensity: INTENSITY,
    opacity: OPACITY,
    layers: numberSpec('层数', 1, 6, 1, 4),
    amplitude: numberSpec('振幅', 0, 0.5, 0.005, 0.09),
    frequency: numberSpec('频率', 0.5, 12, 0.1, 3),
    baseline: numberSpec('基线', 0, 1, 0.01, 0.55),
    grain: GRAIN,
    seed: SEED,
  },
  fragment: `
uniform vec3 u_bg;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform float u_speed;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_layers;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_baseline;
uniform float u_grain;
uniform float u_seed;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed;
  vec3 col = u_bg;

  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_layers) break;
    float fi = float(i);
    float depth = fi / max(u_layers - 1.0, 1.0);
    float amp = u_amplitude * (1.0 - depth * 0.45);
    float freq = u_frequency * (1.0 + depth * 0.6);
    float phase = t * (0.5 + depth * 0.5) + u_seed + fi * 1.7;

    float h = u_baseline - depth * 0.16
            + sin(uv.x * freq + phase) * amp
            + sin(uv.x * freq * 1.9 - phase * 0.7) * amp * 0.45
            + (fbm3(vec3(uv.x * 2.0, phase * 0.2, fi)) - 0.5) * amp * 0.8;

    float body = smoothstep(h + 0.006, h - 0.006, uv.y);
    float crest = exp(-abs(uv.y - h) * 140.0);
    vec3 layerColor = mix(u_colorA, u_colorB, depth);
    col = mix(col, layerColor * (0.55 + 0.45 * (1.0 - depth)), body * 0.85);
    col += layerColor * crest * 0.7 * u_intensity;
  }

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
      u_speed: num(p, 'speed'),
      u_intensity: num(p, 'intensity'),
      u_opacity: num(p, 'opacity'),
      u_layers: num(p, 'layers'),
      u_amplitude: num(p, 'amplitude'),
      u_frequency: num(p, 'frequency'),
      u_baseline: num(p, 'baseline'),
      u_grain: num(p, 'grain'),
      u_seed: num(p, 'seed'),
    }
  },
  fallback: params =>
    `linear-gradient(180deg, ${params.background as string} 45%, ${params.colorA as string} 55%, ${params.colorB as string})`,
})
