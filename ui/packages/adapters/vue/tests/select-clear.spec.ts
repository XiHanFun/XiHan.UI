// @vitest-environment jsdom
// select 清空按钮：有选中才出现，点按清空全部选中且不展开浮层、焦点回到 trigger；可及名走 translations.clearTrigger。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectClearTrigger,
  XhSelectContent,
  XhSelectControl,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
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

function mountSelect(props: Record<string, unknown> = {}, auto = false): { change: ReturnType<typeof vi.fn> } {
  const change = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhSelectRoot, { 'collection': [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }], 'onValue-change': change, ...props }, auto
        ? undefined
        : () => [
            h(XhSelectControl, null, () => [
              h(XhSelectTrigger),
              h(XhSelectClearTrigger, () => '✕'),
            ]),
            h(XhSelectPositioner, null, () => [
              h(XhSelectContent, null, () => h(XhSelectList, null, () => [
                h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
                h(XhSelectItem, { value: 'b' }, () => [h(XhSelectItemText, () => '乙')]),
              ])),
            ]),
          ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return { change }
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const CLEAR = '[data-scope="select"][data-part="clear-trigger"]'
const CONTENT = '[data-scope="select"][data-part="content"]'
const TRIGGER = '[data-scope="select"][data-part="trigger"]'
const INDICATOR = '[data-scope="select"][data-part="indicator"]'

describe('select 清空按钮', () => {
  it('control 收纳容器带 part 标记，清空钮在其中', async () => {
    mountSelect({ defaultValue: 'a' })
    await tick()
    const control = el('[data-scope="select"][data-part="control"]')
    expect(control.querySelector('[data-part="clear-trigger"]')).toBeTruthy()
    expect(control.querySelector('[data-part="trigger"]')).toBeTruthy()
  })

  it('有选中才出现；不占 Tab 位、不对读屏隐藏；点按清空、不展开浮层、焦点回到 trigger', async () => {
    const m = mountSelect({ defaultValue: 'a' })
    await tick()
    const clear = el(CLEAR)
    expect(clear.hasAttribute('hidden')).toBe(false)
    expect(clear.hasAttribute('disabled')).toBe(false)
    expect(clear.getAttribute('tabindex')).toBe('-1')
    expect(clear.hasAttribute('aria-hidden')).toBe(false)
    expect(clear.hasAttribute('data-state')).toBe(false)
    const down = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
    clear.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
    clear.click()
    await tick()
    expect(m.change).toHaveBeenCalledWith({ value: [] })
    expect(el(CLEAR).hasAttribute('hidden')).toBe(true)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
    expect(document.activeElement).toBe(el(TRIGGER))
  })

  it('没选中、禁用或只读时藏掉；可及名走 translations.clearTrigger', async () => {
    mountSelect({ defaultValue: 'a', disabled: true, translations: { clearTrigger: '清空所选' } })
    await tick()
    const clear = el(CLEAR)
    expect(clear.hasAttribute('hidden')).toBe(true)
    expect(clear.getAttribute('aria-label')).toBe('清空所选')
  })

  it('只读：浮层照常展开但清不掉，trigger 报 aria-readonly', async () => {
    const m = mountSelect({ defaultValue: 'a', readOnly: true })
    await tick()
    expect(el(CLEAR).hasAttribute('hidden')).toBe(true)
    expect(el(TRIGGER).getAttribute('aria-readonly')).toBe('true')
    el(TRIGGER).click()
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    el('[data-scope="select"][data-part="item"][data-value="b"]').click()
    await tick()
    expect(m.change).not.toHaveBeenCalled()
  })

  it('键盘清空：焦点在 trigger 时 Delete 清空、Backspace 单选清空', async () => {
    const m = mountSelect({ defaultValue: 'a' })
    await tick()
    el(TRIGGER).dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }))
    await tick()
    expect(m.change).toHaveBeenCalledWith({ value: [] })
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })
})

describe('select 自动渲染树的清空按钮', () => {
  it('缺省不带清空钮；clearable 为真时收进 control 与 trigger 并排，有值时指示符让位', async () => {
    mountSelect({ defaultValue: 'a' }, true)
    await tick()
    expect(document.querySelector(CLEAR)).toBeNull()
    document.body.innerHTML = ''
    mountSelect({ defaultValue: 'a', clearable: true }, true)
    await tick()
    const control = el('[data-scope="select"][data-part="control"]')
    expect(control.querySelector('[data-part="trigger"]')).toBeTruthy()
    expect(control.querySelector('[data-part="clear-trigger"]')).toBeTruthy()
    expect(el(INDICATOR).hasAttribute('data-clearable')).toBe(true)
  })
})
