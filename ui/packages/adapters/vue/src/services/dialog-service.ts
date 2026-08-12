// 全局命令式确认框服务：confirm/info/success/warning/error 一次调用弹出，
// 自带标题徽记、正文与按钮行。同一时刻只挂一个对话框，后来的排队顺次弹出，
// 避开多层模态叠加。onOk 返回 Promise 时确认钮自动进入 pending 并拦住关闭，
// 失败保持打开以便重试或取消。
import type { Tone } from '@xihan-ui/kernel'
import type { App } from 'vue'
import { createApp, defineComponent, h, reactive } from 'vue'
import { XhButton, XhButtonIndicator, XhButtonLabel } from '../components/button'
import { XhDialogContent, XhDialogDescription, XhDialogRoot, XhDialogTitle } from '../components/dialog/dialog'
import { spinArc, typeBadge } from './glyph'

export interface ConfirmOptions {
  title: string
  content?: string
  /** 确认钮语气，默认 brand；危险操作传 danger。 */
  tone?: Tone
  okText?: string
  cancelText?: string
  /** Promise 拒绝时对话框保持打开。 */
  onOk?: () => void | Promise<unknown>
}

/** 单按钮告知框的入参：没有取消钮，其余同 confirm。 */
export type AlertOptions = Omit<ConfirmOptions, 'tone'>

export interface DialogServiceOptions {
  okText?: string
  cancelText?: string
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
  /** 卸载宿主应用并移除容器。 */
  dispose: () => void
}

interface Spec {
  title: string
  content?: string
  tone: Tone
  okText: string
  cancelText: string
  showCancel: boolean
  /** 标题旁的类型徽记（预设档用），confirm 不带。 */
  badge?: 'info' | 'success' | 'warning' | 'error'
  onOk?: () => void | Promise<unknown>
  resolve: (ok: boolean) => void
  settled: boolean
}

/** 关到再开之间留出退场窗口，动效走完再放下一个。 */
const EXIT_WINDOW_MS = 250

export function createDialogService(options: DialogServiceOptions = {}): DialogService {
  if (typeof document === 'undefined')
    throw new Error('createDialogService 需要 document；SSR 里请等到客户端再创建')

  const defaults = { okText: options.okText ?? '确定', cancelText: options.cancelText ?? '取消' }
  const holder = options.target ?? document.createElement('div')
  if (!options.target)
    document.body.appendChild(holder)

  const state = reactive({
    current: null as Spec | null,
    open: false,
    busy: false,
  })
  const queue: Spec[] = []
  let disposed = false
  let advanceTimer: ReturnType<typeof setTimeout> | null = null

  function next(): void {
    if (disposed || state.current || queue.length === 0)
      return
    state.current = queue.shift()!
    state.busy = false
    state.open = true
  }

  function settle(ok: boolean): void {
    const spec = state.current
    if (!spec || spec.settled)
      return
    spec.settled = true
    spec.resolve(ok)
  }

  /** 退场窗口走完再清当前项、放下一个；程序化关闭与机器侧关闭都汇到这里，只挂一只表。 */
  function scheduleAdvance(): void {
    if (advanceTimer)
      return
    advanceTimer = setTimeout(() => {
      advanceTimer = null
      state.current = null
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
    const spec = state.current
    if (!spec || state.busy)
      return
    if (spec.onOk) {
      state.busy = true
      try {
        await spec.onOk()
      }
      catch (err) {
        state.busy = false
        console.error('[xh] confirm onOk 失败，对话框保持打开', err)
        return
      }
      state.busy = false
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

  const Host = defineComponent({
    name: 'XhDialogServiceHost',
    setup() {
      return () => {
        const spec = state.current
        return h(XhDialogRoot, {
          'open': state.open,
          'onUpdate:open': onOpenChange,
          'modal': true,
          'role': 'alertdialog',
          'closeOnEscape': !state.busy,
          'closeOnInteractOutside': false,
        }, () => spec
          ? h(XhDialogContent, null, () => [
              h('div', { 'style': { display: 'flex', alignItems: 'center', gap: 'var(--xh-space-2)' }, 'data-tone': spec.badge ? toneOfBadge(spec.badge) : undefined }, [
                spec.badge ? typeBadge(spec.badge) : null,
                h(XhDialogTitle, () => spec.title),
              ]),
              spec.content ? h(XhDialogDescription, () => spec.content) : null,
              h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--xh-space-2)' } }, [
                spec.showCancel
                  ? h(XhButton, { variant: 'ghost', disabled: state.busy, onClick: () => close(false) }, () => spec.cancelText)
                  : null,
                h(XhButton, { variant: 'solid', tone: spec.tone, loading: state.busy, onClick: ok }, () => [
                  state.busy ? h(XhButtonIndicator, () => spinArc()) : null,
                  h(XhButtonLabel, () => (state.busy ? `${spec.okText}…` : spec.okText)),
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
  app.mount(holder)

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
      onOk: opts.onOk,
    }),
    info: alert('info', 'info'),
    success: alert('success', 'success'),
    warning: alert('warning', 'warning'),
    error: alert('error', 'danger'),
    dispose: () => {
      disposed = true
      if (advanceTimer) {
        clearTimeout(advanceTimer)
        advanceTimer = null
      }
      settle(false)
      for (const spec of queue.splice(0))
        spec.resolve(false)
      app.unmount()
      if (!options.target)
        holder.remove()
    },
  }
}
