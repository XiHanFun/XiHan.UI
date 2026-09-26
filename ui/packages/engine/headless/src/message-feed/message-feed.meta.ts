/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 message feed 相关实现。

import type { ComponentMeta } from '../spec/types'

// root / viewport / list 三者必需；item 不进必需表——新建会话一条消息都没有，那是真实首帧。
// item-label、pending-indicator、scroll-to-end-trigger、live-region 同理可缺省。
export const messageFeedMeta: ComponentMeta = {
  component: 'message-feed',
  requiredParts: ['root', 'viewport', 'list'],
}
