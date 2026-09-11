// 全局命令式确认框服务：confirm/info/success/warning/error 一次调用弹出，
// 自带标题徽记、正文与按钮行。同一时刻只挂一个对话框，后来的排队顺次弹出，
// 避开多层模态叠加。onOk 返回 Promise 时确认钮自动进入 pending 并拦住关闭，
// 失败保持打开以便重试或取消。
import type { Tone } from '@xihan-ui/core'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { XhConfig } from '../config/config'
import type { XhConfigSource } from './service-config'
import { ensurePortalRoot } from '@xihan-ui/core'
import { Component, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { XhButton, XhButtonIndicator, XhButtonLabel } from '../components/button'
import { XhDialogBody, XhDialogContent, XhDialogDescription, XhDialogFooter, XhDialogHeader, XhDialogIndicator, XhDialogRoot, XhDialogTitle } from '../components/dialog/dialog'
import { XhConfigProvider } from '../config/config'
import { spinArc } from './glyph'
import { createServiceConfig } from './service-config'

/** 文案可以给常量，也可以给取值函数——队列里的对话框会跨过一次切语言。 */
export type ServiceText = string | (() => string)

function textOf(value: ServiceText): string {
  return typeof value === 'function' ? value() : value
}

/**
 * 对话框正文。给串走 description 部件（读屏的 aria-describedby 由它接）；
 * 给渲染函数则整块摊在正文位，自己决定渲染什么。
 */
export type DialogBody = string | (() => ReactNode)

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
  okText?: ServiceText
  cancelText?: ServiceText
  /** false 阻止关闭；抛错或 Promise 拒绝进入 actionError，保持打开。 */
  onOk?: () => boolean | void | Promise<unknown>
  /** 动作失败通知；通知自身失败时拒绝所属请求。 */
  onActionError?: (error: DialogActionError) => void | Promise<void>
}

/** 单按钮告知框的入参：没有取消钮，徽记由预设档自己定，其余同 confirm。 */
export type AlertOptions = Omit<ConfirmOptions, 'tone' | 'badge'>

/** 取值型弹窗的入参。正文自己拼表单，确认时把那份值带回来。 */
export interface PromptOptions<T extends object> extends Omit<ConfirmOptions, 'onOk' | 'content'> {
  /** 每次打开建一份初值。 */
  initialValue: T
  /** 用当前那份值渲染表单主体；改值调 set，宿主跟着重渲。 */
  body: (value: T, set: (patch: Partial<T>) => void) => ReactNode
  /** 落焦到哪个节点，CSS 选择器。 */
  initialFocus?: string
  /** false 只阻止关闭；抛错或拒绝进入独立动作异常，弹窗保持打开。 */
  onOk?: (value: T) => boolean | void | Promise<boolean | void>
}

export interface DialogServiceOptions {
  /** 确认钮文案，缺省 OK。 */
  okText?: ServiceText
  /** 取消钮文案，缺省 Cancel。 */
  cancelText?: ServiceText
  /** 动作失败时的安全提示，与按钮文案采用相同取值方式。 */
  actionErrorText?: ServiceText
  /**
   * 喂给对话框子树的全局配置（locale / translations / size / portalContainer）。
   * 本服务自带宿主树，接不到组件树里的 XhConfigProvider，要让它跟应用同语言就从这里给；
   * 传取值函数即可运行期跟着切语言，也可以之后用 setConfig 推。
   */
  config?: XhConfigSource
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
  setConfig: (next: XhConfigSource) => void
  /** 卸载宿主树并移除容器。 */
  dispose: () => void
}

interface Spec {
  title: string
  content?: DialogBody
  tone: Tone
  okText: ServiceText
  cancelText: ServiceText
  showCancel: boolean
  /** 标题旁的类型徽记（预设档用），confirm 不带。 */
  badge?: 'info' | 'success' | 'warning' | 'error'
  /** 返回 false 阻止本次确认；异常由独立错误状态报告。 */
  onOk?: () => unknown
  onActionError?: (error: DialogActionError) => void | Promise<void>
  attempt: number
  /** 取值型弹窗的正文与那份值。 */
  body?: (value: object, set: (patch: object) => void) => ReactNode
  value?: object
  initialFocus?: string
  resolve: (ok: boolean) => void
  reject: (cause: unknown) => void
  settled: boolean
}

