// 元素按标准结构生成的节点与作者手写全套部件的逐节点比对：容器里每个元素的标签、属性与直属文字，按文档序、带缩进。
// 生成标记（data-xh-gen）只说明节点是谁建的，不算结构，不比；实例 id 按第一次出现的次序换成 #0、#1…，
// 指向它的 aria-* 跟着换，配对关系照样比得出来。

import { afterEach } from 'vitest'

const ID_REFS = /^(?:id|for|aria-controls|aria-labelledby|aria-describedby)$/

export function structureSnapshot(container: Element): string[] {
  const all = Array.from(container.querySelectorAll('*'))
  const ids = new Map<string, string>()
  const ref = (value: string): string => value.split(/\s+/).map((token) => {
    if (!ids.has(token))
      ids.set(token, `#${ids.size}`)
    return ids.get(token)!
  }).join(' ')
  return all.map((el) => {
    let depth = 0
    for (let up = el.parentElement; up && up !== container; up = up.parentElement)
      depth++
    const attrs = Array.from(el.attributes)
      .filter(attr => attr.name !== 'data-xh-gen')
      .map(attr => `${attr.name}=${ID_REFS.test(attr.name) ? ref(attr.value) : attr.value}`)
      .sort()
    const text = Array.from(el.childNodes).filter(node => node.nodeType === 3).map(node => node.textContent).join('')
    return `${'  '.repeat(depth)}${el.localName}[${attrs.join(' ')}]${text}`
  })
}

afterEach(() => {
  document.body.replaceChildren()
})

interface UpdatingElement extends HTMLElement {
  updateComplete?: Promise<unknown>
}

/**
 * 建一个宿主：先按 property 赋值（数组与对象只走 property），再写作者的 Light DOM，最后挂进一个容器。
 * 返回容器，比对时连同宿主自己的属性一起比。
 */
export function mountElement(tag: string, options: { attrs?: Record<string, string>, props?: Record<string, unknown>, inner?: string } = {}): { container: HTMLElement, host: UpdatingElement } {
  const container = document.createElement('div')
  const host = document.createElement(tag) as UpdatingElement
  for (const [name, value] of Object.entries(options.attrs ?? {}))
    host.setAttribute(name, value)
  Object.assign(host, options.props ?? {})
  host.innerHTML = options.inner ?? ''
  container.append(host)
  document.body.append(container)
  return { container, host }
}

/** 等元素与它生成的内层元素都升级、接线完。 */
export async function settle(container: Element): Promise<void> {
  for (let i = 0; i < 4; i++) {
    const hosts = [container, ...Array.from(container.querySelectorAll('*'))] as UpdatingElement[]
    await Promise.all(hosts.map(el => el.updateComplete))
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}
