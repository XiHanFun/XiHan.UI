import type { Typeahead } from '@xihan-ui/behavior'
import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 展开时焦点落在集合的哪一端：ArrowUp 那类反向入口从末尾进，键盘入口从首个可用条目进。
 * 'none' 是指针与命令式入口的落点，也是缺省值——不预先挑锚点，展开那一刻一个条目都不带高亮，
 * 焦点由焦点域兜底歇在 content 上。
 */
export type ContextMenuFocusIntent = 'first' | 'last' | 'none'

/** 锚点坐标，视口坐标系（与 PointerEvent.clientX/clientY 同一套）。 */
export interface ContextMenuPoint {
  x: number
  y: number
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用一律短路。
export interface ContextMenuRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 被定位的浮层容器，通常是 positioner。锚点是光标坐标，不是元素，故没有 getAnchorEl。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 连打检索缓冲，随服务存活；放模块变量会让同页两个菜单共用一个缓冲。 */
  typeahead: Typeahead
  /**
   * 把定位重新挂到当前坐标上的钩子，由定位效应装填、坐标变化时由 watch 调用；展开期外恒为 null。
   *
   * 走钩子而不是让效应跟着坐标重挂：重挂会连带把层、消解层与焦点域一起拆掉重建。
   */
  reanchor: (() => void) | null
}

export interface ContextMenuOpenChangeDetails {
  open: boolean
}

export interface ContextMenuSelectDetails {
  value: string
}

/** 条目数据。给了 collection，显示文本、禁用、标记位与分组就以它为准。 */
export interface ContextMenuNode {
  value: string
  /** 展示文本，也是连打检索的取字处；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
  /** 标记位文字（勾选符号这类装饰）；缺省即本条不铺 item-indicator。 */
  indicator?: string
  /** 归属分组的身份值；相邻同值的条目收进同一个 group 部件。缺省即本条直接落在 content 上。 */
  group?: string
  /** 分组标题文字，取本组首个给出它的条目；本组无人给出即不铺 group-label。 */
  groupLabel?: string
  /** 本条之前画一条分隔线；写在首条上不产出分隔线。本条领头一个分组时，分隔线画在分组外面。 */
  separatorBefore?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含高亮态。 */
export interface ContextMenuNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 标记位文字；没给即 null。 */
  indicator: string | null
  /** 分组身份；没给即 null。 */
  group: string | null
  /** 分组标题；没给即 null。 */
  groupLabel: string | null
  separatorBefore: boolean
}

/**
 * 条目自报家门：值必报，禁用可由 collection 代为声明。
 * connect 不得反查 DOM：Vue 侧在 render 期求值（此时 DOM 不存在），WC 侧在 updated 后求值。
 */
export interface ContextMenuItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
  disabled?: boolean
}

/** 分组自报身份：分组标题的 id 由它派生，group 与 group-label 靠这一个值互相认领。 */
export interface ContextMenuGroupProps {
  value: string
}

/** 读屏用的文案，默认英文。 */
export interface ContextMenuTranslations {
  /** 菜单容器的名字。触发区是作者的任意一块内容，名字只能由这里给。 */
  content: string
}

export interface ContextMenuSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本、禁用、标记位与分组的事实源。给了它，条目部件只需报 value。
     * 缺省即回到「文本与禁用全写在条目部件上」的老路。
     */
    collection?: ContextMenuNode[]
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 相对光标那一点的首选放置位，默认 bottom-start。 */
    placement?: Placement
    /** 浮层与光标的间距（px），默认 0——右键菜单要贴着光标。 */
    offset?: number
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 连打检索，默认开。关掉后可打印字符一律放行给页面。 */
    typeahead?: boolean
    /** 读屏用的文案，默认英文。 */
    translations?: Partial<ContextMenuTranslations>
    /** 触摸端长按多久算触发（ms），默认 700。 */
    longPressDelay?: number
    /** 语气：brand / neutral / success / warning / danger / info，决定条目高亮与标记位用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 */
    size?: Size
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: ContextMenuOpenChangeDetails) => void
    /** 条目被选中；菜单随之关闭。 */
    onSelect?: (details: ContextMenuSelectDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 当前锚点坐标：菜单钉在这一点上，展开期间再右键只改它。 */
    point: ContextMenuPoint | null
    /** 长按起点，用于判定手指是否已经滑走。 */
    pressPoint: ContextMenuPoint | null
    /** roving tabindex 的锚点，同时是方向键的起点；收起即清空。 */
    focusedValue: string | null
    /** 本次展开的落焦端；受控回写走 CONTROLLED.OPEN 时也读得到。'none' 即不落焦。 */
    focusIntent: ContextMenuFocusIntent
    /** 关闭时是否把焦点归还触发区；Tab 与层外交互关闭时为 false，让焦点自然离开。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: ContextMenuRefs
  state: 'closed' | 'pressing' | 'open'
  event:
    /** 右键（或触摸端合成的同名事件）：坐标即锚点。 */
    | { type: 'CONTEXT.MENU', x: number, y: number, focus?: ContextMenuFocusIntent }
    /** 命令式展开到指定坐标。 */
    | { type: 'OPEN', x: number, y: number, focus?: ContextMenuFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    /** 触摸端按下：开始长按计时，坐标记为长按起点。 */
    | { type: 'PRESS.START', x: number, y: number }
    /** 长按途中手指移动；超出容差即取消这次长按。 */
    | { type: 'PRESS.MOVE', x: number, y: number }
    /** 手指抬起或被系统打断：取消长按。 */
    | { type: 'PRESS.END' }
    /** 长按计时到点。 */
    | { type: 'after.longPressDelay' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
    /** 持有焦点的条目离开了 DOM：浏览器不派 focusout，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    | { type: 'ITEM.SELECT', value: string }
  tag: never
  guard: 'isOpenControlled' | 'movedBeyondTolerance'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'invokeOnSelect'
    | 'syncOpen'
    | 'setPoint'
    | 'setPointFromPress'
    | 'setPressPoint'
    | 'setFocusIntent'
    | 'setReturnFocus'
    | 'setFocusedValue'
    | 'setInitialFocusedValue'
    | 'clearFocusedValue'
    | 'clearTypeahead'
    | 'reanchor'
  effect: 'trackPosition' | 'trackLayer' | 'trackLongPress'
}

export interface ContextMenuApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly ContextMenuNodeMeta[]
  /** 长按计时进行中；触发区据此给按压反馈。 */
  pressing: boolean
  /** 当前锚点坐标；一次都没打开过时为 null。 */
  point: ContextMenuPoint | null
  /** 焦点锚点；收起时为 null。 */
  focusedValue: string | null
  /** 收起走 CLOSE；展开落在最近一次锚点坐标上（从未打开过则是原点）。 */
  setOpen: (next: boolean) => void
  /** 命令式展开到指定视口坐标。 */
  openAt: (x: number, y: number) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['element']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: ContextMenuItemProps) => T['element']
  getItemTextProps: (props: ContextMenuItemProps) => T['element']
  getItemIndicatorProps: (props: ContextMenuItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getGroupProps: (props: ContextMenuGroupProps) => T['element']
  getGroupLabelProps: (props: ContextMenuGroupProps) => T['element']
  getArrowProps: () => T['element']
}
