import type { ControlVariant, PropTypes, Size, Tone } from '@xihan-ui/kernel'
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
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定输入框与加减钮的几何档位。 */
    size?: Size
    /**
     * 显示串 → 数。默认按 `Number()` 读（'12abc' 判为非法），给了它就换成它——
     * 千位分隔符、单位后缀、百分号这类都靠这条读回来。读不出数返回 `NaN`。
     *
     * 与 `format` 必须互逆：`format` 出来的串要能被 `parse` 读回同一个数，
     * 否则按一下加号值就会漂。
     */
    parse?: (text: string) => number
    /**
     * 数 → 显示串。默认 `String(n)`。**只在组件自己改写显示时用**——步进、取端点、
     * 失焦规范化这三处；用户正在打字时一律不碰，否则光标会被打断。
     */
    format?: (value: number) => string
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
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canStep'
  action: 'setValue' | 'stepValue' | 'toMin' | 'toMax' | 'normalize' | 'setDirection' | 'resetToDefault'
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
  /** 输入框与加减钮的包裹层：皮肤把视觉盒画在它身上，减在左、加在右、输入框居中。 */
  getControlProps: () => T['element']
  getInputProps: () => T['input']
  getIncrementTriggerProps: () => T['button']
  getDecrementTriggerProps: () => T['button']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface NumberFieldTranslations {}
