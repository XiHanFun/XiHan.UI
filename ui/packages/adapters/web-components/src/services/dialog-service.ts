// 全局命令式确认框服务：confirm/info/success/warning/error 一次调用弹出，
// 自带标题徽记、正文与按钮行。同一时刻只挂一个对话框，后来的排队顺次弹出，
// 避开多层模态叠加。onOk 返回 Promise 时确认钮自动进入 pending 并拦住关闭，
// 失败保持打开以便重试或取消。
import type { Tone } from '@xihan-ui/core'
import type { DialogServiceBadge, DialogServiceControllerSpec, DialogServiceRequest } from '@xihan-ui/headless'
import type { XhButtonElement } from '../elements/button'
import type { XhDialogElement } from '../elements/dialog'
import type { AlertOptions, ConfirmOptions, DialogActionError, DialogBody, DialogService, DialogServiceOptions } from './types'
import { ensurePortalRoot } from '@xihan-ui/core'
import { createDialogServiceController, dialogServiceBadgeTone } from '@xihan-ui/headless'
import { spinArc } from './glyph'
import { partNode } from './host'
import { defineFeedbackElements } from './register'

interface Spec extends DialogServiceControllerSpec {
  title: string
  content?: DialogBody
  tone: Tone
  okText: string
  cancelText: string
  showCancel: boolean
  /** 标题旁的类型徽记（预设档用），confirm 不带。 */
  badge?: DialogServiceBadge
  onOk?: () => unknown
  onActionError?: (error: DialogActionError) => void | Promise<void>
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

  const controller = createDialogServiceController<Spec>({ onStateChange: () => paint() })

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
    const serviceState = controller.state
    const spec = serviceState.current?.spec
    if (!spec)
      return
    title.textContent = spec.title
    indicator.hidden = spec.badge == null
    if (spec.badge)
      indicator.setAttribute('data-tone', dialogServiceBadgeTone(spec.badge))
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
    cancel.disabled = serviceState.busy
    cancelLabel.textContent = spec.cancelText
    ok.tone = spec.tone
    ok.loading = serviceState.busy
    okIndicator.replaceChildren(...(serviceState.busy ? [spinArc()] : []))
    okLabel.textContent = serviceState.busy ? `${spec.okText}…` : spec.okText
    errorMessage.hidden = serviceState.actionError === null
    errorMessage.textContent = serviceState.actionError ? options.actionErrorText ?? 'Action failed. Please try again.' : ''
    // 忙的时候 Esc 也拦住：正在提交的那一下不该被一个按键撤销
    dialog.closeOnEscape = !serviceState.busy
  }

  function failHost(cause: unknown): void {
    controller.fail(cause)
  }

  let exitRequest: DialogServiceRequest<Spec> | null = null
  let exitListener: (() => void) | null = null
  function syncExitListener(): void {
    const request = controller.state.exiting
    if (request === exitRequest)
      return
    if (exitListener)
      dialog.removeEventListener('exit-complete', exitListener)
    exitRequest = request
    exitListener = request ? () => void controller.finishExit(request) : null
    if (exitListener)
      dialog.addEventListener('exit-complete', exitListener, { once: true })
  }

  function paint(): void {
    try {
      paintContent()
      syncExitListener()
      dialog.open = controller.state.open
    }
    catch (cause) {
      failHost(cause)
    }
  }
  if (hostFailure)
    controller.fail(hostFailure.cause)

  // 元素侧的关闭（Esc 等）从这里回来：未定的一律按取消结
  const onOpenChange = (event: Event): void => {
    const detail = (event as CustomEvent<{ open: boolean }>).detail
    if (detail?.open)
      return
    controller.close(false)
  }
  dialog.addEventListener('open-change', onOpenChange)

  const onCancel = (): void => {
    if (!controller.state.busy)
      controller.close(false)
  }
  const onOk = (): void => {
    void controller.confirmCurrent()
  }
  cancelRoot.addEventListener('click', onCancel)
  okRoot.addEventListener('click', onOk)

  const alert = (badge: DialogServiceBadge, tone: Tone) => async (opts: AlertOptions): Promise<void> => {
    await controller.request({
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
    get actionError() { return controller.state.actionError },
    confirm: (opts: ConfirmOptions) => controller.request({
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
      controller.dispose()
      dialog.removeEventListener('open-change', onOpenChange)
      if (exitListener)
        dialog.removeEventListener('exit-complete', exitListener)
      cancelRoot.removeEventListener('click', onCancel)
      okRoot.removeEventListener('click', onOk)
      dialog.remove()
      release()
    },
  }
}
