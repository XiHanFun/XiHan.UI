/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { KeyboardTable } from '../spec/types'

const DISCLOSURE = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction'
const LISTBOX = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction'

export const citationKeyboard: KeyboardTable = {
  component: 'citation',
  source: `${DISCLOSURE} ${LISTBOX}`,
  rows: [
    { id: 'citation.kbd.trigger', keys: ['Space', 'Enter'], when: 'focus on inline citation, not disabled', does: '展开或收起该引文对应的来源预览' },
    { id: 'citation.kbd.next', keys: ['ArrowDown'], when: 'focus in source list', does: '焦点移到下一条可用来源，尽头按 loop 回绕' },
    { id: 'citation.kbd.prev', keys: ['ArrowUp'], when: 'focus in source list', does: '焦点移到上一条可用来源，尽头按 loop 回绕' },
    { id: 'citation.kbd.first', keys: ['Home'], when: 'focus in source list', does: '焦点移到第一条可用来源' },
    { id: 'citation.kbd.last', keys: ['End'], when: 'focus in source list', does: '焦点移到最后一条可用来源' },
    { id: 'citation.kbd.open', keys: ['Space', 'Enter'], when: 'focus on source list item, not disabled', does: '将该来源设为当前来源并展开预览' },
    { id: 'citation.kbd.hover-focus', keys: ['Tab'], when: 'previewMode 为 hover，焦点落到行内引用上', does: '当场打开该引用的悬停卡片；焦点移进卡片不收起，离开引用与卡片即收起' },
    { id: 'citation.kbd.step', keys: ['Space', 'Enter'], when: 'focus on previous / next source button in preview, 一处引用引了多个来源', does: '在这几个来源之间换到上一个 / 下一个，尽头按 loop 回绕' },
    { id: 'citation.kbd.escape', keys: ['Escape'], when: 'source preview open', does: '收起预览；若焦点位于预览内则归还到打开它的行内引用或来源条目；hover 档由消解层收起卡片' },
  ],
}
