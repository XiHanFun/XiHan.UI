// 引用、事件处理器、函数的组合工具。
// 注意：这些是纯计算、无 DOM，可被 headless connect 与适配器共用。
import type { Dict } from './types'
import { isFunction } from './guards'

export type PossibleRef<T> = ((el: T | null) => void) | { value: T | null } | null | undefined

/** 把一个元素同时写入多个 ref（回调 ref 或 { value } 容器）。 */
export function composeRefs<T>(...refs: PossibleRef<T>[]): (el: T | null) => void {
  return (el: T | null) => {
    for (const ref of refs) {
      if (isFunction(ref))
        ref(el)
      else if (ref != null)
        ref.value = el
    }
  }
}

export interface ComposeEventHandlerOptions {
  /** 若 theirs 调用了 preventDefault，则跳过 ours。默认 false。 */
  checkForDefaultPrevented?: boolean
}

/**
 * 组合两个事件处理器：先调用消费者的 theirs，再调用组件内部的 ours。
 * checkForDefaultPrevented=true 时，theirs preventDefault 后不再执行 ours。
 */
export function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
  { checkForDefaultPrevented = false }: ComposeEventHandlerOptions = {},
): (event: E) => void {
  return (event: E) => {
    theirs?.(event)
    if (checkForDefaultPrevented && event.defaultPrevented)
      return
    ours(event)
  }
}

/** 顺序调用一组函数（忽略 null/undefined）。 */
export function callAll<T extends unknown[]>(...fns: (((...args: T) => void) | undefined)[]) {
  return (...args: T) => {
    for (const fn of fns) fn?.(...args)
  }
}

/** 判断某个 key 是否是事件处理器命名（onXxx）。 */
export function isEventHandlerKey(key: string): boolean {
  return /^on[A-Z]/.test(key)
}

/** 判断某个值是否是 Dict（用于 style 合并）。 */
export function isDict(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
