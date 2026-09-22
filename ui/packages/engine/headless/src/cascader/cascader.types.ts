/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 cascader 类型契约。

import type { CascadeStrategy, Cleanup, ControlVariant, Direction, Layer, MachineSchema, OverlayCloseReason, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'

/**
 * 树数据，层级、显示文本与条目禁用的唯一事实源。
 *
 * value 必须全树唯一：它同时是 DOM 身份（data-value）、条目查询的键，以及反查
 * 条目所属列与完整路径的入口。重复的 value 会使反查以先出现的为准。
 *
 * children 为空数组视为叶子，右侧不再打开新列。
 */
export interface CascaderNode {
  value: string
  /** 展示名，也是路径回显的取字来源；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。不向下传导给子节点。 */
  disabled?: boolean
  /**
   * 该条选项自身的性质：已失效的写 danger、需要留意的写 warning。不写即与同列其余条目同档，
   * 也不向下传导给子节点——每一层各自声明。只换字色与悬停 / 按下的面，不表达选中与校验；
   * 展开路径的面、选中的对号与禁用都压过它。搜索结果里取整条路径末段的语气。
   */
  tone?: Tone
  /**
   * 副文本，写入 item-description 部件；未提供时本条不铺该部件。
   * 它是第 2 行的说明，跟着条目走 muted 档，不跟语气；放不下一行的解释才用它，
   * 一句话能说清的写进 label。
   */
  description?: string
  /** 子节点。非空数组才视为分支（右侧可以再打开一列）。 */
  children?: CascaderNode[]
}

/** 候选部件的声明：代表哪条完整路径。 */
export interface CascaderSearchItemProps {
  path: string[]
}

/** 一条过滤后的候选。 */
export interface CascaderSearchResult {
  path: string[]
  /** 整条路径逐段的显示名。 */
  labels: string[]
  /** 路径上任何一段禁用即整条禁用，点击不落值。 */
  disabled: boolean
  /** cascaderPathKey(path)，作为 DOM id 与比较键。 */
  key: string
}

/** 单个条目的元信息，由 collection 推导，不含选中态与展开态。 */
export interface CascaderNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** children 是非空数组即为分支。 */
  branch: boolean
  /** 所在列序号，0 起算。 */
  level: number
  /** 从根到它（含自身）的完整路径，选中时写入 value。 */
  path: readonly string[]
  /** 该条自己写的语气；未提供时为 null，不从父节点继承。 */
  tone: Tone | null
  /** 副文本；未提供时为 null。 */
  description: string | null
}

/** 当前并排展开的一列。 */
export interface CascaderColumn {
  /** 列序号，0 起算；根列恒为 0。 */
  level: number
  /** 生成该列的父节点路径；根列为空数组。 */
  parentPath: readonly string[]
  items: readonly CascaderNodeMeta[]
}

/**
 * 按深度展开的静态列：第 L 层的全部节点，与展开路径无关。
 * 作者据此编写标记（每层一个 column，层内节点各一个 item），当前显示哪些条目由连接层用 hidden 收口。
 */
export interface CascaderLevel {
  level: number
  items: readonly CascaderNodeMeta[]
}

/**
 * 展开时焦点落在哪一个条目：
 * - selected 停在选中路径的末项（它已禁用时回退为所在列的首个可停留条目；无选中则不落
 *   锚点、列也不铺设，焦点停在 content 上：指针打开走这条，不能有条目看似被选中）
 * - first / last 从根列两端进入（键盘确认键在无选中时走 first）
 * - next / prev 从选中路径的末项在所在列中移动一步
 */
export type CascaderFocusIntent = 'selected' | 'first' | 'last' | 'next' | 'prev'

/** 子列的展开方式：点击条目，或指针划过条目。键盘一律使用右方向键，不受该开关影响。 */
export type CascaderExpandTrigger = 'click' | 'hover'

/**
 * 选中路径。单条路径（`['zhejiang','hangzhou']`）是简写，内部一律归一为路径集合
 * （`[['zhejiang','hangzhou']]`）。空数组即无选中。
 */
export type CascaderValue = readonly string[] | readonly (readonly string[])[]

