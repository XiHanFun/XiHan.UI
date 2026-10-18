/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox group 相关实现。

import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { CheckboxGroupItemProps, CheckboxGroupNode, CheckboxGroupSchema, CheckboxGroupValueChangeDetails, CheckboxGroupVariant, FormControlState, ResolvedFormControlState } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import { checkboxGroupAnatomy, checkboxGroupMachine, checkboxGroupMeta, checkboxGroupStructure, connectCheckboxGroup, resolveFormControlState } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { createDisabledDeclarations } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 数值：缺席或空串翻成 undefined，由机器按「不设限」处理。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

// 值集合走逗号分隔（value="a,b"）：空串是空集合，只有 null 才翻成 undefined。
// 条目值里不能带逗号，用 property 赋值则不受限。
const LIST_CONVERTER = {
  fromAttribute: (v: string | null) => (v === null ? undefined : v.split(',').map(s => s.trim()).filter(Boolean)),
}

/**
 * `<xh-checkbox-group>`：Light-DOM 行为宿主：作者写 root / label 与若干 item 角色节点，
 * 每个 item 内自带 hidden-input / indicator / item-text，元素运行 checkbox-group 状态机
 * 并把 connect 产出接上。条目身份取自条目节点上的 value 属性。
 *
 * 不做 roving tabindex：组内每一项都是独立的 Tab 停靠点（禁用项也保留），容器自身不占位。
 *
 * 不写部件（或只写 root）时元素按标准结构生成：标题（label）与 collection 的条目，每个条目带表单影子、方框、
 * 文字与说明（给了才有）；全选格要用时手写部件。标题与条目文字可以由宿主直接子节点
 * `slot="label"`、`slot="item:<值>"` 接管。
 *
 * @customElement xh-checkbox-group
 * @attr {string} label - 标题文字：生成结构时铺带这段文字的 label 部件；手写部件时不使用它
 * @attr {string} value - 受控选中值，逗号分隔；未提供该属性即非受控
 * @attr {string} default-value - 非受控初始选中值，逗号分隔
 * @attr {string} item-values - 组内全部条目的值，逗号分隔；trigger 据此分辨全选与半选
 * @attr {number} min - 至少选几项；降到它时已选的条目改不动
 * @attr {number} max - 至多选几项；到了它时未选的条目改不动，全选只补到它为止
 * @attr {boolean} disabled - 整组禁用
 * @attr {boolean} read-only - 只读：可聚焦可朗读，不可修改
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} required - 必填：至少选一项，一项都没选时每份表单影子带原生 required
 * @attr {'horizontal'|'vertical'} orientation - 视觉排布，默认 vertical
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {'list'|'card'} variant - 结构形态，默认 list；card 把每个条目画成一张可点的卡
 * @attr {string} name - 表单字段名；提供后隐藏输入才带 name 并参与提交
 * @fires value-change - 选中值变化；detail 为 `{ value: string[] }`
 * @csspart root - role=group 容器
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart item - role=checkbox 条目，作者用 value 属性声明身份
 * @csspart indicator - 条目的视觉方框（对读屏隐藏）
 * @csspart item-text - 条目文本，条目的可及名来源
 * @csspart item-description - 条目文案下方的说明行，常用在 card 形态里
 * @csspart hidden-input - 条目的表单影子输入（必须是原生 input）
 * @csspart trigger - 全选 / 半选的父复选框，须写在 root 之内
 */
export class XhCheckboxGroupElement extends XhElement {
  static override partContract = { anatomy: checkboxGroupAnatomy, meta: checkboxGroupMeta }

  static override fieldTarget = { parts: ['root'], kind: 'group' } as const

