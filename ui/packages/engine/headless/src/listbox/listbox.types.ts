/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 listbox 类型契约。

import type { Direction, MachineSchema, Orientation, PropTypes, Size, Tone, Typeahead } from '@xihan-ui/core'

/**
 * 焦点模型：roving tabindex（不做 aria-activedescendant 变体）。焦点实际落在条目上，
 * 整组只保留一个 Tab 停靠点：锚点 = focusedValue ?? 首个选中值，承担 tabindex=0，其余一律 -1；
 * 焦点不在列表内时由 content 兜底进入 Tab 序列，其 onFocus 再把焦点转交给锚点条目。
 *
 * 容器兜底的判据刻意使用 focusedValue 而不是锚点本身：锚点可能指向已被删除、或不在列表中的值
 * （受控值来自远端、条目被过滤），此时没有任何条目承担 tabindex=0，容器若也退出 Tab 序列，
 * 整组对键盘用户永久不可达。
 *
 * 选中是另一条独立线（条目上的 aria-selected）：方向键只移动焦点，选中需要确认键或点击。
 */
export type ListboxFocusModel = 'roving-tabindex'

/**
 * 选择模式：
 * - single：一次只选中一个，点击与确认键为替换；
 * - multiple：复选，点击与确认键为切换；
 * - extended：直接点击为替换，Ctrl/Cmd 切换单个，Shift 连选区间。
 */
export type ListboxSelectionMode = 'single' | 'multiple' | 'extended'

export interface ListboxValueChangeDetails {
  /** 选中集合；单选模式下长度 ≤ 1。 */
  value: string[]
}

/** 条目数据。提供 collection 时，显示文本与禁用以它为准。 */
export interface ListboxNode {
  value: string
  /** 展示文本，也是连打检索的取字来源；默认回退为 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
  /**
   * 该条选项自身的性质：危险选项写 danger、需要留意的写 warning。不写即与其余条目同档。
   * 只换字色与悬停 / 按下的面，不表达选中与校验；选中的标记与禁用都压过它。
   * 彩字不是唯一通道，要紧的差别仍要配图标或文案。整列的 tone 不下发给条目。
   */
  tone?: Tone
  /**
   * 副文本，写入 item-description 部件；未提供时本条不铺该部件。
   * 它是第 2 行的说明，跟着条目走 muted 档，不跟语气；放不下一行的解释才用它，
   * 一句话能说清的写进 label。
   */
  description?: string
}

/** 单个条目的元信息，由 collection 推导，不含选中态与焦点态。 */
export interface ListboxNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
  /** 该条自己写的语气；未提供时为 null。 */
  tone: Tone | null
  /** 副文本；未提供时为 null。 */
  description: string | null
}

/**
 * 条目声明的身份：值必须声明，禁用可由 collection 代为声明。
 * connect 因此是 (context/prop, 本条目声明) 的纯函数，不反查 DOM：Vue 侧在 render 期求值（本帧 DOM 尚不存在），
 * WC 侧在 updated 后求值（DOM 已就位），连接期读取 DOM 会使两个适配器的首帧快照分叉。
 */
export interface ListboxItemProps {
  value: string
  /** 逐条覆盖禁用；未提供时从 collection 查询，两处都未声明即为不禁用。 */
  disabled?: boolean
}

/** 分组属性，分组标题的 id 由它派生。 */
export interface ListboxGroupProps {
  value: string
}

export interface ListboxRefs {
  /** 连打检索缓冲，随服务存活。 */
  typeahead: Typeahead
}

