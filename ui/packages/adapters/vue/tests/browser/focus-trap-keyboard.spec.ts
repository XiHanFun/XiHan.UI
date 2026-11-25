// 焦点圈定在真实浏览器里的键盘行为：浏览器自己的 Tab 走到两端回绕、走不出去，停用后焦点回到激活前的持有者；
// 放进对话框里时 Escape 越过它关掉对话框。真实的 Tab 顺序与焦点归还帧只有 Chromium 走得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhFocusTrap } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function byText(text: string): HTMLButtonElement {
  const button = [...document.querySelectorAll('button')].find(el => el.textContent === text)
  if (!button)
    throw new Error(`找不到「${text}」按钮`)
  return button
}

function focusedText(): string | null {
  return document.activeElement?.textContent ?? null
}

describe('focus-trap 键盘', () => {
  it('tab 在区域里回绕、走不到外面；停用后焦点回到打开它的按钮', async () => {
    const active = ref(false)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => [
        h('button', { type: 'button', onClick: () => (active.value = true) }, '打开'),
        h(XhFocusTrap, { active: active.value }, () => [
          h('button', { type: 'button' }, '甲'),
          h('button', { type: 'button', onClick: () => (active.value = false) }, '乙'),
        ]),
        h('button', { type: 'button' }, '外面'),
      ],
    })
    app.mount(host)
    await nextTick()

    byText('打开').focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(focusedText).toBe('甲')

    await userEvent.tab()
    expect(focusedText()).toBe('乙')
    await userEvent.tab()
    expect(focusedText()).toBe('甲')
    await userEvent.tab({ shift: true })
    expect(focusedText()).toBe('乙')

    await userEvent.keyboard('{Enter}')
    await expect.poll(focusedText).toBe('打开')
  })

  it('loop=false 时 Tab 停在最后一个，焦点仍出不去', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => [
        h(XhFocusTrap, { loop: false }, () => [
          h('button', { type: 'button' }, '甲'),
          h('button', { type: 'button' }, '乙'),
        ]),
        h('button', { type: 'button' }, '外面'),
      ],
    })
    app.mount(host)
    await expect.poll(focusedText).toBe('甲')
    await userEvent.tab()
    expect(focusedText()).toBe('乙')
    await userEvent.tab()
    await expect.poll(focusedText).toBe('乙')
  })

  it('放在对话框里时 Escape 越过它，关掉对话框', async () => {
    const open = ref(true)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhDialogRoot, { 'open': open.value, 'onUpdate:open': (next: boolean) => (open.value = next) }, () =>
        h(XhDialogContent, null, () => [
          h(XhDialogTitle, null, () => '编辑'),
          h(XhFocusTrap, null, () => [h('button', { type: 'button' }, '甲')]),
        ])),
    })
    app.mount(host)
    await expect.poll(focusedText).toBe('甲')
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => open.value).toBe(false)
  })
})
