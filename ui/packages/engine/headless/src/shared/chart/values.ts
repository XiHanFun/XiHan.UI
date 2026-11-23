/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数据行里的取值：各图表的 model 读数值字段时共用。

/**
 * 数据行里的一个值读成数：数本身，或能整个读成数的字符串（后端常把数值序列化成串）。
 * 空串、非有限值与其余类型都算缺失，返回 null——缺失的点不画，不当成 0。
 */
export function chartNumber(value: unknown): number | null {
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}
