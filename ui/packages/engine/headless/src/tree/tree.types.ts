import type { CascadeStrategy, Typeahead } from '@xihan-ui/behavior'
import type { Direction, Orientation, PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { MultiPointerSession } from '@xihan-ui/pointer'
import type { DragRect, DragTranslations, DropTarget } from '../shared/drag'

/**
 * 焦点模型：roving tabindex，不做 aria-activedescendant 变体。
 * 焦点真的落在 role=treeitem 的节点上，整棵树只留一个 Tab 停靠点：
 * 锚点 = focusedValue ?? 首个可见的选中值，认领 tabindex=0，其余一律 -1；
 * 焦点不在树内时由 tree 容器兜底进 Tab 序列，它的 onFocus 再把焦点转投给锚点节点。
 * 可见这层过滤不能省：收起分支里的节点仍在 DOM 中但 hidden 不可聚焦，
 * 让它认领 tabindex=0 会让整棵树没有停靠点；focusedValue 指向已隐藏节点时同样投影成 null。
 */
export type TreeFocusModel = 'roving-tabindex'

/**
 * 作者给的树数据，是层级元信息（层级号、同层序号、同层总数、父子关系）的唯一事实源：
 * 连接层据此产出 aria-level / aria-posinset / aria-setsize，作者的标记只管长相。
 * value 必须全树唯一：它同时是 DOM 身份（data-value）、选中/展开集合的元素与查节点的键。
 */
export interface TreeNode {
  value: string
  /** 展示名，也是连打检索与分支可及名字的取字处；缺省退回 value。 */
  label?: string
  /** 节点禁用：方向键与连打检索跳过它，但它仍可聚焦、仍是导航起点。不向下传导给子节点。 */
  disabled?: boolean
  /**
   * 子节点。给了数组即判定为分支，空数组也算：暂时没有子项的目录仍要报 aria-expanded。
   */
  children?: TreeNode[]
  /**
   * 这一层子节点怎么排，由作者在数据上标。给了就以它为准，`vertical` 也压得过树级的
   * `leafOrientation`；不给才退回 `leafOrientation` 加「子节点全是叶子」的结构判据。
   *
   * 标在哪一层，横排就只落在哪一层：菜单授权里标在按钮的父菜单上，别的目录不受牵连，
   * 也不随子节点增减漂移。只管排布，不动键盘。
   */
  childrenOrientation?: Orientation
}

/** 单个节点的层级元信息，由 collection 摊平/索引得出，不含展开态。 */
export interface TreeNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串，连打检索直接拿它比。 */
  label: string
  disabled: boolean
  /** children 是数组即为分支。 */
  branch: boolean
  /** 1 起算，直接落 aria-level。 */
  level: number
  /** 同层内序号，1 起算，直接落 aria-posinset。 */
  posInSet: number
  /** 同层总数，直接落 aria-setsize。 */
  setSize: number
  /** 父节点值；根层为 null。左方向键靠它跳回上一层。 */
  parent: string | null
  /** 在原始 collection 里的下标路径，供作者定位原始节点。 */
  indexPath: readonly number[]
}

/** 可见行：摊平结果的元素，比元信息多一个展开态。 */
export interface TreeVisibleNode extends TreeNodeMeta {
  /** 叶子恒为 false；分支为「它在展开集合里」。 */
  expanded: boolean
}

/** 搬家：把某个节点放到某个父节点下的第几位。父为 null 即根层。 */
export interface TreeMove {
  /** 被搬的节点。 */
  value: string
  /** 搬到谁下面；null 是根层。 */
  parent: string | null
  /** 在那一层的第几位，0 起算。已经算过「先摘后插」的修正。 */
  index: number
}

export interface TreeExpandedValueChangeDetails {
  value: string[]
}

export interface TreeSelectionChangeDetails {
  value: string[]
}

/**
 * 节点自报家门：只报值。层级、禁用、标签一律回 collection 里查，那是唯一事实源。
 */
export interface TreeNodeProps {
  value: string
}

