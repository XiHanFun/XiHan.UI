import type { CascadeStrategy } from '@xihan-ui/behavior'
import type { Cleanup, ControlVariant, Direction, Layer, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 树数据，层级、显示文本与条目禁用的唯一事实源。
 *
 * value 必须全树唯一：它同时是 DOM 身份（data-value）、条目查询的键，以及反查
 * 条目所属列与完整路径的入口。重复的 value 会让反查以先出现的为准。
 *
 * children 为空数组算叶子，右边不再开新列。
 */
export interface CascaderNode {
  value: string
  /** 展示名，也是路径回显的取字处；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。不向下传导给子节点。 */
  disabled?: boolean
  /** 子节点。非空数组才算分支（右边能再开一列）。 */
  children?: CascaderNode[]
}

/** 候选部件自报家门：它代表哪条整路径。 */
export interface CascaderSearchItemProps {
  path: string[]
}

/** 一条过滤后的候选。 */
export interface CascaderSearchResult {
  path: string[]
  /** 整条路径逐段的显示名。 */
  labels: string[]
  /** 路径上任何一段禁用即整条禁用，点按不落值。 */
  disabled: boolean
  /** cascaderPathKey(path)，作 DOM id 与比对键。 */
  key: string
}

/** 单个条目的元信息，由 collection 推出，不含选中态与展开态。 */
export interface CascaderNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** children 是非空数组即为分支。 */
  branch: boolean
  /** 所在列序号，0 起算。 */
  level: number
  /** 从根到它（含自身）的完整路径，选中时落进 value。 */
  path: readonly string[]
}

/** 当下并排展开的一列。 */
export interface CascaderColumn {
  /** 列序号，0 起算；根列恒为 0。 */
  level: number
  /** 生成这一列的父节点路径；根列为空数组。 */
  parentPath: readonly string[]
  items: readonly CascaderNodeMeta[]
}

/**
 * 按深度摊开的静态列：第 L 层的全部节点，与展开路径无关。
 * 作者据此写标记（每层一个 column，层内节点各一个 item），当下哪些条目露面由连接层用 hidden 收口。
 */
export interface CascaderLevel {
  level: number
  items: readonly CascaderNodeMeta[]
}

/**
 * 展开那一刻焦点落在哪一个条目：
 * - selected 停在选中路径的末项（它已禁用时退回所在列的首个可停留条目；无选中则不落
 *   锚点、列也不铺，焦点歇在 content 上——指针打开走这条，不能有条目看着像被选中）
 * - first / last 从根列两端进（键盘确认键在无选中时走 first）
 * - next / prev 从选中路径的末项在它自己那一列里走一步
 */
export type CascaderFocusIntent = 'selected' | 'first' | 'last' | 'next' | 'prev'

/** 子列由什么展开：点条目，还是指针划过条目。键盘一律走右方向键，不受这个开关影响。 */
export type CascaderExpandTrigger = 'click' | 'hover'

/**
 * 选中路径。单条路径（`['zhejiang','hangzhou']`）是简写，内部一律归一成路径集合
 * （`[['zhejiang','hangzhou']]`）。空数组即无选中。
 */
export type CascaderValue = readonly string[] | readonly (readonly string[])[]

