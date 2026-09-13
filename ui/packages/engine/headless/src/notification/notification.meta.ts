/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 notification 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 圈住队列的作用域（它不占布局），group 是通知真正落脚的那一摞、也是地标，两者必需。
export const notificationMeta: ComponentMeta = {
  component: 'notification',
  requiredParts: ['root', 'group'],
}
