// per-document 注册表工厂。
// 避免模块级裸单例：微前端 / 多 window / iframe / SSR streaming 下的隔离由此保证。

export interface PerDocumentRegistry<T> {
  /** 取该 document 的实例，不存在则用 factory 创建并缓存。 */
  get: (doc: Document) => T
}

/** 创建一个按 Document 缓存实例的注册表。behavior 的 FocusGuards/ScrollLock 计数复用此模式。 */
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
