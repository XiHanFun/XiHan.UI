// @vitest-environment jsdom
// 浮层选单族的活动项唯一性：指针划过即把高亮/焦点搬到所在条目，
// 不会出现「键盘锚点亮一条、hover 又亮一条」的双高亮。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mount(render: () => unknown): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

describe('hover 跟随高亮', () => {
  it('menu：指针划过条目即把焦点搬来，旧锚点让位', async () => {
    mount(() => h(XhMenuRoot, null, () => [
      h(XhMenuTrigger, () => '菜单'),
      h(XhMenuPositioner, null, () => [
        h(XhMenuContent, null, () => [
          h(XhMenuItem, { value: 'copy' }, () => '复制'),
          h(XhMenuItem, { value: 'rename' }, () => '重命名'),
        ]),
      ]),
    ]))
    await tick()
    el('[data-scope="menu"][data-part="trigger"]').click()
    await tick()

    const rename = el('[data-scope="menu"][data-part="item"][data-value="rename"]')
    rename.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }))
    await tick()
    expect(document.activeElement).toBe(rename)
    // roving tabindex 跟着搬：只有它留在 Tab 序列
    expect(rename.getAttribute('tabindex')).toBe('0')
    expect(el('[data-value="copy"]').getAttribute('tabindex')).toBe('-1')
  })

  it('select：指针划过条目即把 data-highlighted 搬来', async () => {
    mount(() => h(XhSelectRoot, {
      collection: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
      defaultOpen: true,
    }, () => [
      h(XhSelectTrigger),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, null, () => [
          h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
          h(XhSelectItem, { value: 'b' }, () => [h(XhSelectItemText, () => '乙')]),
        ]),
      ]),
    ]))
    await tick()

    const b = el('[data-scope="select"][data-part="item"][data-value="b"]')
    b.dispatchEvent(new PointerEvent('pointermove', { bubbles: false }))
    await tick()
    expect(b.hasAttribute('data-highlighted')).toBe(true)
    expect(el('[data-scope="select"][data-part="item"][data-value="a"]').hasAttribute('data-highlighted')).toBe(false)
  })
})
