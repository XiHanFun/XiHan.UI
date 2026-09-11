// 全局命令式轻提示服务：自带一个挂到浮层落点的宿主容器与默认模板，
// info/success 等命令在任意模块作用域可调（请求拦截器、store），不要求调用点在文档树的某一处。
//
// 摞落在哪儿是整个服务的口径，因此库里没有对应的自定义元素；
// 队列跑的是 notification 那台队列机器，上限、挤条与合并计数全库一份实现。
import type { Service } from '@xihan-ui/core'
import type { NotificationApi, NotificationSchema, ToastOptions, ToastRecord, ToastType } from '@xihan-ui/headless'
import type { XhToastElement } from '../elements/toast'
import type { ToastCreateOptions, ToastMessageOptions, ToastPromiseOptions, ToastService, ToastServiceOptions } from './types'
import { createService, DATA_INERT_EXEMPT } from '@xihan-ui/core'
import {
  connectNotification,
  createFeedbackServiceController,
  NOTIFICATION_MAX,
  notificationMachine,
  TOAST_DURATION,
  TOAST_GAP,
  TOAST_PLACEMENT,
  toastAnatomy,
  visibleNotifications,
} from '@xihan-ui/headless'
import { withXhConfig } from '../config'
import { wcNormalize } from '../dom/normalize'
import { createLitRuntime } from '../runtime/lit-runtime'
import { createServiceHolder, createServiceReactiveHost, partNode, reportServiceFailure } from './host'
import { defineFeedbackElements } from './register'

const parts = toastAnatomy.build()

/**
 * 这一条会不会自己走掉。loading 一直挂着，duration <= 0 与非有限值也是。
 * 走不掉的必须留个出口，否则界面上一个可点、可聚焦的节点都没有。
 */
function selfDismissing(toast: ToastRecord, fallback: number | undefined): boolean {
  if (toast.type === 'loading')
    return false
  const duration = toast.duration ?? fallback ?? TOAST_DURATION
  return Number.isFinite(duration) && duration > 0
}

/** 合并过的在标题后追加计数，没并过就是原话。 */
function toastTitle(toast: ToastRecord): string | undefined {
  const count = toast.count ?? 1
  if (count <= 1 || toast.title == null)
    return toast.title
  return `${toast.title} ×${count}`
}

