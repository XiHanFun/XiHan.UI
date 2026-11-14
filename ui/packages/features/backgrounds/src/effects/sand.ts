/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 沙：点云的另一种走法。换形态不是整体插值，而是被风吹散、再从上风处飘来落定——
// 迎风一侧的沙先动，每颗沙各走各的，飘散的一路渐渐看不见。
// 空点云是合法的一端：对正显示着的形状 setCloud(空点云) 就是「吹散」，第一份点云则是「聚成」。

import type { EffectContext, UniformMap } from '../types'
import { num } from '../params'
import {
  defineEffect,
  numberSpec,
  OPACITY,
  POINTER,
  SEED,
  SPEED,
} from './define'

export const sandEffect = defineEffect({
  name: 'sand',
  params: {
    speed: SPEED,
    opacity: OPACITY,
    pointSize: numberSpec('沙粒大小', 0.2, 8, 0.05, 1.8),
    zoom: numberSpec('缩放', 0.02, 3, 0.001, 0.85),
    originX: numberSpec('中心横向位置', -1, 2, 0.001, 0.5),
    originY: numberSpec('中心纵向位置', -1, 2, 0.001, 0.5),
    windAngle: numberSpec('风向', -3.15, 3.15, 0.01, 0),
    reach: numberSpec('吹出距离', 0, 8, 0.01, 1.4),
    sweep: numberSpec('风头扫过', 0, 0.6, 0.01, 0.3),
    scatter: numberSpec('先后错落', 0, 0.3, 0.01, 0.15),
    turbulence: numberSpec('湍流', 0, 2, 0.01, 0.6),
    lift: numberSpec('上扬', -1, 1, 0.01, 0.3),
    shimmer: numberSpec('静止微颤', 0, 1, 0.01, 0.1),
    pointer: POINTER,
    seed: SEED,
  },
  shared: `
uniform float u_speed;
uniform vec2 u_origin;
uniform vec2 u_wind;
uniform float u_reach;
uniform float u_sweep;
uniform float u_scatter;
uniform float u_turbulence;
uniform float u_lift;
uniform float u_shimmer;
uniform float u_pointerGain;
`,
  particles: {
    mode: 'cloud',
    blend: 'normal',
    sprite: 'solid',
    body: `
vec3 displace(vec3 p, float seed, float t) {
  float tt = t * u_speed;

  /* 落定的沙并非死的：每颗有一点极小的颤动 */
  p.xy += vec2(sin(tt * 1.3 + seed * 6.2831), cos(tt * 1.1 + seed * 12.566)) * u_shimmer * 0.006;

  /* 落在画布的哪里由 origin 定：换算成点云单位的平移 */
  vec2 unit = vec2(aspectOf(), 1.0) / max(u_zoom, 0.001);
  p.xy += (u_origin - 0.5) * 2.0 * unit;

  /* 指针斥力：把沙从指针处拨开 */
  vec2 d = p.xy - (u_pointer - 0.5) * 2.0 * unit;
  float f = exp(-dot(d, d) * 4.0) * u_pointerAmt * u_pointerGain;
  p.xy += normalize(d + vec2(1e-4)) * f * 0.35;

  return p;
}
`,
    travel: `
/* 这颗沙在风扫过的队列里排得多靠后：迎风一侧先动，各自再错开一点 */
float sandOrder(vec3 p, float seed) {
  float along = clamp(dot(p.xy, u_wind) * 0.5 + 0.5, 0.0, 1.0);
  return along * u_sweep + fract(seed * 7.31) * u_scatter;
}

/* 整体进度换成这一颗自己的进度：排在后面的晚出发，整体走到 1 时全部走完 */
float sandProgress(float morph, float order) {
  return clamp((morph - order) / max(1.0 - u_sweep - u_scatter, 0.08), 0.0, 1.0);
}

vec3 travel(vec3 from, vec3 to, vec2 presence, float morph, float seed, float t, out float blend, out float alpha) {
  vec2 across = vec2(-u_wind.y, u_wind.x);
  float s2 = fract(seed * 13.7);
  float s3 = fract(seed * 3.17);
  bool both = presence.x > 0.5 && presence.y > 0.5;

  /* 两端都在：前半程吹散旧的，后半程聚成新的 */
  if (presence.y < 0.5 || (both && morph < 0.5)) {
    float p = sandProgress(both ? morph * 2.0 : morph, sandOrder(from, seed));
    /* 被风带走：起步慢、越吹越快，各自快慢不一，后半程渐渐看不见 */
    float push = pow(p, 1.7 + s3 * 1.1);
    /* 同一片风场：邻近的沙被同一阵风带着，飘出去是一缕一缕的，不是各飞各的 */
    vec2 gust = curl(from.xy * 0.8 + u_wind * push * 0.6, t * 0.12) * 0.1 * u_turbulence * push;
    /* 跑得快的是少数：最前头稀稀拉拉，不会齐刷刷一道边 */
    vec2 drift = u_wind * u_reach * (0.35 + 1.15 * seed * seed) * push
      + across * (s2 - 0.5 + u_lift * 0.5) * 0.9 * push
      + gust;
    blend = 0.0;
    alpha = 1.0 - smoothstep(0.3, 1.0, p);
    return from + vec3(drift, 0.0);
  }

  float p = sandProgress(both ? morph * 2.0 - 1.0 : morph, sandOrder(to, seed));
  /* 从上风处飘来：先快后慢，越靠近落点晃得越小，像沙落定 */
  float k = pow(1.0 - p, 3.0);
  vec2 gust = curl(to.xy * 0.8 - u_wind * k * 0.6, t * 0.12) * 0.1 * u_turbulence * k;
  vec2 drift = -u_wind * u_reach * (0.3 + s3 * 0.8) * k
    + across * (s2 - 0.5) * 0.8 * k
    + gust;
  blend = 1.0;
  alpha = smoothstep(0.0, 0.3, p);
  return to + vec3(drift, 0.0);
}
`,
  },
  uniforms: (ctx: EffectContext): UniformMap => {
    const p = ctx.params
    const angle = num(p, 'windAngle')
    return {
      u_speed: num(p, 'speed'),
      u_origin: [num(p, 'originX'), num(p, 'originY')],
      u_wind: [Math.cos(angle), Math.sin(angle)],
      u_reach: num(p, 'reach'),
      u_sweep: num(p, 'sweep'),
      u_scatter: num(p, 'scatter'),
      u_turbulence: num(p, 'turbulence'),
      u_lift: num(p, 'lift'),
      u_shimmer: num(p, 'shimmer'),
      u_pointerGain: num(p, 'pointer'),
      // 沙是一层平面：不转、不做景深
      u_yaw: 0,
      u_pitch: 0,
      u_depthFade: 0,
      u_zoom: num(p, 'zoom'),
      u_pointSize: num(p, 'pointSize'),
      u_alpha: num(p, 'opacity'),
    }
  },
  fallback: () => 'transparent',
})
