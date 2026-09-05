// 全局命令式确认框服务：confirm/info/success/warning/error 一次调用弹出，
// 自带标题徽记、正文与按钮行。同一时刻只挂一个对话框，后来的排队顺次弹出，
// 避开多层模态叠加。onOk 返回 Promise 时确认钮自动进入 pending 并拦住关闭，
// 失败保持打开以便重试或取消。
import type { Tone } from '@xihan-ui/core'
import type { XhButtonElement } from '../elements/button'
import type { XhDialogElement } from '../elements/dialog'
import type { AlertOptions, ConfirmOptions, DialogBody, DialogService, DialogServiceOptions } from './types'
import { spinArc } from './glyph'
import { createServiceHolder, partNode, reportServiceFailure } from './host'
import { defineFeedbackElements } from './register'

/** 关到再开之间留出退场窗口，动效走完再放下一个。 */
const EXIT_WINDOW_MS = 250

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
  resolve: (ok: boolean) => void
  settled: boolean
}

function toneOfBadge(badge: NonNullable<Spec['badge']>): Tone {
  return badge === 'error' ? 'danger' : badge
}

export function createDialogService(options: DialogServiceOptions = {}): DialogService {
  if (typeof document === 'undefined')
    throw new Error('createDialogService 需要 document；SSR 里请等到客户端再创建')

  defineFeedbackElements()

  const defaults = { okText: options.okText ?? 'OK', cancelText: options.cancelText ?? 'Cancel' }
  const { holder, release } = createServiceHolder(options.target)

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
  const footer = partNode('div', 'footer')
  const cancel = document.createElement('xh-button') as XhButtonElement
  const cancelRoot = partNode('button', 'root')
  const cancelLabel = partNode('span', 'label')
  const ok = document.createElement('xh-button') as XhButtonElement
  const okRoot = partNode('button', 'root')
  const okIndicator = partNode('span', 'indicator')
  const okLabel = partNode('span', 'label')

  header.append(indicator, title)
  body.append(description)
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
  let disposed = false
  let mounted = true
  let advanceTimer: ReturnType<typeof setTimeout> | null = null

  try {
    holder.appendChild(dialog)
  }
  catch (error) {
    mounted = reportServiceFailure('dialog', error)
    release()
  }

  function paint(): void {
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
    // 忙的时候 Esc 也拦住：正在提交的那一下不该被一个按键撤销
    dialog.closeOnEscape = !busy
  }

  function next(): void {
    if (disposed || current || queue.length === 0)
      return
    current = queue.shift()!
    busy = false
    paint()
    dialog.open = true
  }

  function settle(okPressed: boolean): void {
    const spec = current
    if (!spec || spec.settled)
      return
    spec.settled = true
    spec.resolve(okPressed)
  }

  /** 退场窗口走完再清当前项、放下一个；程序化关闭与元素侧关闭都汇到这里，只挂一只表。 */
  function scheduleAdvance(): void {
    if (advanceTimer)
      return
    advanceTimer = setTimeout(() => {
      advanceTimer = null
      current = null
      busy = false
      next()
    }, EXIT_WINDOW_MS)
  }

  function close(okPressed: boolean): void {
    settle(okPressed)
    dialog.open = false
    scheduleAdvance()
  }

  // 元素侧的关闭（Esc 等）从这里回来：未定的一律按取消结
  const onOpenChange = (event: Event): void => {
    const detail = (event as CustomEvent<{ open: boolean }>).detail
    if (detail?.open)
      return
    settle(false)
    dialog.open = false
    scheduleAdvance()
  }
  dialog.addEventListener('open-change', onOpenChange)

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
    if (!spec || busy)
      return
    if (spec.onOk) {
      busy = true
      paint()
      try {
        // 返回 false 表示不放行，对话框保持打开
        const verdict = await spec.onOk()
        if (verdict === false) {
          busy = false
          paint()
          return
        }
      }
      catch (error) {
        busy = false
        paint()
        console.error('[xh] confirm onOk 失败，对话框保持打开', error)
        return
      }
      busy = false
      paint()
    }
    close(true)
  }

  function request(spec: Omit<Spec, 'resolve' | 'settled'>): Promise<boolean> {
    if (disposed)
      return Promise.reject(new Error('dialog 服务已卸载'))
    if (!mounted)
      return Promise.resolve(false)
    return new Promise<boolean>((resolve) => {
      queue.push({ ...spec, resolve, settled: false })
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
    })
  }

  return {
    confirm: (opts: ConfirmOptions) => request({
      title: opts.title,
      content: opts.content,
      tone: opts.tone ?? 'brand',
      okText: opts.okText ?? defaults.okText,
      cancelText: opts.cancelText ?? defaults.cancelText,
      showCancel: true,
      badge: opts.badge,
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
      dialog.removeEventListener('open-change', onOpenChange)
      cancelRoot.removeEventListener('click', onCancel)
      okRoot.removeEventListener('click', onOk)
      dialog.remove()
      release()
    },
  }
}
