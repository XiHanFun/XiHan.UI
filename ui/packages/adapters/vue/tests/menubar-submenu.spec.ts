// @vitest-environment jsdom
// 菜单栏嵌套子菜单：跨 scope 双重身份（父层 item 身份胜出，否则菜单栏按自己的 scope 查不到它）、
// 子层选中带上菜单身份汇到根并关掉整条菜单栏。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSub,
  XhMenubarSubTrigger,
  XhMenubarTrigger,
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

function mount(): { select: ReturnType<typeof vi.fn> } {
  const select = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhMenubarRoot, { defaultValue: 'file', onSelect: select }, () => [
        h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
        h(XhMenubarPositioner, { value: 'file' }, () => [
          h(XhMenubarContent, { value: 'file' }, () => [
            h(XhMenubarItem, { value: 'open' }, () => '打开'),
            h(XhMenubarSub, { value: 'share' }, () => [
              h(XhMenubarSubTrigger, () => '发送到…'),
              h(XhMenuPositioner, null, () => [
                h(XhMenuContent, null, () => [
                  h(XhMenuItem, { value: 'email' }, () => '邮件'),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { select }
}

describe('菜单栏的子菜单', () => {
  it('触发条目带父层的 scope：菜单栏按自己的 scope 查条目，查不到就进不了方向键行程', async () => {
    mount()
    await tick()
    const trigger = document.querySelector('[data-part="item"][data-value="share"]')
    expect(trigger).not.toBeNull()
    expect(trigger!.getAttribute('data-scope')).toBe('menubar')
  })

  it('同时是子菜单触发器：带 aria-haspopup 与 aria-expanded', async () => {
    mount()
    await tick()
    const trigger = document.querySelector('[data-value="share"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('点它只展开子菜单，不发选中——它不是可选中的叶子', async () => {
    const { select } = mount()
    await tick()
    const trigger = document.querySelector<HTMLElement>('[data-value="share"]')!
    trigger.click()
    await tick()
    expect(select).not.toHaveBeenCalled()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('子层选中汇到根，载荷带上所属菜单的身份', async () => {
    const { select } = mount()
    await tick()
    document.querySelector<HTMLElement>('[data-value="share"]')!.click()
    await tick()
    const leaf = document.querySelector<HTMLElement>('[data-scope="menu"][data-value="email"]')!
    leaf.click()
    await tick()
    expect(select).toHaveBeenCalledWith(expect.objectContaining({ menu: 'file', value: 'email' }))
  })
})
