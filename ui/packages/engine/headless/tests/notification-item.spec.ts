// @vitest-environment jsdom
// 轻提示预设缺省在页面转入后台时按住计时，它的机器要摸 document
import type { ExitLease } from '@xihan-ui/core/presence'
import type { NotificationItemSchema, NotificationStatusChangeDetails } from '../src/notification'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectNotificationItem, notificationItemMachine, resolveNotificationDuration } from '../src/notification'

type Props = NotificationItemSchema['props']

/** props 走 signal 而不是裸对象：改 prop 要真的惊动 watch，才验得到「预算被改写」这一路。 */
function makeItem(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(notificationItemMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectNotificationItem(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('resolveNotificationDuration', () => {
  it('loading 不自动消失，其余按给定值；<=0 与非有限数一并按不自动消失', () => {
    expect(resolveNotificationDuration(true, 100)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveNotificationDuration(false, 100)).toBe(100)
    expect(resolveNotificationDuration(false, 0)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveNotificationDuration(false, -1)).toBe(Number.POSITIVE_INFINITY)
    expect(resolveNotificationDuration(false, Number.NaN)).toBe(Number.POSITIVE_INFINITY)
  })

  it('没写 duration 取预设的缺省：卡片 5000、轻提示 4000；不认识的预设当场报错', () => {
    expect(resolveNotificationDuration(undefined, undefined)).toBe(5000)
    expect(resolveNotificationDuration(undefined, undefined, 'card')).toBe(5000)
    expect(resolveNotificationDuration(undefined, undefined, 'toast')).toBe(4000)
    // 写了就以写的为准，预设只管缺省
    expect(resolveNotificationDuration(undefined, 800, 'toast')).toBe(800)
    expect(() => resolveNotificationDuration(undefined, undefined, 'banner' as never)).toThrow('preset')
  })
})

describe('notificationItemMachine 生命周期', () => {
  it('起步在 visible.running；到点转 dismissing，没有渲染宿主时下一拍转 unmounted', () => {
    const seen: NotificationStatusChangeDetails[] = []
    const t = makeItem({ id: 't1', duration: 100, onStatusChange: d => seen.push(d) })
    expect(t.state()).toBe('visible.running')

    vi.advanceTimersByTime(99)
    expect(t.state()).toBe('visible.running')

    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
    expect(seen).toEqual([{ id: 't1', status: 'dismissing' }])

    vi.advanceTimersToNextTimer()
    expect(t.state()).toBe('unmounted')
    expect(seen).toEqual([
      { id: 't1', status: 'dismissing' },
      { id: 't1', status: 'unmounted' },
    ])
  })

  it('loading 不自动消失', () => {
    const t = makeItem({ loading: true, duration: 50 })
    vi.advanceTimersByTime(60_000)
    expect(t.state()).toBe('visible.running')
  })

  it('duration<=0 即关掉自动消失', () => {
    const t = makeItem({ duration: 0 })
    vi.advanceTimersByTime(60_000)
    expect(t.state()).toBe('visible.running')
  })

  it('有渲染宿主时停在 dismissing，等 Presence 结清退场动画才转 unmounted', () => {
    const t = makeItem({ duration: 10 })
    const presence = createPresence({ open: true, onRenderedChange: () => {} })
    let lease: ExitLease | undefined
    presence.onBeforeExit(() => {
      lease = presence.claimExit('退场动画')
    })
    t.service.refs.set('presence', presence)

    vi.advanceTimersByTime(10)
    expect(t.state()).toBe('dismissing')
    // 宿主把 data-state 提交到 DOM 之后才驱动 Presence，退场探测读到的是这一段动画
    presence.update(false)
    vi.advanceTimersByTime(60_000)
    expect(t.state()).toBe('dismissing')

    lease!.done()
    expect(t.state()).toBe('unmounted')
  })

  it('根节点上没有退场动画时，Presence 一收起就转 unmounted', () => {
    const t = makeItem({ duration: 10 })
    const presence = createPresence({ open: true, onRenderedChange: () => {} })
    t.service.refs.set('presence', presence)

    vi.advanceTimersByTime(10)
    expect(t.state()).toBe('dismissing')
    presence.update(false)
    expect(t.state()).toBe('unmounted')
  })

  it('unmounted 之后 DISMISS 不再把它拽回来', () => {
    const t = makeItem({ duration: 10 })
    vi.advanceTimersByTime(20)
    expect(t.state()).toBe('unmounted')
    t.service.send({ type: 'ITEM.DISMISS' })
    expect(t.state()).toBe('unmounted')
  })

  it('操作按钮：先发 onAction 再进入退场', () => {
    const onAction = vi.fn()
    const t = makeItem({ id: 't1', duration: 0, onAction })
    ;(t.api().getItemActionTriggerProps() as { onClick: () => void }).onClick()
    expect(onAction).toHaveBeenCalledWith({ id: 't1' })
    expect(t.state()).toBe('dismissing')
  })
})

describe('notificationItemMachine 暂停与恢复', () => {
  it('暂停后接着走剩余时间，而不是从头重来', () => {
    const t = makeItem({ duration: 200 })

    vi.advanceTimersByTime(60)
    t.service.send({ type: 'ITEM.PAUSE', src: 'pointer' })
    expect(t.state()).toBe('visible.paused')
    // 拆计时器那一下把跑掉的 60ms 记了账
    expect(t.service.context.get('remaining')).toBe(140)

    // 暂停期间不消耗预算：这里过掉的时间比整个 duration 还长
    vi.advanceTimersByTime(1000)
    expect(t.state()).toBe('visible.paused')

    t.service.send({ type: 'ITEM.RESUME', src: 'pointer' })
    expect(t.state()).toBe('visible.running')

    // 从头重来的实现会在这里还剩 61ms，下一行就炸
    vi.advanceTimersByTime(139)
    expect(t.state()).toBe('visible.running')
    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
  })

  it('多个来源叠加：最后一个松开才继续走', () => {
    const t = makeItem({ duration: 100 })
    t.service.send({ type: 'ITEM.PAUSE', src: 'pointer' })
    t.service.send({ type: 'ITEM.PAUSE', src: 'focus' })
    expect(t.service.context.get('pausedBy')).toEqual(['pointer', 'focus'])

    t.service.send({ type: 'ITEM.RESUME', src: 'pointer' })
    // 键盘用户还停在这条通知上，鼠标移开不该把计时放开
    expect(t.state()).toBe('visible.paused')
    vi.advanceTimersByTime(1000)
    expect(t.state()).toBe('visible.paused')

    t.service.send({ type: 'ITEM.RESUME', src: 'focus' })
    expect(t.state()).toBe('visible.running')
    vi.advanceTimersByTime(100)
    expect(t.state()).toBe('dismissing')
  })

  it('同一来源重复按住只记一次，一次松开即放开', () => {
    const t = makeItem({ duration: 100 })
    t.service.send({ type: 'ITEM.PAUSE', src: 'focus' })
    t.service.send({ type: 'ITEM.PAUSE', src: 'focus' })
    expect(t.service.context.get('pausedBy')).toEqual(['focus'])
    t.service.send({ type: 'ITEM.RESUME', src: 'focus' })
    expect(t.state()).toBe('visible.running')
  })

  it('剩余时间被扣光时夹到 1ms，不会退化成永不消失', () => {
    const t = makeItem({ duration: 50 })
    vi.advanceTimersByTime(50 - 1)
    t.service.send({ type: 'ITEM.PAUSE', src: 'pointer' })
    // 还剩 1ms
    expect(t.service.context.get('remaining')).toBe(1)
    t.service.send({ type: 'ITEM.RESUME', src: 'pointer' })
    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
  })
})

describe('notificationItemMachine 预算被改写', () => {
  it('loading 收尾成 success：重算预算并开始计时', () => {
    const t = makeItem({ loading: true, duration: 100 })
    vi.advanceTimersByTime(10_000)
    expect(t.state()).toBe('visible.running')

    t.setProps({ loading: false, tone: 'success' })
    expect(t.service.context.get('remaining')).toBe(100)
    vi.advanceTimersByTime(99)
    expect(t.state()).toBe('visible.running')
    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
  })

  it('改写发生在暂停期间：预算重置但不擅自恢复计时', () => {
    const t = makeItem({ loading: true })
    t.service.send({ type: 'ITEM.PAUSE', src: 'pointer' })
    t.setProps({ loading: false, tone: 'success', duration: 80 })
    expect(t.state()).toBe('visible.paused')
    expect(t.service.context.get('remaining')).toBe(80)

    t.service.send({ type: 'ITEM.RESUME', src: 'pointer' })
    vi.advanceTimersByTime(80)
    expect(t.state()).toBe('dismissing')
  })

  it('改写把已跑掉的一段一并抹掉：新预算从头算', () => {
    const t = makeItem({ duration: 100 })
    vi.advanceTimersByTime(90)
    // 语气改写不动预算，只有 loading / duration 改写才重算；这里改 duration 同值触发重算
    t.setProps({ duration: 100, loading: false })
    // 若只拆不重置，这里只剩 10ms，下一行就会先炸
    vi.advanceTimersByTime(99)
    expect(t.state()).toBe('visible.running')
    vi.advanceTimersByTime(1)
    expect(t.state()).toBe('dismissing')
  })
})

describe('connectNotificationItem', () => {
  it('默认是 status + polite，danger 换成 alert + assertive；语气落到 data-tone，加载态落到 data-loading', () => {
    const info = makeItem({ duration: 0 }).api().getItemProps() as Record<string, unknown>
    expect(info.role).toBe('status')
    expect(info['aria-live']).toBe('polite')
    expect(info['aria-atomic']).toBe('true')
    expect(info['data-tone']).toBe('info')
    expect(info['data-loading']).toBeUndefined()
    expect(info['data-state']).toBe('visible')

    const danger = makeItem({ duration: 0, tone: 'danger' }).api().getItemProps() as Record<string, unknown>
    expect(danger.role).toBe('alert')
    expect(danger['aria-live']).toBe('assertive')
    expect(danger['data-tone']).toBe('danger')

    // 加载中不是语气：配色照语气走，转圈另由 data-loading 说
    const loading = makeItem({ loading: true, tone: 'success' }).api()
    expect((loading.getItemProps() as Record<string, unknown>)['data-loading']).toBe('')
    expect((loading.getItemProps() as Record<string, unknown>)['data-tone']).toBe('success')
    expect((loading.getItemIndicatorProps() as Record<string, unknown>)['data-loading']).toBe('')
    expect(loading.loading).toBe(true)
  })

  it('标题与说明分别接到实时区；说明写在插槽里也念得到，所以不看 description prop 恒指过去', () => {
    const api = makeItem({ duration: 0, description: '已同步到云端' }).api()
    const item = api.getItemProps() as Record<string, unknown>
    expect(item['aria-labelledby']).toBe((api.getItemTitleProps() as Record<string, unknown>).id)
    expect(item['aria-describedby']).toBe((api.getItemDescriptionProps() as Record<string, unknown>).id)

    const withoutProp = makeItem({ duration: 0 }).api()
    expect((withoutProp.getItemProps() as Record<string, unknown>)['aria-describedby'])
      .toBe((withoutProp.getItemDescriptionProps() as Record<string, unknown>).id)
  })

  it('preset 落到 data-preset，卡片自己身上都挂加载环配方（行首兜底画不画由皮肤按预设决定）', () => {
    const card = makeItem({ duration: 0 }).api()
    expect(card.preset).toBe('card')
    expect((card.getItemProps() as Record<string, unknown>)['data-preset']).toBe('card')
    expect((card.getItemProps() as Record<string, unknown>)['data-xh-loading-ring']).toBe('')

    const toast = makeItem({ duration: 0, preset: 'toast' }).api()
    expect(toast.preset).toBe('toast')
    expect((toast.getItemProps() as Record<string, unknown>)['data-preset']).toBe('toast')
    expect((toast.getItemProps() as Record<string, unknown>)['data-xh-loading-ring']).toBe('')
    // 指示符部件两种预设都带：作者渲染了它，兜底就画在它上面
    expect((card.getItemIndicatorProps() as Record<string, unknown>)['data-xh-loading-ring']).toBe('')
  })

  it('停留与后台暂停的缺省随预设：轻提示 4000ms 且页面转入后台时按住计时，卡片 5000ms 不按', () => {
    const toast = makeItem({ preset: 'toast' })
    expect(toast.api().duration).toBe(4000)
    const card = makeItem({})
    expect(card.api().duration).toBe(5000)

    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    try {
      document.dispatchEvent(new Event('visibilitychange'))
      expect(toast.state()).toBe('visible.paused')
      expect(card.state()).toBe('visible.running')
      // 写了 pauseOnPageIdle 就以写的为准
      const explicit = makeItem({ preset: 'toast', pauseOnPageIdle: false })
      document.dispatchEvent(new Event('visibilitychange'))
      expect(explicit.state()).toBe('visible.running')
      explicit.stop()
    }
    finally {
      visibility.mockRestore()
      toast.stop()
      card.stop()
    }
  })

  it('data-paused 随暂停出现与消失；unmounted 时卡片带 hidden', () => {
    const t = makeItem({ duration: 10 })
    expect((t.api().getItemProps() as Record<string, unknown>)['data-paused']).toBeUndefined()

    t.service.send({ type: 'ITEM.PAUSE', src: 'pointer' })
    expect((t.api().getItemProps() as Record<string, unknown>)['data-paused']).toBe('')
    expect((t.api().getItemProps() as Record<string, unknown>).hidden).toBeUndefined()

    t.service.send({ type: 'ITEM.RESUME', src: 'pointer' })
    expect((t.api().getItemProps() as Record<string, unknown>)['data-paused']).toBeUndefined()

    vi.advanceTimersByTime(15)
    const unmounted = t.api().getItemProps() as Record<string, unknown>
    expect(unmounted['data-state']).toBe('unmounted')
    expect(unmounted.hidden).toBe(true)
  })

  it('两颗钮投影 Action Control 家族属性：操作钮 text outline sm；关闭钮 icon ghost，卡片 sm、轻提示 xs', () => {
    const api = makeItem({ duration: 0 }).api()
    const action = api.getItemActionTriggerProps() as Record<string, unknown>
    const close = api.getItemCloseTriggerProps() as Record<string, unknown>
    expect(action['data-xh-action-control']).toBe('')
    expect(action['data-xh-action-profile']).toBe('text')
    expect(action['data-xh-action-variant']).toBe('outline')
    expect(action['data-xh-action-display']).toBe('always')
    expect(action['data-xh-action-size']).toBe('sm')
    expect(close['data-xh-action-control']).toBe('')
    expect(close['data-xh-action-profile']).toBe('icon')
    expect(close['data-xh-action-variant']).toBe('ghost')
    // 显隐由皮肤按卡片悬停 / 焦点只压 opacity：家族的 hover-focus 用 visibility 收起，占 Tab 位的叉会被键盘漏掉
    expect(close['data-xh-action-display']).toBe('always')
    // 卡片的叉钉在角上，与浮层角落关闭钮同一档
    expect(close['data-xh-action-size']).toBe('sm')

    const toast = makeItem({ duration: 0, preset: 'toast' }).api()
    // 轻提示的叉排在一行短消息的行尾，走行级动作钮那一档
    expect((toast.getItemCloseTriggerProps() as Record<string, unknown>)['data-xh-action-size']).toBe('xs')
    expect((toast.getItemActionTriggerProps() as Record<string, unknown>)['data-xh-action-size']).toBe('sm')
  })

  it('closable=false：关闭按钮 disabled + hidden，且点它也不会退场', () => {
    const t = makeItem({ duration: 0, closable: false })
    const close = t.api().getItemCloseTriggerProps() as Record<string, unknown> & { onClick: () => void }
    expect(close.disabled).toBe(true)
    expect(close.hidden).toBe(true)
    expect(close['data-disabled']).toBe('')
    // 原生 disabled 只在按钮上生效；作者把 props 摊到别的节点上时守卫必须自己顶住
    close.onClick()
    expect(t.state()).toBe('visible.running')
  })

  it('closable 默认为真：关闭按钮可用，点了立刻进入退场', () => {
    const t = makeItem({ duration: 0 })
    const close = t.api().getItemCloseTriggerProps() as Record<string, unknown> & { onClick: () => void }
    expect(close.disabled).toBeUndefined()
    expect(close.hidden).toBeUndefined()
    close.onClick()
    expect(t.state()).toBe('dismissing')
  })

  it('指针进出走的是 PAUSE / RESUME；焦点在内部换节点不算离场', () => {
    const t = makeItem({ duration: 100 })
    // 恒等归一化器不改键名，这里就是 connect 产出的原始 IR（Vue / WC 各自再落成 DOM 事件名）
    const item = t.api().getItemProps() as Record<string, unknown> & {
      onPointerEnter: () => void
      onPointerLeave: () => void
      onFocusIn: () => void
      onFocusOut: (event: FocusEvent) => void
    }
    item.onPointerEnter()
    expect(t.state()).toBe('visible.paused')
    item.onPointerLeave()
    expect(t.state()).toBe('visible.running')

    item.onFocusIn()
    expect(t.state()).toBe('visible.paused')
    // 焦点从操作按钮移到关闭按钮：relatedTarget 仍在本条之内，不该放开计时
    const inner = { } as Node
    const stillInside = {
      relatedTarget: inner,
      currentTarget: { contains: (node: Node) => node === inner },
    } as unknown as FocusEvent
    item.onFocusOut(stillInside)
    expect(t.state()).toBe('visible.paused')

    const leaving = { relatedTarget: null, currentTarget: null } as unknown as FocusEvent
    item.onFocusOut(leaving)
    expect(t.state()).toBe('visible.running')
  })

  it('api 暴露 id / status / remaining，未给 id 时回落到 scope id', () => {
    const withId = makeItem({ duration: 0, id: 'saved' }).api()
    expect(withId.id).toBe('saved')

    const t = makeItem({ duration: 100 })
    expect(t.api().id).toBe(t.service.scope.id)
    expect(t.api().remaining).toBe(100)
    expect(t.api().status).toBe('visible')
    t.api().dismiss()
    expect(t.api().status).toBe('dismissing')
  })
})

// ══ 按压通道 ══

type Dict = Record<string, unknown>
const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

describe('notificationItemMachine 按压通道：Space / Enter 与触屏按住投影 data-pressed，按住的是哪颗就只落在哪颗上', () => {
  it('关闭按钮：keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路', () => {
    const t = makeItem({ duration: 0 })
    const close = (): Dict => t.api().getItemCloseTriggerProps() as Dict
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onKeyDown', key(' '))
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onKeyUp', key(' '))
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onKeyDown', key('Enter'))
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onBlur', {})
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onPointerDown', { pointerType: 'touch' })
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onPointerCancel', {})
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onPointerDown', { pointerType: 'touch' })
    expect(close()['data-pressed']).toBe('')
    fire(close(), 'onPointerUp', {})
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onPointerDown', { pointerType: 'mouse' })
    expect(close()['data-pressed']).toBeUndefined()
    // 按住不等于按下：计时照旧、状态不动
    expect(t.state()).toBe('visible.running')
  })

  it('操作按钮：只有按住的那颗带 data-pressed，另一颗的 keyup 不把它松开；加载中照常有回执', () => {
    const t = makeItem({ loading: true })
    const close = (): Dict => t.api().getItemCloseTriggerProps() as Dict
    const action = (): Dict => t.api().getItemActionTriggerProps() as Dict
    fire(action(), 'onKeyDown', key(' '))
    expect(action()['data-pressed']).toBe('')
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onKeyUp', key(' '))
    expect(action()['data-pressed']).toBe('')
    fire(action(), 'onKeyUp', key(' '))
    expect(action()['data-pressed']).toBeUndefined()
  })

  it('进入退场即松开：按住 Enter 关掉卡片，按钮随条目离场、不会再来 keyup，按压面由机器收；退场后按住不进', () => {
    const t = makeItem({ duration: 0 })
    const close = (): Dict => t.api().getItemCloseTriggerProps() as Dict
    fire(close(), 'onKeyDown', key('Enter'))
    expect(close()['data-pressed']).toBe('')
    t.service.send({ type: 'ITEM.DISMISS' })
    expect(t.state()).toBe('dismissing')
    expect(close()['data-pressed']).toBeUndefined()
    fire(close(), 'onKeyDown', key('Enter'))
    expect(close()['data-pressed']).toBeUndefined()
    vi.advanceTimersByTime(20)
    expect(t.state()).toBe('unmounted')
    fire(close(), 'onPointerDown', { pointerType: 'touch' })
    expect(close()['data-pressed']).toBeUndefined()
  })

  it('到点自动退场同样松开：手指还按在操作按钮上时卡片走掉，按压面不留残留', () => {
    const t = makeItem({ duration: 100 })
    const action = (): Dict => t.api().getItemActionTriggerProps() as Dict
    fire(action(), 'onPointerDown', { pointerType: 'touch' })
    expect(action()['data-pressed']).toBe('')
    // 触屏按住不暂停计时（暂停来源只有指针悬停与焦点），到点照走
    vi.advanceTimersByTime(100)
    expect(t.state()).toBe('dismissing')
    expect(action()['data-pressed']).toBeUndefined()
  })

  it('closable=false：关闭按钮按住不进；经 signal 转成不可关闭时按住的关闭按钮自收，操作按钮不受影响', () => {
    const off = makeItem({ duration: 0, closable: false })
    const offClose = (): Dict => off.api().getItemCloseTriggerProps() as Dict
    fire(offClose(), 'onKeyDown', key(' '))
    expect(offClose()['data-pressed']).toBeUndefined()
    fire(offClose(), 'onPointerDown', { pointerType: 'touch' })
    expect(offClose()['data-pressed']).toBeUndefined()

    const t = makeItem({ duration: 0 })
    const close = (): Dict => t.api().getItemCloseTriggerProps() as Dict
    const action = (): Dict => t.api().getItemActionTriggerProps() as Dict
    fire(close(), 'onKeyDown', key(' '))
    expect(close()['data-pressed']).toBe('')
    t.setProps({ closable: false })
    expect(close()['data-pressed']).toBeUndefined()

    t.setProps({ closable: true })
    fire(action(), 'onKeyDown', key(' '))
    expect(action()['data-pressed']).toBe('')
    t.setProps({ closable: false })
    expect(action()['data-pressed']).toBe('')
    fire(action(), 'onKeyUp', key(' '))
    expect(action()['data-pressed']).toBeUndefined()
  })
})

describe('宿主按住整摞的计时', () => {
  it('paused 置真按住、置假放开', () => {
    const t = makeItem({ duration: 1000 })
    expect(t.state()).toBe('visible.running')
    t.setProps({ paused: true })
    expect(t.state()).toBe('visible.paused')
    expect(t.service.context.get('pausedBy')).toEqual(['service'])
    t.setProps({ paused: false })
    expect(t.state()).toBe('visible.running')
    expect(t.service.context.get('pausedBy')).toEqual([])
    t.stop()
  })

  it('起手就被按住的那条直接落在暂停态：watch 只看得见变化', () => {
    const t = makeItem({ duration: 1000, paused: true })
    expect(t.state()).toBe('visible.paused')
    expect(t.service.context.get('pausedBy')).toEqual(['service'])
    t.stop()
  })

  it('与指针那一路并存，最后一个松开才继续走', () => {
    const t = makeItem({ duration: 1000, paused: true })
    t.service.send({ type: 'ITEM.PAUSE', src: 'pointer' })
    t.setProps({ paused: false })
    expect(t.state()).toBe('visible.paused')
    t.service.send({ type: 'ITEM.RESUME', src: 'pointer' })
    expect(t.state()).toBe('visible.running')
    t.stop()
  })
})

describe('所在那一摞被展开时一起按住', () => {
  /** 卡片挂进一摞：group 的 data-expanded 由队列投影，这里直接改它。 */
  function inGroup(expanded: boolean) {
    const group = document.createElement('div')
    group.dataset.scope = 'notification'
    group.dataset.part = 'group'
    group.toggleAttribute('data-expanded', expanded)
    const card = document.createElement('div')
    group.append(card)
    document.body.append(group)
    const runtime = createVanillaRuntime()
    const service = createService(notificationItemMachine, { props: () => ({ duration: 1000 }), runtime })
    service.refs.set('getRootEl', () => card)
    runtime.start()
    const stop = (): void => {
      runtime.stop()
      group.remove()
    }
    return { group, service, stop }
  }

  /** 追踪在提交后的微任务里接上，变动观察器的回调也是微任务。 */
  async function settle(): Promise<void> {
    for (let i = 0; i < 4; i++)
      await Promise.resolve()
  }

  it('展开即按住、收起即放开，与指针那一路各记各的', async () => {
    const t = inGroup(false)
    await settle()
    expect(t.service.state.get()).toBe('visible.running')

    t.group.setAttribute('data-expanded', '')
    await settle()
    expect(t.service.state.get()).toBe('visible.paused')
    expect(t.service.context.get('pausedBy')).toEqual(['stack'])

    t.service.send({ type: 'ITEM.PAUSE', src: 'pointer' })
    t.group.removeAttribute('data-expanded')
    await settle()
    expect(t.service.state.get()).toBe('visible.paused')
    t.service.send({ type: 'ITEM.RESUME', src: 'pointer' })
    expect(t.service.state.get()).toBe('visible.running')
    t.stop()
  })

  it('新到的卡片落进一摞时它正展开着：一上来就按住', async () => {
    const t = inGroup(true)
    await settle()
    expect(t.service.context.get('pausedBy')).toEqual(['stack'])
    t.stop()
  })
})
