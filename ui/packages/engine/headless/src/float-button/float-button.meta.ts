/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 float button 相关实现。

import type { ComponentMeta } from '../spec/types'

// 三个都必备：root 是定位壳并承载悬停进出，trigger 是唯一可点、可聚焦的部件，
// list 是 aria-controls 指向的那个节点，缺了它触发器就指向了不存在的 id。
export const floatButtonMeta: ComponentMeta = {
  component: 'float-button',
  requiredParts: ['root', 'trigger', 'list'],
}
