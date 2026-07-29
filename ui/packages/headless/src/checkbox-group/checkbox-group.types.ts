import type { Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface CheckboxGroupValueChangeDetails {
  value: string[]
}

/**
 * 全选态，用于驱动一个 indeterminate 的父复选框。
 * - all  组内声明的条目全部选中
 * - some 选中了一部分（对应 aria-checked="mixed"）
 * - none 一个都没选中
 */
export type CheckboxGroupCheckedState = 'all' | 'some' | 'none'

/**
 * 条目自报值与禁用，connect 据此产出属性。
 * connect 不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface CheckboxGroupItemProps {
  value: string
  disabled?: boolean
}

export interface CheckboxGroupSchema extends MachineSchema {
  props: {
    /** 选中值集合。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 */
    value?: string[]
    defaultValue?: string[]
    /** 组内全部条目的值，按书写顺序声明；不给时 checkedState 退化成 none / some 两态。 */
    itemValues?: string[]
    /** 整组禁用：每一项都跟着禁用，且隐藏输入不参与提交。 */
    disabled?: boolean
    /** 只读：仍可聚焦与朗读，但用户改不动。 */
    readOnly?: boolean
    /** 校验失败标注，落到每个条目的 aria-invalid 上。 */
    invalid?: boolean
    /** 表单字段名；给定后每个条目的隐藏输入才带 name，同名多值一并提交。 */
    name?: string
    /** 视觉排布，默认 vertical。只出 data-orientation，不出 aria-orientation。 */
    orientation?: Orientation
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: CheckboxGroupValueChangeDetails) => void
  }
  context: {
    /** 选中值。受控（value 给定）时 cell 直读 prop，写只发 onValueChange 不改内部值。 */
    value: string[]
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string[] }
    | { type: 'ITEM.TOGGLE', value: string }
    /** values 是事件发生那一刻现查到的可用条目值。 */
    | { type: 'ALL.TOGGLE', values: string[] }
  tag: never
  guard: 'editable'
  action: 'setValue' | 'toggleItem' | 'toggleAll'
  effect: never
}

export interface CheckboxGroupApi<T extends PropTypes = PropTypes> {
  value: string[]
  checkedState: CheckboxGroupCheckedState
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  isChecked: (value: string) => boolean
  /** 整体替换选中集合。程序化入口，不受 readOnly 拦截。 */
  setValue: (next: string[]) => void
  /** 翻转某个值；整组禁用或只读时无效。 */
  toggleValue: (value: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getItemProps: (props: CheckboxGroupItemProps) => T['element']
  getItemControlProps: (props: CheckboxGroupItemProps) => T['element']
  getItemTextProps: (props: CheckboxGroupItemProps) => T['element']
  /** 条目的表单影子：一份视觉隐藏的原生 checkbox，由条目内部渲染。 */
  getItemHiddenInputProps: (props: CheckboxGroupItemProps) => T['input']
  /** 全选/半选的父复选框。必须写在 root 之内，它靠祖先链找到本组。 */
  getTriggerProps: () => T['element']
}
