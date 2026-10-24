/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 tree 类型契约。

import type { CascadeStrategy, ControlVariant, Direction, MachineSchema, Orientation, PropTypes, Size, Tone, Typeahead } from '@xihan-ui/core'
import type { MultiPointerSession } from '@xihan-ui/pointer'
import type { DragRect, DragTranslations, DropTarget } from '../shared/drag'
import type { BranchLoadChildren, BranchLoadDetails, BranchLoadErrorDetails, BranchLoadRequest, BranchLoadRuntime, BranchLoadSnapshot, BranchLoadStartDetails, BranchLoadStatus } from '../shared/lazy-branch'
import type { CollectionVirtualizer } from '../virtualizer'

/** 懒分支的取数相位。 */
export type TreeBranchLoadStatus = BranchLoadStatus

/** 懒分支的取数快照；成功空结果与失败是两个独立终态，不能互相降级。 */
export type TreeBranchLoadSnapshot = BranchLoadSnapshot

/** 一次分支取数。signal 会在重试、分支收起、节点从 collection 移除或组件卸载时中止。 */
export type TreeLoadChildrenRequest = BranchLoadRequest<TreeNode>

/** 一轮有效分支请求开始；reason 区分首次展开与显式重试。 */
export type TreeBranchLoadStartDetails = BranchLoadStartDetails<TreeNode>

/** 一轮有效分支请求成功；children 为空仍是成功。 */
export type TreeBranchLoadDetails = BranchLoadDetails<TreeNode>

/** 一轮有效分支请求失败；error 是 loadChildren 给出的原样错误。 */
export type TreeBranchLoadErrorDetails = BranchLoadErrorDetails<TreeNode>

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
 * 选择模式。single 单选；multiple 点击与确认键切换；
 * extended 裸点击与确认键换成这一项，按住 Ctrl/Cmd 点击或 Ctrl/Cmd+Space 切换这一项，按住 Shift 点击选锚点到这一项那一段。
 */
export type TreeSelectionMode = 'single' | 'multiple' | 'extended'

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
   * 写 false 时这一个节点拖不起来（nodeDraggable 开着时指针按住、Alt + 方向键都不搬它），
   * 照常能选、能展开、能当别的节点的落点。缺省可拖。不向下传导给子节点。
   */
  draggable?: boolean
  /**
   * 该节点自身的性质：已失效的写 danger、需要留意的写 warning。不写即与其余节点同档，
   * 也不向下传导给子节点——每一层各自声明。只换字色与悬停 / 按下的面，不改字重与缩进，
   * 也不表达选中或校验；选中的标记与禁用都压过它。彩字不是唯一通道，要紧的差别仍要配图标。
   */
  tone?: Tone
  /**
   * 副文本：叶子写入 item-description、分支写入 branch-description 部件；未提供时本条不铺该部件。
   * 它是第 2 行的说明，跟着条目走 muted 档，不跟语气；放不下一行的解释才用它，
   * 一句话能说清的写进 label。
   */
  description?: string
  /**
   * 子节点。提供数组即判定为分支，空数组也计入：暂时没有子项的目录仍要报告 aria-expanded。
   */
  children?: TreeNode[]
  /**
   * 懒分支：写 true 且不给 children 时，这一枝在首次展开时由 loadChildren 取子项。
   * 已提供 children 时它没有额外作用。取回的子项由 headless 暂存，不需要宿主重写整棵 collection。
   */
  hasChildren?: boolean
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
  /** 能不能被拖起来：节点写了 draggable: false 时为 false。 */
  draggable: boolean
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
   * 落下之后盯住宿主那一次重排的句柄：宿主写回 collection、行换到新位置时，从旧位置滑过去。
   * 宿主没写回时留到下一次提交前或卸载时停掉。
   */
  reorder: (() => void) | null
  /**
   * 连打检索缓冲，随服务存活，停顿足够久后自行重新开始。
   * 放在模块变量中会使同页两棵树共用一个缓冲。
   */
  typeahead: Typeahead
  /** 树上一次所知的选中：自己提的那份，或从外面换上的那份；还没看过时为 null。 */
  knownSelection: readonly string[] | null
  /** 仍在途的分支请求；只存放运行时资源，不进入可渲染 context。 */
  branchLoadControllers: BranchLoadRuntime<TreeNode>['controllers']
  /** 每次开新请求递增，用于拒绝过期回调。实例私有，不能放模块变量。 */
  branchLoadSequence: BranchLoadRuntime<TreeNode>['sequence']
  /** load 状态与成功 children 所属的原始节点对象；同 value 换节点时据此作废旧结果。 */
  branchLoadOwners: BranchLoadRuntime<TreeNode>['owners']
}

