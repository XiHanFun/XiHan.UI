/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tree select 类型契约。

import type { CascadeStrategy, Cleanup, ControlVariant, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { TreeNode, TreeVisibleNode } from '../tree'

/**
 * TreeSelect 专用节点。`hasChildren` 在未提供 `children` 时声明这是一个尚未取回子项的分支；
 * 已提供 children 时它没有额外作用。取回后的子项由 headless 暂存，不需要宿主重写整棵 collection。
 */
export interface TreeSelectNode extends Omit<TreeNode, 'children'> {
  children?: TreeSelectNode[]
  hasChildren?: boolean
}

export type TreeSelectBranchLoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

/** 分支异步相位；成功空结果与失败是两个独立终态，不能互相降级。 */
export type TreeSelectBranchLoadSnapshot
  = | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'loaded', empty: boolean }
    | { status: 'error', error: unknown }

/** 一次分支取数。signal 会在重试、节点从 collection 移除或组件卸载时中止。 */
export interface TreeSelectLoadChildrenRequest {
  node: TreeSelectNode
  signal: AbortSignal
}

export interface TreeSelectBranchLoadStartDetails {
  value: string
  node: TreeSelectNode
  reason: 'expand' | 'retry'
}

export interface TreeSelectBranchLoadDetails {
  value: string
  node: TreeSelectNode
  children: TreeSelectNode[]
}

export interface TreeSelectBranchLoadErrorDetails {
  value: string
  node: TreeSelectNode
  error: unknown
}

/**
 * 展开时焦点落在哪一行：
 * - selected 停在首个可见的选中节点（它藏在收起的分支中时回退为首个可停留行；无选中则
 *   不落锚点，焦点停在 content 上：指针打开走这条，不能有节点看似被选中）
 * - first / last 从可见行两端进入（键盘确认键在无选中时走 first）
 * - next / prev 从当前选中节点起步移动一步（收起态在 trigger 上按上下键即走这条）
 */
export type TreeSelectFocusIntent = 'selected' | 'first' | 'last' | 'next' | 'prev'

// 适配器挂载前填入；保持缺省时副作用短路，机器状态照常转移但不定位、不挂消解层与焦点域。
export interface TreeSelectRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 视觉退场与行为资源共享的 Presence；未提供时关闭立即释放。 */
  presence: PresenceHandle | null
  /** 浮层定位引擎；未提供时不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取 trigger；清空按钮按下后也把焦点归还给它。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是节点集合的查询容器。 */
  getContentEl: () => HTMLElement | null
  /**
   * 连打检索缓冲，随服务存活，停顿足够久后自行重新开始。
   * 放在模块变量中会使同页两个选择器共用一个缓冲。
   */
  typeahead: Typeahead
  /** 仍在途的分支请求；只存放运行时资源，不进入可渲染 context。 */
  branchLoadControllers: Map<string, { controller: AbortController, token: number, node: TreeSelectNode }>
  /** 每次开新请求递增，用于拒绝过期回调。实例私有，不能放模块变量。 */
  branchLoadSequence: { n: number }
  /** load 状态与成功 children 所属的原始节点对象；同 value 换节点时据此作废旧结果。 */
  branchLoadOwners: Map<string, TreeSelectNode>
}

export interface TreeSelectOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface TreeSelectValueChangeDetails {
  /** 选中集合。单选下也是数组（长度 ≤ 1），形状不随模式变化。 */
  value: string[]
}

export interface TreeSelectExpandedValueChangeDetails {
  value: string[]
}

/**
 * 节点的声明：只声明值。层级、禁用、标签一律从 collection 查询，那是唯一事实源。
 */
export interface TreeSelectNodeProps {
  value: string
}

/** 读屏文案，默认英文。 */
export interface TreeSelectTranslations {
  /** 树容器的兜底名字，作者两个名字部件（label / value-text）都未渲染时才使用。 */
  tree: string
  /** 清空按钮的可及名，默认 'Clear'。 */
  clearTrigger: string
  /** 整棵树没有节点时的默认文案。 */
  empty: string
  /** 外部整树或懒分支正在加载时的默认文案。 */
  loading: string
  /** 懒分支加载失败时的默认文案。 */
  branchError: string
  /** 懒分支失败后的重试按钮文案。 */
  retry: string
  /** 懒分支成功返回空数组时的默认文案。 */
  branchEmpty: string
}

/** 接了按压通道的三个部件：叶子行与分支行按 node.value 记（同一个值在两个部件上分开认），清空按钮只记部件。 */
export type TreeSelectPressedPart = 'item' | 'branch-control' | 'clear-trigger'

