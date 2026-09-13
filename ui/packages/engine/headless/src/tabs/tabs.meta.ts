/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tabs 相关实现。

import type { ComponentMeta } from '../spec/types'

// list 缺省则 tablist 语义与方向键导航都无处安放；trigger/content 是标签页的最小可用对。
export const tabsMeta: ComponentMeta = {
  component: 'tabs',
  requiredParts: ['list', 'trigger', 'content'],
}
