// 柔和主题：低音区正弦、慢起音、长衰减、厚混响。适合阅读器、
// 冥想类或夜间界面——提示要被听见，但不许惊到人。

import { defineSoundTheme, glide, strike, strikeTone } from './define'

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
  'receive': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(523.25, 415.3, 0.15), gain: strike(0.2, 0.02, 0.25) },
    ],
    space: 0.3,
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
})
