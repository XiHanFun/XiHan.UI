// 全局命令式通知服务：自带一个挂到 body 的宿主应用与默认渲染模板。
//
// 通知常常不是从组件树里发出来的——推送连接的回调、后台任务的收尾、拦截器里的
// 一条系统消息，调用点都在组件之外。要它们各自去找一份队列上下文并不现实，
// 所以队列由本服务持有，业务代码只管发。
//
// 队列要长在页面结构里（比如通知中心那一栏自己排版）时，用组件形态的
// XhNotificationRoot，那是另一条路，两者不共享队列。
import type {
  NotificationOptions,
  NotificationPlacement,
  NotificationTranslations,
  ResolvedNotification,
} from '@xihan-ui/headless'
import type { App, MaybeRefOrGetter, VNode } from 'vue'
import type { NotificationContext } from '../components/notification/context'
import type { XhConfig } from '../config/config'
import { ensurePortalRoot } from '@xihan-ui/core'
import { computed, createApp, defineComponent, Fragment, h, toValue } from 'vue'
import {
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
} from '../components/notification/notification'
import { useNotification } from '../components/notification/use-notification'
import { mountServiceHost } from './mount-host'
import { createServiceConfig } from './service-config'

export interface NotificationServiceOptions {
  /** 默认落位，默认 bottom-end；单条可用 options.placement 覆盖。 */
  placement?: NotificationPlacement
  /** 每个位置最多同时留几条，超出挤掉最旧的。不给即不限。 */
  max?: number
  /** 同一摞内的间距（px），默认 16。 */
  gap?: number
  duration?: number
  removeDelay?: number
  pauseOnPageIdle?: boolean
  /** 通知的文案：那一摞的读屏名与卡片上那颗叉的读屏名，一个桶装完。 */
  translations?: MaybeRefOrGetter<Partial<NotificationTranslations>>
  /**
   * 喂给通知子树的全局配置（locale / translations / size / portalContainer）。
   * 本服务自带宿主应用，接不到组件树里的 provideXhConfig，要让它跟应用同语言就从这里给；
   * 传 ref/getter 即可运行期跟着切语言，也可以之后用 setConfig 推。
   */
  config?: MaybeRefOrGetter<XhConfig>
  /** 宿主容器；不给就在 body 下新建一个。 */
  target?: HTMLElement
}

/** 类型糖的入参：只差 type 与 title，其余同 create。 */
export type NotificationMessageOptions = Omit<NotificationOptions, 'type' | 'title'>

export interface NotificationService {
  /** 入队并返回 id；同 id 已存在则就地改写，位置不动。 */
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (title: string, options?: NotificationMessageOptions) => string
  success: (title: string, options?: NotificationMessageOptions) => string
  warning: (title: string, options?: NotificationMessageOptions) => string
  error: (title: string, options?: NotificationMessageOptions) => string
  /** 换一份全局配置源。 */
  setConfig: (next: MaybeRefOrGetter<XhConfig> | undefined) => void
  /** 卸载宿主应用并移除容器。 */
  dispose: () => void
}

function defaultCard(
  item: ResolvedNotification,
  translations: Partial<NotificationTranslations> | undefined,
  onUnmounted: (id: string) => void,
): VNode {
  return h(XhNotificationItem, {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    duration: item.duration,
    removeDelay: item.removeDelay,
    closable: item.closable,
    pauseOnPageIdle: item.pauseOnPageIdle,
    translations,
    onStatusChange: ({ id, status }: { id: string, status: string }) => {
      if (status === 'unmounted')
        onUnmounted(id)
    },
  }, () => [
    // 四个节点平铺：两列网格与右上角那颗叉都归皮肤，模板套一层行容器只会与它打架。
    // 指示符与说明都恒渲染——皮肤的 :empty 规则负责把空盒收走，
    // 而 aria-describedby 无条件指着说明那一个，节点缺席就成了悬空引用
    h(XhNotificationItemIndicator),
    h(XhNotificationItemTitle),
    h(XhNotificationItemDescription),
    item.closable !== false ? h(XhNotificationItemCloseTrigger) : null,
  ])
}

export function createNotificationService(options: NotificationServiceOptions = {}): NotificationService {
  if (typeof document === 'undefined')
    throw new Error('createNotificationService 需要 document；SSR 里请等到客户端再创建')

  const { target, config, ...queueProps } = options
  const configSource = createServiceConfig(config)
  const holder = target ?? document.createElement('div')
  if (!target)
    ensurePortalRoot(document).appendChild(holder)

  let ctx: NotificationContext | null = null

  const Host = defineComponent({
    name: 'XhNotificationServiceHost',
    setup() {
      configSource.provide()
      // props 每帧现展开：文案是 getter 时才跟得上运行期切语言
      const inner = useNotification(() => ({ ...queueProps, translations: toValue(queueProps.translations) }))
      ctx = inner
      // 部件不经 provide/inject 取队列：本服务自己收 status-change 把走完退场的那条删掉，
      // 卡片与队列之间因此没有第二条隐式链路
      const api = computed(() => inner.api.value)
      return () => {
        const value = api.value
        return h('div', value.getRootProps() as Record<string, unknown>, value.placements.map(placement =>
          h(
            'div',
            { key: placement, ...value.getGroupProps({ placement }) as Record<string, unknown> },
            // 按队列身份 id 给 key，避免节点被就地复用
            value.getItemsByPlacement(placement).map(item => h(Fragment, { key: item.id }, [
              defaultCard(item, toValue(queueProps.translations), inner.dismiss),
            ])),
          )))
      }
    },
  })

  const app: App = createApp(Host)
  const mounted = mountServiceHost(app, holder, 'notification')
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
  const sugar = (type: NotificationOptions['type']) =>
    (title: string, opts: NotificationMessageOptions = {}): string =>
      use()?.create({ ...opts, type, title }) ?? ''

  return {
    create: opts => use()?.create(opts) ?? '',
    update: (id, opts) => use()?.update(id, opts),
    dismiss: id => use()?.dismiss(id),
    dismissAll: () => use()?.dismissAll(),
    info: sugar('info'),
    success: sugar('success'),
    warning: sugar('warning'),
    error: sugar('error'),
    setConfig: next => configSource.set(next),
    dispose: () => {
      if (mounted)
        app.unmount()
      disposed = true
      ctx = null
      if (!target)
        holder.remove()
    },
  }
}
