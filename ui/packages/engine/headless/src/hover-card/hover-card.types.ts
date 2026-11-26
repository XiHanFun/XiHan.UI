/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 hover card 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, VirtualAnchor } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { TitleDescriptionParts } from '../shared/title-description'

export interface HoverCardOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 指针移开、等过 closeDelay 报 hover；焦点离开 trigger 与卡片、点在卡片外报 interact-outside；
   * Escape 报 esc；代码调用（setOpen(false)）报 programmatic。
   */
  reason?: OverlayCloseReason
}

/** 适配器在挂载前填入的 DOM 环境、定位引擎与元素 getter，未提供时相关副作用短路。 */
export interface HoverCardRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄，只在浮层可见期间调用。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎，未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，即 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，即 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 消解层的根节点，即 content。 */
  getContentEl: () => HTMLElement | null
}

export interface HoverCardSchema extends MachineSchema {
  props: {
    open?: boolean
    defaultOpen?: boolean
    /** 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 */
    placement?: Placement
    /** 浮层与锚点的间距（px）。 */
    offset?: number
    /**
     * 交叉轴上再挪多少，缺省 0。正值往交叉轴的结束方向挪：落在上下两侧时往行内结束方向（RTL 下向左），
     * 落在左右两侧时往下；先于翻面与贴边挪位，箭头仍对着触发器中心。
     */
    crossOffset?: number
    /** 空间不足时翻到对侧，默认 true；false 时守着 placement 那一侧，交叉轴贴边挪位照旧。 */
    flip?: boolean
    /**
     * 碰撞边界：卡片只在这块区域与视口的交集里摆，翻面、贴边挪位与可用空间都以交集为界。
     * 收元素或带 getBoundingClientRect() 的对象；缺省只受视口与裁剪祖先约束。
     */
    boundary?: Element | VirtualAnchor | null
    /**
     * 第一次展开时才挂载 content 里的内容，默认 false。列表里每行一张悬浮卡片时，收起态背着的整份卡片内容是挂载开销的大头。
     * positioner 与 content 节点照旧常驻。
     */
    lazyMount?: boolean
    /** 收起动画播完后卸载 content 里的内容，默认 false；下次展开重新挂载。 */
    unmountOnExit?: boolean
    /** 悬停进入到展开的等待毫秒，默认 700。 */
    openDelay?: number
    /** 指针离开 trigger 或 content 到收起的等待毫秒，默认 300。 */
    closeDelay?: number
    /** 文字方向，仅在显式提供时写到根节点上。 */
    dir?: Direction
    /**
     * 作者实际渲染了哪些部件，由适配器统计；省略即按都在场处理（服务端直出与挂载前）。
     * title 不在场时卡片的可及名指回 trigger；description 不在场、或渲染了但读不出一句话（判断同 `hasNamingContent`）
     * 时不写 aria-describedby。
     */
    parts?: TitleDescriptionParts
    /** 只关闭卡片本身，不影响 trigger 元素自身的可用性。 */
    disabled?: boolean
    /** 尺寸：sm / md / lg，决定卡片的内边距档位。 */
    size?: Size
    /** open 变化意图回调。 */
    onOpenChange?: (details: HoverCardOpenChangeDetails) => void
  }
  context: {
    /**
     * 挂载时开着、还没收起过：这一段打开属于首帧，content 投影 data-instant 直接呈现、不播进场。
     * 第一次收起时清掉，之后的每一次打开照常进场。
     */
    openedAtMount: boolean
    /** 定位引擎回填的最新结果。 */
    position: PositionResult | null
    /** 焦点是否停在卡片内（trigger 或 content 及其后代）；为 true 时纯指针移出不收起。 */
    focusHeld: boolean
    /** 挂载之后展开过没有（含首帧即展开）。lazyMount 下 content 里的内容从第一次展开起才挂载。 */
    opened: boolean
  }
  computed: Record<string, never>
  refs: HoverCardRefs
  /**
   * visible 是复合状态，两个子态下浮层都可见，定位与消解层挂在父状态上。
   * opening 是展开前的等待态（浮层隐藏），visible.closing 是收起前的等待态（浮层可见）。
   */
  state: 'closed' | 'opening' | 'visible' | 'visible.open' | 'visible.closing'
  event:
    /** 指针进入 trigger 或 content。 */
    | { type: 'POINTER.ENTER' }
    /** 指针离开 trigger 或 content。 */
    | { type: 'POINTER.LEAVE' }
    /** 焦点落入 trigger 或 content。 */
    | { type: 'FOCUS' }
    /** 焦点离开整张卡片，落到卡片内另一个节点的不计。 */
    | { type: 'BLUR' }
    | { type: 'ESCAPE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE', src?: 'esc' | 'interact-outside' }
    // 定时器到点，名称与对应的 delay prop 同名
    | { type: 'after.openDelay' }
    | { type: 'after.closeDelay' }
    // 受控回写：宿主改 open 后由 watch 派发，无条件跳转且不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
  tag: never
  guard: 'isOpenControlled' | 'isDisabled' | 'isFocusHeld'
  action: 'invokeOnOpen' | 'invokeOnClose' | 'syncOpen' | 'markFocusHeld' | 'clearFocusHeld' | 'clearOpenedAtMount' | 'markOpened'
  effect: 'waitForOpenDelay' | 'waitForCloseDelay' | 'trackPosition' | 'trackLayer'
}

export interface HoverCardApi<T extends PropTypes = PropTypes> {
  open: boolean
  setOpen: (next: boolean) => void
  getRootProps: () => T['element']
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getTitleProps: () => T['element']
  getDescriptionProps: () => T['element']
  getArrowProps: () => T['element']
  /**
   * content 里的内容此刻该不该挂载。`present` 是适配器的退场闸门：展开中或收起动画还没播完为真。
   * 缺省恒为真；lazyMount 下没展开过为假；unmountOnExit 下闸门落下（退场播完）即为假。
   * positioner 与 content 节点不受它管，一向常驻。
   */
  isContentMounted: (present: boolean) => boolean
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface HoverCardTranslations {}
