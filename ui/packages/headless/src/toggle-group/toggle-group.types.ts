import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 作者那一侧的值形态：单个值、值集合，或 null（无选中）。
 *
 * 内部一律归一成 string[]，对外回调再变回作者那一侧的形态。不这么做的话，
 * 单选模式下把 ['a'] 塞回作者绑的 v-model，会把他的字符串变量悄悄改成数组。
 */
export type ToggleGroupValue = string | readonly string[] | null

export interface ToggleGroupValueChangeDetails {
  /** multiple=true 时是数组（可能为空）；单选时是选中值，无选中为 null。 */
  value: string | string[] | null
}

/**
 * 条目自报家门：值与禁用由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface ToggleGroupItemProps {
  value: string
  disabled?: boolean
}

export interface ToggleGroupSchema extends MachineSchema {
  props: {
    /** 选中值。给定即受控：内部不再自改，只发 onValueChange。 */
    value?: ToggleGroupValue
    defaultValue?: ToggleGroupValue
    /** 允许多项同时选中；false 时选中一项即挤掉其余。 */
    multiple?: boolean
    /** 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 */
    disabled?: boolean
    /**
     * 不许把值清空：单选模式下点当前选中项不再取消它，多选模式下摘不掉最后一个。
     * 默认 false（可以点成无选中）。
     */
    disallowEmpty?: boolean
    /** 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 */
    orientation?: Orientation
    /** 文字方向，默认 ltr；只改写左右方向键的语义，上下键与之无关。 */
    dir?: Direction
    /** 方向键走到尽头是否回绕，默认 true。 */
    loop?: boolean
    /**
     * roving tabindex，默认开启：整组只占一个 Tab 位，组内靠方向键走。
     * 关掉后每个条目自成一个 Tab 停靠点、方向键不再接管——工具条被拆散嵌进
     * 一串普通表单控件里时要的就是这种"逐个 Tab"的手感。
     */
    rovingFocus?: boolean
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: ToggleGroupValueChangeDetails) => void
  }
  context: {
    /**
     * 选中集合。内部恒为数组（单选时长度 ≤ 1），不随 multiple 变类型——
     * 变类型会让 connect 里每处读值都得先分支一次。
     * 受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。
     */
    value: string[]
    /** 焦点位于组内时的瞬态锚点，焦点离组即清空。 */
    focusedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 选中值不编码进状态，机器因此只有一个状态，逻辑全在 context 与 actions。 */
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: ToggleGroupValue }
    | { type: 'ITEM.TOGGLE', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
  tag: never
  guard: never
  action: 'setValue' | 'toggleItem' | 'setFocusedValue' | 'clearFocusedValue'
  effect: never
}

export interface ToggleGroupApi<T extends PropTypes = PropTypes> {
  /** 当前选中集合，恒为数组（单选时长度 ≤ 1）。 */
  value: string[]
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  multiple: boolean
  disabled: boolean
  isSelected: (value: string) => boolean
  /** 传单值 / 数组 / null 皆可，内部按 multiple 归一。 */
  setValue: (next: ToggleGroupValue) => void
  getRootProps: () => T['element']
  getItemProps: (props: ToggleGroupItemProps) => T['button']
}
