/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date field 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// segment 是多实例 part：一段一个节点，文档序即段序，段序随 locale 变。
// control 单独一层：它是 role=group 的分段容器，与 root 合成一个节点会把标题也圈进组里。
// segment-group 把全部段位与作者写的分隔符兜成一块，占满盒里剩下的宽度，尾部按钮靠在末端。
export const dateFieldAnatomy = createAnatomy('date-field', [
  'root',
  'label',
  'control',
  'segment-group',
  'segment',
  'clear-trigger',
  'hidden-input',
])
