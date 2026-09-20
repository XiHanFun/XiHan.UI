// @vitest-environment jsdom
import type { InfiniteScrollSchema } from '../src/infinite-scroll'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectInfiniteScroll, infiniteScrollMachine } from '../src/infinite-scroll'

type Props = InfiniteScrollSchema['props']
type Attrs = Record<string, unknown>

/** 起一台机器并接线，返回取当下 api 的函数与那份 onLoad 探针。 */
function mount(props: Props = {}) {
  const onLoad = vi.fn()
  const runtime = createVanillaRuntime()
  const service = createService(infiniteScrollMachine, {
    props: () => ({ ...props, onLoad }),
    runtime,
  })
  runtime.start()
  return { onLoad, api: () => connectInfiniteScroll(service, normalizeProps) }
}

function click(attrs: Attrs): void {
  ;(attrs.onClick as () => void)()
}

describe('取下一页的按钮', () => {
  it('等着触发的那一段：点它就报「该取下一页了」，与哨兵进可视区同一条通路', () => {
    const { api, onLoad } = mount()
    const trigger = api().getLoadMoreTriggerProps() as Attrs
    expect(trigger['data-part']).toBe('load-more-trigger')
    expect(trigger.type).toBe('button')
    expect(trigger.disabled).toBeUndefined()

    click(trigger)
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it('铺满一行的独立动作条目：投影 Action Control 的 row outline 档，档位固定 md', () => {
    const trigger = mount().api().getLoadMoreTriggerProps() as Attrs
    expect(trigger['data-xh-action-control']).toBe('')
    expect(trigger['data-xh-action-profile']).toBe('row')
    expect(trigger['data-xh-action-variant']).toBe('outline')
    expect(trigger['data-xh-action-display']).toBe('always')
    expect(trigger['data-xh-action-size']).toBe('md')
  })

  it('取数中：按钮停用，事件送到也不再报第二次', () => {
    const { api, onLoad } = mount({ loading: true })
    const trigger = api().getLoadMoreTriggerProps() as Attrs
    expect(trigger.disabled).toBe(true)
    expect(trigger['data-loading']).toBe('')

    click(trigger)
    expect(onLoad).not.toHaveBeenCalled()
  })

  it('关掉：按钮停用，事件送到也不再报', () => {
    const { api, onLoad } = mount({ disabled: true })
    const trigger = api().getLoadMoreTriggerProps() as Attrs
    expect(trigger.disabled).toBe(true)
    expect(trigger['data-disabled']).toBe('')

    click(trigger)
    expect(onLoad).not.toHaveBeenCalled()
  })

  it('文案由作者写在按钮里：组件不代填可及名字', () => {
    const trigger = mount().api().getLoadMoreTriggerProps() as Attrs
    expect(trigger['aria-label']).toBeUndefined()
  })
})

// ══ 按压通道 ══

const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (attrs: Attrs, name: string, event: unknown): void => (attrs[name] as (e: unknown) => void)(event)

/** 按压通道要盯 disabled / loading 的转段，props 走 signal 才会复查。 */
function mountPressable(initial: Props = {}) {
  const onLoad = vi.fn()
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onLoad })
  const service = createService(infiniteScrollMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    onLoad,
    trigger: () => connectInfiniteScroll(service, normalizeProps).getLoadMoreTriggerProps() as Attrs,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

describe('取下一页的按钮：按压通道', () => {
  it('keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路；不报取数', () => {
    const m = mountPressable()
    expect(m.trigger()['data-pressed']).toBeUndefined()
    fire(m.trigger(), 'onKeyDown', key(' '))
    expect(m.trigger()['data-pressed']).toBe('')
    fire(m.trigger(), 'onKeyUp', key(' '))
    expect(m.trigger()['data-pressed']).toBeUndefined()
    fire(m.trigger(), 'onKeyDown', key('Enter'))
    expect(m.trigger()['data-pressed']).toBe('')
    fire(m.trigger(), 'onBlur', {})
    expect(m.trigger()['data-pressed']).toBeUndefined()
    fire(m.trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(m.trigger()['data-pressed']).toBe('')
    fire(m.trigger(), 'onPointerCancel', {})
    expect(m.trigger()['data-pressed']).toBeUndefined()
    fire(m.trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(m.trigger()['data-pressed']).toBe('')
    fire(m.trigger(), 'onPointerUp', {})
    expect(m.trigger()['data-pressed']).toBeUndefined()
    fire(m.trigger(), 'onPointerDown', { pointerType: 'mouse' })
    expect(m.trigger()['data-pressed']).toBeUndefined()
    expect(m.onLoad).not.toHaveBeenCalled()
    m.stop()
  })

  it('取数中与关掉都不进；按住途中宿主写回 loading，按钮转原生 disabled、按压面由机器收，取完照常', () => {
    const busy = mountPressable({ loading: true })
    fire(busy.trigger(), 'onKeyDown', key(' '))
    expect(busy.trigger()['data-pressed']).toBeUndefined()
    busy.stop()
    const off = mountPressable({ disabled: true })
    fire(off.trigger(), 'onPointerDown', { pointerType: 'touch' })
    expect(off.trigger()['data-pressed']).toBeUndefined()
    off.stop()

    const m = mountPressable()
    fire(m.trigger(), 'onKeyDown', key('Enter'))
    expect(m.trigger()['data-pressed']).toBe('')
    // Enter 在 keydown 即 click 报出「该取下一页」，宿主随即写回 loading
    click(m.trigger())
    expect(m.onLoad).toHaveBeenCalledTimes(1)
    m.setProps({ loading: true })
    expect(m.trigger().disabled).toBe(true)
    expect(m.trigger()['data-pressed']).toBeUndefined()
    m.setProps({ loading: false })
    fire(m.trigger(), 'onKeyDown', key('Enter'))
    expect(m.trigger()['data-pressed']).toBe('')
    m.setProps({ disabled: true })
    expect(m.trigger()['data-pressed']).toBeUndefined()
    m.stop()
  })
})
