/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间列按单位的步进写在 attribute 上的形态：一段 JSON 对象（time-step='{"minute":15}'）。

import type { TimeStep } from '@xihan-ui/headless'

const UNITS = ['hour', 'minute', 'second'] as const

/**
 * 把 attribute 读成步进对象：只认 hour / minute / second 三个数字键，其余键不读；
 * 写坏的 JSON、不是对象的写法等同于没写。每个单位的取值校验交给连接层的 resolveTimeStep。
 */
export const TIME_STEP_CONVERTER = {
  fromAttribute: (v: string | null): TimeStep | undefined => {
    if (v == null || v.trim() === '')
      return undefined
    let parsed: unknown
    try {
      parsed = JSON.parse(v)
    }
    catch {
      return undefined
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
      return undefined
    const out: TimeStep = {}
    for (const unit of UNITS) {
      const raw = (parsed as Record<string, unknown>)[unit]
      if (typeof raw === 'number')
        out[unit] = raw
    }
    return out
  },
}
