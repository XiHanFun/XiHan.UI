// 极简主题：短促、干净、无混响。单层衰减都在 0.15 秒内，整段不超过 0.3 秒。
// 适合信息密度高、提示频繁的界面——声音只标记事件发生，不渲染情绪。

import { defineSoundTheme, flat, glide, strike } from './define'

export const minimalSoundTheme = defineSoundTheme({
  'click': {
    layers: [
      { kind: 'oscillator', wave: 'triangle', frequency: glide(1600, 1300, 0.02), gain: strike(0.3, 0.001, 0.03) },
    ],
  },
  'tap': {
    layers: [
      { kind: 'oscillator', wave: 'triangle', frequency: glide(1400, 1200, 0.02), gain: strike(0.2, 0.001, 0.025) },
    ],
  },
  'toggle-on': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(880), gain: strike(0.22, 0.002, 0.05) },
    ],
  },
  'toggle-off': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(659.25), gain: strike(0.2, 0.002, 0.05) },
    ],
  },
  'open': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(500, 800, 0.06), gain: strike(0.16, 0.005, 0.07) },
    ],
  },
  'close': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(800, 500, 0.06), gain: strike(0.15, 0.005, 0.07) },
    ],
  },
  'success': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(880), gain: strike(0.22, 0.003, 0.08) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(1174.66), gain: strike(0.22, 0.003, 0.1), delay: 0.07 },
    ],
  },
  'error': {
    layers: [
      { kind: 'oscillator', wave: 'square', frequency: flat(220), gain: strike(0.24, 0.003, 0.08), filter: { type: 'lowpass', frequency: 900 } },
      { kind: 'oscillator', wave: 'square', frequency: flat(220), gain: strike(0.24, 0.003, 0.1), delay: 0.1, filter: { type: 'lowpass', frequency: 900 } },
    ],
  },
  'warning': {
    layers: [
      { kind: 'oscillator', wave: 'triangle', frequency: flat(987.77), gain: strike(0.2, 0.003, 0.06) },
      { kind: 'oscillator', wave: 'triangle', frequency: flat(987.77), gain: strike(0.2, 0.003, 0.08), delay: 0.11 },
    ],
  },
  'info': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(1046.5), gain: strike(0.18, 0.003, 0.09) },
    ],
  },
  'notification': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(880), gain: strike(0.2, 0.003, 0.08) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(1046.5), gain: strike(0.18, 0.003, 0.1), delay: 0.09 },
    ],
  },
  'send': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(600, 900, 0.07), gain: strike(0.18, 0.003, 0.07) },
    ],
  },
  'receive': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: glide(900, 700, 0.06), gain: strike(0.18, 0.003, 0.07) },
    ],
  },
  'complete': {
    layers: [
      { kind: 'oscillator', wave: 'sine', frequency: flat(659.25), gain: strike(0.2, 0.003, 0.08) },
      { kind: 'oscillator', wave: 'sine', frequency: flat(880), gain: strike(0.2, 0.003, 0.08), delay: 0.08 },
      { kind: 'oscillator', wave: 'sine', frequency: flat(1046.5), gain: strike(0.2, 0.003, 0.12), delay: 0.16 },
    ],
  },
})
