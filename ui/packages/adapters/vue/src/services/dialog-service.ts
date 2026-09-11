// 全局命令式确认框服务：confirm/info/success/warning/error 一次调用弹出，
// 自带标题徽记、正文与按钮行。同一时刻只挂一个对话框，后来的排队顺次弹出，
// 避开多层模态叠加。onOk 返回 Promise 时确认钮自动进入 pending 并拦住关闭，
// 失败保持打开以便重试或取消。
import type { Tone } from '@xihan-ui/core'
import type { App, MaybeRefOrGetter, VNodeChild } from 'vue'
import type { XhConfig } from '../config/config'
import { ensurePortalRoot } from '@xihan-ui/core'
import { createApp, defineComponent, h, reactive, shallowRef, toRaw, toValue } from 'vue'
import { XhButton, XhButtonIndicator, XhButtonLabel } from '../components/button'
import { XhDialogBody, XhDialogContent, XhDialogDescription, XhDialogFooter, XhDialogHeader, XhDialogIndicator, XhDialogRoot, XhDialogTitle } from '../components/dialog/dialog'
import { spinArc } from './glyph'
import { createServiceConfig } from './service-config'

/**
 * 对话框正文。给串走 description 部件（读屏的 aria-describedby 由它接）；
 * 给渲染函数则整块摊在正文位，自己决定渲染什么。
 *
 * 不收裸 VNode：服务的宿主是常驻的，忙态一翻就整棵重渲，
 * 同一个 VNode 实例被复用时的行为未定义。
 */
export type DialogBody = string | (() => VNodeChild)

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
  badge?: 'info' | 'success' | 'warning' | 'error'
  okText?: MaybeRefOrGetter<string>
  cancelText?: MaybeRefOrGetter<string>
  /** false 阻止关闭；抛错或 Promise 拒绝进入 actionError，保持打开。 */
  onOk?: () => boolean | void | Promise<unknown>
  /** 动作失败通知；通知自身失败时拒绝所属请求。 */
  onActionError?: (error: DialogActionError) => void | Promise<void>
}

/** 单按钮告知框的入参：没有取消钮，徽记由预设档自己定，其余同 confirm。 */
export type AlertOptions = Omit<ConfirmOptions, 'tone' | 'badge'>

/** 取值型弹窗的入参。正文自己拼表单，确认时把那份值带回来。 */
export interface PromptOptions<T extends object> extends Omit<ConfirmOptions, 'onOk' | 'content'> {
  /** 每次打开建一份初值；服务用 reactive 包起来交给 body 与 onOk，两边同一份。 */
  initialValue: T
  /** 用那份可写代理渲染表单主体。 */
  body: (value: T) => VNodeChild
  /** 落焦到哪个节点，CSS 选择器。 */
  initialFocus?: string
  /** false 只阻止关闭；抛错或拒绝进入独立动作异常，弹窗保持打开。 */
  onOk?: (value: T) => boolean | void | Promise<boolean | void>
}

export interface DialogServiceOptions {
  /** 确认钮文案，缺省 OK。 */
  okText?: MaybeRefOrGetter<string>
  /** 取消钮文案，缺省 Cancel。 */
  cancelText?: MaybeRefOrGetter<string>
  /** 动作失败时的安全提示，支持与按钮文案相同的响应式来源。 */
  actionErrorText?: MaybeRefOrGetter<string>
  /**
   * 喂给对话框子树的全局配置（locale / translations / size / portalContainer）。
   * 本服务自带宿主应用，接不到组件树里的 provideXhConfig，要让它跟应用同语言就从这里给；
   * 传 ref/getter 即可运行期跟着切语言，也可以之后用 setConfig 推。
   */
  config?: MaybeRefOrGetter<XhConfig>
  /** 宿主容器；不给就在 body 下新建一个。 */
  target?: HTMLElement
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
  /** 确认后 resolve 一份值的普通对象快照；取消 / Esc / 卸载 resolve null。 */
  prompt: <T extends object>(options: PromptOptions<T>) => Promise<T | null>
  /** 换一份全局配置源。 */
  setConfig: (next: MaybeRefOrGetter<XhConfig> | undefined) => void
  /** 卸载宿主应用并移除容器。 */
  dispose: () => void
}

