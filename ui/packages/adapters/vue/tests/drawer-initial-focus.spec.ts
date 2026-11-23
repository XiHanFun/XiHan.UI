// @vitest-environment jsdom
// 抽屉跑的是对话框那一份机器，initialFocus 机器早就认；这里核它在抽屉上有入口可写。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhDrawerContent, XhDrawerRoot, XhDrawerTitle } from '../src'

const mounted: Array<() => void> = []

afterEach(() => {
  while (mounted.length) mounted.pop()?.()
  document.body.innerHTML = ''
})

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

function mountDrawer(initialFocus?: string): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () => h(XhDrawerRoot, { defaultOpen: true, initialFocus }, () => [
      h(XhDrawerContent, null, () => [
        h(XhDrawerTitle, null, () => '筛选条件'),
        h('input', { 'data-testid': 'keyword' }),
        h('button', { 'data-testid': 'apply' }, '应用'),
      ]),
    ]),
  })
  app.mount(host)
  mounted.push(() => {
    app.unmount()
    host.remove()
  })
}

describe('drawer 的 initialFocus', () => {
  it('不给时焦点落在内容里第一个可聚焦的控件上', async () => {
    mountDrawer()
    await tick()
    expect(document.activeElement).toBe(document.querySelector('[data-testid="keyword"]'))
  })

  it('给了选择器就落在匹配的元素上', async () => {
    mountDrawer('[data-testid="apply"]')
    await tick()
    expect(document.activeElement).toBe(document.querySelector('[data-testid="apply"]'))
  })
})