/** 空态占位的内建文案，默认英文。 */
export interface CascaderTranslations {
  /** collection 为空（根列没有条目）时的占位文案。 */
  empty: string
  /** 搜索无匹配（候选为空）时的占位文案。 */
  noMatch: string
  /** 没有父条目可指的列（根列与收起的那几列）的兜底名字，两个名字部件都没渲染时才出面。 */
  column: string
  /** 搜索结果列表的可及名字：它没有可指的标题部件，只能自带一句。 */
  searchList: string
  /** 清空按钮的可及名字。 */
  clearTrigger: string
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用短路，机器状态照常转移。
export interface CascaderRefs {
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄；只在展开期间调用，层不常驻栈。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 浮层定位引擎；缺省即不产出位置结果。 */
  position: PositionEnginePort | null
  /** 定位锚点，取 trigger；清空按钮按完也把焦点还给它。 */
  getAnchorEl: () => HTMLElement | null
  /** 被定位的浮层容器，通常是 positioner。 */
  getFloatingEl: () => HTMLElement | null
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器（各列都长在它里面）。 */
  getContentEl: () => HTMLElement | null
}

export interface CascaderOpenChangeDetails {
  open: boolean
  /**
   * 这一次是怎么关的；展开时不带。
   * 用它区分「用户主动取消」与「选完自动收起」，前者常要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface CascaderValueChangeDetails {
  /** 选中路径集合。单选下也是数组（长度 ≤ 1），形状不随模式变。 */
  value: string[][]
}

/** 条目自报家门：只报值。所在列、完整路径、禁用与标签一律回 collection 里查。 */
export interface CascaderItemProps {
  value: string
}

/** 列自报家门：只报层号。列里有哪些条目、这一列此刻该不该露面，都由连接层算。 */
export interface CascaderColumnProps {
  level: number
}

export interface CascaderSchema extends MachineSchema {
  props: {
    /** 树数据，层级元信息与显示文本的唯一事实源。缺省为空树。 */
    collection?: CascaderNode[]
    /**
     * 选中路径。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     * 单条路径是简写，内部一律归一成路径集合。
     */
    value?: CascaderValue
    defaultValue?: CascaderValue
    /** 展开态。给定即受控：内部不再自改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 子列由什么展开，默认 click。 */
    expandTrigger?: CascaderExpandTrigger
    /** 中间层（分支）也能落值。关掉时点分支只展开子列，不改选中值。 */
    changeOnSelect?: boolean
    /** 多选：选中是路径集合，选中后浮层不收起、焦点留在列里以便接着挑。 */
    multiple?: boolean
    /** 开启搜索：input 部件可用，输入后整条路径连缀过滤、候选替换列视图。 */
    searchable?: boolean
    /**
     * 多选下父子级联勾选：点分支整枝传导、子全勾父勾、部分勾中半选，
     * 禁用子树整棵冻结。默认 false（按路径原样翻转）；单选下无效。
     */
    cascade?: boolean
    /** 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾中节点。 */
    checkedStrategy?: CascadeStrategy
    /** 整个控件禁用：trigger 用原生 disabled，浮层展不开。 */
    disabled?: boolean
    /** 只读：浮层照常展开与浏览，但选中值改不动、也清不掉。 */
    readOnly?: boolean
    /** 校验失败：trigger 报 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 空态占位的文案覆盖，默认英文。 */
    translations?: Partial<CascaderTranslations>
    /** 形态：outline / subtle / ghost，决定触发框的描边与底色怎么用。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定触发框与条目的几何档位。 */
    size?: Size
    /** 无选中时 value-text 显示的占位文字。 */
    placeholder?: string
    /** 路径回显的连接符，默认 ' / '。 */
    separator?: string
    placement?: Placement
    offset?: number
    /** 列内上下键走到首尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的「进子列/回上一列」语义。 */
    dir?: Direction
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: CascaderValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: CascaderOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读它，不碰 DOM 也不调引擎。 */
    position: PositionResult | null
    /** 选中路径集合，恒为数组的数组。受控（value 给定）时 cell 直读 prop。 */
    value: string[][]
    /**
     * 展开路径：并排开着哪几列由它决定（列数 = 它走得通的段数 + 1），与选中值互相独立。
     * 键盘导航下恒等于焦点路径；指针悬停展开时只有它动，不碰焦点。
     * 打开落点不预展开：没有选中值时它为空，锚点条目只作方向键起点，不带出子列。
     */
    activePath: string[]
    /** roving tabindex 的锚点，同时是方向键与确认键的起点；收起即清空。 */
    focusedPath: string[] | null
    /** 本次展开的落点意图；受控回写走 CONTROLLED.OPEN 时也读得到。 */
    focusIntent: CascaderFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /** 搜索框里的原始串；非空即进搜索视图。收起与选中都会清掉。 */
    inputValue: string
    /** 搜索候选里的虚拟高亮下标，随输入重置为 0。 */
    searchIndex: number
  }
  computed: Record<string, never>
  refs: CascaderRefs
  state: 'open' | 'closed'
  event:
    | { type: 'OPEN', focus?: CascaderFocusIntent }
    | { type: 'TOGGLE', focus?: CascaderFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /**
     * 焦点落到第 level 列的 value 上。展开路径随之被截到第 level 段并换成它，
     * 它的子列开着，右边原有的列一律砍掉。
     *
     * 条目必须是当下露着面的那些之一（连接层保证），否则截出来的路径接不回它的祖先。
     */
    | { type: 'ITEM.FOCUS', level: number, value: string }
    /** 只展开不移焦点：指针划过条目走这条。 */
    | { type: 'ITEM.EXPAND', level: number, value: string }
    /** 持有焦点的条目离开了 DOM：浏览器此时不派 focusout，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    /** 选中一条路径。叶子落值并收起；分支只在 changeOnSelect 打开时落值，且一律不收起。 */
    | { type: 'ITEM.SELECT', path: string[] }
    /** 整体改写选中集合（外部 setValue 走它）。 */
    | { type: 'VALUE.SET', value: string[][] }
    | { type: 'VALUE.CLEAR' }
    /** 整体改写展开路径（外部 setActivePath 走它）。 */
    | { type: 'PATH.SET', path: string[] }
    /** 搜索框输入；随之把候选高亮重置到第 0 条。 */
    | { type: 'INPUT.CHANGE', value: string }
    /** 搜索候选的虚拟高亮换到第 index 条。 */
    | { type: 'SEARCH.HIGHLIGHT', index: number }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple' | 'staysOpenOnSelect'
  action:
    | 'invokeOnOpen'
    | 'invokeOnClose'
    | 'syncOpen'
    | 'setFocusIntent'
    | 'setReturnFocus'
    | 'setInitialFocusedPath'
    | 'setFocusedPath'
    | 'expandPath'
    | 'setActivePath'
    | 'clearFocusedPath'
    | 'selectPath'
    | 'setValue'
    | 'clearValue'
    | 'setInputValue'
    | 'setSearchIndex'
    | 'clearInput'
  effect: 'trackPosition' | 'trackLayer'
}

export interface CascaderApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 作者给的原始树数据。 */
  collection: readonly CascaderNode[]
  /** 当下并排开着的列（含每列的条目）：列数 = 展开路径走得通的段数 + 1。 */
  columns: readonly CascaderColumn[]
  /** 按深度摊开的静态列，与展开路径无关；不该露面的条目由连接层加 hidden 收起。 */
  levels: readonly CascaderLevel[]
  /** 选中路径集合；单选下长度 ≤ 1，形状不随模式变。 */
  value: string[][]
  /** 单选便利读法：选中的那一条路径，无选中时为 null。 */
  valuePath: string[] | null
  /** 选中路径的显示文字（整条路径用分隔符连起来；多选各条之间用逗号）；无选中时为 null。 */
  valueText: string | null
  /** value-text 实际显示的文字：有选中取路径文本，否则取 placeholder。 */
  displayText: string
  /** 展开路径：并排开着哪几列由它决定。 */
  activePath: string[]
  /** 焦点锚点；收起、或它已不在任何可见列里时为 null。 */
  focusedPath: string[] | null
  multiple: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 清空按钮此刻可不可按。 */
  canClear: boolean
  /** 该条目是否是某条选中路径的末项。 */
  isSelected: (value: string) => boolean
  /** 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 */
  isIndeterminate: (value: string) => boolean
  /** 该条目是否落在展开路径上（它的子列开着，或它自己就是最后一站）。 */
  isActive: (value: string) => boolean
  /** 该条目此刻是否落在某个可见列里。 */
  isVisible: (value: string) => boolean
  /** 正处在搜索视图（开了 searchable 且输入非空）：列视图让位给候选列表。 */
  searching: boolean
  /** 搜索框里的原始串。 */
  inputValue: string
  /** 过滤后的候选：整条路径连缀匹配，带 pathKey 与禁用标记。 */
  searchResults: readonly CascaderSearchResult[]
  /** 候选里的虚拟高亮下标（已夹进候选长度）；没有候选为 -1。 */
  searchHighlightIndex: number
  /** 空态占位的文案：实例覆盖并入默认后的完整一份。 */
  translations: CascaderTranslations
  setInputValue: (next: string) => void
  setOpen: (next: boolean) => void
  setValue: (next: string[][]) => void
  setActivePath: (next: string[]) => void
  /** 选中一条路径，与点条目同一语义（分支是否落值仍看 changeOnSelect）。 */
  select: (path: string[]) => void
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
  /** 搜索框：放在 content 顶部；输入即过滤，上下键走候选、Enter 选中、Escape 先清词。 */
  getInputProps: () => T['input']
  /** 候选列表容器；不在搜索视图时带 hidden。 */
  getSearchListProps: () => T['element']
  /** 一条候选：身份是整条路径；点按选中（与点列内条目同一语义）。 */
  getSearchItemProps: (props: CascaderSearchItemProps) => T['element']
  /** 空态占位：当前视图没有条目（搜索无候选，或根列没有条目）时露面，其余时候带 hidden。 */
  getEmptyProps: () => T['element']
  getColumnProps: (props: CascaderColumnProps) => T['element']
  getItemProps: (props: CascaderItemProps) => T['element']
  getItemTextProps: (props: CascaderItemProps) => T['element']
  getItemIndicatorProps: (props: CascaderItemProps) => T['element']
}
