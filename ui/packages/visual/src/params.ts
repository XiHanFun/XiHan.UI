// 参数解析：默认值、类型校验、越界钳制。
// 效果只声明一次 ParamSpecMap，这里把它变成可用的值——非法输入一律回落到默认值而不是抛错，
// 因为参数常来自用户界面或持久化配置，为一个越界的滑块把整张卡片打黑不划算。

import type { ParamSpec, ParamSpecMap, ParamValue, ParamValues } from './types'

/** 取一份全默认值。 */
export function defaultParams(specs: ParamSpecMap): ParamValues {
  const out: Record<string, ParamValue> = {}
  for (const key of Object.keys(specs))
    out[key] = specs[key]!.default
  return out
}

/** 按单项规格解析一个值；不合法则回落到默认值。 */
export function resolveParam(spec: ParamSpec, value: ParamValue | undefined): ParamValue {
  if (value === undefined)
    return spec.default

  switch (spec.kind) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value)
      if (!Number.isFinite(n))
        return spec.default
      return Math.min(spec.max, Math.max(spec.min, n))
    }
    case 'boolean':
      return typeof value === 'boolean' ? value : Boolean(value)
    case 'enum':
      return typeof value === 'string' && spec.values.includes(value) ? value : spec.default
    case 'color':
      return typeof value === 'string' && isHexColor(value) ? value : spec.default
  }
}

/**
 * 按规格解析整份参数。规格里没有的键直接丢弃——效果换了以后残留的旧键
 * 若继续跟着走，会在下一次序列化时被写回，越攒越多。
 */
export function resolveParams(
  specs: ParamSpecMap,
  values: Readonly<Record<string, ParamValue>> | undefined,
): ParamValues {
  const out: Record<string, ParamValue> = {}
  for (const key of Object.keys(specs))
    out[key] = resolveParam(specs[key]!, values?.[key])
  return out
}

export function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
}

/** #rgb / #rrggbb → [r, g, b]，分量 0~1。非法输入返回黑色。 */
export function hexToRgb(value: string): [number, number, number] {
  if (!isHexColor(value))
    return [0, 0, 0]
  let hex = value.slice(1)
  if (hex.length === 3)
    hex = hex[0]! + hex[0]! + hex[1]! + hex[1]! + hex[2]! + hex[2]!
  const n = Number.parseInt(hex, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** 读数值参数；键不存在或不是数值时返回 0。 */
export function num(params: ParamValues, key: string): number {
  const v = params[key]
  return typeof v === 'number' ? v : 0
}

/** 读布尔参数。 */
export function bool(params: ParamValues, key: string): boolean {
  return params[key] === true
}

/** 读字符串参数（枚举或颜色）。 */
export function str(params: ParamValues, key: string): string {
  const v = params[key]
  return typeof v === 'string' ? v : ''
}

/** 读颜色参数并转成 uniform 用的三分量。 */
export function rgb(params: ParamValues, key: string): [number, number, number] {
  return hexToRgb(str(params, key))
}
