/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toggle group 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 缺省则分组语义（radiogroup / group）与键盘收口都无处安放；无条目的一组开关无从操作。
export const toggleGroupMeta: ComponentMeta = {
  component: 'toggle-group',
  // item 不列：选项可以由 collection 异步给出，取回之前与级联清空之后都是空的
  requiredParts: ['root'],
}
