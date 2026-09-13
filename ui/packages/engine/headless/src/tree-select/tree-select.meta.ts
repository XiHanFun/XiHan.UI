/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tree select 相关实现。

import type { ComponentMeta } from '../spec/types'

// trigger、content 与 tree 必需：role=combobox 的两端、aria-controls 与键盘收口都靠它们。
// 空树、首次加载或仅有分支都不要求 item，不能用假叶子满足静态契约。
// label/positioner/indicator/clear-trigger 与分支五件套可缺省，hidden-input 不写即不参与表单。
export const treeSelectMeta: ComponentMeta = {
  component: 'tree-select',
  requiredParts: ['trigger', 'content', 'tree'],
}
