/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 受控 / 非受控桥：各运行时的 cell 共用这一份读写规则，只各自交出「值存在哪儿」与「变了通知谁」。

import type { Bindable, CellParams } from '../types'

/** 非受控值的容器。 */
export interface CellStore<V> {
  get: () => V
  set: (value: V) => void
}

export interface CellHost<V> {
  /** 建非受控值的容器；缺省存在闭包变量里。容器自己会按引用触发响应（如 Vue 的 shallowRef）时，changed 就不必再通知。 */
  store?: (initial: V) => CellStore<V>
  /** 写入了新引用或报告了变化之后调：让宿主排一次更新。 */
  changed?: () => void
  /** 要调宿主的 onChange 之前调；没传 onChange 的 cell 不调。 */
  reporting?: () => void
  /** Bindable.notify：不改值，强制宿主刷新。 */
  notify: () => void
}

function plainStore<V>(initial: V): CellStore<V> {
  let value = initial
  return {
    get: () => value,
    set: (next) => {
      value = next
    },
  }
}

/**
 * 按 CellParams 建一个 Bindable。
 * - 受控判定每次现读：宿主中途开始传 value 就立刻按受控走。
 * - 响应跟引用、报告跟 isEqual：非受控时换了引用就落内部值并通知宿主，盯引用的 track 据此能看到
 *   「内容一样的另一份」（清空时 [] 换成另一份 []，日历区间靠它作废挑到一半的起点）；
 *   按 isEqual 真变了才报 onChange。次序是先落值、再报告、最后通知。
 * - version 按值拉取比对，不数 set 调用次数：受控值不经过 set。
 */
export function createCell<V>(params: () => CellParams<V>, host: CellHost<V>): Bindable<V> {
  const p0 = params()
  const eq = p0.isEqual ?? Object.is
  const initial = (p0.defaultValue ?? p0.value) as V
  const store = (host.store ?? plainStore)(initial)
  let lastSeen = initial
  let version = 0

  const isControlled = (): boolean => params().value !== undefined
  const read = (): V => (isControlled() ? (params().value as V) : store.get())

  const set = (next: V | ((prev: V) => V)): void => {
    const prev = read()
    const value = typeof next === 'function' ? (next as (p: V) => V)(prev) : next
    const wrote = !isControlled() && !Object.is(store.get(), value)
    if (wrote)
      store.set(value)
    const differs = !eq(value, prev)
    const onChange = differs ? params().onChange : undefined
    if (onChange !== undefined) {
      host.reporting?.()
      onChange(value, prev)
    }
    if (wrote || differs)
      host.changed?.()
  }

  return {
    initial,
    get: read,
    set,
    // 落点按当下 props 重算，不用挂载时冻结的 initial：宿主换了 defaultValue
    // （比如切去编辑另一条记录）就该回到新的那一份
    reset() {
      const next = params().defaultValue
      if (next === undefined)
        return undefined
      set(next)
      return next
    },
    notify: host.notify,
    version() {
      const cur = read()
      if (!eq(cur, lastSeen)) {
        lastSeen = cur
        version += 1
      }
      return version
    },
  }
}
