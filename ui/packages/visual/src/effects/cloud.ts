// 数据驱动粒子：形态来自点云缓冲，图片、文字、SVG、参数方程都走这一个效果。
// 换形态就是换一份点云，两份点云之间由 u_morph 插值，所以「图片 A 化成图片 B」是免费的。

import type { EffectContext, UniformMap } from '../types'
import { num, rgb } from '../params'
import {
  boolSpec,
  colorSpec,
  defineEffect,
  numberSpec,
  OPACITY,
  POINTER,
  SEED,
  SPEED,
} from './define'

export const particlesEffect = defineEffect({
  name: 'particles',
  params: {
    background: colorSpec('底色', '#05060a'),
    backgroundOpacity: numberSpec('底色不透明度', 0, 1, 0.01, 0),
    speed: SPEED,
    opacity: OPACITY,
    pointSize: numberSpec('点大小', 0.2, 8, 0.05, 2.2),
    zoom: numberSpec('缩放', 0.2, 3, 0.01, 0.85),
    yaw: numberSpec('水平旋转', -3.15, 3.15, 0.01, 0),
    pitch: numberSpec('俯仰', -1.2, 1.2, 0.01, 0),
    autorotate: boolSpec('自动旋转', true),
    spin: numberSpec('自转速度', -2, 2, 0.01, 0.25),
    depthFade: numberSpec('景深淡出', 0, 1, 0.01, 0.45),
    turbulence: numberSpec('湍流', 0, 2, 0.01, 0.35),
    noiseScale: numberSpec('湍流尺度', 0.2, 6, 0.05, 1.7),
    swirl: numberSpec('涡旋', 0, 2, 0.01, 0.3),
    breathe: numberSpec('呼吸', 0, 1, 0.01, 0.25),
    pointer: POINTER,
    seed: SEED,
  },
  shared: `
uniform vec3 u_bg;
uniform float u_bgOpacity;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_noiseScale;
uniform float u_swirl;
uniform float u_breathe;
uniform float u_pointerGain;
uniform float u_seed;
`,
  fragment: `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float vignette = 1.0 - 0.35 * pow(length(uv - 0.5) * 1.4, 2.2);
  vec3 col = u_bg * vignette;
  fragColor = vec4(col * u_bgOpacity, u_bgOpacity);
}
`,
  particles: {
    mode: 'cloud',
    body: `
vec3 displace(vec3 p, float seed, float t) {
  float tt = t * u_speed;

  /* 整体呼吸 */
  p *= 1.0 + sin(tt * 1.2 + seed * 6.2831) * u_breathe * 0.06;

  /* 每点各自的低频湍流 */
  vec3 q = p * u_noiseScale + vec3(seed * 7.3);
  vec3 n = vec3(
    vnoise(q + vec3(0.0, 0.0, tt * 0.6)),
    vnoise(q + vec3(5.2, 1.3, tt * 0.6)),
    vnoise(q + vec3(9.7, 4.4, tt * 0.6))
  ) - 0.5;
  p += n * u_turbulence * 0.12;

  /* 绕竖轴的涡旋，越靠近轴心转得越快 */
  float r = length(p.xz);
  float a = u_swirl * 0.6 * exp(-r * 1.2) * sin(tt * 0.7 + seed * 6.2831);
  float ca = cos(a), sa = sin(a);
  p.xz = vec2(p.x * ca - p.z * sa, p.x * sa + p.z * ca);

  /* 指针斥力：把点从指针处推开 */
  vec2 pm = (u_pointer - 0.5) * 2.0;
  vec2 d = p.xy - pm;
  float f = exp(-dot(d, d) * 4.0) * u_pointerAmt * u_pointerGain;
  p.xy += normalize(d + vec2(1e-4)) * f * 0.35;

  return p;
}
`,
  },
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    const autorotate = p.autorotate === true
    const spin = num(p, 'spin')
    return {
      u_bg: rgb(p, 'background'),
      u_bgOpacity: num(p, 'backgroundOpacity'),
      u_speed: num(p, 'speed'),
      u_turbulence: num(p, 'turbulence'),
      u_noiseScale: num(p, 'noiseScale'),
      u_swirl: num(p, 'swirl'),
      u_breathe: num(p, 'breathe'),
      u_pointerGain: num(p, 'pointer'),
      u_seed: num(p, 'seed'),
      u_yaw: num(p, 'yaw') + (autorotate ? ctx.time * spin : 0),
      u_pitch: num(p, 'pitch'),
      u_zoom: num(p, 'zoom'),
      u_pointSize: num(p, 'pointSize'),
      u_depthFade: num(p, 'depthFade'),
      u_alpha: num(p, 'opacity'),
    }
  },
  fallback: (params) => {
    const opacity = num(params, 'backgroundOpacity')
    return opacity > 0 ? (params.background as string) : 'transparent'
  },
})
