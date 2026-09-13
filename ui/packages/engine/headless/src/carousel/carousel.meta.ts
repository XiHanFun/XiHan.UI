/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 carousel 相关实现。

import type { ComponentMeta } from '../spec/types'

// item、两端按钮、播放开关、指示点均可缺省；开了 autoplay 就该把播放开关渲出来。
export const carouselMeta: ComponentMeta = {
  component: 'carousel',
  requiredParts: ['root', 'viewport', 'list'],
}
