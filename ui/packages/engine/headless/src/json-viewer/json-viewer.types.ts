import type { Direction, PropTypes, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 值的类型标签，直接落到 data-value-type 上供皮肤逐类型上色。
 * 六个取值覆盖 JSON 能表达的全部形状；JSON 之外的值归到最接近的那一档：
 * undefined 归 null，bigint 归 number，函数与 symbol 归 string。
 */
export type JsonViewerValueType = 'array' | 'boolean' | 'null' | 'number' | 'object' | 'string'

/**
 * 摊平后的一行。层级三件套（level / posInSet / setSize）由摊平算出，
 * 连接层据它产出 aria-level / aria-posinset / aria-setsize。
 */
export interface JsonViewerNode {
  /**
   * 这一行的路径，全树唯一：既是 DOM 身份（data-value），也是展开集合的元素。
   * 形如 `$["user"]["tags"][0]`，根为 `$`。
   */
  value: string
  /** 对象键或数组下标；根行与截断占位行没有键名，为 null。 */
  key: string | null
  type: JsonViewerValueType
  /** 叶子行的值文本（字符串带引号，循环引用为 `[Circular]`）；分支行为空串。 */
  text: string
  /** 对象或数组且成员非空、且不是循环引用，才算分支——空对象展开什么也看不到。 */
  branch: boolean
  /** 分支行的成员个数；截断占位行是被折掉的剩余个数；其余为 0。 */
  count: number
  /** 1 起算，直接落 aria-level。 */
  level: number
  /** 同层内序号，1 起算，直接落 aria-posinset。 */
  posInSet: number
  /** 同层总数，直接落 aria-setsize。 */
  setSize: number
  /** 父行路径；根行为 null。左方向键靠它跳回上一层。 */
  parent: string | null
  /** 这个值出现在自己的祖先链上，再往下摊会无限递归。 */
  circular: boolean
  /** 这一行是「其余 N 项」的占位，不对应任何真实成员。 */
  truncated: boolean
}

/** 摊平时改变结果形状的选项，三个都不给即原样摊开。 */
export interface JsonViewerWalkOptions {
  /** 字符串值超过这么多字符就截断并补省略号；不给即不截断。 */
  maxStringLength?: number
  /** 同一层最多摊出这么多成员，其余收成一行占位；不给即全摊。 */
  maxItems?: number
  /** 对象键按字典序排列；数组顺序不受影响。 */
  sortKeys?: boolean
}

export interface JsonViewerFlattenOptions extends JsonViewerWalkOptions {
  /** 展开集合：只有在其中的分支才把子行摊进结果。 */
  expanded?: Iterable<string>
}

export interface JsonViewerExpandedChangeDetails {
  value: string[]
}

/** 行自报家门：只报路径。类型、键名与层级一律回摊平结果里查，那是唯一事实源。 */
export interface JsonViewerNodeProps {
  value: string
}

/** 展示形态：tree 摊成可折叠的行，text 直接出缩进过的 JSON 原文。 */
export type JsonViewerView = 'tree' | 'text'

/** 读屏与界面上的文案，默认英文。 */
export interface JsonViewerTranslations {
  /** 原文视图那块区域的可及名字：它是一整块可滚动的文本，不给名字读屏念不出这是什么。 */
  text: string
  /** 树容器的可及名字：它是一片行的集合，没有可见标题，不给名字读屏只会念「树」。 */
  tree: string
  /** 根行的可及名字：整份 JSON 的最外层没有键名，读屏念不出这一行是什么。 */
  root: string
  /** 收起的对象摘要，只出现在屏幕上：括号与省略号是排版记号，preview 部件对读屏隐藏。 */
  objectPreview: (count: number) => string
  /** 收起的数组摘要，语义同上。 */
  arrayPreview: (count: number) => string
  /**
   * 收起的分支的可及名字：括号摘要对读屏隐藏，成员数只能由这一句念出来。
   * 参数是这一行的名字（键名，根行取 root 那一句）与成员个数。
   */
  collapsedBranchLabel: (name: string, count: number) => string
  /** 超过 maxItems 被折掉的剩余项占位文字。 */
  moreItems: (count: number) => string
}

export interface JsonViewerSchema extends MachineSchema {
  props: {
    /** 要展示的值，任意形状。缺省即空视图（一行也不摊）。 */
    value?: unknown
    /**
     * 展示形态，默认 tree。
     * text 档直接出 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减——
     * 要的就是与后端下发的那份一字不差。展开集合与键盘导航在这一档上不起作用。
     */
    view?: JsonViewerView
    /** 展开集合（元素是行路径）。给定即受控：cell 直读 prop，写只发 onExpandedChange 不落内部值。 */
    expandedValue?: string[]
    /** 非受控初值；不给就按 defaultExpandedDepth 现算。 */
    defaultExpandedValue?: string[]
    /** 初始展开到第几层（层级号不超过它的分支全部展开），默认 1，即只展开根行。 */
    defaultExpandedDepth?: number
    /** 字符串值超过这么多字符就截断并补省略号；不给即不截断。 */
    maxStringLength?: number
    /** 同一层最多摊出这么多成员，其余收成一行占位；不给即全摊。 */
    maxItems?: number
    /** 对象键按字典序排列；数组顺序不受影响。 */
    sortKeys?: boolean
    /** 上下键走到首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，只对调左右方向键的展开/收起语义；不给即从 DOM 现读。 */
    dir?: Direction
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<JsonViewerTranslations>
    onExpandedChange?: (details: JsonViewerExpandedChangeDetails) => void
  }
  context: {
    /**
     * 展开集合。受控（expandedValue 给定）时 cell 直读 prop。
     * null = 还没人碰过，读的时候按当下的 value 与 defaultExpandedDepth 现算。
     */
    expandedValue: string[] | null
    /** roving tabindex 的锚点行。焦点离开视图后仍留着，Tab 回来落回上次那一行。 */
    focusedValue: string | null
    /** 焦点此刻是否在视图内。只管高亮，不影响锚点。 */
    focusWithin: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 展开态不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写展开集合（'*' 展开同级、外部 setExpandedValue 都走它）。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    | { type: 'NODE.FOCUS', value: string }
    /** 焦点离开视图，或持有焦点的行被移出 DOM。锚点留着，只落下高亮。 */
    | { type: 'VIEWER.BLUR' }
  tag: never
  guard: never
  action:
    | 'setExpanded'
    | 'expandBranch'
    | 'collapseBranch'
    | 'toggleBranch'
    | 'setFocusedValue'
    | 'clearFocusWithin'
  effect: never
}

export interface JsonViewerApi<T extends PropTypes = PropTypes> {
  /**
   * 当前可见行序列（收起分支的子行不在其中）。
   * 方向键、Home/End 都在它上面走，适配器也按它铺 DOM。
   */
  visibleNodes: readonly JsonViewerNode[]
  expandedValue: string[]
  /**
   * roving tabindex 的锚点行：焦点在树内时就是当前行，焦点离开后仍留着（Tab 回来落回它）；
   * 它已随分支收起而不再可见时为 null。
   */
  focusedValue: string | null
  /** 焦点此刻在不在树内。行的高亮标记跟它走，锚点不跟。 */
  isFocusWithin: boolean
  isExpanded: (value: string) => boolean
  /** 分支收起摘要的显示文字（如 `{…} 3`），只给眼睛看；叶子行返回空串。 */
  previewText: (node: JsonViewerNode) => string
  /** 值的显示文字；截断占位行返回「其余 N 项」那句话。 */
  valueText: (node: JsonViewerNode) => string
  setExpandedValue: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  toggle: (value: string) => void
  /** 当前生效的展示形态。 */
  view: JsonViewerView
  /** 缩进过的 JSON 原文；键序与环路记号与树档一致。text 档之外也取得到，方便作者做「复制原文」。 */
  text: string
  getRootProps: () => T['element']
  getTreeProps: () => T['element']
  getTextProps: () => T['element']
  getItemProps: (props: JsonViewerNodeProps) => T['element']
  getItemKeyProps: (props: JsonViewerNodeProps) => T['element']
  getItemValueProps: (props: JsonViewerNodeProps) => T['element']
  getBranchProps: (props: JsonViewerNodeProps) => T['element']
  getBranchControlProps: (props: JsonViewerNodeProps) => T['element']
  getBranchTriggerProps: (props: JsonViewerNodeProps) => T['element']
  getBranchIndicatorProps: (props: JsonViewerNodeProps) => T['element']
  getBranchTextProps: (props: JsonViewerNodeProps) => T['element']
  getBranchContentProps: (props: JsonViewerNodeProps) => T['element']
  getPreviewProps: (props: JsonViewerNodeProps) => T['element']
}
