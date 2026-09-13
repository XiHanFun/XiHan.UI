/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 editable 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// control：preview、input 与三颗按钮的容器。preview 与 input 同时挂载，非当前形态的那个带 hidden；
// 预览态露出 edit-trigger，编辑态露出 submit/cancel-trigger。它不承担行为，只作排版落点。
export const editableAnatomy = createAnatomy('editable', [
  'root',
  'label',
  'control',
  'preview',
  'input',
  'edit-trigger',
  'submit-trigger',
  'cancel-trigger',
])
