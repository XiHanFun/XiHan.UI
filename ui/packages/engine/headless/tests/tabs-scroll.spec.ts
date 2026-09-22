// @vitest-environment jsdom
// 标签带放不下时的位移：放不放得下的量测、两端翻页钮的显隐与禁用、滚轮、把选中 / 聚焦的标签挪进视野。
// jsdom 不排版，排布几何（offsetLeft / offsetWidth / clientWidth）逐个打上；补间按减弱动效一步到位。
import type { TabsSchema } from '../src/tabs'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { setMotionOverride } from '@xihan-ui/motion'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { connectTabs, tabsMachine } from '../src/tabs'

type Dict = Record<string, unknown>

const COLLECTION = ['a', 'b', 'c', 'd', 'e'].map(value => ({ value, label: value }))

/** 每枚标签在主轴上占 100，首尾相接；标签带只露得出 250。 */
const SPAN = 100
const VIEWPORT = 250

function geometry(el: HTMLElement, values: Partial<Record<'offsetLeft' | 'offsetTop' | 'offsetWidth' | 'offsetHeight' | 'clientWidth' | 'clientHeight', number>>): void {
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(el, key, { configurable: true, value })
}

function mount(props: Partial<TabsSchema['props']> = {}, options: { viewport?: number, arrows?: boolean } = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(tabsMachine, {
    runtime,
    props: () => ({ collection: COLLECTION, defaultValue: 'a', ...props }) as TabsSchema['props'],
  })
  runtime.start()

  const list = document.createElement('div')
  list.setAttribute('data-scope', 'tabs')
  list.setAttribute('data-part', 'list')
  const horizontal = (props.orientation ?? 'horizontal') === 'horizontal'
  const viewport = options.viewport ?? VIEWPORT
  geometry(list, horizontal ? { clientWidth: viewport, clientHeight: 36 } : { clientWidth: 120, clientHeight: viewport })

  const part = (name: string, tag = 'button'): HTMLElement => {
    const el = document.createElement(tag)
    el.setAttribute('data-scope', 'tabs')
    el.setAttribute('data-part', name)
    return el
  }
  // 翻页钮是与标签同高的正方形；放得下时收起（两边都是 0）
  const prev = part('prev-trigger')
  const next = part('next-trigger')
  if (options.arrows !== false) {
    geometry(prev, { offsetWidth: 36, offsetHeight: 36 })
    geometry(next, { offsetWidth: 36, offsetHeight: 36 })
    list.append(prev)
  }
  COLLECTION.forEach((node, i) => {
    const el = part('trigger')
    el.setAttribute('data-value', node.value)
    // rtl 横排里 DOM 首项排在最右：位置按倒序给
    const slot = horizontal && props.dir === 'rtl' ? COLLECTION.length - 1 - i : i
    geometry(el, horizontal
      ? { offsetLeft: slot * SPAN, offsetTop: 0, offsetWidth: SPAN, offsetHeight: 36 }
      : { offsetLeft: 0, offsetTop: slot * SPAN, offsetWidth: 120, offsetHeight: SPAN })
    list.append(el)
  })
  if (options.arrows !== false)
    list.append(next)
  document.body.append(list)
  service.refs.set('getListEl', () => list)

  return {
    service,
    list,
    api: () => connectTabs(service, normalizeProps),
    scroll: () => service.context.get('scroll'),
    scrollMax: () => service.context.get('scrollMax'),
    /** 让机器量一次标签带（真实宿主由 ResizeObserver / 首帧触发） */
    measure: () => window.dispatchEvent(new Event('resize')),
  }
}

function wheel(t: ReturnType<typeof mount>, init: Partial<WheelEvent>): { preventDefault: ReturnType<typeof vi.fn> } {
  const preventDefault = vi.fn()
  const handler = (t.api().getListProps() as Dict).onWheel as (e: WheelEvent) => void
  handler({ deltaX: 0, deltaY: 0, deltaMode: 0, shiftKey: false, ...init, preventDefault } as unknown as WheelEvent)
  return { preventDefault }
}

