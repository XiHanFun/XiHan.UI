/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 页面级的按 Document 单例：实例挂在 Document 自己身上，键是 Symbol.for 取的全局符号。
// 页面上同时装了几份 core（打进不同的产物、或装了两个版本）时，几份取到的是同一个实例。
// 键里带协议版本号；实例的形状改得前后不兼容时换号，新旧两份就各用各的。
// 只在 core 内部用，不从 kernel 的桶导出。

import type { PerDocumentRegistry } from './per-document-registry'

/** Document 上的一个页面级存放位。 */
export interface PageSharedSlot<T> {
  /** 取已存放的值，没有时为 undefined。 */
  peek: (doc: Document) => T | undefined
  set: (doc: Document, value: T) => void
  delete: (doc: Document) => void
}

/** key 形如 `layer-registry@1`：名字加协议版本号。 */
export function createPageSharedSlot<T>(key: string): PageSharedSlot<T> {
  const symbol = Symbol.for(`@xihan-ui/core/${key}`)
  return {
    peek: doc => Reflect.get(doc, symbol) as T | undefined,
    set: (doc, value) => {
      Object.defineProperty(doc, symbol, { value, configurable: true, enumerable: false, writable: true })
    },
    delete: (doc) => {
      Reflect.deleteProperty(doc, symbol)
    },
  }
}

/** 页面级的按 Document 注册表：取不到时用 factory 建一个存到 Document 上。 */
export function createPageSharedRegistry<T>(key: string, factory: (doc: Document) => T): PerDocumentRegistry<T> {
  const slot = createPageSharedSlot<T>(key)
  return {
    get(doc: Document): T {
      let inst = slot.peek(doc)
      if (inst === undefined) {
        inst = factory(doc)
        slot.set(doc, inst)
      }
      return inst
    },
  }
}
