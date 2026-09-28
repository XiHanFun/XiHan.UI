// TagsInput 的计数是次级标注：取 12px 说明档 --xh-text-caption-size，不跟控件字号走，三个尺寸档都一样。
// 判据是计算样式，jsdom 不解析 var()。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTagsInputControl, XhTagsInputCount, XhTagsInputInput, XhTagsInputRoot } from '../../src'
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

describe.each(['sm', 'md', 'lg'] as const)('tags-input %s 档的计数', (size) => {
  it('取说明档字号', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhTagsInputRoot, { size, showCount: true, max: 5, defaultValue: ['甲'] }, () => [
        h(XhTagsInputControl, null, () => h(XhTagsInputInput)),
        h(XhTagsInputCount),
      ]),
    })
    app.mount(host)
    await nextTick()
    const count = host.querySelector<HTMLElement>(`[data-scope='tags-input'][data-part='count']`)!
    const probe = document.createElement('span')
    probe.style.fontSize = 'var(--xh-text-caption-size)'
    host.append(probe)
    expect(getComputedStyle(count).fontSize).toBe(getComputedStyle(probe).fontSize)
  })
})
