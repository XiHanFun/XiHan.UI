/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 password input 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { FormControlState, PasswordInputRevealedChangeDetails, PasswordInputSchema, PasswordInputTranslations, PasswordInputValueChangeDetails } from '@xihan-ui/headless'
import { connectPasswordInput, passwordInputAnatomy, passwordInputMachine, passwordInputMeta, resolveFormControlState } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
// Lit 默认的 Boolean 转换器是 v !== null，受控的 revealed 会因此再也表达不了「宿主没管」
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 数值缺席或空串翻成 undefined，以此区分"没给"与 0。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-password-input>`：Light-DOM 行为宿主：作者写 root / label / control / input /
 * visibility-trigger / caps-lock-indicator 六类角色节点，元素运行 password-input 状态机并把 connect 产出接上。
 *
 * label 的 `for` 恒指向 input 的 id，因此 label 角色节点必须是原生 `<label>`、input 角色节点必须是原生
 * `<input>`；切换按钮必须是原生 `<button>`，Enter / Space 的激活由平台负责。
 *
 * 显隐只改变 input 的 type：隐藏态 password、显示态 text。切换之后焦点留在按钮上，
 * 框中的光标与选中范围由状态机放回原处。
 *
 * 大写锁定依靠按键事件中的 getModifierState 判定：平台没有主动查询修饰键的接口，
 * 因此提示要等用户按下第一个键才显示，焦点离开输入框即熄灭。提示节点由作者写空壳，
 * 其中的文字由元素写入。
 *
 * @customElement xh-password-input
 * @attr {string} value - 受控值；未提供该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {boolean} revealed - 受控的显隐态（明文是否显示）；未提供该属性即非受控
 * @attr {boolean} default-revealed - 非受控的初始显隐态，默认隐藏
 * @attr {boolean} disabled - 禁用：输入与显隐切换都不可操作
 * @attr {boolean} read-only - 只读：值不可写入，显隐照常切换
 * @attr {boolean} required - 必填标注
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} name - 表单字段名；提供后才参与提交
 * @attr {string} placeholder - 占位文案
 * @attr {string} auto-complete - 写到 input 上的 autocomplete，默认 current-password；注册表单要写 new-password
 * @attr {number} strength - 强度档位 0–4；提供后才显示强度条，打分算法归调用方
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @fires revealed-change - 显隐变化；detail 为 `{ revealed: boolean }`
 * @csspart root - 承载三个视觉轴与 data-disabled / data-readonly / data-invalid / data-empty 的容器
 * @csspart label - 标题；`for` 恒指向 input，因此须是原生 `<label>` 才可点击
 * @csspart control - 视觉盒：描边、底色与聚焦环绘制在它身上，框内三个部件都是透明分段
 * @csspart input - 实际的输入框，须是原生 `<input>`；type 随显隐在 password / text 之间切换
 * @csspart visibility-trigger - 显隐切换按钮，须是原生 `<button>`；名字随状态切换，其中放置图标即可
 * @csspart caps-lock-indicator - 大写锁定提示；节点留空即可，文字由元素写入，是 role=status 的活区域
 * @csspart strength-meter - 强度条，role=meter；档位写在 data-level 与 aria-valuenow 上，未提供 strength 时收起
 */
export class XhPasswordInputElement extends XhElement {
  static override partContract = { anatomy: passwordInputAnatomy, meta: passwordInputMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    revealed: { converter: BOOLEAN_CONVERTER },
    defaultRevealed: { converter: BOOLEAN_CONVERTER, attribute: 'default-revealed' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    autoComplete: { converter: STRING_CONVERTER, attribute: 'auto-complete' },
    strength: { converter: NUMBER_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare revealed?: boolean
  declare defaultRevealed?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare placeholder?: string
  declare autoComplete?: string
  declare strength?: number
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<PasswordInputTranslations>

  private readonly notifyValue = (details: PasswordInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyRevealed = (details: PasswordInputRevealedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('revealed-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<PasswordInputSchema>(this, passwordInputMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；四轴优先级由 Headless 真源结算。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<PasswordInputSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      required: this.required,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect
      revealed: this.revealed,
      defaultRevealed: this.defaultRevealed,
      disabled: control.disabled,
      readOnly: control.readOnly,
      required: control.required,
      invalid: control.invalid,
      name: this.name,
      placeholder: this.placeholder,
      autoComplete: this.autoComplete,
      strength: this.strength,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onRevealedChange: this.notifyRevealed,
    }
  }

  protected wire(): void {
    const api = connectPasswordInput(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('visibility-trigger', api.getVisibilityTriggerProps() as Record<string, unknown>)
    put('caps-lock-indicator', api.getCapsLockIndicatorProps() as Record<string, unknown>)
    put('strength-meter', api.getStrengthMeterProps() as Record<string, unknown>)
    // 输入框的 value 不必在这里另外回写：spreader 把 value/checked/selected 三个键当 property 写，
    // 属性写法只管初值、盖不住用户输入过的框

    // 提示区的文字归元素写，作者把这个节点留空即可。
    // 只在真的不一样时才写：每一帧都重挂一次同样的文本会让活区域反复播报
    const hint = this.getPart('caps-lock-indicator')
    if (hint && hint.textContent !== api.capsLockMessage)
      hint.textContent = api.capsLockMessage
  }
}
