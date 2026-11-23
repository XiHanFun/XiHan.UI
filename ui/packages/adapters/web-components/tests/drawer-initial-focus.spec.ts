// @vitest-environment jsdom
// 抽屉跑的是对话框那一份机器，initialFocus 机器早就认；这里核它在抽屉元素上有入口可写。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

type DrawerElement = HTMLElement & { readonly updateComplete: Promise<boolean> }

async function tick(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

async function mountDrawer(attrs = ''): Promise<void> {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `<xh-drawer default-open ${attrs}>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">筛选条件</h2>
        <input data-testid="keyword" />
        <button data-testid="apply">应用</button>
      </div>
    </div>
  </xh-drawer>`
  document.body.append(wrapper)
  await wrapper.querySelector<DrawerElement>('xh-drawer')!.updateComplete
  await tick()
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.cssText = ''
})

describe('xh-drawer 的 initial-focus', () => {
  it('不写时焦点落在内容里第一个可聚焦的控件上', async () => {
    await mountDrawer()
    expect(document.activeElement).toBe(document.querySelector('[data-testid="keyword"]'))
  })

  it('写了选择器就落在匹配的元素上', async () => {
    await mountDrawer(`initial-focus='[data-testid="apply"]'`)
    expect(document.activeElement).toBe(document.querySelector('[data-testid="apply"]'))
  })
})
