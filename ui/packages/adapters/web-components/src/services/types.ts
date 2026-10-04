/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 types 类型契约。

import type { Tone } from '@xihan-ui/core'
import type {
  DialogServiceBadge,
  LoadingBarTranslations,
  NotificationDedupe,
  NotificationOptions,
  NotificationPlacement,
  NotificationPreset,
  NotificationTranslations,
} from '@xihan-ui/headless'

/**
 * 三个服务共有的入参。
 *
 * 这一侧没有 config：全局配置沿 DOM 祖先链解析，服务的宿主容器就挂在文档里，
 * 语言、尺寸、浮层落点直接由 setXhConfig 与外层 `<xh-config>` 说了算。
 */
export interface ServiceHostOptions {
  /** 宿主容器；未提供时在浮层落点下新建一个。 */
  target?: HTMLElement
}

// —— 通知 ——

/**
 * create 的入参。`actionLabel` 是卡片上行内动作按钮的文案，`onAction` 是按下它执行的动作：
 * 回调不进入队列记录（该记录要能被整份替换、序列化、比对），服务按 id 单独保存一张表。
 */
export interface NotificationCreateOptions extends NotificationOptions {
  onAction?: () => void
}

export type NotificationMessageOptions = Omit<NotificationCreateOptions, 'tone' | 'loading' | 'title'>

/** promise 三态的标题：成功与失败可以给函数，拿到结果再拼标题。 */
export interface NotificationPromiseOptions<T> extends Omit<NotificationMessageOptions, 'duration'> {
  loading: string
  success: string | ((value: T) => string)
  error: string | ((reason: unknown) => string)
}

export interface NotificationServiceOptions extends ServiceHostOptions {
  /** 形态预设，默认 card；轻提示传 'toast'。决定下面几项没写时的缺省值与卡片排版。 */
  preset?: NotificationPreset
  /** 默认落位：card 为 bottom-end，toast 为 bottom；单条可用 options.placement 覆盖。 */
  placement?: NotificationPlacement
  /** 每个位置最多同时留几条，超出先挤低优先级的、同级里挤最旧的：card 为 5、toast 为 3；给 Infinity 即不限。 */
  max?: number
  /** 重复怎么算，默认 'id'；给 'content' 则同一句话合并成一条并计数。 */
  dedupe?: NotificationDedupe
  /** 同一堆叠内的间距（px）：card 为 16、toast 为 12。 */
  gap?: number
  /** 单条未写 duration 时的停留毫秒：card 为 5000、toast 为 4000。 */
  duration?: number
  /** 同一位置的几条叠成一摞：card 默认不叠，toast 默认叠。 */
  stacked?: boolean
  /** 页面切到后台时暂停计时：card 默认关闭，toast 默认开启。 */
  pauseOnPageIdle?: boolean
  /** 通知的文案：堆叠区的读屏名与卡片上关闭按钮的读屏名，统一在一个桶中。 */
  translations?: Partial<NotificationTranslations>
}

export interface NotificationService {
  /** 入队并返回 id；同 id 已存在则就地改写，位置不动；合并掉的返回被并进的那一条。 */
  create: (options?: NotificationCreateOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  /** 立刻从队列里删掉，不播退场动画。卡片自己的关闭按钮先播退场动画再移出。 */
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (title: string, options?: NotificationMessageOptions) => string
  success: (title: string, options?: NotificationMessageOptions) => string
  warning: (title: string, options?: NotificationMessageOptions) => string
  danger: (title: string, options?: NotificationMessageOptions) => string
  /** 以 loading 态弹出一条并返回 id，之后用 update(id, { loading: false, tone: 'success', title: … }) 收尾。 */
  loading: (title: string, options?: NotificationMessageOptions) => string
  /**
   * 先弹出一条 loading，Promise 落定后就地改写为 success / danger；说明等其余字段三态共用。
   * Promise 的结果原样交回调用方，拒绝也照旧拒绝。
   */
  promise: <T>(input: Promise<T> | (() => Promise<T>), options: NotificationPromiseOptions<T>) => Promise<T>
  /** 把当下这些卡片的计时全按住。 */
  pauseAll: () => void
  resumeAll: () => void
  dispose: () => void
}

// —— 确认框 ——

/** 对话框正文：给串走 description 部件（读屏的 aria-describedby 接在它上面）。 */
export type DialogBody = string | ((body: HTMLElement) => void)

/** 动作异常保留原始原因；可见文案由 actionErrorText 提供。 */
export interface DialogActionError {
  cause: unknown
}

export interface ConfirmOptions {
  title: string
  content?: DialogBody
  /** 确认按钮语气，默认 brand；危险操作传 danger。 */
  tone?: Tone
  /** 标题旁的类型徽记。未提供时不显示徽记。 */
  badge?: DialogServiceBadge
  okText?: string
  cancelText?: string
  /** false 阻止关闭；抛错或 Promise 拒绝进入 actionError，保持打开。 */
  onOk?: () => boolean | void | Promise<unknown>
  /** 动作失败通知；通知自身失败时拒绝所属请求。 */
  onActionError?: (error: DialogActionError) => void | Promise<void>
}

/** 单按钮告知框的入参：没有取消按钮，徽记由预设档决定，其余同 confirm。 */
export type AlertOptions = Omit<ConfirmOptions, 'tone' | 'badge'>

export interface DialogServiceOptions extends ServiceHostOptions {
  /** 确认按钮文案；未提供时取宿主所在处全局配置的 translations.dialog.ok，再退英文语言包（OK）。 */
  okText?: string
  /** 取消按钮文案；未提供时取 translations.dialog.cancel，再退英文语言包（Cancel）。 */
  cancelText?: string
  /** 动作失败时的安全提示；未提供时取 translations.dialog.actionError。 */
  actionErrorText?: string
}

export interface DialogService {
  /** 当前请求的动作异常，重试、关闭和切换请求时清空。 */
  readonly actionError: DialogActionError | null
  /** 确认走 onOk 后 resolve true；取消/Esc resolve false。 */
  confirm: (options: ConfirmOptions) => Promise<boolean>
  info: (options: AlertOptions) => Promise<void>
  success: (options: AlertOptions) => Promise<void>
  warning: (options: AlertOptions) => Promise<void>
  error: (options: AlertOptions) => Promise<void>
  dispose: () => void
}

// —— 顶部进度条 ——

export interface LoadingBarServiceOptions extends ServiceHostOptions {
  /** 正常收尾的语气，默认 brand。 */
  tone?: Tone
  /** error() 收尾使用的语气，默认 danger：出错的收尾要与正常收尾区分开。 */
  errorTone?: Tone
  height?: string | number
  color?: string
  trickle?: boolean
  trickleSpeed?: number
  minimum?: number
  fadeDuration?: number
  translations?: Partial<LoadingBarTranslations>
}

export interface LoadingBarService {
  /** 在途计数 +1；从 0 起跳即开始爬升。 */
  start: () => void
  /** 在途计数 -1（夹到 0，多调不会变负）；归零才收。 */
  finish: () => void
  /** 强制归零并以 errorTone 收。 */
  error: () => void
  /** 不管还剩几笔在途一律收掉（路由跳走时用）。 */
  finishAll: () => void
  /** 切换为确定进度：提供值时按值显示，内部爬升停止；再次 start() 回到不确定。 */
  set: (value: number) => void
  dispose: () => void
}