beforeEach(() => {
  document.body.innerHTML = ''
  setMotionOverride('reduce')
})

afterEach(() => {
  setMotionOverride(null)
})

describe('标签页 · 放得下', () => {
  it('内容不超出可见长度：overflow 为 null，两端翻页钮 hidden 且禁用，位移槽写 0', () => {
    const t = mount({}, { viewport: 600 })
    t.measure()
    const api = t.api()
    expect(api.overflow).toBeNull()
    const prev = api.getPrevTriggerProps() as Dict
    const next = api.getNextTriggerProps() as Dict
    expect(prev.hidden).toBe(true)
    expect(next.hidden).toBe(true)
    expect(prev.disabled).toBe(true)
    expect((api.getListProps() as Dict).style).toEqual({ '--xh-_tabs-scroll': '0px' })
  })

  it('翻页钮不占 Tab 位、对读屏隐藏，接 Action Control icon 档', () => {
    const t = mount()
    const prev = t.api().getPrevTriggerProps() as Dict
    expect(prev.type).toBe('button')
    expect(prev.tabIndex).toBe(-1)
    expect(prev['aria-hidden']).toBe(true)
    expect(prev['data-xh-action-control']).toBe('')
    expect(prev['data-xh-action-profile']).toBe('icon')
    expect(prev['data-xh-action-variant']).toBe('ghost')
    expect(prev['data-xh-action-size']).toBe('md')
  })

  it('滚轮不拦：放得下时事件放行给页面', () => {
    const t = mount({}, { viewport: 600 })
    t.measure()
    const { preventDefault } = wheel(t, { deltaX: 40 })
    expect(preventDefault).not.toHaveBeenCalled()
    expect(t.scroll()).toBe(0)
  })
})

