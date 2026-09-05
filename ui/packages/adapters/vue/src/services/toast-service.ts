// 全局命令式轻提示服务：自带一个挂到 body 的宿主应用与默认渲染模板，
// info/success 等命令在任意模块作用域可调（请求拦截器、store），
// 不要求调用点在组件树内。
//
// 摞落在哪儿是整个服务的口径，不该让每个业务页面各挂一份容器再各自决定，
// 因此这里没有对应的容器组件；队列本身跑的是 notification 那台队列机器，
// 上限、挤条与合并计数全库一份实现。
import type {
  NotificationDedupe,
  ToastOptions,
  ToastPlacement,
  ToastRecord,
  ToastTranslations,
  ToastType,
} from '@xihan-ui/headless'
import type { App, MaybeRefOrGetter, VNode } from 'vue'
import type { XhConfig } from '../config/config'
import { DATA_INERT_EXEMPT, ensurePortalRoot } from '@xihan-ui/core'
import {
  connectNotification,
  notificationMachine,
  TOAST_DURATION,
  TOAST_GAP,
  TOAST_PLACEMENT,
  toastAnatomy,
  visibleNotifications,
} from '@xihan-ui/headless'
import { computed, createApp, defineComponent, Fragment, h, shallowRef, toValue } from 'vue'
import { XhToastActionTrigger, XhToastCloseTrigger, XhToastRoot, XhToastTitle } from '../components/toast/toast'
import { vueNormalize } from '../runtime/normalize-props'
import { useMachine } from '../runtime/use-machine'
import { mountServiceHost } from './mount-host'
import { createServiceConfig } from './service-config'

const parts = toastAnatomy.build()

/** 单条没写时的兜底：服务档一次定好，逐条渲染时补进去。 */
interface ToastDefaults {
  duration?: number
  removeDelay?: number
  pauseOnPageIdle?: boolean
}

export interface ToastServiceOptions extends ToastDefaults {
  /** 那一摞落在哪儿，默认 'top'：视线正好在刚才操作的地方上方。 */
  placement?: ToastPlacement
  /** 最多同时留几条，默认 5；超出先挤低优先级的，同级里挤最旧的。 */
  max?: number
  /** 重复怎么算，默认 'id'；给 'content' 则同一句话合并成一条并计数。 */
  dedupe?: NotificationDedupe
  /** 摞内间距（px），默认 16。 */
  gap?: number
  /** toast 部件的文案（关闭钮的读屏名等）。 */
  toastTranslations?: MaybeRefOrGetter<Partial<ToastTranslations>>
  /**
   * 喂给轻提示子树的全局配置（locale / translations / size / portalContainer）。
   * 本服务自带宿主应用，接不到组件树里的 provideXhConfig，要让它跟应用同语言就从这里给；
   * 传 ref/getter 即可运行期跟着切语言，也可以之后用 setConfig 推。
   */
  config?: MaybeRefOrGetter<XhConfig>
  /** 宿主容器；不给就在 body 下新建一个。 */
  target?: HTMLElement
}

/**
 * create 的入参。`actionLabel` 是条子上那颗行内动作钮的文案，`onAction` 是按下它做什么——
 * 回调不进队列记录（那份要能被整份替换、序列化、比对），服务按 id 单独存一张表。
 */
export interface ToastCreateOptions extends ToastOptions {
  onAction?: () => void
}

/** 类型糖的入参：只差 type，其余同 create。 */
export type ToastMessageOptions = Omit<ToastCreateOptions, 'type' | 'title'>

/** promise 三态的文案：成功与失败可以给函数，拿到结果再拼话。 */
export interface ToastPromiseOptions<T> extends Omit<ToastMessageOptions, 'duration'> {
  loading: string
  success: string | ((value: T) => string)
  error: string | ((reason: unknown) => string)
}

