/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import type { ComponentMeta } from '../spec/types'

// 标签、选中标记与表单影子都可缺省；根、格子与格里的色块缺一不可。
export const colorSwatchPickerMeta: ComponentMeta = {
  component: 'color-swatch-picker',
  requiredParts: ['root', 'item', 'swatch'],
}
