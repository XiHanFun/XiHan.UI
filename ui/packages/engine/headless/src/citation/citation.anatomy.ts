/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

export const citationAnatomy = createAnatomy('citation', [
  'root',
  'text',
  'trigger',
  'positioner',
  'preview',
  'preview-header',
  'preview-title',
  'preview-meta',
  'quote',
  'preview-link',
  'dismiss-trigger',
  'prev-trigger',
  'next-trigger',
  'preview-index',
  'list',
  'source',
  'source-link',
  'source-index',
  'source-title',
  'source-meta',
])

export const citationSourceQuery: ItemQuery = { scope: citationAnatomy.name, part: 'source-link' }
const parts = citationAnatomy.build()

export function citationSourceText(source: HTMLElement): string {
  return (source.querySelector<HTMLElement>(parts['source-title'].selector)?.textContent ?? source.textContent ?? '').trim()
}
