// per-document 注册表工厂：实例按 Document 隔离。

export interface PerDocumentRegistry<T> {
  /** 取该 document 的实例，不存在则用 factory 创建并缓存。 */
  get: (doc: Document) => T
}

/** 创建一个按 Document 缓存实例的注册表。 */
export function createPerDocumentRegistry<T>(factory: (doc: Document) => T): PerDocumentRegistry<T> {
  const map = new WeakMap<Document, T>()
  return {
    get(doc: Document): T {
      let inst = map.get(doc)
      if (!inst) {
        inst = factory(doc)
        map.set(doc, inst)
      }
      return inst
    },
  }
}
