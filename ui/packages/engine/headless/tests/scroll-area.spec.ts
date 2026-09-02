// @vitest-environment jsdom
// 滚动区没有自己的机器：它是视口加两条 scrollbar 的组装。
// 这里只验组装那一层——轴的开关、占道、交叉口让位、props 透传；
// 滚动条自身的显隐、拖动、键盘与几何在 scrollbar.spec 里验。
import type { Orientation } from '@xihan-ui/kernel'
import type { ScrollAreaApi, ScrollAreaProps, ScrollAreaServices } from '../src/scroll-area'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectScrollArea, scrollAreaScrollbarProps } from '../src/scroll-area'
import { SCROLLBAR_HOST_ATTR, scrollbarMachine } from '../src/scrollbar'

type Dict = Record<string, unknown>

interface BoxSize {
  clientH: number
  clientW: number
  scrollH: number
  scrollW: number
}

/** jsdom 不做布局：四个尺寸桩在视口上，滚动量做成可读可写的。 */
function stubBox(el: HTMLElement, size: BoxSize): void {
  let top = 0
  let left = 0
  const maxTop = Math.max(0, size.scrollH - size.clientH)
  const maxLeft = Math.max(0, size.scrollW - size.clientW)
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => size.clientH },
    clientWidth: { configurable: true, get: () => size.clientW },
    scrollHeight: { configurable: true, get: () => size.scrollH },
    scrollWidth: { configurable: true, get: () => size.scrollW },
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = Math.min(Math.max(v, 0), maxTop) } },
    // RTL 横轴是负数，两端都要留
    scrollLeft: { configurable: true, get: () => left, set: (v: number) => { left = Math.min(Math.max(v, -maxLeft), maxLeft) } },
  })
}

function stubTrack(el: HTMLElement, axis: Orientation, length: number): void {
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => (axis === 'vertical' ? length : 10) },
    clientWidth: { configurable: true, get: () => (axis === 'vertical' ? 10 : length) },
  })
}

interface Rig {
  viewport: HTMLElement
  api: () => ScrollAreaApi
  setProps: (next: ScrollAreaProps) => void
  /** 作者写了哪几条滚动条；运行期增删模拟条件渲染 */
  written: Set<Orientation>
  stop: () => void
}

/**
 * 视口 100×100、内容 400×400（两轴都溢出）、两条轨道各 100。
 * 两台 scrollbar 机器共用这一个视口，与适配器的接法一致。
 */
function makeRig(initial: ScrollAreaProps = {}, size: BoxSize = { clientH: 100, clientW: 100, scrollH: 400, scrollW: 400 }, written: Set<Orientation> = new Set(['vertical', 'horizontal'])): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<ScrollAreaProps>(initial)
  const viewport = document.createElement('div')
  stubBox(viewport, size)
  document.body.append(viewport)

  const bar = (axis: Orientation): ScrollAreaServices[Orientation] => {
    const service = createService(scrollbarMachine, { props: () => scrollAreaScrollbarProps(props.get(), axis), runtime })
    const root = document.createElement('div')
    const track = document.createElement('div')
    stubTrack(track, axis, 100)
    root.append(track)
    document.body.append(root)
    service.refs.set('getScrollableEl', () => viewport)
    service.refs.set('getTrackEl', () => track)
    // 作者没写那条滚动条：根节点交不上来
    service.refs.set('getRootEl', () => (written.has(axis) ? root : null))
    return service
  }
  const services: ScrollAreaServices = { vertical: bar('vertical'), horizontal: bar('horizontal') }
  runtime.start()

  return {
    viewport,
    written,
    api: () => connectScrollArea(services, props.get(), normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
    stop: () => {
      runtime.stop()
      document.body.innerHTML = ''
    },
  }
}

/** 效应挂载与首次测量都推迟一拍，等它们跑完再断言。 */
async function settle(): Promise<void> {
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await new Promise<void>(resolve => queueMicrotask(resolve))
}

const rigs: Rig[] = []
function rig(initial?: ScrollAreaProps, size?: BoxSize, written?: Orientation[]): Rig {
  const r = makeRig(initial, size, written ? new Set(written) : undefined)
  rigs.push(r)
  return r
}

afterEach(() => {
  while (rigs.length) rigs.pop()!.stop()
})