export interface ToastService {
  /** 入队并返回 id；同 id 已存在则就地改写，合并掉的返回被并进的那一条。 */
  create: (options?: ToastCreateOptions) => string
  update: (id: string, options: Partial<ToastOptions>) => void
  /** 立刻从队列里删掉。条子自己的关闭按钮走的是退场窗口，有退场动画。 */
  dismiss: (id: string) => void
  dismissAll: () => void
  info: (message: string, options?: ToastMessageOptions) => string
  success: (message: string, options?: ToastMessageOptions) => string
  warning: (message: string, options?: ToastMessageOptions) => string
  error: (message: string, options?: ToastMessageOptions) => string
  /** 返回 id，之后用 update(id, { type: 'success', title: … }) 收尾。 */
  loading: (message: string, options?: ToastMessageOptions) => string
  /**
   * 先弹一条 loading，Promise 落定后就地改写成 success / error。
   * 返回那一条的 id；Promise 的结果原样交回给调用方，拒绝也照旧拒绝。
   */
  promise: <T>(input: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>) => Promise<T>
  /** 把当下这一摞的计时全按住，'service' 这一路与指针、焦点并存。 */
  pauseAll: () => void
  resumeAll: () => void
  /** 换一份全局配置源。 */
  setConfig: (next: MaybeRefOrGetter<XhConfig> | undefined) => void
  /** 卸载宿主应用并移除容器。 */
  dispose: () => void
}

/**
 * 这一条会不会自己走掉。loading 一直挂着，duration <= 0 与非有限值也是。
 * 走不掉的必须留个出口，否则界面上一个可点、可聚焦的节点都没有。
 */
function selfDismissing(toast: ToastRecord, defaults: ToastDefaults): boolean {
  if (toast.type === 'loading')
    return false
  const duration = toast.duration ?? defaults.duration ?? TOAST_DURATION
  return Number.isFinite(duration) && duration > 0
}

/** 合并过的在标题后追加计数，没并过就是原话。 */
function toastTitle(toast: ToastRecord): string | undefined {
  const count = toast.count ?? 1
  if (count <= 1 || toast.title == null)
    return toast.title
  return `${toast.title} ×${count}`
}

function defaultToast(
  toast: ToastRecord,
  defaults: ToastDefaults,
  translations: Partial<ToastTranslations> | undefined,
  paused: boolean,
  onUnmounted: (id: string) => void,
  onAction: (id: string) => void,
): VNode {
  // 到点自己走的默认不出叉，多一颗叉就多一个「要不要点」的判断；
  // 走不掉的反过来默认给叉。两者都能用 closable 显式改口
  const closable = toast.closable ?? !selfDismissing(toast, defaults)
  // 语气跟着 connect 的缺省走（type 缺席即 info）。字形不在这儿渲染：
  // 它由皮肤按 root 上的 data-severity 画，声明式用法与 Web Components 那侧才拿得到同一枚
  const type = toast.type ?? 'info'
  return h(XhToastRoot, {
    id: toast.id,
    title: toastTitle(toast),
    type,
    // 单条 > 服务档 > 机器内建默认
    duration: toast.duration ?? defaults.duration,
    removeDelay: toast.removeDelay ?? defaults.removeDelay,
    closable,
    pauseOnPageIdle: defaults.pauseOnPageIdle,
    paused,
    translations,
    onStatusChange: ({ id, status }: { id: string, status: string }) => {
      if (status === 'unmounted')
        onUnmounted(id)
    },
    onAction: ({ id }: { id: string }) => onAction(id),
  }, () => [
    // 节点平铺，不再套一层行容器：横排是皮肤的事，模板套一层只会与它打架
    h(XhToastTitle),
    toast.actionLabel ? h(XhToastActionTrigger, () => toast.actionLabel) : null,
    closable ? h(XhToastCloseTrigger) : null,
  ])
}

