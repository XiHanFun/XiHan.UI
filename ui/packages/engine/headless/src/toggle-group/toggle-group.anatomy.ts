/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toggle group 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 收口键盘与 Tab 序列，item 是一个个可开关的按钮。
// hidden-input 是可选的表单出口；段间分隔线由适配器按属性生成。
// 指示器与文本由作者写在 item 里，不另立 part。
export const toggleGroupAnatomy = createAnatomy('toggle-group', ['root', 'item', 'hidden-input'])
