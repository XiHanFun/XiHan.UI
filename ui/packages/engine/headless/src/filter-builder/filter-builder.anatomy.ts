/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 filter builder 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const filterBuilderAnatomy = createAnatomy('filter-builder', [
  'root',
  'label',
  // 一个组：根组与子组同一套部件，role=group，以逻辑为名
  'group',
  'group-header',
  // 「全部满足 / 任一满足」切换的外包
  'logic',
  // 子组才有
  'group-delete-trigger',
  'group-items',
  'group-footer',
  'add-condition-trigger',
  // 到 maxDepth 时收起
  'add-group-trigger',
  // 一个条件：role=group，可及名「条件 n」
  'condition',
  'condition-field',
  'condition-operator',
  // 「值 / 参数」切换的外包：有可用参数时才有
  'condition-source',
  'condition-operand',
  // 区间两端之间的文字
  'range-separator',
  'condition-ignore-case',
  // 行尾的扩展位，内容归宿主；没有 id 的条件不提供
  'condition-extra',
  'condition-delete-trigger',
  'condition-error',
  // 根组没有条件时的提示
  'empty',
  // 增删与挪动的播报
  'live-region',
])