describe('两条轴各是一台 scrollbar', () => {
  it('两台机器都挂在同一个视口上：一次滚动两条轴各自读到自己的量', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect(r.api().vertical).toMatchObject({ overflow: true, visible: true, size: 0.25, offset: 0 })
    expect(r.api().horizontal).toMatchObject({ overflow: true, visible: true, size: 0.25, offset: 0 })
    r.viewport.scrollTop = 150
    r.viewport.scrollLeft = 300
    r.viewport.dispatchEvent(new Event('scroll'))
    expect(r.api().vertical.offset).toBeCloseTo(0.375)
    expect(r.api().horizontal.offset).toBeCloseTo(0.75)
  })

  it('视口带自绘滚动条的标记，皮肤据此藏原生条；两条共用一个视口，计数到 2', async () => {
    const r = rig({ type: 'always' })
    await settle()
    expect(r.viewport.getAttribute(SCROLLBAR_HOST_ATTR)).toBe('2')
  })

  it('滑块的内联几何按轴取自各自那台机器', async () => {
    const r = rig({ type: 'always' })
    await settle()
    const v = (r.api().getThumbProps({ orientation: 'vertical' }) as Dict).style as Record<string, string>
    const h = (r.api().getThumbProps({ orientation: 'horizontal' }) as Dict).style as Record<string, string>
    expect(v.blockSize).toBe('25%')
    expect(v.inlineSize).toBe('')
    expect(h.inlineSize).toBe('25%')
    expect(h.blockSize).toBe('')
  })
})

describe('orientation 关掉的那条轴', () => {
  it('按禁用跑：即便溢出也不显形，视口那一向由皮肤按 data-orientation 关掉', async () => {
    const r = rig({ type: 'always', orientation: 'vertical' })
    await settle()
    expect(r.api().vertical.visible).toBe(true)
    expect(r.api().horizontal.visible).toBe(false)
    expect((r.api().getScrollbarProps({ orientation: 'horizontal' }) as Dict)['data-state']).toBe('hidden')
    expect((r.api().getViewportProps() as Dict)['data-orientation']).toBe('vertical')
    expect(scrollAreaScrollbarProps({ orientation: 'vertical' }, 'horizontal').disabled).toBe(true)
  })

  it('作者只写了竖条：横轴不算在场——不显形、不占道，竖条也不必让位', async () => {
    const r = rig({ type: 'always' }, undefined, ['vertical'])
    await settle()
    expect(r.api().vertical.visible).toBe(true)
    expect(r.api().horizontal.visible).toBe(false)
    const vp = r.api().getViewportProps() as Dict
    expect(vp['data-lane-vertical']).toBe('')
    expect(vp['data-lane-horizontal']).toBeUndefined()
    expect((r.api().getScrollbarProps({ orientation: 'vertical' }) as Dict)['data-gutter']).toBeUndefined()
    expect(r.api().cornerVisible).toBe(false)
  })

  it('运行期再写一条 / 拆掉一条：在场与否跟着节点走，不等下一次滚动', async () => {
    const r = rig({ type: 'always' }, undefined, ['vertical'])
    await settle()
    expect(r.api().horizontal.visible).toBe(false)
    r.written.add('horizontal')
    // 节点换了由依赖比对发现；测试运行时只在信号写入时比对
    r.setProps({})
    await settle()
    expect(r.api().horizontal.visible).toBe(true)
    expect((r.api().getViewportProps() as Dict)['data-lane-horizontal']).toBe('')
    expect((r.api().getScrollbarProps({ orientation: 'vertical' }) as Dict)['data-gutter']).toBe('')

    r.written.delete('horizontal')
    r.setProps({})
    await settle()
    expect(r.api().horizontal.visible).toBe(false)
    expect((r.api().getViewportProps() as Dict)['data-lane-horizontal']).toBeUndefined()
    expect((r.api().getScrollbarProps({ orientation: 'vertical' }) as Dict)['data-gutter']).toBeUndefined()
  })

  it('运行期改 orientation：另一条轴立刻跟着开关', async () => {
    const r = rig({ type: 'always', orientation: 'vertical' })
    await settle()
    r.setProps({ orientation: 'both' })
    expect(r.api().horizontal.visible).toBe(true)
  })
})