export interface TreeSelectSchema extends MachineSchema {
  props: {
    /** 树数据，层级元信息与显示文本的唯一事实源。`hasChildren` 且未提供 children 是懒分支；已提供 children 时它优先。默认为空树。 */
    collection?: TreeSelectNode[]
    /**
     * 取回 `hasChildren: true` 分支的直接子项。首次展开自动调用，失败后用 api.retryBranch
     * 显式重试。旧请求的兑现或拒绝不会覆盖更新的一轮，也不会写回已移除的分支。
     */
    loadChildren?: (request: TreeSelectLoadChildrenRequest) => Promise<TreeSelectNode[] | undefined | void> | TreeSelectNode[] | undefined | void
    /**
     * 选中值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。
     * 单选写为裸串是简写，内部一律归一为数组。
     */
    value?: string | string[]
    defaultValue?: string | string[]
    /** 展开集合。提供即受控，语义同上。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 多选：选中为集合，选中后浮层不收起、焦点留在树中以便继续选择。 */
    multiple?: boolean
    /**
     * 多选下父子级联勾选：点击分支整枝传导、子全勾父勾、部分勾选半选，
     * 禁用子树整棵冻结。默认 false（朴素切换）；单选下无效。
     */
    cascade?: boolean
    /** 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾选节点。 */
    checkedStrategy?: CascadeStrategy
    /** 整个控件禁用：trigger 使用原生 disabled，表单出口不参与提交。 */
    disabled?: boolean
    /**
     * 只读：浮层照常展开、树照常浏览与展开收起，但选中值不可修改、也不可清空。
     * disabled 则连键盘入口都没有。
     */
    readOnly?: boolean
    /** 校验失败：trigger 报告 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 节点加载中：树报告 aria-busy，显示在途占位、隐藏空态占位。 */
    loading?: boolean
    /** 形态：outline / subtle / ghost，决定触发框的描边与底色使用方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定触发框与树节点行的几何档位。 */
    size?: Size
    /** 无选中时 value-text 显示的占位文字。 */
    placeholder?: string
    /** 读屏文案，默认英文。 */
    translations?: Partial<TreeSelectTranslations>
    placement?: Placement
    offset?: number
    /** 上下键到达首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的展开 / 收起语义。 */
    dir?: Direction
    /** 表单字段名。提供后表单出口才带 name，选中值随表单一并提交。 */
    name?: string
    /** 原生表单 ID；显式关联外部表单，提交与 reset 使用同一所有者。 */
    form?: string
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: TreeSelectValueChangeDetails) => void
    /** 展开集合变化意图回调；语义同上。 */
    onExpandedValueChange?: (details: TreeSelectExpandedValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: TreeSelectOpenChangeDetails) => void
    /** 一轮有效分支请求开始；retry 与首次展开由 reason 区分。 */
    onBranchLoadStart?: (details: TreeSelectBranchLoadStartDetails) => void
    /** 一轮有效分支请求成功；children 为空仍是成功，不转换为错误或全局空态。 */
    onBranchLoad?: (details: TreeSelectBranchLoadDetails) => void
    /** 一轮有效分支请求失败；保留 loader 给出的原始 error。 */
    onBranchLoadError?: (details: TreeSelectBranchLoadErrorDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 选中集合，恒为数组。受控（value 提供）时 cell 直读 prop。 */
    value: string[]
    /** 展开集合，恒为数组。受控（expandedValue 提供）时 cell 直读 prop。 */
    expandedValue: string[]
    /** roving tabindex 的锚点，同时是方向键与确认键的起点；收起即清空。 */
    focusedValue: string | null
    /** 本次展开的落点意图；受控回写经 CONTROLLED.OPEN 时也可读取。 */
    focusIntent: TreeSelectFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /** 异步分支的当前相位；成功后的子项单独存放，避免把 transport state 混进数据树。 */
    branchLoads: Record<string, TreeSelectBranchLoadSnapshot>
    /** 已成功取回的直接子项，按父节点 value 建表。 */
    loadedChildren: Record<string, TreeSelectNode[]>
    /** 三端只上报实际挂载的 item/branch 数量；手写节点是否为空由 Headless 据此判断。 */
    renderedNodeCount: number
    /** 按压通道：Space / Enter 或触屏按住的是叶子行、分支行还是清空按钮。 */
    pressedPart: TreeSelectPressedPart | null
    /** 按压通道：按住的节点 value；clear-trigger 没有值，记 null。抬起、失焦或浮层收起即清空。 */
    pressedValue: string | null
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
    /** 持有焦点的节点离开了 DOM：浏览器此时不派发 focusout，由适配器如实上报。 */
    | { type: 'NODE.LOST' }
    /** 选中节点：单选替换并收起，多选切换且不收起。 */
    | { type: 'NODE.SELECT', value: string }
    /** 整体改写选中集合（外部 setValue 经过它）。 */
    | { type: 'VALUE.SET', value: string[] }
    | { type: 'VALUE.CLEAR' }
    /** 整体改写展开集合（'*' 展开同级、外部 setExpandedValue 都经过它）。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    /** 失败后显式开始新一轮；会使仍在途的旧轮失效。 */
    | { type: 'BRANCH.RETRY', value: string }
    | { type: 'NODE.MOUNT', value: string }
    | { type: 'NODE.UNMOUNT', value: string }
    | { type: 'NODES.SYNC', values: string[] }
    | { type: 'FORM.RESET' }
    /**
     * 叶子行、分支行或清空按钮被 Space / Enter 或触屏按住。分支行的键盘按压由 branch 代发（焦点落在 branch
     * 上，branch-control 只是它里面的一层内容）；disabled 是节点自身的禁用事实，由 connect 判定后随事件带入。
     */
    | { type: 'PRESS.START', part: TreeSelectPressedPart, value?: string, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 part + value 对应的那一个。 */
    | { type: 'PRESS.END', part: TreeSelectPressedPart, value?: string }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple' | 'canPress'
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
    | 'loadExpandedBranch'
    | 'retryBranch'
    | 'syncBranchLoads'
    | 'loadExpandedBranches'
    | 'resumeBranchLoads'
    | 'syncRenderedNodes'
    | 'cancelBranchLoads'
    | 'resetToDefault'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackPosition' | 'trackLayer' | 'trackBranchLoads'
}

export interface TreeSelectApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 当前有效树：含 headless 已成功取回的懒分支子项。 */
  collection: readonly TreeSelectNode[]
  /**
   * 当前可见行序列（收起分支的子树不在其中）。
   * 方向键、Home/End 与连打检索都在它上面移动，不在原始树上移动。
   */
  visibleNodes: readonly TreeVisibleNode[]
  /** 选中集合；单选下长度 ≤ 1，形状不随模式变化。 */
  value: string[]
  expandedValue: string[]
  /** 选中项的显示文本（多选用逗号加空格连接）；无选中时为 null。取自 collection 的 label。 */
  valueText: string | null
  /** value-text 实际显示的文字：有选中时取其文本，否则取 placeholder。 */
  displayText: string
  /** 焦点锚点；收起、或它已被收起而不可见时为 null。 */
  focusedValue: string | null
  /** 整树当前是否没有任何节点；collection 与手写节点统一由 Headless 判定。 */
  empty: boolean
  /** 外部整树 loading 状态。懒分支 loading 由 branchLoadState 单独表达。 */
  loading: boolean
  translations: TreeSelectTranslations
  multiple: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  isSelected: (value: string) => boolean
  /** 级联模式下该分支是否半选（有效叶后代部分勾选）；非级联恒为 false。 */
  isIndeterminate: (value: string) => boolean
  isExpanded: (value: string) => boolean
  /** 非懒分支返回 null；懒分支即使尚未请求也返回 idle。 */
  branchLoadState: (value: string) => TreeSelectBranchLoadSnapshot | null
  setOpen: (next: boolean) => void
  setValue: (next: string[]) => void
  setExpandedValue: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  /** 失败后重新取该分支；非懒分支与未知 value 不产生副作用。 */
  retryBranch: (value: string) => void
  /** 单选替换、多选切换，与点击节点同一语义。 */
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
  getItemDescriptionProps: (props: TreeSelectNodeProps) => T['element']
  getItemIndicatorProps: (props: TreeSelectNodeProps) => T['element']
  getBranchProps: (props: TreeSelectNodeProps) => T['element']
  getBranchControlProps: (props: TreeSelectNodeProps) => T['element']
  getBranchTriggerProps: (props: TreeSelectNodeProps) => T['element']
  getBranchIndicatorProps: (props: TreeSelectNodeProps) => T['element']
  getBranchTextProps: (props: TreeSelectNodeProps) => T['element']
  getBranchContentProps: (props: TreeSelectNodeProps) => T['element']
  getBranchLoadingProps: (props: TreeSelectNodeProps) => T['element']
  getBranchErrorProps: (props: TreeSelectNodeProps) => T['element']
  getBranchRetryTriggerProps: (props: TreeSelectNodeProps) => T['button']
  getBranchEmptyProps: (props: TreeSelectNodeProps) => T['element']
  /**
   * 空态占位：放在 content 中、tree 的兄弟。
   * collection 与手写节点都由连接层按 Headless 空态收放；作者可更换内容，不必自行重新计算。
   */
  getEmptyProps: () => T['element']
  /**
   * 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。
   * collection 与手写节点都由连接层按 Headless 空态收放。
   */
  getLoadingProps: () => T['element']
  /** 浮层底部的操作区：放在 content 中、tree 的兄弟，不进入树的拥有关系，方向键也无法到达。 */
  getFooterProps: () => T['element']
  /** 单值表单出口；按 api.value 逐个调用并生成同名 input，零选中不生成提交项。 */
  getHiddenInputProps: (props: { value: string }) => T['input']
}
