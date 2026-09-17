// 标签的形状身份：根是状态 chip，取胶囊；关闭钮是随文标记档的 16px 正方盒，取 inset 4px（与 checkbox 系方框同档）。
// 三档与四种形态都是同一身份，作者槽 --xh-tag-radius / --xh-tag-close-radius 仍能覆盖。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Tier = 'sm' | 'md' | 'lg'
type Variant = 'solid' | 'subtle' | 'outline' | 'ghost'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function mount(render: () => VNode, style?: string): Promise<void> {
  host = document.createElement('div')
  if (style)
    host.setAttribute('style', style)
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='tag'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 tag 的 ${name}`)
  return el
}

function tag(props: { size?: Tier, variant?: Variant }): VNode {
  return h(XhTagRoot, { closable: true, ...props }, () => [h(XhTagLabel, null, () => '标签'), h(XhTagCloseTrigger)])
}

describe('标签的形状身份', () => {
  it.each<Tier>(['sm', 'md', 'lg'])('%s 档：根是胶囊，圆角不小于半高；关闭钮是 inset 4px 的正方盒', async (size) => {
    await mount(() => tag({ size }))
    const root = part('root')
    const close = part('close-trigger')

    expect(Number.parseFloat(getComputedStyle(root).borderTopLeftRadius)).toBeGreaterThanOrEqual(root.getBoundingClientRect().height / 2)
    expect(getComputedStyle(close).borderTopLeftRadius).toBe('4px')
    expect(close.getBoundingClientRect().width).toBe(close.getBoundingClientRect().height)
  })

  it.each<Variant>(['solid', 'subtle', 'outline', 'ghost'])('%s 形态不改变胶囊身份', async (variant) => {
    await mount(() => tag({ variant }))
    const root = part('root')
    expect(Number.parseFloat(getComputedStyle(root).borderTopLeftRadius)).toBeGreaterThanOrEqual(root.getBoundingClientRect().height / 2)
  })

  it('作者槽仍能把根与关闭钮的圆角改回去', async () => {
    await mount(() => tag({}), '--xh-tag-radius: 3px; --xh-tag-close-radius: 2px')
    expect(getComputedStyle(part('root')).borderTopLeftRadius).toBe('3px')
    expect(getComputedStyle(part('close-trigger')).borderTopLeftRadius).toBe('2px')
  })
})
