/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 拖拽重排的读屏播报：按落点与文案拼一句话，缺的句子取英文语言包。
import type { DragAnnounceInput, DragAnnounceKind } from './drag'
import { DRAG_EN_US } from '../locale/en-US'

/**
 * 拼一句播报。
 *
 * `rejected` 这一档是给 indicator-only 补的：落点不合法时界面上只是「那条线没出现」，
 * 看得见的人懂了，听的人只会听到一片安静。
 */
export function dragAnnouncement(kind: DragAnnounceKind, input: DragAnnounceInput): string {
  const { value, position, total, into, translations: t } = input
  const name = t?.item?.(value) ?? value

  // 给了 into 就报带容器的那一套。rejected 那一档没有落点可言，恒走原句
  if (into !== undefined && kind !== 'rejected') {
    const container = into ?? t?.rootLevel ?? DRAG_EN_US.rootLevel
    switch (kind) {
      case 'moved':
        return t?.movedInto?.(name, container, position, total)
          ?? t?.moved?.(name, position, total)
          ?? DRAG_EN_US.movedInto(name, container, position, total)
      case 'dropped':
        return t?.droppedInto?.(name, container, position)
          ?? t?.dropped?.(name, position)
          ?? DRAG_EN_US.droppedInto(name, container, position)
      case 'canceled':
        return t?.canceledInto?.(name, container, position)
          ?? t?.canceled?.(name, position)
          ?? DRAG_EN_US.canceledInto(name, container, position)
    }
  }

  switch (kind) {
    case 'moved':
      return t?.moved?.(name, position, total) ?? DRAG_EN_US.moved(name, position, total)
    case 'dropped':
      return t?.dropped?.(name, position) ?? DRAG_EN_US.dropped(name, position)
    case 'canceled':
      return t?.canceled?.(name, position) ?? DRAG_EN_US.canceled(name, position)
    case 'rejected':
      return t?.rejected?.(name) ?? DRAG_EN_US.rejected(name)
  }
}
