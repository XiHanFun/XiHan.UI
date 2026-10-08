// Pagination 行里的两个字段：每页条数控制器按内容定宽（字段缺省宽 16rem 在分页行里过宽）；
// 跳页框接字段家族——静息 canvas 底上的控件描边、悬停升控件悬停边、聚焦换聚焦边加环、校验失败换失败边。
// 判据是几何与计算样式，jsdom 不排版。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhPaginationItem,
  XhPaginationJumper,
  XhPaginationPageSizeSelect,
  XhPaginationRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  for (const el of document.querySelectorAll('[data-scope="select"][data-part="positioner"]'))
    el.remove()
})

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({
    setup: () => () =>
      h(XhPaginationRoot, { count: 196, defaultPageSize: 20, pageSizeOptions: [10, 20, 50] }, () => [
        h(XhPaginationItem, { value: 1 }, () => '1'),
        h(XhPaginationPageSizeSelect),
        h(XhPaginationJumper),
      ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(scope: string, name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!
}

function resolved(on: HTMLElement, property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  on.parentElement!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe('pagination 的每页条数控制器', () => {
  it('按内容定宽：比字段缺省宽窄，盒子刚好装下回显与箭头', async () => {
    await mount()
    const root = part('select', 'root')
    const control = part('select', 'control')
    const fieldWidth = Number.parseFloat(resolved(root, 'inline-size', 'var(--xh-control-w)'))
    expect(root.getBoundingClientRect().width).toBeLessThan(fieldWidth / 2)
    // 回显不被截断
    const text = part('select', 'value-text')
    expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
    expect(control.getBoundingClientRect().width).toBeCloseTo(root.getBoundingClientRect().width, 0)
  })
})

describe('pagination 的跳页框接字段家族', () => {
  it('投影字段外壳，静息取控件描边、字段淡底、无影', async () => {
    await mount()
    const jumper = part('pagination', 'jumper')
    expect(jumper.hasAttribute('data-xh-field-chrome')).toBe(true)
    const style = getComputedStyle(jumper)
    expect(style.borderTopColor).toBe(resolved(jumper, 'border-top-color', 'var(--xh-border-control)'))
    expect(style.backgroundColor).toBe(resolved(jumper, 'background-color', 'var(--xh-bg-field)'))
    expect(style.boxShadow).toBe('none')
  })

  it('悬停描边升 strong 档', async () => {
    await mount()
    const jumper = part('pagination', 'jumper')
    await userEvent.hover(jumper)
    await expect.poll(() => getComputedStyle(jumper).borderTopColor)
      .toBe(resolved(jumper, 'border-top-color', 'var(--xh-border-strong)'))
  })

  it('聚焦换聚焦边、不画环', async () => {
    await mount()
    const jumper = part('pagination', 'jumper')
    // 指针挪开，这里只看聚焦档
    await userEvent.hover(part('pagination', 'item'))
    jumper.focus()
    await expect.poll(() => getComputedStyle(jumper).borderTopColor)
      .toBe(resolved(jumper, 'border-top-color', 'var(--xh-border-control-focus)'))
    expect(getComputedStyle(jumper).outlineStyle).toBe('none')
  })

  it('越界的页码判校验失败：换失败边', async () => {
    await mount()
    const jumper = part('pagination', 'jumper') as HTMLInputElement
    await userEvent.fill(jumper, '999')
    await userEvent.click(part('pagination', 'item'))
    await expect.poll(() => getComputedStyle(jumper).borderTopColor)
      .toBe(resolved(jumper, 'border-top-color', 'var(--xh-border-invalid)'))
  })
})
