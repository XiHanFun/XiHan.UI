/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 popover 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, VirtualAnchor } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { TitleDescriptionParts } from '../shared/title-description'

export interface PopoverTranslations {
  close: string
}

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface PopoverRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 展开期间 modal 改值时同步滚动锁与背景失活。 */
  syncModalResources: (() => void) | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** trigger 部件；没给 anchor 时它就是定位锚点与焦点归还处。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器与消解层节点。 */
  getContentEl: () => HTMLElement | null
  /**
   * 展开时的落焦点。返回 null 即交给焦点域的 Tab 序列探测（浮层的默认行为）。
   * 浮层中排列集合的组合件由它把落点收口到锚点条目或集合容器上：
   * 探测按文档序取 content 的可 tab 后代，作者放在集合前面的搜索框会夺走焦点。
   */
  getInitialFocusEl: () => HTMLElement | null
  /** 重挂定位的句柄，由定位效应填写；anchor 变了由 watch 调它。 */
  reanchor: (() => void) | null
}

/**
 * 正被按住的按钮。popover 自己只有 trigger 与 close-trigger；popconfirm 跑的是同一台机器，
 * 它的 confirm-trigger / cancel-trigger 也记在这里——两颗动作钮并排，只记一个布尔分不清按住的是哪颗。
 */
export type PopoverPressedPart = 'trigger' | 'close-trigger' | 'confirm-trigger' | 'cancel-trigger'

export interface PopoverOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消（esc / interact-outside）与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface PopoverSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    /**
     * 外部锚点：给了就锚在它上面、收起时焦点归还到它，不再取 trigger；用于由别处的按钮受控打开浮层，此时通常不渲染 trigger。
     * 展开期间它带 aria-haspopup、aria-expanded、aria-controls，收起或换锚点时还原；点它算层内交互，不会先被判为层外交互关掉。
     *
     * 也收虚拟锚点：带 getBoundingClientRect() 的对象（指针落点、文本选区的 Range），每次定位现读它此刻的矩形，
     * 页面滚动、视口改尺时跟着重算。虚拟锚点接不了焦点、也写不了读屏属性：收起时焦点归还给 trigger，
     * 没有 trigger 时回到打开前的焦点持有者；换一个锚点对象即按新矩形重挂定位。
     */
    anchor?: HTMLElement | VirtualAnchor | null
    placement?: Placement
    /** 空间不足时翻到对侧，默认 true；false 时守着 placement 那一侧，交叉轴贴边挪位照旧。 */
    flip?: boolean
    /**
     * 碰撞边界：浮层只在这块区域与视口的交集里摆，翻面、贴边挪位与可用空间都以交集为界。
     * 收元素或带 getBoundingClientRect() 的对象；缺省只受视口与裁剪祖先约束。
     */
    boundary?: Element | VirtualAnchor | null
    /** 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 */
    dir?: Direction
    offset?: number
    /** 模态浮层陷入焦点；默认 false（非模态，Tab 可离开）。 */
    modal?: boolean
    /**
     * 展开后先聚焦到 content 内匹配该选择器的元素；没给、或选择器不匹配时按 Tab 序列落到第一个可聚焦元素。
     * 模态与非模态都生效：浮层展开时焦点总会进入 content。
     */
    initialFocus?: string
    /**
     * 收起时把焦点归还给 trigger（给了元素锚点时归还给它），默认 true。
     * Tab 与层外交互收起时焦点已经去了别处，一向不抢回，与这个开关无关。
     */
    restoreFocus?: boolean
    /**
     * 第一次打开时才挂载 content 里的内容，默认 false。页面上 Popover 很多（表格每行一个）时，
     * 收起态每个实例背着的整份内容是挂载开销的大头。positioner 与 content 节点照旧常驻，trigger 的 aria-controls 始终指得到它。
     */
    lazyMount?: boolean
    /** 收起动画播完后卸载 content 里的内容，默认 false；下次打开重新挂载，内容里的组件状态与输入随之丢掉。 */
    unmountOnExit?: boolean
    closeOnEscape?: boolean
    closeOnInteractOutside?: boolean
    /**
     * 浮层不可打开：触发器转原生 disabled，点按与命令式 setOpen(true) 都不展开；展开途中转为禁用即收起。
     * 与 Tooltip、HoverCard 的 disabled 同名同义：关掉的是浮层这件事。受控写回 open 仍按宿主的意思来。
     */
    disabled?: boolean
    /**
     * 作者实际渲染了哪些部件，由适配器统计；省略即按都在场处理（服务端直出与挂载前）。
     * title 不在场时 content 不写 aria-labelledby，名字由作者在 content 上写 aria-label；
     * description 不在场、或渲染了但读不出一句话（判断同 `hasNamingContent`）时不写 aria-describedby。
     */
    parts?: TitleDescriptionParts
    translations?: Partial<PopoverTranslations>
    /** 尺寸：sm / md / lg，决定面板的内边距档位。 */
    size?: Size
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: PopoverOpenChangeDetails) => void
    /** 退场动画播完（或没有退场动画），且本层的层、消解层、焦点域与模态资源全部释放后通知；卸载和退场途中重开不通知。 */
    onExitComplete?: () => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 关闭时是否把焦点归还触发器；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /**
     * 正被按住的按钮：Space / Enter 或触屏手指按下到松开之间，该按钮投影 data-pressed；没有按住时为 null。
     * 指针按住由 :active 表出。浮层收起时一并清空——按住 Enter 关掉浮层后，里面的按钮不会再来 keyup。
     */
    pressed: PopoverPressedPart | null
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，content 投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
    /** 挂载之后打开过没有（含首帧即打开）。lazyMount 下 content 里的内容从第一次打开起才挂载。 */
    opened: boolean
  }
  computed: Record<string, never>
  refs: PopoverRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN' }
    | { type: 'TOGGLE' }
    | { type: 'CLOSE', src?: 'esc' | 'close-trigger' | 'interact-outside' | 'tab' | 'selection' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，part 说的是哪颗按钮
    | { type: 'PRESS.START', part: PopoverPressedPart }
    | { type: 'PRESS.END', part: PopoverPressedPart }
  tag: never
  guard: 'isOpenControlled' | 'isDisabled'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'setReturnFocus' | 'syncOpen' | 'syncModalResources' | 'startPress' | 'endPress' | 'releasePress' | 'closeWhenDisabled' | 'clearOpenedAtMount' | 'markOpened' | 'reanchor'
  effect: 'trackPosition' | 'trackLayer' | 'trackAnchorAria'
}

export interface PopoverApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getCloseTriggerProps: () => T['button']
  getArrowProps: () => T['element']
  /**
   * content 里的内容此刻该不该挂载。`present` 是适配器的退场闸门：打开中或收起动画还没播完为真。
   * 缺省恒为真；lazyMount 下没打开过为假；unmountOnExit 下闸门落下（退场播完）即为假。
   * positioner 与 content 节点不受它管，一向常驻。
   */
  isContentMounted: (present: boolean) => boolean
}
