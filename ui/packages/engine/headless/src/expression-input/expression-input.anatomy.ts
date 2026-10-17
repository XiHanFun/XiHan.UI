/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 expression input 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 条目、高亮标记与问题行由组件按数据生成，其余部件由作者渲染。
export const expressionInputAnatomy = createAnatomy('expression-input', [
  'root',
  'label',
  'control',
  'input',
  'highlight',
  'highlight-segment',
  'issues',
  'issue',
  'positioner',
  'content',
  'item',
  'item-prefix',
  'item-text',
  'item-suffix',
  'item-description',
  'empty',
])
