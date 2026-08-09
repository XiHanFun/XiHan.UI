import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

export interface NumberFieldValueChangeDetails {
  /** 原始输入串，也是提交进 FormData 的值。 */
  value: string
  /** 同一个值的数值形态；空串或非法输入时是 NaN。 */
  valueAsNumber: number
}

export interface NumberFieldSchema extends MachineSchema {
  props: {
    value?: string
    defaultValue?: string
    min?: number
    max?: number
    /** 方向键与加减按钮的步长，默认 1。 */
    step?: number
    /** PageUp / PageDown 的步长，默认 10 倍 step。 */
    largeStep?: number
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；给了才参与提交。 */
    name?: string
    /** 按住加减按钮多久开始连发，默认 300ms。 */
    changeDelay?: number
    /** 连发间隔，默认 50ms。 */
    changeInterval?: number
    /** 形态：outline / subtle / ghost，决定输入框与加减钮的底与描边怎么画。 */
    variant?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 */
    tone?: string
    /** 尺寸：sm / md / lg，决定输入框与加减钮的几何档位。 */
    size?: string
    onValueChange?: (details: NumberFieldValueChangeDetails) => void
  }
  context: {
    value: string
    pressDirection: 1 | -1
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** spinning = 加减按钮被按住，松开或指针移出即回 idle。 */
  state: 'idle' | 'spinning'
  event:
    | { type: 'VALUE.SET', value: string }
    | { type: 'VALUE.STEP', direction: 1 | -1, large?: boolean }
    | { type: 'VALUE.TO_MIN' }
    | { type: 'VALUE.TO_MAX' }
    /** 失焦时把显示串规范化并夹回区间；输入途中不打断用户。 */
    | { type: 'INPUT.BLUR' }
    | { type: 'PRESS.START', direction: 1 | -1 }
    | { type: 'PRESS.END' }
    | { type: 'after.changeInterval' }
  tag: never
  guard: 'canStep'
  action: 'setValue' | 'stepValue' | 'toMin' | 'toMax' | 'normalize' | 'setDirection'
  effect: 'spin'
}

export interface NumberFieldApi<T extends PropTypes = PropTypes> {
  value: string
  valueAsNumber: number
  /** 值为空或非法。 */
  empty: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  canIncrement: boolean
  canDecrement: boolean
  setValue: (next: string) => void
  increment: () => void
  decrement: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getInputProps: () => T['input']
  getIncrementTriggerProps: () => T['button']
  getDecrementTriggerProps: () => T['button']
}
