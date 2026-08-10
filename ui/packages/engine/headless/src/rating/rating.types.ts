import type { Direction, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface RatingValueChangeDetails {
  /** 已经钉到合法档位并夹进 [0, count] 的评分；0 表示还没评。 */
  value: number
}

export interface RatingHoverChangeDetails {
  /** 指针预览的档位；指针离开评分带时为 null。 */
  value: number | null
}

/**
 * 条目自报家门：它代表第几颗星（1 起）。
 * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得反查 DOM。
 */
export interface RatingItemProps {
  value: number
}

/** 单个条目的呈现状态；自绘星形时按它取图案。 */
export interface RatingItemState {
  value: number
  /** 真实值落在这颗星上（读屏念出的那一颗）。悬停预览不改它。 */
  checked: boolean
  /** 这颗星该点亮。悬停期间跟预览值走。 */
  highlighted: boolean
  /** 这颗星只亮一半。 */
  half: boolean
}

export interface RatingSchema extends MachineSchema {
  props: {
    /** 受控评分。给定即受控：内部不再自行落值，只发 onValueChange。 */
    value?: number
    /** 非受控初值，缺省 0（还没评）。 */
    defaultValue?: number
    /** 星星颗数，默认 5。 */
    count?: number
    /** 允许半颗星：档位从 1 变成 0.5。 */
    allowHalf?: boolean
    /** 整个不可交互：退出 Tab 序列，指针与键盘都不认。 */
    disabled?: boolean
    /** 只读：仍可聚焦、仍能被读屏念出，但改不动，也不给悬停预览。 */
    readOnly?: boolean
    required?: boolean
    /** 表单字段名；给了表单影子才带 name 并参与提交。 */
    name?: string
    /** 文字方向，缺省 'ltr'。只改写左右方向键与"指针落在哪半边"的语义。 */
    dir?: Direction
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    onValueChange?: (details: RatingValueChangeDetails) => void
    /** 悬停预览变化；指针离开时带 null。它不代表值变了。 */
    onHoverChange?: (details: RatingHoverChangeDetails) => void
  }
  context: {
    /** 评分。受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。 */
    value: number
    /** 指针预览值，只影响点亮范围，绝不写进 value。指针离开即清空。 */
    hoveredValue: number | null
    /** 焦点所在的星序号（1 起），焦点离开评分带即清空。只服务 roving tabindex 与键盘起点。 */
    focusedValue: number | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: number }
    | { type: 'VALUE.STEP', direction: 1 | -1 }
    | { type: 'VALUE.TO_MIN' }
    | { type: 'VALUE.TO_MAX' }
    | { type: 'ITEM.SELECT', value: number }
    | { type: 'ITEM.FOCUS', index: number }
    | { type: 'ITEM.HOVER', value: number }
    | { type: 'HOVER.CLEAR' }
    | { type: 'CONTROL.BLUR' }
  tag: never
  guard: 'canInteract'
  action:
    | 'setValue'
    | 'stepValue'
    | 'toMin'
    | 'toMax'
    | 'setHovered'
    | 'clearHovered'
    | 'setFocused'
    | 'clearFocused'
  effect: never
}

export interface RatingApi<T extends PropTypes = PropTypes> {
  /** 已归一化的评分：非法与越界的宿主输入在这里就被夹回来了。 */
  value: number
  /** 指针预览值；没有预览（或不可交互）时为 null。 */
  hoveredValue: number | null
  /** 当前该点亮到哪：有预览就是预览值，否则就是评分。样式与 data-highlighted 用的都是它。 */
  highlightedValue: number
  count: number
  /** 还没评（value 为 0）。 */
  empty: boolean
  disabled: boolean
  readOnly: boolean
  /** 1..count 的序号表，作者直接遍历它渲染星星。 */
  items: readonly number[]
  getItemState: (props: RatingItemProps) => RatingItemState
  setValue: (next: number) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getControlProps: () => T['element']
  getItemProps: (props: RatingItemProps) => T['element']
  /** 表单出口：一份视觉隐藏的原生输入，随表单提交当前评分。 */
  getHiddenInputProps: () => T['input']
}
