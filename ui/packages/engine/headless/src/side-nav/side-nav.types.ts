/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 side nav 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter，缺省时弹出层相关副作用短路。
export interface SideNavRefs {
  config: RuntimeConfig | null
  /** 注册弹出层并返回撤销句柄；只在弹出期间调用，层不常驻栈。 */
  registerLayer: ((value: string) => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 当前弹出分支的触发按钮（定位锚点）。 */
  getPopoutAnchorEl: (value: string) => HTMLElement | null
  /** 当前弹出分支的定位层（引擎写入坐标的层，作者已把它移到浮层落点）。 */
  getPopoutPositionerEl: (value: string) => HTMLElement | null
  /** 当前弹出分支的子层容器（消解层节点与焦点域容器）。 */
  getPopoutContentEl: (value: string) => HTMLElement | null
  /** 每个顶层分支各自的视觉 Presence，切换分支与并行退场按身份精确配对。 */
  presences: Map<string, PresenceHandle>
  /** 根级资源管理器交给 popout 状态效应的会话入口。 */
  openPopoutLayer: (value: string, intent: 'first' | 'none') => void
  /** 逻辑关闭只标记会话退场；真实释放由对应 Presence 完成。 */
  closePopoutLayer: (value: string) => void
  /** Presence 注册 / 注销变化通知资源管理器重新绑定或立即结清。 */
  syncPopoutPresence: (value: string, presence: PresenceHandle, connected: boolean) => void
  /** 悬停弹出还没到点的等待；撤销它的句柄，没有等待时为 null。 */
  popoutHoverCancel: (() => void) | null
}

/** 读屏文案，默认英文。 */
export interface SideNavTranslations {
  /** 根节点的 aria-label，用于区分同页的多个 nav 地标。 */
  root: string
}

/**
 * 一条入口。children 是数组即为分支（内嵌展开的子级）；
 * 叶子是目标：提供 href 渲染为链接，未提供则是命令入口（选中经 onValueChange）。
 */
export interface SideNavNode {
  value: string
  /** 入口文本；默认回退为 value，也是连打检索的取字来源。 */
  label?: string
  /** 入口禁用：方向键跳过它，但它仍可聚焦。不向下传导给子级。 */
  disabled?: boolean
  /**
   * 该入口自身的性质：危险区域写 danger、需要留意的写 warning。不写即与其余入口同档，
   * 也不向下传导给子级——每一层各自声明。只换字色与悬停 / 按下的面，不表达当前页；
   * 当前项的品牌淡底与禁用都压过它。彩字不是唯一通道，要紧的差别仍要配图标。
   */
  tone?: Tone
  /** 直达目标；只对叶子有意义。 */
  href?: string
  children?: SideNavNode[]
}

/** 接了按压通道的两个部件：链接行与分支行都按 node.value 记，同一个值在两个部件上分开认。 */
export type SideNavPressedPart = 'link' | 'branch-trigger'

export interface SideNavValueChangeDetails {
  /** 选中的叶子；尚未选中时为 null。 */
  value: string | null
}

export interface SideNavExpandedValueChangeDetails {
  /** 变化之后的完整展开集合，不是增量。 */
  value: string[]
}

export interface SideNavSchema extends MachineSchema {
  props: {
    /** 入口树，层级与文本的唯一事实源。默认为空。 */
    collection?: SideNavNode[]
    /** 选中的叶子（单选）。提供即受控：cell 直读 prop，写入只发 onValueChange。 */
    value?: string | null
    defaultValue?: string | null
    /** 展开集合。提供即受控，语义同上。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 同层手风琴：展开一枝时收起同层其余分支，默认 false（可多开）。 */
    accordion?: boolean
    /**
     * 折叠为图标栏：内嵌展开整体收起、文字由皮肤隐藏，只剩图标一列。
     * 顶层分支改为浮层弹出：悬停 / 点击 / 右方向键在旁侧弹出子级面板。
     */
    collapsed?: boolean
    /** 折叠态下顶层分支是否弹出子级面板，默认 true；关闭即回到纯图标栏。 */
    collapsedPopout?: boolean
    /** 整个侧栏禁用。 */
    disabled?: boolean
    /** 上下键到达首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的展开 / 收起语义。 */
    dir?: Direction
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<SideNavTranslations>
    /** 选中意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: SideNavValueChangeDetails) => void
    /** 展开集合变化意图回调；语义同上。 */
    onExpandedValueChange?: (details: SideNavExpandedValueChangeDetails) => void
  }
  context: {
    /** 选中的叶子。受控（value 提供）时 cell 直读 prop。 */
    value: string | null
    /** 展开集合。受控（expandedValue 提供）时 cell 直读 prop。 */
    expandedValue: string[]
    /** roving tabindex 的锚点。 */
    focusedValue: string | null
    /** 折叠态下正在弹出子级面板的顶层分支；未弹出时为 null。 */
    popoutValue: string | null
    /** 逐分支的弹出面板定位结果，由定位效应回填到正在弹出的分支名下；收起中的分支依靠它留在原地播放退场。 */
    popoutPlacements: Record<string, PositionResult>
    /** 本次弹出的落焦端：'first' 进入面板第一行，'none' 不落焦（指针路径）。 */
    popoutIntent: 'first' | 'none'
    /** 弹出关闭时是否把焦点归还触发按钮；悬停离开与层外交互不归还。 */
    popoutReturnFocus: boolean
    /** 按压通道：Space / Enter 或触屏按住的是链接行还是分支行。 */
    pressedPart: SideNavPressedPart | null
    /** 按压通道：按住的入口 value。抬起、失焦或指针取消即清空，弹出面板收起时一并清空。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: SideNavRefs
  /** idle 平铺展开；popout 是折叠态下弹出子级面板的浮层期。 */
  state: 'idle' | 'popout'
  event:
    | { type: 'VALUE.SET', value: string | null }
    /** 点击叶子：落选中并通知。 */
    | { type: 'LINK.SELECT', value: string }
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    | { type: 'NODE.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
    /** 弹出某顶层分支的子级面板；已打开其他分支时先关闭再打开。 */
    | { type: 'POPOUT.OPEN', value: string, focus?: 'first' | 'none' }
    | { type: 'POPOUT.CLOSE', src?: 'esc' | 'interact-outside' | 'hover' | 'select' | 'keyboard' }
    /** 指针停到一个可弹出的顶层分支上：等够悬停意图的开延时再弹出它。 */
    | { type: 'POPOUT.HOVER', value: string }
    /** 指针离开触发按钮：撤销还没到点的等待。 */
    | { type: 'POPOUT.HOVER_END' }
    /** 适配器按顶层分支 value 注册或精确注销视觉 Presence。 */
    | { type: 'PRESENCE.SET', value: string, presence: PresenceHandle, connected: boolean }
    /** 链接行或分支行被 Space / Enter 或触屏按住；disabled 是入口自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', part: SideNavPressedPart, value: string, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 part + value 对应的那一个。 */
    | { type: 'PRESS.END', part: SideNavPressedPart, value: string }
  tag: never
  guard: 'canChange' | 'canPopout' | 'canPress'
  action:
    | 'setValue'
    | 'selectLink'
    | 'setExpanded'
    | 'expandBranch'
    | 'collapseBranch'
    | 'toggleBranch'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'setPopout'
    | 'clearPopout'
    | 'setPopoutReturnFocus'
    | 'syncCollapsed'
    | 'setPresence'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
    | 'schedulePopoutHover'
    | 'cancelPopoutHover'
  effect: 'trackPopoutSessions' | 'releasePopoutHover' | 'trackPopoutPosition' | 'trackPopoutLayer' | 'trackPopoutHover'
}

/** 分支与叶子共用的身份声明。 */
export interface SideNavNodeProps {
  value: string
}

export interface SideNavApi<T extends PropTypes = PropTypes> {
  /** 选中的叶子；尚未选中时为 null。 */
  value: string | null
  expandedValue: string[]
  /** 折叠为图标栏；顶层分支改为浮层弹出子级面板。 */
  collapsed: boolean
  /** 折叠态下正在弹出子级面板的顶层分支；未弹出时为 null。 */
  popoutValue: string | null
  /** 弹出某顶层分支的子级面板（仅折叠态有效）。 */
  openPopout: (value: string) => void
  closePopout: () => void
  /** roving tabindex 的锚点；无可见锚点时为 null。 */
  focusedValue: string | null
  isSelected: (value: string) => boolean
  isExpanded: (value: string) => boolean
  /** 选中项的祖先分支：展开高亮当前所在的分支。 */
  isActiveBranch: (value: string) => boolean
  select: (value: string) => void
  setValue: (next: string | null) => void
  setExpandedValue: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  /** 叶子行的列表项容器：链接与分支一样是列表的一条，作者把 link 包在其中。 */
  getItemProps: () => T['element']
  getGroupProps: (props: SideNavNodeProps) => T['element']
  getGroupLabelProps: (props: SideNavNodeProps) => T['element']
  getBranchProps: (props: SideNavNodeProps) => T['element']
  getBranchTriggerProps: (props: SideNavNodeProps) => T['button']
  /** 行文字的载体：折叠为图标栏时由皮肤整体隐藏，不会裁出半个字。 */
  getBranchTextProps: () => T['element']
  getBranchIndicatorProps: (props: SideNavNodeProps) => T['element']
  /** 该分支在折叠态下是否以浮层面板出现；决定作者是否需要渲染定位层。 */
  isPopoutPanel: (value: string) => boolean
  /**
   * 弹出面板的定位层。使用引擎坐标、承载层号，作者须把它移到浮层落点，
   * 避免祖先的层叠上下文困住面板。非弹出分支不渲染这一层。
   */
  getPopoutPositionerProps: (props: SideNavNodeProps) => T['element']
  getBranchContentProps: (props: SideNavNodeProps) => T['element']
  getLinkProps: (props: SideNavNodeProps) => T['element']
  /** 链接文字的载体：折叠时由皮肤整体隐藏。 */
  getLinkTextProps: () => T['element']
}
