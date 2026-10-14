/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 json viewer 类型契约。

import type { ControlVariant, Direction, MachineSchema, PropTypes, Size } from '@xihan-ui/core'
import type { HighlightSegment } from '../highlight/highlight.split'

/**
 * 值的类型标签，直接写入 data-value-type 供皮肤逐类型上色。
 * 六个取值覆盖 JSON 能表达的全部形状；JSON 之外的值归到最接近的一档：
 * undefined 归 null，bigint 归 number，函数与 symbol 归 string。
 */
export type JsonViewerValueType = 'array' | 'boolean' | 'null' | 'number' | 'object' | 'string'

/**
 * 展平后的一行。层级三项（level / posInSet / setSize）由展平计算，
 * 连接层据此产出 aria-level / aria-posinset / aria-setsize。
 */
export interface JsonViewerNode {
  /**
   * 该行的路径，全树唯一：既是 DOM 身份（data-value），也是展开集合的元素。
   * 形如 `$["user"]["tags"][0]`，根为 `$`。
   */
  value: string
  /** 对象键或数组下标；根行与截断占位行没有键名，为 null。 */
  key: string | null
  type: JsonViewerValueType
  /** 叶子行的值文本（字符串带引号，循环引用为 `[Circular]`）；分支行为空串。 */
  text: string
  /** 对象或数组且成员非空、且不是循环引用，才视为分支：空对象展开后没有内容。 */
  branch: boolean
  /** 分支行的成员个数；截断占位行是被折叠的剩余个数；其余为 0。 */
  count: number
  /** 1 起算，直接写入 aria-level。 */
  level: number
  /** 同层内序号，1 起算，直接写入 aria-posinset。 */
  posInSet: number
  /** 同层总数，直接写入 aria-setsize。 */
  setSize: number
  /** 父行路径；根行为 null。左方向键依靠它跳回上一层。 */
  parent: string | null
  /** 该值出现在自身的祖先链上，继续展开会无限递归。 */
  circular: boolean
  /** 该行是其余 N 项的占位，不对应任何真实成员。 */
  truncated: boolean
}

/** 展平时改变结果形状的选项，三个都不提供即原样展开。 */
export interface JsonViewerWalkOptions {
  /** 字符串值超过该字符数即截断并补省略号；未提供时不截断。 */
  maxStringLength?: number
  /** 同一层最多展开该数量的成员，其余收为一行占位；未提供时全部展开。 */
  maxItems?: number
  /** 对象键按字典序排列；数组顺序不受影响。 */
  sortKeys?: boolean
}

export interface JsonViewerFlattenOptions extends JsonViewerWalkOptions {
  /** 展开集合：只有在其中的分支才把子行展平进结果。 */
  expandedValue?: Iterable<string>
}

export interface JsonViewerExpandedValueChangeDetails {
  value: string[]
}

/** 行的声明：只声明路径。类型、键名与层级一律从展平结果查询，那是唯一事实源。 */
export interface JsonViewerNodeProps {
  value: string
}

/** 展示形态：tree 展平为可折叠的行，text 直接输出缩进后的 JSON 原文。 */
export type JsonViewerView = 'tree' | 'text'

export interface JsonViewerViewChangeDetails {
  view: JsonViewerView
}

export interface JsonViewerWrapChangeDetails {
  wrap: boolean
}

export interface JsonViewerCopyErrorDetails {
  /** 写入失败的原因：权限被拒或非安全上下文时是浏览器返回的拒绝值，接口缺席时是本组件合成的 Error。 */
  error: unknown
  /** 本次尝试写入剪贴板的文本。 */
  value: string
}

/**
 * 内建工具条里的一项工具。
 * - `expand`：「展开全部」与「收起全部」两颗钮，只在树档出现；
 * - `wrap`：原文自动换行的开关，只在原文档出现；
 * - `copy`：把 JSON 原文写进剪贴板；
 * - `view`：在树与原文之间切换的开关。
 */
export type JsonViewerTool = 'expand' | 'wrap' | 'copy' | 'view'

