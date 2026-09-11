import type { Dict } from '@xihan-ui/core'
import type { Ref } from 'react'
import { isEventHandlerKey, mergeProps } from '@xihan-ui/core'

/** React 19 的 ref 是普通 prop，同名合并时两边都要收到节点。 */
type AnyRef = Ref<unknown> | undefined

function composeRefs(a: AnyRef, b: AnyRef): AnyRef {
  if (!a)
    return b
  if (!b)
    return a
  return (node: unknown) => {
    const cleanups = [assign(a, node), assign(b, node)]
    return () => {
      for (const fn of cleanups) fn?.()
    }
  }
}

/** 回调式 ref 的返回值在 React 19 里是清理函数，要原样带回去。 */
function assign(ref: AnyRef, node: unknown): (() => void) | undefined {
  if (typeof ref === 'function')
    return ref(node as never) as (() => void) | undefined
  if (ref && typeof ref === 'object')
    (ref as { current: unknown }).current = node
  return undefined
}

/**
 * connect 产出的 props 与作者写在组件上的 props 合成一份。
 *
 * class / style / 同名事件处理器的合并规则在 core 那一份里，三家适配器共用；
 * 这里只补 ref：React 19 把它当普通 prop，直接后盖前会让先接的那一方收不到节点。
 */
export function mergeReactProps<T extends Dict>(...sources: (Partial<T> | undefined)[]): T {
  const merged = mergeProps<T>(...sources) as Dict
  const refs = sources.map(s => (s as Dict | undefined)?.ref as AnyRef).filter(Boolean)
  if (refs.length > 1)
    merged.ref = refs.reduce((a, b) => composeRefs(a, b))
  return merged as T
}

/**
 * 把部件接线与作者写在部件上的 props 合成一份。
 *
 * 同名事件处理器作者的排在前面先跑、部件的后跑，作者因此能在部件动作之前拦下事件；
 * className、style 与其余普通值的取舍与直接展开 `{...rest}` 时一致，作者的说了算。
 */
export function mergePartProps<T extends Dict>(part: Partial<T>, author: Partial<T>): T {
  const merged = mergeReactProps<T>(part, author) as Dict
  for (const key of Object.keys(merged)) {
    if (!isEventHandlerKey(key))
      continue
    const theirs = (author as Dict | undefined)?.[key]
    const ours = (part as Dict | undefined)?.[key]
    if (typeof theirs === 'function' && typeof ours === 'function') {
      const a = theirs as (...args: unknown[]) => void
      const b = ours as (...args: unknown[]) => void
      merged[key] = (...args: unknown[]) => {
        a(...args)
        if ((args[0] as { defaultPrevented?: boolean } | null | undefined)?.defaultPrevented)
          return
        b(...args)
      }
    }
  }
  return merged as T
}
