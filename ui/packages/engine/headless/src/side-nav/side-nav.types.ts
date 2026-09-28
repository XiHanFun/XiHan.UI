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
  /** 折叠开关每翻一次起一轮等宽度过渡；只有最新那一轮的落定作数。 */
  collapseRound: number
}

/** 读屏文案，默认英文。 */
export interface SideNavTranslations {
  /** 根节点的 aria-label，用于区分同页的多个 nav 地标。 */
  root: string
  /** 搜索框的可及名：框里没有可见标签，只能自带一句。 */
  input: string
  /** 搜索一条都没命中时，空态的默认文案。 */
  noMatch: string
}

/** 自定义匹配：一条入口与 trim 过、非空的检索词，返回是否命中。 */
export type SideNavFilter = (node: SideNavNode, query: string) => boolean

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
    /**
     * 搜索框的匹配规则：检索词按它判定一条入口是否命中；缺省为标签（缺省退回 value）大小写不敏感包含。
     * 命中的入口整枝留下，没命中但有子孙命中的分支只留命中的那几枝并展开，其余收起。
     */
    filter?: SideNavFilter
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
    /**
     * 落定的排布：图标栏（true）还是平铺（false）。折叠开关一翻，整栏宽度先按过渡收窄或长开，
     * 宽度的过渡播完才换成新的排布——行文字在这之前只淡出、还在行里，内嵌子层与可见行也按旧排布算；
     * 与 collapsed 不一致的那一段即折叠进行中，根投影 data-animating。
     */
    railed: boolean
    /** 搜索框里的原始串；trim 后非空、且排布没有落成图标栏，即进入搜索视图。 */
    inputValue: string
    /**
     * 搜索视图里的展开集合：每换一次检索词重置为「因子孙命中而留下的分支」，之后的展开收起只改它，
     * 不动作者的 expandedValue，清空检索词即回到原来的展开态。
     */
    searchExpanded: string[]
    /** 名称提示对着的那一行：图标栏里指针停住或焦点落下、只剩图标的那一条。 */
    tooltipValue: string | null
    /**
     * 名称提示开着：内嵌的提示机按受控跑，开合意图经 TOOLTIP.OPEN_CHANGE 回到这里；
     * 只有落成图标栏时才认「开」，折叠开关一翻即清。
     */
    tooltipOpen: boolean
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
    /** 整栏宽度的过渡播完了：换成与折叠开关一致的排布。round 认的是发起等待的那一轮。 */
    | { type: 'COLLAPSE.SETTLED', round: number }
    /** 搜索框里的检索词变了；换词即按新词重置搜索视图的展开集合。 */
    | { type: 'INPUT.CHANGE', value: string }
    /** 名称提示改对着这一行：指针停到或焦点落到图标栏里只剩图标的那一条。 */
    | { type: 'TOOLTIP.TARGET', value: string }
    /** 内嵌提示机报来的开合意图。 */
    | { type: 'TOOLTIP.OPEN_CHANGE', open: boolean }
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
    | 'settleCollapse'
    | 'setPresence'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
    | 'schedulePopoutHover'
    | 'cancelPopoutHover'
    | 'setInputValue'
    | 'setTooltipTarget'
    | 'setTooltipOpen'
  effect: 'trackPopoutSessions' | 'releasePopoutHover' | 'trackPopoutPosition' | 'trackPopoutLayer' | 'trackPopoutHover'
}

/** 分支与叶子共用的身份声明。 */
export interface SideNavNodeProps {
  value: string
}

/** 叶子行的列表项：value 是它包着的那条链接，搜索时没命中就整行收起。适配器从链接上取，作者不用再写一遍。 */
export interface SideNavItemProps {
  value?: string
}

/**
 * 分组：value 是分组身份，group-label 与 group-list 靠它配对；members 是分组里各条链接与分支的 value，
 * 搜索时一个成员都没命中就整组收起。适配器按分组里挂着的部件收集，作者不用逐条列。
 */
export interface SideNavGroupProps extends SideNavNodeProps {
  members?: readonly string[]
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
  /** 搜索框里的检索词。 */
  inputValue: string
  /** 改写检索词，与在搜索框里输入同一语义；传空串即回到整棵树与原来的展开态。 */
  setInputValue: (next: string) => void
  /** 正处于搜索视图：检索词非空且排布没有落成图标栏，可见行只剩命中的那几枝。 */
  searching: boolean
  /** 搜索视图里一条都没命中。 */
  empty: boolean
  /** 合并缺省值之后的读屏文案。 */
  translations: SideNavTranslations
  getRootProps: () => T['element']
  getListProps: () => T['element']
  /**
   * 搜索框：放在 root 里、list 之前。输入即按 filter 过滤导航树；下方向键或 Enter 把焦点交给导航行，
   * Escape 先清空检索词。落成图标栏时过滤暂停（皮肤让框留着高度、不可见也不可聚焦），展开回来接着按原来的检索词过滤。
   */
  getInputProps: () => T['input']
  /** 搜索一条都没命中时露面的占位，放在 list 之后；其余时候带 hidden。 */
  getEmptyProps: () => T['element']
  /** 叶子行的列表项容器：链接与分支一样是列表的一条，作者把 link 包在其中。 */
  getItemProps: (props?: SideNavItemProps) => T['element']
  /** 分组：上一层列表里的一条（li），装着 group-label 与 group-list；搜索时一个成员都没命中就整组收起。 */
  getGroupProps: (props: SideNavGroupProps) => T['element']
  getGroupLabelProps: (props: SideNavNodeProps) => T['element']
  /** 分组里的列表（ul）：组内的 item 与 branch 挂在这里，以 group-label 命名。 */
  getGroupListProps: (props: SideNavNodeProps) => T['element']
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
  /** 名称提示的文字：对着的那一行在 collection 里的标签（缺省退回 value）；还没对着任何一行时为空串。 */
  tooltipText: string
  /**
   * 名称提示的定位层：即库内 tooltip 的 positioner（data-scope="tooltip"），坐标、落点与层号由内嵌的提示机给，
   * 作者把它搬到浮层落点。只在 connect 拿到内嵌提示机时可用，否则直接报错。
   */
  getTooltipPositionerProps: () => T['element']
  /**
   * 名称提示本体：即库内 tooltip 的 content，反白面、进退场与接替窗口都随 Tooltip；
   * 对读屏隐藏（行文字已是可及名，不再念第二遍）。只在 connect 拿到内嵌提示机时可用，否则直接报错。
   */
  getTooltipContentProps: () => T['element']
}
