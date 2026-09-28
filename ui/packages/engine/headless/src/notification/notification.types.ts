/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 notification 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/** 语气：与全库语气轴使用同一套词，决定行首字形与实时区级别。加载中不是语气，另有 loading 一位。 */
export type NotificationTone = 'info' | 'success' | 'warning' | 'danger'

/**
 * 单条对外的三段式生命周期。
 * visible 在状态机内部再分 running / paused 两个子态（计时器挂在 running 上），对外不区分。
 */
export type NotificationStatus = 'visible' | 'dismissing' | 'unmounted'

/**
 * 暂停来源。可同时存在多个暂停，最后一个解除后才继续。
 * 'service' 是宿主整组一起暂停的路径，经 `paused` prop；'stack' 是所在那一摞被展开，整摞一起按住。
 */
export type NotificationPauseSource = 'pointer' | 'focus' | 'page-idle' | 'api' | 'service' | 'stack'

/** 按压通道记住的按钮：close 是关闭按钮，action 是行内动作按钮。 */
export type NotificationPressedPart = 'close' | 'action'

/** 九宫格落位。第一段是纵向、第二段是横向（start/end 跟随文字方向）。 */
export type NotificationPlacement
  = | 'top-start' | 'top' | 'top-end'
    | 'middle-start' | 'middle' | 'middle-end'
    | 'bottom-start' | 'bottom' | 'bottom-end'

/**
 * 形态预设：一组缺省值的打包，不是视觉轴。
 * card 是标题加正文两层的卡片，逐条排开；toast 是一句话的轻提示，缺省叠成一摞。
 * 落位、上限、间距、停留、后台暂停与是否叠摞都还能单独改写，卡片排版与关闭钮档位随预设走。
 */
export type NotificationPreset = 'card' | 'toast'

/** 一个预设给出的缺省值；Root 上同名的 prop 写了就以 prop 为准。 */
export interface NotificationPresetDefaults {
  placement: NotificationPlacement
  /** 每个位置最多同时保留几条。 */
  max: number
  /** 同一摞内的间距（px）。 */
  gap: number
  /** 单条未写 duration 时的停留毫秒。 */
  duration: number
  /** 同一位置的几条是否叠成一摞。 */
  stacked: boolean
  /** 页面切到后台时是否暂停计时。 */
  pauseOnPageIdle: boolean
}

/**
 * 队列中存放的一条通知，只存放可搬运的纯数据（无回调、无 DOM），
 * 受控队列因此可以被宿主整份替换、序列化、比对。
 */
export interface NotificationRecord {
  id: string
  title?: string
  description?: string
  tone?: NotificationTone
  /** 事情尚未完成：行首换为加载环，且不自动消失。 */
  loading?: boolean
  duration?: number
  closable?: boolean
  /** 单条覆盖落位；未提供时使用 notification 的 placement。 */
  placement?: NotificationPlacement
  /**
   * 行内动作按钮的文案。提供后才渲染动作部件。
   * 只存放文案不存放回调：该条记录需要能被整份替换、序列化、比对，
   * 按下之后的行为由宿主按 id 自行查询。
   */
  actionLabel?: string
  /** 移除时优先移除低优先级。未提供时按语气派生：danger=2 / warning=1 / 其余=0。 */
  priority?: number
  /** 按内容合并后的条数，>1 时由服务投影在标题后追加计数。 */
  count?: number
}

/**
 * 重复的处理方式。
 * 'id'（默认）只按 id 寻址，同 id 就地改写，其余各占一条；
 * 'content' 在此之上再按语气与两层文本全同合并，并累加 count。
 */
export type NotificationDedupe = 'id' | 'content'

/** create 的入参：id 可省略，省略时生成一个并由 create 返回。 */
export type NotificationOptions = Omit<NotificationRecord, 'id'> & { id?: string }

/** 补齐 notification 默认值后的条目；命令式服务标题仍统一经过合并计数投影。 */
export interface ResolvedNotification extends NotificationRecord {
  preset: NotificationPreset
  placement: NotificationPlacement
  tone: NotificationTone
  loading: boolean
  duration: number
  closable: boolean
  pauseOnPageIdle: boolean
  /** 合并计数，未合并时为 1。 */
  count: number
}

export interface NotificationItemsChangeDetails {
  items: NotificationRecord[]
}

export interface NotificationTranslations {
  /** 该组的名字，读屏按它宣读该区域。 */
  region: string
  /** 卡片上关闭按钮的读屏名。 */
  close: string
}

export interface NotificationGroupProps {
  /** 该组对应的位置；未提供时使用 notification 的 placement。 */
  placement?: NotificationPlacement
}