  static override structure: ElementStructure<XhCheckboxGroupElement> = {
    build: host => host.ctrl.service
      ? checkboxGroupStructure(connectCheckboxGroup(host.ctrl.service, wcNormalize), {
          label: host.label,
          slotted: (name, key) => host.slotted(name, key),
        })
      : undefined,
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    label: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    value: { converter: LIST_CONVERTER },
    defaultValue: { converter: LIST_CONVERTER, attribute: 'default-value' },
    itemValues: { converter: LIST_CONVERTER, attribute: 'item-values' },
    min: { converter: NUMBER_CONVERTER },
    max: { converter: NUMBER_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    name: { converter: STRING_CONVERTER },
  }

  declare collection?: CheckboxGroupNode[]
  declare label?: string
  declare value?: string[]
  declare defaultValue?: string[]
  declare itemValues?: string[]
  declare min?: number
  declare max?: number
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare orientation?: Orientation
  declare tone?: Tone
  declare size?: Size
  declare variant?: CheckboxGroupVariant
  declare name?: string

  /** 条目的禁用声明：connect 每帧把 aria-disabled 写回条目，回读时跳过这些写回值，只认作者写的。 */
  private readonly declaredDisabled = createDisabledDeclarations()

  private readonly notify = (details: CheckboxGroupValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CheckboxGroupSchema>(this, checkboxGroupMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；本组件仅消费公开的三条轴。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private controlState(): ResolvedFormControlState {
    return resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      required: this.required,
    }, this.inheritedControl)
  }

  private machineProps(): Partial<CheckboxGroupSchema['props']> {
    const control = this.controlState()
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      itemValues: this.itemValues,
      min: this.min,
      max: this.max,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      required: control.required,
      orientation: this.orientation,
      tone: this.tone,
      size: this.size,
      variant: this.variant,
      name: this.name,
      // 作者写没写 label 角色节点决定根的 aria-labelledby 指不指过去
      labelled: this.getPart('label') != null,
      ariaLabel: this.hostAriaLabel(),
      onValueChange: this.notify,
    }
  }

  private itemProps(el: HTMLElement): CheckboxGroupItemProps {
    const value = el.getAttribute('value') ?? ''
    // 给了 collection 时，作者没写的禁用为 undefined，交给数据定夺
    const declared = this.declaredDisabled.read(el)
    return { value, disabled: this.collection ? declared : declared ?? false }
  }

  /** 取指定角色节点在 item 子树内的实例。 */
  private partsIn(item: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => item.contains(el))
  }

  /** 选中数到了 max：未选的条目改不动；还没进文档时为 false。 */
  get atMax(): boolean {
    return this.ctrl.service ? connectCheckboxGroup(this.ctrl.service, wcNormalize).atMax : false
  }

  /** 选中数降到 min：已选的条目改不动；还没进文档时为 false。 */
  get atMin(): boolean {
    return this.ctrl.service ? connectCheckboxGroup(this.ctrl.service, wcNormalize).atMin : false
  }

  // checked 单独落成 DOM property：spread 见到 false 只会 removeAttribute，关不掉选中态。
  private spreadHiddenInput(input: HTMLInputElement, props: Record<string, unknown>): void {
    const { checked, ...rest } = props
    this.spreader.spread(input, rest)
    input.checked = checked === true
  }

  protected wire(): void {
    const api = connectCheckboxGroup(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    // trigger 是多实例 part，逐个接线；root/label 只认头一个（label 的 id 是 aria-labelledby 的唯一目标）
    for (const el of this.getParts('select-all-trigger'))
      this.spreader.spread(el, api.getSelectAllTriggerProps() as Record<string, unknown>)

    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      this.declaredDisabled.commit(el)
      for (const input of this.partsIn(el, 'hidden-input'))
        this.spreadHiddenInput(input as HTMLInputElement, api.getHiddenInputProps(item) as Record<string, unknown>)
      for (const control of this.partsIn(el, 'indicator'))
        this.spreader.spread(control, api.getIndicatorProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const description of this.partsIn(el, 'item-description'))
        this.spreader.spread(description, api.getItemDescriptionProps(item) as Record<string, unknown>)
    }
  }
}