export interface TreeRefs {
  /** 跟手的会话，整个生命周期都在。调用方在按下时把那一根指针交进来。 */
  gesture: MultiPointerSession | null
  /**
   * 正在拖着搬家的那个节点。activated 之前只是「按住了」，还不是拖动——
   * 整个节点都是拖动源没有把手表明意图，要走够激活距离才算。
   */
  nodeDrag: {
    value: string
    rects: DragRect[]
    originY: number
    activated: boolean
    /** 拖动源节点。拖动中拿它量版面整体挪了多远，见 snapshotDrift。 */
    source: HTMLElement | null
  } | null
  /**
   * 连打检索缓冲，随服务存活，停顿够久自行重开一轮。
   * 放模块变量会让同页两棵树共用一个缓冲。
   */
  typeahead: Typeahead
}

export interface TreeSchema extends MachineSchema {
  props: {
    /** 树数据，层级元信息的唯一事实源。缺省为空树。 */
    collection?: TreeNode[]
    /**
     * 末端那一层怎么排，默认 vertical（每行一个）。horizontal 让它们并排铺开。
     *
     * 只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层：
     * 一个菜单下十几个按钮，横排一行铺完，省掉纵向翻找。中间层与整棵树恒是竖排，
     * 它们承载的是层级本身，横过来层级就读没了。
     *
     * 这是结构判据，逐层自动认。要精确指定哪一层横排，在节点上标
     * `childrenOrientation`，它比本项优先。
     *
     * 只管排布，不动键盘：方向键在树上是层级操作（左右收展、上下走可见行），
     * 这是 treeview 的规范语义，不随排布方向改写。
     */
    leafOrientation?: Orientation
    /** 展开集合。给定即受控：cell 直读 prop，写只发 onExpandedValueChange 不落内部值。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 选中集合。给定即受控，语义同上。 */
    selection?: string[]
    defaultSelection?: string[]
    /** 复选：点击与确认键都是「切换」，tree 带 aria-multiselectable=true。默认 false（单选）。 */
    multiple?: boolean
    /**
     * multiple 下父子级联勾选：点分支整枝传导、子全勾父勾、部分勾中半选，
     * 禁用子树整棵冻结。默认 false（朴素切换）；single 下无效。
     */
    cascade?: boolean
    /** 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾中节点。 */
    checkedStrategy?: CascadeStrategy
    /** 点分支行是否顺带展开/收起，默认 true。关掉后只有 branch-trigger 与左右方向键能改展开态。 */
    expandOnClick?: boolean
    /** 整棵树禁用：所有节点转 aria-disabled，键盘与点击都不再改展开/选中。 */
    disabled?: boolean
    /** 上下键走到首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 连打检索，默认开。关掉后可打印字符一律放行给页面。 */
    typeahead?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 */
    dir?: Direction
    translations?: Partial<TreeTranslations>
    /**
     * 节点可以拖着搬家。整个节点都是拖动源，不另出把手。
     */
    nodeDraggable?: boolean
    /**
     * 这一次搬家许不许。收到的是折算好的落点（搬到哪个父下面的第几位）。
     * 不给即都许——「落进自己的后代」与「落在禁用节点上」两条库自己会拦。
     */
    allowDrop?: (move: TreeMove) => boolean
    onNodeMove?: (move: TreeMove) => void
    onExpandedValueChange?: (details: TreeExpandedValueChangeDetails) => void
    onSelectionChange?: (details: TreeSelectionChangeDetails) => void
  }
  context: {
    /** 展开集合，恒为数组。受控（expandedValue 给定）时 cell 直读 prop。 */
    expandedValue: string[]
    /** 选中集合，恒为数组。单选时长度 ≤ 1，形状不随模式变。 */
    selection: string[]
    /** 焦点位于树内时的瞬态锚点，焦点离开即清空。 */
    focusedValue: string | null
    /**
     * 范围选的起点。与 focusedValue 是两回事：那个跟着焦点跑、离场即清，
     * 这个只在选中发生时挪，Shift 那一段从它算起。
     */
    selectionAnchor: string | null
    /**
     * 按住 Shift 之前的那份选中集。每一下 Shift 都从它重算，
     * 拿上一次的结果继续并的话，选区就只能越拉越大、往回点收不回来。
     */
    selectionBaseline: string[] | null
    /** 正在拖着搬家的那个节点；按住但还没激活时仍是 null。 */
    draggingNode: string | null
    /** 此刻的落点；松手就落在这儿。不合法或没落在任何节点上时是 null。 */
    dropTarget: DropTarget | null
    /** 读屏播报文本。写进视觉隐藏的活动区域，不进视觉版面。 */
    announcement: string
  }
  computed: Record<string, never>
  refs: TreeRefs
  /** 展开与选中都不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写展开集合（'*' 展开同级、外部 setExpandedValue 都走它）。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    /** 整体改写选中集合。 */
    | { type: 'SELECTION.SET', value: string[] }
    /** 单选替换、复选切换，由 multiple 决定。 */
    | { type: 'NODE.SELECT', value: string, extend?: boolean }
    | { type: 'NODE.FOCUS', value: string }
    /** 焦点离开树，或持有焦点的节点被移出 DOM（浏览器此时不派 focusout，由适配器如实上报）。 */
    | { type: 'TREE.BLUR' }
    /** 按在节点上：矩形快照与起点纵坐标由连接层量好交进来。此刻只是按住，还不算拖。 */
    /**
     * 从专门的拖动把手起手：按下即拖，不再等激活距离。
     * 把手是不占 Tab 位的独立可触区域，意图无歧义，触屏那一路也只走它。
     */
    | { type: 'NODE_DRAG.START', value: string, rects: DragRect[], originY: number, activate?: boolean, source: HTMLElement | null }
    | { type: 'NODE_DRAG.MOVE', clientY: number }
    | { type: 'NODE_DRAG.END' }
    | { type: 'NODE_DRAG.CANCEL' }
    /** 键盘换位：一按就是一次完整提交，不进拖动态。 */
    | { type: 'NODE.MOVE_BY', value: string, target: DropTarget }
  tag: never
  guard: never
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
  effect: 'trackPointer'
}