export interface NotificationSchema extends MachineSchema {
  props: {
    /** 受控队列：提供后由宿主决定，内部写入只发 onItemsChange。 */
    items?: NotificationRecord[]
    defaultItems?: NotificationRecord[]
    /** 形态预设，默认 card。决定下面几项未写时的缺省值，以及卡片排版与关闭钮档位。 */
    preset?: NotificationPreset
    /** 默认落位：card 为 bottom-end，toast 为 bottom。 */
    placement?: NotificationPlacement
    /** 每个位置最多同时保留几条，超出时先移除低优先级、同级中移除最旧的。card 为 5、toast 为 3；提供 Infinity 即不限。 */
    max?: number
    /** 重复的处理方式，默认 'id'。 */
    dedupe?: NotificationDedupe
    /** 同一组内的间距（px）：card 为 16、toast 为 12。 */
    gap?: number
    /** 单条未写 duration 时的默认停留毫秒：card 为 5000、toast 为 4000。 */
    duration?: number
    /**
     * 同一位置的几条叠成一摞：最新的一条在最前，后层按层深收拢；指针或焦点进入后按真实高度展开，
     * 展开期间整摞的计时一并按住。card 默认不叠，toast 默认叠。
     */
    stacked?: boolean
    /** 页面切到后台时暂停计时，逐条下发：card 默认关闭，toast 默认开启。 */
    pauseOnPageIdle?: boolean
    translations?: Partial<NotificationTranslations>
    onItemsChange?: (details: NotificationItemsChangeDetails) => void
  }
  context: {
    items: NotificationRecord[]
    /** 自动 id 的流水号。放在 context 而不是模块变量：同页两个 notification 各自分配。 */
    seq: number
    /** 正被指针或焦点展开的那几摞，按落位记。只有叠摞时才会有。 */
    expanded: NotificationPlacement[]
  }
  computed: Record<string, never>
  refs: {
    /**
     * 作用域包装节点。条目到达与叠摞的追踪都挂在它上面：九个位置的卡片都在它底下。
     * 没有渲染宿主时为 null，追踪不接。
     */
    getRootEl: () => HTMLElement | null
  }
  /** 队列本身就是全部状态，没有第二种模式，因此只有一个状态位。 */
  state: 'idle'
  event:
    /** 同 id 视为就地改写（loading 转 success 即经此路径）。 */
    | { type: 'ITEMS.CREATE', item: NotificationRecord }
    | { type: 'ITEMS.UPDATE', id: string, patch: Partial<NotificationOptions> }
    | { type: 'ITEMS.DISMISS', id: string }
    | { type: 'ITEMS.DISMISS_ALL' }
    /** 某一摞被指针或焦点展开。 */
    | { type: 'STACK.EXPAND', placement: NotificationPlacement }
    /** 指针与焦点都离开、按下 Escape，或那一摞不再叠放。 */
    | { type: 'STACK.COLLAPSE', placement: NotificationPlacement }
  tag: never
  guard: never
  action: 'createItem' | 'updateItem' | 'dismissItem' | 'dismissAllItems' | 'expandStack' | 'collapseStack'
  effect: 'trackArrivals' | 'trackStacks'
}

