import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { ToastSchema, ToastStatus, ToastType } from '../toast'
import type { NotificationApi, NotificationItemApi, NotificationPlacement, NotificationRecord, NotificationSchema, ResolvedNotification } from './notification.types'
import { DATA_INERT_EXEMPT, dataAttr } from '@xihan-ui/core'
import { resolveToastId, TOAST_DURATION, TOAST_REMOVE_DELAY } from '../toast'
import { notificationAnatomy } from './notification.anatomy'
import {
  NOTIFICATION_GAP,
  NOTIFICATION_PLACEMENT,
  NOTIFICATION_PLACEMENTS,
  notificationPlacementOf,
  visibleNotifications,
} from './notification.machine'

const parts = notificationAnatomy.build()

export function connectNotification<T extends PropTypes>(
  service: Service<NotificationSchema>,
  normalize: NormalizeProps<T>,
): NotificationApi<T> {
  const { prop, send, context, scope } = service

  const fallback = prop('placement') ?? NOTIFICATION_PLACEMENT
  const gap = prop('gap') ?? NOTIFICATION_GAP
  const pauseOnPageIdle = prop('pauseOnPageIdle') ?? false

  // 把 notification 的默认值烘进每一条，适配器直接摊给 toast 部件即可，不必各自再兜一遍缺省
  const resolve = (item: NotificationRecord): ResolvedNotification => ({
    ...item,
    placement: notificationPlacementOf(item, fallback),
    type: item.type ?? 'info',
    // 单条 > notification > 内置默认，逐级兜底后必定是个具体数值。
    // loading 不自动消失那条规则住在 toast 机器里，不经 notification 的单条通知同样守得住
    duration: item.duration ?? prop('duration') ?? TOAST_DURATION,
    removeDelay: item.removeDelay ?? prop('removeDelay') ?? TOAST_REMOVE_DELAY,
    closable: item.closable ?? true,
    pauseOnPageIdle,
  })

  const list = visibleNotifications(context.get('items'), prop('max'), fallback).map(resolve)
  const byPlacement = (placement: NotificationPlacement): ResolvedNotification[] =>
    list.filter(item => item.placement === placement)

  return {
    visibleNotifications: list,
    // 按九宫格固定顺序，不按插入次序，否则同一批通知换个先后就会让整块界面重排
    placements: NOTIFICATION_PLACEMENTS.filter(placement => list.some(item => item.placement === placement)),
    count: list.length,
    getItemsByPlacement: byPlacement,

    create: (options = {}) => {
      const id = options.id ?? `notification-${scope.id}-${context.get('seq')}`
      send({ type: 'ITEMS.CREATE', item: { ...options, id } })
      return id
    },
    update: (id, options) => send({ type: 'ITEMS.UPDATE', id, patch: options }),
    dismiss: id => send({ type: 'ITEMS.DISMISS', id }),
    dismissAll: () => send({ type: 'ITEMS.DISMISS_ALL' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-count': list.length,
      'data-empty': dataAttr(list.length === 0),
      // 模态浮层给背景施加 inert 时跳过这棵子树，通知照旧可点、读屏也读得到
      [DATA_INERT_EXEMPT]: '',
    }),

    getGroupProps: (props = {}) => {
      const placement = props.placement ?? fallback
      const group = byPlacement(placement)
      return normalize.element({
        ...parts.group.attrs,
        // 地标挂在这一摞上，不挂 root：root 是 display:contents 的作用域包装，
        // 没有盒子、量出来 0×0，跳过去落不到任何看得见的地方。
        // 不是 live region——每条通知自己就是 status / alert，再套一层会宣读两遍
        'role': 'region',
        'aria-label': prop('translations')?.region ?? 'Notifications',
        'data-placement': placement,
        'data-count': group.length,
        'data-empty': dataAttr(group.length === 0),
        // 摞自己也带一份，单独摆在 body 下的那一摞不经 root 也能豁免
        [DATA_INERT_EXEMPT]: '',
        // 只交间距，不做定位：怎么贴边、朝哪一侧堆叠归样式层
        'style': { gap: `${gap}px` },
      })
    },
  }
}

/** 内部子态收敛成对外的三段式：running / paused 都是「还在台上」。 */
function toStatus(state: ToastSchema['state']): ToastStatus {
  if (state === 'dismissing' || state === 'unmounted')
    return state
  return 'visible'
}

