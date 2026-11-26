// 标准结构与手写全套部件的逐节点比对：宿主里每个元素的标签、属性与直属文字，按文档序、带缩进。
// 实例 id 两边各自派生、取值不同，按第一次出现的次序换成 #0、#1…，指向它的 aria-* 跟着换，配对关系照样比得出来。

import { afterEach } from 'vitest'
import { createApp, defineComponent, nextTick } from 'vue'

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

let unmounts: Array<() => void> = []

afterEach(() => {
  for (const un of unmounts) un()
  unmounts = []
  document.body.innerHTML = ''
})

/** 挂一份渲染函数，返回装它的宿主；用例结束统一卸下。 */
export function mountRender(render: () => unknown): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(defineComponent({ setup: () => render }))
  app.mount(host)
  unmounts.push(() => {
    app.unmount()
    host.remove()
  })
  return host
}

/** 机器写回、效应与 Vue 重渲各让几拍。 */
export async function flush(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}
