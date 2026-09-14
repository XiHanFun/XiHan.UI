// 上一页 / 下一页默认就是两枚箭头：不写内容时由皮肤画兜底字形。
//
// 只有真实浏览器量得出来：字形画在伪元素上，jsdom 的 getComputedStyle 不解析
// 伪元素里的 var()，量出来恒是空串。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
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

/** slotted 为真时作者自己往两个把手里塞内容，兜底字形就该让位。 */
async function mount(opts: { dir?: 'ltr' | 'rtl', slotted?: boolean } = {}) {
  host = document.createElement('div')
  if (opts.dir)
    host.setAttribute('dir', opts.dir)
  document.body.append(host)

  app = createApp({
    setup: () => () =>
      h(XhPaginationRoot, { count: 50, pageSize: 10, defaultPage: 3, dir: opts.dir }, () => [
        opts.slotted
          ? h(XhPaginationPrevTrigger, null, () => '上一页')
          : h(XhPaginationPrevTrigger),
        h(XhPaginationItem, { value: 3 }, () => '3'),
        opts.slotted
          ? h(XhPaginationNextTrigger, null, () => '下一页')
          : h(XhPaginationNextTrigger),
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

describe('上一页 / 下一页的兜底箭头', () => {
  it('不写内容时两个把手各画一枚箭头，且两枚不是同一张图', async () => {
    await mount()
    const prev = maskOf(part('prev-trigger'))
    const next = maskOf(part('next-trigger'))

    expect(prev).toContain('data:image/svg')
    expect(next).toContain('data:image/svg')
    // 同一张图说明左右指向没分开
    expect(prev).not.toBe(next)
  })

  it('字形盒与作者塞的图标同一把尺：--xh-icon-size 在 root 上声明了', async () => {
    await mount()
    const declared = getComputedStyle(part('root')).getPropertyValue('--xh-icon-size').trim()
    expect(declared).not.toBe('')

    const box = getComputedStyle(part('prev-trigger'), '::before')
    expect(Number.parseFloat(box.inlineSize)).toBeGreaterThan(0)
    expect(box.inlineSize).toBe(box.blockSize)
  })

  it('作者塞了文字就让位，不再画字形', async () => {
    await mount({ slotted: true })
    expect(part('prev-trigger').textContent).toBe('上一页')
    // :empty 不再命中，伪元素整个不存在
    expect(maskOf(part('prev-trigger'))).not.toContain('data:image/svg')
  })

  it('rtl 下两枚箭头对调，指向行进方向', async () => {
    await mount()
    const ltrPrev = maskOf(part('prev-trigger'))
    const ltrNext = maskOf(part('next-trigger'))

    app?.unmount()
    host?.remove()
    await mount({ dir: 'rtl' })

    expect(maskOf(part('prev-trigger'))).toBe(ltrNext)
    expect(maskOf(part('next-trigger'))).toBe(ltrPrev)
  })

  it('去掉文字后行高不变：三类格子仍共用同一副骨架', async () => {
    await mount()
    const prev = part('prev-trigger').getBoundingClientRect()
    const item = part('item').getBoundingClientRect()

    expect(prev.height).toBeCloseTo(item.height, 1)
    expect(prev.top).toBeCloseTo(item.top, 1)
  })
})
