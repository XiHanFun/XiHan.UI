/** 角色节点标记属性。 */
export const PART_ATTR = 'data-xh-part'

/** 元素自身是角色节点，或其子树里有角色节点。 */
export function containsPart(el: Element): boolean {
  return el.hasAttribute(PART_ATTR) || el.querySelector(`[${PART_ATTR}]`) != null
}

// 从宿主向下遍历收集带 data-xh-part 的节点，跳过嵌套 xh-* 子树。
export function discoverParts(host: HTMLElement): Map<string, HTMLElement[]> {
  const out = new Map<string, HTMLElement[]>()

  function walk(node: Element): void {
    for (const child of Array.from(node.children)) {
      if (child.tagName.toLowerCase().startsWith('xh-'))
        continue
      const el = child as HTMLElement
      const part = el.dataset.xhPart
      if (part) {
        const arr = out.get(part)
        if (arr)
          arr.push(el)
        else
          out.set(part, [el])
      }
      walk(el)
    }
  }

  walk(host)
  return out
}
