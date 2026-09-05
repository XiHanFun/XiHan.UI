import type { Cleanup, Direction, Layer, MachineSchema, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig } from '@xihan-ui/core'

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter，缺省时弹出层相关副作用短路。
export interface SideNavRefs {
  config: RuntimeConfig | null
  /** 注册弹出层并返回撤销句柄；只在弹出期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 当前弹出分支的触发按钮（定位锚点）。 */
  getPopoutAnchorEl: () => HTMLElement | null
  /** 当前弹出分支的定位层（引擎写坐标的那一层，作者已把它搬到浮层落点）。 */
  getPopoutPositionerEl: () => HTMLElement | null
  /** 当前弹出分支的子层容器（消解层节点与焦点域容器）。 */
  getPopoutContentEl: () => HTMLElement | null
}

/** 读屏用的文案，默认英文。 */
export interface SideNavTranslations {
  /** 根节点的 aria-label，用于区分同页的多个 nav 地标。 */
  root: string
}

/**
 * 一条入口。children 是数组即为分支（内嵌展开的子级）；
 * 叶子是去处：给 href 渲染成链接，不给则是命令入口（选中走 onValueChange）。
 */
export interface SideNavNode {
  value: string
  /** 入口文本；缺省退回 value，也是连打检索的取字处。 */
  label?: string
  /** 入口禁用：方向键跳过它，但它仍可聚焦。不向下传导给子级。 */
  disabled?: boolean
  /** 直达去处；只对叶子有意义。 */
  href?: string
  children?: SideNavNode[]
}

export interface SideNavValueChangeDetails {
  /** 选中的那条叶子；尚未选中为 null。 */
  value: string | null
}

export interface SideNavExpandedValueChangeDetails {
  /** 变化之后的完整展开集合，不是增量。 */
  value: string[]
}

export interface SideNavSchema extends MachineSchema {
  props: {
    /** 入口树，层级与文本的唯一事实源。缺省为空。 */
    collection?: SideNavNode[]
    /** 选中的叶子（单选）。给定即受控：cell 直读 prop，写只发 onValueChange。 */
    value?: string | null
    defaultValue?: string | null
    /** 展开集合。给定即受控，语义同上。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 同层手风琴：展开一枝时收起同层其余分支，默认 false（可多开）。 */
    accordion?: boolean
    /**
     * 折叠成图标栏：内嵌展开整体收起、文字由皮肤藏掉，只剩图标一列。
     * 顶层分支换装浮层弹出：悬停/点按/右方向键在旁侧弹出子级面板。
     */
    collapsed?: boolean
    /** 折叠态下顶层分支是否弹出子级面板，默认 true；关掉即回到纯图标栏。 */
    collapsedPopout?: boolean
    /** 整个侧栏禁用。 */
    disabled?: boolean
    /** 上下键走到首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 */
    dir?: Direction
    translations?: Partial<SideNavTranslations>
    /** 选中意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: SideNavValueChangeDetails) => void
    /** 展开集合变化意图回调；语义同上。 */
    onExpandedValueChange?: (details: SideNavExpandedValueChangeDetails) => void
  }
  context: {
    /** 选中的叶子。受控（value 给定）时 cell 直读 prop。 */
    value: string | null
    /** 展开集合。受控（expandedValue 给定）时 cell 直读 prop。 */
    expandedValue: string[]
    /** roving tabindex 的锚点。 */
    focusedValue: string | null
    /** 折叠态下正弹出子级面板的顶层分支；没弹出为 null。 */
    popoutValue: string | null
    /** 逐分支的弹出面板定位结果，由定位效应回填到正弹出的那一枝名下；收起中的那枝靠它留在原地播退场。 */
    popoutPlacements: Record<string, PositionResult>
    /** 本次弹出的落焦端：'first' 进面板第一行，'none' 不落焦（指针路径）。 */
    popoutIntent: 'first' | 'none'
    /** 弹出关闭时是否把焦点归还触发按钮；悬停离开与层外交互不归还。 */
    popoutReturnFocus: boolean
  }
  computed: Record<string, never>
  refs: SideNavRefs
  /** idle 平铺展开；popout 是折叠态下弹出子级面板的浮层期。 */
  state: 'idle' | 'popout'
  event:
    | { type: 'VALUE.SET', value: string | null }
    /** 点叶子：落选中并通知。 */
    | { type: 'LINK.SELECT', value: string }
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    | { type: 'NODE.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
    /** 弹出某顶层分支的子级面板；已开着别的分支时先关再开。 */
    | { type: 'POPOUT.OPEN', value: string, focus?: 'first' | 'none' }
    | { type: 'POPOUT.CLOSE', src?: 'esc' | 'interact-outside' | 'hover' | 'select' | 'keyboard' }
  tag: never
  guard: 'canChange' | 'canPopout'
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
  effect: 'trackPopoutPosition' | 'trackPopoutLayer' | 'trackPopoutHover'
}

/** 分支与叶子共用的身份声明。 */
export interface SideNavNodeProps {
  value: string
}

export interface SideNavApi<T extends PropTypes = PropTypes> {
  /** 选中的叶子；尚未选中为 null。 */
  value: string | null
  expandedValue: string[]
  /** 折叠成图标栏；顶层分支改为浮层弹出子级面板。 */
  collapsed: boolean
  /** 折叠态下正弹出子级面板的顶层分支；没弹出为 null。 */
  popoutValue: string | null
  /** 弹出某顶层分支的子级面板（仅折叠态有效）。 */
  openPopout: (value: string) => void
  closePopout: () => void
  /** roving tabindex 的锚点；无可见锚点为 null。 */
  focusedValue: string | null
  isSelected: (value: string) => boolean
  isExpanded: (value: string) => boolean
  /** 选中项的祖先分支：展开高亮「当前所在的那一枝」。 */
  isActiveBranch: (value: string) => boolean
  select: (value: string) => void
  setValue: (next: string | null) => void
  setExpandedValue: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  getRootProps: () => T['element']
  getListProps: () => T['element']
  /** 叶子行的列表项容器：链接与分支一样是列表的一条，作者把 link 裹在它里面。 */
  getItemProps: () => T['element']
  getGroupProps: (props: SideNavNodeProps) => T['element']
  getGroupLabelProps: (props: SideNavNodeProps) => T['element']
  getBranchProps: (props: SideNavNodeProps) => T['element']
  getBranchTriggerProps: (props: SideNavNodeProps) => T['button']
  /** 行文字的载体：折叠成图标栏时由皮肤整个藏掉，不会裁出半个字。 */
  getBranchTextProps: () => T['element']
  getBranchIndicatorProps: (props: SideNavNodeProps) => T['element']
  /** 该分支在折叠态下是否以浮层面板出现；决定作者要不要渲染定位层。 */
  isPopoutPanel: (value: string) => boolean
  /**
   * 弹出面板的定位层。吃引擎坐标、承载层号，作者须把它搬到浮层落点，
   * 免得祖先的层叠上下文把面板困住。非弹出分支不渲染这一层。
   */
  getPopoutPositionerProps: (props: SideNavNodeProps) => T['element']
  getBranchContentProps: (props: SideNavNodeProps) => T['element']
  getLinkProps: (props: SideNavNodeProps) => T['element']
  /** 链接文字的载体：折叠时由皮肤整个藏掉。 */
  getLinkTextProps: () => T['element']
}
