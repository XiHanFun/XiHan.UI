import type { Typeahead } from '@xihan-ui/behavior'
import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 焦点模型：roving tabindex，不做 aria-activedescendant 变体。
 *
 * 焦点是真的落在条目上（DOM focus），整组只留一个 Tab 停靠点：
 * 锚点 = focusedValue ?? 首个选中值，认领 tabindex=0，其余条目一律 -1；
 * 焦点不在列表内（focusedValue == null）时由 content 兜底进 Tab 序列，
 * 它的 onFocus 再把焦点转投给锚点条目。
 *
 * 容器兜底的判据刻意用 focusedValue 而不是锚点本身：锚点可能指向一个已被删掉、
 * 或压根不在列表里的值（受控值来自远端、条目被过滤掉），那时没有任何条目会认领
 * tabindex=0，容器若也退出 Tab 序列，整组对键盘用户永久不可达。
 *
 * 选中另一条独立线：条目上是 aria-selected，与"焦点在谁身上"互不干涉——
 * 方向键只搬焦点，选中要等确认键或点击。做 Combobox 的地基必须是这个形状：
 * 浮层里的候选项要能被上下键逐个浏览而不当场落值。
 */
export type ListboxFocusModel = 'roving-tabindex'

/**
 * 选择模式：
 * - single：一次只中一个，确认键与点击都是「替换」；
 * - multiple：复选，确认键与点击都是「切换」，content 带 aria-multiselectable=true；
 * - extended：主选加修饰键扩选——裸点/裸确认是替换，Ctrl/Cmd 切换单个，Shift 连选区间。
 */
export type ListboxSelectionMode = 'single' | 'multiple' | 'extended'

export interface ListboxValueChangeDetails {
  /**
   * 选中集合。单选模式下也是数组（长度 ≤ 1），形状不随模式变——
   * 调用方不必为了读一个值先判断当前是哪种模式。
   */
  value: string[]
}

/**
 * 条目自报家门：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context/prop, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface ListboxItemProps {
  value: string
  disabled?: boolean
}

/** 分组自报身份：分组标题的 id 由它派生，group 与 label 靠这一个值互相认领。 */
export interface ListboxItemGroupProps {
  value: string
}

export interface ListboxRefs {
  /**
   * 连打检索缓冲。随服务存活：停顿够久自行重开一轮，
   * 放模块变量会让同页两个列表共用一个缓冲、互相把对方的查询串接上去。
   */
  typeahead: Typeahead
}

export interface ListboxSchema extends MachineSchema {
  props: {
    /**
     * 选中值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。
     * 单选写成裸串是简写，内部一律归一成数组。
     */
    value?: string | string[]
    defaultValue?: string | string[]
    /** selectionMode='multiple' 的简写；两者同时给时以 selectionMode 为准。 */
    multiple?: boolean
    selectionMode?: ListboxSelectionMode
    /** 整个列表禁用：条目全部转 aria-disabled，键盘与点击都不再改选中值。 */
    disabled?: boolean
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /** 文字方向，默认 ltr；只改写水平轴上左右方向键的语义。 */
    dir?: Direction
    /** 方向键轴向，默认 vertical。 */
    orientation?: Orientation
    /** 连打检索，默认开。关掉后可打印字符一律放行给页面。 */
    typeahead?: boolean
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: ListboxValueChangeDetails) => void
  }
  context: {
    /** 选中集合，恒为数组。受控（value 给定）时 cell 直读 prop。 */
    value: string[]
    /** 焦点位于列表内时的瞬态锚点，焦点离开即清空。 */
    focusedValue: string | null
    /**
     * 区间连选的起点：最近一次「非区间」选中落在哪个条目。
     * 与 focusedValue 分开：Shift 连选期间焦点一路跟着走，起点却必须钉住不动。
     */
    anchorValue: string | null
  }
  computed: Record<string, never>
  refs: ListboxRefs
  /** 选中值不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    /** 整体改写选中集合（区间连选、全选、外部 setValue 都走它），不动区间起点。 */
    | { type: 'VALUE.SET', value: string[] }
    /** 只留这一个（单选点击、extended 裸点）；同时把它记为区间起点。 */
    | { type: 'ITEM.SELECT', value: string }
    /** 切换这一个的选中态（复选点击、Ctrl 点击）；同时把它记为区间起点。 */
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    /** 焦点离开列表，或持有焦点的条目被移出 DOM（浏览器此时不派 focusout，由适配器如实上报）。 */
    | { type: 'LIST.BLUR' }
  tag: never
  guard: never
  action: 'setValue' | 'selectItem' | 'toggleItem' | 'setFocusedValue' | 'clearFocusedValue'
  effect: never
}

export interface ListboxApi<T extends PropTypes = PropTypes> {
  /** 选中集合；单选模式下长度 ≤ 1，形状不随模式变。 */
  value: string[]
  /** 生效的选择模式（multiple 只是 selectionMode='multiple' 的简写）。 */
  selectionMode: ListboxSelectionMode
  /** 焦点锚点；焦点不在列表内时为 null。 */
  focusedValue: string | null
  disabled: boolean
  isSelected: (value: string) => boolean
  setValue: (next: string[]) => void
  /** 只留这一个。复选模式下同样是「替换」，要加选用 toggle。 */
  select: (value: string) => void
  toggle: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getContentProps: () => T['element']
  getItemGroupProps: (props: ListboxItemGroupProps) => T['element']
  getItemGroupLabelProps: (props: ListboxItemGroupProps) => T['element']
  getItemProps: (props: ListboxItemProps) => T['element']
  getItemTextProps: (props: ListboxItemProps) => T['element']
  getItemIndicatorProps: (props: ListboxItemProps) => T['element']
}
