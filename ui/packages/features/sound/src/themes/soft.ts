// 柔和主题：低音区正弦、慢起音、长衰减、厚混响。适合阅读器、
// 冥想类或夜间界面——提示要被听见，但不许惊到人。

import { defineSoundTheme, flat, glide, strike } from './define'

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
      { kind: 'oscillator', wave: 'sine', frequency: flat(261.63), gain: strike(0.22, 0.025, 0.4) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(329.63), gain: strike(0.22, 0.025, 0.4), delay: 0.12 },
      { kind: 'oscillator', wave: 'sine', frequency: flat(392), gain: strike(0.24, 0.025, 0.45), delay: 0.24 },
    ],
    space: 0.35,
  },
  'error': {
    // 三角波而非正弦：低音区的纯正弦在笔记本与手机内置扬声器上几乎发不出声，
    // 三角波的谐波按 1/n² 衰减，够被听见又不失柔和
    layers: [
      { kind: 'oscillator', wave: 'triangle', frequency: flat(196), gain: strike(0.28, 0.02, 0.25) },
      { kind: 'oscillator', wave: 'triangle', frequency: flat(155.56), gain: strike(0.26, 0.02, 0.3), delay: 0.16 },
    ],
    space: 0.2,
  },
  'warning': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(587.33), gain: strike(0.22, 0.03, 0.18) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(587.33), gain: strike(0.22, 0.03, 0.22), delay: 0.2 },
    ],
    space: 0.25,
  },
  'info': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(523.25), gain: strike(0.22, 0.03, 0.35) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(659.25), gain: strike(0.1, 0.03, 0.3) },
    ],
    space: 0.35,
  },
  'notification': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(587.33), gain: strike(0.24, 0.03, 0.4) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(493.88), gain: strike(0.24, 0.03, 0.45), delay: 0.18 },
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
      { kind: 'oscillator', wave: 'sine', frequency: flat(261.63), gain: strike(0.2, 0.025, 0.35) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(329.63), gain: strike(0.2, 0.025, 0.35), delay: 0.12 },
      { kind: 'oscillator', wave: 'sine', frequency: flat(392), gain: strike(0.2, 0.025, 0.4), delay: 0.24 },
      { kind: 'oscillator', wave: 'sine', frequency: flat(523.25), gain: strike(0.24, 0.025, 0.6), delay: 0.36 },
    ],
    space: 0.4,
  },
})
