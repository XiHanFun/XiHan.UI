// @vitest-environment jsdom
// select 校验错误态：invalid 让触发器输出 aria-invalid 并在触发器与根上打 data-invalid。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectContent,
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

function mountSelect(props: Record<string, unknown> = {}): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhSelectRoot, { collection: [{ value: 'a', label: '甲' }], ...props }, () => [
        h(XhSelectTrigger),
        h(XhSelectPositioner, null, () => [
          h(XhSelectContent, null, () => h(XhSelectList, null, () => [
            h(XhSelectItem, { value: 'a' }, () => [h(XhSelectItemText, () => '甲')]),
          ])),
        ]),
      ]),
  })
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

describe('select 错误态', () => {
  it('invalid：触发器 aria-invalid 与 data-invalid、根上 data-invalid 全部就位', async () => {
    mountSelect({ invalid: true })
    await tick()
    const trigger = el('[data-scope="select"][data-part="trigger"]')
    expect(trigger.getAttribute('aria-invalid')).toBe('true')
    expect(trigger.hasAttribute('data-invalid')).toBe(true)
    expect(el('[data-scope="select"][data-part="root"]').hasAttribute('data-invalid')).toBe(true)
  })

  it('缺省不标红：aria-invalid 显式 false、无 data-invalid', async () => {
    mountSelect()
    await tick()
    const trigger = el('[data-scope="select"][data-part="trigger"]')
    expect(trigger.getAttribute('aria-invalid')).toBe('false')
    expect(trigger.hasAttribute('data-invalid')).toBe(false)
  })
})
