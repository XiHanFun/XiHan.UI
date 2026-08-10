// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from '../src'

interface Mounted {
  host: HTMLElement
  unmount: () => void
}

/** 挂 n 个并列的 popover，每个 trigger/content 用 data-id 标出身份。 */
function mountPopovers(ids: readonly string[]): Mounted {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      ids.map(id =>
        h(XhPopoverRoot, { key: id }, {
          default: () => [
            h(XhPopoverTrigger, { 'data-id': id }, () => `开 ${id}`),
            h(XhPopoverPositioner, null, {
              default: () => [h(XhPopoverContent, { 'data-id': id }, () => `内容 ${id}`)],
            }),
          ],
        }),
      ),
  })
  app.mount(host)
  const unmount = (): void => {
    app.unmount()
    host.remove()
  }
  return { host, unmount }
}

function trigger(id: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="popover"][data-part="trigger"][data-id="${id}"]`)!
}
function content(id: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="popover"][data-part="content"][data-id="${id}"]`)!
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

function pressEscape(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

// 消解层只让栈顶响应 Escape。层若在挂载期就注册、与开合无关地常驻栈里，
// 同页第二个浮层组件会永久占着栈顶，前面那个即使展开也按不动 Escape。
describe('popover 的消解层生命周期', () => {
  it('并列两个：展开第一个，Escape 能关掉它', async () => {
    const app = mountPopovers(['a', 'b'])
    await tick()

    trigger('a').click()
    await tick()
    expect(content('a').getAttribute('data-state')).toBe('open')

    pressEscape()
    await tick()
    expect(content('a').getAttribute('data-state')).toBe('closed')

    app.unmount()
  })

  it('并列两个：先后展开，Escape 逐个关闭（后开的先关）', async () => {
    const app = mountPopovers(['a', 'b'])
    await tick()

    trigger('a').click()
    await tick()
    trigger('b').click()
    await tick()
    expect(content('a').getAttribute('data-state')).toBe('open')
    expect(content('b').getAttribute('data-state')).toBe('open')

    // 后开的 b 在栈顶，先被关掉
    pressEscape()
    await tick()
    expect(content('b').getAttribute('data-state')).toBe('closed')
    expect(content('a').getAttribute('data-state')).toBe('open')

    // 再按一次轮到 a
    pressEscape()
    await tick()
    expect(content('a').getAttribute('data-state')).toBe('closed')

    app.unmount()
  })

  it('关掉再开：层能重新回到栈顶，Escape 仍然有效', async () => {
    const app = mountPopovers(['a', 'b'])
    await tick()

    trigger('b').click()
    await tick()
    pressEscape()
    await tick()
    expect(content('b').getAttribute('data-state')).toBe('closed')

    trigger('a').click()
    await tick()
    pressEscape()
    await tick()
    expect(content('a').getAttribute('data-state')).toBe('closed')

    app.unmount()
  })
})
