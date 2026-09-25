/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 toast 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/** 轻提示的语气：与全库语气轴使用同一套词，决定配色、行首字形与实时区级别。加载中不是语气，另有 loading 一位。 */
export type ToastTone = 'info' | 'success' | 'warning' | 'danger'

/**
 * 对外的三段式生命周期。
 * visible 在状态机内部再分 running / paused 两个子态（计时器挂在 running 上），对外不区分。
 */
export type ToastStatus = 'visible' | 'dismissing' | 'unmounted'

/**
 * 暂停来源。可同时存在多个暂停，最后一个解除后才继续。
 * 'service' 是宿主整组一起暂停的路径，经 `paused` prop。
 */
export type ToastPauseSource = 'pointer' | 'focus' | 'page-idle' | 'api' | 'service'

/** 按压通道记住的按钮：close 是关闭按钮，action 是行内动作按钮。notification 的卡片复用同一套键。 */
export type ToastPressedPart = 'close' | 'action'

/** 该组落在视口的哪一格。第一段是纵向、第二段是横向（start/end 跟随文字方向）。 */
export type ToastPlacement
  = | 'top-start' | 'top' | 'top-end'
    | 'bottom-start' | 'bottom' | 'bottom-end'

/**
 * 服务档队列中存放的一条，只存放可搬运的纯数据（无回调、无 DOM）。
 * 没有 placement：一次操作的反馈落位是整个服务的口径，不应逐条分散。
 */
export interface ToastRecord {
  id: string
  title?: string
  description?: string
  tone?: ToastTone
  /** 事情尚未完成：行首换为转圈，且不自动消失。 */
  loading?: boolean
  duration?: number
  /** 是否显示关闭按钮；单组件与全局服务都默认开启。 */
  closable?: boolean
  /**
   * 行内动作按钮的文案。提供后才渲染 action-trigger 部件。
   * 只存放文案不存放回调：该条记录需要能被整份替换、序列化、比对，
   * 按下之后的行为由宿主按 id 自行查询。
   */
  actionLabel?: string
  /** 移除时优先移除低优先级。未提供时按语气派生：error=2 / warning=1 / 其余=0。 */
  priority?: number
  /** 按内容合并后的条数，>1 时由 Headless 服务投影在标题后追加计数。 */
  count?: number
}

/** 命令式 Toast 服务对单条记录补充的默认值。 */
export interface ToastServiceDefaults {
  duration?: number
  pauseOnPageIdle?: boolean
}

/** 三端默认模板共同消费的纯数据投影。 */
export interface ResolvedToastServiceItem {
  id: string
  title?: string
  description?: string
  tone: ToastTone
  loading: boolean
  duration?: number
  closable: boolean
  pauseOnPageIdle?: boolean
  actionLabel?: string
}

/** create 的入参：id 可省略，省略时生成一个并由 create 返回。 */
export type ToastOptions = Omit<ToastRecord, 'id'> & { id?: string }

export interface ToastStatusChangeDetails {
  /** 队列身份；未指定 id 时回退为实例 scope id。 */
  id: string
  status: ToastStatus
}

export interface ToastActionDetails {
  id: string
}

export interface ToastTranslations {
  close: string
}