/** 空态占位的内建文案，默认英文。 */
export interface CascaderTranslations {
  /** collection 为空（根列没有条目）时的占位文案。 */
  empty: string
  /** 搜索无匹配（候选为空）时的占位文案。 */
  noMatch: string
  /** 首次取数且当前视图没有候选时的在途文案。 */
  loading: string
  /** 没有父条目可指向的列（根列与收起的列）的兜底名字，两个名字部件都未渲染时才使用。 */
  column: string
  /** 检索框的可及名：字段标签命名的是整个控件，浮层中的该框需要单独命名。 */
  searchInput: string
  /** 搜索结果列表的可及名：它没有可指向的标题部件，只能自带名字。 */
  searchList: string
  /** 清空按钮的可及名。 */
  clearTrigger: string
}

// 适配器在挂载前填入 DOM 环境、定位引擎与元素 getter；缺省时副作用短路，机器状态照常转移。
export interface CascaderRefs {
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
  /** 焦点域容器、消解层节点，同时是条目集合的查询容器（各列都位于其中）。 */
  getContentEl: () => HTMLElement | null
}

export interface CascaderOpenChangeDetails {
  open: boolean
  /**
   * 本次关闭的原因；展开时不带。
   * 用于区分用户主动取消与选完自动收起，前者常需要回滚草稿。
   */
  reason?: OverlayCloseReason
}

export interface CascaderValueChangeDetails {
  /** 选中路径集合。单选下也是数组（长度 ≤ 1），形状不随模式变化。 */
  value: string[][]
}

/** 条目的声明：只声明值。所在列、完整路径、禁用与标签一律从 collection 查询。 */
export interface CascaderItemProps {
  value: string
}

/** 分组声明的身份：分组标题的 id 由它派生，group 与 group-label 依靠该值互相关联。 */
export interface CascaderGroupProps {
  value: string
}

/** 列的声明：只声明层号。列中有哪些条目、该列当前是否显示，都由连接层计算。 */
export interface CascaderColumnProps {
  level: number
}

/** 接了按压通道的三个部件：列内条目按 value 记、检索候选按整条路径的键记，清空按钮只记部件。 */
export type CascaderPressedPart = 'item' | 'search-item' | 'clear-trigger'

