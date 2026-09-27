/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time zone select 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { TimeZoneSelectApi, TimeZoneSelectInputValueChangeDetails, TimeZoneSelectOption, TimeZoneSelectProps, TimeZoneSelectTranslations, TimeZoneSelectValueChangeDetails } from '@xihan-ui/headless'
import { connectTimeZoneSelect, timeZoneSelectAnatomy, timeZoneSelectMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }
const BOOLEAN_CONVERTER = { fromAttribute: (value: string | null) => (value === null ? undefined : value !== 'false') }
const NUMBER_CONVERTER = { fromAttribute: (value: string | null) => (value === null ? undefined : Number(value)) }

interface ComboboxHost extends HTMLElement {
  collection?: TimeZoneSelectOption[]
  translations?: { trigger?: string, clearTrigger?: string }
  value?: string | string[]
  defaultValue?: string | string[]
  name?: string
  form?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  loop?: boolean
  placeholder?: string
  openOnClick?: boolean
  inputBehavior?: string
  placement?: Placement
  offset?: number
  direction?: Direction
  variant?: ControlVariant
  tone?: Tone
  size?: Size
}

/**
 * `<xh-time-zone-select>` —— IANA 时区专用的 Combobox 组合根。
 *
 * Light DOM 中放一棵 `<xh-combobox>`；本元素生成候选、翻译标量值并提供 `getOptions(query)`，
 * 内层组合框继续负责输入、浮层、键盘、表单和可访问关系。
 *
 * @customElement xh-time-zone-select
 * @attr {string} value - 受控 IANA 时区；空串不代表 null，清空请移除属性或设置 property 为 null
 * @attr {string} default-value - 非受控初始时区
 * @attr {number} reference-time - 计算 UTC 偏移的毫秒时间点
 * @attr {string} locale - 时区排序与检索地区
 * @attr {string} name - 表单字段名
 * @attr {string} form - 显式关联的表单 ID
 * @attr {boolean} disabled - 禁用
 * @attr {boolean} read-only - 只读
 * @attr {boolean} invalid - 校验失败
 * @attr {boolean} loading - 候选加载中
 * @attr {boolean} loop - 方向键到末尾是否回绕
 * @attr {'top'|'top-start'|'top-end'|'right'|'right-start'|'right-end'|'bottom'|'bottom-start'|'bottom-end'|'left'|'left-start'|'left-end'} placement - 浮层首选位置
 * @attr {'ltr'|'rtl'} dir - 文字方向
 * @attr {number} offset - 浮层间距
 * @attr {'outline'|'subtle'|'ghost'} variant - 控件形态
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 时区变化；detail 为 `{ value: string | null }`
 * @fires input-value-change - 检索文本变化；detail 与 Combobox 相同
 * @csspart root - 组合根；内部交互部件沿用 xh-combobox 的 csspart
 */