describe('占道、让位与交叉口', () => {
  it('always / auto 溢出时视口让出一条道；hover / scroll 浮在内容上不占', async () => {
    const always = rig({ type: 'always' })
    const hover = rig({ type: 'hover' })
    await settle()
    const lanes = (r: Rig): [unknown, unknown] => {
      const vp = r.api().getViewportProps() as Dict
      return [vp['data-lane-vertical'], vp['data-lane-horizontal']]
    }
    expect(lanes(always)).toEqual(['', ''])
    expect(lanes(hover)).toEqual([undefined, undefined])
  })

  it('缺省档浮在内容上：视口一条道都不让，宽度一点不减', async () => {
    const r = rig()
    await settle()
    const vp = r.api().getViewportProps() as Dict
    expect(r.api().type).toBe('scroll-hover')
    expect(vp['data-lane-vertical']).toBeUndefined()
    expect(vp['data-lane-horizontal']).toBeUndefined()
  })

  it('auto：只有溢出的那条轴占道', async () => {
    const r = rig({ type: 'auto' }, { clientH: 100, clientW: 100, scrollH: 400, scrollW: 100 })
    await settle()
    const vp = r.api().getViewportProps() as Dict
    expect(vp['data-lane-vertical']).toBe('')
    expect(vp['data-lane-horizontal']).toBeUndefined()
  })

  it('两条都溢出才互相让出交叉口、补丁才在场；只有一条时不让、补丁也收起', async () => {
    const both = rig({ type: 'always' })
    const one = rig({ type: 'auto' }, { clientH: 100, clientW: 100, scrollH: 400, scrollW: 100 })
    await settle()
    expect((both.api().getScrollbarProps({ orientation: 'vertical' }) as Dict)['data-gutter']).toBe('')
    expect((both.api().getScrollbarProps({ orientation: 'horizontal' }) as Dict)['data-gutter']).toBe('')
    expect(both.api().cornerVisible).toBe(true)
    expect((both.api().getCornerProps() as Dict).hidden).toBeUndefined()

    expect((one.api().getScrollbarProps({ orientation: 'vertical' }) as Dict)['data-gutter']).toBeUndefined()
    expect(one.api().cornerVisible).toBe(false)
    expect((one.api().getCornerProps() as Dict).hidden).toBe(true)
  })

  it('hover 档：让位按溢出算，指针进出只翻显形，不让长度在淡出里跳', async () => {
    const r = rig({ type: 'hover' })
    await settle()
    const gutters = (): [unknown, unknown] => [
      (r.api().getScrollbarProps({ orientation: 'vertical' }) as Dict)['data-gutter'],
      (r.api().getScrollbarProps({ orientation: 'horizontal' }) as Dict)['data-gutter'],
    ]
    expect(r.api().vertical.visible).toBe(false)
    expect(gutters()).toEqual(['', ''])
    expect((r.api().getCornerProps() as Dict).hidden).toBeUndefined()
    expect((r.api().getCornerProps() as Dict)['data-state']).toBe('hidden')
    r.viewport.dispatchEvent(new PointerEvent('pointerenter'))
    expect(r.api().vertical.visible).toBe(true)
    expect(gutters()).toEqual(['', ''])
    expect((r.api().getCornerProps() as Dict)['data-state']).toBe('visible')
  })

  it('挂载点戴滚动区的 scope，轨道与滑块戴 scrollbar 的 scope：两个组件共用一份滚动条', async () => {
    const r = rig({ type: 'always' })
    await settle()
    const mount = r.api().getScrollbarProps({ orientation: 'vertical' }) as Dict
    expect(mount['data-scope']).toBe('scroll-area')
    expect(mount['data-part']).toBe('scrollbar')
    expect(mount['aria-hidden']).toBe(true)
    expect((r.api().getTrackProps({ orientation: 'vertical' }) as Dict)['data-scope']).toBe('scrollbar')
    expect((r.api().getThumbProps({ orientation: 'vertical' }) as Dict)['data-part']).toBe('thumb')
    expect((r.api().getCornerProps() as Dict)['data-scope']).toBe('scrollbar')
  })
})

describe('props 原样交给两台机器', () => {
  it('type / hideDelay / size / dir / forceVisible 透传，orientation 按轴拆', () => {
    const props: ScrollAreaProps = { type: 'scroll', hideDelay: 250, size: 'lg', dir: 'rtl', forceVisible: true }
    expect(scrollAreaScrollbarProps(props, 'horizontal')).toEqual({
      orientation: 'horizontal',
      type: 'scroll',
      hideDelay: 250,
      size: 'lg',
      dir: 'rtl',
      forceVisible: true,
      disabled: false,
    })
  })

  it('根与挂载点都带 size 与 type，皮肤按同一个数换厚度', async () => {
    const r = rig({ type: 'auto', size: 'sm' })
    await settle()
    expect((r.api().getRootProps() as Dict)['data-size']).toBe('sm')
    expect((r.api().getRootProps() as Dict)['data-reveal-mode']).toBe('auto')
    expect((r.api().getScrollbarProps({ orientation: 'vertical' }) as Dict)['data-size']).toBe('sm')
  })

  it('rtl：横轴滚动量写回时取负，读出来仍是逻辑距离', async () => {
    const r = rig({ type: 'always', dir: 'rtl' })
    await settle()
    r.viewport.scrollLeft = -150
    r.viewport.dispatchEvent(new Event('scroll'))
    expect(r.api().horizontal.offset).toBeCloseTo(0.375)
  })
})