/** 工具条里各颗钮的部件名，按压通道据此记「正被按住的那一颗」。 */
export type JsonViewerToolTrigger
  = | 'expand-all-trigger'
    | 'collapse-all-trigger'
    | 'wrap-trigger'
    | 'copy-trigger'
    | 'view-trigger'

/** 写入剪贴板的相位：在途为 copying，成功后在停留窗口内为 copied。 */
export type JsonViewerCopyStatus = 'idle' | 'copying' | 'copied'

/**
 * 原文档里一段文字的类别，与树档的着色一一对应：键名、四种标量与标点。
 * 写进 token 部件的 data-kind，皮肤按它上色。
 */
export type JsonViewerTokenKind = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation'

/** 原文档切出来的一段。kind 为 null 的是空白，或解析不了的原文整段，按纯文本铺、不着色。 */
export interface JsonViewerTextSegment {
  text: string
  kind: JsonViewerTokenKind | null
}

export interface JsonViewerTokenProps {
  kind: JsonViewerTokenKind
}

/** 读屏与界面上的文案，默认英文。 */
export interface JsonViewerTranslations {
  /** 原文视图区域的可及名：它是一整块可滚动的文本，不提供名字时读屏无法朗读其含义。 */
  text: string
  /** 树容器的可及名：它是一组行的集合，没有可见标题，不提供名字时读屏只朗读「树」。 */
  tree: string
  /** 根行的可及名：整份 JSON 的最外层没有键名，读屏无法朗读该行的含义。 */
  root: string
  /** 收起的对象摘要，只出现在屏幕上：括号与省略号是排版记号，preview 部件对读屏隐藏。 */
  objectPreview: (count: number) => string
  /** 收起的数组摘要，语义同上。 */
  arrayPreview: (count: number) => string
  /**
   * 收起的分支的可及名：括号摘要对读屏隐藏，成员数只能由这一句朗读。
   * 参数是该行的名字（键名，根行取 root 文案）与成员个数。
   */
  collapsedBranchLabel: (name: string, count: number) => string
  /** 超过 maxItems 被折叠的剩余项占位文字。 */
  moreItems: (count: number) => string
  /** 无法展开任何一行时的兜底文案，作者向空态部件写入内容后即不使用它。 */
  empty: string
  /** 内建工具条的可及名：它与树、原文是两块不同的区域，没有名字时读屏只念「组」。 */
  toolbar: string
  /** 「展开全部」钮的可及名：钮里只有一个字形。 */
  expandAll: string
  /** 「收起全部」钮的可及名，语义同上。 */
  collapseAll: string
  /** 原文自动换行开关的可及名；开没开由 aria-pressed 报，名字不随之变化。 */
  wrap: string
  /** 复制钮的可及名。 */
  copy: string
  /** 复制成功后播报区朗读的语句。 */
  copied: string
  /** 原文开关的可及名；按下即原文档，开没开由 aria-pressed 报。 */
  viewText: string
}

