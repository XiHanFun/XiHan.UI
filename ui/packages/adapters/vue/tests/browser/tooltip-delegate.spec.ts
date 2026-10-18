// 提示的委托模式在真实指针下：一个提示管一条按钮栏，悬停哪个按钮就锚在哪个按钮上、换按钮直接换过去；
// 原生禁用的按钮照样收得到指针，悬停照出提示；指针离开容器后收起。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTooltipArrow, XhTooltipContent, XhTooltipPositioner, XhTooltipRoot, XhTooltipTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function until(check: () => boolean): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error('等了 2 秒仍没到期望的状态')
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="tooltip"][data-part="content"]')!
}

function textOf(part: string): string | null {
  return document.querySelector(`[data-scope="tooltip"][data-part="${part}"]`)?.textContent ?? null
}

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  // 离开视口边缘：提示居中对齐锚点时不会被避让挤偏
  host.style.padding = '96px 160px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTooltipRoot, { delegate: 'button', platform: 'other', openDelay: 0, closeDelay: 0, skipDelayDuration: 0 }, () => [
      h(XhTooltipTrigger, null, () => [
        h('button', { 'type': 'button', 'aria-label': '撤销', 'aria-keyshortcuts': 'Control+Z' }, 'U'),
        h('button', { 'type': 'button', 'aria-label': '删除', 'data-xh-tooltip': '删除选中的对象', 'disabled': true }, 'D'),
      ]),
      h(XhTooltipPositioner, null, () => [h(XhTooltipContent, null, () => [h(XhTooltipArrow)])]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host
}

describe('提示的委托模式（Chromium）', () => {
  it('悬停锚点打开并锚在它上面；换到禁用的按钮直接换过去，文字与描述跟着换；离开容器收起', async () => {
    const root = await mount()
    const [undo, del] = Array.from(root.querySelectorAll('button'))
    await userEvent.hover(undo!)
    await until(() => content().dataset.state === 'open')
    expect([textOf('text'), textOf('shortcut')]).toEqual(['撤销', 'Ctrl+Z'])
    expect(undo!.hasAttribute('aria-describedby')).toBe(false)
    await userEvent.hover(del!)
    await until(() => textOf('text') === '删除选中的对象')
    expect(content().dataset.state).toBe('open')
    expect(textOf('shortcut')).toBeNull()
    const id = document.querySelector('[data-scope="tooltip"][data-part="text"]')!.id
    expect(del!.getAttribute('aria-describedby')).toBe(id)
    const anchor = del!.getBoundingClientRect()
    const bubble = content().getBoundingClientRect()
    expect(Math.abs((bubble.left + bubble.right) / 2 - (anchor.left + anchor.right) / 2)).toBeLessThan(2)
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    await until(() => content().dataset.state === 'closed')
    expect(del!.hasAttribute('aria-describedby')).toBe(false)
  })
})
