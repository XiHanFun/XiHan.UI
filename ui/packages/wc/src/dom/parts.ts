// 角色节点发现：从宿主向下遍历，收集带 data-xh-part 的节点；跳过嵌套 xh-* 子树
// （内层组件的 part 归内层，外层不越界抢）。
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
