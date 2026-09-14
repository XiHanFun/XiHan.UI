/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color slider 相关实现。

import type { ComponentMeta } from '../spec/types'

// 标签、值气泡与表单影子都可缺省；轨道与拇指缺一不可。
export const colorSliderMeta: ComponentMeta = {
  component: 'color-slider',
  requiredParts: ['control', 'track', 'thumb'],
}
