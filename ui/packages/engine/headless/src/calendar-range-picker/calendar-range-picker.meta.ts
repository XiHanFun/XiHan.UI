/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar range picker 相关实现。

import type { ComponentMeta } from '../spec/types'

// grid 承载 role=grid、可及名字与键盘入口；cell 是表格语义，cell-trigger 是可点可聚焦的落点。
// header/prev-trigger/next-trigger/heading 与 grid-head/week-day 可缺省。
export const calendarRangePickerMeta: ComponentMeta = {
  component: 'calendar-range-picker',
  requiredParts: ['grid', 'cell', 'cell-trigger'],
}
