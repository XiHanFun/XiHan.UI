// 全局命令式通知服务：自带一个挂到浮层落点的 `<xh-notification>` 与默认模板。
//
// 通知常常不是从某个组件里发出来的——推送连接的回调、后台任务的收尾、拦截器里的
// 一条系统消息，调用点都在文档树之外。队列由这个元素持有，业务代码只管发。
//
// 队列要长在页面结构里（比如通知中心那一栏自己排版）时，直接写 `<xh-notification>`，
// 那是另一条路，两者不共享队列。
import type { NotificationOptions, NotificationPlacement, ResolvedNotification } from '@xihan-ui/headless'
import type { XhNotificationElement, XhNotificationItemElement } from '../elements/notification'
import type {
  NotificationCreateOptions,
  NotificationMessageOptions,
  NotificationService,
  NotificationServiceOptions,
} from './types'
import { createFeedbackServiceController, NOTIFICATION_PLACEMENT, NOTIFICATION_PLACEMENTS, resolveFeedbackServiceTitle } from '@xihan-ui/headless'
import { createServiceHolder, partNode, reportServiceFailure } from './host'
import { defineFeedbackElements } from './register'

export function createNotificationService(options: NotificationServiceOptions = {}): NotificationService {
  if (typeof document === 'undefined')
    throw new Error('createNotificationService 需要 document；SSR 里请等到客户端再创建')

  defineFeedbackElements()

  const { target, translations, ...queueProps } = options
  const { holder, release } = createServiceHolder(target)

  const queue = document.createElement('xh-notification') as XhNotificationElement
  const root = partNode('div', 'root')
  queue.appendChild(root)

  const groups = new Map<NotificationPlacement, HTMLElement>()
  const nodes = new Map<string, XhNotificationItemElement>()
  const shapes = new Map<string, string>()
  let mounted = true
  const controller = createFeedbackServiceController<NotificationOptions, Partial<NotificationOptions>>({
    name: 'notification',
    dismissOnUnmounted: false,
    onStateChange: () => render(),
  })

  queue.placement = queueProps.placement
  queue.max = queueProps.max
  queue.dedupe = queueProps.dedupe
  queue.gap = queueProps.gap
  queue.duration = queueProps.duration
  queue.removeDelay = queueProps.removeDelay
  queue.pauseOnPageIdle = queueProps.pauseOnPageIdle
  queue.translations = translations

  // 默认那一摞先建出来：group 是元素契约里的必需部件，一条通知都没有时也得在
  ensureGroup(queueProps.placement ?? NOTIFICATION_PLACEMENT).hidden = true

  try {
    holder.appendChild(queue)
  }
  catch (error) {
    mounted = reportServiceFailure('notification', error)
    release()
  }
  if (mounted) {
    controller.attach({
      create: opts => queue.create(opts),
      update: (id, opts) => queue.updateItem(id, opts),
      dismiss: id => queue.dismiss(id),
      dismissAll: () => queue.dismissAll(),
    })
  }

  /**
   * 那一摞。每个位置一个，按九宫格固定顺序插进 root——
   * 不按出现次序，否则同一批通知换个先后就会让整块界面重排。
   */
  function ensureGroup(placement: NotificationPlacement): HTMLElement {
    const existing = groups.get(placement)
    if (existing)
      return existing
    const group = partNode('div', 'group')
    group.setAttribute('placement', placement)
    groups.set(placement, group)
    const order = NOTIFICATION_PLACEMENTS.indexOf(placement)
    const after = NOTIFICATION_PLACEMENTS
      .slice(order + 1)
      .map(name => groups.get(name))
      .find(node => node != null)
    root.insertBefore(group, after ?? null)
    return group
  }

  function ensureNode(item: ResolvedNotification): XhNotificationItemElement {
    let node = nodes.get(item.id)
    if (!node) {
      node = document.createElement('xh-notification-item') as XhNotificationItemElement
      nodes.set(item.id, node)
    }
    const shape = `${item.closable ? 'c' : ''}${item.actionLabel ? 'a' : ''}`
    if (shapes.get(item.id) !== shape) {
      shapes.set(item.id, shape)
      const card = partNode('div', 'item')
      // 四个节点平铺：两列网格与右上角那颗叉都归皮肤，模板套一层行容器只会与它打架。
      // 指示符与说明都恒渲染——皮肤的 :empty 规则负责把空盒收走，
      // 而 aria-describedby 无条件指着说明那一个，节点缺席就成了悬空引用
      card.appendChild(partNode('div', 'item-indicator'))
      card.appendChild(partNode('div', 'item-title'))
      card.appendChild(partNode('div', 'item-description'))
      if (item.actionLabel)
        card.appendChild(partNode('button', 'item-action-trigger'))
      if (item.closable)
        card.appendChild(partNode('button', 'item-close-trigger'))
      node.replaceChildren(card)
    }
    const action = node.querySelector<HTMLElement>('[data-xh-part="item-action-trigger"]')
    if (action && action.textContent !== (item.actionLabel ?? ''))
      action.textContent = item.actionLabel ?? ''

    node.itemId = item.id
    node.titleText = resolveFeedbackServiceTitle(item)
    node.description = item.description
    node.type = item.type
    node.duration = item.duration
    node.removeDelay = item.removeDelay
    node.closable = item.closable
    node.pauseOnPageIdle = item.pauseOnPageIdle
    node.paused = controller.state.paused
    node.translations = translations
    return node
  }

  function render(): void {
    if (!mounted)
      return
    const items = queue.visibleNotifications
    controller.syncItems(items.map(item => item.id))
    const living = new Set(items.map(item => item.id))
    for (const [id, node] of nodes) {
      if (living.has(id))
        continue
      node.remove()
      nodes.delete(id)
      shapes.delete(id)
    }
    for (const placement of queue.placements)
      ensureGroup(placement)
    for (const [placement, group] of groups) {
      const list = queue.getItemsByPlacement(placement)
      // 空掉的那一摞收起而不是撤走：地标念不出内容就该退出无障碍树，
      // 但默认那一摞是元素契约里的必需部件，撤了整个通知就不再接线
      group.hidden = list.length === 0
      let previous: Element | null = null
      for (const item of list) {
        const node = ensureNode(item)
        const anchor: Element | null = previous ? previous.nextElementSibling : group.firstElementChild
        if (anchor !== node)
          group.insertBefore(node, anchor)
        previous = node
      }
    }
  }

  /** 队列一动就重画。元素自己发这条事件，服务不必再盯机器。 */
  const onItems = (): void => render()
  /** 走完退场的那条从队列里删掉；元素自己也收这条，这里只清回调表。 */
  const onStatus = (event: Event): void => {
    const detail = (event as CustomEvent<{ id: string, status: string }>).detail
    if (detail?.status === 'unmounted')
      controller.unmounted(detail.id)
  }
  const onPress = (event: Event): void => {
    const el = event.target as Element | null
    if (el?.tagName.toLowerCase() !== 'xh-notification-item')
      return
    const id = (el as XhNotificationItemElement).itemId
    if (id)
      controller.invokeAction(id)
  }
  queue.addEventListener('items-change', onItems)
  queue.addEventListener('status-change', onStatus)
  queue.addEventListener('action', onPress)

  /** 入队一条；回调另存一张表，队列记录里只留文案。 */
  const create = (opts: NotificationCreateOptions = {}): string => {
    const { onAction, ...record } = opts
    const id = controller.create(record, onAction)
    render()
    return id
  }

  const sugar = (type: NotificationCreateOptions['type']) =>
    (title: string, opts: NotificationMessageOptions = {}): string => create({ ...opts, type, title })

  return {
    create,
    update: (id, opts) => {
      controller.update(id, opts)
      render()
    },
    dismiss: (id) => {
      controller.dismiss(id)
      render()
    },
    dismissAll: () => {
      controller.dismissAll()
      render()
    },
    info: sugar('info'),
    success: sugar('success'),
    warning: sugar('warning'),
    error: sugar('error'),
    pauseAll: controller.pauseAll,
    resumeAll: controller.resumeAll,
    dispose: () => {
      mounted = false
      queue.removeEventListener('items-change', onItems)
      queue.removeEventListener('status-change', onStatus)
      queue.removeEventListener('action', onPress)
      controller.dispose()
      nodes.clear()
      shapes.clear()
      groups.clear()
      queue.remove()
      release()
    },
  }
}
