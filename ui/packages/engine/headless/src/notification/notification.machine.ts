import type { NotificationPlacement, NotificationRecord, NotificationSchema } from './notification.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<NotificationSchema>()

/** 没指定位置时落哪儿。 */
export const NOTIFICATION_PLACEMENT: NotificationPlacement = 'bottom-end'
/** 同一摞内的默认间距（px）。 */
export const NOTIFICATION_GAP = 16

/** 九个位的固定顺序：placements 与分组遍历都按它走，界面顺序不随插入次序漂。 */
export const NOTIFICATION_PLACEMENTS: readonly NotificationPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'middle-start',
  'middle',
  'middle-end',
  'bottom-start',
  'bottom',
  'bottom-end',
]

/** 单条落位：自己写了就听自己的，否则用 notification 的默认。 */
export function notificationPlacementOf(item: NotificationRecord, fallback: NotificationPlacement): NotificationPlacement {
  return item.placement ?? fallback
}

/**
 * 按 max 挤掉每个位置上最旧的条目，保持原有先后次序。
 * create 之后落一次，队列才不会无界地长；connect 读的时候再落一次，受控队列同样只显示窗口内的。
 */
export function visibleNotifications(
  list: readonly NotificationRecord[],
  max: number | undefined,
  fallback: NotificationPlacement,
): NotificationRecord[] {
  // 不给 max 就是不限；<=0 与非有限数一并按不限处理
  if (max == null || !Number.isFinite(max) || max <= 0)
    return [...list]

  const overflow = new Set<NotificationRecord>()
  for (const placement of NOTIFICATION_PLACEMENTS) {
    const group = list.filter(item => notificationPlacementOf(item, fallback) === placement)
    for (const item of group.slice(0, Math.max(0, group.length - max)))
      overflow.add(item)
  }
  return list.filter(item => !overflow.has(item))
}

export const notificationMachine = createMachine({
  name: 'notification',
  context: ({ prop, cell }) => ({
    // 队列是数组，走 cell 原生受控，不需要影子事件那一套
    items: cell<NotificationRecord[]>(() => ({
      value: prop('items'),
      defaultValue: prop('defaultItems') ?? [],
      onChange: items => prop('onItemsChange')?.({ items }),
    })),
    seq: cell<number>(() => ({ defaultValue: 0 })),
  }),
  initialState: () => 'idle',
  // 四个入口从哪个状态发出都一样，因此挂根级
  on: {
    'ITEMS.CREATE': { actions: ['createItem'] },
    'ITEMS.UPDATE': { actions: ['updateItem'] },
    'ITEMS.DISMISS': { actions: ['dismissItem'] },
    'ITEMS.DISMISS_ALL': { actions: ['dismissAllItems'] },
  },
  states: { idle: {} },
  implementations: {
    actions: {
      createItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEMS.CREATE')
          return
        // 号照走，即便这次是作者自带的 id：漏掉自增会让下一条自动 id 撞上刚才那条
        context.set('seq', context.get('seq') + 1)

        const list = context.get('items')
        const at = list.findIndex(item => item.id === e.item.id)
        if (at >= 0) {
          // 同 id 就地改写，位置保持不动，否则 loading 转 success 时那条通知会跳到队尾
          const next = [...list]
          next[at] = { ...list[at]!, ...e.item }
          context.set('items', next)
          return
        }
        const fallback = prop('placement') ?? NOTIFICATION_PLACEMENT
        context.set('items', visibleNotifications([...list, e.item], prop('max'), fallback))
      },
      updateItem: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEMS.UPDATE')
          return
        const list = context.get('items')
        const at = list.findIndex(item => item.id === e.id)
        // 改一条已经走掉的通知是空操作，不把它重新变出来
        if (at < 0)
          return
        const next = [...list]
        next[at] = { ...list[at]!, ...e.patch, id: e.id }
        context.set('items', next)
      },
      dismissItem: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEMS.DISMISS')
          return
        const list = context.get('items')
        const next = list.filter(item => item.id !== e.id)
        // 没命中就不写，否则会白白惊动一次 onItemsChange
        if (next.length !== list.length)
          context.set('items', next)
      },
      dismissAllItems: ({ context }) => {
        if (context.get('items').length)
          context.set('items', [])
      },
    },
  },
})
