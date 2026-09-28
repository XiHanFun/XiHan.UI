// 角标离角多远由两个组件槽微调：正值朝行内末端、块末端挪，四个角同一个值朝同一个方向，RTL 下行内末端在左。
// 落点是布局几何，只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhBadge } from '../../src'
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

type Placement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'

async function indicatorRect(placement: Placement, offset: { inline?: string, block?: string } = {}, dir: 'ltr' | 'rtl' = 'ltr'): Promise<DOMRect> {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  host.dir = dir
  host.style.padding = '32px'
  document.body.append(host)
  const style: Record<string, string> = {}
  if (offset.inline)
    style['--xh-badge-offset-inline'] = offset.inline
  if (offset.block)
    style['--xh-badge-offset-block'] = offset.block
  app = createApp({
    render: () => h(XhBadge, { count: 3, placement, style }, () => h('span', { style: 'display:block;inline-size:40px;block-size:40px' })),
  })
  app.mount(host)
  await nextTick()
  return document.querySelector<HTMLElement>('[data-scope="badge"][data-part="indicator"]')!.getBoundingClientRect()
}

describe('badge 偏移槽（Chromium）', () => {
  it.each(['top-end', 'top-start', 'bottom-end', 'bottom-start'] as const)('%s：正值朝右下挪，挪多少就是多少', async (placement) => {
    const base = await indicatorRect(placement)
    const moved = await indicatorRect(placement, { inline: '6px', block: '4px' })
    expect(moved.left - base.left).toBeCloseTo(6, 1)
    expect(moved.top - base.top).toBeCloseTo(4, 1)
  })

  it('rtl：行内末端在左，正的行内偏移朝左挪', async () => {
    const base = await indicatorRect('top-end', {}, 'rtl')
    const moved = await indicatorRect('top-end', { inline: '6px' }, 'rtl')
    expect(moved.left - base.left).toBeCloseTo(-6, 1)
    expect(moved.top - base.top).toBeCloseTo(0, 1)
  })

  it('不写槽时落点不变：角标仍探出宿主四分之一', async () => {
    const rect = await indicatorRect('top-end')
    const root = document.querySelector<HTMLElement>('[data-scope="badge"][data-part="root"]')!.getBoundingClientRect()
    expect(rect.right - root.right).toBeCloseTo(rect.width / 4, 0)
    expect(root.top - rect.top).toBeCloseTo(rect.height / 4, 0)
  })
})