export interface TreeApi<T extends PropTypes = PropTypes> {
  /** 作者给的原始树数据。 */
  collection: readonly TreeNode[]
  /**
   * 当前可见行序列（收起分支的子树不在其中）。
   * 方向键、Home/End 与连打检索都在它上面走，不是在原始树上走。
   */
  visibleNodes: readonly TreeVisibleNode[]
  /** 此刻的落点；松手就落在这儿。不合法或没落在任何节点上时是 null。 */
  dropTarget: DropTarget | null
  /** 读屏播报文本。渲进 live-region，不进视觉版面。 */
  announcement: string
  expandedValue: string[]
  selection: string[]
  /** 焦点锚点；焦点不在树内、或它已被收起而不可见时为 null。 */
  focusedValue: string | null
  /** 生效的是不是复选。 */
  multiple: boolean
  disabled: boolean
  isExpanded: (value: string) => boolean
  isSelected: (value: string) => boolean
  /** 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 */
  isIndeterminate: (value: string) => boolean
  setExpandedValue: (next: string[]) => void
  setSelection: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  /** 单选替换、复选切换，与点击同一语义。 */
  /** 选中某个节点。extend 为真时选中锚点到这一节点那一段（仅复选、且非级联）。 */
  select: (value: string, options?: { extend?: boolean }) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getTreeProps: () => T['element']
  /**
   * 拖动过程的读屏播报区。视觉隐藏，文本从 announcement 取。
   * 它必须在拖动开始之前就在 DOM 上——读屏不播报后插入的节点。
   */
  /**
   * 节点拖动把手。触屏那一路唯一的入口，不占 Tab 位。
   *
   * 常挂即可：nodeDraggable 关着或这个节点禁用时它自报 data-disabled、也不再让出滚动，
   * 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。
   */
  getNodeDragTriggerProps: (props: TreeNodeProps) => T['element']
  getLiveRegionProps: () => T['element']
  getItemProps: (props: TreeNodeProps) => T['element']
  getItemTextProps: (props: TreeNodeProps) => T['element']
  /** 勾选把手：把「勾这一项」与「点这一行」分成两个可点区域，不给它就没有独立把手。 */
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

/** 读屏用的文案，默认英文。拖动过程在视觉上很清楚，在读屏里全靠这几句。 */
export interface TreeTranslations extends Partial<DragTranslations> {}
