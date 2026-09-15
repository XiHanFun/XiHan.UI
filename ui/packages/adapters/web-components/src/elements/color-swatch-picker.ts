/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { ColorSwatchPickerItemProps, ColorSwatchPickerNode, ColorSwatchPickerNodeMeta, ColorSwatchPickerSchema, ColorSwatchPickerValueChangeDetails, FormControlState, ResolvedFormControlState } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { colorSwatchPickerAnatomy, colorSwatchPickerMachine, colorSwatchPickerMeta, connectColorSwatchPicker, resolveFormControlState } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/** 属性缺席转换为 undefined，默认值由状态机决定。 */
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
/** 布尔属性：出现即 true，写 "false" 才是 false；缺席不覆盖状态机默认值。 */
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-color-swatch-picker>`：Light-DOM 行为宿主，运行 color-swatch-picker 状态机并把 connect 产出接到
 * root / label / item / swatch / indicator / hidden-input 等角色节点。
 *
 * 从若干固定颜色中选择一个：与单选组同一套 roving tabindex，方向键移动焦点并选中，Space 选中；
 * 每格的色块面经 Swatch 家族绘制，颜色由元素写入私有槽。
 *
 * @customElement xh-color-swatch-picker
 * @attr {string} value - 受控选中的颜色串；未提供该属性即非受控。写法不同的同一颜色也视为选中
 * @attr {string} default-value - 非受控初始选中值
 * @attr {boolean} disabled - 整组禁用
 * @attr {boolean} read-only - 只读：不可选择，方向键照常移动焦点
 * @attr {boolean} invalid - 校验失败态
 * @attr {boolean} required - 必填
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义，默认 ltr
 * @attr {string} name - 表单字段名；提供后隐藏输入才带 name 并参与提交
 * @attr {'sm'|'md'|'lg'} size - 尺寸：影响格子的边长与间距
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气：决定选中环与选中标记使用哪族颜色
 * @prop {ColorSwatchPickerNode[]} swatches - 格子数据（只能通过 property 设置）：可及名与禁用的事实源，格子部件只需声明 value
 * @prop {object} translations - 读屏文案（只能通过 property 设置）：group 是整组的名字，swatch(value) 是一格的名字
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @prop {string|null} selectedValue - 只读：当前选中的颜色串（受控与非受控都读取状态机）
 * @prop {ColorSwatchPickerNodeMeta[]} swatchMeta - 只读：由 swatches 推导的格子元信息，名字与禁用已确定
 * @prop {string|null} focusedValue - 只读：焦点锚点的格子串，焦点在组外时为 null
 * @csspart root - role=radiogroup 容器（承载 roving tabindex 的兜底位）
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart item - role=radio 的一格，作者用 value 属性声明颜色串、可用 label 属性提供名字
 * @csspart swatch - 格内的色块面；颜色由元素写入私有槽，无法解析的串只绘制棋盘格
 * @csspart indicator - 格子的选中标记
 * @csspart hidden-input - 格子的表单影子输入（必须是原生 input）
 */
export class XhColorSwatchPickerElement extends XhElement {
  static override partContract = { anatomy: colorSwatchPickerAnatomy, meta: colorSwatchPickerMeta }

  static override properties = {
    swatches: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    name: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare swatches?: ColorSwatchPickerNode[]
  declare value?: string
  declare defaultValue?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare direction?: Direction
  declare name?: string
  declare size?: Size
  declare tone?: Tone
  declare translations?: ColorSwatchPickerSchema['props']['translations']

  // 整组禁用期间的格子自身声明快照：connect 每帧把 aria-disabled 写回格子，回读分不清作者声明与自己的写回
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整组禁用：解禁当帧 DOM 上仍保留着状态机写回的 aria-disabled，不可读取。 */
  private wasGroupDisabled = false

  private readonly notify = (details: ColorSwatchPickerValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ColorSwatchPickerSchema>(this, colorSwatchPickerMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；四轴优先级由 Headless 真源结算。 */
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

  private machineProps(): Partial<ColorSwatchPickerSchema['props']> {
    const control = this.controlState()
    return {
      swatches: this.swatches,
      value: this.value,
      defaultValue: this.defaultValue ?? null,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      required: control.required,
      dir: this.direction,
      name: this.name,
      size: this.size,
      tone: this.tone,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  /** 当前选中的颜色串；状态机尚未建立时为 null。 */
  get selectedValue(): string | null {
    return this.ctrl.service ? connectColorSwatchPicker(this.ctrl.service, wcNormalize).value : null
  }

  /** 由 swatches 推导的格子元信息：名字与禁用都已确定。状态机尚未建立时为空表。 */
  get swatchMeta(): readonly ColorSwatchPickerNodeMeta[] {
    return this.ctrl.service ? connectColorSwatchPicker(this.ctrl.service, wcNormalize).swatches : []
  }

  /** 焦点锚点的格子串，焦点在组外时为 null。状态机尚未建立时为 null。 */
  get focusedValue(): string | null {
    return this.ctrl.service ? connectColorSwatchPicker(this.ctrl.service, wcNormalize).focusedValue : null
  }

  /** 某个颜色串是否视为选中：按颜色比较而非按串比较。状态机尚未建立时为 false。 */
  isSelected(candidate: string): boolean {
    return this.ctrl.service ? connectColorSwatchPicker(this.ctrl.service, wcNormalize).isSelected(candidate) : false
  }

  /** 从外部写入选中值；null 即清空。状态机尚未建立时为空操作。 */
  setValue(next: string | null): void {
    if (this.ctrl.service)
      connectColorSwatchPicker(this.ctrl.service, wcNormalize).setValue(next)
  }

  /** 承载焦点的格子被移出 DOM 时浏览器不派 focusout，这里替 DOM 上报焦点离场，免得焦点锚点停在已消失的值上。 */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上：只有持有焦点的那个格子离场才上报
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'GROUP.BLUR' })
  }

  /** 作者声明的格子禁用，只认首见那一份；没写即 undefined，交给 swatches 定夺 */
  private readonly declaredItemDisabled = createDeclaredDisabled()

  private itemProps(el: HTMLElement): ColorSwatchPickerItemProps {
    const value = el.getAttribute('value') ?? ''
    // 名字只认作者写的 label 属性：aria-label 是 connect 每帧写回的，回读不得
    const label = el.getAttribute('label') ?? undefined
    // 给了 swatches 就以数据为事实源：现读会读到 connect 上一帧写回的 aria-disabled，
    // 「作者没写」表达不出 undefined，数据里的禁用就永远轮不到生效。
    if (this.swatches)
      return { value, label, disabled: this.declaredItemDisabled(el) }
    const groupDisabled = this.controlState().disabled
    // 头一回见到这个格子：本帧的写回尚未发生，DOM 上还只有作者声明，此刻无论禁没禁用都要记下快照
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, label, disabled: own }
    }
    // 只有本帧与上一帧都没整组禁用时，节点上的 aria-disabled 才等于作者声明
    if (!groupDisabled && !this.wasGroupDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, label, disabled: own }
    }
    // 整组禁用那几帧（以及解禁当帧）DOM 上留着机器的写回值，只认快照
    return { value, label, disabled: this.declaredDisabled.get(el)! }
  }

  // 格子内的子部件：getParts 收的是整个元素范围，按 item 子树过滤才归得对格子。
  private partsIn(item: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => item.contains(el))
  }

  // hidden-input 的 style 是对象、checked 只认 DOM property，走 spread 都会写坏，两者绕开 spread 单独落
  private spreadHiddenInput(input: HTMLInputElement, props: Record<string, unknown>): void {
    const { style, checked, ...attrs } = props
    this.spreader.spread(input, attrs)
    input.checked = checked === true
    Object.assign(input.style, style as Record<string, string> | undefined)
  }

  protected wire(): void {
    const api = connectColorSwatchPicker(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)

    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const input of this.partsIn(el, 'hidden-input'))
        this.spreadHiddenInput(input as HTMLInputElement, api.getHiddenInputProps(item) as Record<string, unknown>)
      for (const swatch of this.partsIn(el, 'swatch'))
        this.spreader.spread(swatch, api.getSwatchProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'indicator'))
        this.spreader.spread(indicator, api.getIndicatorProps(item) as Record<string, unknown>)
    }
    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasGroupDisabled = this.controlState().disabled
  }
}
