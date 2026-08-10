import type { PropTypes } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 宿主运行态在输入框侧的两档投影。 */
export type ComposerRunStatus = 'ready' | 'streaming'

export type ComposerState = 'empty' | 'editing' | 'disabled'

export interface ComposerValueChangeDetails {
  value: string
}

export interface ComposerSubmitDetails {
  /** 提交时输入框里的原文，清空发生在回调之后。 */
  value: string
}

/** 读屏文案，默认英文。 */
export interface ComposerTranslations {
  send: string
  stop: string
  input: string
}

export interface ComposerSchema extends MachineSchema {
  props: {
    /** 受控值，给了就由宿主写回。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    disabled?: boolean
    /** 宿主传入的运行态。 */
    runStatus?: ComposerRunStatus
    /** Enter 直接提交、Shift+Enter 换行，默认 true。 */
    submitOnEnter?: boolean
    translations?: Partial<ComposerTranslations>
    onValueChange?: (details: ComposerValueChangeDetails) => void
    onSubmit?: (details: ComposerSubmitDetails) => void
    onStop?: () => void
  }
  context: {
    value: string
    /** IME 组合态，为真时所有提交路径都被挡下。 */
    isComposing: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: ComposerState
  event:
    /** 由 textarea 的 onInput 或作者调 setValue 触发。 */
    | { type: 'VALUE.SET', value: string }
    /** 由 onKeyDown 排除 IME 与 Shift 后派发。 */
    | { type: 'KEY.ENTER' }
    | { type: 'COMPOSITION.START' }
    | { type: 'COMPOSITION.END' }
    | { type: 'SUBMIT' }
    | { type: 'STOP' }
    // 宿主改 disabled 后由 watch 派发
    | { type: 'CONTROLLED.DISABLE' }
    | { type: 'CONTROLLED.ENABLE' }
    // 宿主直接改 value 后由 watch 派发
    | { type: 'CONTROLLED.VALUE.EMPTY' }
    | { type: 'CONTROLLED.VALUE.FILLED' }
  tag: never
  guard: 'canSubmit' | 'isStreaming' | 'isValueEmpty' | 'isNextValueEmpty'
  action: 'setValue' | 'clearValue' | 'setComposing' | 'clearComposing' | 'invokeSubmit' | 'invokeStop' | 'syncDisabled' | 'syncValueState'
  effect: never
}

export interface ComposerApi<T extends PropTypes = PropTypes> {
  value: string
  /** 是否正在用输入法组合文字。 */
  isComposing: boolean
  /** 当前提交是否会真正发出，在机器守卫之外还额外要求非 disabled。 */
  canSubmit: boolean
  streaming: boolean
  disabled: boolean
  setValue: (value: string) => void
  submit: () => void
  stop: () => void
  getRootProps: () => T['element']
  getInputProps: () => T['textarea']
  getSubmitTriggerProps: () => T['button']
}