/** 接了按压通道的两个部件：叶子行与分支行都按 node.value 记，同一个值在两个部件上分开认。 */
export type TreePressedPart = 'item' | 'branch-control'

export interface TreeSchema extends MachineSchema {
  props: {
    /**
     * 作者渲染了 label 部件时置真，由适配器统计而不是判断标题文字是否有值。
     * 为假时可聚焦部件不把 label 的 id 写进 aria-labelledby：指向未渲染的 id 是无效引用，作者写在控件上的 aria-label 也会被它压住。
     */
    labelled?: boolean
    /** 树数据，层级元信息的唯一事实源。默认为空树。 */
    collection?: TreeNode[]
    /** 完整 collection 与 Virtualizer 的焦点桥；count 必须等于当前 visibleNodes.length。 */
    virtualizer?: CollectionVirtualizer
    /** 外框形态：ghost 去掉描边与底色只保留行（默认），outline 带描边与底色，subtle 淡底无描边。 */
    variant?: ControlVariant
    /** 尺寸：sm / md / lg，默认 md。行高、行内内衬、字号、指示符盒（展开箭头、对号、拖拽把手）与层级缩进随档。 */
    size?: Size
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
    /** 选择模式，默认 single；multiple 与 extended 下 tree 带 aria-multiselectable=true。 */
    selectionMode?: TreeSelectionMode
    /**
     * selectionMode 为 multiple 时父子级联勾选：点击分支整枝传导、子全勾父勾、部分勾选半选，
     * 禁用子树整棵冻结。默认 false（朴素切换）；single 与 extended 下无效。
     */
    cascade?: boolean
    /** 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾选节点。 */
    checkedStrategy?: CascadeStrategy
    /** 点击分支行（与确认键）是否同时展开 / 收起，默认 false：展开与选中分开，只有 branch-trigger 与左右方向键能改变展开态。 */
    expandOnClick?: boolean
    /** 整棵树禁用：所有节点为 aria-disabled，键盘与点击都不再改变展开 / 选中。 */
    disabled?: boolean
    /** 节点加载中：树报告 aria-busy、隐藏空态占位；还没有节点时显示在途占位，已有节点时行保留上一帧淡下。 */
    loading?: boolean
    /**
     * 正在取子节点的分支（节点 value）。在其中的分支报告 aria-busy，展开箭头换成转圈。
     * 取数由作者自己编排时用它；交给 loadChildren 的懒分支由库自己标出在途，不必写在这里。
     */
    loadingValue?: string[]
    /**
     * 取回 `hasChildren: true` 分支的直接子项。首次展开自动调用，失败后用 api.retryBranch 或
     * branch-retry-trigger 显式重试；收起分支会中止在途的那一轮。旧请求的兑现或拒绝不会覆盖更新的一轮，
     * 也不会写回已移除的分支。取回的子项暂存在组件里，不写回 collection。
     */
    loadChildren?: BranchLoadChildren<TreeNode>
    /** 连接线：父节点展开箭头的中线向下引一道竖线，每个子节点横出一段接到行首，最后一个子节点止于行中线，默认 false。只是外观，不改结构与键盘。 */
    lines?: boolean
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
    /** 一轮有效分支请求开始；retry 与首次展开由 reason 区分。 */
    onBranchLoadStart?: (details: TreeBranchLoadStartDetails) => void
    /** 一轮有效分支请求成功；children 为空仍是成功，不转换为错误。 */
    onBranchLoad?: (details: TreeBranchLoadDetails) => void
    /** 一轮有效分支请求失败；保留 loadChildren 给出的原始 error。 */
    onBranchLoadError?: (details: TreeBranchLoadErrorDetails) => void
  }
  context: {
    /** 懒分支的当前相位；成功后的子项单独存放，避免把运输状态混进数据树。 */
    branchLoads: Record<string, TreeBranchLoadSnapshot>
    /** 已成功取回的直接子项，按父节点 value 建表。 */
    loadedChildren: Record<string, TreeNode[]>
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
    /** 显式重试一个取数失败的懒分支：中止在途的一轮，重新发。 */
    | { type: 'BRANCH.RETRY', value: string }
    /** 整体改写选中集合。 */
    | { type: 'SELECTION.SET', value: string[] }
    /**
     * 选中一个节点，语义由 selectionMode 决定：single 换成这一项；multiple 切换，extend 并进锚点到这一项那一段；
     * extended 换成这一项，additive 切换，extend 选锚点到这一项那一段（同时 additive 则并进）。
     */
    | { type: 'NODE.SELECT', value: string, extend?: boolean, additive?: boolean }
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
    | 'followSelection'
    | 'loadExpandedBranch'
    | 'loadExpandedBranches'
    | 'retryBranch'
    | 'syncBranchLoads'
  effect: 'trackPointer' | 'trackBranchLoads'
}

export interface TreeApi<T extends PropTypes = PropTypes> {
  /** 有效树数据：作者的 collection，懒分支补上已取回的子项（还没取回的补空数组）。 */
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
  /** 生效的选择模式。 */
  selectionMode: TreeSelectionMode
  disabled: boolean
  /** 生效的文案：内建英文与 translations 合并后的那一份。 */
  translations: TreeTranslations
  isExpanded: (value: string) => boolean
  isSelected: (value: string) => boolean
  /** 级联模式下该分支是否半选（有效叶后代部分勾选）；非级联恒为 false。 */
  isIndeterminate: (value: string) => boolean
  /** 非懒分支返回 null；懒分支即使尚未请求也返回 idle。 */
  branchLoadState: (value: string) => TreeBranchLoadSnapshot | null
  setExpandedValue: (next: string[]) => void
  setSelection: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  /** 失败后重新取该分支；非懒分支与未知 value 不产生副作用。 */
  retryBranch: (value: string) => void
  /**
   * 选中某个节点，与点击同一语义：extend 对应按住 Shift（选锚点到该节点的范围，单选与级联下不认），
   * additive 对应按住 Ctrl/Cmd（extended 下切换这一项）。
   */
  select: (value: string, options?: { extend?: boolean, additive?: boolean }) => void
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
  getItemIndicatorProps: (props: TreeNodeProps) => T['element']
  getBranchProps: (props: TreeNodeProps) => T['element']
  getBranchControlProps: (props: TreeNodeProps) => T['element']
  getBranchTriggerProps: (props: TreeNodeProps) => T['element']
  getBranchIndicatorProps: (props: TreeNodeProps) => T['element']
  getBranchTextProps: (props: TreeNodeProps) => T['element']
  /** 分支行的第 2 行副文本，与叶子的 item-description 同一档。 */
  getBranchDescriptionProps: (props: TreeNodeProps) => T['element']
  getBranchContentProps: (props: TreeNodeProps) => T['element']
  /** 懒分支取数在途：组件或元素在分支里自己补出，展开且在途时露面。 */
  getBranchLoadingProps: (props: TreeNodeProps) => T['element']
  /** 懒分支取数失败的说明：展开且失败时露面。 */
  getBranchErrorProps: (props: TreeNodeProps) => T['element']
  /** 懒分支失败后的重试按钮：不占 Tab 位，键盘在分支上按确认键即重试。 */
  getBranchRetryTriggerProps: (props: TreeNodeProps) => T['button']
  /** 懒分支取回了空数组：展开时露面。 */
  getBranchEmptyProps: (props: TreeNodeProps) => T['element']
}

/**
 * 文案，默认英文。拖动过程在视觉上很清楚，在读屏中全部依靠拖动那几句；
 * 懒分支的在途、失败、重试与空结果四句由组件在分支里自己补出的节点使用。
 */
export interface TreeTranslations extends Partial<DragTranslations> {
  /** 懒分支正在取子项时的文案。 */
  loading: string
  /** 懒分支取数失败时的文案。 */
  branchError: string
  /** 懒分支失败后的重试按钮文案。 */
  retry: string
  /** 懒分支取回空数组时的文案。 */
  branchEmpty: string
}