export interface NotificationApi<T extends PropTypes = PropTypes> {
  /** 形态预设，已补齐缺省。 */
  preset: NotificationPreset
  /** 是否叠成一摞，已补齐缺省。 */
  stacked: boolean
  /** max 之内、按加入先后排列的可见条目，已补齐默认值。 */
  visibleNotifications: ResolvedNotification[]
  /** 当前有条目的位置，按九宫格固定顺序。作者据此决定渲染哪几个 group。 */
  placements: NotificationPlacement[]
  count: number
  getItemsByPlacement: (placement: NotificationPlacement) => ResolvedNotification[]
  /** 入队并返回 id；同 id 已存在则就地改写，位置不变。 */
  create: (options?: NotificationOptions) => string
  update: (id: string, options: Partial<NotificationOptions>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  getRootProps: () => T['element']
  getGroupProps: (props?: NotificationGroupProps) => T['element']
}

export interface NotificationStatusChangeDetails {
  /** 队列身份；未指定 id 时回退为实例 scope id。 */
  id: string
  status: NotificationStatus
}

export interface NotificationActionDetails {
  id: string
}

/** 单条卡片的状态机契约：计时、暂停、按压与退场。 */
export interface NotificationItemSchema extends MachineSchema {
  props: {
    /** 队列身份。服务档用它作为 create / update / dismiss 的寻址键。 */
    id?: string
    /** 形态预设，默认 card。决定未写 duration 时的停留、后台暂停的缺省与关闭钮档位。 */
    preset?: NotificationPreset
    /** 标题文本；作者未在 item-title 部件中写内容时由适配器填入。 */
    title?: string
    /** 补充说明；作者未在 item-description 部件中写内容时由适配器填入。 */
    description?: string
    /** 语气，默认 info。danger 使用 alert + assertive。 */
    tone?: NotificationTone
    /** 事情尚未完成：行首换为加载环，且不自动消失（duration 不再生效），完成后改写为其他语气收尾。 */
    loading?: boolean
    /** 停留毫秒，缺省按预设（card 5000、toast 4000）。<=0 或非有限数即不自动消失。 */
    duration?: number
    /** 是否显示可用的关闭按钮，默认 true。 */
    closable?: boolean
    /** 页面切到后台时暂停计时，缺省按预设（card 关闭、toast 开启）。 */
    pauseOnPageIdle?: boolean
    /**
     * 由宿主暂停计时，默认 false。整组一起暂停经此路径：
     * 置真时登记 'service' 暂停来源，置假时移除它，与指针、焦点等来源并存。
     */
    paused?: boolean
    translations?: Partial<NotificationTranslations>
    /** 生命周期落定时通知：dismissing 与 unmounted 各一次。宿主据此把条目移出队列。 */
    onStatusChange?: (details: NotificationStatusChangeDetails) => void
    /** 操作按钮被按下。 */
    onAction?: (details: NotificationActionDetails) => void
  }
  context: {
    /**
     * 剩余毫秒数。暂停时扣除已经过的部分，恢复时继续剩余部分。
     * Infinity 表示不自动消失。
     */
    remaining: number
    /** 当前暂停计时的来源集合，空集即计时进行中。 */
    pausedBy: NotificationPauseSource[]
    /**
     * 正被按住的按钮：Space / Enter 或触屏手指按下到松开之间，该按钮投影 data-pressed；没有按住时为 null。
     * 抬起、失焦、指针取消，或进入退场（按钮随条目一起离场）时撤下。
     */
    pressed: NotificationPressedPart | null
  }
  computed: Record<string, never>
  refs: {
    /**
     * 渲染宿主交来的进出场闸门：进入 dismissing 后等它的退场动画播完再转 unmounted。
     * 没有渲染宿主（无 DOM、直接驱动状态机）时为 null，没有退场可播，下一拍即转 unmounted。
     */
    presence: PresenceHandle | null
    /** 卡片节点。叠摞展开的追踪从它找到所在的那一摞；没有渲染宿主时为 null，追踪不接。 */
    getRootEl: () => HTMLElement | null
  }
  state: 'visible' | 'visible.running' | 'visible.paused' | 'dismissing' | 'unmounted'
  event:
    /** 立即进入退场（关闭按钮、宿主命令）。 */
    | { type: 'ITEM.DISMISS' }
    /** 操作按钮被按下：先发 onAction，再进入退场。 */
    | { type: 'ITEM.ACTION' }
    | { type: 'ITEM.PAUSE', src: NotificationPauseSource }
    | { type: 'ITEM.RESUME', src: NotificationPauseSource }
    /** 时长预算被改写（loading / duration / preset 变化），重新计算并重启计时器。 */
    | { type: 'ITEM.RESET' }
    | { type: 'after.duration' }
    /** 退场动画播完（或没有退场可播）。 */
    | { type: 'EXIT.COMPLETE' }
    /** 按压通道：某颗按钮被 Space / Enter 或触屏按住。 */
    | { type: 'PRESS.START', part: NotificationPressedPart }
    /** 该按钮抬起、失焦或指针取消。 */
    | { type: 'PRESS.END', part: NotificationPressedPart }
  tag: never
  guard: 'isLastPauseSource' | 'canPress'
  action:
    | 'addPauseSource'
    | 'removePauseSource'
    | 'resetDuration'
    | 'syncDuration'
    | 'syncPaused'
    | 'invokeAction'
    | 'invokeDismissing'
    | 'invokeUnmounted'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackDuration' | 'waitForExit' | 'trackPageIdle' | 'trackStack'
}

/**
 * 单条通知卡片的 API：一条到期自行消失的消息，计时、暂停、按压与退场都在这里。
 */
export interface NotificationItemApi<T extends PropTypes = PropTypes> {
  id: string
  /** 形态预设，已补齐缺省。 */
  preset: NotificationPreset
  status: NotificationStatus
  tone: NotificationTone
  loading: boolean
  title: string | undefined
  description: string | undefined
  /** 指针停在卡片上、焦点落在其中或宿主按住时为真：计时被暂停。自带皮肤只拿它停住倒计时条。 */
  paused: boolean
  closable: boolean
  /** 停留总时长（毫秒）；不自动消失的条目恒为 Infinity。 */
  duration: number
  /** 剩余毫秒数；不自动消失的条目恒为 Infinity。 */
  remaining: number
  dismiss: () => void
  pause: () => void
  resume: () => void
  getItemProps: () => T['element']
  /** 语气指示符：作者放入自己的图形，未放入时由皮肤按语气绘制兜底字形，加载中换为加载环。 */
  getItemIndicatorProps: () => T['element']
  /** 标题与说明的文本列。 */
  getItemContentProps: () => T['element']
  getItemTitleProps: () => T['element']
  getItemDescriptionProps: () => T['element']
  getItemActionTriggerProps: () => T['button']
  /** 倒计时条：不自动消失时收起。 */
  getItemProgressProps: () => T['element']
  getItemCloseTriggerProps: () => T['button']
}
