// 全局命令式通知服务：自带一个挂到 body 的宿主树与默认卡片模板，
// info/success 等命令在任意模块作用域可调（推送回调、请求拦截器），
// 不要求调用点在组件树内。
import type {
  NotificationDedupe,
  NotificationOptions,
  NotificationPlacement,
  NotificationTranslations,
  ResolvedNotification,
} from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { NotificationContext } from '../components/notification/context'
import type { XhConfigSource } from './service-config'
import { ensurePortalRoot } from '@xihan-ui/core'
import { Fragment, useSyncExternalStore } from 'react'
import {
  XhNotificationItem,
  XhNotificationItemActionTrigger,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from '../components/notification/notification'
import { useNotification } from '../components/notification/use-notification'
import { XhConfigProvider } from '../config/config'
import { mountServiceHost } from './mount-host'
import { createServiceConfig } from './service-config'

/** 文案可以给常量，也可以给取值函数——摞里的卡片会跨过一次切语言。 */
export type NotificationTranslationsSource
  = | Partial<NotificationTranslations>
    | (() => Partial<NotificationTranslations>)

export interface NotificationServiceOptions {
  /** 默认落位，默认 bottom-end；单条可用 options.placement 覆盖。 */
  placement?: NotificationPlacement
  /** 每个位置最多同时留几条，超出先挤低优先级的、同级里挤最旧的。不给即不限。 */
  max?: number
  /** 重复怎么算，默认 'id'；给 'content' 则同一句话合并成一条并计数。 */
  dedupe?: NotificationDedupe
  /** 同一摞内的间距（px），默认 16。 */
  gap?: number
  duration?: number
  removeDelay?: number
  pauseOnPageIdle?: boolean
  /** 通知的文案：那一摞的读屏名与卡片上那颗叉的读屏名，一个桶装完。 */
  translations?: NotificationTranslationsSource
  /**
   * 喂给通知子树的全局配置（locale / translations / size / portalContainer）。
   * 本服务自带宿主树，接不到组件树里的 XhConfigProvider，要让它跟应用同语言就从这里给；
   * 传取值函数即可运行期跟着切语言，也可以之后用 setConfig 推。
   */
  config?: XhConfigSource
  /** 宿主容器；不给就在 body 下新建一个。 */
  target?: HTMLElement
}

export interface NotificationCreateOptions extends NotificationOptions {
  onAction?: () => void
}

/** 类型糖的入参：只差 type 与 title，其余同 create。 */
export type NotificationMessageOptions = Omit<NotificationCreateOptions, 'type' | 'title'>

export interface NotificationService {
  /** 入队并返回 id；同 id 已存在则就地改写，合并掉的返回被并进的那一条。 */
  create: (options?: NotificationCreateOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (title: string, options?: NotificationMessageOptions) => string
  success: (title: string, options?: NotificationMessageOptions) => string
  warning: (title: string, options?: NotificationMessageOptions) => string
  error: (title: string, options?: NotificationMessageOptions) => string
  /** 把当下这些卡片的计时全按住，'service' 这一路与指针、焦点并存。 */
  pauseAll: () => void
  resumeAll: () => void
  /** 换一份全局配置源。 */
  setConfig: (next: XhConfigSource) => void
  /** 卸载宿主树并移除容器。 */
  dispose: () => void
}

/** 合并过的在标题后追加计数，没并过就是原话。 */
function cardTitle(item: ResolvedNotification): string | undefined {
  if (item.count <= 1 || item.title == null)
    return item.title
  return `${item.title} ×${item.count}`
}

function DefaultCard(props: {
  item: ResolvedNotification
  translations: Partial<NotificationTranslations> | undefined
  paused: boolean
  onUnmounted: (id: string) => void
  onAction: (id: string) => void
}): ReactNode {
  const { item } = props
  return (
    <XhNotificationItem
      id={item.id}
      title={cardTitle(item)}
      description={item.description}
      type={item.type}
      duration={item.duration}
      removeDelay={item.removeDelay}
      closable={item.closable}
      pauseOnPageIdle={item.pauseOnPageIdle}
      paused={props.paused}
      translations={props.translations}
      onStatusChange={({ id, status }: { id: string, status: string }) => {
        if (status === 'unmounted')
          props.onUnmounted(id)
      }}
      onAction={() => props.onAction(item.id)}
    >
      {/* 四个节点平铺：两列网格与右上角那颗叉都归皮肤，模板套一层行容器只会与它打架。
          指示符与说明都恒渲染——皮肤的 :empty 规则负责把空盒收走，
          而 aria-describedby 无条件指着说明那一个，节点缺席就成了悬空引用 */}
      <XhNotificationItemIndicator />
      <XhNotificationItemTitle />
      <XhNotificationItemDescription />
      {item.actionLabel ? <XhNotificationItemActionTrigger>{item.actionLabel}</XhNotificationItemActionTrigger> : null}
      {item.closable !== false ? <XhNotificationItemCloseTrigger /> : null}
    </XhNotificationItem>
  )
}

export function createNotificationService(options: NotificationServiceOptions = {}): NotificationService {
  if (typeof document === 'undefined')
    throw new Error('createNotificationService 需要 document；SSR 里请等到客户端再创建')

  const { target, config, ...queueProps } = options
  const configSource = createServiceConfig(config)
  const holder = target ?? document.createElement('div')
  if (!target)
    ensurePortalRoot(document).append(holder)

  let ctx: NotificationContext | null = null
  // 行内动作的回调按 id 存这儿：队列记录只放可搬运的纯数据，回调进不去
  const actions = new Map<string, () => void>()
  let pausedAll = false

  // 宿主树在组件树之外，暂停一类的状态只能自己存一份并推给它重渲
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

  const readTranslations = (): Partial<NotificationTranslations> | undefined =>
    typeof queueProps.translations === 'function' ? queueProps.translations() : queueProps.translations

  const remove = (id: string): void => {
    actions.delete(id)
    ctx?.dismiss(id)
  }

  function Host(): ReactNode {
    useSyncExternalStore(subscribe, () => version, () => version)
    // props 每帧现展开：文案是取值函数时才跟得上运行期切语言
    const inner = useNotification({ ...queueProps, translations: readTranslations() })
    ctx = inner
    // 部件不经上下文取队列：本服务自己收 status-change 把走完退场的那条删掉，
    // 卡片与队列之间因此没有第二条隐式链路
    const api = inner.api
    return (
      <XhConfigProvider config={configSource.read()}>
        <div {...api.getRootProps() as Record<string, unknown>}>
          {api.placements.map(placement => (
            <div key={placement} {...api.getGroupProps({ placement }) as Record<string, unknown>}>
              {/* 按队列身份 id 给 key，避免节点被就地复用 */}
              {api.getItemsByPlacement(placement).map(item => (
                <Fragment key={item.id}>
                  <DefaultCard
                    item={item}
                    translations={readTranslations()}
                    paused={pausedAll}
                    onUnmounted={remove}
                    onAction={id => actions.get(id)?.()}
                  />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </XhConfigProvider>
    )
  }

  const root: Root | null = mountServiceHost(holder, <Host />, 'notification')
  const mounted = root != null
  const stopConfig = configSource.subscribe(notify)
  let disposed = false

  /**
   * 宿主没挂起来时命令一律空转：把消息丢掉好过让调用点（推送回调、拦截器）连锁崩掉。
   * 已卸载则是另一回事——那是调用方拿着一个死服务在用，明说好过静默吞掉。
   */
  const use = (): NotificationContext | null => {
    if (disposed)
      throw new Error('notification 服务已卸载')
    return mounted ? ctx : null
  }

  /** 入队一条；回调另存一张表，队列记录里只留文案。 */
  const create = (opts: NotificationCreateOptions = {}): string => {
    const queue = use()
    if (!queue)
      return ''
    const { onAction, ...record } = opts
    const id = queue.create(record)
    if (onAction)
      actions.set(id, onAction)
    return id
  }

  const sugar = (type: NotificationOptions['type']) =>
    (title: string, opts: NotificationMessageOptions = {}): string =>
      create({ ...opts, type, title })

  return {
    create,
    update: (id, opts) => use()?.update(id, opts),
    dismiss: (id) => {
      if (use())
        remove(id)
    },
    dismissAll: () => {
      if (use()) {
        actions.clear()
        ctx?.dismissAll()
      }
    },
    info: sugar('info'),
    success: sugar('success'),
    warning: sugar('warning'),
    error: sugar('error'),
    pauseAll: () => {
      if (use()) {
        pausedAll = true
        notify()
      }
    },
    resumeAll: () => {
      if (use()) {
        pausedAll = false
        notify()
      }
    },
    setConfig: next => configSource.set(next),
    dispose: () => {
      stopConfig()
      root?.unmount()
      disposed = true
      ctx = null
      actions.clear()
      if (!target)
        holder.remove()
    },
  }
}
