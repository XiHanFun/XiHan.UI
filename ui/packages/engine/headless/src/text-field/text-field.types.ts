import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

export interface TextFieldValueChangeDetails {
  /** 输入框里的原始串；提交进 FormData 的就是它。 */
  value: string
}

export interface TextFieldSchema extends MachineSchema {
  props: {
    /** 受控值；给了就由宿主说了算，机器不自改。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；给了才参与提交。 */
    name?: string
    /** 字符数上限。同时落成原生 maxlength 与机器侧的截断，两道都要。 */
    maxLength?: number
    /** 开启清空能力：清空按钮可用、Escape 接管。关掉时按钮带 hidden 收起。 */
    clearable?: boolean
    /** 形态：outline / subtle / ghost，决定输入框的底与描边怎么画。 */
    variant?: string
    /** 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 */
    tone?: string
    /** 尺寸：sm / md / lg，决定输入框与清空按钮的几何档位。 */
    size?: string
    onValueChange?: (details: TextFieldValueChangeDetails) => void
  }
  context: {
    value: string
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：这个组件没有任何随时间推移的过程，值本身住在 context cell 里。 */
  state: 'idle'
  event:
    /** 用户敲字或作者调 setValue；超过 maxLength 的部分在这里被截掉。 */
    | { type: 'VALUE.SET', value: string }
    /** 清空意图（Escape 或清空按钮）；不满足清空条件时整条被守卫挡下。 */
    | { type: 'VALUE.CLEAR' }
  tag: never
  guard: 'canEdit' | 'canClear'
  action: 'setValue' | 'clearValue'
  effect: never
}

export interface TextFieldApi<T extends PropTypes = PropTypes> {
  value: string
  /** 值为空串。作者据此显示占位说明一类的东西。 */
  empty: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  clearable: boolean
  /** 已顶到 maxLength：再敲也进不去，作者据此把字数提示标红。 */
  atLimit: boolean
  /** 清空按钮此刻是否可用（开了 clearable、可编辑、且有值）。 */
  canClear: boolean
  /** 直接写值，只受 disabled/readOnly 与 maxLength 约束，与 clearable 无关。 */
  setValue: (next: string) => void
  /** 走清空意图，受 canClear 约束；无条件清空请用 setValue('')。 */
  clear: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getInputProps: () => T['input']
  getClearTriggerProps: () => T['button']
}
