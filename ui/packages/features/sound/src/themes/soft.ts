/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 柔和主题：低音区正弦、慢起音、长衰减、厚混响。适合阅读器、
// 冥想类或夜间界面——提示要被听见，但不许惊到人。

import { defineSoundTheme, glide, strike, strikeTone, sustainTone } from './define'

export const softSoundTheme = defineSoundTheme({
  'click': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(520, 440, 0.05), gain: strike(0.25, 0.01, 0.09) },
    ],
    space: 0.15,
  },
  'tap': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(480, 430, 0.04), gain: strike(0.18, 0.01, 0.08) },
    ],
    space: 0.12,
  },
  'toggle-on': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(392, 523.25, 0.12), gain: strike(0.25, 0.02, 0.2) },
    ],
    space: 0.2,
  },
  'toggle-off': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(523.25, 392, 0.12), gain: strike(0.22, 0.02, 0.2) },
    ],
    space: 0.2,
  },
  'open': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(261.63, 392, 0.2), gain: strike(0.2, 0.04, 0.3) },
      {
        kind: 'noise',
        gain: strike(0.06, 0.05, 0.25),
        filter: { type: 'lowpass', frequency: [{ time: 0, value: 300 }, { time: 0.25, value: 1200, curve: 'exp' }] },
      },
    ],
    space: 0.3,
  },
  'close': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(392, 261.63, 0.18), gain: strike(0.18, 0.03, 0.28) },
      {
        kind: 'noise',
        gain: strike(0.05, 0.04, 0.22),
        filter: { type: 'lowpass', frequency: [{ time: 0, value: 1100 }, { time: 0.22, value: 300, curve: 'exp' }] },
      },
    ],
    space: 0.28,
  },
  'success': {
    layers: [
      strikeTone('sine', 261.63, 0.22, 0.025, 0.4),
      strikeTone('sine', 329.63, 0.22, 0.025, 0.4, 0.12),
      strikeTone('sine', 392, 0.24, 0.025, 0.45, 0.24),
    ],
    space: 0.35,
  },
  'error': {
    // 三角波而非正弦：低音区的纯正弦在笔记本与手机内置扬声器上几乎发不出声，
    // 三角波的谐波按 1/n² 衰减，够被听见又不失柔和
    layers: [
      strikeTone('triangle', 196, 0.28, 0.02, 0.25),
      strikeTone('triangle', 155.56, 0.26, 0.02, 0.3, 0.16),
    ],
    space: 0.2,
  },
  'warning': {
    layers: [
      strikeTone('sine', 587.33, 0.22, 0.03, 0.18),
      strikeTone('sine', 587.33, 0.22, 0.03, 0.22, 0.2),
    ],
    space: 0.25,
  },
  'info': {
    layers: [
      strikeTone('sine', 523.25, 0.22, 0.03, 0.35),
      strikeTone('sine', 659.25, 0.1, 0.03, 0.3),
    ],
    space: 0.35,
  },
  'notification': {
    layers: [
      strikeTone('sine', 587.33, 0.24, 0.03, 0.4),
      strikeTone('sine', 493.88, 0.24, 0.03, 0.45, 0.18),
    ],
    space: 0.4,
  },
  'send': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(330, 523.25, 0.18), gain: strike(0.2, 0.03, 0.22) },
    ],
    space: 0.25,
  },
  // 两声上挑的软泡音：与 notification 的下行双音拉开方向与速度
  'receive': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(440, 587.33, 0.05), gain: strike(0.18, 0.012, 0.13) },
      { kind: 'oscillator', wave: 'sine', frequency: glide(587.33, 783.99, 0.05), gain: strike(0.2, 0.012, 0.18), delay: 0.11 },
    ],
    space: 0.22,
  },
  'complete': {
    layers: [
      strikeTone('sine', 261.63, 0.2, 0.025, 0.35),
      strikeTone('sine', 329.63, 0.2, 0.025, 0.35, 0.12),
      strikeTone('sine', 392, 0.2, 0.025, 0.4, 0.24),
      strikeTone('sine', 523.25, 0.24, 0.025, 0.6, 0.36),
    ],
    space: 0.4,
  },
  // 来电：低一个八度的两句琶音，慢起音、底下垫正弦长音，一遍约 2.6 秒、歇 0.8 秒再来
  'ring': {
    layers: [
      sustainTone('sine', 261.63, 0.06, 0.15, 1, 0.35),
      strikeTone('sine', 392, 0.18, 0.025, 0.45),
      strikeTone('sine', 523.25, 0.18, 0.025, 0.45, 0.16),
      strikeTone('sine', 659.25, 0.18, 0.025, 0.45, 0.32),
      strikeTone('sine', 783.99, 0.2, 0.025, 0.85, 0.48),
      sustainTone('sine', 196, 0.06, 0.15, 1, 0.45, 1.1),
      strikeTone('sine', 392, 0.18, 0.025, 0.45, 1.1),
      strikeTone('sine', 493.88, 0.18, 0.025, 0.45, 1.26),
      strikeTone('sine', 587.33, 0.18, 0.025, 0.45, 1.42),
      strikeTone('sine', 783.99, 0.2, 0.025, 0.9, 1.58),
    ],
    space: 0.35,
    period: 3.4,
  },
  // 回铃：G4 与 B4 的大三度长音，慢慢起、慢慢收，响 1.6 秒、歇两秒多
  'ringback': {
    layers: [
      sustainTone('sine', 392, 0.14, 0.2, 1.2, 0.45),
      sustainTone('sine', 493.88, 0.09, 0.2, 1.2, 0.45),
    ],
    space: 0.3,
    period: 4.2,
  },
})
