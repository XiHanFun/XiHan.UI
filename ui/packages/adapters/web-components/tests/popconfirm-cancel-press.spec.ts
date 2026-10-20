// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

type PopconfirmElement = HTMLElement & { readonly updateComplete: Promise<boolean> }

async function tick(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

async function mountPop(): Promise<PopconfirmElement> {
  const host = document.createElement('xh-popconfirm') as PopconfirmElement
  host.setAttribute('default-open', '')
  host.innerHTML = `
    <div data-xh-part="root">
      <button data-xh-part="trigger">导入</button>
      <input type="file" aria-label="选文件">
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">覆盖现有数据吗</h2>
        <button data-xh-part="cancel-trigger">再想想</button>
        <button data-xh-part="confirm-trigger">覆盖</button>
      </div>
    </div>
  `
  document.body.append(host)
  await host.updateComplete
  await tick()
  return host
}

/** 浮层展开后 content 搬进 portal 落点，不在宿主子树里，按 scope + part 在整个文档里取。 */
function part(host: HTMLElement, name: string): HTMLElement {
  const matches = host.ownerDocument.querySelectorAll<HTMLElement>(`[data-scope="popconfirm"][data-part="${name}"]`)
  if (matches.length !== 1)
    throw new Error(`找不到唯一的 ${name}，命中 ${matches.length} 个`)
  return matches[0]!
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('web components popconfirm 的 cancel-press', () => {
  it('点取消按钮派发一条 cancel-press（冒泡、不带 detail），不再派发与原生同名的 cancel', async () => {
    const host = await mountPop()
    const pressed: Event[] = []
    const cancels: Event[] = []
    host.addEventListener('cancel-press', event => pressed.push(event))
    document.addEventListener('cancel', event => cancels.push(event), true)

    part(host, 'cancel-trigger').click()
    await tick()

    expect(pressed).toHaveLength(1)
    expect(pressed[0]).toBeInstanceOf(CustomEvent)
    expect(pressed[0]!.bubbles).toBe(true)
    expect((pressed[0] as CustomEvent).detail).toBeNull()
    expect(cancels).toHaveLength(0)
  })

  it('作者内容里的文件输入框取消选择时冒上来的原生 cancel，不会被当成按了取消', async () => {
    const host = await mountPop()
    const pressed: Event[] = []
    host.addEventListener('cancel-press', event => pressed.push(event))

    host.querySelector('input[type="file"]')!.dispatchEvent(new Event('cancel', { bubbles: true }))
    await tick()

    expect(pressed).toHaveLength(0)
    expect(part(host, 'content').hidden).toBe(false)
  })
})
