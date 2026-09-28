// @vitest-environment jsdom
// 叠摞的测量挂在真实节点上，这份用例要一棵 DOM
import type { NotificationSchema } from '../src/notification'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectNotification, NOTIFICATION_PRESETS, notificationMachine, notificationPresetOf, notificationPriorityOf, visibleNotifications } from '../src/notification'

const NOTIFICATION_MAX = NOTIFICATION_PRESETS.card.max

type Props = NotificationSchema['props']

function makeQueue(initial: Props = {}, root: HTMLElement | null = null) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(notificationMachine, { props: () => props.get(), runtime })
  service.refs.set('getRootEl', () => root)
  runtime.start()
  return {
    service,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectNotification(service, normalizeProps),
    items: () => service.context.get('items'),
    titles: () => connectNotification(service, normalizeProps).visibleNotifications.map(item => item.title),
    stop: () => runtime.stop(),
  }
}

describe('挤条按优先级', () => {
  it('语气派生：error 最高、warning 次之、其余持平', () => {
    expect(notificationPriorityOf({ id: 'a', tone: 'danger' })).toBe(2)
    expect(notificationPriorityOf({ id: 'a', tone: 'warning' })).toBe(1)
    expect(notificationPriorityOf({ id: 'a', tone: 'info' })).toBe(0)
    expect(notificationPriorityOf({ id: 'a' })).toBe(0)
    // 显式给的压过派生的
    expect(notificationPriorityOf({ id: 'a', tone: 'info', priority: 9 })).toBe(9)
  })

  it('同优先级里挤最旧的那条', () => {
    const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(visibleNotifications(list, 2, 'top').map(item => item.id)).toEqual(['b', 'c'])
  })

  it('报错不会被随后的提示顶掉', () => {
    const list = [
      { id: 'boom', tone: 'danger' as const },
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
  it('不给 max：卡片预设每个位置默认只留 5 条，多出来的从队列里挤掉', () => {
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
    const first = q.api().create({ title: '同步失败', tone: 'danger' })
    q.api().create({ title: '另一条' })
    const again = q.api().create({ title: '同步失败', tone: 'danger' })
    expect(q.items().length).toBe(2)
    // 命令交回被并进的那一条，调用方随后 update/dismiss 才寻址得到
    expect(again).toBe(first)
    expect(q.items()[0]!.count).toBe(2)
    expect(q.items()[0]!.title).toBe('同步失败')
    q.stop()
  })

  it('语气不同就不是同一件事', () => {
    const q = makeQueue({ dedupe: 'content' })
    q.api().create({ title: '同步失败', tone: 'danger' })
    q.api().create({ title: '同步失败', tone: 'info' })
    expect(q.items().length).toBe(2)
    q.stop()
  })

  it('同 id 是寻址不是重复：仍走就地改写', () => {
    const q = makeQueue({ dedupe: 'content' })
    const id = q.api().create({ title: '导出中', loading: true })
    q.api().update(id, { loading: false, tone: 'success', title: '导出完成' })
    expect(q.items().length).toBe(1)
    expect(q.items()[0]!.title).toBe('导出完成')
    expect(q.items()[0]!.count).toBeUndefined()
    q.stop()
  })
})

describe('预设', () => {
  it('缺省卡片：落右下、每个位置 5 条、逐条排开、间距 16、停留 5000、后台不暂停', () => {
    const q = makeQueue()
    const api = q.api()
    expect(api.preset).toBe('card')
    expect(api.stacked).toBe(false)
    const group = api.getGroupProps() as Record<string, unknown>
    expect(group['data-placement']).toBe('bottom-end')
    expect(group['data-preset']).toBe('card')
    expect(group['data-stacked']).toBeUndefined()
    expect(group.style).toEqual({ gap: '16px' })
    api.create({ title: '一条' })
    expect(q.api().visibleNotifications[0]).toMatchObject({
      preset: 'card',
      placement: 'bottom-end',
      duration: 5000,
      pauseOnPageIdle: false,
    })
    q.stop()
  })

  it('轻提示：落底部居中、最多 3 条、叠成一摞、间距 12、停留 4000、后台暂停', () => {
    const q = makeQueue({ preset: 'toast' })
    expect(q.api().stacked).toBe(true)
    const group = q.api().getGroupProps() as Record<string, unknown>
    expect(group['data-placement']).toBe('bottom')
    expect(group['data-preset']).toBe('toast')
    expect(group['data-stacked']).toBe('')
    expect(group.style).toEqual({ gap: '12px' })
    for (let i = 1; i <= 5; i++)
      q.api().create({ title: `第 ${i} 条` })
    expect(q.titles()).toEqual(['第 3 条', '第 4 条', '第 5 条'])
    expect(q.api().visibleNotifications[0]).toMatchObject({
      preset: 'toast',
      placement: 'bottom',
      duration: 4000,
      pauseOnPageIdle: true,
    })
    q.stop()
  })

  it('每一项都能单独改写：写了就以 prop 为准，预设只管没写的那几项', () => {
    const q = makeQueue({ preset: 'toast', placement: 'top', max: 5, gap: 20, duration: 900, stacked: false, pauseOnPageIdle: false })
    const group = q.api().getGroupProps() as Record<string, unknown>
    expect(group['data-placement']).toBe('top')
    expect(group['data-stacked']).toBeUndefined()
    expect(group.style).toEqual({ gap: '20px' })
    for (let i = 1; i <= 6; i++)
      q.api().create({ title: `第 ${i} 条` })
    expect(q.api().count).toBe(5)
    expect(q.api().visibleNotifications[0]).toMatchObject({ duration: 900, pauseOnPageIdle: false })
    q.stop()
  })

  it('不认识的预设当场报错，不静默落回卡片', () => {
    expect(() => notificationPresetOf('banner' as never)).toThrow('preset')
    expect(notificationPresetOf(undefined)).toBe(NOTIFICATION_PRESETS.card)
  })
})

describe('叠摞', () => {
  const roots: HTMLElement[] = []
  afterEach(() => {
    for (const root of roots.splice(0))
      root.remove()
  })

  /** 按连接层的产出摆一摞：group 带 data-stacked 与落位，底下三条卡片。 */
  function stage(q: ReturnType<typeof makeQueue>, root: HTMLElement): HTMLElement[] {
    const group = document.createElement('div')
    const attrs = q.api().getGroupProps() as Record<string, unknown>
    for (const [name, value] of Object.entries(attrs)) {
      if (name.startsWith('data-') && value !== undefined)
        group.setAttribute(name, String(value))
    }
    const items = ['a', 'b', 'c'].map((id) => {
      const item = document.createElement('div')
      item.dataset.scope = 'notification'
      item.dataset.part = 'item'
      item.id = id
      const button = document.createElement('button')
      item.append(button)
      group.append(item)
      return item
    })
    root.append(group)
    return items
  }

  async function settle(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  it('最新一条在最前，后层写上层深与偏移；卡片预设的一摞不接', async () => {
    const root = document.createElement('div')
    document.body.append(root)
    roots.push(root)
    const q = makeQueue({ preset: 'toast' }, root)
    const items = stage(q, root)
    await settle()
    expect(items.map(item => item.dataset.stackIndex)).toEqual(['2', '1', '0'])
    expect(items.map(item => item.hasAttribute('data-frontmost'))).toEqual([false, false, true])
    expect(items[0]!.style.getPropertyValue('--xh-_notification-depth')).toBe('2')
    expect(items[0]!.style.getPropertyValue('--xh-_notification-offset')).toBe('24px')
    q.stop()

    const cardRoot = document.createElement('div')
    document.body.append(cardRoot)
    roots.push(cardRoot)
    const card = makeQueue({}, cardRoot)
    const cardItems = stage(card, cardRoot)
    await settle()
    expect(cardItems.every(item => item.dataset.stackIndex === undefined)).toBe(true)
    card.stop()
  })

  it('焦点进入即展开，group 投影 data-expanded；Escape 收起并让焦点离开', async () => {
    const root = document.createElement('div')
    document.body.append(root)
    roots.push(root)
    const q = makeQueue({ preset: 'toast', defaultItems: [{ id: 'a' }] }, root)
    const items = stage(q, root)
    await settle()

    items[2]!.querySelector('button')!.focus()
    expect(q.service.context.get('expanded')).toEqual(['bottom'])
    expect((q.api().getGroupProps() as Record<string, unknown>)['data-expanded']).toBe('')
    expect(items.every(item => item.hasAttribute('data-expanded'))).toBe(true)

    items[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(document.activeElement).toBe(document.body)
    expect(q.service.context.get('expanded')).toEqual([])
    expect((q.api().getGroupProps() as Record<string, unknown>)['data-expanded']).toBeUndefined()
    q.stop()
  })

  it('展开着的那一摞撤走时一并收起，不留一份按住的计时', async () => {
    const root = document.createElement('div')
    document.body.append(root)
    roots.push(root)
    const q = makeQueue({ preset: 'toast' }, root)
    const items = stage(q, root)
    await settle()
    items[0]!.querySelector('button')!.focus()
    expect(q.service.context.get('expanded')).toEqual(['bottom'])
    root.replaceChildren()
    await settle()
    expect(q.service.context.get('expanded')).toEqual([])
    q.stop()
  })
})
