/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 默认主题：清亮乐音系。音符取自 C 大调——成功与完成是琶音上行，
// 错误是低音区下行，交互声是高频短敲；反馈类带少量混响撑出空间感；来电与回铃是循环播放的长音。

import { defineSoundTheme, flat, glide, strike, strikeTone, sustainTone } from './define'

export const defaultSoundTheme = defineSoundTheme({
  'click': {
    layers: [
      { kind: 'oscillator', wave: 'triangle', frequency: glide(2200, 1600, 0.03), gain: strike(0.5, 0.002, 0.045) },
      { kind: 'noise', gain: strike(0.22, 0.001, 0.03), filter: { type: 'highpass', frequency: 4000 } },
    ],
  },
  'tap': {
    layers: [
      { kind: 'oscillator', wave: 'triangle', frequency: glide(1800, 1400, 0.025), gain: strike(0.32, 0.002, 0.04) },
    ],
  },
  'toggle-on': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(587.33, 880, 0.07), gain: strike(0.34, 0.005, 0.13) },
    ],
    space: 0.06,
  },
  'toggle-off': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(880, 587.33, 0.07), gain: strike(0.3, 0.005, 0.13) },
    ],
    space: 0.06,
  },
  'open': {
    layers: [
      {
        kind: 'noise',
        gain: strike(0.16, 0.04, 0.16),
        filter: { type: 'lowpass', frequency: [{ time: 0, value: 400 }, { time: 0.18, value: 2600, curve: 'exp' }], q: 1.2 },
      },
      { kind: 'oscillator', wave: 'sine', frequency: glide(329.63, 523.25, 0.16), gain: strike(0.18, 0.02, 0.18) },
    ],
    space: 0.1,
  },
  'close': {
    layers: [
      {
        kind: 'noise',
        gain: strike(0.14, 0.03, 0.14),
        filter: { type: 'lowpass', frequency: [{ time: 0, value: 2400 }, { time: 0.16, value: 400, curve: 'exp' }], q: 1.2 },
      },
      { kind: 'oscillator', wave: 'sine', frequency: glide(523.25, 329.63, 0.14), gain: strike(0.16, 0.015, 0.16) },
    ],
    space: 0.08,
  },
  'success': {
    layers: [
      strikeTone('sine', 523.25, 0.28, 0.008, 0.22),
      strikeTone('sine', 659.25, 0.3, 0.008, 0.26, 0.09),
      strikeTone('sine', 783.99, 0.32, 0.008, 0.34, 0.18),
    ],
    space: 0.15,
  },
  'error': {
    layers: [
      { kind: 'oscillator', wave: 'sawtooth', frequency: flat(220), gain: strike(0.3, 0.008, 0.1), filter: { type: 'lowpass', frequency: 1200, q: 0.8 } },
      { kind: 'oscillator', wave: 'sawtooth', frequency: flat(174.61), gain: strike(0.3, 0.008, 0.16), delay: 0.11, filter: { type: 'lowpass', frequency: 1200, q: 0.8 } },
    ],
    space: 0.06,
  },
  'warning': {
    layers: [
      strikeTone('triangle', 880, 0.28, 0.005, 0.1),
      strikeTone('triangle', 880, 0.28, 0.005, 0.16, 0.14),
    ],
    space: 0.08,
  },
  'info': {
    layers: [
      strikeTone('sine', 1046.5, 0.26, 0.01, 0.3),
      strikeTone('sine', 1318.51, 0.1, 0.01, 0.25),
    ],
    space: 0.18,
  },
  'notification': {
    layers: [
      strikeTone('sine', 783.99, 0.3, 0.01, 0.28),
      strikeTone('sine', 659.25, 0.28, 0.01, 0.4, 0.15),
      strikeTone('sine', 1567.98, 0.07, 0.01, 0.2),
    ],
    space: 0.25,
  },
  'send': {
    layers: [
      {
        kind: 'oscillator',
        wave: 'sine',
        frequency: glide(440, 880, 0.12),
        gain: [{ time: 0, value: 0 }, { time: 0.02, value: 0.2 }, { time: 0.12, value: 0.26 }, { time: 0.17, value: 0, curve: 'exp' }],
      },
    ],
    space: 0.08,
  },
  // 两声上挑的短泡音：与 notification 的下行双音铃拉开方向、速度与音区，一听就分得出是消息
  'receive': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(880, 1174.66, 0.035), gain: strike(0.22, 0.003, 0.08) },
      { kind: 'oscillator', wave: 'sine', frequency: glide(1174.66, 1567.98, 0.035), gain: strike(0.24, 0.003, 0.11), delay: 0.085 },
    ],
    space: 0.06,
  },
  'complete': {
    layers: [
      strikeTone('sine', 523.25, 0.26, 0.008, 0.2),
      strikeTone('sine', 659.25, 0.28, 0.008, 0.22, 0.09),
      strikeTone('sine', 783.99, 0.28, 0.008, 0.26, 0.18),
      strikeTone('sine', 1046.5, 0.3, 0.008, 0.5, 0.27),
    ],
    space: 0.2,
  },
  // 来电：C 大调与 G 大调两句琶音，底下各垫一层三角波长音连成一片，一遍约 2.2 秒、歇 0.7 秒再来
  'ring': {
    layers: [
      sustainTone('triangle', 523.25, 0.05, 0.06, 0.85, 0.25),
      strikeTone('sine', 783.99, 0.2, 0.006, 0.32),
      strikeTone('sine', 1046.5, 0.2, 0.006, 0.32, 0.13),
      strikeTone('sine', 1318.51, 0.2, 0.006, 0.32, 0.26),
      strikeTone('sine', 1567.98, 0.22, 0.006, 0.6, 0.39),
      sustainTone('triangle', 392, 0.05, 0.06, 0.85, 0.35, 0.95),
      strikeTone('sine', 783.99, 0.2, 0.006, 0.32, 0.95),
      strikeTone('sine', 987.77, 0.2, 0.006, 0.32, 1.08),
      strikeTone('sine', 1174.66, 0.2, 0.006, 0.32, 1.21),
      strikeTone('sine', 1567.98, 0.22, 0.006, 0.7, 1.34),
    ],
    space: 0.18,
    period: 2.9,
  },
  // 回铃：A4 与升 C5 的大三度长音，平稳地响 1.4 秒、歇两秒多，等对方接听
  'ringback': {
    layers: [
      sustainTone('sine', 440, 0.16, 0.12, 1.1, 0.35),
      sustainTone('sine', 554.37, 0.1, 0.12, 1.1, 0.35),
    ],
    space: 0.12,
    period: 3.6,
  },
})
