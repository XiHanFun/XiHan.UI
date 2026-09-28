// hover 档：预览是锚定在引用编号上的悬停卡片——指针停够才出现、落在编号旁边、不推动正文；
// 卡片开着时指向另一处引用直接切过去；一处多源时卡片里轮换来源。
// 卡片的落点、正文是否被推开只有真实布局量得出来。
import type { CitationSource } from '@xihan-ui/headless'
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCitationPositioner, XhCitationPreview, XhCitationRoot, XhCitationText, XhCitationTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

const sources: CitationSource[] = [
  { type: 'source-url', sourceId: 'report', title: '报告', url: 'https://example.com/report', anchors: [{ sourceId: 'report', quote: '共享原语可以减少产品之间的不一致。' }] },
  { type: 'source-url', sourceId: 'spec', title: '规范', url: 'https://example.com/spec', anchors: [{ sourceId: 'spec', quote: '可访问关系在读屏中必须仍可追踪。' }] },
]

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))

async function mount(props: Record<string, unknown> = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.style.paddingBlockStart = '40px'
  document.body.append(host)
  app = createApp({
    render: () => [
      h(XhCitationRoot, { sources, previewMode: 'hover', openDelay: 50, closeDelay: 50, ...props }, () => [
        h(XhCitationText, null, () => [
          '正文',
          h(XhCitationTrigger, { sourceId: 'report', citationId: 'c1' }, () => '1'),
          '再一句',
          h(XhCitationTrigger, { sourceId: 'spec', citationId: 'c2' }, () => '2'),
          '两处合引',
          h(XhCitationTrigger, { sourceIds: ['report', 'spec'], citationId: 'c3' }, () => '1, 2'),
        ]),
        h(XhCitationPositioner, null, () => [
          h(XhCitationPreview, { sourceId: 'report' }),
          h(XhCitationPreview, { sourceId: 'spec' }),
        ]),
      ]),
      h('p', { 'data-testid': 'after', 'style': 'margin:0' }, () => '后面的段落'),
    ],
  })
  app.mount(host)
  await nextTick()
  await frame()
  return host.querySelector<HTMLElement>('[data-testid="after"]')!
}

function trigger(index: number): HTMLElement {
  return host!.querySelectorAll<HTMLElement>(`[data-scope='citation'][data-part='trigger']`)[index]!
}

function positioner(): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='citation'][data-part='positioner']`)!
}

function shownPreview(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='citation'][data-part='preview'][data-state='open']`)
}

async function until(done: () => boolean, frames = 90): Promise<void> {
  for (let i = 0; i < frames && !done(); i++) await frame()
}

describe('citation 悬停卡片', () => {
  it('指针停够才出现，卡片落在引用编号下方、搬出正文，不推动后面的段落', async () => {
    const after = await mount()
    const before = after.getBoundingClientRect().top
    expect(positioner().hidden).toBe(true)

    await userEvent.hover(trigger(0))
    await until(() => positioner().hasAttribute('data-positioned'))
    const card = positioner().getBoundingClientRect()
    const anchor = trigger(0).getBoundingClientRect()
    expect(getComputedStyle(positioner()).position).toBe('fixed')
    // 缺省朝下：卡片上缘在编号下缘之下，隔着 offset
    expect(card.top).toBeGreaterThan(anchor.bottom)
    expect(card.top - anchor.bottom).toBeLessThan(24)
    // 卡片搬到了 portal 落点，不在根的子树里
    expect(host!.contains(positioner())).toBe(false)
    expect(after.getBoundingClientRect().top).toBe(before)
    expect(shownPreview()?.id).toContain('report')
  })

  it('卡片开着时指向另一处引用直接切过去，并跟着挪到那处编号旁', async () => {
    await mount({ openDelay: 400 })
    await userEvent.hover(trigger(0))
    await until(() => positioner().hasAttribute('data-positioned'), 120)
    await userEvent.hover(trigger(1))
    await nextTick()
    // 不再等 openDelay：同一帧里就换成了第二个来源
    expect(shownPreview()?.id).toContain('spec')
    await until(() => Math.abs(positioner().getBoundingClientRect().left - trigger(1).getBoundingClientRect().left) < 2 || false, 30)
    const card = positioner().getBoundingClientRect()
    const anchor = trigger(1).getBoundingClientRect()
    expect(card.top).toBeGreaterThan(anchor.bottom)
  })

  it('指针离开编号与卡片，等 closeDelay 后收起', async () => {
    const after = await mount()
    await userEvent.hover(trigger(0))
    await until(() => positioner().hasAttribute('data-positioned'))
    await userEvent.hover(after)
    await until(() => positioner().hidden, 120)
    expect(positioner().hidden).toBe(true)
  })

  it('一处多源：卡片里点下一个换到第二个来源，位置写着 2 / 2', async () => {
    await mount({ openDelay: 0 })
    trigger(2).click()
    await until(() => positioner().hasAttribute('data-positioned'))
    const next = shownPreview()!.querySelector<HTMLElement>(`[data-part='next-trigger']`)!
    expect(next).not.toBeNull()
    next.click()
    await nextTick()
    await frame()
    expect(shownPreview()?.id).toContain('spec')
    expect(shownPreview()?.querySelector(`[data-part='preview-index']`)?.textContent).toBe('2 / 2')
  })
})
