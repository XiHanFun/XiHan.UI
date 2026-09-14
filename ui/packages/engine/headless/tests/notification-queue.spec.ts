import type { NotificationSchema } from '../src/notification'
import type { ToastSchema } from '../src/toast'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectNotification, NOTIFICATION_MAX, notificationMachine, notificationPriorityOf, visibleNotifications } from '../src/notification'
import { toastMachine } from '../src/toast'

type Props = NotificationSchema['props']

function makeQueue(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(notificationMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectNotification(service, normalizeProps),
    items: () => service.context.get('items'),
    titles: () => connectNotification(service, normalizeProps).visibleNotifications.map(item => item.title),
    stop: () => runtime.stop(),
  }
}

describe('挤条按优先级', () => {
  it('语气派生：error 最高、warning 次之、其余持平', () => {
    expect(notificationPriorityOf({ id: 'a', type: 'error' })).toBe(2)
    expect(notificationPriorityOf({ id: 'a', type: 'warning' })).toBe(1)
    expect(notificationPriorityOf({ id: 'a', type: 'info' })).toBe(0)
    expect(notificationPriorityOf({ id: 'a' })).toBe(0)
    // 显式给的压过派生的
    expect(notificationPriorityOf({ id: 'a', type: 'info', priority: 9 })).toBe(9)
  })

  it('同优先级里挤最旧的那条', () => {
    const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(visibleNotifications(list, 2, 'top').map(item => item.id)).toEqual(['b', 'c'])
  })

  it('报错不会被随后的提示顶掉', () => {
    const list = [
      { id: 'boom', type: 'error' as const },
      { id: 'i1' },
      { id: 'i2' },
    ]
    expect(visibleNotifications(list, 2, 'top').map(item => item.id)).toEqual(['boom', 'i2'])
  })

  it('上限按位置各算各的', () => {
    const list = [
      { id: 'a', placement: 'top' as const },
      { id: 'b', placement: 'top' as const },
      { id: 'c', placement: 'bottom' as const },
    ]
    expect(visibleNotifications(list, 1, 'top').map(item => item.id)).toEqual(['b', 'c'])
  })
})

describe('上限的缺省', () => {
  it('不给 max：每个位置默认只留 NOTIFICATION_MAX 条，多出来的从队列里挤掉', () => {
    expect(NOTIFICATION_MAX).toBe(5)
    const q = makeQueue()
    for (let i = 1; i <= NOTIFICATION_MAX + 2; i++)
      q.api().create({ title: `第 ${i} 条` })
    expect(q.items().length).toBe(NOTIFICATION_MAX)
    expect(q.api().count).toBe(NOTIFICATION_MAX)
    expect(q.titles()).toEqual(['第 3 条', '第 4 条', '第 5 条', '第 6 条', '第 7 条'])
    q.stop()
  })

  it('缺省上限按位置各算各的：两个位各留满一份', () => {
    const q = makeQueue()
    for (let i = 1; i <= NOTIFICATION_MAX + 1; i++) {
      q.api().create({ title: `顶 ${i}`, placement: 'top' })
      q.api().create({ title: `底 ${i}` })
    }
    expect(q.api().getItemsByPlacement('top').length).toBe(NOTIFICATION_MAX)
    expect(q.api().getItemsByPlacement('bottom-end').length).toBe(NOTIFICATION_MAX)
    q.stop()
  })

  it('受控队列不给 max 同样只显示默认窗口内的', () => {
    const items = Array.from({ length: NOTIFICATION_MAX + 3 }, (_, i) => ({ id: `n${i}` }))
    const q = makeQueue({ items })
    expect(q.items().length).toBe(NOTIFICATION_MAX + 3)
    expect(q.api().visibleNotifications.map(item => item.id)).toEqual(['n3', 'n4', 'n5', 'n6', 'n7'])
    q.stop()
  })

  it('max 给 Infinity 即不限', () => {
    const q = makeQueue({ max: Number.POSITIVE_INFINITY })
    for (let i = 1; i <= 7; i++)
      q.api().create({ title: `第 ${i} 条` })
    expect(q.items().length).toBe(7)
    expect(q.api().visibleNotifications.length).toBe(7)
    q.stop()
  })

  it('非受控队列里被挤掉的那条直接丢弃，腾出位子也不回来', () => {
    const q = makeQueue({ max: 2 })
    const a = q.api().create({ title: 'a' })
    q.api().create({ title: 'b' })
    q.api().create({ title: 'c' })
    expect(q.titles()).toEqual(['b', 'c'])
    // 队列里已经没有 a 这一条：改它是空操作，不会把它重新变出来
    q.api().update(a, { title: 'a2' })
    expect(q.titles()).toEqual(['b', 'c'])
    // 腾出一个位子，a 也不会补上来
    q.api().dismiss(q.api().visibleNotifications[0]!.id)
    expect(q.titles()).toEqual(['c'])
    q.stop()
  })

  it('受控队列只是不显示窗口外的：宿主那份 items 原样', () => {
    const q = makeQueue({ max: 2, items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] })
    expect(q.items().length).toBe(3)
    expect(q.api().visibleNotifications.map(item => item.id)).toEqual(['b', 'c'])
    expect(q.api().count).toBe(2)
    q.stop()
  })
})

