/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 format input 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { FormatSpec } from '@xihan-ui/expression'
import type { FormatInputApi, FormatInputKind, FormatInputSchema, FormatInputValueChangeDetails, FormControlState } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import { connectFormatInput, formatInputAnatomy, formatInputMachine, formatInputMeta, formatInputStructure, formatInputTranslations, resolveFormControlState } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'
import { XhComboboxElement } from './combobox'
import { XhNumberFieldElement } from './number-field'
import { XhSelectElement } from './select'
import { XhSwitchElement } from './switch'
import { XhToggleGroupElement } from './toggle-group'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 元素还没进文档时调命令式方法的报错。 */
function notConnected(method: string): Error {
  return new Error(`[xh] <xh-format-input> 还没进文档，${method} 此时不可用`)
}

/**
 * `<xh-format-input>`：编辑一份格式说明（`@xihan-ui/expression` 的 FormatSpec）。先选种类，再填这一种的参数，下方显示样例。
 *
 * 不写部件（或只写 root）时元素按标准结构生成：种类控件、当前种类的参数行、样例与行内说明。
 * 里面的下拉、分段切换、数字框、开关与组合框都是库内元素的实例，结构由它们自己生成；按需注册本元素时连带注册它们。
 * 种类一换，参数行整组换。值是对象，只能经 property 赋值。
 *
 * @customElement xh-format-input
 * @prop {FormatSpec | null} value - 受控的格式说明；null 表示不设格式，未赋值即非受控
 * @prop {FormatSpec | null} defaultValue - 非受控初值
 * @prop {string[]} kinds - 可选的种类，缺省全部（number、percent、date、rmb-upper、numeral）
 * @prop {string[]} datePatterns - 日期模式的预设；也可以自由输入
 * @prop {unknown} sample - 样例的输入值；缺省按种类取
 * @prop {object} translations - 文案（只能通过 property 设置）
 * @attr {boolean} clearable - 种类里多一项「不设格式」，选它派发 null；缺省 true，写 clearable="false" 关掉
 * @attr {string} locale - 交给格式化，只影响样例
 * @attr {string} time-zone - 交给格式化，只影响样例
 * @attr {boolean} disabled - 禁用：里面的控件都不可操作
 * @attr {boolean} read-only - 只读：里面的控件可聚焦、不可修改
 * @attr {boolean} invalid - 校验失败标注；草稿不完整时也标
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态，传给里面的控件
 * @attr {'sm'|'md'|'lg'} size - 尺寸，传给里面的控件
 * @fires value-change - 合法的格式说明变了；detail 为 `{ value: FormatSpec | null }`。输入中途不完整时不派发
 * @csspart root - role=group，承载 data-kind / data-invalid / data-disabled / data-readonly
 * @csspart label - 标题，可选；写了它根以它为名，放进 xh-field 时用字段的标题
 * @csspart kind - 种类控件的外包：种类不超过三项时是 fieldset（名字在 legend），否则是放下拉的 div
 * @csspart field-group - 当前种类的参数行，够宽时自动分栏
 * @csspart item - 一个参数行，value 是参数名；分段切换那一行是 fieldset，开关那一行是 label，其余是 div
 * @csspart item-label - 分段切换与开关那几行的名字；带标题的控件自己铺标题
 * @csspart pattern-description - 日期模式的占位符说明
 * @csspart preview - 样例，role=status；停止输入一会儿后才换文字
 * @csspart error-text - 草稿不完整时的行内说明，进根的描述链
 */
export class XhFormatInputElement extends XhElement {
  static override partContract = { anatomy: formatInputAnatomy, meta: formatInputMeta }

  static override fieldTarget = { parts: ['root'], kind: 'group' } as const

  static override dependencies = {
    'xh-combobox': XhComboboxElement,
    'xh-number-field': XhNumberFieldElement,
    'xh-select': XhSelectElement,
    'xh-switch': XhSwitchElement,
    'xh-toggle-group': XhToggleGroupElement,
  }

