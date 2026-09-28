// 滚动区的命令式滚动与两个通知：scrollTo 滚的是视口、orientation 没管的轴忽略；
// scroll-change 按轴报滚动量，reach-end 只在跨过末端那一下报。真实滚动与布局只有浏览器给得出。
import type { ScrollAreaScrollDetails, ScrollAreaScrollToOptions } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhScrollAreaContent, XhScrollAreaRoot, XhScrollAreaScrollbar, XhScrollAreaViewport } from '../../src'
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

interface Mounted {
  viewport: HTMLElement
  scrollTo: (options: ScrollAreaScrollToOptions) => void
  changes: ScrollAreaScrollDetails[]
  ends: ScrollAreaScrollDetails[]
}

async function mount(orientation: 'vertical' | 'both' = 'both'): Promise<Mounted> {
  host = document.createElement('div')
  document.body.append(host)
  const changes: ScrollAreaScrollDetails[] = []
  const ends: ScrollAreaScrollDetails[] = []
  const area = ref<{ scrollTo: Mounted['scrollTo'] } | null>(null)
  app = createApp({
    render: () => h(XhScrollAreaRoot, {
      ref: area,
      orientation,
      style: 'inline-size: 200px; block-size: 120px',
      onScrollChange: (details: ScrollAreaScrollDetails) => changes.push(details),
      onReachEnd: (details: ScrollAreaScrollDetails) => ends.push(details),
    }, () => [
      h(XhScrollAreaViewport, { style: 'block-size: 100%' }, () => h(XhScrollAreaContent, null, () =>
        h('div', { style: 'inline-size: 600px; block-size: 1000px' }, '长内容'))),
      h(XhScrollAreaScrollbar, { orientation: 'vertical' }),
      h(XhScrollAreaScrollbar, { orientation: 'horizontal' }),
    ]),
  })
  app.mount(host)
  await nextTick()
  await frames()
  const viewport = document.querySelector<HTMLElement>('[data-scope="scroll-area"][data-part="viewport"]')!
  return { viewport, scrollTo: options => area.value!.scrollTo(options), changes, ends }
}

/** 原生 scroll 事件在下一帧派发：等两帧让它落到机器里。 */
async function frames(): Promise<void> {
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

describe('scroll-area 命令式滚动与通知（Chromium）', () => {
  it('scrollTo 滚的是视口；scroll-change 按轴报滚动量', async () => {
    const t = await mount()
    t.scrollTo({ top: 50 })
    await frames()
    expect(t.viewport.scrollTop).toBe(50)
    const vertical = t.changes.filter(one => one.orientation === 'vertical')
    expect(vertical.at(-1)).toMatchObject({ orientation: 'vertical', offset: 50 })
    expect(vertical.at(-1)!.max).toBe(t.viewport.scrollHeight - t.viewport.clientHeight)
    // 竖向那一下不报横轴
    expect(t.changes.some(one => one.orientation === 'horizontal')).toBe(false)

    t.scrollTo({ left: 30 })
    await frames()
    expect(t.viewport.scrollLeft).toBe(30)
    expect(t.changes.at(-1)).toMatchObject({ orientation: 'horizontal', offset: 30 })
  })

  it('reach-end 只在跨过末端那一下报：停在末端再滚不重复，离开再回来才再报', async () => {
    const t = await mount()
    t.scrollTo({ top: 100000 })
    await frames()
    expect(t.ends).toHaveLength(1)
    expect(t.ends[0]).toMatchObject({ orientation: 'vertical' })
    expect(t.ends[0]!.offset).toBe(t.ends[0]!.max)

    t.scrollTo({ top: 100000 })
    await frames()
    expect(t.ends).toHaveLength(1)

    t.scrollTo({ top: 0 })
    await frames()
    t.scrollTo({ top: 100000 })
    await frames()
    expect(t.ends).toHaveLength(2)
  })

  it('orientation 没管的那条轴：scrollTo 忽略它，也不报它', async () => {
    const t = await mount('vertical')
    t.scrollTo({ top: 40, left: 40 })
    await frames()
    expect(t.viewport.scrollTop).toBe(40)
    expect(t.viewport.scrollLeft).toBe(0)
    expect(t.changes.every(one => one.orientation === 'vertical')).toBe(true)
  })

  it('用户自己滚（改 scrollTop）同样报，通知与原生滚动一一对应', async () => {
    const t = await mount()
    t.viewport.scrollTop = 120
    await frames()
    expect(t.changes.at(-1)).toMatchObject({ orientation: 'vertical', offset: 120 })
  })
})