describe('合并计数', () => {
  it('默认只按 id 寻址，同一句话各占一条', () => {
    const q = makeQueue()
    q.api().create({ title: '同步失败' })
    q.api().create({ title: '同步失败' })
    expect(q.items().length).toBe(2)
    q.stop()
  })

  it('dedupe=content：同一句话并成一条并累加计数，位置不动', () => {
    const q = makeQueue({ dedupe: 'content' })
    const first = q.api().create({ title: '同步失败', type: 'error' })
    q.api().create({ title: '另一条' })
    const again = q.api().create({ title: '同步失败', type: 'error' })
    expect(q.items().length).toBe(2)
    // 命令交回被并进的那一条，调用方随后 update/dismiss 才寻址得到
    expect(again).toBe(first)
    expect(q.items()[0]!.count).toBe(2)
    expect(q.items()[0]!.title).toBe('同步失败')
    q.stop()
  })

  it('语气不同就不是同一件事', () => {
    const q = makeQueue({ dedupe: 'content' })
    q.api().create({ title: '同步失败', type: 'error' })
    q.api().create({ title: '同步失败', type: 'info' })
    expect(q.items().length).toBe(2)
    q.stop()
  })

  it('同 id 是寻址不是重复：仍走就地改写', () => {
    const q = makeQueue({ dedupe: 'content' })
    const id = q.api().create({ title: '导出中', type: 'loading' })
    q.api().update(id, { type: 'success', title: '导出完成' })
    expect(q.items().length).toBe(1)
    expect(q.items()[0]!.title).toBe('导出完成')
    expect(q.items()[0]!.count).toBeUndefined()
    q.stop()
  })
})

describe('宿主按住整摞的计时', () => {
  function makeToast(initial: ToastSchema['props']) {
    const runtime = createVanillaRuntime()
    const props = runtime.signal<ToastSchema['props']>(initial)
    const service = createService(toastMachine, { props: () => props.get(), runtime })
    runtime.start()
    return {
      state: () => service.state.get(),
      setProps: (next: ToastSchema['props']) => props.set({ ...props.get(), ...next }),
      pausedBy: () => service.context.get('pausedBy'),
      stop: () => runtime.stop(),
    }
  }

  it('paused 置真按住、置假放开', () => {
    const t = makeToast({ duration: 1000 })
    expect(t.state()).toBe('visible.running')
    t.setProps({ paused: true })
    expect(t.state()).toBe('visible.paused')
    expect(t.pausedBy()).toEqual(['service'])
    t.setProps({ paused: false })
    expect(t.state()).toBe('visible.running')
    expect(t.pausedBy()).toEqual([])
    t.stop()
  })

  it('起手就被按住的那条直接落在暂停态：watch 只看得见变化', () => {
    const t = makeToast({ duration: 1000, paused: true })
    expect(t.state()).toBe('visible.paused')
    expect(t.pausedBy()).toEqual(['service'])
    t.stop()
  })

  it('与指针那一路并存，最后一个松开才继续走', () => {
    const t = makeToast({ duration: 1000, paused: true })
    t.setProps({ paused: false })
    expect(t.state()).toBe('visible.running')
    t.stop()
  })
})
