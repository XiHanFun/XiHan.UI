/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 作者内容插槽：零件生成自己的结构后，把作者写在它下面、带 slot="<名>" 的直接子节点搬进对应区域。
// 给了缺省区域时，没有 slot 属性的作者子节点搬进缺省区域。之后作者再加的同类子节点也照搬。

import { GEN_ATTR } from '@xihan-ui/web-components/authoring'

/**
 * 把 host 的直接子节点里 slot 属性与 regions 的键对上的搬进对应区域，没有 slot 属性、也不是生成节点的
 * 搬进 fallback（给了时）；返回停止观察的函数。
 */
export function adoptSlots(host: HTMLElement, regions: Readonly<Record<string, HTMLElement>>, fallback?: HTMLElement): () => void {
  const adopt = (): void => {
    for (const child of Array.from(host.children)) {
      const name = child.getAttribute('slot')
      if (name !== null && Object.hasOwn(regions, name))
        regions[name]!.append(child)
      else if (name === null && fallback && !child.hasAttribute(GEN_ATTR))
        fallback.append(child)
    }
  }
  adopt()
  if (typeof MutationObserver === 'undefined')
    return () => {}
  const observer = new MutationObserver(adopt)
  observer.observe(host, { childList: true })
  return () => observer.disconnect()
}
