import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export type PromptInputState = 'empty' | 'editing' | 'disabled'

/**
 * 哪一档按键提交。
 * `enter`：Enter 提交、Shift+Enter 换行、Mod+Enter 也提交。
 * `mod-enter`：Enter 换行，只有 Mod+Enter 提交。
 * `none`：Enter 与 Mod+Enter 都换行，键盘不提交；提交只剩按钮与程序化两条路。
 */
export type PromptInputSubmitKey = 'enter' | 'mod-enter' | 'none'

export interface PromptInputValueChangeDetails {
  value: string
}

export interface PromptInputSubmitDetails {
  value: string
}

export interface PromptInputSchema extends MachineSchema {
  props: {
    value?: string
    defaultValue?: string
    disabled?: boolean
    /**
     * 正在生成：按钮换成停止身份，所有提交路径被挡下。
     * 用一个布尔而不是四档运行态字符串——组件只需要二值判断，
     * 「这一轮走到哪一步」是宿主的事，透传成 data 属性属于作者的容器。
     */
    loading?: boolean
    /** 按哪一档提交，默认 enter。 */
    submitKey?: PromptInputSubmitKey
    /** 允许空值提交，默认 false；有附件时由作者置真。这是唯一为附件留的钩子。 */
    allowEmptySubmit?: boolean
    /** 提交后清空，默认 true。 */
    clearOnSubmit?: boolean
    variant?: ControlVariant
    tone?: Tone
    size?: Size
    translations?: Partial<PromptInputTranslations>
    onValueChange?: (details: PromptInputValueChangeDetails) => void
    onSubmit?: (details: PromptInputSubmitDetails) => void
    onStop?: () => void
  }
  context: {
    value: string
    /** 输入法组合中。组合期间的按键属于候选词框，一律不接。 */
    isComposing: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: PromptInputState
  event:
    | { type: 'VALUE.SET', value: string }
    | { type: 'COMPOSITION.START' }
    | { type: 'COMPOSITION.END' }
    /** 键盘触发的提交。 */
    | { type: 'KEY.SUBMIT' }
    /** 程序化或指针触发的提交。 */
    | { type: 'SUBMIT' }
    | { type: 'STOP' }
    // 受控回写：宿主改 disabled 或 value 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.DISABLE' }
    | { type: 'CONTROLLED.ENABLE' }
    | { type: 'CONTROLLED.VALUE.EMPTY' }
    | { type: 'CONTROLLED.VALUE.FILLED' }
  tag: never
  guard: 'canSubmit' | 'isLoading' | 'isValueEmpty' | 'isNextValueEmpty'
  action:
    | 'setValue'
    | 'clearValue'
    | 'invokeSubmit'
    | 'invokeStop'
    | 'setComposing'
    | 'clearComposing'
    | 'syncDisabled'
    | 'syncValueState'
  effect: never
}

export interface PromptInputApi<T extends PropTypes = PropTypes> {
  value: string
  isComposing: boolean
  /** 能不能提交。比机器守卫多一条「非禁用」，供按钮置灰用。 */
  canSubmit: boolean
  loading: boolean
  disabled: boolean
  setValue: (next: string) => void
  submit: () => void
  stop: () => void
  getRootProps: () => T['element']
  /** 可选的输入行容器：渲了它，输入框与按钮并排收在这一行里，root 翻成竖排。 */
  getControlProps: () => T['element']
  getInputProps: () => T['textarea']
  getSubmitTriggerProps: () => T['button']
}

export interface PromptInputTranslations {
  /** 发送按钮的可访问名。 */
  send: string
  /** 生成期间同一颗按钮的可访问名。 */
  stop: string
  /**
   * 输入框的可访问名。**不给就整条 aria-label 不输出**——
   * 无条件发会盖掉作者的 `<label for>` 与他自己写的 aria-label。
   */
  input?: string
}
