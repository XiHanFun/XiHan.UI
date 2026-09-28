// 菜单退场还没播完就被键盘重新打开：这一次按哪个键打开，焦点就按哪个键落位。
// ArrowUp 打开落末项、ArrowDown 打开落首项，不回到上一次打开时停过的那一项。
// 退场途中的重开由保留的焦点域重新激活承担，只有真实浏览器里退场动画才真的在播。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhMenuContent, XhMenuItem, XhMenuPositioner, XhMenuRoot, XhMenuTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
let style: HTMLStyleElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  style?.remove()
  style = null
})

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(): Promise<HTMLElement> {
  // 退场拉长到看得见的一段，重开一定落在退场途中
  style = document.createElement('style')
  style.textContent = `
    @keyframes test-menu-reopen-exit { from { opacity: 1 } to { opacity: 0 } }
    [data-scope='menu'][data-part='content'][data-state='closed'] {
      animation: test-menu-reopen-exit 10s linear forwards;
    }
  `
  document.head.append(style)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhMenuRoot, null, () => [
      h(XhMenuTrigger, null, () => '操作'),
      h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => ['复制', '粘贴', '删除'].map(label =>
        h(XhMenuItem, { key: label, value: label }, () => label)))),
    ]),
  })
  app.mount(host)
  await nextTick()
  const trigger = host.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!
  trigger.focus()
  return trigger
}

async function focusedText(): Promise<string | null> {
  await expect.poll(() => document.activeElement?.getAttribute('data-part')).toBe('item')
  return document.activeElement!.textContent
}

describe('菜单退场途中被键盘重新打开', () => {
  it('arrowDown 打开、Escape 收起，退场途中按 ArrowUp 重开：焦点落末项', async () => {
    const trigger = await mount()
    await userEvent.keyboard('{ArrowDown}')
    expect(await focusedText()).toBe('复制')
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.activeElement).toBe(trigger)
    const content = document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='content']`)!
    expect(content.getAttribute('data-state')).toBe('closed')
    // 退场还在播
    expect(content.getAnimations().length).toBeGreaterThan(0)
    await userEvent.keyboard('{ArrowUp}')
    await frame()
    await frame()
    expect(await focusedText()).toBe('删除')
  })
})
