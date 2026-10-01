/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 signature pad 相关实现。

import type { Service } from '@xihan-ui/core'
import type {
  FormControlState,
  SignaturePadApi,
  SignaturePadDrawDetails,
  SignaturePadDrawEndDetails,
  SignaturePadDrawingOptions,
  SignaturePadSchema,
  SignaturePadTranslations,
  SignaturePadValue,
  SignaturePadValueChangeDetails,
} from '@xihan-ui/headless'
import { connectSignaturePad, EMPTY_SIGNATURE, resolveFormControlState, signaturePadAnatomy, signaturePadMachine, signaturePadMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值的唯一事实源留在 connect。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：属性缺席 = undefined（用默认值）、="false" = false、其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的开关会因此永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-signature-pad>`：Light-DOM 行为宿主：作者写 root / control / path 三个必需角色节点
 * （可再写 label、guide、undo-trigger、redo-trigger、clear-trigger、status 与 hidden-input），
 * 元素运行 signature-pad 状态机并把 connect 产出接上。
 *
 * control 必须是 `<svg>`，guide 是其中的 `<line>`、path 是其中的 `<path>`：
 * 笔迹是一条填充轮廓，粗细随压感变化，描边无法实现该效果。viewBox 由元素按第一笔落下时
 * 测得的画布尺寸写入，作者不应自行编写。
 *
 * 画布本身不接受键盘。签名天然依赖指针，要求签名的流程必须另提供一条不依赖指针的替代路径。
 *
 * 签名数据（value / defaultValue）、笔迹外形（drawing）与读屏文案（translations）是对象，只能通过 property 设置。
 * 回显已存的签名把存下的数据赋给 `defaultValue`；清空、撤销、重做与获取 SVG 另有
 * `clear()` / `undo()` / `redo()` / `toSvg()` 四个方法，此刻的签名数据读 `currentValue`。
 *
 * @customElement xh-signature-pad
 * @attr {boolean} disabled - 整块不可交互：不响应落笔，清空按钮也不可按下
 * @attr {boolean} read-only - 只读：已绘制的签名照常显示，但不可修改
 * @attr {boolean} required - 必填标注；表单影子据此参与原生校验
 * @attr {boolean} invalid - 校验未通过的标记，只改变外观与表单影子上的 aria-invalid
 * @attr {string} name - 表单字段名；提供后表单影子才带 name 并参与提交
 * @fires draw - 笔迹变化时通知一次（含清空、撤销、重做与表单重置）；detail 为 `{ paths: string[], path: string }`
 * @fires draw-end - 签名定稿时通知一次（抬笔、清空、撤销、重做、表单重置）；detail 为 `{ paths: string[], svg: string }`，svg 可直接存储
 * @fires value-change - 签名数据定稿，时机同 draw-end；detail 为 `{ value: { strokes, surface } }`，可原样存下再赋回 defaultValue 回显
 * @fires clear - 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty / data-drawing 的外壳
 * @csspart label - 画布标题（aria-labelledby 目标）
 * @csspart control - role=img 的画布，必须是 `<svg>`，指针落笔全部在它身上
 * @csspart guide - 基准线，必须是 control 中的 `<line>`；落位由连接层按百分比给出
 * @csspart path - 全部笔迹，必须是 control 中的 `<path>`；每一笔是它的一条子路径
 * @csspart undo-trigger - 撤销按钮，必须是原生 `<button>`；没有可撤销的一步时 aria-disabled
 * @csspart redo-trigger - 重做按钮，必须是原生 `<button>`；没有可重做的一步时 aria-disabled
 * @csspart clear-trigger - 清空按钮，必须是原生 `<button>`
 * @csspart status - 签名状态的活区域（role=status）；节点中未写文字时由元素填入内建文案
 * @csspart hidden-input - 表单影子输入（必须是原生 input），提交的是一份独立 SVG 文档
 */
export class XhSignaturePadElement extends XhElement {
  static override partContract = { anatomy: signaturePadAnatomy, meta: signaturePadMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    // 对象进不了属性，只作为 property 暴露
    value: { attribute: false },
    defaultValue: { attribute: false },
    drawing: { attribute: false },
    translations: { attribute: false },
  }

  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare value?: SignaturePadValue
  declare defaultValue?: SignaturePadValue
  declare drawing?: SignaturePadDrawingOptions
  declare translations?: Partial<SignaturePadTranslations>

  /** 按清空钮清掉了值：先派发值变化，再派发它；程序化的 clear() 不派发。 */
  private readonly notifyClear = (): void => {
    this.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }))
  }

  private readonly notifyDraw = (details: SignaturePadDrawDetails): void => {
    this.dispatchEvent(new CustomEvent('draw', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyDrawEnd = (details: SignaturePadDrawEndDetails): void => {
    this.dispatchEvent(new CustomEvent('draw-end', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyValue = (details: SignaturePadValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<SignaturePadSchema>(
    this,
    signaturePadMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；SignaturePad 消费公开的四条轴。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<SignaturePadSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      required: this.required,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      disabled: control.disabled,
      readOnly: control.readOnly,
      required: control.required,
      invalid: control.invalid,
      name: this.name,
      value: this.value,
      defaultValue: this.defaultValue,
      drawing: this.drawing,
      translations: this.translations,
      onDraw: this.notifyDraw,
      onDrawEnd: this.notifyDrawEnd,
      onValueChange: this.notifyValue,
      onClear: this.notifyClear,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 画布懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<SignaturePadSchema>): void {
    svc.refs.set('getControlEl', () => this.getPart('control'))
  }

  /** 命令式入口共用的取法；状态机在进入文档（hostConnected）后才建立，未建立则抛错。 */
  private commands(): SignaturePadApi {
    if (!this.ctrl.service)
      throw new Error('[xh] <xh-signature-pad> 还没进文档，命令式接口此时不可用')
    return connectSignaturePad(this.ctrl.service, wcNormalize)
  }

  /** 清除全部笔迹，与点击清空按钮同一路径（照常触发 draw / draw-end）。 */
  clear(): void {
    this.commands().clear()
  }

  /** 撤销最近一步（一笔或一次清空），与点击撤销按钮同一路径；没有可撤销的一步时什么都不做。 */
  undo(): void {
    this.commands().undo()
  }

  /** 重做最近撤销的一步；没有可重做的一步时什么都不做。 */
  redo(): void {
    this.commands().redo()
  }

  /** 是否有可撤销的一步；还没进文档时为 false。 */
  get canUndo(): boolean {
    return this.ctrl.service ? this.commands().canUndo : false
  }

  /** 是否有被撤销、还能重做的一步；还没进文档时为 false。 */
  get canRedo(): boolean {
    return this.ctrl.service ? this.commands().canRedo : false
  }

  /**
   * 此刻已定稿的签名数据，可原样存下、再赋回 defaultValue 回显。
   * value 是作者递进来的受控值，非受控时读这里；还没进文档时为空签名。
   */
  get currentValue(): SignaturePadValue {
    return this.ctrl.service ? this.commands().value : EMPTY_SIGNATURE
  }

  /** 当前签名的独立 SVG 文档，与表单影子提交的是同一份；空签名为空串。 */
  toSvg(): string {
    return this.commands().toSvg()
  }

  /** 是否未绘制任何笔迹。提交前拦截空签名时读取。 */
  get empty(): boolean {
    return this.commands().empty
  }

  /**
   * 状态文本是否归元素填入：节点非空即判定为作者自己写了内容。
   * 首次见到时固定，之后不再回读：回读无法区分内容是作者写的还是上一帧自己写的。
   */
  private readonly ownsText = new WeakMap<HTMLElement, boolean>()

  private fillText(el: HTMLElement, text: string): void {
    let owned = this.ownsText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  protected wire(): void {
    const api = connectSignaturePad(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('guide', api.getGuideProps() as Record<string, unknown>)
    put('path', api.getPathProps() as Record<string, unknown>)
    put('undo-trigger', api.getUndoTriggerProps() as Record<string, unknown>)
    put('redo-trigger', api.getRedoTriggerProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    put('status', api.getStatusProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    const status = this.getPart('status')
    if (status)
      this.fillText(status, api.statusText)
  }
}
