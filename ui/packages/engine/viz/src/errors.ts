/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * viz 抛出的错误码。每个码对应一类立即报错的输入，不做静默修正：
 * - `XH_VIZ_INVALID_ARGUMENT`：参数本身不合法（非有限数、越界的比例、空的必填表）。
 * - `XH_VIZ_DUPLICATE_KEY`：要求唯一的键出现了两次（索引、类目定义域）。
 * - `XH_VIZ_LOG_DOMAIN`：对数比例尺的定义域含 0 或跨越正负。
 * - `XH_VIZ_BAR_BASELINE`：与柱系列同轴的值轴被限定成不含 0，截断的柱长会误导比较。
 * - `XH_VIZ_NEGATIVE_SHARE`：占比类布局（饼、百分比堆叠）出现负值。
 */
export type VizErrorCode
  = | 'XH_VIZ_INVALID_ARGUMENT'
    | 'XH_VIZ_DUPLICATE_KEY'
    | 'XH_VIZ_LOG_DOMAIN'
    | 'XH_VIZ_BAR_BASELINE'
    | 'XH_VIZ_NEGATIVE_SHARE'

/** viz 的唯一错误类型。`detail` 放定位问题所需的原始输入，由上层转成诊断。 */
export class VizError extends Error {
  readonly code: VizErrorCode
  readonly detail: Readonly<Record<string, unknown>>

  constructor(code: VizErrorCode, message: string, detail: Record<string, unknown> = {}) {
    super(message)
    this.name = 'VizError'
    this.code = code
    this.detail = Object.freeze({ ...detail })
  }
}

/** 判断一个值是不是 viz 抛出的错误；跨包实例（重复安装）按 name 与 code 认。 */
export function isVizError(value: unknown): value is VizError {
  if (value instanceof VizError)
    return true
  if (typeof value !== 'object' || value === null)
    return false
  const candidate = value as { name?: unknown, code?: unknown }
  return candidate.name === 'VizError' && typeof candidate.code === 'string' && candidate.code.startsWith('XH_VIZ_')
}

/** 参数不合法时统一走这里，保证报错形状一致。 */
export function invalidArgument(message: string, detail: Record<string, unknown> = {}): VizError {
  return new VizError('XH_VIZ_INVALID_ARGUMENT', message, detail)
}