export class XhTimeZoneSelectElement extends XhElement {
  static override partContract = { anatomy: timeZoneSelectAnatomy, meta: timeZoneSelectMeta }

  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    timeZones: { attribute: false },
    referenceTime: { converter: NUMBER_CONVERTER, attribute: 'reference-time' },
    locale: { converter: STRING_CONVERTER },
    name: { converter: STRING_CONVERTER },
    form: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    loading: { converter: BOOLEAN_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    offset: { converter: NUMBER_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: string | null
  declare defaultValue?: string | null
  declare timeZones?: readonly string[]
  declare referenceTime?: number
  declare locale?: string
  declare name?: string
  declare form?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare loading?: boolean
  declare loop?: boolean
  declare placement?: Placement
  declare direction?: Direction
  declare offset?: number
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<TimeZoneSelectTranslations>

  private readonly createdAt = Date.now()
  private api: TimeZoneSelectApi | null = null
  private query = ''
  private selecting = false
  private combo: ComboboxHost | null = null
  private content: HTMLElement | null = null

  /** 供 Light DOM 作者按同一真源创建或过滤 item 节点。 */
  getOptions(query = ''): readonly TimeZoneSelectOption[] {
    return this.api?.filter(query) ?? []
  }

  private readonly onValueChange = (event: Event): void => {
    event.stopPropagation()
    const values = (event as CustomEvent<{ value?: string[] }>).detail?.value ?? []
    this.selecting = true
    queueMicrotask(() => {
      this.selecting = false
    })
    const details: TimeZoneSelectValueChangeDetails = { value: values[0] ?? null }
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly onInputValueChange = (event: Event): void => {
    event.stopPropagation()
    const details: TimeZoneSelectInputValueChangeDetails = {
      inputValue: (event as CustomEvent<{ inputValue?: string }>).detail?.inputValue ?? '',
    }
    this.query = this.selecting ? '' : details.inputValue
    this.selecting = false
    this.syncCombo()
    this.dispatchEvent(new CustomEvent('input-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly onOpenChange = (event: Event): void => {
    event.stopPropagation()
  }

  private bindCombo(next: ComboboxHost | null): void {
    if (next === this.combo)
      return
    this.combo?.removeEventListener('value-change', this.onValueChange)
    this.combo?.removeEventListener('input-value-change', this.onInputValueChange)
    this.combo?.removeEventListener('open-change', this.onOpenChange)
    this.combo = next
    this.content = next?.querySelector<HTMLElement>('[data-xh-part="content"]') ?? null
    next?.addEventListener('value-change', this.onValueChange)
    next?.addEventListener('input-value-change', this.onInputValueChange)
    next?.addEventListener('open-change', this.onOpenChange)
  }

  private syncCombo(): void {
    const combo = this.combo
    const api = this.api
    if (!combo || !api)
      return
    const text = {
      label: this.translations?.label ?? 'Time zone',
      placeholder: this.translations?.placeholder ?? 'Search time zones',
      empty: this.translations?.empty ?? 'No time zones found',
      trigger: this.translations?.trigger ?? 'Show time zones',
      clearTrigger: this.translations?.clearTrigger ?? 'Clear time zone',
    }
    const options = api.filter(this.query)
    combo.collection = options
    combo.value = this.value === undefined ? undefined : this.value ?? []
    combo.defaultValue = this.defaultValue ?? undefined
    combo.name = this.name
    combo.form = this.form
    combo.disabled = this.disabled
    combo.readOnly = this.readOnly
    combo.invalid = this.invalid
    combo.loading = this.loading
    combo.loop = this.loop
    combo.placeholder = text.placeholder
    combo.translations = { trigger: text.trigger, clearTrigger: text.clearTrigger }
    combo.openOnClick = true
    combo.inputBehavior = 'autohighlight'
    combo.placement = this.placement
    combo.direction = this.direction
    combo.offset = this.offset
    combo.variant = this.variant
    combo.tone = this.tone
    combo.size = this.size

    const root = this.getPart('root')
    const label = root?.querySelector<HTMLElement>('[data-xh-part="label"]')
    const empty = root?.querySelector<HTMLElement>('[data-xh-part="empty"]')
    if (label && !label.textContent?.trim())
      label.textContent = text.label
    if (empty && !empty.textContent?.trim())
      empty.textContent = text.empty
    this.renderOptions(options)
  }

  /** content 会被内层 Combobox portal 搬走；保存节点引用后仍可安全更新作者提供的列表容器。 */
  private renderOptions(options: readonly TimeZoneSelectOption[]): void {
    const content = this.content
    if (!content)
      return
    const nodes = options.map((option) => {
      const item = this.ownerDocument.createElement('div')
      item.dataset.xhPart = 'item'
      item.setAttribute('value', option.value)
      const text = this.ownerDocument.createElement('span')
      text.dataset.xhPart = 'item-text'
      text.textContent = option.label
      const description = this.ownerDocument.createElement('span')
      description.dataset.xhPart = 'item-description'
      description.textContent = option.description
      item.append(text, description)
      return item
    })
    content.replaceChildren(...nodes)
  }

  protected wire(): void {
    const props = this.configured('time-zone-select', {
      value: this.value,
      defaultValue: this.defaultValue,
      timeZones: this.timeZones,
      referenceTime: this.referenceTime ?? this.createdAt,
      locale: this.locale,
      name: this.name,
      form: this.form,
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      loading: this.loading,
      loop: this.loop,
      placement: this.placement,
      dir: this.direction,
      offset: this.offset,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
    } as TimeZoneSelectProps)
    this.api = connectTimeZoneSelect(props, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, this.api.getRootProps() as Record<string, unknown>)
    this.bindCombo(root?.querySelector<ComboboxHost>('xh-combobox') ?? null)
    this.syncCombo()
  }

  override disconnectedCallback(): void {
    this.bindCombo(null)
    super.disconnectedCallback()
  }
}
