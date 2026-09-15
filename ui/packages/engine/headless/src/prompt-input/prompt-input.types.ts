/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 prompt input 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export type PromptInputState = 'empty' | 'editing' | 'disabled'

/**
 * 提交的按键档位。
 * `enter`：Enter 提交、Shift+Enter 换行、Mod+Enter 也提交。
 * `mod-enter`：Enter 换行，只有 Mod+Enter 提交。
 * `none`：Enter 与 Mod+Enter 都换行，键盘不提交；提交只剩按钮与程序化两条路径。
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
     * 正在生成：按钮换为停止身份，所有提交路径被拦截。
     * 使用一个布尔而不是四档运行态字符串：组件只需要二值判断，
     * 本轮进行到哪一步是宿主的事，透传为 data 属性属于作者的容器。
     */
    loading?: boolean
    /** 按哪一档提交，默认 enter。 */
    submitKey?: PromptInputSubmitKey
    /** 允许空值提交，默认 false；有附件时由作者置真。这是唯一为附件保留的钩子。 */
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
    /** 输入法组合中。组合期间的按键属于候选词框，一律不接受。 */
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
  /** 是否可以提交。比状态机守卫多一条非禁用，供按钮置灰使用。 */
  canSubmit: boolean
  loading: boolean
  disabled: boolean
  setValue: (next: string) => void
  submit: () => void
  stop: () => void
  getRootProps: () => T['element']
  /** 可选的输入行容器：渲染它后，输入框与按钮并排收在这一行中，root 改为纵向排列。 */
  getControlProps: () => T['element']
  getInputProps: () => T['textarea']
  getSubmitTriggerProps: () => T['button']
}

export interface PromptInputTranslations {
  /** 发送按钮的可访问名。 */
  send: string
  /** 生成期间同一个按钮的可访问名。 */
  stop: string
  /**
   * 输入框的可访问名。未提供时整条 aria-label 不输出：
   * 无条件发出会覆盖作者的 `<label for>` 与其自行编写的 aria-label。
   */
  input?: string
}
