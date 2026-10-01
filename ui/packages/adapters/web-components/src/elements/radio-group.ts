/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { Direction, Orientation, Service, Size, Tone } from '@xihan-ui/core'
import type { FormControlState, RadioGroupItemProps, RadioGroupNode, RadioGroupSchema, RadioGroupValueChangeDetails, RadioGroupVariant, ResolvedFormControlState } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectRadioGroup, radioGroupAnatomy, radioGroupMachine, radioGroupMeta, resolveFormControlState } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的 loop 会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-radio-group>`：Light-DOM 行为宿主：作者写 root / label 与若干 item 角色节点，
 * 每个 item 内自带 hidden-input / indicator / item-icon / item-text，元素运行 radio-group 状态机并把 connect 产出接上。
 * 条目身份取自条目节点上的 value 属性；导航与选中在事件发生时按 data-scope + data-part 查询 DOM，
 * 依赖 connect 回写的 data-value，因此 wire 必须先于交互运行（基类 updated 已保证）。
 * 条目不要用原生 `<button>`：role=radio 只有 Space 是激活键，按钮会把 Enter 翻成 click。
 *
 * segmented 形态里 thumb 是滑动的选中标记，位置由状态机测量后写为内联样式中的私有槽；
 * 它绝对定位，必须写在条目之前，依靠文档序让条目覆盖在它上面。
 *
 * @customElement xh-radio-group
 * @attr {string} value - 受控选中值；未提供该属性即非受控
 * @attr {string} default-value - 非受控初始选中值
 * @attr {boolean} disabled - 整组禁用
 * @attr {boolean} read-only - 只读：不可选择，方向键照常移动焦点
 * @attr {boolean} invalid - 校验失败态
 * @attr {boolean} required - 必填
 * @attr {'horizontal'|'vertical'} orientation - 视觉排布：list / card 缺省 vertical，segmented 缺省 horizontal；四个方向键恒响应，与它无关
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义与滑块的起始缘；未提供时从 DOM 读取祖先链上的方向
 * @attr {string} name - 表单字段名；提供后隐藏输入才带 name 并参与提交
 * @attr {boolean} loop - 方向键到达末尾回绕，默认开启
 * @attr {boolean} block - 撑满行宽，各段等分剩余空间；只在 segmented 形态下生效
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {'list'|'card'|'segmented'} variant - 结构形态，默认 list；card 把每个条目画成一张可点的卡，segmented 画成轨道里的一排段
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @csspart root - role=radiogroup 容器（承载 roving tabindex 的兜底位）；segmented 形态下就是那条轨道
 * @csspart label - 组标题（aria-labelledby 目标）；segmented 形态下视觉隐藏、只作可及名
 * @csspart thumb - segmented 形态里滑动的选中标记，对读屏隐藏；无选中项时收起，须写在条目之前
 * @csspart item - role=radio 条目，作者用 value 属性声明身份
 * @csspart item-icon - 条目文字前的图标位，对读屏隐藏
 * @csspart item-text - 条目文本
 * @csspart item-description - 条目文案下方的说明行，常用在 card 形态里
 * @csspart indicator - 条目行首的单选圆圈；segmented 形态不画
 * @csspart hidden-input - 条目的表单影子输入（必须是原生 input）
 */
export class XhRadioGroupElement extends XhElement {
  static override partContract = { anatomy: radioGroupAnatomy, meta: radioGroupMeta }

  // dir 是 HTMLElement 原生访问器，同名声明会与基类冲突并盖掉原生反射，故字段叫 direction、属性名仍用 dir
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    defaultValue: { attribute: 'default-value' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    orientation: {},
    direction: { attribute: 'dir' },
    name: {},
    loop: { converter: BOOLEAN_CONVERTER },
    block: { converter: BOOLEAN_CONVERTER },
    tone: {},
    size: {},
    variant: {},
  }

  declare collection?: RadioGroupNode[]
  declare value?: string
  declare defaultValue?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare orientation?: Orientation
  declare direction?: Direction
  declare name?: string
  declare loop?: boolean
  declare block?: boolean
  declare tone?: Tone
  declare size?: Size
  declare variant?: RadioGroupVariant

  // 整组禁用期间的条目自身声明快照：connect 每帧把 aria-disabled 写回条目，回读分不清作者声明与自己的写回
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整组禁用：解禁当帧 DOM 上仍保留着状态机写回的 aria-disabled，不可读取。 */
  private wasGroupDisabled = false

  private readonly notify = (details: RadioGroupValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<RadioGroupSchema>(
    this,
    radioGroupMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

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

  private machineProps(): Partial<RadioGroupSchema['props']> {
    const control = this.controlState()
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue ?? null,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      required: control.required,
      orientation: this.orientation,
      dir: this.direction,
      name: this.name,
      loop: this.loop,
      block: this.block,
      tone: this.tone,
      size: this.size,
      variant: this.variant,
      // 作者写没写 label 角色节点决定根的 aria-labelledby 指不指过去
      labelled: this.getPart('label') != null,
      onValueChange: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入；root 是 segmented 形态滑块测量的参照系
  private injectRefs(svc: Service<RadioGroupSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  /** 承载焦点的条目被移出 DOM 时浏览器不派 focusout，这里替 DOM 上报焦点离场，免得焦点锚点停在已消失的值上。 */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上：只有持有焦点的那个条目离场才上报
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'GROUP.BLUR' })
  }

  /** 作者声明的条目禁用，只认首见那一份；没写即 undefined，交给 collection 定夺 */
  private readonly declaredItemDisabled = createDeclaredDisabled()

  private itemProps(el: HTMLElement): RadioGroupItemProps {
    const value = el.getAttribute('value') ?? ''
    // 给了 collection 就以数据为事实源：现读会读到 connect 上一帧写回的 aria-disabled，
    // 「作者没写」表达不出 undefined，数据里的禁用就永远轮不到生效。
    if (this.collection)
      return { value, disabled: this.declaredItemDisabled(el) }
    const groupDisabled = this.controlState().disabled
    // 头一回见到这个条目：本帧的写回尚未发生，DOM 上还只有作者声明，此刻无论禁没禁用都要记下快照
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 只有本帧与上一帧都没整组禁用时，节点上的 aria-disabled 才等于作者声明
    if (!groupDisabled && !this.wasGroupDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 整组禁用那几帧（以及解禁当帧）DOM 上留着机器的写回值，只认快照
    return { value, disabled: this.declaredDisabled.get(el)! }
  }

  // 条目内的子部件：getParts 收的是整个元素范围，按 item 子树过滤才归得对条目。
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
    const api = connectRadioGroup(this.ctrl.service, wcNormalize)

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
      for (const indicator of this.partsIn(el, 'indicator'))
        this.spreader.spread(indicator, api.getIndicatorProps(item) as Record<string, unknown>)
      for (const icon of this.partsIn(el, 'item-icon'))
        this.spreader.spread(icon, api.getItemIconProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const description of this.partsIn(el, 'item-description'))
        this.spreader.spread(description, api.getItemDescriptionProps(item) as Record<string, unknown>)
    }

    const thumb = this.getPart('thumb')
    if (thumb) {
      const props = api.getThumbProps() as Record<string, unknown>
      this.spreader.spread(thumb, props)
      // 按本帧产出的 hidden 用内联 display 收起
      this.setPartHidden(thumb, props.hidden === true)
    }

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasGroupDisabled = this.controlState().disabled
  }
}
