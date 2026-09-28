/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/** 角色节点标记属性。 */
export const PART_ATTR = 'data-xh-part'
/** 跨嵌套 xh-* 宿主共享 Light DOM 时，显式声明这棵角色子树归哪一个组件管理。 */
export const PART_OWNER_ATTR = 'data-xh-part-owner'

/** 元素自身是角色节点，或其子树里有角色节点。 */
export function containsPart(el: Element): boolean {
  return el.hasAttribute(PART_ATTR) || el.querySelector(`[${PART_ATTR}]`) != null
}

// 从宿主及其显式外部根向下遍历角色节点，跳过嵌套 xh-* 子树。
export function discoverParts(
  host: HTMLElement,
  externalRoots: readonly HTMLElement[] = [],
): Map<string, HTMLElement[]> {
  const out = new Map<string, HTMLElement[]>()
  const visited = new Set<Element>()
  const hostOwner = host.tagName.toLowerCase().replace(/^xh-/, '')

  const collect = (el: HTMLElement): void => {
    if (visited.has(el))
      return
    visited.add(el)
    const declaredOwner = el.getAttribute(PART_OWNER_ATTR)
    if (declaredOwner && declaredOwner !== hostOwner)
      return
    const part = el.dataset.xhPart
    if (!part)
      return
    const arr = out.get(part)
    if (arr)
      arr.push(el)
    else
      out.set(part, [el])
  }

  /**
   * 嵌套的 xh-* 子树归内层元素自己管，只有里面显式声明归本宿主（data-xh-part-owner）的角色子树由本宿主认领，
   * 且只认离它最近的那一台同类宿主：再往里嵌的另一台同类元素归它自己。
   * 典型是流式正文里挂进来的行内引用角标，它们在 xh-markdown-stream 里，却是外层 xh-citation 的 trigger。
   */
  function claimNested(nested: Element): void {
    for (const el of Array.from(nested.querySelectorAll<HTMLElement>(`[${PART_OWNER_ATTR}="${hostOwner}"]`))) {
      if (el.parentElement?.closest(host.localName) !== host)
        continue
      collect(el)
      walk(el)
    }
  }

  function walk(node: Element): void {
    for (const child of Array.from(node.children)) {
      if (child.tagName.toLowerCase().startsWith('xh-')) {
        claimNested(child)
        continue
      }
      const el = child as HTMLElement
      const declaredOwner = el.getAttribute(PART_OWNER_ATTR)
      // 显式归给另一台宿主的整棵子树由它经 externalPartRoots 接管，本宿主不得写它。
      if (declaredOwner && declaredOwner !== hostOwner)
        continue
      collect(el)
      walk(el)
    }
  }

  walk(host)
  for (const root of externalRoots) {
    collect(root)
    walk(root)
  }
  return out
}
