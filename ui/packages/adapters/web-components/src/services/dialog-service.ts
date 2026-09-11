// 全局命令式确认框服务：confirm/info/success/warning/error 一次调用弹出，
// 自带标题徽记、正文与按钮行。同一时刻只挂一个对话框，后来的排队顺次弹出，
// 避开多层模态叠加。onOk 返回 Promise 时确认钮自动进入 pending 并拦住关闭，
// 失败保持打开以便重试或取消。
import type { Tone } from '@xihan-ui/core'
import type { XhButtonElement } from '../elements/button'
import type { XhDialogElement } from '../elements/dialog'
import type { AlertOptions, ConfirmOptions, DialogActionError, DialogBody, DialogService, DialogServiceOptions } from './types'
import { ensurePortalRoot } from '@xihan-ui/core'
import { spinArc } from './glyph'
import { partNode } from './host'
import { defineFeedbackElements } from './register'

interface Spec {
  title: string
  content?: DialogBody
  tone: Tone
  okText: string
  cancelText: string
  showCancel: boolean
  /** 标题旁的类型徽记（预设档用），confirm 不带。 */
  badge?: 'info' | 'success' | 'warning' | 'error'
  onOk?: () => unknown
  onActionError?: (error: DialogActionError) => void | Promise<void>
  attempt: number
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

  const defaults = { okText: options.okText ?? 'OK', cancelText: options.cancelText ?? 'Cancel' }
  const holder = options.target ?? document.createElement('div')
  const release = (): void => {
    if (!options.target)
      holder.remove()
  }
  let hostFailure: { cause: unknown } | null = null
  try {
    defineFeedbackElements()
    if (!options.target)
      ensurePortalRoot(document).appendChild(holder)
    if (holder.nodeType !== 1 || holder.ownerDocument !== document || !holder.isConnected)
      throw new Error('DialogService target 必须是当前文档中已连接的元素')
  }
  catch (cause) {
    hostFailure = { cause }
  }

  const dialog = document.createElement('xh-dialog') as XhDialogElement
  // 告知类弹窗一律 alertdialog：点外面不关，得明确按一下才算读过
  dialog.setAttribute('role', 'alertdialog')
  dialog.modal = true

  const backdrop = partNode('div', 'backdrop')
  const positioner = partNode('div', 'positioner')
  const content = partNode('div', 'content')
  const header = partNode('div', 'header')
  // 徽记留空：那一枚字形由皮肤按 data-tone 画在伪元素上，模板不塞图形
  const indicator = partNode('div', 'indicator')
  const title = partNode('div', 'title')
  const body = partNode('div', 'body')
  const description = partNode('div', 'description')
  const errorMessage = document.createElement('p')
  errorMessage.setAttribute('role', 'alert')
  errorMessage.style.color = 'var(--xh-fg-danger)'
  errorMessage.hidden = true
  const footer = partNode('div', 'footer')
  const cancel = document.createElement('xh-button') as XhButtonElement
  const cancelRoot = partNode('button', 'root')
  const cancelLabel = partNode('span', 'label')
  const ok = document.createElement('xh-button') as XhButtonElement
  const okRoot = partNode('button', 'root')
  const okIndicator = partNode('span', 'indicator')
  const okLabel = partNode('span', 'label')

  header.append(indicator, title)
  body.append(description, errorMessage)
  cancelRoot.append(cancelLabel)
  cancel.append(cancelRoot)
  cancel.variant = 'ghost'
  okRoot.append(okIndicator, okLabel)
  ok.append(okRoot)
  ok.variant = 'solid'
  footer.append(cancel, ok)
  content.append(header, body, footer)
  positioner.append(content)
  dialog.append(backdrop, positioner)

  const queue: Spec[] = []
  let current: Spec | null = null
  let busy = false
  let actionError: DialogActionError | null = null
  let disposed = false
  let exiting: Spec | null = null

  if (!hostFailure) {
    try {
      holder.appendChild(dialog)
    }
    catch (cause) {
      hostFailure = { cause }
      release()
    }
  }

