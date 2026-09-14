// 省略位不写内容时由皮肤画三点：折进去那几页的入口，空着就是一格看不出能点的空白。
//
// 只有真实浏览器量得出来：字形画在伪元素上，jsdom 的 getComputedStyle 不解析
// 伪元素里的 var()，量出来恒是空串。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
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

/** slotted 为真时作者自己往省略位里塞内容，兜底字形就该让位。 */
async function mount(opts: { slotted?: boolean } = {}) {
  host = document.createElement('div')
  document.body.append(host)

  app = createApp({
    setup: () => () =>
      h(XhPaginationRoot, { count: 200, pageSize: 10, defaultPage: 10 }, () => [
        h(XhPaginationPrevTrigger),
        h(XhPaginationItem, { value: 1 }, () => '1'),
        opts.slotted
          ? h(XhPaginationEllipsisTrigger, { side: 'start' }, () => '更多')
          : h(XhPaginationEllipsisTrigger, { side: 'start' }),
        h(XhPaginationItem, { value: 10 }, () => '10'),
        h(XhPaginationNextTrigger),
      ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="pagination"][data-part="${name}"]`)!
}

/** 伪元素上真正生效的那张 mask 图。 */
function maskOf(el: HTMLElement): string {
  const style = getComputedStyle(el, '::before')
  return style.maskImage || style.webkitMaskImage || ''
}

describe('省略位的兜底字形', () => {
  it('不写内容时画一枚字形，且与前后两枚箭头不是同一张图', async () => {
    await mount()
    const ellipsis = maskOf(part('ellipsis-trigger'))

    expect(ellipsis).toContain('data:image/svg')
    expect(ellipsis).not.toBe(maskOf(part('prev-trigger')))
    expect(ellipsis).not.toBe(maskOf(part('next-trigger')))
  })

  it('字形盒是个正方形，与作者塞的图标同一把尺', async () => {
    await mount()
    const box = getComputedStyle(part('ellipsis-trigger'), '::before')

    expect(Number.parseFloat(box.inlineSize)).toBeGreaterThan(0)
    expect(box.inlineSize).toBe(box.blockSize)
  })

  it('作者塞了文字就让位，不再画字形', async () => {
    await mount({ slotted: true })
    expect(part('ellipsis-trigger').textContent).toBe('更多')
    // :empty 不再命中，伪元素整个不存在
    expect(maskOf(part('ellipsis-trigger'))).not.toContain('data:image/svg')
  })

  it('这一格与页码格子同高同基线，行高不因它是空的而塌', async () => {
    await mount()
    const ellipsis = part('ellipsis-trigger').getBoundingClientRect()
    const item = part('item').getBoundingClientRect()

    expect(ellipsis.height).toBeCloseTo(item.height, 1)
    expect(ellipsis.top).toBeCloseTo(item.top, 1)
    // 空着时曾是零宽的一格，现在由字形撑开
    expect(ellipsis.width).toBeGreaterThan(0)
  })
})
