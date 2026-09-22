/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 menu 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/** 展开时的落焦端：'first'/'last' 从集合两端进入，'none' 不预先选择锚点。 */
export type MenuFocusIntent = 'first' | 'last' | 'none'

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter，缺省时相关副作用短路。
export interface MenuRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈（常驻会永久占据栈顶，阻断下方每层的 Escape）。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 本菜单视觉退场与行为资源共享的 Presence。每个子菜单实例各有自己的句柄。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，通常是 trigger。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 逻辑后代菜单经 Portal 搬离本层 content 后的悬停区域；仅供悬停树判定。 */
  getHoverBranches: () => readonly HTMLElement[]
  /** 连打检索的缓冲区，收起时清空。 */
  typeahead: Typeahead
}

export interface MenuOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface MenuSelectDetails {
  value: string
}

/** 条目数据。提供 collection 时，显示文本、禁用与语气以它为准。 */
export interface MenuNode {
  value: string
  /** 展示文本；默认回退为 value。 */
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

/** 单个条目的元信息，由 collection 推导，不含焦点态。 */
export interface MenuNodeMeta {
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
 * 条目属性：值必须声明，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface MenuItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 分组声明的身份：分组标题的 id 由它派生，group 与 group-label 依靠该值互相关联。 */
export interface MenuGroupProps {
  value: string
}

export interface MenuSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本、禁用、逐条语气与分组的事实源。提供后条目部件只需声明 value。
     * 未提供时回到这些事实都写在条目部件上的方式（语气写成条目的 `data-tone`）。
     */
    collection?: MenuNode[]
    /** 展开态，提供即受控；受控下内部不自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    placement?: Placement
    offset?: number
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /**
     * 整张菜单的语气：brand / neutral / success / warning / danger / info。
     * 只为浮层与作者放进来的内容备好该族颜色，不下发给条目——条目保持中性档，
     * 逐条的语气写在 collection 的 `tone` 上（见 MenuNode）。
     */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 */
    size?: Size
    /** 首字符连打检索，默认开启。 */
    typeahead?: boolean
    /** 整张菜单禁用：触发器不再展开，条目全部为 aria-disabled。 */
    disabled?: boolean
    translations?: Partial<MenuTranslations>
    /**
     * 本菜单是另一张菜单的子菜单：触发器渲染为父菜单的条目形态
     * （经 getSubmenuTriggerProps），默认落位改为侧向，悬停触发默认开启。
     */
    submenu?: boolean
    /** 悬停触发：进入触发器延时展开、经安全三角离开才收起。子菜单默认开启，普通菜单默认关闭。 */
    openOnHover?: boolean
    /** 悬停到展开的延时（ms），默认 100。 */
    hoverOpenDelay?: number
    /** 离开到收起的延时（ms），也是安全三角中的停滞上限，默认 300。 */
    hoverCloseDelay?: number
    /** open 变化回调。 */
    onOpenChange?: (details: MenuOpenChangeDetails) => void
    /** 条目被选中；菜单随之关闭。 */
    onSelect?: (details: MenuSelectDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果。 */
    position: PositionResult | null
    /** roving tabindex 的锚点，同时是方向键的起点；收起即清空。 */
    focusedValue: string | null
    /** 本次展开的落焦端，'none' 即不落焦。 */
    focusIntent: MenuFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 关闭时为 false。 */
    returnFocus: boolean
    /** 按压通道：Space / Enter 或触屏按住的条目 value；抬起、失焦或菜单收起即清空。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: MenuRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: MenuFocusIntent }
    | { type: 'TOGGLE', focus?: MenuFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' | 'hover' }
    /** 条目被 Space / Enter 或触屏按住；disabled 是条目自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', value: string, disabled?: boolean }
    /** 按住的条目抬起、失焦或指针取消；只松开 value 对应的那一条。 */
    | { type: 'PRESS.END', value: string }
    // 受控回写：宿主改 open prop 后由 watch 派发
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
    /** 持有焦点的条目离开了 DOM：浏览器此时不派发 focusout，状态机无法感知，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    | { type: 'ITEM.SELECT', value: string }
  tag: never
  guard: 'isOpenControlled' | 'canPress'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'invokeOnSelect'
    | 'syncOpen'
    | 'setFocusIntent'
    | 'setReturnFocus'
    | 'setFocusedValue'
    | 'setInitialFocusedValue'
    | 'clearFocusedValue'
    | 'clearTypeahead'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenDisabled'
  effect: 'trackPosition' | 'trackLayer' | 'trackHover'
}

export interface MenuApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 整张菜单是否禁用。 */
  disabled: boolean
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly MenuNodeMeta[]
  /** 焦点锚点；收起时为 null。 */
  focusedValue: string | null
  setOpen: (next: boolean) => void
  getTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getItemProps: (props: MenuItemProps) => T['element']
  getItemTextProps: (props: MenuItemProps) => T['element']
  getItemIndicatorProps: (props: MenuItemProps) => T['element']
  getItemDescriptionProps: (props: MenuItemProps) => T['element']
  getItemShortcutProps: (props: MenuItemProps) => T['element']
  getItemSuffixProps: (props: MenuItemProps) => T['element']
  /**
   * 子菜单触发条目（submenu 模式）：既是父菜单中的一条 item（value 是它在父菜单
   * 中的身份，父层的方向键与高亮照常识别它），又是本子菜单的触发器（aria-haspopup、
   * 悬停 / 点击 / 右方向键展开）。父层的选中会跳过带 aria-haspopup 的条目。
   */
  getSubmenuTriggerProps: (props: MenuItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getGroupProps: (props: MenuGroupProps) => T['element']
  getGroupLabelProps: (props: MenuGroupProps) => T['element']
  getArrowProps: () => T['element']
}

/** 读屏文案，默认英文。 */
export interface MenuTranslations {
  /** 菜单容器的名字。默认不写，读屏改由 aria-labelledby 指向触发器取名。 */
  content: string
}
