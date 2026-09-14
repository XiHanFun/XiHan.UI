/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time range picker 相关实现。

import type { ComponentMeta } from '../spec/types'

// control 是浮层定位锚点与两组段位的读屏归属，segment-group 起止各一组、segment 是可编辑的段，
// trigger 是浮层的指针入口，content 是消解层与焦点域的根节点，column-group 起止各一组，都必需。
// column / item 不列为必备（某一列被 min/max 裁空是正常态）；
// label / range-separator / clear-trigger / positioner / column-group-label / hidden-input 都可缺省。
export const timeRangePickerMeta: ComponentMeta = {
  component: 'time-range-picker',
  requiredParts: ['root', 'control', 'segment-group', 'segment', 'trigger', 'content', 'column-group'],
}
