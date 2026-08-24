// @vitest-environment jsdom
// json-viewer 原文档：view="text" 不铺行，改出一整块 pre；
// 内容与树档同源（同一套键序与环路记号），且不吃 maxStringLength / maxItems 的折减。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhJsonViewerRoot } from '../src'

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

function mount(props: Record<string, unknown>): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => () => h(XhJsonViewerRoot, props) })
  app.mount(host)
  cleanup.push(() => app.unmount())
  return host
}

function textPart(host: HTMLElement): HTMLElement | null {
  return host.querySelector('[data-scope="json-viewer"][data-part="text"]')
}

describe('json-viewer 原文档', () => {
  it('view="text" 出 pre 而不是树', async () => {
    const host = mount({ value: { a: 1 }, view: 'text' })
    await tick()
    const pre = textPart(host)
    expect(pre?.tagName).toBe('PRE')
    expect(host.querySelector('[data-part="tree"]')).toBeNull()
    expect(host.querySelector('[data-part="item"]')).toBeNull()
  })

  it('缺省仍是树档，root 上报当前档', async () => {
    const host = mount({ value: { a: 1 } })
    await tick()
    expect(host.querySelector('[data-part="tree"]')).not.toBeNull()
    expect(textPart(host)).toBeNull()
    const root = host.querySelector('[data-part="root"]')
    expect(root?.getAttribute('data-view')).toBe('tree')
  })

  it('原文缩进两格，可解析回同一份数据', async () => {
    const value = { orderNo: 'SO-1', items: [{ sku: 'A', qty: 2 }] }
    const host = mount({ value, view: 'text' })
    await tick()
    const raw = textPart(host)!.textContent ?? ''
    expect(raw).toContain('\n  "orderNo": "SO-1"')
    expect(JSON.parse(raw)).toEqual(value)
  })

  it('sortKeys 与树档同一把尺', async () => {
    const host = mount({ value: { b: 1, a: 2 }, view: 'text', sortKeys: true })
    await tick()
    expect(textPart(host)!.textContent).toBe('{\n  "a": 2,\n  "b": 1\n}')
  })

  it('不吃 maxStringLength 与 maxItems 的折减：原文一字不差', async () => {
    const long = 'x'.repeat(50)
    const host = mount({
      value: { long, list: [1, 2, 3, 4, 5] },
      view: 'text',
      maxStringLength: 5,
      maxItems: 2,
    })
    await tick()
    const raw = textPart(host)!.textContent ?? ''
    expect(raw).toContain(long)
    expect(raw).not.toContain('…')
    expect(JSON.parse(raw).list).toEqual([1, 2, 3, 4, 5])
  })

  it('环路落成 [Circular]，整份仍解析得动', async () => {
    const value: Record<string, unknown> = { n: 1 }
    value.self = value
    const host = mount({ value, view: 'text' })
    await tick()
    const raw = textPart(host)!.textContent ?? ''
    expect(raw).toContain('"[Circular]"')
    expect(() => JSON.parse(raw)).not.toThrow()
  })

  it('这一档进 Tab 序列并自报可及名', async () => {
    const host = mount({ value: { a: 1 }, view: 'text' })
    await tick()
    const pre = textPart(host)!
    expect(pre.getAttribute('tabindex')).toBe('0')
    expect(pre.getAttribute('role')).toBe('region')
    expect(pre.getAttribute('aria-label')).toBe('JSON source')
  })
})
