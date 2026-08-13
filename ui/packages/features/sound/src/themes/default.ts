// 默认主题：清亮乐音系。音符取自 C 大调——成功与完成是琶音上行，
// 错误是低音区下行，交互声是高频短敲；反馈类带少量混响撑出空间感。

import { defineSoundTheme, flat, glide, strike } from './define'

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
      { kind: 'oscillator', wave: 'sine', frequency: flat(523.25), gain: strike(0.28, 0.008, 0.22) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(659.25), gain: strike(0.3, 0.008, 0.26), delay: 0.09 },
      { kind: 'oscillator', wave: 'sine', frequency: flat(783.99), gain: strike(0.32, 0.008, 0.34), delay: 0.18 },
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
      { kind: 'oscillator', wave: 'triangle', frequency: flat(880), gain: strike(0.28, 0.005, 0.1) },
      { kind: 'oscillator', wave: 'triangle', frequency: flat(880), gain: strike(0.28, 0.005, 0.16), delay: 0.14 },
    ],
    space: 0.08,
  },
  'info': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(1046.5), gain: strike(0.26, 0.01, 0.3) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(1318.51), gain: strike(0.1, 0.01, 0.25) },
    ],
    space: 0.18,
  },
  'notification': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(783.99), gain: strike(0.3, 0.01, 0.28) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(659.25), gain: strike(0.28, 0.01, 0.4), delay: 0.15 },
      { kind: 'oscillator', wave: 'sine', frequency: flat(1567.98), gain: strike(0.07, 0.01, 0.2) },
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
  'receive': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(740, 550, 0.09), gain: strike(0.24, 0.005, 0.14) },
      { kind: 'noise', gain: strike(0.08, 0.001, 0.02), filter: { type: 'highpass', frequency: 2500 } },
    ],
    space: 0.1,
  },
  'complete': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(523.25), gain: strike(0.26, 0.008, 0.2) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(659.25), gain: strike(0.28, 0.008, 0.22), delay: 0.09 },
      { kind: 'oscillator', wave: 'sine', frequency: flat(783.99), gain: strike(0.28, 0.008, 0.26), delay: 0.18 },
      { kind: 'oscillator', wave: 'sine', frequency: flat(1046.5), gain: strike(0.3, 0.008, 0.5), delay: 0.27 },
    ],
    space: 0.2,
  },
})