export function createToastService(options: ToastServiceOptions = {}): ToastService {
  if (typeof document === 'undefined')
    throw new Error('createToastService 需要 document；SSR 里请等到客户端再创建')

  defineFeedbackElements()

  const {
    target,
    placement = TOAST_PLACEMENT,
    gap = TOAST_GAP,
    max = NOTIFICATION_MAX,
    dedupe,
    toastTranslations,
    ...defaults
  } = options
  const { holder, release } = createServiceHolder(target)

  // 摞没有对应的自定义元素，属性直接从解剖里取
  const group = document.createElement('div')
  for (const [name, value] of Object.entries(parts.group.attrs))
    group.setAttribute(name, String(value))
  group.setAttribute('data-placement', placement)
  group.style.gap = `${gap}px`
  // 模态浮层给背景施加 inert 时跳过这一摞：轻提示画在遮罩之上，
  // 一并罩住就成了看得见、点不动、读屏也跳过
  group.setAttribute(DATA_INERT_EXEMPT, '')
  holder.appendChild(group)

  const nodes = new Map<string, XhToastElement>()
  // 这一条当下渲染成了什么形状；变了才重搭子节点，没变只刷属性
  const shapes = new Map<string, string>()
  const controller = createFeedbackServiceController<ToastOptions, Partial<ToastOptions>>({
    name: 'toast',
    idPrefix: 'toast',
    onStateChange: () => render(),
  })

  const machineProps = (): Partial<NotificationSchema['props']> => withXhConfig('notification', {
    placement,
    max,
    dedupe,
    duration: defaults.duration,
    removeDelay: defaults.removeDelay,
    pauseOnPageIdle: defaults.pauseOnPageIdle,
  }, holder)

  const host = createServiceReactiveHost(() => render())
  const runtime = createLitRuntime(host)
  let service: Service<NotificationSchema> | null = null
  try {
    service = createService(notificationMachine, { props: machineProps, runtime })
    runtime.mount()
  }
  catch (error) {
    reportServiceFailure('toast', error)
    service = null
    release()
  }

  const api = (): NotificationApi | null => (service ? connectNotification(service, wcNormalize) : null)
  if (service) {
    controller.attach({
      create: opts => api()!.create(opts),
      update: (id, opts) => api()!.update(id, opts),
      dismiss: id => api()!.dismiss(id),
      dismissAll: () => api()!.dismissAll(),
    })
  }

  function ensureNode(item: ToastRecord): XhToastElement {
    // 到点自己走的默认不出叉，多一颗叉就多一个「要不要点」的判断；
    // 走不掉的反过来默认给叉。两者都能用 closable 显式改口
    const closable = item.closable ?? !selfDismissing(item, defaults.duration)
    let node = nodes.get(item.id)
    if (!node) {
      node = document.createElement('xh-toast') as XhToastElement
      nodes.set(item.id, node)
    }
    const shape = `${closable ? 'c' : ''}${item.actionLabel ? 'a' : ''}`
    if (shapes.get(item.id) !== shape) {
      shapes.set(item.id, shape)
      const root = partNode('div', 'root')
      // 节点平铺，不再套一层行容器：横排是皮肤的事，模板套一层只会与它打架。
      // 字形不在这儿渲染：它由皮肤按 root 上的 data-severity 画
      root.appendChild(partNode('div', 'title'))
      if (item.actionLabel)
        root.appendChild(partNode('button', 'action-trigger'))
      if (closable)
        root.appendChild(partNode('button', 'close-trigger'))
      node.replaceChildren(root)
    }
    const action = node.querySelector<HTMLElement>('[data-xh-part="action-trigger"]')
    if (action && action.textContent !== (item.actionLabel ?? ''))
      action.textContent = item.actionLabel ?? ''

    node.toastId = item.id
    node.titleText = toastTitle(item)
    // 语气跟着机器的缺省走（type 缺席即 info）
    node.type = item.type ?? 'info'
    // 单条 > 服务档 > 机器内建默认
    node.duration = item.duration ?? defaults.duration
    node.removeDelay = item.removeDelay ?? defaults.removeDelay
    node.closable = closable
    node.pauseOnPageIdle = defaults.pauseOnPageIdle
    node.paused = controller.state.paused
    node.translations = toastTranslations
    return node
  }

  /** 队列里没有的节点撤掉，剩下的按记录刷一遍属性并排到该在的位置。 */
  function render(): void {
    if (!service)
      return
    const items = visibleNotifications(service.context.get('items'), max, placement)
    controller.syncItems(items.map(item => item.id))
    const living = new Set(items.map(item => item.id))
    for (const [id, node] of nodes) {
      if (living.has(id))
        continue
      node.remove()
      nodes.delete(id)
      shapes.delete(id)
    }
    group.setAttribute('data-count', String(items.length))
    // 队列空着时整面定位面撤掉：留着白白多一个罩住整块视口的合成层
    group.toggleAttribute('hidden', items.length === 0)

    let previous: Element | null = null
    for (const item of items) {
      const node = ensureNode(item)
      // 队列顺序就是视觉顺序：位置对不上就搬过去，对得上不动它
      const anchor: Element | null = previous ? previous.nextElementSibling : group.firstElementChild
      if (anchor !== node)
        group.insertBefore(node, anchor)
      previous = node
    }
  }

  /** 走完退场的那条从队列里删掉。 */
  const onStatus = (event: Event): void => {
    const el = event.target as Element | null
    if (el?.tagName.toLowerCase() !== 'xh-toast')
      return
    const detail = (event as CustomEvent<{ id: string, status: string }>).detail
    if (detail?.status === 'unmounted')
      controller.unmounted(detail.id)
  }
  /** 行内动作按 id 现查那张回调表。 */
  const onPress = (event: Event): void => {
    const el = event.target as Element | null
    if (el?.tagName.toLowerCase() !== 'xh-toast')
      return
    const detail = (event as CustomEvent<{ id: string }>).detail
    if (detail?.id)
      controller.invokeAction(detail.id)
  }
  group.addEventListener('status-change', onStatus)
  group.addEventListener('action', onPress)

  /** 入队一条；回调另存一张表，队列记录里只留文案。 */
  const create = (opts: ToastCreateOptions = {}): string => {
    const { onAction, ...record } = opts
    return controller.create(record, onAction)
  }

  const sugar = (type: ToastType) => (message: string, opts: ToastMessageOptions = {}): string =>
    create({ ...opts, type, title: message })

  return {
    create,
    update: controller.update,
    dismiss: controller.dismiss,
    dismissAll: controller.dismissAll,
    info: sugar('info'),
    success: sugar('success'),
    warning: sugar('warning'),
    error: sugar('error'),
    loading: sugar('loading'),
    promise: <T>(input: Promise<T> | (() => Promise<T>), opts: ToastPromiseOptions<T>): Promise<T> => {
      const { loading, success, error, ...rest } = opts
      const running = typeof input === 'function' ? input() : input
      const { onAction, ...record } = rest
      return controller.trackPromise(
        running,
        { ...record, type: 'loading', title: loading },
        value => ({ type: 'success', title: typeof success === 'function' ? success(value) : success }),
        reason => ({ type: 'error', title: typeof error === 'function' ? error(reason) : error }),
        onAction,
      )
    },
    pauseAll: controller.pauseAll,
    resumeAll: controller.resumeAll,
    dispose: () => {
      group.removeEventListener('status-change', onStatus)
      group.removeEventListener('action', onPress)
      controller.dispose()
      runtime.unmount()
      service = null
      nodes.clear()
      shapes.clear()
      group.remove()
      release()
    },
  }
}
