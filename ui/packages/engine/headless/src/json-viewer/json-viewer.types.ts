/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 json viewer 类型契约。

import type { Direction, MachineSchema, PropTypes, Size } from '@xihan-ui/core'

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

/** 外框形态：surface 带描边与底色，plain 只保留内容。 */
export type JsonViewerVariant = 'plain' | 'surface'

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
}

export interface JsonViewerSchema extends MachineSchema {
  props: {
    /** 要展示的值，任意形状。未提供时为空视图（不展开任何行）。 */
    value?: unknown
    /**
     * 展示形态，默认 tree。
     * text 档直接输出 JSON 原文：整块可框选可复制，且不受 maxStringLength / maxItems 折减：
     * 目的是与后端下发的内容完全一致。展开集合与键盘导航在该档上不生效。
     */
    view?: JsonViewerView
    /** 外框形态：surface 带描边与底色（默认），plain 去掉描边与底色，只保留内容。 */
    variant?: JsonViewerVariant
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
    translations?: Partial<JsonViewerTranslations>
    onExpandedValueChange?: (details: JsonViewerExpandedValueChangeDetails) => void
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
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 展开态不编码进状态，状态机因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写展开集合（'*' 展开同级、外部 setExpandedValue 都经过它）。 */
    | { type: 'EXPANDED.SET', value: string[] }
    | { type: 'BRANCH.EXPAND', value: string }
    | { type: 'BRANCH.COLLAPSE', value: string }
    | { type: 'BRANCH.TOGGLE', value: string }
    | { type: 'NODE.FOCUS', value: string }
    /** 焦点离开视图，或持有焦点的行被移出 DOM。锚点保留，只取消高亮。 */
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
  /** 无法展开任何一行：value 未提供或为 undefined。空态部件随它显隐。 */
  isEmpty: boolean
  /** 空态的兜底文案，作者未向空态部件写入内容时铺设它。 */
  emptyText: string
  /** 缩进后的 JSON 原文；键序与环路记号与树档一致。text 档之外也可获取，便于作者实现复制原文。 */
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
  getEmptyProps: () => T['element']
}
