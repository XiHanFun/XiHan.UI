import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'
import type { ToastType } from '../toast'

/** 九宫格落位。第一段是纵向、第二段是横向（start/end 跟随文字方向）。 */
export type ToastPlacement
  = | 'top-start' | 'top' | 'top-end'
    | 'middle-start' | 'middle' | 'middle-end'
    | 'bottom-start' | 'bottom' | 'bottom-end'

/**
 * 队列里存的一条通知。刻意只放可搬运的纯数据（无回调、无 DOM）：
 * 受控队列要能被宿主整份替换、序列化、比对。
 */
export interface ToastRecord {
  id: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number
  removeDelay?: number
  closable?: boolean
  /** 单条覆盖落位；不给就用 toaster 的 placement。 */
  placement?: ToastPlacement
}

/** create 的入参：id 可省，省了就现生成一个并由 create 返回。 */
export type ToastOptions = Omit<ToastRecord, 'id'> & { id?: string }

/** 补齐 toaster 默认值后的条目：直接摊给 toast 部件即可，不必再兜一遍缺省。 */
export interface ResolvedToast extends ToastRecord {
  placement: ToastPlacement
  type: ToastType
  duration: number
  removeDelay: number
  closable: boolean
  pauseOnPageIdle: boolean
}

export interface ToasterToastsChangeDetails {
  toasts: ToastRecord[]
}

export interface ToasterTranslations {
  /** 地标容器的名字，读屏按它宣读这块区域。 */
  region: string
}

export interface ToasterGroupProps {
  /** 这一摞对应哪个位置；不给就用 toaster 的 placement。 */
  placement?: ToastPlacement
}

export interface ToasterSchema extends MachineSchema {
  props: {
    /** 受控队列：给了就由宿主说了算，内部写入只发 onToastsChange。 */
    toasts?: ToastRecord[]
    defaultToasts?: ToastRecord[]
    /** 默认落位，默认 bottom-end。 */
    placement?: ToastPlacement
    /** 每个位置最多同时留几条，超出挤掉最旧的。不给即不限。 */
    max?: number
    /** 同一摞内的间距（px），默认 16。 */
    gap?: number
    /** 单条没写 duration 时的默认停留毫秒。 */
    duration?: number
    /** 单条没写 removeDelay 时的默认退场窗口毫秒。 */
    removeDelay?: number
    /** 页面切到后台时暂停计时，逐条下发给 toast。 */
    pauseOnPageIdle?: boolean
    translations?: Partial<ToasterTranslations>
    onToastsChange?: (details: ToasterToastsChangeDetails) => void
  }
  context: {
    toasts: ToastRecord[]
    /** 自动 id 的流水号。放 context 不放模块变量：同页两个 toaster 各发各的号。 */
    seq: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 队列本身就是全部状态，没有第二种模式，因此只有一个状态位。 */
  state: 'idle'
  event:
    /** 同 id 视为就地改写（loading 转 success 走的就是这条）。 */
    | { type: 'TOASTS.CREATE', toast: ToastRecord }
    | { type: 'TOASTS.UPDATE', id: string, patch: Partial<ToastOptions> }
    | { type: 'TOASTS.DISMISS', id: string }
    | { type: 'TOASTS.DISMISS_ALL' }
  tag: never
  guard: never
  action: 'createToast' | 'updateToast' | 'dismissToast' | 'dismissAllToasts'
  effect: never
}

export interface ToasterApi<T extends PropTypes = PropTypes> {
  /** max 之内、按加入先后排列的可见条目，已补齐默认值。 */
  visibleToasts: ResolvedToast[]
  /** 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 */
  placements: ToastPlacement[]
  count: number
  getToastsByPlacement: (placement: ToastPlacement) => ResolvedToast[]
  /** 入队并返回 id；同 id 已存在则就地改写，位置不动。 */
  create: (options?: ToastOptions) => string
  update: (id: string, options: Partial<ToastOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  getRootProps: () => T['element']
  getGroupProps: (props?: ToasterGroupProps) => T['element']
}