export interface JsonViewerSchema extends MachineSchema {
  props: {
    /** 要展示的值，任意形状。未提供时为空视图（不展开任何行）。 */
    value?: unknown
    /**
     * 展示形态。提供即受控：cell 直读 prop，原文开关只发 onViewChange 不落内部值。
     * text 档直接输出 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减：
     * 目的是与后端下发的内容完全一致。展开集合与键盘导航在该档上不生效。
     */
    view?: JsonViewerView
    /** 非受控初值，默认 tree。 */
    defaultView?: JsonViewerView
    /**
     * 值的原文（如后端下发的那段 JSON 文本）。提供时原文档与复制钮一律取它：能解析成 JSON 就只按两格缩进重排，
     * 数字、字符串等字面量一字不改；解析不了就原样。value 是解析过的值，超出安全整数的数字已经失真，
     * 原文才是与后端一致的那一份。不提供时由 value 序列化。树档照旧展示 value。
     */
    source?: string
    /** 原文档是否自动换行。提供即受控，写入只发 onWrapChange。缺省不换行：长行横向滚动，缩进不被折乱。 */
    wrap?: boolean
    /** 非受控初值，默认 false。 */
    defaultWrap?: boolean
    /**
     * 内建工具条：不提供即没有工具条；true 铺出全部工具；数组只铺列出的几项。
     * 钮的排列由组件定（展开 / 收起、换行、复制、原文开关依次排在条的末端），与数组顺序无关；
     * 数组里出现未知的工具名即抛错。
     */
    tools?: boolean | readonly JsonViewerTool[]
    /** 外框形态：outline 带描边与底色（默认），subtle 淡底无描边，ghost 去掉描边与底色只保留内容。 */
    variant?: ControlVariant
    /** 展开集合（元素是行路径）。提供即受控：cell 直读 prop，写入只发 onExpandedValueChange 不落内部值。 */
    expandedValue?: string[]
    /** 非受控初值；未提供时按 defaultExpandedDepth 计算。 */
    defaultExpandedValue?: string[]
    /** 初始展开到第几层（层级号不超过它的分支全部展开），默认 1，即只展开根行。 */
    defaultExpandedDepth?: number
    /** 字符串值超过该字符数即截断并补省略号；未提供时不截断。 */
    maxStringLength?: number
    /** 同一层最多展开该数量的成员，其余收为一行占位；未提供时全部展开。 */
    maxItems?: number
    /** 对象键按字典序排列；数组顺序不受影响。 */
    sortKeys?: boolean
    /** 上下键到达首尾是否回绕，默认 false。 */
    loop?: boolean
    /** 文字方向，只对调左右方向键的展开 / 收起语义；未提供时从 DOM 读取。 */
    dir?: Direction
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /**
     * 搜索词：键名与值文本里含有它（不区分大小写）的行即为命中。
     * 命中行的祖先分支自动展开（写进展开集合），命中片段由作者按 `api.segments` 铺成 mark 部件。
     * 空串与只含空白视为没有搜索。
     */
    search?: string
    translations?: Partial<JsonViewerTranslations>
    onExpandedValueChange?: (details: JsonViewerExpandedValueChangeDetails) => void
    /** 原文开关切换了展示形态；受控时由宿主据此回写 view。 */
    onViewChange?: (details: JsonViewerViewChangeDetails) => void
    /** 换行开关切换了原文档的换行；受控时由宿主据此回写 wrap。 */
    onWrapChange?: (details: JsonViewerWrapChangeDetails) => void
    /** 复制钮写入剪贴板失败时通知；此时复制钮已回到常态，不留下「已复制」的假象。 */
    onCopyError?: (details: JsonViewerCopyErrorDetails) => void
  }
  context: {
    /**
     * 展开集合。受控（expandedValue 提供）时 cell 直读 prop。
     * null = 尚未修改过，读取时按当前的 value 与 defaultExpandedDepth 计算。
     */
    expandedValue: string[] | null
    /** roving tabindex 的锚点行。焦点离开视图后仍保留，Tab 回来时落回上次的行。 */
    focusedValue: string | null
    /** 焦点当前是否在视图内。只影响高亮，不影响锚点。 */
    focusWithin: boolean
    /**
     * 按压通道：正被 Space / Enter 或触屏手指按住的分支行的路径，该行的 branch-control 投影 data-pressed；
     * 没有按住时为 null。抬起、失焦或指针取消时撤下；与展开集合、焦点锚点互相独立。
     */
    pressedValue: string | null
    /** 在命中之间逐个走时停在哪一行；搜索词一变就回到未选。它投影 data-current，并被滚进视野。 */
    activeMatch: string | null
    /** 展示形态。受控（view 提供）时 cell 直读 prop。 */
    view: JsonViewerView
    /** 原文档是否自动换行。受控（wrap 提供）时 cell 直读 prop。 */
    wrap: boolean
    /** 工具条的按压通道：正被 Space / Enter 或触屏手指按住的那一颗钮，没有按住时为 null。与分支行的 pressedValue 互相独立。 */
    pressedTool: JsonViewerToolTrigger | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /**
   * 展开态不编码进状态，树的逻辑全在 context 与 actions；
   * 状态只记复制钮的写入相位：写入在途（copying）与成功后的停留窗口（copied）。
   */
  state: JsonViewerCopyStatus
  event:
    /** 整体改写展开集合（'*' 展开同级、外部 setExpandedValue 都经过它）。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    | { type: 'NODE.FOCUS', value: string }
    /** 焦点离开视图，或持有焦点的行被移出 DOM。锚点保留，只取消高亮。 */
    | { type: 'VIEWER.BLUR' }
    /** 按压通道（shared/press）：某个分支行被 Space / Enter 或触屏按住。视图没有禁用态，一律接。 */
    | { type: 'PRESS.START', value: string }
    /** 该分支行抬起、失焦或指针取消。 */
    | { type: 'PRESS.END', value: string }
    /** 停到某一条命中上（null 即不停在任何一条）。 */
    | { type: 'MATCH.SET', value: string | null }
    /** 搜索词或数据变了：展开命中行的祖先，并回到未选。 */
    | { type: 'SEARCH.SYNC' }
    /** 原文开关或外部 setView 改写展示形态。 */
    | { type: 'VIEW.SET', view: JsonViewerView }
    /** 换行开关或外部 setWrap 改写原文档的换行。 */
    | { type: 'WRAP.SET', wrap: boolean }
    /** 点了复制钮，或作者调用 api.copy()。写入在途时（copying）不接受，避免同一次点击写入两遍。 */
    | { type: 'COPY.TRIGGER' }
    /** 写入 promise 兑现，由 copying 的副作用回送。 */
    | { type: 'COPY.SUCCESS' }
    /** 写入 promise 拒绝，由 copying 的副作用回送；value 是发起时定死的文本。 */
    | { type: 'COPY.ERROR', error: unknown, value: string }
    /** 「已复制」的停留计时到期，复制钮回到常态。 */
    | { type: 'after.timeout' }
    /** 工具条的按压通道：某颗钮被 Space / Enter 或触屏按住。 */
    | { type: 'TOOL.PRESS.START', part: JsonViewerToolTrigger }
    /** 该颗钮抬起、失焦或指针取消。 */
    | { type: 'TOOL.PRESS.END', part: JsonViewerToolTrigger }
  tag: never
  guard: never
  action:
    | 'setExpanded'
    | 'expandBranch'
    | 'collapseBranch'
    | 'toggleBranch'
    | 'setFocusedValue'
    | 'clearFocusWithin'
    | 'startPress'
    | 'endPress'
    | 'syncSearch'
    | 'revealMatches'
    | 'setActiveMatch'
    | 'scrollToActiveMatch'
    | 'setView'
    | 'setWrap'
    | 'invokeCopyError'
    | 'startToolPress'
    | 'endToolPress'
  effect: 'writeText' | 'trackCopiedTimeout'
}

export interface JsonViewerApi<T extends PropTypes = PropTypes> {
  /**
   * 当前可见行序列（收起分支的子行不在其中）。
   * 方向键、Home/End 都在它上面移动，适配器也按它铺设 DOM。
   */
  visibleNodes: readonly JsonViewerNode[]
  expandedValue: string[]
  /**
   * roving tabindex 的锚点行：焦点在树内时即当前行，焦点离开后仍保留（Tab 回来时落回它）；
   * 它已随分支收起而不再可见时为 null。
   */
  focusedValue: string | null
  /** 焦点当前是否在树内。行的高亮标记随它变化，锚点不随之变化。 */
  isFocusWithin: boolean
  isExpanded: (value: string) => boolean
  /** 分支收起摘要的显示文字（如 `{…} 3`），只用于视觉；叶子行返回空串。 */
  previewText: (node: JsonViewerNode) => string
  /** 值的显示文字；截断占位行返回其余 N 项的文案。 */
  valueText: (node: JsonViewerNode) => string
  setExpandedValue: (next: string[]) => void
  expand: (value: string) => void
  collapse: (value: string) => void
  toggle: (value: string) => void
  /** 当前生效的展示形态。 */
  view: JsonViewerView
  /** 原文档当前是否自动换行。 */
  wrap: boolean
  /** 工具条上铺的工具，按条上的排列顺序；没有工具条时为空。 */
  tools: readonly JsonViewerTool[]
  /** 复制钮的写入相位。 */
  copyStatus: JsonViewerCopyStatus
  /** 已复制成功且仍在停留窗口内：复制钮换成对钩、播报区念出成功回执的唯一判据。 */
  copied: boolean
  /** 播报区该念的语句；未到已复制档时为空串。 */
  announcement: string
  setView: (view: JsonViewerView) => void
  setWrap: (wrap: boolean) => void
  /** 展开全部分支（maxItems 折掉的成员与循环引用照旧不展开）。 */
  expandAll: () => void
  /** 收起到只剩顶层：根行留着展开，其下的分支全部收起。 */
  collapseAll: () => void
  /** 把 JSON 原文写进剪贴板，与点复制钮走同一路径。 */
  copy: () => void
  /** 无法展开任何一行：value 未提供或为 undefined。空态部件随它显隐。 */
  isEmpty: boolean
  /** 空态的兜底文案，作者未向空态部件写入内容时铺设它。 */
  emptyText: string
  /** 原文档展示、复制钮写入的那份文本：提供了 source 时是它重排缩进后的样子，否则由 value 序列化（键序与环路记号与树档一致）。 */
  text: string
  /**
   * 原文按类别切成的段，依次拼接恒等于 text：键名、标量与标点各成一段，铺成 token 部件着色，空白按纯文本铺。
   * 原文解析不了时整段一个不着色的段。只在原文档切分，树档为空：树档用不上，不白算一遍。
   */
  textSegments: readonly JsonViewerTextSegment[]
  /** 命中搜索词的行路径，按树序排列；没有搜索时为空。 */
  searchMatches: readonly string[]
  /** 在命中之间逐个走时停在哪一行；没有时为 null。 */
  activeMatch: string | null
  /** 停到下一条命中（走到末尾回到第一条），并把它滚进视野。 */
  nextMatch: () => void
  /** 停到上一条命中（走到开头回到最后一条），并把它滚进视野。 */
  prevMatch: () => void
  setActiveMatch: (value: string | null) => void
  /**
   * 键名按搜索词切成的片段，依次拼接恒等于键名；命中的片段铺成 mark 部件。
   * 没有搜索或没有键名时整段是一个不命中的片段。
   */
  keySegments: (node: JsonViewerNode) => readonly HighlightSegment[]
  /** 值文本（即 valueText）按搜索词切成的片段；截断占位行的文案不参与命中。 */
  valueSegments: (node: JsonViewerNode) => readonly HighlightSegment[]
  getRootProps: () => T['element']
  getTreeProps: () => T['element']
  getTextProps: () => T['element']
  /** 原文档里有类别的一段（键名、标量、标点），带 data-kind 供皮肤按树档同一套颜色着色。 */
  getTokenProps: (props: JsonViewerTokenProps) => T['element']
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
  getEmptyProps: () => T['element']
  /** 键名与值文本里命中搜索词的那一段。 */
  getMarkProps: () => T['element']
  /**
   * 内建工具条：根的第一个孩子，各颗钮按 tools 铺在其中。
   * 报告 `role=group`：一组有名字的控件，每颗钮各占一个 Tab 位；
   * 不报告 `role=toolbar`，那个角色承诺条内靠方向键移动。
   */
  getToolbarProps: () => T['element']
  getExpandAllTriggerProps: () => T['button']
  getCollapseAllTriggerProps: () => T['button']
  getWrapTriggerProps: () => T['button']
  getCopyTriggerProps: () => T['button']
  getViewTriggerProps: () => T['button']
  /** 复制成功的播报区：视觉隐藏的 polite 实时区，只要有复制钮就常驻，内容取 announcement。 */
  getStatusProps: () => T['element']
}
