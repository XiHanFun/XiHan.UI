/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 盯住一个部件里「读不读得出一句话」：文字与子节点增删，以及会改变它的属性变化。

/** 会改变节点能不能提供名字或描述的属性：命名四项与对读屏隐藏的两种标记。 */
const NAMING_CONTENT_ATTRS = ['aria-label', 'aria-labelledby', 'alt', 'title', 'aria-hidden', 'hidden']

/** 一个部件的内容观察：换节点时摘掉旧的、接上新的；同一个节点重复调用不重建。 */
export interface NamingContentWatch {
  watch: (el: HTMLElement | null) => void
  disconnect: () => void
}

/** 建一份观察：节点里的内容或这几项属性变化时回调。 */
export function createNamingContentWatch(onChange: () => void): NamingContentWatch {
  let current: { el: HTMLElement, observer: MutationObserver } | undefined
  const disconnect = (): void => {
    current?.observer.disconnect()
    current = undefined
  }
  return {
    watch(el) {
      if (current?.el === el)
        return
      disconnect()
      if (!el || typeof MutationObserver === 'undefined')
        return
      const observer = new MutationObserver(onChange)
      observer.observe(el, { characterData: true, childList: true, subtree: true, attributes: true, attributeFilter: NAMING_CONTENT_ATTRS })
      current = { el, observer }
    },
    disconnect,
  }
}
