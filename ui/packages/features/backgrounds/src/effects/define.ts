// 效果定义帮助器。参数规格写起来很啰嗦，这几个工厂把它压成一行，
// 顺带保证 min/max/step/default 一个都不会漏。

import type {
  BooleanParamSpec,
  ColorParamSpec,
  EnumParamSpec,
  NumberParamSpec,
  VisualEffect,
} from '../types'

export function defineEffect(effect: VisualEffect): VisualEffect {
  return effect
}

export function numberSpec(
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
): NumberParamSpec {
  return { kind: 'number', label, min, max, step, default: value }
}

export function colorSpec(label: string, value: string): ColorParamSpec {
  return { kind: 'color', label, default: value }
}

export function boolSpec(label: string, value: boolean): BooleanParamSpec {
  return { kind: 'boolean', label, default: value }
}

export function enumSpec(label: string, values: readonly string[], value: string): EnumParamSpec {
  return { kind: 'enum', label, values, default: value }
}

/** 几乎每个效果都有的两项。 */
export const SPEED = numberSpec('速度', 0, 3, 0.05, 1)
export const INTENSITY = numberSpec('强度', 0, 2, 0.05, 1)
export const OPACITY = numberSpec('不透明度', 0, 1, 0.01, 1)
export const POINTER = numberSpec('指针影响', 0, 2, 0.05, 1)
export const GRAIN = numberSpec('噪点', 0, 1, 0.01, 0.2)
export const SEED = numberSpec('随机种子', 0, 999, 1, 0)
