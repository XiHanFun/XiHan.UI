/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 menubar 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, Orientation, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/** 展开菜单时的落焦端：'first'/'last' 从集合两端进入，'none' 焦点留在 trigger 上。 */
export type MenubarFocusIntent = 'first' | 'last' | 'none'

/** 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter，未提供时相关副作用短路。 */
export interface MenubarRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄，只在有菜单展开期间调用。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 每张菜单各自的视觉 Presence，按 content value 精确配对。 */
  presences: Map<string, PresenceHandle>
  /** 已明确卸载的菜单；区别于首帧尚未登记 Presence。 */
  detachedValues: Set<string>
  /** 当前行为层归属的菜单；最终关闭后保留到该菜单退出完成。 */
  layerValue: string | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 当前展开项的 trigger，定位锚点。 */
  getAnchorEl: () => HTMLElement | null
  /** 当前展开项被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 当前展开项的 content：焦点域容器、消解层节点，同时是条目集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /** 菜单栏根节点，trigger 集合的查询容器。 */
  getRootEl: () => HTMLElement | null
  /** 连打检索缓冲；菜单收起时清空。 */
  typeahead: Typeahead
  /** 换项时重挂定位；由 trackPosition 在挂载时填入，退出时置空。 */
  reanchor: (() => void) | null
}

export interface MenubarValueChangeDetails {
  /** 当前展开的项；全部收起时为 null。 */
  value: string | null
}

export interface MenubarSelectDetails {
  /** 条目所属的菜单（即 trigger 的 value）。 */
  menu: string
  /** 被选中的条目。 */
  value: string
}

/**
 * 菜单栏数据。顶层节点是一个入口，它的 items 是该菜单中的条目。
 * 提供 collection 时，显示文本与禁用以它为准。
 *
 * 入口的 value 与条目的 value 各自在整条菜单栏内唯一：两者都是禁用回查的键，
 * 条目按 value 跨菜单展平索引，重名的以先出现的为准。
 */
export interface MenubarNode {
  value: string
  /** 展示文本，也是菜单内连打检索的取字来源；默认回退为 value。 */
  label?: string
  /** 副文本，写入 item-description 部件；只在条目上读取。 */
  description?: string
  /**
   * 快捷键提示，写入 item-shortcut 部件；未提供时本条不铺该部件。
   * 纯装饰：读屏从条目文字取意，不念它；只为真正注册了的组合写提示。
   */
  shortcut?: string
  /** 禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
  /**
   * 该条命令自身动作的性质：删除写 danger、停用写 warning。只在条目上读取——
   * 顶层入口表达的是位置不是动作，写了也不产出语气面（真源 §7.4）。
   * 只换字色与悬停 / 按下的面，不改字重与缩进；禁用压过它，破坏性命令仍要配图标。
   */
  tone?: Tone
  /** 所属分组的身份；相邻同值的条目合并为一个 group。只在条目上读取。 */
  group?: string
  /** 本组的标题文本，写在组内任意一条上即可。只在条目上读取。 */
  groupLabel?: string
  /** 本条之前绘制一条分隔线；写在首条上不产出分隔线。只在条目上读取。 */
  separatorBefore?: boolean
  /** 该菜单中的条目；只在顶层节点上读取。 */
  items?: MenubarNode[]
}

/** 单个节点的元信息，由 collection 推导，不含展开态与焦点态。 */
export interface MenubarNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  /** 副文本原样透传，未提供时为 null。 */
  description: string | null
  /** 快捷键提示；未提供时为 null。 */
  shortcut: string | null
  disabled: boolean
  /** 该条自己写的语气；未提供时为 null。顶层入口恒为 null 的读法见 MenubarNode。 */
  tone: Tone | null
  /** 分组身份，未提供时为 null。 */
  group: string | null
  /** 分组标题，未提供时为 null。 */
  groupLabel: string | null
  /** 本条之前是否绘制分隔线。 */
  separatorBefore: boolean
  /** 该菜单中的条目元信息；条目自身恒为空数组。 */
  items: readonly MenubarNodeMeta[]
}

