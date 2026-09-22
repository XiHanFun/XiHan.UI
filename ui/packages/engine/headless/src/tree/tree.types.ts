/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tree 类型契约。

import type { CascadeStrategy, ControlVariant, Direction, MachineSchema, Orientation, PropTypes, Tone, Typeahead } from '@xihan-ui/core'
import type { MultiPointerSession } from '@xihan-ui/pointer'
import type { DragRect, DragTranslations, DropTarget } from '../shared/drag'

/**
 * 焦点模型：roving tabindex，不做 aria-activedescendant 变体。
 * 焦点实际落在 role=treeitem 的节点上，整棵树只保留一个 Tab 停靠点：
 * 锚点 = focusedValue ?? 首个可见的选中值，承担 tabindex=0，其余一律 -1；
 * 焦点不在树内时由 tree 容器兜底进入 Tab 序列，它的 onFocus 再把焦点转交给锚点节点。
 * 可见这层过滤不能省略：收起分支中的节点仍在 DOM 中但 hidden 不可聚焦，
 * 让它承担 tabindex=0 会使整棵树没有停靠点；focusedValue 指向已隐藏节点时同样投影为 null。
 */
export type TreeFocusModel = 'roving-tabindex'

/**
 * 作者提供的树数据，是层级元信息（层级号、同层序号、同层总数、父子关系）的唯一事实源：
 * 连接层据此产出 aria-level / aria-posinset / aria-setsize，作者的标记只负责外观。
 * value 必须全树唯一：它同时是 DOM 身份（data-value）、选中 / 展开集合的元素与查找节点的键。
 */
export interface TreeNode {
  value: string
  /** 展示名，也是连打检索与分支可及名的取字来源；默认回退为 value。 */
  label?: string
  /** 节点禁用：方向键与连打检索跳过它，但它仍可聚焦、仍是导航起点。不向下传导给子节点。 */
  disabled?: boolean
  /**
   * 该节点自身的性质：已失效的写 danger、需要留意的写 warning。不写即与其余节点同档，
   * 也不向下传导给子节点——每一层各自声明。只换字色与悬停 / 按下的面，不改字重与缩进，
   * 也不表达选中或校验；选中的标记与禁用都压过它。彩字不是唯一通道，要紧的差别仍要配图标。
   */
  tone?: Tone
  /**
   * 副文本，写入 item-description 部件；未提供时本条不铺该部件。
   * 它是第 2 行的说明，跟着条目走 muted 档，不跟语气；放不下一行的解释才用它，
   * 一句话能说清的写进 label。
   */
  description?: string
  /**
   * 子节点。提供数组即判定为分支，空数组也计入：暂时没有子项的目录仍要报告 aria-expanded。
   */
  children?: TreeNode[]
  /**
   * 该层子节点的排布方式，由作者在数据上标注。提供后以它为准，`vertical` 也优先于树级的
   * `leafOrientation`；未提供时才回退为 `leafOrientation` 加子节点全是叶子的结构判据。
   *
   * 标注在哪一层，横向排布就只落在哪一层：菜单授权中标注在按钮的父菜单上，其他目录不受影响，
   * 也不随子节点增减漂移。只影响排布，不改变键盘。
   */
  childrenOrientation?: Orientation
}

/** 单个节点的层级元信息，由 collection 展平 / 索引得出，不含展开态。 */
export interface TreeNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串，连打检索直接用它比较。 */
  label: string
  disabled: boolean
  /** 该节点自己写的语气；未提供时为 null，不从父节点继承。 */
  tone: Tone | null
  /** 副文本；未提供时为 null。 */
  description: string | null
  /** children 是数组即为分支。 */
  branch: boolean
  /** 1 起算，直接写入 aria-level。 */
  level: number
  /** 同层内序号，1 起算，直接写入 aria-posinset。 */
  posInSet: number
  /** 同层总数，直接写入 aria-setsize。 */
  setSize: number
  /** 父节点值；根层为 null。左方向键依靠它跳回上一层。 */
  parent: string | null
  /** 在原始 collection 中的下标路径，供作者定位原始节点。 */
  indexPath: readonly number[]
}

