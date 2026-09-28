// 首页 / 末页钮默认画两枚双箭头（与上一页 / 下一页的单箭头不是同一张图，rtl 下对调），与页码同一副骨架；
// 整组禁用时每一格都是禁用面，当前页退成淡底仍标得出位置。伪元素与计算样式只有真实 Chromium 量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhPaginationFirstTrigger,
  XhPaginationItem,
  XhPaginationLastTrigger,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
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
})

async function mount(opts: { dir?: 'ltr' | 'rtl', disabled?: boolean } = {}) {
  host = document.createElement('div')
  if (opts.dir)
    host.setAttribute('dir', opts.dir)
  document.body.append(host)
  app = createApp({
    setup: () => () =>
      h(XhPaginationRoot, { count: 50, pageSize: 10, defaultPage: 3, dir: opts.dir, disabled: opts.disabled }, () => [
        h(XhPaginationFirstTrigger),
        h(XhPaginationPrevTrigger),
        h(XhPaginationItem, { value: 2 }, () => '2'),
        h(XhPaginationItem, { value: 3 }, () => '3'),
        h(XhPaginationNextTrigger),
        h(XhPaginationLastTrigger),
      ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string, index = 0): HTMLElement {
  return host!.querySelectorAll<HTMLElement>(`[data-scope="pagination"][data-part="${name}"]`)[index]!
}

function maskOf(el: HTMLElement): string {
  const style = getComputedStyle(el, '::before')
  return style.maskImage || style.webkitMaskImage || ''
}

function token(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `background-color: var(${name})`
  host!.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

function colorToken(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  host!.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

describe('pagination 首页 / 末页钮', () => {
  it('不写内容时各画一枚双箭头，与单箭头不是同一张图', async () => {
    await mount()
    const first = maskOf(part('first-trigger'))
    const last = maskOf(part('last-trigger'))
    expect(first).toContain('data:image/svg')
    expect(last).toContain('data:image/svg')
    expect(first).not.toBe(last)
    expect(first).not.toBe(maskOf(part('prev-trigger')))
    expect(last).not.toBe(maskOf(part('next-trigger')))
  })

  it('rtl 下两枚双箭头对调', async () => {
    await mount()
    const first = maskOf(part('first-trigger'))
    const last = maskOf(part('last-trigger'))
    app?.unmount()
    host?.remove()
    await mount({ dir: 'rtl' })
    expect(maskOf(part('first-trigger'))).toBe(last)
    expect(maskOf(part('last-trigger'))).toBe(first)
  })

  it('与页码同一副骨架：同高、同一条顶线', async () => {
    await mount()
    const first = part('first-trigger').getBoundingClientRect()
    const item = part('item').getBoundingClientRect()
    expect(first.height).toBeCloseTo(item.height, 1)
    expect(first.top).toBeCloseTo(item.top, 1)
  })
})

describe('pagination 整组禁用', () => {
  it('当前页退成淡底、字取禁用色，其余页码透明底禁用色', async () => {
    await mount({ disabled: true })
    const current = getComputedStyle(part('item', 1))
    const other = getComputedStyle(part('item', 0))
    expect(current.backgroundColor).toBe(token('--xh-bg-subtle'))
    expect(current.color).toBe(colorToken('--xh-fg-disabled'))
    expect(other.color).toBe(colorToken('--xh-fg-disabled'))
    expect(other.backgroundColor).not.toBe(current.backgroundColor)
  })

  it('不开 disabled 时当前页仍是实心品牌面', async () => {
    await mount()
    expect(getComputedStyle(part('item', 1)).backgroundColor).not.toBe(token('--xh-bg-subtle'))
  })
})