interface Spec {
  title: string
  content?: DialogBody
  tone: Tone
  okText: MaybeRefOrGetter<string>
  cancelText: MaybeRefOrGetter<string>
  showCancel: boolean
  /** 标题旁的类型徽记（预设档用），confirm 不带。 */
  badge?: 'info' | 'success' | 'warning' | 'error'
  /** 返回 false 阻止本次确认；异常由独立错误状态报告。 */
  onOk?: () => unknown
  onActionError?: (error: DialogActionError) => void | Promise<void>
  attempt: number
  /** 取值型弹窗的正文与那份可写的值，两边同一个对象。 */
  body?: (value: object) => VNodeChild
  value?: object
  initialFocus?: string
  resolve: (ok: boolean) => void
  reject: (cause: unknown) => void
  settled: boolean
}

/** 关到再开之间留出退场窗口，动效走完再放下一个。 */
const EXIT_WINDOW_MS = 250

export function createDialogService(options: DialogServiceOptions = {}): DialogService {
  if (typeof document === 'undefined')
    throw new Error('createDialogService 需要 document；SSR 里请等到客户端再创建')

  // 文案不在创建时求值：队列里的对话框会跨过一次切语言
  const defaults = { okText: options.okText ?? 'OK', cancelText: options.cancelText ?? 'Cancel' }
  const configSource = createServiceConfig(options.config)
  const holder = options.target ?? document.createElement('div')
  let hostFailure: { cause: unknown } | null = null
  try {
    if (!options.target)
      ensurePortalRoot(document).appendChild(holder)
    if (holder.nodeType !== 1 || holder.ownerDocument !== document || !holder.isConnected)
      throw new Error('DialogService target 必须是当前文档中已连接的元素')
  }
  catch (cause) {
    hostFailure = { cause }
  }

  // 当前项单独放 shallowRef：进 reactive 会把 Spec 里那几个 MaybeRefOrGetter 的 Ref 分支解包掉
  const current = shallowRef<Spec | null>(null)
  const actionError = shallowRef<DialogActionError | null>(null)
  const state = reactive({
    open: false,
    busy: false,
  })
  const queue: Spec[] = []
  let disposed = false
  let advanceTimer: ReturnType<typeof setTimeout> | null = null

  function next(): void {
    if (disposed || current.value || queue.length === 0)
      return
    current.value = queue.shift()!
    actionError.value = null
    state.busy = false
    state.open = true
  }

  function settle(ok: boolean): void {
    const spec = current.value
    if (!spec || spec.settled)
      return
    spec.settled = true
    actionError.value = null
    spec.resolve(ok)
  }

  /** 退场窗口走完再清当前项、放下一个；程序化关闭与机器侧关闭都汇到这里，只挂一只表。 */
  function scheduleAdvance(): void {
    if (advanceTimer)
      return
    advanceTimer = setTimeout(() => {
      advanceTimer = null
      current.value = null
      state.busy = false
      next()
    }, EXIT_WINDOW_MS)
  }

  function close(ok: boolean): void {
    settle(ok)
    state.open = false
    scheduleAdvance()
  }

  // 机器侧的关闭（Esc 等）从这里回来：未定的一律按取消结
  function onOpenChange(open: boolean): void {
    if (open)
      return
    settle(false)
    state.open = false
    scheduleAdvance()
  }

  async function ok(): Promise<void> {
    const spec = current.value
    if (!spec || spec.settled || state.busy || disposed || hostFailure)
      return
    const attempt = ++spec.attempt
    const active = (): boolean => !disposed && !hostFailure && current.value === spec && !spec.settled && spec.attempt === attempt
    actionError.value = null
    if (spec.onOk) {
      state.busy = true
      try {
        // false 只表示业务不放行，不与动作异常混用。
        const verdict = await spec.onOk()
        if (!active())
          return
        if (verdict === false) {
          state.busy = false
          return
        }
      }
      catch (cause) {
        if (!active())
          return
        state.busy = false
        const error = { cause }
        actionError.value = error
        try {
          await spec.onActionError?.(error)
        }
        catch (notificationCause) {
          if (active()) {
            spec.settled = true
            spec.reject(notificationCause)
            actionError.value = null
            state.open = false
            scheduleAdvance()
          }
        }
        return
      }
      state.busy = false
    }
    if (active())
      close(true)
  }

  function request(spec: Omit<Spec, 'resolve' | 'reject' | 'settled' | 'attempt'>): Promise<boolean> {
    if (hostFailure)
      return Promise.reject(hostFailure.cause)
    if (disposed)
      return Promise.reject(new Error('dialog 服务已卸载'))
    return new Promise<boolean>((resolve, reject) => {
      queue.push({ ...spec, resolve, reject, settled: false, attempt: 0 })
      next()
    })
  }

  const Host = defineComponent({
    name: 'XhDialogServiceHost',
    setup() {
      configSource.provide()
      return () => {
        if (hostFailure)
          return null
        const spec = current.value
        return h(XhDialogRoot, {
          'open': state.open,
          'onUpdate:open': onOpenChange,
          'modal': true,
          'role': 'alertdialog',
          'closeOnEscape': !state.busy,
          'closeOnInteractOutside': false,
          'initialFocus': spec?.initialFocus,
        }, () => spec
          ? h(XhDialogContent, null, () => [
              h(XhDialogHeader, null, () => [
                spec.badge ? h(XhDialogIndicator, { 'data-tone': toneOfBadge(spec.badge) }) : null,
                h(XhDialogTitle, () => spec.title),
              ]),
              h(XhDialogBody, null, () => [
                // 串走 description，函数正文与 prompt 表单也在唯一滚动区内。
                typeof spec.content === 'string'
                  ? h(XhDialogDescription, () => spec.content as string)
                  : typeof spec.content === 'function' ? spec.content() : null,
                spec.body && spec.value ? spec.body(spec.value) : null,
                actionError.value ? h('p', { role: 'alert', style: { color: 'var(--xh-fg-danger)' } }, toValue(options.actionErrorText) ?? 'Action failed. Please try again.') : null,
              ]),
              h(XhDialogFooter, null, () => [
                spec.showCancel
                  ? h(XhButton, { variant: 'ghost', disabled: state.busy, onClick: () => close(false) }, () => toValue(spec.cancelText))
                  : null,
                h(XhButton, { variant: 'solid', tone: spec.tone, loading: state.busy, onClick: ok }, () => [
                  state.busy ? h(XhButtonIndicator, () => spinArc()) : null,
                  h(XhButtonLabel, () => (state.busy ? `${toValue(spec.okText)}…` : toValue(spec.okText))),
                ]),
              ]),
            ])
          : null)
      }
    },
  })

  function toneOfBadge(badge: NonNullable<Spec['badge']>): Tone {
    return badge === 'error' ? 'danger' : badge
  }

  const app: App = createApp(Host)
  let mounted = false
  function failHost(cause: unknown): void {
    hostFailure = { cause }
    const pending = current.value ? [current.value, ...queue.splice(0)] : queue.splice(0)
    for (const spec of pending) {
      if (!spec.settled) {
        spec.settled = true
        spec.reject(cause)
      }
    }
    actionError.value = null
    state.open = false
    state.busy = false
  }
  app.config.errorHandler = failHost
  if (!hostFailure) {
    try {
      app.mount(holder)
      mounted = true
    }
    catch (cause) {
      failHost(cause)
    }
  }

  const alert = (badge: NonNullable<Spec['badge']>, tone: Tone) => async (opts: AlertOptions): Promise<void> => {
    await request({
      title: opts.title,
      content: opts.content,
      tone,
      okText: opts.okText ?? defaults.okText,
      cancelText: defaults.cancelText,
      showCancel: false,
      badge,
      onOk: opts.onOk,
      onActionError: opts.onActionError,
    })
  }

  return {
    get actionError() { return actionError.value },
    confirm: opts => request({
      title: opts.title,
      content: opts.content,
      tone: opts.tone ?? 'brand',
      okText: opts.okText ?? defaults.okText,
      cancelText: opts.cancelText ?? defaults.cancelText,
      showCancel: true,
      badge: opts.badge,
      onOk: opts.onOk,
      onActionError: opts.onActionError,
    }),
    prompt: <T extends object>(opts: PromptOptions<T>): Promise<T | null> => {
      // body 与 onOk 拿的是同一份可写代理：正文里改了什么，确认时就读到什么
      const value = reactive({ ...opts.initialValue }) as T
      return request({
        title: opts.title,
        tone: opts.tone ?? 'brand',
        okText: opts.okText ?? defaults.okText,
        cancelText: opts.cancelText ?? defaults.cancelText,
        showCancel: true,
        badge: opts.badge,
        initialFocus: opts.initialFocus,
        body: v => opts.body(v as T),
        value,
        onOk: opts.onOk ? () => opts.onOk!(value) : undefined,
        onActionError: opts.onActionError,
      }).then(ok => (ok ? { ...toRaw(value) } as T : null))
    },
    info: alert('info', 'info'),
    success: alert('success', 'success'),
    warning: alert('warning', 'warning'),
    error: alert('error', 'danger'),
    setConfig: next => configSource.set(next),
    dispose: () => {
      disposed = true
      if (advanceTimer) {
        clearTimeout(advanceTimer)
        advanceTimer = null
      }
      settle(false)
      for (const spec of queue.splice(0))
        spec.resolve(false)
      if (mounted)
        app.unmount()
      if (!options.target)
        holder.remove()
    },
  }
}
