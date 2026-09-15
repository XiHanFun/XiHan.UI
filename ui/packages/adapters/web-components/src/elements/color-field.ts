/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ColorFieldSchema, ColorFieldValueChangeDetails, ColorFormat, FormControlState } from '@xihan-ui/headless'
import { colorFieldAnatomy, colorFieldMachine, colorFieldMeta, connectColorField, resolveFormControlState } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/** 属性缺席转换为 undefined，默认值由状态机决定。 */
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
/** 布尔属性：出现即 true，写 "false" 才是 false；缺席不覆盖状态机默认值。 */
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-color-field>`：Light-DOM 行为宿主，运行 color-field 状态机并把 connect 产出接到
 * root / label / control / swatch / input / clear-trigger / hidden-input 等角色节点。
 *
 * 一个可手动输入颜色串的字段：框中的文字是草稿，回车或失焦时接受，可解析时按 format 重写为值，
 * 不可解析时留在框中并标为无效；旁边的色块经色块面家族绘制当前颜色。
 *
 * @customElement xh-color-field
 * @attr {string} value - 受控的颜色串；未提供该属性即非受控。空串表示没有颜色
 * @attr {string} default-value - 非受控初值，默认空串
 * @attr {'hex'|'rgba'|'hsla'} format - 值串的写法，默认 hex；手动输入的任何写法接受后都按它重写
 * @attr {boolean} alpha - 带透明度，默认关闭；关闭时接受的颜色恒为不透明
 * @attr {string} placeholder - 占位文案
 * @attr {boolean} disabled - 禁用：不可聚焦、不可写入
 * @attr {boolean} read-only - 只读：仍可聚焦与复制，不可写入
 * @attr {boolean} required - 必填标注
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} name - 表单字段名；提供后才参与提交（经表单影子，框中的草稿不会被提交）
 * @attr {boolean} clearable - 开启清空：有值时显示清空按钮，Escape 接管
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：outline / subtle / ghost，默认 outline
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @prop {object} translations - 读屏文案（只能通过 property 设置）：clearTrigger 是清空按钮的名字
 * @fires value-change - 已接受的值变化；detail 为 `{ value: string }`，输入途中不发出
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty / data-editing 的容器
 * @csspart control - 视觉盒；提供后由它绘制描边、底色与聚焦环，色块、输入框与清空按钮排列在其中
 * @csspart label - 标题；`for` 恒指向 input，因此须是原生 `<label>` 才可点击
 * @csspart swatch - 当前颜色的色块；颜色由元素写入私有槽，空值或无效时只绘制棋盘格
 * @csspart input - 实际的输入框，须是原生 `<input>`；键盘交互全部在它身上
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位，名字取 translations.clearTrigger；无法清空时收起
 * @csspart hidden-input - 表单影子；提交的是已接受的值
 */
export class XhColorFieldElement extends XhElement {
  static override partContract = { anatomy: colorFieldAnatomy, meta: colorFieldMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    format: { converter: STRING_CONVERTER },
    alpha: { converter: BOOLEAN_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    clearable: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare format?: ColorFormat
  declare alpha?: boolean
  declare placeholder?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare clearable?: boolean
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: ColorFieldSchema['props']['translations']

  private readonly notify = (details: ColorFieldValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ColorFieldSchema>(this, colorFieldMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** Form 或 Field 发现此 Light-DOM 控件后调用；不是公开的业务写值入口。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<ColorFieldSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      required: this.required,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      format: this.format,
      alpha: this.alpha,
      placeholder: this.placeholder,
      disabled: control.disabled,
      readOnly: control.readOnly,
      required: control.required,
      invalid: control.invalid,
      name: this.name,
      clearable: this.clearable ?? false,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  /** 当前是否可以清空（开启 clearable、可编辑且有值）。状态机尚未建立时为 false。 */
  get canClear(): boolean {
    return this.ctrl.service ? connectColorField(this.ctrl.service, wcNormalize).canClear : false
  }

  /** 输入框中存在尚未提交的草稿。状态机尚未建立时为 false。 */
  get editing(): boolean {
    return this.ctrl.service ? connectColorField(this.ctrl.service, wcNormalize).editing : false
  }

  /** 从外部写值：空串清空，无法解析的串保持原值；只受禁用、只读约束。状态机尚未建立时为空操作。 */
  setValue(next: string): void {
    if (this.ctrl.service)
      connectColorField(this.ctrl.service, wcNormalize).setValue(next)
  }

  /** 执行清空意图，canClear 不成立时不做任何处理；无条件清空请使用 setValue('')。 */
  clear(): void {
    if (this.ctrl.service)
      connectColorField(this.ctrl.service, wcNormalize).clear()
  }

  /** 提交输入框中的草稿（与回车 / 失焦同一路径）。 */
  commit(): void {
    if (this.ctrl.service)
      connectColorField(this.ctrl.service, wcNormalize).commit()
  }

  protected wire(): void {
    const api = connectColorField(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('swatch', api.getSwatchProps() as Record<string, unknown>)
    // 输入框的 value 不必另外回写：spreader 把 value 当 property 写，盖得住用户输入过的框
    put('input', api.getInputProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 收起清空按钮只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条 display
    // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
    this.setPartHidden(this.getPart('clear-trigger'), !api.canClear)
  }
}
