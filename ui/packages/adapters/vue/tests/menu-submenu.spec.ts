// @vitest-environment jsdom
// menu 子菜单组合：双重身份触发条目、子层选中汇根、键盘进出、Escape 只收顶层、父关级联。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
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

interface Handles {
  select: ReturnType<typeof vi.fn>
  rootScope: () => { open: boolean, setOpen: (v: boolean) => void }
}

function mountMenu(): Handles {
  const select = vi.fn()
  let rootScope: { open: boolean, setOpen: (v: boolean) => void } | null = null
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhMenuRoot, { onSelect: select }, {
        default: (scope: { open: boolean, setOpen: (v: boolean) => void }) => {
          rootScope = scope
          return [
            h(XhMenuTrigger, () => '菜单'),
            h(XhMenuPositioner, null, () => [
              h(XhMenuContent, null, () => [
                h(XhMenuItem, { value: 'copy' }, () => '复制'),
                h(XhMenuSub, { value: 'share' }, () => [
                  h(XhMenuSubTrigger, () => '发送到…'),
                  h(XhMenuPositioner, null, () => [
                    h(XhMenuContent, null, () => [
                      h(XhMenuItem, { value: 'email' }, () => '邮件'),
                      h(XhMenuItem, { value: 'sms' }, () => '短信'),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]
        },
      }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return {
    select,
    rootScope: () => {
      if (!rootScope)
        throw new Error('根插槽未就绪')
      return rootScope
    },
  }
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const SUB_TRIGGER = '[data-scope="menu"][data-part="item"][aria-haspopup="menu"]'
const CHILD_ITEM = '[data-scope="menu"][data-part="item"][data-value="email"]'

async function openRoot(): Promise<void> {
  el('[data-scope="menu"][data-part="trigger"]').click()
  await tick()
}

describe('menu 子菜单', () => {
  it('触发条目是双重身份：父层 item + aria-haspopup，点按展开子层且父层不收', async () => {
    const t = mountMenu()
    await openRoot()
    const sub = el(SUB_TRIGGER)
    expect(sub.getAttribute('role')).toBe('menuitem')
    expect(sub.getAttribute('aria-expanded')).toBe('false')

    sub.click()
    await tick()
    expect(sub.getAttribute('aria-expanded')).toBe('true')
    expect(el(CHILD_ITEM)).toBeTruthy()
    // 父层还开着，且没把 share 当普通条目选中
    expect(t.rootScope().open).toBe(true)
    expect(t.select).not.toHaveBeenCalled()
  })

  it('子层选中汇到根：发根的 select 并整链关闭', async () => {
    const t = mountMenu()
    await openRoot()
    el(SUB_TRIGGER).click()
    await tick()
    el(CHILD_ITEM).click()
    await tick()
    expect(t.select).toHaveBeenCalledWith({ value: 'email' })
    expect(t.rootScope().open).toBe(false)
    expect(el(SUB_TRIGGER).getAttribute('aria-expanded')).toBe('false')
  })

  it('键盘：右方向键展开子层，子层左方向键收回', async () => {
    mountMenu()
    await openRoot()
    const sub = el(SUB_TRIGGER)
    sub.focus()
    sub.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await tick()
    expect(sub.getAttribute('aria-expanded')).toBe('true')

    const childContent = el(CHILD_ITEM).closest<HTMLElement>('[data-part="content"]')!
    childContent.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }))
    await tick()
    expect(sub.getAttribute('aria-expanded')).toBe('false')
  })

  it('enter 在子菜单触发条目上只展开、不触发父层选中', async () => {
    const t = mountMenu()
    await openRoot()
    const sub = el(SUB_TRIGGER)
    sub.focus()
    sub.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await tick()
    expect(sub.getAttribute('aria-expanded')).toBe('true')
    expect(t.select).not.toHaveBeenCalled()
    expect(t.rootScope().open).toBe(true)
  })

  it('父层关闭级联收起子层', async () => {
    const t = mountMenu()
    await openRoot()
    el(SUB_TRIGGER).click()
    await tick()
    t.rootScope().setOpen(false)
    await tick()
    expect(el(SUB_TRIGGER).getAttribute('aria-expanded')).toBe('false')
  })

  it('escape 只收顶层：子层先关、父层还在', async () => {
    const t = mountMenu()
    await openRoot()
    el(SUB_TRIGGER).click()
    await tick()
    const childContent = el(CHILD_ITEM).closest<HTMLElement>('[data-part="content"]')!
    childContent.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await tick()
    expect(el(SUB_TRIGGER).getAttribute('aria-expanded')).toBe('false')
    expect(t.rootScope().open).toBe(true)
  })
})
