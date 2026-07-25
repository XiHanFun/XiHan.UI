// 合并多份 props（§19.3.3 merge-props.ts）。语义：
// - class / className：空格拼接
// - style：对象浅合并
// - onXxx 事件处理器：顺序组合（前者先执行）
// - 其余：后者覆盖前者
import type { Dict } from './types'
import { isDict, isEventHandlerKey } from './compose'

type Handler = (...args: unknown[]) => void

function mergeClass(a: unknown, b: unknown): string {
  return [a, b].filter(Boolean).join(' ')
}

function mergeStyle(a: unknown, b: unknown): Dict {
  return { ...(isDict(a) ? a : {}), ...(isDict(b) ? b : {}) }
}

function chainHandlers(a: unknown, b: unknown): Handler {
  return (...args: unknown[]) => {
    if (typeof a === 'function')
      (a as Handler)(...args)
    if (typeof b === 'function')
      (b as Handler)(...args)
  }
}

/** 合并任意多份 props 对象，返回新对象。 */
export function mergeProps<T extends Dict>(...sources: (Partial<T> | undefined)[]): T {
  const result: Dict = {}
  for (const source of sources) {
    if (!source)
      continue
    for (const key of Object.keys(source)) {
      const prev = result[key]
      const next = source[key]
      if ((key === 'class' || key === 'className') && (prev || next))
        result[key] = mergeClass(prev, next)
      else if (key === 'style')
        result[key] = mergeStyle(prev, next)
      else if (isEventHandlerKey(key) && (typeof prev === 'function' || typeof next === 'function'))
        result[key] = chainHandlers(prev, next)
      else
        result[key] = next
    }
  }
  return result as T
}
