import type { SignaturePadApi, SignaturePadDrawDetails, SignaturePadDrawEndDetails, SignaturePadDrawingOptions, SignaturePadSchema, SignaturePadTranslations } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { connectSignaturePad, signaturePadAnatomy, signaturePadMachine, signaturePadMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值的唯一事实源留在 connect。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：属性缺席 = undefined（用默认值）、="false" = false、其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的开关会因此永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-signature-pad>` —— Light-DOM 行为宿主：作者写 root / control / path 三个必需角色节点
 * （可再写 label、guide、clear-trigger 与 hidden-input），元素跑 signature-pad 机器并把 connect 产出打上去。
 *
 * control 必须是 `<svg>`，guide 是它里面的 `<line>`、path 是它里面的 `<path>`：
 * 笔迹是一条填充轮廓，粗细随压感变，描边给不出这个效果。viewBox 由元素按第一笔落下时
 * 量到的画布尺寸写上去，作者不要自己写。
 *
 * 画布本身不接键盘。签名天然依赖指针，要求签名的流程必须另给一条不依赖指针的替代路径。
 *
 * 笔迹外形（drawing）与读屏文案（translations）是对象，只走 property。
 * 清空与取 SVG 另有 `clear()` / `toSvg()` 两个方法。
 *
 * @customElement xh-signature-pad
 * @attr {boolean} disabled - 整块不可交互：落笔不认，清空按钮也按不动
 * @attr {boolean} read-only - 只读：画好的签名照常显示，但改不动
 * @attr {boolean} required - 必填标注；表单影子据此参与原生校验
 * @attr {boolean} invalid - 校验未通过的标记，只改外观与表单影子上的 aria-invalid
 * @attr {string} name - 表单字段名；给了表单影子才带 name 并参与提交
 * @fires draw - 笔迹变了就通知一次（含清空与表单重置）；detail 为 `{ paths: string[], path: string }`
 * @fires draw-end - 签名定稿时通知一次（抬笔、清空、表单重置）；detail 为 `{ paths: string[], svg: string }`，svg 可直接落库
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty / data-drawing 的外壳
 * @csspart label - 画布标题（aria-labelledby 目标）
 * @csspart control - role=img 的画布，必须是 `<svg>`，指针落笔全在它身上
 * @csspart guide - 基准线，必须是 control 里的 `<line>`；落位由连接层按百分比给出
 * @csspart path - 全部笔迹，必须是 control 里的 `<path>`；每一笔是它的一条子路径
 * @csspart clear-trigger - 清空按钮，必须是原生 `<button>`
 * @csspart status - 签没签的活区域（role=status）；节点里没写字时由元素填内建文案
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
    drawing: { attribute: false },
    translations: { attribute: false },
  }

  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare drawing?: SignaturePadDrawingOptions
  declare translations?: Partial<SignaturePadTranslations>

  private readonly notifyDraw = (details: SignaturePadDrawDetails): void => {
    this.dispatchEvent(new CustomEvent('draw', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyDrawEnd = (details: SignaturePadDrawEndDetails): void => {
    this.dispatchEvent(new CustomEvent('draw-end', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<SignaturePadSchema>(
    this,
    signaturePadMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SignaturePadSchema['props']> {
    return {
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect
      disabled: this.disabled,
      readOnly: this.readOnly,
      required: this.required,
      invalid: this.invalid,
      name: this.name,
      drawing: this.drawing,
      translations: this.translations,
      onDraw: this.notifyDraw,
      onDrawEnd: this.notifyDrawEnd,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 画布懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<SignaturePadSchema>): void {
    svc.refs.set('getControlEl', () => this.getPart('control'))
  }

  /** 命令式入口共用的取法；机器要到进文档（hostConnected）才建，未建则抛。 */
  private commands(): SignaturePadApi {
    if (!this.ctrl.service)
      throw new Error('[xh] <xh-signature-pad> 还没进文档，命令式接口此时不可用')
    return connectSignaturePad(this.ctrl.service, wcNormalize)
  }

  /** 抹掉全部笔迹，与点清空按钮同一条路径（照样发 draw / draw-end）。 */
  clear(): void {
    this.commands().clear()
  }

  /** 当前签名的独立 SVG 文档，与表单影子提交的是同一份；空签名为空串。 */
  toSvg(): string {
    return this.commands().toSvg()
  }

  /** 一笔都没画。提交前拦空签名读它。 */
  get empty(): boolean {
    return this.commands().empty
  }

  /**
   * 状态文本是否归元素填：节点非空即判为作者自己写了内容。
   * 首次见到时定死，之后不再回读——回读分不出内容是作者写的还是上一帧自己写的。
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
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    put('status', api.getStatusProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    const status = this.getPart('status')
    if (status)
      this.fillText(status, api.statusText)
  }
}