/**
 * 触发器属性：值必须声明，禁用可由 collection 代为声明。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface MenubarTriggerProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** positioner 与 content 依靠该值与同一项的 trigger 配对。 */
export interface MenubarContentProps {
  value: string
}

export interface MenubarItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 分组身份，group 与 group-label 依靠该值配对。 */
export interface MenubarGroupProps {
  value: string
}

export interface MenubarSchema extends MachineSchema {
  props: {
    /**
     * 菜单栏数据，显示文本与禁用的事实源。提供后入口与条目部件只需声明 value。
     * 未提供时回到文本与禁用逐个写在部件上的方式。
     */
    collection?: MenubarNode[]
    /** 当前展开项，提供即受控；null 表示全部收起。 */
    value?: string | null
    defaultValue?: string | null
    /** 菜单栏排布轴，默认 horizontal。 */
    orientation?: Orientation
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 整条菜单栏禁用，展开与选中都不发生。 */
    disabled?: boolean
    /** 菜单内的连打检索，默认开启。 */
    typeahead?: boolean
    placement?: Placement
    offset?: number
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<MenubarTranslations>
    /** value 变化回调。 */
    onValueChange?: (details: MenubarValueChangeDetails) => void
    /** 条目被选中；菜单随之收起。 */
    onSelect?: (details: MenubarSelectDetails) => void
  }
  context: {
    /** 当前展开项，受控时 cell 直读 prop。 */
    value: string | null
    /** 定位引擎回填的最新结果。 */
    position: PositionResult | null
    /**
     * 逐菜单记录最后一次定位结果。一排入口共用一台状态机一份 position，切换菜单时它立即归
     * 新菜单所有：正在收起的菜单若从共享份取坐标会当场归零，退场动画会在视口左上角播放。
     */
    placements: Record<string, PositionResult>
    /**
     * 正在一排入口间切换。原生菜单栏的惯例：首次展开有进场、末次收起有退场，
     * 相邻切换瞬时切换：快速掠过时若每张都播放进出场，一串交叉淡变即表现为闪烁；
     * 且退场关键帧从不透明度 1 起跳，打断未播完的进场还会亮一下。
     */
    switching: boolean
    /**
     * 切换交接：新菜单获得坐标之前，上一张（最后一张已落位的）保持原样显示，
     * 坐标到达后同帧替换。否则旧的立即消失、新的等待定位之间有一到几帧空档，
     * 快速掠过即形成频闪：空档在快机器上恰好在绘制前闭合，在慢机器上无法闭合。
     */
    handoffValue: string | null
    /** trigger 的 roving 锚点，焦点离开菜单栏即清空。 */
    focusedValue: string | null
    /** 展开菜单内持有焦点的条目；切换项与收起都清空。 */
    focusedItem: string | null
    /** 本次展开的落焦端。'none' 即焦点留在 trigger 上。 */
    focusIntent: MenubarFocusIntent
    /** 最近一次由掠过 / 聚焦自动展开的项，用于识别聚焦紧跟点击这一对手势。 */
    autoValue: string | null
    /** 收起时是否把焦点归还 trigger；Tab 与层外交互时为 false。 */
    returnFocus: boolean
    /** Presence 注册表变更版本，驱动行为资源控制器重新读取当前 owner。 */
    presenceVersion: number
    /** 按压通道：Space / Enter 或触屏按住的那颗是哪类部件；trigger 与 item 各按 value 记。 */
    pressedPart: 'trigger' | 'item' | null
    /** 按压通道：按住的 trigger 或 item 的 value；抬起、失焦或（条目）菜单收起即清空。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: MenubarRefs
  /** 状态只表示是否有菜单展开，展开项参考 context.value；由 value 的 watch 派发 SYNC.* 转移。 */
  state: 'idle' | 'open'
  event:
    /** 点击 / Enter / Space：展开本项，已展开则收起。 */
    | { type: 'TRIGGER.TOGGLE', value: string }
    /** 交叉轴方向键：展开本项并把焦点落到菜单首 / 末项。 */
    | { type: 'TRIGGER.OPEN', value: string, focus?: MenubarFocusIntent }
    /** 指针掠过 trigger：已有菜单展开时才切换。 */
    | { type: 'TRIGGER.POINTER', value: string }
    /** trigger 获得焦点：记录 roving 锚点，已有菜单展开时一并切换展开项。 */
    | { type: 'TRIGGER.FOCUS', value: string, disabled?: boolean }
    /** 收起当前菜单。src 决定是否归还焦点。 */
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    /** 焦点离开整条菜单栏（trigger 与浮层里的菜单都算在内）：清除 roving 锚点并收起，不夺回焦点。 */
    | { type: 'MENUBAR.BLUR' }
    /** 程序化改写展开项。 */
    | { type: 'VALUE.SET', value: string | null }
    /** 适配器按菜单 value 注册或精确注销其视觉 Presence。 */
    | { type: 'PRESENCE.SET', value: string, presence: PresenceHandle, connected: boolean }
    | { type: 'ITEM.FOCUS', value: string }
    /** 持有焦点的条目离开了 DOM：浏览器此时不派发 focusout，状态机无法感知，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    | { type: 'ITEM.SELECT', value: string }
    /** trigger 或条目被 Space / Enter 或触屏按住；disabled 是该部件自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', part: 'trigger' | 'item', value: string, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 part + value 对应的那一颗。 */
    | { type: 'PRESS.END', part: 'trigger' | 'item', value: string }
    // 状态同步影子事件，由 value 的 watch 派发
    | { type: 'SYNC.OPEN' }
    | { type: 'SYNC.CLOSE' }
  tag: never
  guard: 'hasValue' | 'isCurrent' | 'shouldAbsorbToggle' | 'shouldSwitch' | 'canPress'
  action:
    | 'syncOpenState'
    | 'syncLayerOwner'
    | 'setPresence'
    | 'openFromEvent'
    | 'toggleFromEvent'
    | 'switchValue'
    | 'setValueFromEvent'
    | 'clearValue'
    | 'clearAutoValue'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'setFocusedItem'
    | 'clearFocusedItem'
    | 'setInitialFocusedItem'
    | 'setReturnFocus'
    | 'restoreTriggerFocus'
    | 'invokeOnSelect'
    | 'clearTypeahead'
    | 'reanchor'
    | 'startPress'
    | 'endPress'
    | 'releaseItemPress'
    | 'releaseWhenDisabled'
  effect: 'trackPosition' | 'trackLayer'
}

export interface MenubarApi<T extends PropTypes = PropTypes> {
  /** 当前展开的项；全部收起时为 null。 */
  value: string | null
  /** 由 collection 推导的入口元信息（各自附带该菜单的条目），按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly MenubarNodeMeta[]
  /** 是否有菜单展开。 */
  open: boolean
  /** trigger 的 roving 锚点；焦点不在菜单栏内时为 null。 */
  focusedValue: string | null
  /** 展开菜单内持有焦点的条目；无锚点时为 null。 */
  focusedItem: string | null
  orientation: Orientation
  disabled: boolean
  isOpen: (value: string) => boolean
  setValue: (next: string | null) => void
  getRootProps: () => T['element']
  getTriggerProps: (props: MenubarTriggerProps) => T['button']
  getPositionerProps: (props: MenubarContentProps) => T['element']
  getContentProps: (props: MenubarContentProps) => T['element']
  getItemProps: (props: MenubarItemProps) => T['element']
  getItemTextProps: (props: MenubarItemProps) => T['element']
  getItemIndicatorProps: (props: MenubarItemProps) => T['element']
  getItemDescriptionProps: (props: MenubarItemProps) => T['element']
  getItemShortcutProps: (props: MenubarItemProps) => T['element']
  getItemSuffixProps: (props: MenubarItemProps) => T['element']
  getSeparatorProps: () => T['element']
  getGroupProps: (props: MenubarGroupProps) => T['element']
  getGroupLabelProps: (props: MenubarGroupProps) => T['element']
  getArrowProps: (props: MenubarContentProps) => T['element']
}

/** 读屏文案，默认英文。 */
export interface MenubarTranslations {
  /** 根节点的 aria-label，用于区分页面上的多条菜单栏。 */
  root: string
}
