import type { Direction, Orientation, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface RadioGroupValueChangeDetails {
  value: string | null
}

/**
 * 条目声明：值与是否禁用。
 * connect 据此产出属性，不反查 DOM：它在 Vue 的 render 期求值，此时 DOM 尚不存在。
 */
export interface RadioGroupItemProps {
  value: string
  disabled?: boolean
}

export interface RadioGroupSchema extends MachineSchema {
  props: {
    value?: string | null
    defaultValue?: string | null
    disabled?: boolean
    orientation?: Orientation
    /** 文字方向，缺省 'ltr'。 */
    dir?: Direction
    /** 表单字段名。 */
    name?: string
    /** value 变化回调。 */
    onValueChange?: (details: RadioGroupValueChangeDetails) => void
  }
  context: {
    /** 选中值。 */
    value: string | null
    /** 焦点锚点，离组时为 null。 */
    focusedValue: string | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'VALUE.SET', value: string }
    | { type: 'ITEM.SELECT', value: string }
    | { type: 'ITEM.FOCUS', value: string }
    | { type: 'GROUP.BLUR' }
  tag: never
  guard: never
  action: 'setValue' | 'setFocusedValue' | 'clearFocusedValue'
  effect: never
}

export interface RadioGroupApi<T extends PropTypes = PropTypes> {
  value: string | null
  /** 焦点在组外时为 null。 */
  focusedValue: string | null
  setValue: (next: string) => void
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  getItemProps: (props: RadioGroupItemProps) => T['element']
  getItemTextProps: (props: RadioGroupItemProps) => T['element']
  getIndicatorProps: (props: RadioGroupItemProps) => T['element']
  /** 条目对应的隐藏原生 radio 输入，用于表单提交。 */
  getHiddenInputProps: (props: RadioGroupItemProps) => T['input']
}
