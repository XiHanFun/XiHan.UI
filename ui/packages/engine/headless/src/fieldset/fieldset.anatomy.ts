/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 fieldset 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 是原生 <fieldset>、legend 是原生 <legend>；说明与错误文案各占一个部件，
// 由 connect 派生 id 后接进 root 的描述链。
// field-group 把并排的几个字段圈成一段，actions 是组末尾那一行按钮，两者都只排版。
export const fieldsetAnatomy = createAnatomy('fieldset', [
  'root',
  'legend',
  'description',
  'field-group',
  'actions',
  'error-text',
])
