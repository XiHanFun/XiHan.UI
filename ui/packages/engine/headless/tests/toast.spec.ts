import type { ToastSchema, ToastStatusChangeDetails } from '../src/toast'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectToast, resolveToastDuration, toastMachine } from '../src/toast'

type Props = ToastSchema['props']

/** props 走 signal 而不是裸对象：改 prop 要真的惊动 watch，才验得到「预算被改写」这一路。 */
function makeToast(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(toastMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectToast(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('resolveToastDuration', () => {
  it('loading 不自动消失，其余按给定值；<=0 与非有限数一并按不自动消失', () => {
    expect(resolveToastDuration('loading', 100)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveToastDuration('success', 100)).toBe(100)
    expect(resolveToastDuration(undefined, undefined)).toBe(5000)
    expect(resolveToastDuration('info', 0)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveToastDuration('info', -1)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveToastDuration('info', Number.NaN)).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('toastMachine 生命周期', () => {
  it('起步在 visible.running；到点转 dismissing，走完退场窗口转 unmounted', () => {
    const seen: ToastStatusChangeDetails[] = []
    const t = makeToast({ id: 't1', duration: 100, removeDelay: 20, onStatusChange: d => seen.push(d) })
    expect(t.state()).toBe('visible.running')

    vi.advanceTimersByTime(99)
    expect(t.state()).toBe('visible.running')

    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
    expect(seen).toEqual([{ id: 't1', status: 'dismissing' }])

    vi.advanceTimersByTime(20)
    expect(t.state()).toBe('unmounted')
    expect(seen).toEqual([
      { id: 't1', status: 'dismissing' },
      { id: 't1', status: 'unmounted' },
    ])
  })

  it('type=loading 不自动消失', () => {
    const t = makeToast({ type: 'loading', duration: 50 })
    vi.advanceTimersByTime(60_000)
    expect(t.state()).toBe('visible.running')
  })

  it('duration<=0 即关掉自动消失', () => {
    const t = makeToast({ duration: 0 })
    vi.advanceTimersByTime(60_000)
    expect(t.state()).toBe('visible.running')
  })

  it('removeDelay 非有限值时停在 dismissing，等宿主自己收尾', () => {
    const t = makeToast({ duration: 10, removeDelay: Number.POSITIVE_INFINITY })
    vi.advanceTimersByTime(10)
    expect(t.state()).toBe('dismissing')
    vi.advanceTimersByTime(60_000)
    expect(t.state()).toBe('dismissing')
  })

  it('unmounted 之后 DISMISS 不再把它拽回来', () => {
    const t = makeToast({ duration: 10, removeDelay: 10 })
    vi.advanceTimersByTime(20)
    expect(t.state()).toBe('unmounted')
    t.service.send({ type: 'TOAST.DISMISS' })
    expect(t.state()).toBe('unmounted')
  })

  it('操作按钮：先发 onAction 再进入退场', () => {
    const onAction = vi.fn()
    const t = makeToast({ id: 't1', duration: 0, onAction })
    ;(t.api().getActionTriggerProps() as { onClick: () => void }).onClick()
    expect(onAction).toHaveBeenCalledWith({ id: 't1' })
    expect(t.state()).toBe('dismissing')
  })
})

describe('toastMachine 暂停与恢复', () => {
  it('暂停后接着走剩余时间，而不是从头重来', () => {
    const t = makeToast({ duration: 200, removeDelay: 10 })

    vi.advanceTimersByTime(60)
    t.service.send({ type: 'TOAST.PAUSE', src: 'pointer' })
    expect(t.state()).toBe('visible.paused')
    // 拆计时器那一下把跑掉的 60ms 记了账
    expect(t.service.context.get('remaining')).toBe(140)

    // 暂停期间不消耗预算：这里过掉的时间比整个 duration 还长
    vi.advanceTimersByTime(1000)
    expect(t.state()).toBe('visible.paused')

    t.service.send({ type: 'TOAST.RESUME', src: 'pointer' })
    expect(t.state()).toBe('visible.running')

    // 从头重来的实现会在这里还剩 61ms，下一行就炸
    vi.advanceTimersByTime(139)
    expect(t.state()).toBe('visible.running')
    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
  })

  it('多个来源叠加：最后一个松开才继续走', () => {
    const t = makeToast({ duration: 100 })
    t.service.send({ type: 'TOAST.PAUSE', src: 'pointer' })
    t.service.send({ type: 'TOAST.PAUSE', src: 'focus' })
    expect(t.service.context.get('pausedBy')).toEqual(['pointer', 'focus'])

    t.service.send({ type: 'TOAST.RESUME', src: 'pointer' })
    // 键盘用户还停在这条通知上，鼠标移开不该把计时放开
    expect(t.state()).toBe('visible.paused')
    vi.advanceTimersByTime(1000)
    expect(t.state()).toBe('visible.paused')

    t.service.send({ type: 'TOAST.RESUME', src: 'focus' })
    expect(t.state()).toBe('visible.running')
    vi.advanceTimersByTime(100)
    expect(t.state()).toBe('dismissing')
  })

  it('同一来源重复按住只记一次，一次松开即放开', () => {
    const t = makeToast({ duration: 100 })
    t.service.send({ type: 'TOAST.PAUSE', src: 'focus' })
    t.service.send({ type: 'TOAST.PAUSE', src: 'focus' })
    expect(t.service.context.get('pausedBy')).toEqual(['focus'])
    t.service.send({ type: 'TOAST.RESUME', src: 'focus' })
    expect(t.state()).toBe('visible.running')
  })

  it('剩余时间被扣光时夹到 1ms，不会退化成永不消失', () => {
    const t = makeToast({ duration: 50 })
    vi.advanceTimersByTime(50 - 1)
    t.service.send({ type: 'TOAST.PAUSE', src: 'pointer' })
    // 还剩 1ms
    expect(t.service.context.get('remaining')).toBe(1)
    t.service.send({ type: 'TOAST.RESUME', src: 'pointer' })
    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
  })
})

describe('toastMachine 预算被改写', () => {
  it('loading 转 success：重算预算并开始计时', () => {
    const t = makeToast({ type: 'loading', duration: 100 })
    vi.advanceTimersByTime(10_000)
    expect(t.state()).toBe('visible.running')

    t.setProps({ type: 'success' })
    expect(t.service.context.get('remaining')).toBe(100)
    vi.advanceTimersByTime(99)
    expect(t.state()).toBe('visible.running')
    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
  })

  it('改写发生在暂停期间：预算重置但不擅自恢复计时', () => {
    const t = makeToast({ type: 'loading' })
    t.service.send({ type: 'TOAST.PAUSE', src: 'pointer' })
    t.setProps({ type: 'success', duration: 80 })
    expect(t.state()).toBe('visible.paused')
    expect(t.service.context.get('remaining')).toBe(80)

    t.service.send({ type: 'TOAST.RESUME', src: 'pointer' })
    vi.advanceTimersByTime(80)
    expect(t.state()).toBe('dismissing')
  })

  it('改写把已跑掉的一段一并抹掉：新预算从头算', () => {
    const t = makeToast({ duration: 100 })
    vi.advanceTimersByTime(90)
    t.setProps({ duration: 100, type: 'warning' })
    // 若只拆不重置，这里只剩 10ms，下一行就会先炸
    vi.advanceTimersByTime(99)
    expect(t.state()).toBe('visible.running')
    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
  })
})

describe('connectToast', () => {
  it('默认是 status + polite，error 换成 alert + assertive', () => {
    const info = makeToast({ duration: 0 }).api().getRootProps() as Record<string, unknown>
    expect(info.role).toBe('status')
    expect(info['aria-live']).toBe('polite')
    expect(info['aria-atomic']).toBe('true')
    expect(info['data-severity']).toBe('info')
    expect(info['data-state']).toBe('visible')

    const error = makeToast({ duration: 0, type: 'error' }).api().getRootProps() as Record<string, unknown>
    expect(error.role).toBe('alert')
    expect(error['aria-live']).toBe('assertive')
  })

  it('aria-labelledby 指向 title 部件；轻提示只有一层文本', () => {
    // 两层文本是 notification 的活：轻提示把结果用一句话说清楚就够了
    const api = makeToast({ duration: 0 }).api()
    const root = api.getRootProps() as Record<string, unknown>
    expect(root['aria-labelledby']).toBe((api.getTitleProps() as Record<string, unknown>).id)
    expect(root['aria-describedby']).toBeUndefined()
  })

  it('data-paused 随暂停出现与消失；unmounted 时 root 带 hidden', () => {
    const t = makeToast({ duration: 10, removeDelay: 5 })
    expect((t.api().getRootProps() as Record<string, unknown>)['data-paused']).toBeUndefined()

    t.service.send({ type: 'TOAST.PAUSE', src: 'pointer' })
    expect((t.api().getRootProps() as Record<string, unknown>)['data-paused']).toBe('')
    expect((t.api().getRootProps() as Record<string, unknown>).hidden).toBeUndefined()

    t.service.send({ type: 'TOAST.RESUME', src: 'pointer' })
    expect((t.api().getRootProps() as Record<string, unknown>)['data-paused']).toBeUndefined()

    vi.advanceTimersByTime(15)
    const unmounted = t.api().getRootProps() as Record<string, unknown>
    expect(unmounted['data-state']).toBe('unmounted')
    expect(unmounted.hidden).toBe(true)
  })

  it('closable=false：关闭按钮 disabled + hidden，且点它也不会退场', () => {
    const t = makeToast({ duration: 0, closable: false })
    const close = t.api().getCloseTriggerProps() as Record<string, unknown> & { onClick: () => void }
    expect(close.disabled).toBe(true)
    expect(close.hidden).toBe(true)
    expect(close['data-disabled']).toBe('')
    // 原生 disabled 只在按钮上生效；作者把 props 摊到别的节点上时守卫必须自己顶住
    close.onClick()
    expect(t.state()).toBe('visible.running')
  })

  it('closable 默认为真：关闭按钮可用，点了立刻进入退场', () => {
    const t = makeToast({ duration: 0 })
    const close = t.api().getCloseTriggerProps() as Record<string, unknown> & { onClick: () => void }
    expect(close.disabled).toBeUndefined()
    expect(close.hidden).toBeUndefined()
    close.onClick()
    expect(t.state()).toBe('dismissing')
  })

  it('指针进出走的是 PAUSE / RESUME；焦点在内部换节点不算离场', () => {
    const t = makeToast({ duration: 100 })
    // 恒等归一化器不改键名，这里就是 connect 产出的原始 IR（Vue / WC 各自再落成 DOM 事件名）
    const root = t.api().getRootProps() as Record<string, unknown> & {
      onPointerEnter: () => void
      onPointerLeave: () => void
      onFocusIn: () => void
      onFocusOut: (event: FocusEvent) => void
    }
    root.onPointerEnter()
    expect(t.state()).toBe('visible.paused')
    root.onPointerLeave()
    expect(t.state()).toBe('visible.running')

    root.onFocusIn()
    expect(t.state()).toBe('visible.paused')
    // 焦点从操作按钮移到关闭按钮：relatedTarget 仍在本条之内，不该放开计时
    const inner = { } as Node
    const stillInside = {
      relatedTarget: inner,
      currentTarget: { contains: (node: Node) => node === inner },
    } as unknown as FocusEvent
    root.onFocusOut(stillInside)
    expect(t.state()).toBe('visible.paused')

    const leaving = { relatedTarget: null, currentTarget: null } as unknown as FocusEvent
    root.onFocusOut(leaving)
    expect(t.state()).toBe('visible.running')
  })

  it('api 暴露 id / status / remaining，未给 id 时回落到 scope id', () => {
    const withId = makeToast({ duration: 0, id: 'saved' }).api()
    expect(withId.id).toBe('saved')

    const t = makeToast({ duration: 100 })
    expect(t.api().id).toBe(t.service.scope.id)
    expect(t.api().remaining).toBe(100)
    expect(t.api().status).toBe('visible')
    t.api().dismiss()
    expect(t.api().status).toBe('dismissing')
  })
})
