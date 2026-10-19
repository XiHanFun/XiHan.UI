/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 包内共用：ISO 日期与日期时间文本的严格判定。

import { PlainDate, PlainDateTime } from '@xihan-ui/core/date'

/** date、datetime 的写法对不对：按 core/date 的 PlainDate / PlainDateTime 严格解析，datetime 还要带时刻。 */
export function isIsoText(type: 'date' | 'datetime', text: string): boolean {
  if (type === 'datetime' && !/[T ]/i.test(text))
    return false
  try {
    if (type === 'date')
      PlainDate.from(text)
    else
      PlainDateTime.from(text)
    return true
  }
  catch {
    return false
  }
}