  function paintContent(): void {
    const spec = current
    if (!spec)
      return
    title.textContent = spec.title
    indicator.hidden = spec.badge == null
    if (spec.badge)
      indicator.setAttribute('data-tone', toneOfBadge(spec.badge))
    else
      indicator.removeAttribute('data-tone')
    // 串走 description 部件（读屏的 aria-describedby 接在它上面），
    // 渲染函数拿到正文节点自己往里写
    if (typeof spec.content === 'function') {
      description.replaceChildren()
      spec.content(description)
    }
    else {
      description.textContent = spec.content ?? ''
    }
    cancel.hidden = !spec.showCancel
    cancel.disabled = busy
    cancelLabel.textContent = spec.cancelText
    ok.tone = spec.tone
    ok.loading = busy
    okIndicator.replaceChildren(...(busy ? [spinArc()] : []))
    okLabel.textContent = busy ? `${spec.okText}…` : spec.okText
    errorMessage.hidden = actionError === null
    errorMessage.textContent = actionError ? options.actionErrorText ?? 'Action failed. Please try again.' : ''
    // 忙的时候 Esc 也拦住：正在提交的那一下不该被一个按键撤销
    dialog.closeOnEscape = !busy
  }

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
    busy = false
    dialog.open = false
  }

  function paint(): void {
    try {
      paintContent()
    }
    catch (cause) {
      failHost(cause)
    }
  }

  function next(): void {
    if (disposed || current || queue.length === 0)
      return
    current = queue.shift()!
    actionError = null
    busy = false
    paint()
    if (!hostFailure)
      dialog.open = true
  }

  function settle(okPressed: boolean): void {
    const spec = current
    if (!spec || spec.settled)
      return
    spec.settled = true
    actionError = null
    spec.resolve(okPressed)
  }

  /** 只接受本次退出的真实完成通知；旧请求的迟到通知不能清掉新请求。 */
  function finishExit(spec: Spec | null): void {
    if (!spec || disposed || current !== spec || exiting !== spec || dialog.open)
      return
    exiting = null
    current = null
    busy = false
    next()
  }

  function close(okPressed: boolean): void {
    const spec = current
    if (!spec)
      return
    settle(okPressed)
    exiting = spec
    dialog.open = false
  }

  // 元素侧的关闭（Esc 等）从这里回来：未定的一律按取消结
  const onOpenChange = (event: Event): void => {
    const detail = (event as CustomEvent<{ open: boolean }>).detail
    if (detail?.open)
      return
    close(false)
  }
  dialog.addEventListener('open-change', onOpenChange)
  const onExitComplete = (): void => finishExit(exiting)
  dialog.addEventListener('exit-complete', onExitComplete)

  const onCancel = (): void => {
    if (!busy)
      close(false)
  }
  const onOk = (): void => {
    void confirmCurrent()
  }
  cancelRoot.addEventListener('click', onCancel)
  okRoot.addEventListener('click', onOk)

  async function confirmCurrent(): Promise<void> {
    const spec = current
    if (!spec || spec.settled || busy || disposed || hostFailure)
      return
    const attempt = ++spec.attempt
    const active = (): boolean => !disposed && !hostFailure && current === spec && !spec.settled && spec.attempt === attempt
    actionError = null
    if (spec.onOk) {
      busy = true
      paint()
      if (!active())
        return
      try {
        // 返回 false 表示不放行，对话框保持打开
        const verdict = await spec.onOk()
        if (!active())
          return
        if (verdict === false) {
          busy = false
          paint()
          return
        }
      }
      catch (cause) {
        if (!active())
          return
        busy = false
        const error = { cause }
        actionError = error
        paint()
        if (!active())
          return
        try {
          await spec.onActionError?.(error)
        }
        catch (notificationCause) {
          if (active()) {
            spec.settled = true
            spec.reject(notificationCause)
            actionError = null
            exiting = spec
            dialog.open = false
          }
        }
        return
      }
      busy = false
      paint()
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
    confirm: (opts: ConfirmOptions) => request({
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
    info: alert('info', 'info'),
    success: alert('success', 'success'),
    warning: alert('warning', 'warning'),
    error: alert('error', 'danger'),
    dispose: () => {
      disposed = true
      exiting = null
      settle(false)
      for (const spec of queue.splice(0))
        spec.resolve(false)
      dialog.removeEventListener('open-change', onOpenChange)
      dialog.removeEventListener('exit-complete', onExitComplete)
      cancelRoot.removeEventListener('click', onCancel)
      okRoot.removeEventListener('click', onOk)
      dialog.remove()
      release()
    },
  }
}
