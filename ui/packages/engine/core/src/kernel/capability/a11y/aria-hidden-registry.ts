/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// aria-hidden 引用计数表：同一元素可被多方同时要求藏起，计数归零才写回原始值。
import { createPerDocumentRegistry } from '../../structure/per-document-registry'

interface AriaHiddenEntry {
  /** 第一次被接管前的 aria-hidden 属性值；没写过为 null。 */
  original: string | null
  /** 当前活着的藏起要求数。 */
  count: number
}

export interface AriaHiddenRegistry {
  /** 计数加一；0→1 时记下原始值并写 aria-hidden="true"。 */
  acquire: (el: HTMLElement) => void
  /** 计数减一；归零时写回原始值并从表中删除。 */
  release: (el: HTMLElement) => void
  /** 元素当前的藏起要求数，未被接管为 0。 */
  countOf: (el: HTMLElement) => number
}

export function createAriaHiddenRegistry(_doc: Document): AriaHiddenRegistry {
  const entries = new WeakMap<HTMLElement, AriaHiddenEntry>()

  return {
    acquire: (el) => {
      const entry = entries.get(el)
      if (entry) {
        entry.count += 1
        return
      }
      const original = el.getAttribute('aria-hidden')
      entries.set(el, { original, count: 1 })
      if (original !== 'true')
        el.setAttribute('aria-hidden', 'true')
    },
    release: (el) => {
      const entry = entries.get(el)
      if (!entry)
        return
      entry.count -= 1
      if (entry.count > 0)
        return
      if (entry.original === null)
        el.removeAttribute('aria-hidden')
      else
        el.setAttribute('aria-hidden', entry.original)
      entries.delete(el)
    },
    countOf: el => entries.get(el)?.count ?? 0,
  }
}

const registry = createPerDocumentRegistry(createAriaHiddenRegistry)

/** 取该 document 的共享 aria-hidden 引用计数表。 */
export function getAriaHiddenRegistry(doc: Document): AriaHiddenRegistry {
  return registry.get(doc)
}
