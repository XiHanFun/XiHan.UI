import type { Typeahead } from '@xihan-ui/behavior'
import type { Direction, Orientation, PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 焦点模型：roving tabindex（不做 aria-activedescendant 变体）。焦点真的落在条目上，
 * 整组只留一个 Tab 停靠点：锚点 = focusedValue ?? 首个选中值，认领 tabindex=0，其余一律 -1；
 * 焦点不在列表内时由 content 兜底进 Tab 序列，其 onFocus 再把焦点转投给锚点条目。
 *
 * 容器兜底的判据刻意用 focusedValue 而不是锚点本身：锚点可能指向已被删掉、或压根不在列表里的值
 * （受控值来自远端、条目被过滤掉），那时没有任何条目会认领 tabindex=0，容器若也退出 Tab 序列，
 * 整组对键盘用户永久不可达。
 *
 * 选中是另一条独立线（条目上的 aria-selected）：方向键只搬焦点，选中要等确认键或点击。
 */
export type ListboxFocusModel = 'roving-tabindex'

/**
 * 选择模式：
 * - single：一次只中一个，点击与确认键为替换；
 * - multiple：复选，点击与确认键为切换；
 * - extended：裸点为替换，Ctrl/Cmd 切换单个，Shift 连选区间。
 */
export type ListboxSelectionMode = 'single' | 'multiple' | 'extended'

export interface ListboxValueChangeDetails {
  /** 选中集合；单选模式下长度 ≤ 1。 */
  value: string[]
}

/** 条目数据。给了 collection，显示文本与禁用就以它为准。 */
export interface ListboxNode {
  value: string
  /** 展示文本，也是连打检索的取字处；缺省退回 value。 */
  label?: string
  /** 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 */
  disabled?: boolean
}

/** 单个条目的元信息，由 collection 推出，不含选中态与焦点态。 */
export interface ListboxNodeMeta {
  value: string
  /** node.label ?? node.value，恒为字符串。 */
  label: string
  disabled: boolean
}

/**
 * 条目自报家门：值必报，禁用可由 collection 代为声明。
 * connect 因此是 (context/prop, 本条目声明) 的纯函数，不反查 DOM——Vue 侧在 render 期求值（本帧 DOM 还不存在），
 * WC 侧在 updated 后求值（DOM 已就位），连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface ListboxItemProps {
  value: string
  /** 逐条覆盖禁用；缺省时回 collection 里查，两处都没有即为不禁用。 */
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
     * 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。
     * 缺省即回到「文本与禁用都写在条目部件上」的老路。
     */
    collection?: ListboxNode[]
    /** 选中值，给定即受控；单选可写成裸串，内部归一成数组。 */
    value?: string | string[]
    defaultValue?: string | string[]
    /** 选择模式，默认 single。 */
    selectionMode?: ListboxSelectionMode
    /** 整个列表禁用，键盘与点击都不再改选中值。 */
    disabled?: boolean
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr。 */
    dir?: Direction
    /** 方向键轴向，默认 vertical。 */
    orientation?: Orientation
    /** 连打检索，默认开。 */
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
  }
  computed: Record<string, never>
  refs: ListboxRefs
  /** 只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写选中集合，不动区间起点。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 清空选中集合，不动区间起点。 */
    | { type: 'VALUE.CLEAR' }
    /** 只留这一个，并记为区间起点。 */
    | { type: 'ITEM.SELECT', value: string }
    /** 切换这一个的选中态，并记为区间起点。 */
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'FOCUS.CLEAR' }
    /** 焦点离开列表，或持有焦点的条目被移出 DOM（后者由适配器上报）。 */
    | { type: 'LIST.BLUR' }
  tag: never
  guard: never
  action: 'setValue' | 'clearValue' | 'selectItem' | 'toggleItem' | 'setFocusedValue' | 'clearFocusedValue'
  effect: never
}

export interface ListboxApi<T extends PropTypes = PropTypes> {
  /** 选中集合；单选模式下长度 ≤ 1。 */
  value: string[]
  /** collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 */
  collection: readonly ListboxNodeMeta[]
  /** 生效的选择模式。 */
  selectionMode: ListboxSelectionMode
  /** 焦点锚点；焦点不在列表内时为 null。 */
  focusedValue: string | null
  disabled: boolean
  isSelected: (value: string) => boolean
  setValue: (next: string[]) => void
  /** 只留这一个；加选用 toggle。 */
  select: (value: string) => void
  toggle: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getContentProps: () => T['element']
  getGroupProps: (props: ListboxGroupProps) => T['element']
  getGroupLabelProps: (props: ListboxGroupProps) => T['element']
  getItemProps: (props: ListboxItemProps) => T['element']
  getItemTextProps: (props: ListboxItemProps) => T['element']
  getItemIndicatorProps: (props: ListboxItemProps) => T['element']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface ListboxTranslations {}
