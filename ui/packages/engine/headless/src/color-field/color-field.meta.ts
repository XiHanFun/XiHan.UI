/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { ComponentMeta } from '../spec/types'

// 标签、色块、清空按钮与表单影子都可缺省；根与输入框缺一不可。
export const colorFieldMeta: ComponentMeta = {
  component: 'color-field',
  requiredParts: ['root', 'input'],
}