export interface CascaderSchema extends MachineSchema {
  props: {
    /** 树数据，层级元信息与显示文本的唯一事实源。默认为空树。 */
    collection?: CascaderNode[]
    /**
     * 选中路径。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。
     * 单条路径是简写，内部一律归一为路径集合。
     */
    value?: CascaderValue
    defaultValue?: CascaderValue
    /** 原生字段名，每条选中路径提交一项 JSON 字符串数组。 */
    name?: string
    /** 关联的原生表单 ID；指定后覆盖祖先表单归属。 */
    form?: string
    /** 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 */
    open?: boolean
    defaultOpen?: boolean
    /** 子列的展开方式，默认 click。 */
    expandTrigger?: CascaderExpandTrigger
    /** 中间层（分支）也可以落值。关闭时点击分支只展开子列，不改变选中值。 */
    changeOnSelect?: boolean
    /** 多选：选中为路径集合，选中后浮层不收起、焦点留在列中以便继续选择。 */
    multiple?: boolean
    /** 开启搜索：input 部件可用，输入后整条路径连缀过滤、候选替换列视图。 */
    searchable?: boolean
    /**
     * 多选下父子级联勾选：点击分支整枝传导、子全勾父勾、部分勾选半选，
     * 禁用子树整棵冻结。默认 false（按路径原样切换）；单选下无效。
     */
    cascade?: boolean
    /** 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾选节点。 */
    checkedStrategy?: CascadeStrategy
    /** 整个控件禁用：trigger 使用原生 disabled，浮层不可展开。 */
    disabled?: boolean
    /** 只读：浮层照常展开与浏览，但选中值不可修改、也不可清空。 */
    readOnly?: boolean
    /** 校验失败：trigger 报告 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 候选加载中：浮层报告 aria-busy；当前视图无候选时显示在途占位。 */
    loading?: boolean
    /** 空态占位的文案覆盖，默认英文。 */
    translations?: Partial<CascaderTranslations>
    /** 形态：outline / subtle / ghost，决定触发框的描边与底色使用方式。默认 outline。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定触发框与条目的几何档位。 */
    size?: Size
    /** 无选中时 value-text 显示的占位文字。 */
    placeholder?: string
    /** 路径回显的连接符，默认 ' / '。 */
    separator?: string
    placement?: Placement
    offset?: number
    /** 列内上下键到达首尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只对调左右方向键的进入子列 / 返回上一列语义。 */
    dir?: Direction
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: CascaderValueChangeDetails) => void
    /** open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onOpenChange?: (details: CascaderOpenChangeDetails) => void
  }
  context: {
    /** 定位引擎回填的最新结果；connect 只读取它，不涉及 DOM 也不调用引擎。 */
    position: PositionResult | null
    /** 选中路径集合，恒为数组的数组。受控（value 提供）时 cell 直读 prop。 */
    value: string[][]
    /**
     * 展开路径：并排打开哪几列由它决定（列数 = 它可走通的段数 + 1），与选中值互相独立。
     * 键盘导航下恒等于焦点路径；指针悬停展开时只有它变化，不影响焦点。
     * 打开落点不预展开：没有选中值时它为空，锚点条目只作方向键起点，不带出子列。
     */
    activePath: string[]
    /** roving tabindex 的锚点，同时是方向键与确认键的起点；收起即清空。 */
    focusedPath: string[] | null
    /** 本次展开的落点意图；受控回写经 CONTROLLED.OPEN 时也可读取。 */
    focusIntent: CascaderFocusIntent
    /** 关闭时是否把焦点归还 trigger；Tab 与层外交互关闭时为 false。 */
    returnFocus: boolean
    /** 搜索框中的原始串；非空即进入搜索视图。收起与选中都会清除它。 */
    inputValue: string
    /** 搜索候选里的虚拟高亮下标，随输入重置为 0。 */
    searchIndex: number
    /** 按压通道：Space / Enter 或触屏按住的是列内条目、检索候选还是清空按钮。 */
    pressedPart: CascaderPressedPart | null
    /** 按压通道：按住的条目 value 或候选路径键；clear-trigger 没有值，记 null。抬起、失焦或浮层收起即清空。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: CascaderRefs
  state: 'open' | 'closed'
  event:
    | { type: 'FORM.RESET' }
    | { type: 'OPEN', focus?: CascaderFocusIntent }
    | { type: 'TOGGLE', focus?: CascaderFocusIntent }
    | { type: 'CLOSE', src?: 'esc' | 'tab' | 'interact-outside' }
    // 受控回写：宿主改 open prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.OPEN' }
    | { type: 'CONTROLLED.CLOSE' }
    /**
     * 焦点落到第 level 列的 value 上。展开路径随之截断到第 level 段并替换为它，
     * 它的子列打开，右侧原有的列一律移除。
     *
     * 条目必须是当前显示的条目之一（连接层保证），否则截出的路径无法接回它的祖先。
     */
    | { type: 'ITEM.FOCUS', level: number, value: string }
    /** 只展开不移动焦点：指针划过条目走这条路径。 */
    | { type: 'ITEM.EXPAND', level: number, value: string }
    /** 持有焦点的条目离开了 DOM：浏览器此时不派发 focusout，由适配器如实上报。 */
    | { type: 'ITEM.LOST' }
    /** 选中一条路径。叶子落值并收起；分支只在 changeOnSelect 开启时落值，且一律不收起。 */
    | { type: 'ITEM.SELECT', path: string[] }
    /** 整体改写选中集合（外部 setValue 经过它）。 */
    | { type: 'VALUE.SET', value: string[][] }
    | { type: 'VALUE.CLEAR' }
    /** 整体改写展开路径（外部 setActivePath 经过它）。 */
    | { type: 'PATH.SET', path: string[] }
    /** 搜索框输入；随之把候选高亮重置到第 0 条。 */
    | { type: 'INPUT.CHANGE', value: string }
    /** 搜索候选的虚拟高亮切换到第 index 条。 */
    | { type: 'SEARCH.HIGHLIGHT', index: number }
    /**
     * 条目、检索候选或清空按钮被 Space / Enter 或触屏按住。候选的键盘按压由检索框代发（焦点恒在检索框，
     * 高亮候选自己收不到按键）；disabled 是条目自身的禁用事实，由 connect 判定后随事件带入。
     */
    | { type: 'PRESS.START', part: CascaderPressedPart, value?: string, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 part + value 对应的那一个。 */
    | { type: 'PRESS.END', part: CascaderPressedPart, value?: string }
  tag: never
  guard: 'isOpenControlled' | 'isMultiple' | 'staysOpenOnSelect' | 'canPress'
  action:
    | 'resetToDefault'
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
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseWhenInert'
  effect: 'trackPosition' | 'trackLayer'
}

export interface CascaderApi<T extends PropTypes = PropTypes> {
  open: boolean
  /** 作者提供的原始树数据。 */
  collection: readonly CascaderNode[]
  /** 当前并排打开的列（含每列的条目）：列数 = 展开路径可走通的段数 + 1。 */
  columns: readonly CascaderColumn[]
  /** 按深度展开的静态列，与展开路径无关；不应显示的条目由连接层加 hidden 收起。 */
  levels: readonly CascaderLevel[]
  /** 选中路径集合；单选下长度 ≤ 1，形状不随模式变化。 */
  value: string[][]
  /** 单选便利读法：选中的路径，无选中时为 null。 */
  valuePath: string[] | null
  /** 选中路径的显示文字（整条路径用分隔符连接；多选各条之间用逗号）；无选中时为 null。 */
  valueText: string | null
  /** value-text 实际显示的文字：有选中时取路径文本，否则取 placeholder。 */
  displayText: string
  /** 展开路径：并排打开哪几列由它决定。 */
  activePath: string[]
  /** 焦点锚点；收起、或它已不在任何可见列中时为 null。 */
  focusedPath: string[] | null
  multiple: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 清空按钮当前是否可按。 */
  canClear: boolean
  /** 该条目是否为某条选中路径的末项。 */
  isSelected: (value: string) => boolean
  /** 级联模式下该分支是否半选（有效叶后代部分勾选）；非级联恒为 false。 */
  isIndeterminate: (value: string) => boolean
  /** 该条目是否落在展开路径上（它的子列已打开，或它自身即为最后一站）。 */
  isActive: (value: string) => boolean
  /** 该条目当前是否落在某个可见列中。 */
  isVisible: (value: string) => boolean
  /** 正处于搜索视图（开启 searchable 且输入非空）：列视图让位给候选列表。 */
  searching: boolean
  /** 搜索框中的原始串。 */
  inputValue: string
  /** 过滤后的候选：整条路径连缀匹配，带 pathKey 与禁用标记。 */
  searchResults: readonly CascaderSearchResult[]
  /** 候选中的虚拟高亮下标，恒落在一条可选候选上；没有候选或整批禁用时为 -1。 */
  searchHighlightIndex: number
  /** 空态占位的文案：实例覆盖并入默认后的完整一份。 */
  translations: CascaderTranslations
  setInputValue: (next: string) => void
  setOpen: (next: boolean) => void
  setValue: (next: string[][]) => void
  setActivePath: (next: string[]) => void
  /** 选中一条路径，与点击条目同一语义（分支是否落值仍取决于 changeOnSelect）。 */
  select: (path: string[]) => void
  clear: () => void
  getRootProps: () => T['element']
  /** 每条路径独立编码，适配器按 value 渲染重复同名字段。 */
  getHiddenInputProps: (props: { path: readonly string[] }) => T['input']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  getTriggerProps: () => T['button']
  getValueTextProps: () => T['element']
  getIndicatorProps: () => T['element']
  getClearTriggerProps: () => T['button']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 搜索框：放在 content 顶部；输入即过滤，上下键移动候选、Enter 选中、Escape 先清除输入。 */
  getInputProps: () => T['input']
  /** 候选列表容器；不在搜索视图时带 hidden。 */
  getSearchListProps: () => T['element']
  /** 一条候选：身份是整条路径；点击选中（与点击列内条目同一语义）。 */
  getSearchItemProps: (props: CascaderSearchItemProps) => T['element']
  /** 空态占位：当前视图没有条目（搜索无候选，或根列没有条目）时显示，其余时候带 hidden。 */
  getEmptyProps: () => T['element']
  /**
   * 在途占位：当前视图无候选且正在取数时显示；已有候选或祖先列时只保留 aria-busy。
   * 适配器自动提供默认部件，作者显式编写部件即可替换它。
   */
  getLoadingProps: () => T['element']
  /** 浮层底部的操作区：放在 content 中、与列并列，不进入任何一列的拥有关系，方向键也无法到达。 */
  getFooterProps: () => T['element']
  /** 分组容器：role=group，条目挂在其中；分组标题经 aria-labelledby 关联。 */
  getGroupProps: (props: CascaderGroupProps) => T['element']
  /** 分组标题：不是条目、不进入导航，只作为本组的可及名。 */
  getGroupLabelProps: (props: CascaderGroupProps) => T['element']
  getColumnProps: (props: CascaderColumnProps) => T['element']
  getItemProps: (props: CascaderItemProps) => T['element']
  getItemTextProps: (props: CascaderItemProps) => T['element']
  getItemDescriptionProps: (props: CascaderItemProps) => T['element']
  getItemSuffixProps: (props: CascaderItemProps) => T['element']
  getItemIndicatorProps: (props: CascaderItemProps) => T['element']
}
