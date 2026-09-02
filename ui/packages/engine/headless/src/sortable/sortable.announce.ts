// 拖动过程的读屏播报。拆出来是因为它是纯文本拼装，可以脱开状态机单独验。
import type { SortableTranslations } from './sortable.types'

export type SortableAnnounceKind = 'picked' | 'moved' | 'dropped' | 'canceled'

export interface SortableAnnounceInput {
  id: string
  /** 人类读法的第几位，从 1 数起。 */
  position: number
  total: number
  translations?: Partial<SortableTranslations>
}

/**
 * 拼一句播报。
 *
 * 拾起那句要把「接下来能按什么」一并说清：键盘拖动没有任何视觉提示，
 * 用户听不到操作说明就只能猜，而这一步之后所有按键都被拦截，猜错就卡在那儿。
 */
export function sortableAnnouncement(kind: SortableAnnounceKind, input: SortableAnnounceInput): string {
  const { id, position, total, translations: t } = input
  // 名字走 translations.item：状态机在调进来之前把项上写着的字装进了这一条。
  // 退到 id 是最后一手，只发生在项还没进 DOM、连一个字都取不到的时候
  const name = t?.item?.(id, position, total) ?? id

  switch (kind) {
    case 'picked':
      return t?.picked?.(name, position, total)
        ?? `Picked up ${name}. Position ${position} of ${total}. Use arrow keys to move, space to drop, escape to cancel.`
    case 'moved':
      return t?.moved?.(name, position, total) ?? `Moved to position ${position} of ${total}.`
    case 'dropped':
      return t?.dropped?.(name, position) ?? `${name} dropped at position ${position}.`
    case 'canceled':
      return t?.canceled?.(name, position) ?? `Sorting canceled. ${name} returned to position ${position}.`
  }
}