/** 可见行：展平结果的元素，比元信息多一个展开态。 */
export interface TreeVisibleNode extends TreeNodeMeta {
  /** 叶子恒为 false；分支为它在展开集合中。 */
  expanded: boolean
}

/** 移动：把某个节点放到某个父节点下的某个位次。父为 null 即根层。 */
export interface TreeMove {
  /** 被移动的节点。 */
  value: string
  /** 移到的父节点；null 是根层。 */
  parent: string | null
  /** 在该层的位次，0 起算。已经过先移除后插入的修正。 */
  index: number
}

export interface TreeExpandedValueChangeDetails {
  value: string[]
}

export interface TreeSelectionChangeDetails {
  value: string[]
}

/**
 * 节点的声明：只声明值。层级、禁用、标签一律从 collection 查询，那是唯一事实源。
 */
export interface TreeNodeProps {
  value: string
}

export interface TreeRefs {
  /** 跟手的会话，整个生命周期存在。调用方在按下时把该指针传入。 */
  gesture: MultiPointerSession | null
  /**
   * 正在拖动移动的节点。activated 之前只是按住，还不是拖动：
   * 整个节点都是拖动源没有把手表明意图，需要移动够激活距离才视为拖动。
   */
  nodeDrag: {
    value: string
    rects: DragRect[]
    originY: number
    activated: boolean
    /** 拖动源节点。拖动中用它测量版面整体移动的距离，见 snapshotDrift。 */
    source: HTMLElement | null
  } | null
  /**
   * 连打检索缓冲，随服务存活，停顿足够久后自行重新开始。
   * 放在模块变量中会使同页两棵树共用一个缓冲。
   */
  typeahead: Typeahead
}

/** 接了按压通道的两个部件：叶子行与分支行都按 node.value 记，同一个值在两个部件上分开认。 */
export type TreePressedPart = 'item' | 'branch-control'

