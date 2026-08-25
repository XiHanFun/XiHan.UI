// 全局命令式轻提示服务：自带一个挂到 body 的宿主应用与默认渲染模板，
// info/success 等命令在任意模块作用域可调（请求拦截器、store），
// 不要求调用点在组件树内。
//
// 队列是本服务的私事，没有对应的容器组件：一次操作的反馈落在哪儿是整个服务的口径，
// 不该让每个业务页面各挂一份容器再各自决定。
import type { ToastOptions, ToastPlacement, ToastRecord, ToastTranslations, ToastType } from '@xihan-ui/headless'
import type { App, MaybeRefOrGetter, VNode } from 'vue'
import type { XhConfig } from '../config/config'
import { TOAST_DURATION, TOAST_GAP, TOAST_PLACEMENT, toastAnatomy } from '@xihan-ui/headless'
import { DATA_INERT_EXEMPT, ensurePortalRoot } from '@xihan-ui/kernel'
import { createApp, defineComponent, Fragment, h, shallowRef, toValue } from 'vue'
import { XhToastCloseTrigger, XhToastRoot, XhToastTitle } from '../components/toast/toast'
import { typeGlyph } from './glyph'
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
  /** 最多同时留几条，超出挤掉最旧的，默认 5。 */
  max?: number
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

/** 类型糖的入参：只差 type，其余同 create。 */
export type ToastMessageOptions = Omit<ToastOptions, 'type' | 'title'>

export interface ToastService {
  /** 入队并返回 id；同 id 已存在则就地改写。 */
  create: (options?: ToastOptions) => string
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

function defaultToast(
  toast: ToastRecord,
  defaults: ToastDefaults,
  translations: Partial<ToastTranslations> | undefined,
  onUnmounted: (id: string) => void,
): VNode {
  // 到点自己走的默认不出叉，多一颗叉就多一个「要不要点」的判断；
  // 走不掉的反过来默认给叉。两者都能用 closable 显式改口
  const closable = toast.closable ?? !selfDismissing(toast, defaults)
  // 语气跟着 connect 的缺省走（type 缺席即 info），字形不能在这儿另算一份——
  // 算差了就成了「整条蓝淡底、却没有字形」的半截态
  const type = toast.type ?? 'info'
  return h(XhToastRoot, {
    id: toast.id,
    title: toast.title,
    type,
    // 单条 > 服务档 > 机器内建默认
    duration: toast.duration ?? defaults.duration,
    removeDelay: toast.removeDelay ?? defaults.removeDelay,
    closable,
    pauseOnPageIdle: defaults.pauseOnPageIdle,
    translations,
    onStatusChange: ({ id, status }: { id: string, status: string }) => {
      if (status === 'unmounted')
        onUnmounted(id)
    },
  }, () => [
    // 三个节点平铺，不再套一层行容器：横排是皮肤的事，模板套一层只会与它打架
    typeGlyph(type),
    h(XhToastTitle),
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
    ...defaults
  } = options
  const configSource = createServiceConfig(config)
  const holder = target ?? document.createElement('div')
  if (!target)
    ensurePortalRoot(document).appendChild(holder)

  // 队列本身就是全部状态，没有第二种模式，也没有第二个使用者：一个数组足够，不必上机器
  const queue = shallowRef<ToastRecord[]>([])
  let seq = 0

  const indexOf = (id: string): number => queue.value.findIndex(item => item.id === id)

  const create = (opts: ToastOptions = {}): string => {
    const id = opts.id ?? `toast-${++seq}`
    const at = indexOf(id)
    // 同 id 视为就地改写（loading 转 success 走的就是这条），位置不动
    if (at >= 0) {
      const next = queue.value.slice()
      next[at] = { ...next[at]!, ...opts, id }
      queue.value = next
      return id
    }
    const next = [...queue.value, { ...opts, id }]
    // 超出上限就挤掉最旧的；<=0 与非有限数一并按不限处理
    queue.value = Number.isFinite(max) && max > 0 && next.length > max ? next.slice(next.length - max) : next
    return id
  }

  const update = (id: string, opts: Partial<ToastOptions>): void => {
    const at = indexOf(id)
    if (at < 0)
      return
    const next = queue.value.slice()
    next[at] = { ...next[at]!, ...opts, id }
    queue.value = next
  }

  const remove = (id: string): void => {
    const next = queue.value.filter(item => item.id !== id)
    if (next.length !== queue.value.length)
      queue.value = next
  }

  const Host = defineComponent({
    name: 'XhToastServiceHost',
    setup() {
      configSource.provide()
      return () => h(
        'div',
        // 摞没有对应的容器组件，属性直接从解剖里取
        {
          ...parts.group.attrs,
          'data-placement': placement,
          'data-count': queue.value.length,
          'style': { gap: `${gap}px` },
          // 模态浮层给背景施加 inert 时跳过这一摞：轻提示画在遮罩之上，
          // 一并罩住就成了看得见、点不动、读屏也跳过
          [DATA_INERT_EXEMPT]: '',
          // 队列空着时整面定位面撤掉：留着白白多一个罩住整块视口的合成层
          'hidden': queue.value.length === 0 || undefined,
        },
        // 按队列身份 id 给 key，避免节点被就地复用
        queue.value.map(toast => h(Fragment, { key: toast.id }, [
          defaultToast(toast, defaults, toValue(toastTranslations), remove),
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
    return mounted
  }
  const sugar = (type: ToastType) => (message: string, opts: ToastMessageOptions = {}): string =>
    alive() ? create({ ...opts, type, title: message }) : ''

  return {
    create: opts => (alive() ? create(opts) : ''),
    update: (id, opts) => {
      if (alive())
        update(id, opts)
    },
    dismiss: (id) => {
      if (alive())
        remove(id)
    },
    dismissAll: () => {
      if (alive())
        queue.value = []
    },
    info: sugar('info'),
    success: sugar('success'),
    warning: sugar('warning'),
    error: sugar('error'),
    loading: sugar('loading'),
    setConfig: next => configSource.set(next),
    dispose: () => {
      if (mounted)
        app.unmount()
      disposed = true
      queue.value = []
      if (!target)
        holder.remove()
    },
  }
}
