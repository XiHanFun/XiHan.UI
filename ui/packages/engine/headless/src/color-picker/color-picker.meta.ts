/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import type { ComponentMeta } from '../spec/types'

// 两条颜色滑块、数值框、屏幕取色按钮、预设色板与最近使用色都可缺省。
// trigger 只有浮层形态才写（它是定位锚点与开合入口），常驻形态不写，因此不列为必备。
export const colorPickerMeta: ComponentMeta = {
  component: 'color-picker',
  requiredParts: ['content', 'saturation-area', 'area-thumb'],
}
