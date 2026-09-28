/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cascader 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// tag-list 是触发器里收着已选路径标签的那一行；行里每一枚标签（含折起来的那些合成的 +N）
// 都是库里的 tag 组件（data-scope="tag"），由连接层套 tag 的连接层产出，本组件不另立部件。
export const cascaderAnatomy = createAnatomy('cascader', [
  'root',
  'hidden-input',
  'label',
  'control',
  'trigger',
  'value-text',
  'tag-list',
  'indicator',
  'clear-trigger',
  'positioner',
  'content',
  'input',
  'search-list',
  'search-item',
  'column',
  'group',
  'group-label',
  'item',
  'item-text',
  'item-description',
  'item-suffix',
  'item-indicator',
  'empty',
  'loading',
  'branch-loading',
  'branch-error',
  'branch-retry-trigger',
  'footer',
])

/**
 * 集合只认 item：item-text / item-indicator 同样带 data-scope，但不入导航，
 * 方向键不会停在它们身上。
 *
 * 查询容器一律传 content 而不是某一列：条目要跨列按值取（右方向键进的是**下一列**的条目），
 * 逐列查等于把这件事拆成两步。queryItems 的归属判据是「父链上最近的 content 是不是本容器」，
 * 中间隔着 column 不影响，而嵌套的另一个级联会被切开，各认各的条目。
 */
export const cascaderItemQuery: ItemQuery = { scope: cascaderAnatomy.name, part: 'item' }

/** 标签行：触发器里收着已选路径标签的那一行。 */
export const CASCADER_TAG_LIST_SELECTOR = cascaderAnatomy.build()['tag-list'].selector
