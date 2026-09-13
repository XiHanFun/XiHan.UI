/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 select 相关实现。

import type { ComponentMeta } from '../spec/types'

// trigger、content、list 必需——list 承载 role=listbox 与滚动；加载中或空态允许暂时没有 item。
// footer 是可选的底部操作区。label / positioner / indicator 可缺省，
// hidden-select 由根部件自行装配，不需要作者渲染。
export const selectMeta: ComponentMeta = {
  component: 'select',
  requiredParts: ['trigger', 'content', 'list'],
}
