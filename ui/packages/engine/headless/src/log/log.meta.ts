/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 log 相关实现。

import type { ComponentMeta } from '../spec/types'

// 视口必需：它承载 role=log 与定高。content 只在不虚拟化时是粘底的观察对象，接了虚拟滚动时
// 行放在 Virtualizer 的内容层里、没有 content，所以不进必需表；line 有几行摆几个，一行没有也是一份合法的日志视图。
// segment、scroll-to-end-trigger 与 live-region 同样可缺省。
export const logMeta: ComponentMeta = {
  component: 'log',
  requiredParts: ['root', 'viewport'],
}
