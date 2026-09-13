/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 mention 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const mentionAnatomy = createAnatomy('mention', [
  'root',
  'label',
  'input',
  'positioner',
  'content',
  'empty',
  'loading',
  'item',
  'item-text',
])

const parts = mentionAnatomy.build()

// 集合只认 item；归属判据是父链上最近的 content 是不是本容器。
export const mentionItemQuery: ItemQuery = { scope: mentionAnatomy.name, part: 'item' }

/**
 * 候选插回正文时用的文本：优先取 item-text 部件，缺省退回条目自身文本。
 * 直接取 textContent 会把作者摆在条目里的头像、副标题这类装饰节点的文字一并算进来。
 */
export function mentionItemText(el: HTMLElement): string {
  const text = el.querySelector<HTMLElement>(parts['item-text'].selector)
  return (text?.textContent ?? el.textContent ?? '').trim()
}
