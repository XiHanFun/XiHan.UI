/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 notification 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { ToastStatus, ToastTone } from '../toast'

/**
 * 语气与生命周期与轻提示使用同一套词汇：两者都是到期自行消失的消息。
 * 这里另起一份名字，是为了使用 notification 的作者不必在类型中读到 Toast。
 */
export type NotificationTone = ToastTone
export type NotificationStatus = ToastStatus

/** 九宫格落位。第一段是纵向、第二段是横向（start/end 跟随文字方向）。 */
export type NotificationPlacement
  = | 'top-start' | 'top' | 'top-end'
    | 'middle-start' | 'middle' | 'middle-end'
    | 'bottom-start' | 'bottom' | 'bottom-end'

/**
 * 队列中存放的一条通知，只存放可搬运的纯数据（无回调、无 DOM），
 * 受控队列因此可以被宿主整份替换、序列化、比对。
 */
export interface NotificationRecord {
  id: string
  title?: string
  description?: string
  tone?: NotificationTone
  /** 事情尚未完成：图标换为转圈，且不自动消失。 */
  loading?: boolean
  duration?: number
  closable?: boolean
  /** 单条覆盖落位；未提供时使用 notification 的 placement。 */
  placement?: NotificationPlacement
  /**
   * 行内动作按钮的文案。提供后才渲染动作部件。
   * 只存放文案不存放回调：该条记录需要能被整份替换、序列化、比对，
   * 按下之后的行为由宿主按 id 自行查询。
   */
  actionLabel?: string
  /** 移除时优先移除低优先级。未提供时按语气派生：error=2 / warning=1 / 其余=0。 */
  priority?: number
  /** 按内容合并后的条数，>1 时由 Headless 服务投影在标题后追加计数。 */
  count?: number
}

/**
 * 重复的处理方式。
 * 'id'（默认）只按 id 寻址，同 id 就地改写，其余各占一条；
 * 'content' 在此之上再按语气与两层文本全同合并，并累加 count。
 */
export type NotificationDedupe = 'id' | 'content'

/** create 的入参：id 可省略，省略时生成一个并由 create 返回。 */
export type NotificationOptions = Omit<NotificationRecord, 'id'> & { id?: string }

/** 补齐 notification 默认值后的条目；命令式服务标题仍统一经过合并计数投影。 */
export interface ResolvedNotification extends NotificationRecord {
  placement: NotificationPlacement
  tone: NotificationTone
  loading: boolean
  duration: number
  closable: boolean
  pauseOnPageIdle: boolean
  /** 合并计数，未合并时为 1。 */
  count: number
}

export interface NotificationItemsChangeDetails {
  items: NotificationRecord[]
}

export interface NotificationTranslations {
  /** 该组的名字，读屏按它宣读该区域。 */
  region: string
  /** 卡片上关闭按钮的读屏名。卡片复用 toast 的状态机，但文案归通知自身的命名空间。 */
  close: string
}

export interface NotificationGroupProps {
  /** 该组对应的位置；未提供时使用 notification 的 placement。 */
  placement?: NotificationPlacement
}

export interface NotificationSchema extends MachineSchema {
  props: {
    /** 受控队列：提供后由宿主决定，内部写入只发 onItemsChange。 */
    items?: NotificationRecord[]
    defaultItems?: NotificationRecord[]
    /** 默认落位，默认 bottom-end。 */
    placement?: NotificationPlacement
    /** 每个位置最多同时保留几条，超出时先移除低优先级、同级中移除最旧的。默认 5；提供 Infinity 即不限。 */
    max?: number
    /** 重复的处理方式，默认 'id'。 */
    dedupe?: NotificationDedupe
    /** 同一组内的间距（px），默认 16。 */
    gap?: number
    /** 单条未写 duration 时的默认停留毫秒。 */
    duration?: number
    /** 页面切到后台时暂停计时，逐条下发给 toast。 */
    pauseOnPageIdle?: boolean
    translations?: Partial<NotificationTranslations>
    onItemsChange?: (details: NotificationItemsChangeDetails) => void
  }
  context: {
    items: NotificationRecord[]
    /** 自动 id 的流水号。放在 context 而不是模块变量：同页两个 notification 各自分配。 */
    seq: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 队列本身就是全部状态，没有第二种模式，因此只有一个状态位。 */
  state: 'idle'
  event:
    /** 同 id 视为就地改写（loading 转 success 即经此路径）。 */
    | { type: 'ITEMS.CREATE', item: NotificationRecord }
    | { type: 'ITEMS.UPDATE', id: string, patch: Partial<NotificationOptions> }
    | { type: 'ITEMS.DISMISS', id: string }
    | { type: 'ITEMS.DISMISS_ALL' }
  tag: never
  guard: never
  action: 'createItem' | 'updateItem' | 'dismissItem' | 'dismissAllItems'
  effect: never
}

export interface NotificationApi<T extends PropTypes = PropTypes> {
  /** max 之内、按加入先后排列的可见条目，已补齐默认值。 */
  visibleNotifications: ResolvedNotification[]
  /** 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 */
  placements: NotificationPlacement[]
  count: number
  getItemsByPlacement: (placement: NotificationPlacement) => ResolvedNotification[]
  /** 入队并返回 id；同 id 已存在则就地改写，位置不变。 */
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  getRootProps: () => T['element']
  getGroupProps: (props?: NotificationGroupProps) => T['element']
}

/**
 * 单条通知卡片的 API。
 *
 * 计时、暂停与退场复用 toast 的状态机：那是到期自行消失的消息这一通用行为，
 * 与该消息是主动推送还是操作反馈无关。
 */
export interface NotificationItemApi<T extends PropTypes = PropTypes> {
  id: string
  status: NotificationStatus
  tone: NotificationTone
  loading: boolean
  title: string | undefined
  description: string | undefined
  /** 指针停在卡片上、或焦点落在其中时为真：计时被暂停。 */
  paused: boolean
  closable: boolean
  /** 停留总时长（毫秒）；不自动消失的条目恒为 Infinity。 */
  duration: number
  /** 剩余毫秒数；不自动消失的条目恒为 Infinity。 */
  remaining: number
  dismiss: () => void
  pause: () => void
  resume: () => void
  getItemProps: () => T['element']
  getItemIndicatorProps: () => T['element']
  getItemTitleProps: () => T['element']
  getItemDescriptionProps: () => T['element']
  getItemActionTriggerProps: () => T['button']
  /** 倒计时条：不自动消失时收起。 */
  getItemProgressProps: () => T['element']
  getItemCloseTriggerProps: () => T['button']
}
