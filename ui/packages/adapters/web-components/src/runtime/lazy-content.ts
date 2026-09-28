/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 披露内容在 Light DOM 下的挂卸：挂不挂由 headless 判定，这里只把判定落到作者节点上。

/**
 * 一块披露内容（Collapsible / Accordion 的 content）的挂卸落点。
 *
 * 作者写在 content 里的一个 `<template>` 是可挂载的模板：该挂载时克隆一份放进 content，
 * 该卸载时连同克隆一起拿掉，再挂载时重新克隆——与 Vue / React 卸载后重新渲染同样丢掉内容里的状态，
 * 解析 HTML 时 `<template>` 里的节点也不会被实例化，lazyMount 因此真正省下首屏的构建开销。
 *
 * 没写模板时内容节点本来就在，只能暂存：该卸载时把它们移进一个游离片段，该挂载时原样放回。
 */
export class LazyContent {
  /** content 里作者写的模板；首次同步时认一次。 */
  #template: HTMLTemplateElement | null | undefined
  /** 从模板克隆出、此刻挂在 content 里的节点。 */
  #clones: Node[] = []
  /** 没写模板时卸下的作者节点。 */
  #stash: DocumentFragment | null = null

  sync(content: HTMLElement | null, mounted: boolean): void {
    if (!content)
      return
    if (this.#template === undefined)
      this.#template = [...content.children].find((el): el is HTMLTemplateElement => el instanceof HTMLTemplateElement) ?? null

    const template = this.#template
    if (template) {
      if (mounted && this.#clones.length === 0) {
        const fragment = template.content.cloneNode(true) as DocumentFragment
        this.#clones = [...fragment.childNodes]
        template.after(fragment)
      }
      else if (!mounted && this.#clones.length > 0) {
        for (const node of this.#clones)
          node.parentNode?.removeChild(node)
        this.#clones = []
      }
      return
    }

    if (!mounted && !this.#stash) {
      const stash = content.ownerDocument.createDocumentFragment()
      while (content.firstChild)
        stash.append(content.firstChild)
      this.#stash = stash
    }
    else if (mounted && this.#stash) {
      content.append(this.#stash)
      this.#stash = null
    }
  }
}
