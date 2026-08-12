// @vitest-environment jsdom
// select 清空按钮：有选中才显形，点按清空全部选中且不展开浮层；可及名走 translations.clear。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectClearTrigger,
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

function mountSelect(props: Record<string, unknown> = {}): { change: ReturnType<typeof vi.fn> } {
  const change = vi.fn()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhSelectRoot, { 'collection': [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }], 'onValue-change': change, ...props }, () => [
        h(XhSelectTrigger),
        h(XhSelectClearTrigger, () => '✕'),
        h(XhSelectPositioner, null, () => [
          h(XhSelectContent, null, () => [
            h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
            h(XhSelectItem, { value: 'b' }, () => [h(XhSelectItemText, () => '乙')]),
          ]),
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

describe('select 清空按钮', () => {
  it('有选中才显形；点按清空且不展开浮层', async () => {
    const m = mountSelect({ defaultValue: 'a' })
    await tick()
    const clear = el(CLEAR)
    expect(clear.hasAttribute('hidden')).toBe(false)
    clear.click()
    await tick()
    expect(m.change).toHaveBeenCalledWith({ value: [] })
    expect(el(CLEAR).hasAttribute('hidden')).toBe(true)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })

  it('没选中或禁用时藏掉；可及名走 translations', async () => {
    mountSelect({ defaultValue: 'a', disabled: true, translations: { clear: '清空所选' } })
    await tick()
    const clear = el(CLEAR)
    expect(clear.hasAttribute('hidden')).toBe(true)
    expect(clear.getAttribute('aria-label')).toBe('清空所选')
  })
})
