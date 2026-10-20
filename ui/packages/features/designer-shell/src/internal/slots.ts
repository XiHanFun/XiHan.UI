/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 作者内容插槽：零件生成自己的结构后，把作者写在它下面、带 slot="<名>" 的直接子节点搬进对应区域。
// 给了缺省区域时，没有 slot 属性的作者子节点搬进缺省区域。之后作者再加的同类子节点也照搬。
// 给了停放处时，此刻没有对应区域的作者子节点收进停放处藏着，之后有了对应区域再从停放处领走。
// 宿主经 forwardFrameSlots 转来的子节点在同一区域里排在零件宿主自己放的前面。

import { GEN_ATTR } from '@xihan-ui/web-components/authoring'

/** 宿主经 forwardFrameSlots 转来的节点。 */
const forwarded = new WeakSet<Element>()

/** 记下一个从宿主转来的节点：领进区域时排在没转过的节点前面。 */
export function markForwarded(element: Element): void {
  forwarded.add(element)
}

/** 搬进区域：转来的节点排在区域里第一个没转过的节点前面，其余排到末尾。 */
function place(region: HTMLElement, child: Element): void {
  const own = forwarded.has(child) ? Array.from(region.children).find(node => !forwarded.has(node)) : undefined
  if (own !== undefined)
    region.insertBefore(child, own)
  else
    region.append(child)
}

/**
 * 把 host 的直接子节点里 slot 属性与 regions 的键对上的搬进对应区域，没有 slot 属性、也不是生成节点的
 * 搬进 fallback（给了时）；给了 park 时，其余作者子节点收进 park，park 里的对上了再领走。返回停止观察的函数。
 */
export function adoptSlots(host: HTMLElement, regions: Readonly<Record<string, HTMLElement>>, fallback?: HTMLElement, park?: HTMLElement): () => void {
  const adopt = (): void => {
    for (const child of [...Array.from(host.children), ...Array.from(park?.children ?? [])]) {
      const name = child.getAttribute('slot')
      if (name !== null && Object.hasOwn(regions, name))
        place(regions[name]!, child)
      else if (name === null && child.hasAttribute(GEN_ATTR))
        continue
      else if (name === null && fallback)
        fallback.append(child)
      else if (park && child.parentElement !== park)
        park.append(child)
    }
  }
  adopt()
  if (typeof MutationObserver === 'undefined')
    return () => {}
  const observer = new MutationObserver(adopt)
  observer.observe(host, { childList: true })
  return () => observer.disconnect()
}