export interface ToastSchema extends MachineSchema {
  props: {
    /** 队列身份。服务档用它作为 create / update / dismiss 的寻址键。 */
    id?: string
    /** 标题文本；作者未在 title 部件中写内容时由适配器填入。 */
    title?: string
    /** 可选的补充说明；应保持简短，需要持续阅读的长内容改用 notification。 */
    description?: string
    /** 语气，默认 info。danger 使用 alert + assertive。 */
    tone?: ToastTone
    /** 事情尚未完成：行首换为转圈，且不自动消失（duration 不再生效），完成后改写为其他语气收尾。 */
    loading?: boolean
    /** 停留毫秒，默认 4000。<=0 或非有限数即不自动消失。 */
    duration?: number
    /** 是否显示可用的关闭按钮，默认 true。 */
    closable?: boolean
    /** 页面切到后台时暂停计时，默认 false；全局服务默认开启。 */
    pauseOnPageIdle?: boolean
    /**
     * 由宿主暂停计时，默认 false。整组一起暂停经此路径：
     * 置真时登记 'service' 暂停来源，置假时移除它，与指针、焦点等来源并存。
     */
    paused?: boolean
    translations?: Partial<ToastTranslations>
    /** 生命周期落定时通知：dismissing 与 unmounted 各一次。宿主据此把条目移出队列。 */
    onStatusChange?: (details: ToastStatusChangeDetails) => void
    /** 操作按钮被按下。 */
    onAction?: (details: ToastActionDetails) => void
  }
  context: {
    /**
     * 剩余毫秒数。暂停时扣除已经过的部分，恢复时继续剩余部分。
     * Infinity 表示不自动消失。
     */
    remaining: number
    /** 当前暂停计时的来源集合，空集即计时进行中。 */
    pausedBy: ToastPauseSource[]
    /**
     * 正被按住的按钮：Space / Enter 或触屏手指按下到松开之间，该按钮投影 data-pressed；没有按住时为 null。
     * 抬起、失焦、指针取消，或进入退场（按钮随条目一起离场）时撤下。
     */
    pressed: ToastPressedPart | null
  }
  computed: Record<string, never>
  refs: {
    /**
     * 渲染宿主交来的进出场闸门：进入 dismissing 后等它的退场动画播完再转 unmounted。
     * 没有渲染宿主（无 DOM、直接驱动状态机）时为 null，没有退场可播，下一拍即转 unmounted。
     */
    presence: PresenceHandle | null
  }
  state: 'visible' | 'visible.running' | 'visible.paused' | 'dismissing' | 'unmounted'
  event:
    /** 立即进入退场（关闭按钮、宿主命令）。 */
    | { type: 'TOAST.DISMISS' }
    /** 操作按钮被按下：先发 onAction，再进入退场。 */
    | { type: 'TOAST.ACTION' }
    | { type: 'TOAST.PAUSE', src: ToastPauseSource }
    | { type: 'TOAST.RESUME', src: ToastPauseSource }
    /** 时长预算被改写（loading / duration 变化），重新计算并重启计时器。 */
    | { type: 'TOAST.RESET' }
    | { type: 'after.duration' }
    /** 退场动画播完（或没有退场可播）。 */
    | { type: 'EXIT.COMPLETE' }
    /** 按压通道：某颗按钮被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START', part: ToastPressedPart }
    /** 该按钮抬起、失焦或指针取消。 */
    | { type: 'PRESS.END', part: ToastPressedPart }
  tag: never
  guard: 'isLastPauseSource' | 'canPress'
  action:
    | 'addPauseSource'
    | 'removePauseSource'
    | 'resetDuration'
    | 'syncDuration'
    | 'syncPaused'
    | 'invokeAction'
    | 'invokeDismissing'
    | 'invokeUnmounted'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackDuration' | 'waitForExit' | 'trackPageIdle'
}

export interface ToastApi<T extends PropTypes = PropTypes> {
  id: string
  status: ToastStatus
  tone: ToastTone
  loading: boolean
  title: string | undefined
  description: string | undefined
  /** 计时暂停中。倒计时的可见反馈由使用者自行渲染，该标记是留给使用者的钩子：自带皮肤不绘制。 */
  paused: boolean
  closable: boolean
  /** 剩余毫秒；不自动消失时为 Infinity。 */
  remaining: number
  dismiss: () => void
  pause: () => void
  resume: () => void
  /** 停留总时长（毫秒）；不自动消失时为 Infinity。 */
  duration: number
  getRootProps: () => T['element']
  /** 语气指示符：作者放入自己的图形，未放入时由皮肤按语气绘制兜底字形，加载中换为转圈。 */
  getIndicatorProps: () => T['element']
  /** 标题与说明的文本列。 */
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getActionTriggerProps: () => T['button']
  /** 倒计时条：不自动消失时收起。 */
  getProgressProps: () => T['element']
  getCloseTriggerProps: () => T['button']
}
