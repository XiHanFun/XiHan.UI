/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 页面级窗口叠放序：非模态的浮动窗口（浮动面板）谁在上面。与层栈分开：不参与 Esc、外部点击与焦点域。
import type { Cleanup } from '../types'
import { createPageSharedRegistry } from './page-shared-registry'

export interface WindowStack {
  /** 该叠放序归属的 Document。 */
  readonly ownerDocument: Document
  /** 把这一扇窗放到最上面，还不在栈里就加进来；已经在最上面时不变、不通知。 */
  raise: (key: object) => void
  /** 移出栈；不在栈里时不做事。 */
  remove: (key: object) => void
  /** 从上往下数第几扇：最上面是 0，往下 1、2…，序号随增删收紧；不在栈里为 -1。 */
  depthOf: (key: object) => number
  /** 订阅叠放序变化。 */
  subscribe: (fn: () => void) => Cleanup
}

function createWindowStack(doc: Document): WindowStack {
  // 由下往上
  let keys: readonly object[] = []
  const subs = new Set<() => void>()

  const notify = (): void => {
    const errors: unknown[] = []
    // 固定这一轮的订阅者名单：回调里退订或新订阅不影响这一轮
    const participants = [...subs]
    for (const fn of participants) {
      try {
        fn()
      }
      catch (error) {
        errors.push(error)
      }
    }
    if (errors.length === 1)
      throw errors[0]
    if (errors.length > 1)
      throw new AggregateError(errors, 'window stack subscribers failed', { cause: errors[0] })
  }

  const stack: WindowStack = {
    ownerDocument: doc,
    raise(key) {
      if (keys.at(-1) === key)
        return
      keys = [...keys.filter(k => k !== key), key]
      notify()
    },
    remove(key) {
      if (!keys.includes(key))
        return
      keys = keys.filter(k => k !== key)
      notify()
    },
    depthOf(key) {
      const index = keys.indexOf(key)
      return index < 0 ? -1 : keys.length - 1 - index
    },
    subscribe(fn) {
      subs.add(fn)
      return () => {
        subs.delete(fn)
      }
    },
  }
  return Object.freeze(stack)
}

const registry = createPageSharedRegistry('window-stack@1', createWindowStack)

/** 取该 Document 的窗口叠放序；页面上装了几份 core 也共用同一份。 */
export function getWindowStack(doc: Document): WindowStack {
  return registry.get(doc)
}