describe('标签页 · 放不下', () => {
  it('内容超出可见长度：overflow 记两端，起头只有结束侧还有标签，往前的钮禁用、往后的可用', () => {
    const t = mount()
    t.measure()
    expect(t.scrollMax()).toBe(COLLECTION.length * SPAN - VIEWPORT)
    const api = t.api()
    expect(api.overflow).toEqual({ start: false, end: true })
    const prev = api.getPrevTriggerProps() as Dict
    const next = api.getNextTriggerProps() as Dict
    expect(prev.hidden).toBeUndefined()
    expect(prev.disabled).toBe(true)
    expect(prev['data-disabled']).toBe('')
    expect(next.disabled).toBeUndefined()
    expect(next['data-disabled']).toBeUndefined()
  })

  it('往后翻一页挪可见长度的八成，翻到头夹在上限；位移写成负的 translate 量', () => {
    const t = mount()
    t.measure()
    t.service.send({ type: 'SCROLL.NEXT' })
    expect(t.scroll()).toBe(VIEWPORT * 0.8)
    expect(t.api().overflow).toEqual({ start: true, end: true })
    expect((t.api().getListProps() as Dict).style).toEqual({ '--xh-_tabs-scroll': `-${VIEWPORT * 0.8}px` })

    t.service.send({ type: 'SCROLL.NEXT' })
    expect(t.scroll()).toBe(t.scrollMax())
    expect(t.api().overflow).toEqual({ start: true, end: false })
    expect((t.api().getNextTriggerProps() as Dict).disabled).toBe(true)

    t.service.send({ type: 'SCROLL.PREV' })
    t.service.send({ type: 'SCROLL.PREV' })
    expect(t.scroll()).toBe(0)
  })

  it('rtl 横排：位移量写成正的 translate（标签带往右挪）', () => {
    const t = mount({ dir: 'rtl' })
    t.measure()
    t.service.send({ type: 'SCROLL.NEXT' })
    expect((t.api().getListProps() as Dict).style).toEqual({ '--xh-_tabs-scroll': `${VIEWPORT * 0.8}px` })
  })

  it('横向滚轮按滚了多少挪多少并拦掉页面滚动；竖滚轮留给页面，按住 Shift 的竖滚轮才算', () => {
    const t = mount()
    t.measure()
    expect(wheel(t, { deltaX: 40 }).preventDefault).toHaveBeenCalledOnce()
    expect(t.scroll()).toBe(40)
    expect(wheel(t, { deltaY: 40 }).preventDefault).not.toHaveBeenCalled()
    expect(t.scroll()).toBe(40)
    expect(wheel(t, { deltaY: 30, shiftKey: true }).preventDefault).toHaveBeenCalledOnce()
    expect(t.scroll()).toBe(70)
    // 往回滚到头再往回：放行
    wheel(t, { deltaX: -100 })
    expect(t.scroll()).toBe(0)
    expect(wheel(t, { deltaX: -10 }).preventDefault).not.toHaveBeenCalled()
  })

  it('rtl 横排的滚轮方向翻过来：往左滚是朝结束端', () => {
    const t = mount({ dir: 'rtl' })
    t.measure()
    wheel(t, { deltaX: -40 })
    expect(t.scroll()).toBe(40)
  })

  it('选中值换到被裁掉的标签上：标签带挪过去，让它整个露在结束侧翻页钮里侧', () => {
    const t = mount()
    t.measure()
    t.service.send({ type: 'VALUE.SET', value: 'd' })
    // d 的终点在 400；可见区终点 = 位移 + 250 - 36（翻页钮）
    expect(t.scroll()).toBe(400 - (VIEWPORT - 36))
    // 挪回起头的标签：起点对齐起始侧翻页钮里侧
    t.service.send({ type: 'VALUE.SET', value: 'a' })
    expect(t.scroll()).toBe(0)
  })

  it('焦点走到被裁掉的标签上同样挪过去；已经整个在视野里的不动', () => {
    const t = mount()
    t.measure()
    t.service.send({ type: 'TRIGGER.FOCUS', value: 'e' })
    expect(t.scroll()).toBe(t.scrollMax())
    const before = t.scroll()
    t.service.send({ type: 'TRIGGER.FOCUS', value: 'd' })
    expect(t.scroll()).toBe(before)
  })

  it('没放翻页钮时可见区就是整条标签带', () => {
    const t = mount({}, { arrows: false })
    t.measure()
    t.service.send({ type: 'VALUE.SET', value: 'c' })
    expect(t.scroll()).toBe(300 - VIEWPORT)
  })

  it('外层变宽到放得下：上限归零，已有的位移夹回 0，翻页钮收起', () => {
    const t = mount()
    t.measure()
    t.service.send({ type: 'SCROLL.NEXT' })
    expect(t.scroll()).toBeGreaterThan(0)
    geometry(t.list, { clientWidth: 600 })
    t.measure()
    expect(t.scrollMax()).toBe(0)
    expect(t.scroll()).toBe(0)
    expect((t.api().getPrevTriggerProps() as Dict).hidden).toBe(true)
  })

  it('竖排量块轴：位移写在 translate 的块向分量上', () => {
    const t = mount({ orientation: 'vertical' })
    t.measure()
    expect(t.scrollMax()).toBe(COLLECTION.length * SPAN - VIEWPORT)
    t.service.send({ type: 'SCROLL.NEXT' })
    expect((t.api().getListProps() as Dict).style).toEqual({ '--xh-_tabs-scroll': `-${VIEWPORT * 0.8}px` })
    expect((t.api().getPrevTriggerProps() as Dict)['data-orientation']).toBe('vertical')
  })
})

describe('标签页 · 指示条按排布几何量', () => {
  it('指示条量的是 offset 几何，标签带挪了它的落点也不变', () => {
    const t = mount()
    t.measure()
    t.service.send({ type: 'VALUE.SET', value: 'b' })
    const style = (t.api().getIndicatorProps() as Dict).style as Record<string, string>
    expect(style['--xh-_tabs-indicator-x']).toBe('100px')
    expect(style['--xh-_tabs-indicator-w']).toBe('100px')
    t.service.send({ type: 'SCROLL.NEXT' })
    expect(((t.api().getIndicatorProps() as Dict).style as Record<string, string>)['--xh-_tabs-indicator-x']).toBe('100px')
  })
})
