/** 角色节点标记属性。 */
export const PART_ATTR = 'data-xh-part'

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

  const collect = (el: HTMLElement): void => {
    if (visited.has(el))
      return
    visited.add(el)
    const part = el.dataset.xhPart
    if (!part)
      return
    const arr = out.get(part)
    if (arr)
      arr.push(el)
    else
      out.set(part, [el])
  }

  function walk(node: Element): void {
    for (const child of Array.from(node.children)) {
      if (child.tagName.toLowerCase().startsWith('xh-'))
        continue
      const el = child as HTMLElement
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