export interface TreeSchema extends MachineSchema {
  props: {
    /** 树数据，层级元信息的唯一事实源。默认为空树。 */
    collection?: TreeNode[]
    /** 外框形态：outline 带描边与底色（默认），subtle 淡底无描边，ghost 去掉描边与底色只保留行。 */
    variant?: ControlVariant
    /**
     * 末端层的排布方式，默认 vertical（每行一个）。horizontal 使它们并排铺开。
     *
     * 只作用于子节点全是叶子的层：菜单授权中即按钮层：
     * 一个菜单下十几个按钮，横向排成一行，省去纵向翻找。中间层与整棵树恒为纵向，
     * 它们承载的是层级本身，横向排布会失去层级信息。
     *
     * 这是结构判据，逐层自动识别。需要精确指定哪一层横向排布时，在节点上标注
     * `childrenOrientation`，它优先于本项。
     *
     * 只影响排布，不改变键盘：方向键在树上是层级操作（左右收展、上下移动可见行），
     * 这是 treeview 的规范语义，不随排布方向改写。
     */
    leafOrientation?: Orientation
    /** 展开集合。提供即受控：cell 直读 prop，写入只发 onExpandedValueChange 不落内部值。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 选中集合。提供即受控，语义同上。 */
    selection?: string[]
    defaultSelection?: string[]
    /** 复选：点击与确认键都是切换，tree 带 aria-multiselectable=true。默认 false（单选）。 */
    multiple?: boolean
    /**
     * multiple 下父子级联勾选：点击分支整枝传导、子全勾父勾、部分勾选半选，
     * 禁用子树整棵冻结。默认 false（朴素切换）；single 下无效。
     */
    cascade?: boolean
    /** 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾选节点。 */
    checkedStrategy?: CascadeStrategy
    /** 点击分支行是否同时展开 / 收起，默认 true。关闭后只有 branch-trigger 与左右方向键能改变展开态。 */
    expandOnClick?: boolean
    /** 整棵树禁用：所有节点为 aria-disabled，键盘与点击都不再改变展开 / 选中。 */
    disabled?: boolean
    /** 节点加载中：树报告 aria-busy，显示在途占位、隐藏空态占位。 */
    loading?: boolean
    /** 上下键到达首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 连打检索，默认开启。关闭后可打印字符一律放行给页面。 */
    typeahead?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的展开 / 收起语义。 */
    dir?: Direction
    translations?: Partial<TreeTranslations>
    /**
     * 节点可以拖动移动。整个节点都是拖动源，不另设把手。
     */
    nodeDraggable?: boolean
    /**
     * 本次移动是否允许。收到的是折算后的落点（移到哪个父节点下的第几位）。
     * 未提供时全部允许：落进自身后代与落在禁用节点上两条由库自行拦截。
     */
    allowDrop?: (move: TreeMove) => boolean
    onNodeMove?: (move: TreeMove) => void
    onExpandedValueChange?: (details: TreeExpandedValueChangeDetails) => void
    onSelectionChange?: (details: TreeSelectionChangeDetails) => void
  }
  context: {
    /** 展开集合，恒为数组。受控（expandedValue 提供）时 cell 直读 prop。 */
    expandedValue: string[]
    /** 选中集合，恒为数组。单选时长度 ≤ 1，形状不随模式变化。 */
    selection: string[]
    /** 焦点位于树内时的瞬态锚点，焦点离开即清空。 */
    focusedValue: string | null
    /**
     * 范围选的起点。与 focusedValue 是两个概念：那个跟随焦点、离场即清除，
     * 这个只在选中发生时移动，Shift 的范围从它计算。
     */
    selectionAnchor: string | null
    /**
     * 按住 Shift 之前的选中集。每一次 Shift 都从它重新计算，
     * 在上一次的结果上继续合并时，选区只能越拉越大、向回点击无法收回。
     */
    selectionBaseline: string[] | null
    /** 正在拖动移动的节点；按住但尚未激活时仍为 null。 */
    draggingNode: string | null
    /** 当前的落点；松手即落在此处。不合法或未落在任何节点上时为 null。 */
    dropTarget: DropTarget | null
    /** 读屏播报文本。写入视觉隐藏的活动区域，不进入视觉版面。 */
    announcement: string
    /** 按压通道：Space / Enter 或触屏按住的是叶子行还是分支行。 */
    pressedPart: TreePressedPart | null
    /** 按压通道：按住的节点 value。抬起、失焦或指针取消即清空。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: TreeRefs
  /** 展开与选中都不编码进状态，状态机因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写展开集合（'*' 展开同级、外部 setExpandedValue 都经过它）。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    /** 整体改写选中集合。 */
    | { type: 'SELECTION.SET', value: string[] }
    /** 单选替换、复选切换，由 multiple 决定。 */
    | { type: 'NODE.SELECT', value: string, extend?: boolean }
    | { type: 'NODE.FOCUS', value: string }
    /** 焦点离开树，或持有焦点的节点被移出 DOM（浏览器此时不派发 focusout，由适配器如实上报）。 */
    | { type: 'TREE.BLUR' }
    /** 按在节点上：矩形快照与起点纵坐标由连接层测量后传入。此时只是按住，不视为拖动。 */
    /**
     * 从专用的拖动把手开始：按下即拖动，不再等待激活距离。
     * 把手是不占 Tab 位的独立可触区域，意图无歧义，触屏路径也只经它。
     */
    | { type: 'NODE_DRAG.START', value: string, rects: DragRect[], originY: number, activate?: boolean, source: HTMLElement | null }
    | { type: 'NODE_DRAG.MOVE', clientY: number }
    | { type: 'NODE_DRAG.END' }
    | { type: 'NODE_DRAG.CANCEL' }
    /** 键盘换位：按一次即一次完整提交，不进入拖动态。 */
    | { type: 'NODE.MOVE_BY', value: string, target: DropTarget }
    /**
     * 叶子行或分支行被 Space / Enter 或触屏按住。分支行的键盘按压由 branch 代发（焦点落在 branch 上，
     * branch-control 只是它里面的一层内容）；disabled 是节点自身的禁用事实，由 connect 判定后随事件带入。
     */
    | { type: 'PRESS.START', part: TreePressedPart, value: string, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 part + value 对应的那一个。 */
    | { type: 'PRESS.END', part: TreePressedPart, value: string }
  tag: never
  guard: 'canPress'
  action:
    | 'setExpanded'
    | 'expandBranch'
    | 'collapseBranch'
    | 'toggleBranch'
    | 'setSelection'
    | 'selectNode'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'startNodeDrag'
    | 'trackNodeDrag'
    | 'endNodeDrag'
    | 'cancelNodeDrag'
    | 'moveNodeBy'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: 'trackPointer'
}

export interface TreeApi<T extends PropTypes = PropTypes> {
  /** 作者提供的原始树数据。 */
  collection: readonly TreeNode[]
  /**
   * 当前可见行序列（收起分支的子树不在其中）。
   * 方向键、Home/End 与连打检索都在它上面移动，不在原始树上移动。
   */
  visibleNodes: readonly TreeVisibleNode[]
  /** 当前的落点；松手即落在此处。不合法或未落在任何节点上时为 null。 */
  dropTarget: DropTarget | null
  /** 读屏播报文本。渲染进 live-region，不进入视觉版面。 */
  announcement: string
  expandedValue: string[]
  selection: string[]
  /** 焦点锚点；焦点不在树内、或它已被收起而不可见时为 null。 */
  focusedValue: string | null
  /** 生效的是否为复选。 */
  multiple: boolean
  disabled: boolean
  isExpanded: (value: string) => boolean
  isSelected: (value: string) => boolean
  /** 级联模式下该分支是否半选（有效叶后代部分勾选）；非级联恒为 false。 */
  isIndeterminate: (value: string) => boolean
  setExpandedValue: (next: string[]) => void
  setSelection: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  /** 单选替换、复选切换，与点击同一语义。 */
  /** 选中某个节点。extend 为真时选中锚点到该节点的范围（仅复选、且非级联）。 */
  select: (value: string, options?: { extend?: boolean }) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getTreeProps: () => T['element']
  /**
   * 空态占位：放在 root 中、tree 的兄弟（role=tree 只允许拥有 treeitem 与 group）。
   * 提供 collection 时由连接层按条数收放；节点手写时不写 hidden，是否显示由作者决定。
   */
  getEmptyProps: () => T['element']
  /**
   * 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。
   * 提供 collection 时由连接层按条数收放；节点手写时只按 loading 收放。
   */
  getLoadingProps: () => T['element']
  /**
   * 拖动过程的读屏播报区。视觉隐藏，文本取自 announcement。
   * 它必须在拖动开始之前就在 DOM 上：读屏不播报后插入的节点。
   */
  /**
   * 节点拖动把手。触屏路径唯一的入口，不占 Tab 位。
   *
   * 常驻即可：nodeDraggable 关闭或该节点禁用时它声明 data-disabled、也不再让出滚动，
   * 渲染不会出错。按是否可拖动决定是否渲染，会使 DOM 结构随状态变化。
   */
  getNodeDragTriggerProps: (props: TreeNodeProps) => T['element']
  getLiveRegionProps: () => T['element']
  getItemProps: (props: TreeNodeProps) => T['element']
  getItemTextProps: (props: TreeNodeProps) => T['element']
  getItemDescriptionProps: (props: TreeNodeProps) => T['element']
  getItemSuffixProps: (props: TreeNodeProps) => T['element']
  /** 勾选把手：把勾选该项与点击该行分为两个可点击区域，未提供时没有独立把手。 */
  getItemCheckboxProps: (props: TreeNodeProps) => T['element']
  getItemIndicatorProps: (props: TreeNodeProps) => T['element']
  getBranchProps: (props: TreeNodeProps) => T['element']
  getBranchCheckboxProps: (props: TreeNodeProps) => T['element']
  getBranchControlProps: (props: TreeNodeProps) => T['element']
  getBranchTriggerProps: (props: TreeNodeProps) => T['element']
  getBranchIndicatorProps: (props: TreeNodeProps) => T['element']
  getBranchTextProps: (props: TreeNodeProps) => T['element']
  getBranchContentProps: (props: TreeNodeProps) => T['element']
}

/** 读屏文案，默认英文。拖动过程在视觉上很清楚，在读屏中全部依靠这些文案。 */
export interface TreeTranslations extends Partial<DragTranslations> {}
