/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import type { ComponentMeta } from '../spec/types'

// 两条通道滑杆、数值框、屏幕取色按钮、预设色板都可缺省。
export const colorPickerMeta: ComponentMeta = {
  component: 'color-picker',
  requiredParts: ['trigger', 'content', 'saturation-area', 'area-thumb'],
}
