/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { ComponentMeta } from '../spec/types'

// 一个条目都没有的单选组无从操作。label / thumb / item-icon / item-text / item-description /
// indicator / hidden-input 都可以不渲染：文字能直接落在条目里，图标、圆圈与滑块是装饰，
// 隐藏输入只在参与表单提交时才需要。
export const radioGroupMeta: ComponentMeta = {
  component: 'radio-group',
  requiredParts: ['item'],
}
