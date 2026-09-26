import type { TooltipOpenChangeDetails, TooltipSchema } from '../src/tooltip'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectTooltip, TOOLTIP_DEFAULT_PLACEMENT, tooltipMachine } from '../src/tooltip'

type Props = TooltipSchema['props']

/** 定位引擎与层栈都缺省（无布局环境）：机器照常转移，只是不产出坐标、不入栈。 */
function makeTooltip(initial: Props = {}) {
  const changes: TooltipOpenChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onOpenChange: d => changes.push(d) })
  const service = createService(tooltipMachine, { props: () => props.get(), runtime })
  runtime.start()
  const api = () => connectTooltip(service, normalizeProps)
  return {
    service,
    changes,
    api,
    state: () => service.state.get(),
    trigger: () => api().getTriggerProps() as Record<string, unknown>,
    content: () => api().getContentProps() as Record<string, unknown>,
    send: (type: TooltipSchema['event']['type']) => service.send({ type } as TooltipSchema['event']),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('tooltipMachine 起步', () => {
  it('缺省 closed；defaultOpen 起步可见；open 压过 defaultOpen', () => {
    expect(makeTooltip().state()).toBe('closed')
    expect(makeTooltip({ defaultOpen: true }).api().open).toBe(true)
    expect(makeTooltip({ open: false, defaultOpen: true }).api().open).toBe(false)
  })
})

describe('connectTooltip 投影', () => {
  it('收起时 trigger 不指向隐藏的浮层，content 是 role=tooltip 且 hidden + inert + aria-hidden；展开后 describedby 接上', () => {
    const t = makeTooltip()
    expect(t.trigger()).toMatchObject({ 'type': 'button', 'data-state': 'closed' })
    expect(t.trigger()['aria-describedby']).toBeUndefined()
    expect(t.content()).toMatchObject({ 'role': 'tooltip', 'hidden': true, 'inert': true, 'aria-hidden': true, 'data-state': 'closed' })

    t.send('OPEN')
    expect(t.trigger()['aria-describedby']).toBe(t.content().id)
    expect(t.content().hidden).toBeUndefined()
    expect(t.content().inert).toBeUndefined()
    expect(t.content()['aria-hidden']).toBeUndefined()
    t.stop()
  })

  it('没有 root 部件：两轴落在 content 上；positioner 与 arrow 自报朝向，没算出坐标前不露面', () => {
    const t = makeTooltip({ tone: 'brand', size: 'sm', placement: 'right' })
    // 反白面是一块彩色面：content 恒投影 data-xh-ink-surface，面内的内容成为墨色域
    expect(t.content()).toMatchObject({ 'data-tone': 'brand', 'data-size': 'sm', 'data-xh-ink-surface': '' })
    const positioner = t.api().getPositionerProps() as Record<string, unknown>
    expect(positioner).toMatchObject({ 'data-placement': 'right', 'data-state': 'closed' })
    expect(positioner['data-positioned']).toBeUndefined()
    expect(positioner.dir).toBeUndefined()
    expect(t.api().getArrowProps()).toMatchObject({ 'aria-hidden': true, 'data-placement': 'right' })
    expect((makeTooltip().api().getPositionerProps() as Record<string, unknown>)['data-placement']).toBe(TOOLTIP_DEFAULT_PLACEMENT)
    t.stop()
  })

  it('disabled 只打标记：不输出原生 disabled，被包裹的控件仍可用；悬停与聚焦都不再展开', () => {
    const t = makeTooltip({ disabled: true })
    expect(t.trigger()).toMatchObject({ 'data-disabled': '' })
    expect(t.trigger().disabled).toBeUndefined()
    expect(t.trigger()['aria-disabled']).toBeUndefined()
    t.send('POINTER.ENTER')
    expect(t.state()).toBe('closed')
    t.send('FOCUS')
    expect(t.state()).toBe('closed')
    expect(t.changes).toEqual([])
    t.stop()
  })
})

describe('tooltipMachine 悬停', () => {
  it('指针进入先等 openDelay 才展开；等待期移出、按下或 Escape 就地撤销，不通知', () => {
    vi.useFakeTimers()
    const t = makeTooltip({ openDelay: 100 })
    t.send('POINTER.ENTER')
    expect(t.state()).toBe('opening')
    t.send('POINTER.LEAVE')
    expect(t.state()).toBe('closed')

    t.send('POINTER.ENTER')
    vi.advanceTimersByTime(99)
    expect(t.api().open).toBe(false)
    vi.advanceTimersByTime(1)
    expect(t.api().open).toBe(true)
    expect(t.changes).toEqual([{ open: true }])
    t.stop()
  })

  it('等待期 Escape 由 trigger 就地撤销；可见后 trigger 不再接 Escape，交给消解层', () => {
    vi.useFakeTimers()
    const t = makeTooltip({ openDelay: 100 })
    t.send('POINTER.ENTER')
    ;(t.trigger().onKeydown as (e: { key: string }) => void)({ key: 'Escape' })
    expect(t.state()).toBe('closed')

    t.send('OPEN')
    ;(t.trigger().onKeydown as (e: { key: string }) => void)({ key: 'Escape' })
    expect(t.api().open).toBe(true)
    t.stop()
  })

  it('移出先等 closeDelay 再收起，途中指针回到浮层即撤销收起；按下立刻收起', () => {
    vi.useFakeTimers()
    const t = makeTooltip({ openDelay: 0, closeDelay: 100 })
    t.send('OPEN')
    t.send('POINTER.LEAVE')
    expect(t.state()).toBe('visible.closing')
    expect(t.api().open).toBe(true)
    ;(t.content().onPointerenter as () => void)()
    expect(t.state()).toBe('visible.open')

    t.send('POINTER.LEAVE')
    vi.advanceTimersByTime(100)
    expect(t.state()).toBe('closed')
    expect(t.changes).toEqual([{ open: true }, { open: false }])

    t.send('OPEN')
    t.send('POINTER.DOWN')
    expect(t.state()).toBe('closed')
    t.stop()
  })
})

describe('tooltipMachine 焦点', () => {
  it('聚焦立刻展开不等延时；由焦点打开的浮层不随指针移出收起，失焦才收', () => {
    const t = makeTooltip({ openDelay: 500 })
    t.send('FOCUS')
    expect(t.api().open).toBe(true)
    t.send('POINTER.LEAVE')
    expect(t.state()).toBe('visible.open')
    t.send('BLUR')
    expect(t.state()).toBe('closed')
    expect(t.changes).toEqual([{ open: true }, { open: false }])
    t.stop()
  })

  it('由指针打开的浮层，聚焦后再移出照样进入收起等待', () => {
    vi.useFakeTimers()
    const t = makeTooltip({ openDelay: 0, closeDelay: 50 })
    t.send('OPEN')
    t.send('POINTER.LEAVE')
    expect(t.state()).toBe('visible.closing')
    t.stop()
  })
})

describe('tooltipMachine 受控', () => {
  it('open 给定时只发意图不自改，宿主写回后才转移；setOpen 同值不发', () => {
    const t = makeTooltip({ open: false })
    t.api().setOpen(true)
    expect(t.api().open).toBe(false)
    expect(t.changes).toEqual([{ open: true }])
    t.setProps({ open: true })
    expect(t.api().open).toBe(true)
    expect(t.changes).toEqual([{ open: true }])
    t.api().setOpen(true)
    expect(t.changes).toHaveLength(1)
    t.setProps({ open: false })
    expect(t.api().open).toBe(false)
    t.stop()
  })

  it('受控可见时收起等待到点只发意图并回到 visible.open，浮层不自己关', () => {
    vi.useFakeTimers()
    const t = makeTooltip({ open: true, closeDelay: 50 })
    t.send('POINTER.LEAVE')
    vi.advanceTimersByTime(50)
    expect(t.state()).toBe('visible.open')
    expect(t.changes).toEqual([{ open: false }])
    t.stop()
  })
})
