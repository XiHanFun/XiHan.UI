/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 拖动过程的读屏播报。拆出来是因为它是纯文本拼装，可以脱开状态机单独验。
import type { SortableTranslations } from './sortable.types'
import { SORTABLE_EN_US } from '../locale/en-US'

export type SortableAnnounceKind = 'picked' | 'moved' | 'dropped' | 'canceled' | 'movedToList' | 'droppedInList'

export interface SortableAnnounceInput {
  id: string
  /** 人类读法的第几位，从 1 数起。 */
  position: number
  total: number
  /** 挪进或落进同组另一个列表时才有：那个列表的名字、在组里排第几（从 1 数起）与组里共几个列表。 */
  list?: { name: string, position: number, total: number }
  translations?: Partial<SortableTranslations>
}

/**
 * 拼一句播报。
 *
 * 拾起那句要把「接下来能按什么」一并说清：键盘拖动没有任何视觉提示，
 * 用户听不到操作说明就只能猜，而这一步之后所有按键都被拦截，猜错就卡在那儿。
 * 挪进另一个列表的那句先说列表、再说位次：换了列表之后「第几位」要对着新列表听才有意义。
 */
export function sortableAnnouncement(kind: SortableAnnounceKind, input: SortableAnnounceInput): string {
  const { id, position, total, list, translations: t } = input
  // 名字走 translations.item：状态机在调进来之前把项上写着的字装进了这一条。
  // 退到 id 是最后一手，只发生在项还没进 DOM、连一个字都取不到的时候
  const name = t?.item?.(id, position, total) ?? id
  const listName = list?.name ?? ''
  const listPosition = list?.position ?? 1
  const listTotal = list?.total ?? 1

  switch (kind) {
    case 'picked':
      return (t?.picked ?? SORTABLE_EN_US.picked)(name, position, total)
    case 'moved':
      return (t?.moved ?? SORTABLE_EN_US.moved)(name, position, total)
    case 'dropped':
      return (t?.dropped ?? SORTABLE_EN_US.dropped)(name, position)
    case 'canceled':
      return (t?.canceled ?? SORTABLE_EN_US.canceled)(name, position)
    case 'movedToList':
      return (t?.movedToList ?? SORTABLE_EN_US.movedToList)(listName, listPosition, listTotal, position, total)
    case 'droppedInList':
      return (t?.droppedInList ?? SORTABLE_EN_US.droppedInList)(name, listName, listPosition, position)
  }
}
