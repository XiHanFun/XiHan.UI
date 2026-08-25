import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { ToastStatus, ToastType } from '../toast'

/**
 * 语气与生命周期与轻提示同一套词汇：两者都是「会自己消失的卡片」。
 * 这里另起一份名字，是为了用 notification 的作者不必在类型里读到 Toast。
 */
export type NotificationType = ToastType
export type NotificationStatus = ToastStatus

/** 九宫格落位。第一段是纵向、第二段是横向（start/end 跟随文字方向）。 */
export type NotificationPlacement
  = | 'top-start' | 'top' | 'top-end'
    | 'middle-start' | 'middle' | 'middle-end'
    | 'bottom-start' | 'bottom' | 'bottom-end'

/**
 * 队列里存的一条通知，只放可搬运的纯数据（无回调、无 DOM），
 * 受控队列因此可以被宿主整份替换、序列化、比对。
 */
export interface NotificationRecord {
  id: string
  title?: string
  description?: string
  type?: NotificationType
  duration?: number
  removeDelay?: number
  closable?: boolean
  /** 单条覆盖落位；不给就用 notification 的 placement。 */
  placement?: NotificationPlacement
}

/** create 的入参：id 可省，省了就现生成一个并由 create 返回。 */
export type NotificationOptions = Omit<NotificationRecord, 'id'> & { id?: string }

/** 补齐 notification 默认值后的条目：直接摊给 toast 部件即可，不必再兜一遍缺省。 */
export interface ResolvedNotification extends NotificationRecord {
  placement: NotificationPlacement
  type: NotificationType
  duration: number
  removeDelay: number
  closable: boolean
  pauseOnPageIdle: boolean
}

export interface NotificationItemsChangeDetails {
  items: NotificationRecord[]
}

export interface NotificationTranslations {
  /** 地标容器的名字，读屏按它宣读这块区域。 */
  region: string
}

export interface NotificationGroupProps {
  /** 这一摞对应哪个位置；不给就用 notification 的 placement。 */
  placement?: NotificationPlacement
}

export interface NotificationSchema extends MachineSchema {
  props: {
    /** 受控队列：给了就由宿主说了算，内部写入只发 onItemsChange。 */
    items?: NotificationRecord[]
    defaultItems?: NotificationRecord[]
    /** 默认落位，默认 bottom-end。 */
    placement?: NotificationPlacement
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
    translations?: Partial<NotificationTranslations>
    onItemsChange?: (details: NotificationItemsChangeDetails) => void
  }
  context: {
    items: NotificationRecord[]
    /** 自动 id 的流水号。放 context 不放模块变量：同页两个 notification 各发各的号。 */
    seq: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 队列本身就是全部状态，没有第二种模式，因此只有一个状态位。 */
  state: 'idle'
  event:
    /** 同 id 视为就地改写（loading 转 success 走的就是这条）。 */
    | { type: 'ITEMS.CREATE', item: NotificationRecord }
    | { type: 'ITEMS.UPDATE', id: string, patch: Partial<NotificationOptions> }
    | { type: 'ITEMS.DISMISS', id: string }
    | { type: 'ITEMS.DISMISS_ALL' }
  tag: never
  guard: never
  action: 'createItem' | 'updateItem' | 'dismissItem' | 'dismissAllItems'
  effect: never
}

export interface NotificationApi<T extends PropTypes = PropTypes> {
  /** max 之内、按加入先后排列的可见条目，已补齐默认值。 */
  visibleNotifications: ResolvedNotification[]
  /** 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 */
  placements: NotificationPlacement[]
  count: number
  getItemsByPlacement: (placement: NotificationPlacement) => ResolvedNotification[]
  /** 入队并返回 id；同 id 已存在则就地改写，位置不动。 */
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  getRootProps: () => T['element']
  getGroupProps: (props?: NotificationGroupProps) => T['element']
}

/**
 * 单条通知卡片的 API。
 *
 * 计时、暂停与退场复用 toast 那台机器——那是「会自己消失的卡片」这一通用行为，
 * 与「这条消息是主动推来的还是操作反馈」无关。
 */
export interface NotificationItemApi<T extends PropTypes = PropTypes> {
  id: string
  status: NotificationStatus
  type: NotificationType
  title: string | undefined
  description: string | undefined
  /** 指针停在卡片上、或焦点落在里面时为真：计时被按住。 */
  paused: boolean
  closable: boolean
  /** 还剩多少毫秒；不自动消失的那些恒为 Infinity。 */
  remaining: number
  dismiss: () => void
  pause: () => void
  resume: () => void
  getItemProps: () => T['element']
  getItemTitleProps: () => T['element']
  getItemDescriptionProps: () => T['element']
  getItemActionTriggerProps: () => T['button']
  getItemCloseTriggerProps: () => T['button']
}
