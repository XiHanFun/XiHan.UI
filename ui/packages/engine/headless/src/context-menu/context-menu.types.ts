/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 context menu 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/**
 * 展开时焦点落在集合的哪一端：ArrowUp 这类反向入口从末尾进入，键盘入口从首个可用条目进入。
 * 'none' 是指针与命令式入口的落点，也是默认值：不预先选择锚点，展开时没有条目带高亮，
 * 焦点由焦点域兜底停在 content 上。
 */
export type ContextMenuFocusIntent = 'first' | 'last' | 'none'

/** 锚点坐标，视口坐标系（与 PointerEvent.clientX/clientY 一致）。 */
export interface ContextMenuPoint {
  x: number
  y: number
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用一律短路。
export interface ContextMenuRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 被定位的浮层容器，通常是 positioner。锚点是光标坐标，不是元素，因此没有 getAnchorEl。 */
  getFloatingEl: () => HTMLElement | null
  /** 触发区，收起时焦点归还给它；未提供时回退为焦点域创建前的持有者。 */
  getTriggerEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 连打检索缓冲，随服务存活；放在模块变量中会使同页两个菜单共用一个缓冲。 */
  typeahead: Typeahead
  /**
   * 把定位重新挂到当前坐标上的钩子，由定位效应装填、坐标变化时由 watch 调用；展开期外恒为 null。
   *
   * 经钩子而不是让效应随坐标重挂：重挂会连带把层、消解层与焦点域一起拆除重建。
   */
  reanchor: (() => void) | null
}

export interface ContextMenuOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface ContextMenuSelectDetails {
  value: string
}

/** 条目数据。提供 collection 时，显示文本、禁用、语气、标记位与分组以它为准。 */
export interface ContextMenuNode {
  value: string
  /** 展示文本，也是连打检索的取字来源；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
  /**
   * 该条命令自身动作的性质：删除写 danger、停用写 warning。不写即与其余条目同档。
   * 只换字色与悬停 / 按下的面，不改字重与缩进，也不表达选中或校验；禁用压过它。
   * 红字不是唯一通道，破坏性命令仍要配图标。整张菜单的 tone 不下发给条目。
   */
  tone?: Tone
  /** 标记位文字（勾选符号等装饰）；未提供时本条不铺 item-indicator。 */
  indicator?: string
  /** 副文本，写入 item-description 部件；未提供时本条不铺该部件。 */
  description?: string
  /**
   * 快捷键提示，写入 item-shortcut 部件；未提供时本条不铺该部件。
   * 纯装饰：读屏从条目文字取意，不念它；只为真正注册了的组合写提示。
   */
  shortcut?: string
  /** 归属分组的身份值；相邻同值的条目收进同一个 group 部件。未提供时本条直接落在 content 上。 */
  group?: string
  /** 分组标题文字，取本组首个提供它的条目；本组无人提供时不铺 group-label。 */
  groupLabel?: string
  /** 本条之前绘制一条分隔线；写在首条上不产出分隔线。本条领头一个分组时，分隔线绘制在分组外。 */
  separatorBefore?: boolean
}

/** 单个条目的元信息，由 collection 推导，不含高亮态。 */
export interface ContextMenuNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 该条命令自身的语气；未提供时为 null。 */
  tone: Tone | null
  /** 标记位文字；未提供时为 null。 */
  indicator: string | null
  /** 副文本；未提供时为 null。 */
  description: string | null
  /** 快捷键提示；未提供时为 null。 */
  shortcut: string | null
  /** 分组身份；未提供时为 null。 */
  group: string | null
  /** 分组标题；未提供时为 null。 */
  groupLabel: string | null
  separatorBefore: boolean
}

/**
 * 条目声明的身份：值必须声明，禁用可由 collection 代为声明。
 * connect 不得反查 DOM：Vue 侧在 render 期求值（此时 DOM 不存在），WC 侧在 updated 后求值。
 */
export interface ContextMenuItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 分组声明的身份：分组标题的 id 由它派生，group 与 group-label 依靠该值互相关联。 */
export interface ContextMenuGroupProps {
  value: string
}

/** 读屏文案，默认英文。 */
export interface ContextMenuTranslations {
  /** 菜单容器的名字。触发区是作者的任意内容，名字只能由这里提供。 */
  content: string
}