export function createToastService(options: ToastServiceOptions = {}): ToastService {
  if (typeof document === 'undefined')
    throw new Error('createToastService 需要 document；SSR 里请等到客户端再创建')

  const {
    target,
    toastTranslations,
    config,
    placement = TOAST_PLACEMENT,
    gap = TOAST_GAP,
    max = 5,
    dedupe,
    ...defaults
  } = options
  const configSource = createServiceConfig(config)
  const holder = target ?? document.createElement('div')
  if (!target)
    ensurePortalRoot(document).appendChild(holder)

  // 队列跑 notification 那台队列机器：上限、挤条与合并计数全库一份实现，
  // 这一摞只是它的另一个渲染端（落位由服务档一次定好，不逐条各去一处）
  let queue: {
    create: (opts: ToastOptions) => string
    update: (id: string, opts: Partial<ToastOptions>) => void
    dismiss: (id: string) => void
    dismissAll: () => void
  } | null = null

  // 行内动作的回调按 id 存这儿：队列记录只放可搬运的纯数据，回调进不去
  const actions = new Map<string, () => void>()
  const pausedAll = shallowRef(false)
  let seq = 0

  const remove = (id: string): void => {
    actions.delete(id)
    queue?.dismiss(id)
  }

  const Host = defineComponent({
    name: 'XhToastServiceHost',
    setup() {
      configSource.provide()
      const service = useMachine(notificationMachine, () => ({
        placement,
        max,
        dedupe,
        duration: defaults.duration,
        removeDelay: defaults.removeDelay,
        pauseOnPageIdle: defaults.pauseOnPageIdle,
      }))
      const api = computed(() => connectNotification(service, vueNormalize))
      // 渲染读原始记录而不是 connect 补齐后的那份：条子的 closable 缺省是
      // 「到点自己走的不出叉」，与通知卡片的恒出叉不是同一条规则
      const items = computed(() => visibleNotifications(service.context.get('items'), max, placement))
      queue = {
        create: opts => api.value.create(opts),
        update: (id, opts) => api.value.update(id, opts),
        dismiss: id => api.value.dismiss(id),
        dismissAll: () => api.value.dismissAll(),
      }
      return () => h(
        'div',
        // 摞没有对应的容器组件，属性直接从解剖里取
        {
          ...parts.group.attrs,
          'data-placement': placement,
          'data-count': items.value.length,
          'style': { gap: `${gap}px` },
          // 模态浮层给背景施加 inert 时跳过这一摞：轻提示画在遮罩之上，
          // 一并罩住就成了看得见、点不动、读屏也跳过
          [DATA_INERT_EXEMPT]: '',
          // 队列空着时整面定位面撤掉：留着白白多一个罩住整块视口的合成层
          'hidden': items.value.length === 0 || undefined,
        },
        // 按队列身份 id 给 key，避免节点被就地复用
        items.value.map(toast => h(Fragment, { key: toast.id }, [
          defaultToast(
            toast,
            defaults,
            toValue(toastTranslations),
            pausedAll.value,
            remove,
            id => actions.get(id)?.(),
          ),
        ])),
      )
    },
  })

  const app: App = createApp(Host)
  const mounted = mountServiceHost(app, holder, 'toast')
  let disposed = false

  /**
   * 宿主没挂起来时命令一律空转：把提示丢掉好过让调用点（拦截器、store）连锁崩掉。
   * 已卸载则是另一回事——那是调用方拿着一个死服务在用，明说好过静默吞掉。
   */
  const alive = (): boolean => {
    if (disposed)
      throw new Error('toast 服务已卸载')
    return mounted && queue != null
  }

  /** 入队一条；回调另存一张表，队列记录里只留文案。 */
  const create = (opts: ToastCreateOptions = {}): string => {
    const { onAction, ...record } = opts
    const id = queue!.create({ ...record, id: record.id ?? `toast-${++seq}` })
    if (onAction)
      actions.set(id, onAction)
    return id
  }

  const sugar = (type: ToastType) => (message: string, opts: ToastMessageOptions = {}): string =>
    alive() ? create({ ...opts, type, title: message }) : ''

  return {
    create: opts => (alive() ? create(opts) : ''),
    update: (id, opts) => {
      if (alive())
        queue!.update(id, opts)
    },
    dismiss: (id) => {
      if (alive())
        remove(id)
    },
    dismissAll: () => {
      if (alive()) {
        actions.clear()
        queue!.dismissAll()
      }
    },
    info: sugar('info'),
    success: sugar('success'),
    warning: sugar('warning'),
    error: sugar('error'),
    loading: sugar('loading'),
    promise: <T>(input: Promise<T> | (() => Promise<T>), opts: ToastPromiseOptions<T>): Promise<T> => {
      const { loading, success, error, ...rest } = opts
      const running = typeof input === 'function' ? input() : input
      if (!alive())
        return running
      const id = create({ ...rest, type: 'loading', title: loading })
      return running.then(
        (value) => {
          if (!disposed)
            queue!.update(id, { type: 'success', title: typeof success === 'function' ? success(value) : success })
          return value
        },
        (reason: unknown) => {
          if (!disposed)
            queue!.update(id, { type: 'error', title: typeof error === 'function' ? error(reason) : error })
          throw reason
        },
      )
    },
    pauseAll: () => {
      if (alive())
        pausedAll.value = true
    },
    resumeAll: () => {
      if (alive())
        pausedAll.value = false
    },
    setConfig: next => configSource.set(next),
    dispose: () => {
      if (mounted)
        app.unmount()
      disposed = true
      queue = null
      actions.clear()
      if (!target)
        holder.remove()
    },
  }
}
