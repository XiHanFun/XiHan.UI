/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 notification 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { ToastSchema, ToastStatus } from '../toast'
import type { NotificationApi, NotificationItemApi, NotificationPlacement, NotificationRecord, NotificationSchema, ResolvedNotification } from './notification.types'
import { DATA_INERT_EXEMPT, dataAttr } from '@xihan-ui/core'
import { resolveToastDuration, resolveToastId } from '../toast'
import { toastPressHandlers } from '../toast/toast.connect'
import { notificationAnatomy } from './notification.anatomy'
import {
  NOTIFICATION_GAP,
  NOTIFICATION_PLACEMENT,
  NOTIFICATION_PLACEMENTS,
  notificationMergeTarget,
  notificationPlacementOf,
  visibleNotifications,
} from './notification.machine'

const parts = notificationAnatomy.build()
// Notification 的停留时长独立于 Toast，两类反馈不共享默认值。
const NOTIFICATION_DURATION = 5000

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
    tone: item.tone ?? 'info',
    loading: item.loading ?? false,
    // 单条 > notification > 内置默认，逐级兜底后必定是个具体数值。
    // loading 不自动消失那条规则住在 toast 机器里，不经 notification 的单条通知同样守得住
    duration: item.duration ?? prop('duration') ?? NOTIFICATION_DURATION,
    closable: item.closable ?? true,
    pauseOnPageIdle,
    count: item.count ?? 1,
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
      const item = { ...options, id }
      send({ type: 'ITEMS.CREATE', item })
      // 并进了别人就把那一条的 id 交回去：调用方随后的 update/dismiss 才寻址得到
      return notificationMergeTarget(context.get('items'), item, prop('dedupe'))?.id ?? id
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
  // 语气直接落到全库共用的语气层上；加载中另有一位，字形与不自动消失都跟它走
  const tone = prop('tone') ?? 'info'
  const loading = !!prop('loading')
  const closable = prop('closable') ?? true
  const id = resolveToastId(prop('id'), scope)
  const unmounted = status === 'unmounted'
  const duration = resolveToastDuration(loading, prop('duration'))
  const autoDismiss = Number.isFinite(duration)
  // 按压通道：真源在 toast 机器 context 里「正被按住的那颗」，卡片按 part 键比对投影 data-pressed
  const pressed = context.get('pressed')
  const closePress = toastPressHandlers(service, 'close')
  const actionPress = toastPressHandlers(service, 'action')

  return {
    id,
    status,
    tone,
    loading,
    title: prop('title'),
    description: prop('description'),
    paused,
    closable,
    duration,
    remaining: context.get('remaining'),
    dismiss: () => send({ type: 'TOAST.DISMISS' }),
    pause: () => send({ type: 'TOAST.PAUSE', src: 'api' }),
    resume: () => send({ type: 'TOAST.RESUME', src: 'api' }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
      // 出错要打断当前朗读（alert + assertive），其余排队等空隙（status + polite）。
      // 两者都显式写：role 隐含的 live 值各家读屏并不一致。
      'role': tone === 'danger' ? 'alert' : 'status',
      'aria-live': tone === 'danger' ? 'assertive' : 'polite',
      // 整条一起念，否则用户会听到半截话
      'aria-atomic': 'true',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      // 不报 aria-busy：这一块本身就是活区，busy 会让读屏把「正在上传」这句压到完事才念
      'data-loading': dataAttr(loading),
      // 语气轴只挂在卡片上，子部件靠继承拿到语气槽
      'data-tone': tone,
      'data-state': status,
      'data-paused': dataAttr(paused),
      // 退场动画播完只收起、不卸载，何时把这条从队列里删掉是宿主的决定
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
      'type': 'button',
      // 带文案的离散动作钮：盒、悬停 / 按下与按压、焦点环由 Action Control 家族按这几位给。
      // 非 Button 的触发器缺省中性描边，取 text outline 档；Notification 没有 size 轴，固定 sm
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'outline',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；进入退场由机器撤下
      'data-pressed': dataAttr(pressed === 'action'),
      'onKeyDown': actionPress.onKeyDown,
      'onKeyUp': actionPress.onKeyUp,
      'onBlur': actionPress.onBlur,
      'onPointerDown': actionPress.onPointerDown,
      'onPointerUp': actionPress.onPointerUp,
      'onPointerCancel': actionPress.onPointerCancel,
      'onClick': () => send({ type: 'TOAST.ACTION' }),
    }),

    // 倒计时条：时长交给皮肤的时长槽，走一遍就到头，按住计时时由皮肤停住动画。
    // 不自动消失的那些没有可走的计时，整条收起
    getItemProgressProps: () => normalize.element({
      ...parts['item-progress'].attrs,
      'aria-hidden': true,
      'data-state': status,
      'hidden': !autoDismiss || undefined,
      'style': { '--xh-notification-progress-duration': autoDismiss ? `${duration}ms` : '' },
    }),

    getItemCloseTriggerProps: () => normalize.button({
      ...parts['item-close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 只有字形的离散动作钮：盒、悬停 / 按下与按压、粗指针热区、焦点环、禁用面由 Action Control 家族按这几位给。
      // 取 icon ghost 档；钉在卡片角上的叉与浮层角落关闭钮同一档，固定 sm（32px 正方盒）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'sm',
      // 单体控件用原生 disabled：不可聚焦、也不占 Tab 位；家族按 data-disabled 给禁用面
      'disabled': !closable || undefined,
      'data-disabled': dataAttr(!closable),
      // 不可关闭时连按钮一起收起，不留一个按不动的叉
      'hidden': !closable || undefined,
      // Space / Enter 与触屏按住投影 data-pressed；不可关闭时机器守卫不进，进入退场由机器撤下
      'data-pressed': dataAttr(pressed === 'close'),
      'onKeyDown': closePress.onKeyDown,
      'onKeyUp': closePress.onKeyUp,
      'onBlur': closePress.onBlur,
      'onPointerDown': closePress.onPointerDown,
      'onPointerUp': closePress.onPointerUp,
      'onPointerCancel': closePress.onPointerCancel,
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时原生 disabled 不生效，守卫得自己带
        if (!closable)
          return
        send({ type: 'TOAST.DISMISS' })
      },
    }),
  }
}
