import type { CascadeStrategy, Cleanup, ControlVariant, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { TreeNode, TreeVisibleNode } from '../tree'

/**
 * 展开那一刻焦点落在哪一行：
 * - selected 停在首个「可见的」选中节点（它藏在收起的分支里时退回首个可停留行；无选中则
 *   不落锚点，焦点歇在 content 上——指针打开走这条，不能有节点看着像被选中）
 * - first / last 从可见行两端进（键盘确认键在无选中时走 first）
 * - next / prev 从当前选中节点起步走一步（收起态在 trigger 上按上下键即走这条）
 */
export type TreeSelectFocusIntent = 'selected' | 'first' | 'last' | 'next' | 'prev'

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface TreeSelectRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取 trigger；清空按钮按完也把焦点还给它。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是节点集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /**
   * 连打检索缓冲，随服务存活，停顿够久自行重开一轮。
   * 放模块变量会让同页两个选择器共用一个缓冲。
   */
  typeahead: Typeahead
}

export interface TreeSelectOpenChangeDetails {
  open: boolean
  /**
   * 这一次是怎么关的；展开时不带。
   * 用它区分「用户主动取消」与「选完自动收起」，前者常要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface TreeSelectValueChangeDetails {
  /** 选中集合。单选下也是数组（长度 ≤ 1），形状不随模式变。 */
  value: string[]
}

export interface TreeSelectExpandedValueChangeDetails {
  value: string[]
}

/**
 * 节点自报家门：只报值。层级、禁用、标签一律回 collection 里查，那是唯一事实源。
 */
export interface TreeSelectNodeProps {
  value: string
}

/** 读屏用的文案，默认英文。 */
export interface TreeSelectTranslations {
  /** 树容器的兜底名字，作者两个名字部件（label / value-text）都没渲染时才出面。 */
  tree: string
  /** 清空按钮的可及名字，缺省 'Clear'。 */
  clearTrigger: string
}

export interface TreeSelectSchema extends MachineSchema {
  props: {
    /** 树数据，层级元信息与显示文本的唯一事实源。缺省为空树。 */
    collection?: TreeNode[]
    /**
     * 选中值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     * 单选写成裸串是简写，内部一律归一成数组。
     */
    value?: string | string[]
    defaultValue?: string | string[]
    /** 展开集合。给定即受控，语义同上。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 多选：选中是集合，选中后浮层不收起、焦点留在树里以便接着挑。 */
    multiple?: boolean
    /**
     * 多选下父子级联勾选：点分支整枝传导、子全勾父勾、部分勾中半选，
     * 禁用子树整棵冻结。默认 false（朴素切换）；单选下无效。
     */
    cascade?: boolean
    /** 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾中节点。 */
    checkedStrategy?: CascadeStrategy
    /** 整个控件禁用：trigger 用原生 disabled，表单出口不参与提交。 */
    disabled?: boolean
    /**
     * 只读：浮层照常展开、树照常浏览与展开收起，但选中值改不动、也清不掉。
     * disabled 则连键盘入口都没有。
     */
    readOnly?: boolean
    /** 校验失败：trigger 报 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 形态：outline / subtle / ghost，决定触发框的描边与底色怎么用。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定触发框与树节点行的几何档位。 */
    size?: Size
    /** 无选中时 value-text 显示的占位文字。 */
    placeholder?: string
    /** 读屏用的文案，默认英文。 */
    translations?: Partial<TreeSelectTranslations>
    placement?: Placement
    offset?: number
    /** 上下键走到首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 */
    dir?: Direction
    /** 表单字段名。给定后表单出口才带 name，选中值随表单一并提交。 */
    name?: string
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: TreeSelectValueChangeDetails) => void
    /** 展开集合变化意图回调；语义同上。 */
    onExpandedValueChange?: (details: TreeSelectExpandedValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TreeSelectOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 选中集合，恒为数组。受控（value 给定）时 cell 直读 prop。 */
    value: string[]
    /** 展开集合，恒为数组。受控（expandedValue 给定）时 cell 直读 prop。 */
    expandedValue: string[]
    /** roving tabindex 的锚点，同时是方向键与确认键的起点；收起即清空。 */
    focusedValue: string | null
    /** 本次展开的落点意图；受控回写走 CONTROLLED.OPEN 时也读得到。 */
    focusIntent: TreeSelectFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
  }
  computed: Record<string, never>
  refs: TreeSelectRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: TreeSelectFocusIntent }
    | { type: 'TOGGLE', focus?: TreeSelectFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    | { type: 'NODE.FOCUS', value: string }
    /** 持有焦点的节点离开了 DOM：浏览器此时不派 focusout，由适配器如实上报。 */
    | { type: 'NODE.LOST' }
    /** 选中节点：单选替换并收起，多选切换且不收起。 */
    | { type: 'NODE.SELECT', value: string }
    /** 整体改写选中集合（外部 setValue 走它）。 */
    | { type: 'VALUE.SET', value: string[] }
    | { type: 'VALUE.CLEAR' }
    /** 整体改写展开集合（'*' 展开同级、外部 setExpandedValue 都走它）。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setFocusIntent'
    | 'setReturnFocus'
    | 'setInitialFocusedValue'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'clearTypeahead'
    | 'selectNode'
    | 'setValue'
    | 'clearValue'
    | 'setExpanded'
    | 'expandBranch'
    | 'collapseBranch'
    | 'toggleBranch'
    | 'resetToDefault'
  effect: 'trackPosition' | 'trackLayer'
}

export interface TreeSelectApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 作者给的原始树数据。 */
  collection: readonly TreeNode[]
  /**
   * 当前可见行序列（收起分支的子树不在其中）。
   * 方向键、Home/End 与连打检索都在它上面走，不是在原始树上走。
   */
  visibleNodes: readonly TreeVisibleNode[]
  /** 选中集合；单选下长度 ≤ 1，形状不随模式变。 */
  value: string[]
  expandedValue: string[]
  /** 选中项的显示文本（多选用逗号加空格连接）；无选中时为 null。取自 collection 的 label。 */
  valueText: string | null
  /** value-text 实际显示的文字：有选中取其文本，否则取 placeholder。 */
  displayText: string
  /** 焦点锚点；收起、或它已被收起而不可见时为 null。 */
  focusedValue: string | null
  multiple: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 清空按钮此刻可不可按。 */
  canClear: boolean
  isSelected: (value: string) => boolean
  /** 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 */
  isIndeterminate: (value: string) => boolean
  isExpanded: (value: string) => boolean
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  setExpandedValue: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  /** 单选替换、多选切换，与点节点同一语义。 */
  select: (value: string) => void
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  getTriggerProps: () => T['button']
  getValueTextProps: () => T['element']
  getIndicatorProps: () => T['element']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  getTreeProps: () => T['element']
  getItemProps: (props: TreeSelectNodeProps) => T['element']
  getItemTextProps: (props: TreeSelectNodeProps) => T['element']
  getItemIndicatorProps: (props: TreeSelectNodeProps) => T['element']
  getBranchProps: (props: TreeSelectNodeProps) => T['element']
  getBranchControlProps: (props: TreeSelectNodeProps) => T['element']
  getBranchTriggerProps: (props: TreeSelectNodeProps) => T['element']
  getBranchIndicatorProps: (props: TreeSelectNodeProps) => T['element']
  getBranchTextProps: (props: TreeSelectNodeProps) => T['element']
  getBranchContentProps: (props: TreeSelectNodeProps) => T['element']
  /** 表单出口：一份 type=hidden 的原生 input，选中值按逗号拼成一串随表单提交。 */
  getHiddenInputProps: () => T['input']
}
