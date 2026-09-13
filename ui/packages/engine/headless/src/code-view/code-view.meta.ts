/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 code view 相关实现。

import type { ComponentMeta } from '../spec/types'

// root、pre、code 三者必需；header 系按数据有无渲染，line 系按行铺开，fold-trigger 只在可折叠时出现。
export const codeViewMeta: ComponentMeta = {
  component: 'code-view',
  requiredParts: ['root', 'pre', 'code'],
}