export interface ListboxSchema extends MachineSchema {
  props: {
    /**
     * 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。
     * 未提供时回到文本与禁用都写在条目部件上的方式。
     */
    collection?: ListboxNode[]
    /** 选中值，提供即受控；单选可写为裸串，内部归一为数组。 */
    value?: string | string[]
    defaultValue?: string | string[]
    /** 选择模式，默认 single。 */
    selectionMode?: ListboxSelectionMode
    /** 整个列表禁用，键盘与点击都不再改选中值。 */
    disabled?: boolean
    /** 只读：条目照常浏览与聚焦，但选中值不可修改。禁用则连同焦点一起退出。 */
    readOnly?: boolean
    /** 条目加载中：列表报告 aria-busy，显示在途占位，隐藏空态占位。 */
    loading?: boolean
    /** 校验失败：列表报告 aria-invalid，各角色节点带 data-invalid。 */
    invalid?: boolean
    /** 语气：brand / neutral / success / warning / danger / info，决定勾选标记使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定条目的几何档位。 */
    size?: Size
    /** 方向键到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 方向键轴向，默认 vertical。 */
    orientation?: Orientation
    /** 连打检索，默认开启。 */
    typeahead?: boolean
    /** value 变化意图回调。 */
    onValueChange?: (details: ListboxValueChangeDetails) => void
  }
  context: {
    /** 选中集合，恒为数组；受控时 cell 直读 prop。 */
    value: string[]
    /** 焦点位于列表内时的瞬态锚点，焦点离开即清空。 */
    focusedValue: string | null
    /** 区间连选的起点：最近一次非区间选中的条目。 */
    anchorValue: string | null
    /** 按压通道：Space / Enter 或触屏按住的是条目还是列表尾的「取下一页」。 */
    pressedPart: 'item' | 'load-more-trigger' | null
    /** 按压通道：按住的条目 value；load-more-trigger 没有 value，记 null。 */
    pressedValue: string | null
  }
  computed: Record<string, never>
  refs: ListboxRefs
  /** 只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写选中集合，不改变区间起点。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 清空选中集合，不改变区间起点。 */
    | { type: 'VALUE.CLEAR' }
    /** 只保留该条目，并记为区间起点。 */
    | { type: 'ITEM.SELECT', value: string }
    /** 切换该条目的选中态，并记为区间起点。 */
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
    /** 焦点离开列表，或持有焦点的条目被移出 DOM（后者由适配器上报）。 */
    | { type: 'LIST.BLUR' }
    /** 条目或「取下一页」被 Space / Enter 或触屏按住；disabled 是条目自身的禁用事实，由 connect 判定后随事件带入。 */
    | { type: 'PRESS.START', part: 'item' | 'load-more-trigger', value?: string, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 part + value 对应的那一个。 */
    | { type: 'PRESS.END', part: 'item' | 'load-more-trigger', value?: string }
  tag: never
  guard: 'canPress'
  action: 'setValue' | 'clearValue' | 'selectItem' | 'toggleItem' | 'setFocusedValue' | 'clearFocusedValue' | 'startPress' | 'endPress' | 'releaseWhenInert'
  effect: never
}

export interface ListboxApi<T extends PropTypes = PropTypes> {
  /** 选中集合；单选模式下长度 ≤ 1。 */
  value: string[]
  /** 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 */
  collection: readonly ListboxNodeMeta[]
  /** 生效的选择模式。 */
  selectionMode: ListboxSelectionMode
  /** 焦点锚点；焦点不在列表内时为 null。 */
  focusedValue: string | null
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  loading: boolean
  isSelected: (value: string) => boolean
  setValue: (next: string[]) => void
  /** 只保留该条目；加选使用 toggle。 */
  select: (value: string) => void
  toggle: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getContentProps: () => T['element']
  /**
   * 空态占位：放在 root 中、content 的兄弟。
   * 提供 collection 时由连接层按条数收放；条目手写时不写 hidden，是否显示由作者决定。
   */
  getEmptyProps: () => T['element']
  /**
   * 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。
   * 提供 collection 时由连接层按条数收放；条目手写时只按 loading 收放。
   */
  getLoadingProps: () => T['element']
  /**
   * 取下一页的入口：库不知道是否还有下一页，是否显示与点击后的行为都由作者决定，
   * 连接层只保证取数在途与整列禁用两档不可点击。
   */
  getLoadMoreTriggerProps: () => T['element']
  getGroupProps: (props: ListboxGroupProps) => T['element']
  getGroupLabelProps: (props: ListboxGroupProps) => T['element']
  getItemProps: (props: ListboxItemProps) => T['element']
  getItemTextProps: (props: ListboxItemProps) => T['element']
  getItemDescriptionProps: (props: ListboxItemProps) => T['element']
  getItemIndicatorProps: (props: ListboxItemProps) => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ListboxTranslations {}
