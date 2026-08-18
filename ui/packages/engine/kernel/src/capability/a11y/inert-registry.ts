// inert 引用计数表：同一元素可被多方同时要求 inert，计数归零才写回原始值。
import { createPerDocumentRegistry } from '../../structure/per-document-registry'

interface InertEntry {
  /** 第一次被接管前的 inert 值。 */
  original: boolean
  /** 当前活着的 inert 要求数。 */
  count: number
}

export interface InertRegistry {
  /** 计数加一；0→1 时记下原始值并置 inert。 */
  acquire: (el: HTMLElement) => void
  /** 计数减一；归零时写回原始值并从表中删除。 */
  release: (el: HTMLElement) => void
  /** 元素当前的 inert 要求数，未被接管为 0。 */
  countOf: (el: HTMLElement) => number
}

export function createInertRegistry(_doc: Document): InertRegistry {
  const entries = new WeakMap<HTMLElement, InertEntry>()

  return {
    acquire: (el) => {
      const entry = entries.get(el)
      if (entry) {
        entry.count += 1
        return
      }
      entries.set(el, { original: el.inert === true, count: 1 })
      el.inert = true
    },
    release: (el) => {
      const entry = entries.get(el)
      if (!entry)
        return
      entry.count -= 1
      if (entry.count > 0)
        return
      el.inert = entry.original
      entries.delete(el)
    },
    countOf: el => entries.get(el)?.count ?? 0,
  }
}

const registry = createPerDocumentRegistry(createInertRegistry)

/** 取该 document 的共享 inert 引用计数表。 */
export function getInertRegistry(doc: Document): InertRegistry {
  return registry.get(doc)
}
