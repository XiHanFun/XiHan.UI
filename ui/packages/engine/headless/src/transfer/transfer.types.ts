/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 transfer 类型契约。

import type { Direction, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 所在侧。source 是尚未选入的，target 是已选入的；
 * value 这个 prop 描述的即 target 侧的条目，与两侧的勾选（selection）是两个概念。
 */
export type TransferSide = 'source' | 'target'

/** 一侧的整体勾选态：全选 / 半选 / 未勾选。select-all-trigger 的 aria-checked 由它翻译。 */
export type TransferCheckState = 'checked' | 'indeterminate' | 'unchecked'

/**
 * 条目全集中的一条，是元信息的唯一事实源：标签与禁用都从这里读取，作者的标记只负责外观。
 * value 必须全集唯一：它同时是 DOM 身份（data-value）、value / selection 集合的元素，
 * 以及连接层按值查找节点的键。
 */
export interface TransferItem {
  value: string
  /** 展示名，也是搜索过滤的取字来源。 */
  label: string
  /** 条目禁用：不可勾选、也不可移动，但它仍可聚焦、仍是方向键的起点。 */
  disabled?: boolean
  /**
   * 该条自身的性质：已失效的写 danger、需要留意的写 warning。不写即与其余条目同档。
   * 只换字色与悬停 / 按下的面，不表达勾选与校验；勾选的标记与禁用都压过它。
   * 两侧面板读同一份数据，条目搬到哪一侧都带着自己的语气。
   */
  tone?: Tone
}

/**
 * 搜索过滤谓词。过滤由组件完成：作者只提供匹配规则，
 * 哪些条目隐藏、方向键如何移动、全选与移动计算哪些全部由组件收口。
 * query 传入时已 trim，且保证非空串（空搜索不调用谓词）。
 */
export type TransferFilter = (item: TransferItem, query: string) => boolean

export interface TransferValueChangeDetails {
  /** 落在 target 侧的值。 */
  value: string[]
}

export interface TransferSelectionChangeDetails {
  /** 两侧合计被勾选的值（一个值只可能在一侧，因此一个扁平集合即可）。 */
  value: string[]
}

/** 面板级部件声明身份：所属的侧。两侧共用一套 part 名，依靠该值区分。 */
export interface TransferPanelProps {
  side: TransferSide
}

/**
 * 分组声明身份：值 + 所在侧的面板。
 * 两侧各挂一份同名分组，分组标题的 id 因此要连同 side 一起派生。
 */
export interface TransferGroupProps {
  value: string
  side: TransferSide
}

/**
 * 条目的声明：值 + 所在侧的面板；禁用与标签一律从 collection 查询。
 * 两侧面板各挂一份全集，不属于本侧的条目由连接层写上 hidden 而非卸载，
 * 因此同一个 value 会有两个节点，side 即它们各自的身份。
 */
export interface TransferItemProps {
  value: string
  side: TransferSide
}

/**
 * 接了按压通道的部件键：两颗搬运按钮记部件名，条目带上所在侧与 value（同一个 value 两侧各挂一个节点），
 * 全选格带上所在侧。
 * 四类部件共用一个机器，同一时刻只有一个在按着，按键比对投影。
 */
export type TransferPressedKey
  = | 'to-target'
    | 'to-source'
    | `item:${string}`
    | `select-all:${TransferSide}`

export interface TransferSchema extends MachineSchema {
  props: {
    /** 条目全集，元信息的唯一事实源。默认为空。 */
    collection?: TransferItem[]
    /**
     * 落在 target 侧的值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。
     */
    value?: string[]
    defaultValue?: string[]
    /** 原生表单字段名；目标侧每个值提交一个同名字段。 */
    name?: string
    /** 原生表单 ID；显式指定时覆盖祖先表单归属。 */
    form?: string
    /** 两侧合计被勾选的值（用于移动）。提供即受控，语义同上。 */
    selection?: string[]
    defaultSelection?: string[]
    /** 每侧带一个搜索框；关闭时搜索框仍在 DOM 中但带 hidden，且搜索串一律按空处理。 */
    searchable?: boolean
    /** 自定义匹配规则；默认为标签大小写不敏感包含。 */
    filter?: TransferFilter
    /** 整个控件禁用：条目为 aria-disabled，三个按钮与搜索框使用原生 disabled。 */
    disabled?: boolean
    /** 只读：两侧照常浏览与搜索，但勾选不可修改、也不可移动。禁用还额外移除键盘入口。 */
    readOnly?: boolean
    /** 校验失败：两侧列表报告 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 条目加载中：两侧列表报告 aria-busy，显示在途占位、隐藏空态占位。 */
    loading?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定勾选标记使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定条目与勾选格的几何档位。 */
    size?: Size
    /** 只能向右不能向回：向回移动的路径整体关闭，target 侧也不再接受勾选。 */
    oneWay?: boolean
    /** 列表内方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr；决定列表内哪个横向方向键是移向对面。 */
    dir?: Direction
    translations?: Partial<TransferTranslations>
    onValueChange?: (details: TransferValueChangeDetails) => void
    onSelectionChange?: (details: TransferSelectionChangeDetails) => void
  }
  context: {
    /** target 侧的值，恒为数组。受控（value 提供）时 cell 直读 prop。 */
    value: string[]
    /** 被勾选的值，恒为数组。受控（selection 提供）时 cell 直读 prop。 */
    selection: string[]
    /** 范围选的起点。Shift 的范围从它计算，跨到另一侧时作废。 */
    selectionAnchor: string | null
    /** 按住 Shift 之前的勾选，每一次都从它重新计算，向回点击才能收回。 */
    selectionBaseline: string[] | null
    /** 两侧各自的搜索串。不受控、不对外通知：它只影响可见内容。 */
    sourceQuery: string
    targetQuery: string
    /**
     * 两侧各自的焦点锚点，焦点离开该侧即清空。
     * 必须分为两份：两个列表各是一个独立的 roving 分组，各自保留一个 Tab 停靠点。
     */
    sourceFocusedValue: string | null
    targetFocusedValue: string | null
    /**
     * 按压通道：正被 Space / Enter 或触屏按住的那一个，按部件键记（见 TransferPressedKey）；
     * 没有按住时为 null。抬起、失焦或指针取消即清空；转入禁用 / 只读 / 加载，或搬运按钮失去可搬的
     * 条目时由机器自行松开。
     */
    pressed: TransferPressedKey | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 没有开合、没有异步，状态机只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    | { type: 'FORM.RESET' }
    /** 整体改写 target 侧集合（外部 setValue 经过它）。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 整体改写勾选集合。 */
    | { type: 'SELECTION.SET', value: string[] }
    /** 切换一个条目的勾选态。 */
    | { type: 'ITEM.TOGGLE', value: string, extend?: boolean }
    /** 全选 / 取消全选某一侧（只影响该侧可见且未禁用的条目）。 */
    | { type: 'SIDE.TOGGLE_ALL', side: TransferSide }
    /** 把对面勾选的条目移到 to 侧。 */
    | { type: 'ITEMS.MOVE', to: TransferSide }
    | { type: 'SEARCH.SET', side: TransferSide, query: string }
    | { type: 'ITEM.FOCUS', side: TransferSide, value: string }
    /** 焦点离开某一侧的列表，或持有焦点的条目被移出 DOM（浏览器此时不派发 focusout）。 */
    | { type: 'LIST.BLUR', side: TransferSide }
    /**
     * 某个可按部件被 Space / Enter 或触屏按住。disabled 是该部件自身的禁用事实（条目禁用或被藏起、
     * 全选格无可操作条目、搬运按钮没有勾中的条目），由 connect 判定后随事件带入。
     */
    | { type: 'PRESS.START', key: TransferPressedKey, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开键对应的那一个。 */
    | { type: 'PRESS.END', key: TransferPressedKey }
  tag: never
  guard: 'canPress'
  action:
    | 'resetToDefault'
    | 'setValue'
    | 'setSelection'
    | 'toggleItem'
    | 'toggleAll'
    | 'moveItems'
    | 'setQuery'
    | 'setFocusedValue'
    | 'clearFocusedValue'
    | 'startPress'
    | 'endPress'
    | 'releaseWhenInert'
  effect: never
}

export interface TransferApi<T extends PropTypes = PropTypes> {
  /** 条目全集（作者提供的数据，原样透出）。 */
  collection: readonly TransferItem[]
  /** 落在 target 侧的值。 */
  value: string[]
  /** 两侧合计被勾选的值。 */
  selection: string[]
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  oneWay: boolean
  searchable: boolean
  /** 某一侧当前可见的条目（分侧 + 搜索之后），顺序恒为 collection 原序。 */
  visibleItems: (side: TransferSide) => readonly TransferItem[]
  /** 某一侧当前实际勾选的值（只计可见且未禁用的条目，与三态、移动同一口径）。 */
  checkedValues: (side: TransferSide) => string[]
  checkState: (side: TransferSide) => TransferCheckState
  query: (side: TransferSide) => string
  /** 向 to 侧移动当前是否可行：对面有勾选的可操作条目，且该路径未被 oneWay 关闭。 */
  canMove: (to: TransferSide) => boolean
  isChecked: (value: string) => boolean
  sideOf: (value: string) => TransferSide
  setValue: (next: string[]) => void
  setSelection: (next: string[]) => void
  setQuery: (side: TransferSide, query: string) => void
  /** 切换某一项的勾选。extend 为真时选中锚点到该项的范围（同侧才成立）。 */
  toggle: (value: string, options?: { extend?: boolean }) => void
  toggleAll: (side: TransferSide) => void
  /** 程序化移动；焦点安排不在这里处理，那需要知道触发的节点。 */
  move: (to: TransferSide) => void
  getRootProps: () => T['element']
  /** 单个目标值的原生出口；适配器按 value 数组逐项渲染，空集合不提交字段。 */
  getHiddenInputProps: (props: { value: string }) => T['input']
  getPanelProps: (props: TransferPanelProps) => T['element']
  getPanelHeaderProps: (props: TransferPanelProps) => T['element']
  getPanelTitleProps: (props: TransferPanelProps) => T['element']
  getPanelCountProps: (props: TransferPanelProps) => T['element']
  getSearchProps: (props: TransferPanelProps) => T['input']
  getListProps: (props: TransferPanelProps) => T['element']
  getSelectAllTriggerProps: (props: TransferPanelProps) => T['button']
  /** 空态占位：放在面板中、list 的兄弟；本侧没有任何可见条目时显示，其余时候带 hidden。 */
  getEmptyProps: (props: TransferPanelProps) => T['element']
  /** 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 */
  getLoadingProps: (props: TransferPanelProps) => T['element']
  /** 分组容器：role=group，条目挂在其中；分组标题经 aria-labelledby 关联。 */
  getGroupProps: (props: TransferGroupProps) => T['element']
  /** 分组标题：不是选项、不进入导航，只作为本组的可及名。 */
  getGroupLabelProps: (props: TransferGroupProps) => T['element']
  getItemProps: (props: TransferItemProps) => T['element']
  getItemTextProps: (props: TransferItemProps) => T['element']
  getItemCheckboxProps: (props: TransferItemProps) => T['element']
  getToTargetTriggerProps: () => T['button']
  getToSourceTriggerProps: () => T['button']
}

/** 读屏文案。 */
export interface TransferTranslations {
  /**
   * 移到右侧按钮的可访问名。它只绘制一个箭头、没有可读文字，
   * 缺少名字时读屏无法朗读其含义，而这两个按钮是本组件唯一的操作出口，
   * 因此该文案总会发出。
   */
  toTarget: string
  /** 移回左侧按钮的可访问名，同样总会发出。 */
  toSource: string
}
