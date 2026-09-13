/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 download trigger 相关实现。

import type { ComponentMeta } from '../spec/types'

// 只有一个 part，缺了它就没有可点的东西，下载无从发起。
export const downloadTriggerMeta: ComponentMeta = {
  component: 'download-trigger',
  requiredParts: ['root'],
}
