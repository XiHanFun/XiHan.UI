import type { Spreader } from './spread'

/** 作者声明一个出口；首值使用该节点，其余值由宿主管理同级原生输入。 */
export function createRepeatedHiddenInputs(spreader: Spreader): {
  sync: (node: HTMLElement | null, fields: Record<string, unknown>[]) => void
  release: (nodes: readonly HTMLElement[]) => void
} {
  let anchor: HTMLElement | null = null
  const extra: HTMLInputElement[] = []

  function clear(): void {
    for (const input of extra) {
      spreader.release(input)
      input.remove()
    }
    extra.length = 0
    anchor = null
  }

  return {
    sync(node: HTMLElement | null, fields: Record<string, unknown>[]): void {
      if (node !== anchor) {
        clear()
        anchor = node
      }
      if (!node)
        return
      // 没有选中值时保留作者节点作为结构锚点，但不得提交空字符串。
      spreader.spread(node, fields[0] ?? { type: 'hidden', disabled: true })
      const count = Math.max(0, fields.length - 1)
      while (extra.length > count) {
        const input = extra.pop()!
        spreader.release(input)
        input.remove()
      }
      while (extra.length < count)
        extra.push(node.ownerDocument.createElement('input'))
      let previous = node
      for (let index = 0; index < extra.length; index++) {
        const input = extra[index]!
        spreader.spread(input, fields[index + 1]!)
        // 不携带 data-xh-part，避免运行时生成节点被当成第二份作者出口重复接管。
        if (previous.nextSibling !== input)
          previous.after(input)
        previous = input
      }
    },
    release(nodes: readonly HTMLElement[]): void {
      if (anchor && nodes.includes(anchor))
        clear()
    },
  }
}
