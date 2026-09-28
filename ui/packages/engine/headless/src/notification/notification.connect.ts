/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 notification 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type {
  NotificationApi,
  NotificationItemApi,
  NotificationItemSchema,
  NotificationPlacement,
  NotificationPressedPart,
  NotificationRecord,
  NotificationSchema,
  NotificationStatus,
  ResolvedNotification,
} from './notification.types'
import { createPressTracker, DATA_INERT_EXEMPT, dataAttr } from '@xihan-ui/core'
import { countdownSteps, resolveNotificationDuration, resolveNotificationItemId } from './notification-item.machine'
import { notificationAnatomy } from './notification.anatomy'
import {
  NOTIFICATION_PLACEMENTS,
  notificationMergeTarget,
  notificationPlacementOf,
  visibleNotifications,
} from './notification.machine'
import { notificationPresetOf } from './notification.presets'

const parts = notificationAnatomy.build()

export function connectNotification<T extends PropTypes>(
  service: Service<NotificationSchema>,
  normalize: NormalizeProps<T>,
): NotificationApi<T> {
  const { prop, send, context, scope } = service

  const preset = prop('preset') ?? 'card'
  const defaults = notificationPresetOf(preset)
  const fallback = prop('placement') ?? defaults.placement
  const gap = prop('gap') ?? defaults.gap
  const max = prop('max') ?? defaults.max
  const stacked = prop('stacked') ?? defaults.stacked
  const pauseOnPageIdle = prop('pauseOnPageIdle') ?? defaults.pauseOnPageIdle
  const expanded = context.get('expanded')
  const isExpanded = (placement: NotificationPlacement): boolean => stacked && expanded.includes(placement)

  // 把 notification 的默认值烘进每一条，适配器直接摊给卡片即可，不必各自再兜一遍缺省
  const resolve = (item: NotificationRecord): ResolvedNotification => {
    const placement = notificationPlacementOf(item, fallback)
    return {
      ...item,
      preset,
      placement,
      tone: item.tone ?? 'info',
      loading: item.loading ?? false,
      // 单条 > notification > 预设，逐级兜底后必定是个具体数值。
      // loading 不自动消失那条规则住在卡片的机器里，单独摆放的卡片同样守得住
      duration: item.duration ?? prop('duration') ?? defaults.duration,
      closable: item.closable ?? true,
      pauseOnPageIdle,
      count: item.count ?? 1,
    }
  }

  const list = visibleNotifications(context.get('items'), max, fallback).map(resolve)
  const byPlacement = (placement: NotificationPlacement): ResolvedNotification[] =>
    list.filter(item => item.placement === placement)

  return {
    preset,
    stacked,
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
        // 摞的宽度与贴边随预设：轻提示一摞比卡片宽、离视口边更近
        'data-preset': preset,
        // 叠成一摞：条目改由叠摞测量排位，皮肤按它换成固定宽度的定位面
        'data-stacked': dataAttr(stacked),
        // 这一摞正被指针或焦点展开：卡片各自盯着它按住计时，一条条读的时候别的卡片不该在眼皮底下走掉
        'data-expanded': dataAttr(isExpanded(placement)),
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
function toStatus(state: NotificationItemSchema['state']): NotificationStatus {
  if (state === 'dismissing' || state === 'unmounted')
    return state
  return 'visible'
}

/**
 * 按压通道：两颗按钮各自合成一份跟踪器，真源是机器 context 里「正被按住的那颗」；
 * Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档。
 */
function itemPressHandlers(service: Service<NotificationItemSchema>, part: NotificationPressedPart): PressHandlers {
  const { context, send } = service
  return createPressTracker({
    isPressed: () => context.get('pressed') === part,
    onChange: down => send({ type: down ? 'PRESS.START' : 'PRESS.END', part }),
  })
}

/**
 * 单条通知卡片：一条到期自行消失的消息。
 * 卡片与轻提示是同一种卡片的两种预设：计时、暂停、按压与退场同一台机器，差别只在排版与关闭钮档位。
 */
export function connectNotificationItem<T extends PropTypes>(
  service: Service<NotificationItemSchema>,
  normalize: NormalizeProps<T>,
): NotificationItemApi<T> {
  const { state, prop, send, context, scope } = service
  const ids = scope.ids('notification-item', 'title', 'description')

  const preset = prop('preset') ?? 'card'
  const toast = preset === 'toast'
  const status = toStatus(state.get())
  const paused = state.matches('visible.paused')
  // 语气直接落到全库共用的语气层上；加载中另有一位，字形与不自动消失都跟它走
  const tone = prop('tone') ?? 'info'
  const loading = !!prop('loading')
  const closable = prop('closable') ?? true
  const id = resolveNotificationItemId(prop('id'), scope)
  const unmounted = status === 'unmounted'
  const duration = resolveNotificationDuration(loading, prop('duration'), preset)
  const autoDismiss = Number.isFinite(duration)
  // 按压通道：真源在机器 context 里「正被按住的那颗」，按 part 键比对投影 data-pressed
  const pressed = context.get('pressed')
  const closePress = itemPressHandlers(service, 'close')
  const actionPress = itemPressHandlers(service, 'action')

  return {
    id,
    preset,
    status,
    tone,
    loading,
    title: prop('title'),
    description: prop('description'),
    paused,
    closable,
    duration,
    remaining: context.get('remaining'),
    dismiss: () => send({ type: 'ITEM.DISMISS' }),
    pause: () => send({ type: 'ITEM.PAUSE', src: 'api' }),
    resume: () => send({ type: 'ITEM.RESUME', src: 'api' }),

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
      // 排版随预设：卡片是两列网格、叉钉在右上角；轻提示是一行，叉排在行尾
      'data-preset': preset,
      // 不报 aria-busy：这一块本身就是活区，busy 会让读屏把「正在上传」这句压到完事才念
      'data-loading': dataAttr(loading),
      // 轻提示没渲染 item-indicator 时行首的兜底字形画在卡片自己的伪元素上：环那一层接加载环配方。
      // 伪元素有没有由皮肤按预设决定，卡片预设不画它，环也就不出现
      'data-xh-loading-ring': '',
      // 语气轴只挂在卡片上，子部件靠继承拿到语气槽
      'data-tone': tone,
      'data-state': status,
      'data-paused': dataAttr(paused),
      // 退场动画播完只收起、不卸载，何时把这条从队列里删掉是宿主的决定
      'hidden': unmounted || undefined,
      // 指针停在通知上就把计时按住；pointerenter / pointerleave 不冒泡，只认本条这块区域
      'onPointerEnter': () => send({ type: 'ITEM.PAUSE', src: 'pointer' }),
      'onPointerLeave': () => send({ type: 'ITEM.RESUME', src: 'pointer' }),
      'onFocusIn': () => send({ type: 'ITEM.PAUSE', src: 'focus' }),
      'onFocusOut': (event: FocusEvent) => {
        // 焦点在本条内部换节点也会派 focusout，判据取焦点是不是真的离开了本条
        const next = event.relatedTarget as Node | null
        const root = event.currentTarget as Element | null
        if (next && root?.contains(next))
          return
        send({ type: 'ITEM.RESUME', src: 'focus' })
      },
    }),

    getItemIndicatorProps: () => normalize.element({
      ...parts['item-indicator'].attrs,
      // 纯装饰：这条是成功还是出错，标题里已经说了
      'aria-hidden': true,
      'data-loading': dataAttr(loading),
      // 兜底的环那一层接加载环配方，随 data-loading 淡入淡出
      'data-xh-loading-ring': '',
    }),

    getItemContentProps: () => normalize.element({
      ...parts['item-content'].attrs,
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
      // 非 Button 的触发器缺省中性描边，取 text outline 档；卡片没有 size 轴，固定 sm
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
      'onClick': () => send({ type: 'ITEM.ACTION' }),
    }),

    // 倒计时条：时长交给皮肤的时长槽，走一遍就到头，按住计时时由皮肤停住动画；
    // 减弱动效下皮肤按秒分段，段数随时长一起交出。不自动消失的那些没有可走的计时，整条收起
    getItemProgressProps: () => normalize.element({
      ...parts['item-progress'].attrs,
      'aria-hidden': true,
      'data-state': status,
      'hidden': !autoDismiss || undefined,
      'style': {
        '--xh-notification-progress-duration': autoDismiss ? `${duration}ms` : '',
        '--xh-_notification-progress-steps': autoDismiss ? String(countdownSteps(duration)) : '',
      },
    }),

    getItemCloseTriggerProps: () => normalize.button({
      ...parts['item-close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 只有字形的离散动作钮：盒、悬停 / 按下与按压、粗指针热区、焦点环、禁用面由 Action Control 家族按这几位给。
      // 取 icon ghost 档。卡片的叉钉在角上，与浮层角落关闭钮同一档（sm，32px 正方盒）；
      // 轻提示的叉排在一行短消息的行尾，走行级动作钮的 xs（24px）。
      // 轻提示的叉在可悬停设备上平时收起，那一档不走家族的 hover-focus（它用 visibility 收起，
      // 这颗叉占 Tab 位，收起后键盘够不到），由皮肤按卡片的悬停 / 焦点只压 opacity
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': toast ? 'xs' : 'sm',
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
        send({ type: 'ITEM.DISMISS' })
      },
    }),
  }
}
