/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 单元格级导航时替表体格内的可聚焦控件管 tabindex：整张表只留锚点那一个 Tab 位。

import type { FocusableElement } from '@xihan-ui/core'
import { getTabbables } from '@xihan-ui/core'
import { TABLE_BODY_PART_SELECTOR, TABLE_BODY_SELECTOR, TABLE_CELL_SELECTOR, TABLE_ROW_SELECTOR } from './table.anatomy'

export interface CellWidgetLock {
  /** 放开这一格的控件（进编辑），别的格子照锁；返回这一格此刻可 Tab 的控件，按 DOM 序，不含格子自己。 */
  release: (cell: HTMLElement) => FocusableElement[]
  /** 收回放开的那一格。 */
  relock: () => void
  /** 按当前开关与 DOM 重新管一遍。 */
  sync: () => void
  /** 还原全部控件的 tabindex，停止观察。 */
  dispose: () => void
}

/**
 * 表体数据行格子里原本能 Tab 到的控件（原生可聚焦，或 tabindex ≥ 0）平时写 tabindex="-1"，记下原值；
 * 焦点落进哪一格的控件里就放开那一格（Enter / F2、指针点进去都走这一条），焦点离开那一格就收回。
 * 详情行、表头、表尾与嵌套表格里的控件不管。后来插入的控件、别人改写的 tabindex 由 MutationObserver 接住：
 * 改写成什么就记成什么，锁着的格子里再写回 -1。enabled 为 false 时全部还原。
 */
export function createCellWidgetLock(root: HTMLElement, enabled: () => boolean): CellWidgetLock {
  const win = root.ownerDocument.defaultView
  /** 归锁管的控件与它原来的 tabindex 属性（没写为 null）。 */
  const managed = new Map<HTMLElement, string | null>()
  /** 每个控件上一次由锁写下的值，观察到的改写与它相同就是锁自己写的。 */
  const written = new WeakMap<HTMLElement, string | null>()
  let open: HTMLElement | null = null
  let disposed = false

  const body = (): HTMLElement | null => root.querySelector<HTMLElement>(TABLE_BODY_SELECTOR)

  /** 这个格子是不是这张表表体里数据行的格子。 */
  const ownCell = (cell: Element | null, own: HTMLElement | null): cell is HTMLElement =>
    cell != null && own != null && cell.closest(TABLE_BODY_PART_SELECTOR) === own && cell.closest(TABLE_ROW_SELECTOR)?.closest(TABLE_BODY_PART_SELECTOR) === own

  const cellOf = (el: Element, own: HTMLElement | null): HTMLElement | null => {
    const cell = el.closest(TABLE_CELL_SELECTOR)
    return ownCell(cell, own) ? cell : null
  }

  const write = (el: HTMLElement, value: string | null): void => {
    written.set(el, value)
    if (el.getAttribute('tabindex') === value)
      return
    if (value == null)
      el.removeAttribute('tabindex')
    else
      el.setAttribute('tabindex', value)
  }

  const restoreAll = (): void => {
    for (const [el, original] of managed)
      write(el, original)
    managed.clear()
    open = null
  }

  const apply = (): void => {
    if (disposed)
      return
    if (!enabled()) {
      restoreAll()
      return
    }
    const own = body()
    for (const el of [...managed.keys()]) {
      if (!el.isConnected || cellOf(el, own) == null) {
        write(el, managed.get(el) ?? null)
        managed.delete(el)
        continue
      }
      // 不是锁写下的值就是别人改写的：改成什么就记成什么
      const current = el.getAttribute('tabindex')
      if (current !== written.get(el))
        managed.set(el, current)
    }
    if (open && !ownCell(open, own))
      open = null
    if (own) {
      for (const cell of own.querySelectorAll<HTMLElement>(TABLE_CELL_SELECTOR)) {
        if (!ownCell(cell, own))
          continue
        for (const el of cell.querySelectorAll<HTMLElement>('*')) {
          if (!managed.has(el) && el.tabIndex >= 0 && cellOf(el, own) === cell)
            managed.set(el, el.getAttribute('tabindex'))
        }
      }
    }
    for (const [el, original] of managed)
      write(el, open != null && open.contains(el) ? original : '-1')
  }

  // 锁自己的改写也会进记录：同步完把这一轮的记录取走，免得再触发一次
  const observer = win && typeof win.MutationObserver === 'function'
    ? new win.MutationObserver(() => {
        apply()
        observer?.takeRecords()
      })
    : null

  const sync = (): void => {
    apply()
    observer?.takeRecords()
  }

  const release = (cell: HTMLElement): FocusableElement[] => {
    if (open !== cell) {
      open = ownCell(cell, body()) ? cell : null
      sync()
    }
    return getTabbables(cell).filter(el => el !== cell)
  }

  const relock = (): void => {
    if (open == null)
      return
    open = null
    sync()
  }

  // 焦点落进格内控件就放开那一格，落在别处（格子自己、行、表格之外）就收回
  const onFocusIn = (event: FocusEvent): void => {
    if (!enabled())
      return
    const target = event.target as Element | null
    const cell = target ? cellOf(target, body()) : null
    if (cell && target !== cell)
      release(cell)
    else
      relock()
  }
  const onFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null
    if (open && !(next && open.contains(next)))
      relock()
  }

  root.addEventListener('focusin', onFocusIn)
  root.addEventListener('focusout', onFocusOut)
  observer?.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['tabindex'] })
  sync()

  return {
    release,
    relock,
    sync,
    dispose: () => {
      if (disposed)
        return
      disposed = true
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      observer?.disconnect()
      restoreAll()
    },
  }
}