function toneOfBadge(badge: NonNullable<Spec['badge']>): Tone {
  return badge === 'error' ? 'danger' : badge
}

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
      ensurePortalRoot(document).append(holder)
    if (holder.nodeType !== 1 || holder.ownerDocument !== document || !holder.isConnected)
      throw new Error('DialogService target 必须是当前文档中已连接的元素')
  }
  catch (cause) {
    hostFailure = { cause }
  }

  // 宿主树不在 React 的组件树里，状态只能自己存一份并推给它重渲
  let current: Spec | null = null
  let open = false
  let busy = false
  let actionError: DialogActionError | null = null
  let version = 0
  const subs = new Set<() => void>()
  const notify = (): void => {
    version += 1
    for (const fn of [...subs]) fn()
  }
  const subscribe = (fn: () => void): (() => void) => {
    subs.add(fn)
    return () => void subs.delete(fn)
  }

  const queue: Spec[] = []
  let disposed = false
  let exiting: Spec | null = null

  function next(): void {
    if (disposed || current || queue.length === 0)
      return
    current = queue.shift()!
    actionError = null
    busy = false
    open = true
    notify()
  }

  function settle(ok: boolean): void {
    if (!current || current.settled)
      return
    current.settled = true
    actionError = null
    current.resolve(ok)
  }

  /** 只接受本次退出的真实完成通知；旧请求的迟到通知不能清掉新请求。 */
  function finishExit(spec: Spec | null): void {
    if (!spec || disposed || current !== spec || exiting !== spec || open)
      return
    exiting = null
    current = null
    busy = false
    if (queue.length)
      next()
    else
      notify()
  }

  function close(ok: boolean): void {
    const spec = current
    if (!spec)
      return
    settle(ok)
    exiting = spec
    open = false
    notify()
  }

  // 机器侧的关闭（Esc 等）从这里回来：未定的一律按取消结
  function onOpenChange(details: { open: boolean }): void {
    if (details.open)
      return
    close(false)
  }

  async function ok(): Promise<void> {
    const spec = current
    if (!spec || spec.settled || busy || disposed || hostFailure)
      return
    const attempt = ++spec.attempt
    const active = (): boolean => !disposed && !hostFailure && current === spec && !spec.settled && spec.attempt === attempt
    actionError = null
    if (spec.onOk) {
      busy = true
      notify()
      try {
        // false 只表示业务不放行，不与动作异常混用。
        const verdict = await spec.onOk()
        if (!active())
          return
        if (verdict === false) {
          busy = false
          notify()
          return
        }
      }
      catch (cause) {
        if (!active())
          return
        busy = false
        const error = { cause }
        actionError = error
        notify()
        try {
          await spec.onActionError?.(error)
        }
        catch (notificationCause) {
          if (active()) {
            spec.settled = true
            spec.reject(notificationCause)
            actionError = null
            exiting = spec
            open = false
            notify()
          }
        }
        return
      }
      busy = false
      notify()
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

  /** 取值型弹窗改值：就地写回那份值再推一次重渲。 */
  function patchValue(patch: object): void {
    if (!current?.value)
      return
    Object.assign(current.value, patch)
    notify()
  }

  function Host(): ReactNode {
    useSyncExternalStore(subscribe, () => version, () => version)
    if (hostFailure)
      return null
    const config: XhConfig = configSource.read()
    const spec = current
    return (
      <XhConfigProvider config={config}>
        <XhDialogRoot
          open={open}
          onOpenChange={onOpenChange}
          modal
          role="alertdialog"
          closeOnEscape={!busy}
          closeOnInteractOutside={false}
          initialFocus={spec?.initialFocus}
          onExitComplete={() => finishExit(spec)}
        >
          {spec
            ? (
                <XhDialogContent>
                  <XhDialogHeader>
                    {spec.badge ? <XhDialogIndicator data-tone={toneOfBadge(spec.badge)} /> : null}
                    <XhDialogTitle>{spec.title}</XhDialogTitle>
                  </XhDialogHeader>
                  <XhDialogBody>
                    {/* 串走 description，函数正文与 prompt 表单也在唯一滚动区内。 */}
                    {typeof spec.content === 'string'
                      ? <XhDialogDescription>{spec.content}</XhDialogDescription>
                      : typeof spec.content === 'function' ? spec.content() : null}
                    {spec.body && spec.value ? spec.body(spec.value, patchValue) : null}
                    {actionError ? <p role="alert" style={{ color: 'var(--xh-fg-danger)' }}>{textOf(options.actionErrorText ?? 'Action failed. Please try again.')}</p> : null}
                  </XhDialogBody>
                  <XhDialogFooter>
                    {spec.showCancel
                      ? <XhButton variant="ghost" disabled={busy} onClick={() => close(false)}>{textOf(spec.cancelText)}</XhButton>
                      : null}
                    <XhButton variant="solid" tone={spec.tone} loading={busy} onClick={ok}>
                      {busy ? <XhButtonIndicator>{spinArc()}</XhButtonIndicator> : null}
                      <XhButtonLabel>{busy ? `${textOf(spec.okText)}…` : textOf(spec.okText)}</XhButtonLabel>
                    </XhButton>
                  </XhDialogFooter>
                </XhDialogContent>
              )
            : null}
        </XhDialogRoot>
      </XhConfigProvider>
    )
  }

  let root: Root | null = null
  function failHost(cause: unknown): void {
    hostFailure = { cause }
    const pending = current ? [current, ...queue.splice(0)] : queue.splice(0)
    for (const spec of pending) {
      if (!spec.settled) {
        spec.settled = true
        spec.reject(cause)
      }
    }
    actionError = null
    open = false
    busy = false
  }
  // 渲染失败也必须结算服务 Promise，不能让 React 卸载子树后留下永远等待的请求。
  class ServiceBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    override state = { failed: false }
    static getDerivedStateFromError(): { failed: boolean } {
      return { failed: true }
    }

    override componentDidCatch(cause: unknown): void {
      failHost(cause)
    }

    override render(): ReactNode {
      return this.state.failed ? null : this.props.children
    }
  }
  if (!hostFailure) {
    try {
      root = createRoot(holder, { onUncaughtError: failHost, onCaughtError: failHost })
      flushSync(() => root!.render(<ServiceBoundary><Host /></ServiceBoundary>))
    }
    catch (cause) {
      failHost(cause)
    }
  }
  // 配置源换了要跟着重渲：宿主读的是 read()，重渲才拿得到新那一份
  const stopConfig = configSource.subscribe(notify)

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
    get actionError() { return actionError },
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
      // body 与 onOk 拿的是同一份值：正文里改了什么，确认时就读到什么
      const value = { ...opts.initialValue } as T
      return request({
        title: opts.title,
        tone: opts.tone ?? 'brand',
        okText: opts.okText ?? defaults.okText,
        cancelText: opts.cancelText ?? defaults.cancelText,
        showCancel: true,
        badge: opts.badge,
        initialFocus: opts.initialFocus,
        body: (v, set) => opts.body(v as T, set as (patch: Partial<T>) => void),
        value,
        onOk: opts.onOk ? () => opts.onOk!(value) : undefined,
        onActionError: opts.onActionError,
      }).then(accepted => (accepted ? { ...value } : null))
    },
    info: alert('info', 'info'),
    success: alert('success', 'success'),
    warning: alert('warning', 'warning'),
    error: alert('error', 'danger'),
    setConfig: next => configSource.set(next),
    dispose: () => {
      disposed = true
      exiting = null
      // 队里没结的一律按取消结掉，调用方的 await 不会永远挂着
      settle(false)
      for (const spec of queue.splice(0, queue.length)) {
        if (!spec.settled) {
          spec.settled = true
          spec.resolve(false)
        }
      }
      stopConfig()
      root?.unmount()
      if (!options.target)
        holder.remove()
    },
  }
}