export interface ContextMenuSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本、禁用、标记位与分组的事实源。提供后条目部件只需声明 value。
     * 未提供时回到文本与禁用全部写在条目部件上的方式。
     */
    collection?: ContextMenuNode[]
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 相对光标位置的首选放置位，默认 bottom-start。 */
    placement?: Placement
    /** 浮层与光标的间距（px），默认 0：右键菜单需要贴近光标。 */
    offset?: number
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 连打检索，默认开启。关闭后可打印字符一律放行给页面。 */
    typeahead?: boolean
    /** 读屏文案，默认英文。 */
    translations?: Partial<ContextMenuTranslations>
    /** 触摸端长按多久视为触发（ms），默认 700。 */
    longPressDelay?: number
    /**
     * 整张菜单的语气：brand / neutral / success / warning / danger / info。
     * 只为浮层与作者放进来的内容备好该族颜色，不下发给条目——条目保持中性档，
     * 逐条的语气写在 collection 的 `tone` 上（见 ContextMenuNode）。
     */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 */
    size?: Size
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: ContextMenuOpenChangeDetails) => void
    /** 条目被选中；菜单随之关闭。 */
    onSelect?: (details: ContextMenuSelectDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 当前锚点坐标：菜单固定在该点上，展开期间再次右键只修改它。 */
    point: ContextMenuPoint | null
    /** 长按起点，用于判定手指是否已经滑开。 */
    pressPoint: ContextMenuPoint | null
    /** roving tabindex 的锚点，同时是方向键的起点；收起即清空。 */
    focusedValue: string | null
    /** 本次展开的落焦端；受控回写经 CONTROLLED.OPEN 时也可读取。'none' 即不落焦。 */
    focusIntent: ContextMenuFocusIntent
    /** 关闭时是否把焦点归还触发区；Tab 与层外交互关闭时为 false，让焦点自然离开。 */
    returnFocus: boolean
    /** 按压通道：Space / Enter 或触屏按住的条目 value；抬起、失焦或菜单收起即清空。触发区的长按另走 pressing 状态。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: ContextMenuRefs
  state: 'closed' | 'pressing' | 'open'
  event:
    /** 右键（或触摸端合成的同名事件）：坐标即锚点。 */
    | { type: 'CONTEXT.MENU', x: number, y: number, focus?: ContextMenuFocusIntent }
    /** 命令式展开。提供坐标即固定在该点；未提供时沿用最近一次锚点，从未有过时锚定在触发区起始角。 */
    | { type: 'OPEN', x?: number, y?: number, focus?: ContextMenuFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    /** 触摸端按下：开始长按计时，坐标记为长按起点。 */
    | { type: 'PRESS.START', x: number, y: number }
    /** 长按途中手指移动；超出容差即取消本次长按。 */
    | { type: 'PRESS.MOVE', x: number, y: number }
    /** 手指抬起或被系统打断：取消长按。 */
    | { type: 'PRESS.END' }
    /** 长按计时到期。 */
    | { type: 'after.longPressDelay' }
    /** 条目被 Space / Enter 或触屏按住；disabled 是条目自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'ITEM.PRESS.START', value: string, disabled?: boolean }
    /** 按住的条目抬起、失焦或指针取消；只松开 value 对应的那一条。 */
    | { type: 'ITEM.PRESS.END', value: string }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
    /** 持有焦点的条目离开了 DOM：浏览器不派发 focusout，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    | { type: 'ITEM.SELECT', value: string }
  tag: never
  guard: 'isOpenControlled' | 'movedBeyondTolerance' | 'canPressItem'
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
    | 'startItemPress'
    | 'endItemPress'
    | 'releaseItemPress'
  effect: 'trackPosition' | 'trackLayer' | 'trackLongPress'
}

export interface ContextMenuApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly ContextMenuNodeMeta[]
  /** 长按计时进行中；触发区据此提供按压反馈。 */
  pressing: boolean
  /** 当前锚点坐标；从未打开过时为 null。 */
  point: ContextMenuPoint | null
  /** 焦点锚点；收起时为 null。 */
  focusedValue: string | null
  /** 收起经 CLOSE；展开沿用最近一次锚点坐标，从未有过坐标时锚定在触发区的起始角。 */
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
  getItemDescriptionProps: (props: ContextMenuItemProps) => T['element']
  getItemShortcutProps: (props: ContextMenuItemProps) => T['element']
  getItemSuffixProps: (props: ContextMenuItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getGroupProps: (props: ContextMenuGroupProps) => T['element']
  getGroupLabelProps: (props: ContextMenuGroupProps) => T['element']
  getArrowProps: () => T['element']
}
