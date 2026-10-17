/** @vitest-environment jsdom */
// scrollContainer: ancestor —— 滚的是视口最近的可滚动祖先：视口不占 Tab 位，列表起点按祖先里的位置现量，找不到祖先时随整页滚。
import type { VirtualizerSchema } from '../src/virtualizer'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectVirtualizer, virtualizerMachine } from '../src/virtualizer'

type Props = VirtualizerSchema['props']
type Dict = Record<string, unknown>

const LIST: Props = { count: 1000, estimateSize: 30, overscan: 0, scrollContainer: 'ancestor' }

function rect(top: number, height: number): DOMRect {
  return { x: 0, y: top, top, left: 0, width: 200, height, right: 200, bottom: top + height, toJSON: () => ({}) } as DOMRect
}

interface Rig {
  container: HTMLElement
  api: () => ReturnType<typeof connectVirtualizer>
  scroll: (top: number) => void
  stop: () => void
}

/**
 * 祖先是一个 100 高、自己滚的盒子；列表前面压着 40 高的表头。
 * jsdom 不做布局：滚动量、尺寸与两者的相对位置都按这份几何桩出来。
 */
function rig(props: Props = LIST, scrollable = true): Rig {
  const runtime = createVanillaRuntime()
  const signal = runtime.signal<Props>(props)
  const service = createService(virtualizerMachine, { props: () => signal.get(), runtime })

  const container = document.createElement('div')
  if (scrollable)
    container.style.overflowY = 'auto'
  const header = document.createElement('div')
  const root = document.createElement('div')
  const viewport = document.createElement('div')
  const content = document.createElement('div')
  viewport.append(content)
  root.append(viewport)
  container.append(header, root)
  document.body.append(container)

  let top = 0
  Object.defineProperties(container, {
    clientHeight: { configurable: true, get: () => 100 },
    clientWidth: { configurable: true, get: () => 200 },
    offsetHeight: { configurable: true, get: () => 100 },
    offsetWidth: { configurable: true, get: () => 200 },
    scrollHeight: { configurable: true, get: () => 40 + service.context.get('snapshot').totalSize },
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = v } },
  })
  container.scrollTo = ((options: { top?: number }) => {
    if (options.top != null) {
      top = options.top
      container.dispatchEvent(new Event('scroll'))
    }
  }) as HTMLElement['scrollTo']
  container.getBoundingClientRect = () => rect(0, 100)
  // 列表起点在表头之下：跟着祖先的滚动量往上走
  viewport.getBoundingClientRect = () => rect(40 - top, 30000)

  service.refs.set('getViewportEl', () => viewport)
  service.refs.set('getContentEl', () => content)
  runtime.start()

  return {
    container,
    api: () => connectVirtualizer(service, normalizeProps),
    scroll: (next) => {
      top = next
      container.dispatchEvent(new Event('scroll'))
    },
    stop: () => {
      runtime.stop()
      container.remove()
    },
  }
}

const rigs: Rig[] = []
function open(props?: Props, scrollable?: boolean): Rig {
  const r = rig(props, scrollable)
  rigs.push(r)
  return r
}

afterEach(() => {
  while (rigs.length) rigs.pop()!.stop()
  vi.restoreAllMocks()
})

async function settle(): Promise<void> {
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await new Promise<void>(resolve => queueMicrotask(resolve))
}

describe('scrollContainer: ancestor', () => {
  it('视口与根写 data-scroll-container="ancestor"，视口不占 Tab 位；交出的桥报 ancestor', async () => {
    const r = open()
    await settle()
    const viewport = r.api().getViewportProps() as Dict
    expect(viewport['data-scroll-container']).toBe('ancestor')
    expect(viewport.tabindex).toBeUndefined()
    expect((r.api().getRootProps() as Dict)['data-scroll-container']).toBe('ancestor')
    expect(r.api().collectionVirtualizer.scrollContainer).toBe('ancestor')
  })

  it('跟着祖先的滚动换窗口，列表起点（表头那 40）计进滚动坐标', async () => {
    const r = open()
    await settle()
    expect(r.api().startIndex).toBe(0)
    // 祖先滚 340 = 表头 40 + 第 10 条起点 300
    r.scroll(340)
    expect(r.api().startIndex).toBe(10)
  })

  it('scrollToIndex 写的是祖先的滚动量，加上列表起点', async () => {
    const r = open()
    await settle()
    r.api().scrollToIndex(20)
    expect(r.container.scrollTop).toBe(40 + 20 * 30)
  })

  it('一路找不到可滚动的祖先就随整页滚：scrollToIndex 写到 window', async () => {
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const r = open(LIST, false)
    await settle()
    r.api().scrollToIndex(5)
    expect(spy).toHaveBeenCalled()
  })

  it('viewport 形态照旧：视口占 Tab 位，不写 data-scroll-container，桥报 viewport', async () => {
    const r = open({ ...LIST, scrollContainer: undefined })
    await settle()
    const viewport = r.api().getViewportProps() as Dict
    expect(viewport.tabindex).toBe(0)
    expect(viewport['data-scroll-container']).toBeUndefined()
    expect((r.api().getRootProps() as Dict)['data-scroll-container']).toBeUndefined()
    expect(r.api().collectionVirtualizer.scrollContainer).toBe('viewport')
  })
})
