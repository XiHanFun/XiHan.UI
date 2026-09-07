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
import { useSyncExternalStore } from 'react'
import { XhButton, XhButtonIndicator, XhButtonLabel } from '../components/button'
import { XhDialogContent, XhDialogDescription, XhDialogIndicator, XhDialogRoot, XhDialogTitle } from '../components/dialog/dialog'
import { XhConfigProvider } from '../config/config'
import { spinArc } from './glyph'
import { mountServiceHost } from './mount-host'
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

export interface ConfirmOptions {
  title: string
  content?: DialogBody
  /** 确认钮语气，默认 brand；危险操作传 danger。 */
  tone?: Tone
  /** 标题旁的类型徽记。不给则不出徽记。 */
  badge?: 'info' | 'success' | 'warning' | 'error'
  okText?: ServiceText
  cancelText?: ServiceText
  /** Promise 拒绝时对话框保持打开。 */
  onOk?: () => void | Promise<unknown>
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
  /** 返回 false（或拒绝）表示校验没过，弹窗保持打开。 */
  onOk?: (value: T) => boolean | void | Promise<boolean | void>
}

export interface DialogServiceOptions {
  /** 确认钮文案，缺省 OK。 */
  okText?: ServiceText
  /** 取消钮文案，缺省 Cancel。 */
  cancelText?: ServiceText
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
  /** 返回 false 表示不放行；confirm 那一路的返回值不参与判定。 */
  onOk?: () => unknown
  /** 取值型弹窗的正文与那份值。 */
  body?: (value: object, set: (patch: object) => void) => ReactNode
  value?: object
  initialFocus?: string
  resolve: (ok: boolean) => void
  settled: boolean
}

/** 关到再开之间留出退场窗口，动效走完再放下一个。 */
const EXIT_WINDOW_MS = 250

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
  if (!options.target)
    ensurePortalRoot(document).append(holder)

  // 宿主树不在 React 的组件树里，状态只能自己存一份并推给它重渲
  let current: Spec | null = null
  let open = false
  let busy = false
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
  let advanceTimer: ReturnType<typeof setTimeout> | null = null

  function next(): void {
    if (disposed || current || queue.length === 0)
      return
    current = queue.shift()!
    busy = false
    open = true
    notify()
  }

  function settle(ok: boolean): void {
    if (!current || current.settled)
      return
    current.settled = true
    current.resolve(ok)
  }

  /** 退场窗口走完再清当前项、放下一个；程序化关闭与机器侧关闭都汇到这里，只挂一只表。 */
  function scheduleAdvance(): void {
    if (advanceTimer)
      return
    advanceTimer = setTimeout(() => {
      advanceTimer = null
      current = null
      busy = false
      notify()
      next()
    }, EXIT_WINDOW_MS)
  }

  function close(ok: boolean): void {
    settle(ok)
    open = false
    notify()
    scheduleAdvance()
  }

  // 机器侧的关闭（Esc 等）从这里回来：未定的一律按取消结
  function onOpenChange(details: { open: boolean }): void {
    if (details.open)
      return
    settle(false)
    open = false
    notify()
    scheduleAdvance()
  }

  async function ok(): Promise<void> {
    const spec = current
    if (!spec || busy)
      return
    if (spec.onOk) {
      busy = true
      notify()
      try {
        // 取值型弹窗的 onOk 收 false 表示校验没过，对话框保持打开；
        // confirm 的 onOk 签名不吃 false，语义不受影响
        const verdict = await spec.onOk()
        if (verdict === false) {
          busy = false
          notify()
          return
        }
      }
      catch (err) {
        busy = false
        notify()
        console.error('[xh] confirm onOk 失败，对话框保持打开', err)
        return
      }
      busy = false
      notify()
    }
    close(true)
  }

  function request(spec: Omit<Spec, 'resolve' | 'settled'>): Promise<boolean> {
    if (disposed)
      return Promise.reject(new Error('dialog 服务已卸载'))
    return new Promise<boolean>((resolve) => {
      queue.push({ ...spec, resolve, settled: false })
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
        >
          {spec
            ? (
                <XhDialogContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--xh-control-gap-md)' }}>
                    {spec.badge ? <XhDialogIndicator data-tone={toneOfBadge(spec.badge)} /> : null}
                    <XhDialogTitle>{spec.title}</XhDialogTitle>
                  </div>
                  {/* 串走 description（读屏的 aria-describedby 接在它上面），渲染函数直接摊开 */}
                  {typeof spec.content === 'string'
                    ? <XhDialogDescription>{spec.content}</XhDialogDescription>
                    : typeof spec.content === 'function' ? spec.content() : null}
                  {spec.body && spec.value ? spec.body(spec.value, patchValue) : null}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--xh-control-gap-md)' }}>
                    {spec.showCancel
                      ? <XhButton variant="ghost" disabled={busy} onClick={() => close(false)}>{textOf(spec.cancelText)}</XhButton>
                      : null}
                    <XhButton variant="solid" tone={spec.tone} loading={busy} onClick={ok}>
                      {busy ? <XhButtonIndicator>{spinArc()}</XhButtonIndicator> : null}
                      <XhButtonLabel>{busy ? `${textOf(spec.okText)}…` : textOf(spec.okText)}</XhButtonLabel>
                    </XhButton>
                  </div>
                </XhDialogContent>
              )
            : null}
        </XhDialogRoot>
      </XhConfigProvider>
    )
  }

  const root: Root | null = mountServiceHost(holder, <Host />, 'dialog')
  if (!root)
    disposed = true
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
    })
  }

  return {
    confirm: opts => request({
      title: opts.title,
      content: opts.content,
      tone: opts.tone ?? 'brand',
      okText: opts.okText ?? defaults.okText,
      cancelText: opts.cancelText ?? defaults.cancelText,
      showCancel: true,
      badge: opts.badge,
      onOk: opts.onOk,
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
      }).then(accepted => (accepted ? { ...value } : null))
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
      holder.remove()
    },
  }
}
