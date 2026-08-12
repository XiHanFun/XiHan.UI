// @vitest-environment jsdom
// context-menu 嵌套子菜单：跨 scope 双重身份（父层 item 身份胜出）、子层选中汇根整链关闭。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSub,
  XhContextMenuSubTrigger,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
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

function mountCtx(): { select: ReturnType<typeof vi.fn> } {
  const select = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhContextMenuRoot, { onSelect: select }, () => [
        h(XhContextMenuTrigger, () => '右键这里'),
        h(XhContextMenuPositioner, null, () => [
          h(XhContextMenuContent, null, () => [
            h(XhContextMenuItem, { value: 'copy' }, () => '复制'),
            h(XhContextMenuSub, { value: 'share' }, () => [
              h(XhContextMenuSubTrigger, () => '发送到…'),
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

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const SUB_TRIGGER = '[data-scope="context-menu"][data-part="item"][aria-haspopup="menu"]'
const CHILD_ITEM = '[data-scope="menu"][data-part="item"][data-value="email"]'

async function openCtx(): Promise<void> {
  const trigger = el('[data-scope="context-menu"][data-part="trigger"]')
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 40 })
  trigger.dispatchEvent(event)
  await tick()
}

describe('context-menu 子菜单', () => {
  it('触发条目跨 scope 双重身份：父层 item 身份胜出、带子层触发器语义', async () => {
    mountCtx()
    await openCtx()
    const sub = el(SUB_TRIGGER)
    expect(sub.getAttribute('role')).toBe('menuitem')
    expect(sub.getAttribute('data-scope')).toBe('context-menu')
    expect(sub.getAttribute('aria-expanded')).toBe('false')
  })

  it('点按展开子层且父层不收、不算选中', async () => {
    const t = mountCtx()
    await openCtx()
    el(SUB_TRIGGER).click()
    await tick()
    expect(el(SUB_TRIGGER).getAttribute('aria-expanded')).toBe('true')
    expect(el(CHILD_ITEM)).toBeTruthy()
    expect(t.select).not.toHaveBeenCalled()
  })

  it('子层选中汇到根：发根的 select 并整链关闭', async () => {
    const t = mountCtx()
    await openCtx()
    el(SUB_TRIGGER).click()
    await tick()
    el(CHILD_ITEM).click()
    await tick()
    expect(t.select).toHaveBeenCalledWith({ value: 'email' })
    expect(el(SUB_TRIGGER).getAttribute('aria-expanded')).toBe('false')
  })
})
