import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface PasswordInputValueChangeDetails {
  /** 输入框里的原始串；提交进 FormData 的就是它。 */
  value: string
}

export interface PasswordInputVisibilityChangeDetails {
  /** true 表示此刻明文显示。 */
  visible: boolean
}

/** 输入框此刻的 type：隐藏态是原生密码框，显示态换成 text。 */
export type PasswordInputType = 'password' | 'text'

export interface PasswordInputSchema extends MachineSchema {
  props: {
    /** 受控值；给了就由宿主说了算，机器不自改。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    /** 受控的明暗态；给了就由宿主说了算。 */
    visible?: boolean
    /** 非受控的初始明暗态，缺省隐藏。 */
    defaultVisible?: boolean
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；给了才参与提交。 */
    name?: string
    placeholder?: string
    /**
     * 落到 input 上的 autocomplete，缺省 current-password。
     * 密码管理器靠它决定这一格是填旧密码还是存新密码，注册表单要显式写 new-password。
     */
    autoComplete?: string
    /** 读屏文案覆盖；没给的条目走组件内建英文。 */
    translations?: Partial<PasswordInputTranslations>
    /** 形态：outline / subtle / ghost，决定颜色怎么用。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    onValueChange?: (details: PasswordInputValueChangeDetails) => void
    onVisibilityChange?: (details: PasswordInputVisibilityChangeDetails) => void
  }
  context: {
    value: string
    visible: boolean
    /** 大写锁定是否开着。只有按键事件报得出来，故焦点离开输入框即清空。 */
    capsLock: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：明暗与大写锁定都是 context 里的值，不编码进状态。 */
  state: 'idle'
  event:
    /** 用户敲字或作者调 setValue。 */
    | { type: 'VALUE.SET', value: string }
    /** 直接指定明暗态。 */
    | { type: 'VISIBILITY.SET', visible: boolean }
    /** 翻转明暗态，切换钮走这一条。 */
    | { type: 'VISIBILITY.TOGGLE' }
    /** 按键事件报回来的大写锁定状态，或焦点离开输入框时的清空。 */
    | { type: 'CAPS_LOCK.SET', on: boolean }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit' | 'canToggleVisibility'
  action: 'setValue' | 'setVisible' | 'toggleVisibility' | 'setCapsLock' | 'resetToDefault'
  effect: never
}

export interface PasswordInputApi<T extends PropTypes = PropTypes> {
  value: string
  /** 值为空串。 */
  empty: boolean
  /** 此刻是否明文显示。 */
  visible: boolean
  /** 大写锁定是否开着；为真时提示部件才显出来。 */
  capsLock: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 输入框此刻的 type，随 visible 走。 */
  inputType: PasswordInputType
  /**
   * 大写锁定播报区里此刻的文字：开着时是 `translations.capsLockOn`，关着时是空串。
   * 适配器把它落成提示部件的文本内容，读屏念的就是这一段。
   */
  capsLockMessage: string
  /** 直接写值，只受 disabled / readOnly 约束。 */
  setValue: (next: string) => void
  /** 指定明暗态；整枚控件禁用时不生效。 */
  setVisible: (next: boolean) => void
  /** 翻转明暗态；整枚控件禁用时不生效。 */
  toggleVisibility: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getInputProps: () => T['input']
  getVisibilityTriggerProps: () => T['button']
  getCapsLockIndicatorProps: () => T['element']
}

/** 读屏用的文案，默认英文。 */
export interface PasswordInputTranslations {
  /** 隐藏态下切换钮的 aria-label：按钮里通常只有一只眼睛图标，读屏念不出按下去会发生什么。 */
  visibilityTriggerShow: string
  /** 显示态下切换钮的 aria-label：同一个按钮换了动作，名字必须跟着换。 */
  visibilityTriggerHide: string
  /** 大写锁定提示的正文：这一句既是屏幕上看得见的字，也是活区域播报出去的内容。 */
  capsLockOn: string
}