  static override structure: ElementStructure<XhFormatInputElement> = {
    build: host => host.ctrl.service
      ? formatInputStructure(connectFormatInput(host.ctrl.service, wcNormalize), formatInputTranslations(host.ctrl.service.prop))
      : undefined,
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { attribute: false },
    defaultValue: { attribute: false },
    kinds: { attribute: false },
    datePatterns: { attribute: false },
    sample: { attribute: false },
    clearable: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    timeZone: { converter: STRING_CONVERTER, attribute: 'time-zone' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: FormatSpec | null
  declare defaultValue?: FormatSpec | null
  declare kinds?: readonly FormatInputKind[]
  declare datePatterns?: readonly string[]
  declare sample?: unknown
  declare clearable?: boolean
  declare locale?: string
  declare timeZone?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare variant?: ControlVariant
  declare size?: Size
  declare translations?: FormatInputSchema['props']['translations']

  private readonly notify = (details: FormatInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<FormatInputSchema>(this, formatInputMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；格式输入消费禁用、只读与无效三轴，再经组合节点交给里面的控件。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<FormatInputSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      labelled: this.getPart('label') != null,
      ariaLabel: this.hostAriaLabel(),
      value: this.value,
      defaultValue: this.defaultValue,
      kinds: this.kinds,
      datePatterns: this.datePatterns,
      sample: this.sample,
      clearable: this.clearable,
      locale: this.locale,
      timeZone: this.timeZone,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      variant: this.variant,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  // 状态机此刻的 api；元素还没进文档时为 null
  private api(): FormatInputApi | null {
    return this.ctrl.service ? connectFormatInput(this.ctrl.service, wcNormalize) : null
  }

  /** 当前的格式说明；状态机尚未建立时取 value 或 defaultValue。 */
  get currentValue(): FormatSpec | null {
    const api = this.api()
    return api ? api.value : (this.value ?? this.defaultValue ?? null)
  }

  /** 草稿当前的种类；不设格式时为 null。 */
  get kind(): FormatInputKind | null {
    return this.api()?.kind ?? null
  }

  /** 编辑中的草稿，可能还不完整；状态机尚未建立时为 null。 */
  get draft(): FormatInputApi['draft'] | null {
    return this.api()?.draft ?? null
  }

  /** 草稿为什么还不能派发；完整时为 null。 */
  get issue(): FormatInputApi['issue'] {
    return this.api()?.issue ?? null
  }

  /** issue 的说明文字，随语言包；没有问题时为空串。 */
  get issueText(): string {
    return this.api()?.issueText ?? ''
  }

  /** 样例此刻播报的文字；停止输入一会儿后才换。 */
  get previewText(): string {
    return this.api()?.previewText ?? ''
  }

  /** 当前种类要铺的参数行，按显示顺序。 */
  get options(): FormatInputApi['options'] {
    return this.api()?.options ?? []
  }

  /** 种类控件的条目：值与显示文字，「不设格式」排在最前。 */
  get kindItems(): FormatInputApi['kindItems'] {
    return this.api()?.kindItems ?? []
  }

  /** 种类控件用哪一种：不超过三项时是分段切换，否则是下拉。 */
  get kindControl(): FormatInputApi['kindControl'] {
    return this.api()?.kindControl ?? 'select'
  }

  /** 换种类；null 表示不设格式。 */
  setKind(kind: FormatInputKind | null): void {
    const api = this.api()
    if (!api)
      throw notConnected('setKind')
    api.setKind(kind)
  }

  /** 换小数位的写法：固定、范围或不舍入。 */
  setDecimalsMode(mode: Parameters<FormatInputApi['setDecimalsMode']>[0]): void {
    const api = this.api()
    if (!api)
      throw notConnected('setDecimalsMode')
    api.setDecimalsMode(mode)
  }

  /** 改位数的文字；清空时草稿不完整，不派发。 */
  setDecimals(field: Parameters<FormatInputApi['setDecimals']>[0], text: string): void {
    const api = this.api()
    if (!api)
      throw notConnected('setDecimals')
    api.setDecimals(field, text)
  }

  /** 开关千分位。 */
  setGrouping(grouping: boolean): void {
    const api = this.api()
    if (!api)
      throw notConnected('setGrouping')
    api.setGrouping(grouping)
  }

  /** 换舍入方式。 */
  setRounding(rounding: Parameters<FormatInputApi['setRounding']>[0]): void {
    const api = this.api()
    if (!api)
      throw notConnected('setRounding')
    api.setRounding(rounding)
  }

  /** 改日期模式；清空时草稿不完整，不派发。 */
  setPattern(pattern: string): void {
    const api = this.api()
    if (!api)
      throw notConnected('setPattern')
    api.setPattern(pattern)
  }

  /** 换数字字形的样式。 */
  setNumeralStyle(style: Parameters<FormatInputApi['setNumeralStyle']>[0]): void {
    const api = this.api()
    if (!api)
      throw notConnected('setNumeralStyle')
    api.setNumeralStyle(style)
  }

  protected wire(): void {
    const api = connectFormatInput(this.ctrl.service, wcNormalize)
    const put = (el: HTMLElement | null, props: Record<string, unknown>): void => {
      if (el)
        this.spreader.spread(el, props)
    }
    put(this.getPart('root'), api.getRootProps() as Record<string, unknown>)
    put(this.getPart('label'), api.getLabelProps() as Record<string, unknown>)
    put(this.getPart('kind'), api.getKindProps() as Record<string, unknown>)
    put(this.getPart('field-group'), api.getFieldGroupProps() as Record<string, unknown>)
    for (const el of this.getParts('item')) {
      const option = el.getAttribute('value')
      if (option)
        put(el, api.getItemProps(option as never) as Record<string, unknown>)
    }
    for (const el of this.getParts('item-label')) {
      const option = el.getAttribute('value')
      if (option)
        put(el, api.getItemLabelProps(option as never) as Record<string, unknown>)
    }
    put(this.getPart('pattern-description'), api.getPatternDescriptionProps() as Record<string, unknown>)
    put(this.getPart('preview'), api.getPreviewProps() as Record<string, unknown>)
    put(this.getPart('error-text'), api.getErrorTextProps() as Record<string, unknown>)
  }
}
