// 标准结构与手写全套部件的逐节点比对：宿主里每个元素的标签、属性与直属文字，按文档序、带缩进。
// 实例 id 两边各自派生、取值不同，按第一次出现的次序换成 #0、#1…，指向它的 aria-* 跟着换，配对关系照样比得出来。

import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach } from 'vitest'

const ID_REFS = /^(?:id|for|aria-controls|aria-labelledby|aria-describedby)$/

export function structureSnapshot(host: Element): string[] {
  const all = Array.from(host.querySelectorAll('*'))
  // 按第一次出现编号：指向树外（如没铺的面板）的引用两边也编到同一个号上
  const ids = new Map<string, string>()
  const ref = (value: string): string => value.split(/\s+/).map((token) => {
    if (!ids.has(token))
      ids.set(token, `#${ids.size}`)
    return ids.get(token)!
  }).join(' ')
  return all.map((el) => {
    let depth = 0
    for (let up = el.parentElement; up && up !== host; up = up.parentElement)
      depth++
    const attrs = Array.from(el.attributes, attr => `${attr.name}=${ID_REFS.test(attr.name) ? ref(attr.value) : attr.value}`).sort()
    const text = Array.from(el.childNodes).filter(node => node.nodeType === 3).map(node => node.textContent).join('')
    return `${'  '.repeat(depth)}${el.localName}[${attrs.join(' ')}]${text}`
  })
}

let roots: Array<ReturnType<typeof createRoot>> = []

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => {
    for (const root of roots) root.unmount()
  })
  roots = []
  document.body.innerHTML = ''
})

/** 渲一棵树，返回装它的宿主与重渲入口；用例结束统一卸下。 */
export async function renderInto(node: ReactNode): Promise<{ host: HTMLElement, rerender: (next: ReactNode) => Promise<void> }> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  await act(async () => {
    root.render(node)
  })
  return {
    host,
    rerender: async (next) => {
      await act(async () => {
        root.render(next)
      })
    },
  }
}
