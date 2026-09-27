/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

export const gridListAnatomy = createAnatomy('grid-list', [
  'root',
  'label',
  'row',
  'row-selection-indicator',
  'row-content',
  'row-text',
  'row-description',
  'row-actions',
  'row-action',
  'empty',
  'loading',
])

const parts = gridListAnatomy.build()
export const gridListRowQuery: ItemQuery = { scope: gridListAnatomy.name, part: 'row' }

export function gridListRowText(row: HTMLElement): string {
  return (row.querySelector<HTMLElement>(parts['row-text'].selector)?.textContent ?? row.textContent ?? '').trim()
}