/**
 * 类型到语气轴的映射。type 管行为（实时区级别、图标、是否自动消失），配色则统一交给
 * 全库共用的语气层，所以这里派生一份 data-tone 而不是让皮肤按 type 各写一套颜色。
 * error 在词汇表里叫 danger；loading 说的是「事情还没完」，不是好消息也不是坏消息，走中性。
 */
function toneOf(type: ToastType): string {
  if (type === 'error')
    return 'danger'
  if (type === 'loading')
    return 'neutral'
  return type
}

/**
 * 单条通知卡片。
 *
 * 计时、暂停与退场复用 toast 那台机器——那是「到点自己走的一条消息」这一通用行为，
 * 与「这条消息是主动推来的还是操作反馈」无关，没有理由抄第二份。
 */
export function connectNotificationItem<T extends PropTypes>(
  service: Service<ToastSchema>,
  normalize: NormalizeProps<T>,
): NotificationItemApi<T> {
  const { state, prop, send, context, scope } = service
  const ids = scope.ids('notification-item', 'title', 'description')

  const status = toStatus(state.get())
  const paused = state.matches('visible.paused')
  const type = prop('type') ?? 'info'
  const closable = prop('closable') ?? true
  const id = resolveToastId(prop('id'), scope)
  const unmounted = status === 'unmounted'

  return {
    id,
    status,
    type,
    title: prop('title'),
    description: prop('description'),
    paused,
    closable,
    remaining: context.get('remaining'),
    dismiss: () => send({ type: 'TOAST.DISMISS' }),
    pause: () => send({ type: 'TOAST.PAUSE', src: 'api' }),
    resume: () => send({ type: 'TOAST.RESUME', src: 'api' }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
      // 出错要打断当前朗读（alert + assertive），其余排队等空隙（status + polite）。
      // 两者都显式写：role 隐含的 live 值各家读屏并不一致。
      'role': type === 'error' ? 'alert' : 'status',
      'aria-live': type === 'error' ? 'assertive' : 'polite',
      // 整条一起念，否则用户会听到半截话
      'aria-atomic': 'true',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-severity': type,
      // 语气轴只挂在卡片上，子部件靠继承拿到语气槽
      'data-tone': toneOf(type),
      'data-state': status,
      'data-paused': dataAttr(paused),
      // 退场窗口走完只收起、不卸载，何时把这条从队列里删掉是宿主的决定
      'hidden': unmounted || undefined,
      // 指针停在通知上就把计时按住；pointerenter / pointerleave 不冒泡，只认本条这块区域
      'onPointerEnter': () => send({ type: 'TOAST.PAUSE', src: 'pointer' }),
      'onPointerLeave': () => send({ type: 'TOAST.RESUME', src: 'pointer' }),
      'onFocusIn': () => send({ type: 'TOAST.PAUSE', src: 'focus' }),
      'onFocusOut': (event: FocusEvent) => {
        // 焦点在本条内部换节点也会派 focusout，判据取焦点是不是真的离开了本条
        const next = event.relatedTarget as Node | null
        const root = event.currentTarget as Element | null
        if (next && root?.contains(next))
          return
        send({ type: 'TOAST.RESUME', src: 'focus' })
      },
    }),

    getItemIndicatorProps: () => normalize.element({
      ...parts['item-indicator'].attrs,
      // 纯装饰：这条是成功还是出错，标题里已经说了
      'aria-hidden': true,
    }),

    getItemTitleProps: () => normalize.element({
      ...parts['item-title'].attrs,
      id: ids.title,
    }),

    getItemDescriptionProps: () => normalize.element({
      ...parts['item-description'].attrs,
      id: ids.description,
    }),

    // 进入退场后机器不再接这两个事件，按钮点了也不会有第二次退场
    getItemActionTriggerProps: () => normalize.button({
      ...parts['item-action-trigger'].attrs,
      type: 'button',
      onClick: () => send({ type: 'TOAST.ACTION' }),
    }),

    getItemCloseTriggerProps: () => normalize.button({
      ...parts['item-close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 单体控件用原生 disabled：不可聚焦、也不占 Tab 位
      'disabled': !closable || undefined,
      'data-disabled': dataAttr(!closable),
      // 不可关闭时连按钮一起收起，不留一个按不动的叉
      'hidden': !closable || undefined,
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时原生 disabled 不生效，守卫得自己带
        if (!closable)
          return
        send({ type: 'TOAST.DISMISS' })
      },
    }),
  }
}
