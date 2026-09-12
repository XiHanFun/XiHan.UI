import type { Tone } from '@xihan-ui/core'
import type {
  DialogServiceBadge,
  LoadingBarTranslations,
  NotificationDedupe,
  NotificationOptions,
  NotificationPlacement,
  NotificationTranslations,
  ToastOptions,
  ToastPlacement,
  ToastTranslations,
} from '@xihan-ui/headless'

/**
 * 四个服务共有的入参。
 *
 * 这一侧没有 config：全局配置沿 DOM 祖先链解析，服务的宿主容器就挂在文档里，
 * 语言、尺寸、浮层落点直接由 setXhConfig 与外层 `<xh-config>` 说了算。
 */
export interface ServiceHostOptions {
  /** 宿主容器；不给就在浮层落点下新建一个。 */
  target?: HTMLElement
}

// —— 轻提示 ——

/**
 * create 的入参。`actionLabel` 是条子上那颗行内动作钮的文案，`onAction` 是按下它做什么——
 * 回调不进队列记录（那份要能被整份替换、序列化、比对），服务按 id 单独存一张表。
 */
export interface ToastCreateOptions extends ToastOptions {
  onAction?: () => void
}

/** 类型糖的入参：只差 type，其余同 create。 */
export type ToastMessageOptions = Omit<ToastCreateOptions, 'type' | 'title'>

/** promise 三态的文案：成功与失败可以给函数，拿到结果再拼话。 */
export interface ToastPromiseOptions<T> extends Omit<ToastMessageOptions, 'duration'> {
  loading: string
  success: string | ((value: T) => string)
  error: string | ((reason: unknown) => string)
}

export interface ToastServiceOptions extends ServiceHostOptions {
  /** 那一摞落在哪儿，默认 'top'：视线正好在刚才操作的地方上方。 */
  placement?: ToastPlacement
  /** 最多同时留几条，默认 5；超出先挤低优先级的，同级里挤最旧的。 */
  max?: number
  /** 重复怎么算，默认 'id'；给 'content' 则同一句话合并成一条并计数。 */
  dedupe?: NotificationDedupe
  /** 摞内间距（px），默认 16。 */
  gap?: number
  duration?: number
  removeDelay?: number
  pauseOnPageIdle?: boolean
  /** toast 部件的文案（关闭钮的读屏名等）。 */
  toastTranslations?: Partial<ToastTranslations>
}

export interface ToastService {
  /** 入队并返回 id；同 id 已存在则就地改写，合并掉的返回被并进的那一条。 */
  create: (options?: ToastCreateOptions) => string
  update: (id: string, options: Partial<ToastOptions>) => void
  /** 立刻从队列里删掉。条子自己的关闭按钮走的是退场窗口，有退场动画。 */
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (message: string, options?: ToastMessageOptions) => string
  success: (message: string, options?: ToastMessageOptions) => string
  warning: (message: string, options?: ToastMessageOptions) => string
  error: (message: string, options?: ToastMessageOptions) => string
  /** 返回 id，之后用 update(id, { type: 'success', title: … }) 收尾。 */
  loading: (message: string, options?: ToastMessageOptions) => string
  /**
   * 先弹一条 loading，Promise 落定后就地改写成 success / error。
   * 返回那一条的 id；Promise 的结果原样交回给调用方，拒绝也照旧拒绝。
   */
  promise: <T>(input: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>) => Promise<T>
  /** 把当下这一摞的计时全按住，'service' 这一路与指针、焦点并存。 */
  pauseAll: () => void
  resumeAll: () => void
  /** 撤掉宿主容器并停机。 */
  dispose: () => void
}

// —— 通知 ——

/** 同 toast 的处置：文案进记录，回调按 id 存服务侧的表。 */
export interface NotificationCreateOptions extends NotificationOptions {
  onAction?: () => void
}

export type NotificationMessageOptions = Omit<NotificationCreateOptions, 'type' | 'title'>

export interface NotificationServiceOptions extends ServiceHostOptions {
  /** 默认落位，默认 bottom-end；单条可用 options.placement 覆盖。 */
  placement?: NotificationPlacement
  /** 每个位置最多同时留几条，超出先挤低优先级的、同级里挤最旧的。默认 5；给 Infinity 即不限。 */
  max?: number
  /** 重复怎么算，默认 'id'。 */
  dedupe?: NotificationDedupe
  /** 同一摞内的间距（px），默认 16。 */
  gap?: number
  duration?: number
  removeDelay?: number
  pauseOnPageIdle?: boolean
  /** 通知的文案：那一摞的读屏名与卡片上那颗叉的读屏名，一个桶装完。 */
  translations?: Partial<NotificationTranslations>
}

export interface NotificationService {
  /** 入队并返回 id；同 id 已存在则就地改写，位置不动。 */
  create: (options?: NotificationCreateOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (title: string, options?: NotificationMessageOptions) => string
  success: (title: string, options?: NotificationMessageOptions) => string
  warning: (title: string, options?: NotificationMessageOptions) => string
  error: (title: string, options?: NotificationMessageOptions) => string
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
  /** 确认钮语气，默认 brand；危险操作传 danger。 */
  tone?: Tone
  /** 标题旁的类型徽记。不给则不出徽记。 */
  badge?: DialogServiceBadge
  okText?: string
  cancelText?: string
  /** false 阻止关闭；抛错或 Promise 拒绝进入 actionError，保持打开。 */
  onOk?: () => boolean | void | Promise<unknown>
  /** 动作失败通知；通知自身失败时拒绝所属请求。 */
  onActionError?: (error: DialogActionError) => void | Promise<void>
}

/** 单按钮告知框的入参：没有取消钮，徽记由预设档自己定，其余同 confirm。 */
export type AlertOptions = Omit<ConfirmOptions, 'tone' | 'badge'>

export interface DialogServiceOptions extends ServiceHostOptions {
  /** 确认钮文案，缺省 OK。 */
  okText?: string
  /** 取消钮文案，缺省 Cancel。 */
  cancelText?: string
  /** 动作失败时的安全提示，与按钮文案相同由调用方提供本地化文字。 */
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
  /** 正常收尾的语气，缺省 brand。 */
  tone?: Tone
  /** error() 收尾用的语气，缺省 danger：出错的收尾要与正常收尾区分得开。 */
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
  /** 切成确定进度：给了值就照它显示，内部爬升停止；再 start() 回到不确定。 */
  set: (value: number) => void
  dispose: () => void
}
