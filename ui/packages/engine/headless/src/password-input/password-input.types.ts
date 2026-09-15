/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 password input 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface PasswordInputValueChangeDetails {
  /** 输入框中的原始串；提交进 FormData 的即它。 */
  value: string
}

export interface PasswordInputRevealedChangeDetails {
  /** true 表示当前明文已显示。 */
  revealed: boolean
}

/** 输入框当前的 type：隐藏态是原生密码框，显示态改为 text。 */
export type PasswordInputType = 'password' | 'text'

export interface PasswordInputSchema extends MachineSchema {
  props: {
    /** 受控值；提供后由宿主决定，状态机不自行修改。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    /** 受控的显隐态：明文是否显示；提供后由宿主决定。 */
    revealed?: boolean
    /** 非受控的初始显隐态，默认隐藏。 */
    defaultRevealed?: boolean
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    invalid?: boolean
    /** 表单字段名；提供后才参与提交。 */
    name?: string
    placeholder?: string
    /**
     * 写到 input 上的 autocomplete，默认 current-password。
     * 密码管理器据此决定该字段是填入旧密码还是保存新密码，注册表单要显式写 new-password。
     */
    autoComplete?: string
    /**
     * 强度档位，0 到 4 共五档。提供后才显示强度条，默认不显示。
     * 打分算法归调用方：口令强弱是产品规则（字典、泄漏库、业务口径），组件只负责绘制档位。
     * 超出区间的值被夹回区间。
     */
    strength?: number
    /** 读屏文案覆盖；未提供的条目使用组件内建英文。 */
    translations?: Partial<PasswordInputTranslations>
    /** 形态：outline / subtle / ghost，决定颜色的使用方式。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    onValueChange?: (details: PasswordInputValueChangeDetails) => void
    onRevealedChange?: (details: PasswordInputRevealedChangeDetails) => void
  }
  context: {
    value: string
    revealed: boolean
    /** 大写锁定是否开启。只有按键事件能报告，因此焦点离开输入框即清空。 */
    capsLock: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 单态：显隐与大写锁定都是 context 中的值，不编码进状态。 */
  state: 'idle'
  event:
    /** 用户输入或作者调用 setValue。 */
    | { type: 'VALUE.SET', value: string }
    /** 直接指定显隐态。 */
    | { type: 'REVEALED.SET', revealed: boolean }
    /** 切换显隐态，切换按钮经此路径。 */
    | { type: 'REVEALED.TOGGLE' }
    /** 按键事件报回的大写锁定状态，或焦点离开输入框时的清空。 */
    | { type: 'CAPS_LOCK.SET', on: boolean }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canEdit' | 'canReveal'
  action: 'setValue' | 'setRevealed' | 'toggleRevealed' | 'setCapsLock' | 'resetToDefault'
  effect: never
}

export interface PasswordInputApi<T extends PropTypes = PropTypes> {
  value: string
  /** 值为空串。 */
  empty: boolean
  /** 当前明文是否已显示。 */
  revealed: boolean
  /** 大写锁定是否开启；为真时提示部件才显示。 */
  capsLock: boolean
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 输入框当前的 type，随 revealed 变化。 */
  inputType: PasswordInputType
  /**
   * 大写锁定播报区当前的文字：开启时是 `translations.capsLockOn`，关闭时是空串。
   * 适配器把它写为提示部件的文本内容，读屏朗读的即这一段。
   */
  capsLockMessage: string
  /** 夹回 0–4 后的强度档位；未提供 strength 时为 undefined，此时强度条收起。 */
  strength: number | undefined
  /** 直接写值，只受 disabled / readOnly 约束。 */
  setValue: (next: string) => void
  /** 指定显隐态；整个控件禁用时不生效。 */
  setRevealed: (next: boolean) => void
  /** 切换显隐态；整个控件禁用时不生效。 */
  toggleRevealed: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getControlProps: () => T['element']
  getInputProps: () => T['input']
  getVisibilityTriggerProps: () => T['button']
  getCapsLockIndicatorProps: () => T['element']
  /** 强度条：档位写在 data-level 与 aria-valuenow 上；未提供 strength 时带 hidden 收起。 */
  getStrengthMeterProps: () => T['element']
}

/** 读屏文案，默认英文。 */
export interface PasswordInputTranslations {
  /** 隐藏态下切换按钮的 aria-label：按钮内通常只有一个眼睛图标，读屏无法朗读按下后的行为。 */
  visibilityTriggerShow: string
  /** 显示态下切换按钮的 aria-label：同一个按钮更换了动作，名字必须随之更换。 */
  visibilityTriggerHide: string
  /** 大写锁定提示的正文：这一句既是屏幕上可见的文字，也是活区域播报的内容。 */
  capsLockOn: string
  /** 强度条的可及名：条内通常只有几段色块，读屏无法朗读其含义。 */
  strengthMeter: string
}
