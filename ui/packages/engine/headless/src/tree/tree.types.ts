import type { Typeahead } from '@xihan-ui/behavior'
import type { Direction, PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

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
 * 选择模式：
 * - single：一次只中一个，点击与确认键都是「替换」；
 * - multiple：复选，点击与确认键都是「切换」，tree 带 aria-multiselectable=true。
 */
export type TreeSelectionMode = 'single' | 'multiple'

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

export interface TreeExpandedChangeDetails {
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
    /** 展开集合。给定即受控：cell 直读 prop，写只发 onExpandedChange 不落内部值。 */
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    /** 选中集合。给定即受控，语义同上。 */
    selectedValue?: string[]
    defaultSelectedValue?: string[]
    /** 默认 single。 */
    selectionMode?: TreeSelectionMode
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
    onExpandedChange?: (details: TreeExpandedChangeDetails) => void
    onSelectionChange?: (details: TreeSelectionChangeDetails) => void
  }
  context: {
    /** 展开集合，恒为数组。受控（expandedValue 给定）时 cell 直读 prop。 */
    expandedValue: string[]
    /** 选中集合，恒为数组。单选时长度 ≤ 1，形状不随模式变。 */
    selectedValue: string[]
    /** 焦点位于树内时的瞬态锚点，焦点离开即清空。 */
    focusedValue: string | null
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
    | { type: 'SELECTED.SET', value: string[] }
    /** 单选替换、复选切换，由 selectionMode 决定。 */
    | { type: 'NODE.SELECT', value: string }
    | { type: 'NODE.FOCUS', value: string }
    /** 焦点离开树，或持有焦点的节点被移出 DOM（浏览器此时不派 focusout，由适配器如实上报）。 */
    | { type: 'TREE.BLUR' }
  tag: never
  guard: never
  action:
    | 'setExpanded'
    | 'expandBranch'
    | 'collapseBranch'
    | 'toggleBranch'
    | 'setSelected'
    | 'selectNode'
    | 'setFocusedValue'
    | 'clearFocusedValue'
  effect: never
}

export interface TreeApi<T extends PropTypes = PropTypes> {
  /** 作者给的原始树数据。 */
  collection: readonly TreeNode[]
  /**
   * 当前可见行序列（收起分支的子树不在其中）。
   * 方向键、Home/End 与连打检索都在它上面走，不是在原始树上走。
   */
  visibleNodes: readonly TreeVisibleNode[]
  expandedValue: string[]
  selectedValue: string[]
  /** 焦点锚点；焦点不在树内、或它已被收起而不可见时为 null。 */
  focusedValue: string | null
  selectionMode: TreeSelectionMode
  disabled: boolean
  isExpanded: (value: string) => boolean
  isSelected: (value: string) => boolean
  setExpandedValue: (next: string[]) => void
  setSelectedValue: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  /** 单选替换、复选切换，与点击同一语义。 */
  select: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getTreeProps: () => T['element']
  getItemProps: (props: TreeNodeProps) => T['element']
  getItemTextProps: (props: TreeNodeProps) => T['element']
  getItemIndicatorProps: (props: TreeNodeProps) => T['element']
  getBranchProps: (props: TreeNodeProps) => T['element']
  getBranchControlProps: (props: TreeNodeProps) => T['element']
  getBranchTriggerProps: (props: TreeNodeProps) => T['element']
  getBranchIndicatorProps: (props: TreeNodeProps) => T['element']
  getBranchTextProps: (props: TreeNodeProps) => T['element']
  getBranchContentProps: (props: TreeNodeProps) => T['element']
}
