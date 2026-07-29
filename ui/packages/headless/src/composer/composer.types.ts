import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'

/**
 * 宿主运行态在输入框眼里的投影：只区分「现在能不能发」。
 * 真源在宿主那边（它知道 submitted/streaming/error 等更细的分档），这里只收两档，
 * 免得组件跟着宿主的状态机一起演化。
 */
export type ComposerRunStatus = 'ready' | 'streaming'

export type ComposerState = 'empty' | 'editing' | 'disabled'

export interface ComposerValueChangeDetails {
  value: string
}

export interface ComposerSubmitDetails {
  /** 提交那一刻输入框里的原文；清空发生在回调之后。 */
  value: string
}

/** 读屏用的文案。默认英文，与 dialog / carousel 的 translations 同一套写法。 */
export interface ComposerTranslations {
  send: string
  stop: string
  input: string
}

export interface ComposerSchema extends MachineSchema {
  props: {
    /** 受控值；给了就由宿主说了算，机器不自改。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    disabled?: boolean
    /** 外部运行态的受控投影，真源在宿主。 */
    runStatus?: ComposerRunStatus
    /** Enter 直接提交（Shift+Enter 换行）。默认 true。 */
    submitOnEnter?: boolean
    translations?: Partial<ComposerTranslations>
    onValueChange?: (details: ComposerValueChangeDetails) => void
    onSubmit?: (details: ComposerSubmitDetails) => void
    onStop?: () => void
  }
  context: {
    value: string
    /** IME 组合态，纯本地。它为真时一切提交路径都得让开，选词的回车不是发送的回车。 */
    isComposing: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /**
   * 没有 submitting 态：请求在飞的事实由宿主经 runStatus 告知，
   * 机器里再放一份就成了第二真源——而且那还会是个没有出口事件的死态。
   */
  state: ComposerState
  event:
    /** textarea 的 onInput，或作者调 setValue。 */
    | { type: 'VALUE.SET', value: string }
    /** onKeyDown 判掉 IME 与 Shift 之后才发得出来。 */
    | { type: 'KEY.ENTER' }
    | { type: 'COMPOSITION.START' }
    | { type: 'COMPOSITION.END' }
    | { type: 'SUBMIT' }
    | { type: 'STOP' }
    // 受控回写：宿主改 disabled 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.DISABLE' }
    | { type: 'CONTROLLED.ENABLE' }
    // 同上，宿主直接改 value 时由 watch 派发，让空/非空状态追上实际值
    | { type: 'CONTROLLED.VALUE.EMPTY' }
    | { type: 'CONTROLLED.VALUE.FILLED' }
  tag: never
  guard: 'canSubmit' | 'isStreaming' | 'isValueEmpty' | 'isNextValueEmpty'
  action: 'setValue' | 'clearValue' | 'setComposing' | 'clearComposing' | 'invokeSubmit' | 'invokeStop' | 'syncDisabled' | 'syncValueState'
  effect: never
}

export interface ComposerApi<T extends PropTypes = PropTypes> {
  value: string
  /** 正在用输入法拼字。作者据此压住自己那套回车快捷键。 */
  isComposing: boolean
  /** 此刻按发送真的会发出去。比机器守卫多算了一条 disabled，见 connect 里的说明。 */
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
