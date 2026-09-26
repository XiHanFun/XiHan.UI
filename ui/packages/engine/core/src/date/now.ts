/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 此刻：按时区读当前的日期与日期时间。

import { PlainDate, PlainDateTime } from './plain'
import { getLocalTimeZone } from './zone'

/** 某个时区里的今天；时区缺省为运行环境所在时区。 */
export function today(timeZone: string = getLocalTimeZone()): PlainDate {
  return PlainDate.fromDate(Date.now(), timeZone)
}

/** 某个时区里此刻的日期时间；时区缺省为运行环境所在时区。 */
export function now(timeZone: string = getLocalTimeZone()): PlainDateTime {
  return PlainDateTime.fromDate(Date.now(), timeZone)
}
