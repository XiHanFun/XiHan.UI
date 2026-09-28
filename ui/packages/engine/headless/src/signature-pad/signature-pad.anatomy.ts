/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 signature pad 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// root 是包住标题、画布、清空按钮与表单影子的外壳；control 是那块接指针的画布；
// path 是承载全部笔迹的那一条路径（每一笔是它的一条子路径），guide 是画布上的基准线；
// undo-trigger / redo-trigger 撤销与重做一步（一笔或一次清空）；status 是把"签没签"念给读屏的活区域。
export const signaturePadAnatomy = createAnatomy('signature-pad', [
  'root',
  'label',
  'control',
  'guide',
  'path',
  'undo-trigger',
  'redo-trigger',
  'clear-trigger',
  'status',
  'hidden-input',
])
