import type { ActionVariant, IdGenerator, Layer, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type {
  CollapsibleOpenChangeDetails,
  FloatButtonAppearance,
  FloatButtonExpandTrigger,
  FloatButtonPlacement,
  FloatButtonSchema,
  FloatButtonShape,
  FloatButtonTranslations,
} from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectFloatButton, floatButtonAnatomy, floatButtonMachine, floatButtonMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态：属性缺席 = 非受控，写了才是受控的那个布尔。
const TRISTATE_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-float-button>` —— 悬浮按钮行为宿主：一颗钉在视口一角的触发器，展开一组动作。
 *
 * 专用机器持有开合、层外交互、Escape 仲裁与逻辑层生命周期；元素只桥接所属
 * Document 的 RuntimeConfig、LayerRegistry 登记与 root 节点。
 *
 * 作者须把 trigger 写成 `<button>`：激活与 Tab 停靠由平台提供，元素不接管这两件。
 * 收起时 list 带 hidden，里面的按钮一并退出 Tab 序列与无障碍树。
 * 贴边距离写在 root 的内联 style 里（自定义属性只有这一条路能同时落到两个适配器上），
 * 于是 root 的内联 style 归本元素管，作者自己的内联样式写在外层元素上。
 *
 * @customElement xh-float-button
 * @attr {boolean} open - 受控展开；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 禁用触发器
 * @attr {'top-start'|'top-end'|'bottom-start'|'bottom-end'} placement - 钉在哪一角，默认 bottom-end
 * @attr {number} offset - 距那两条边的距离（px），默认 24
 * @attr {'circle'|'square'} shape - 触发器外形，默认 circle
 * @attr {'hover'|'click'} expand-trigger - 展开方式，默认 click
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 形态，决定底色、描边与前景怎么用
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸，缺省与 lg 同档
 * @fires open-change - 展开状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 定位壳，承载 data-state / data-placement / data-shape / data-disabled
 * @csspart trigger - 触发按钮，须写成 `<button>`；可及名字由 translations.trigger 给
 * @csspart list - 展开的那一组动作；收起时带 hidden
 */
export class XhFloatButtonElement extends XhElement {
  static override partContract = { anatomy: floatButtonAnatomy, meta: floatButtonMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    open: { converter: TRISTATE_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { type: Boolean },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    shape: { converter: STRING_CONVERTER },
    expandTrigger: { converter: STRING_CONVERTER, attribute: 'expand-trigger' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean
  declare placement?: FloatButtonPlacement
  declare offset?: number
  declare shape?: FloatButtonShape
  declare expandTrigger?: FloatButtonExpandTrigger
  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<FloatButtonTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly floatButtonScope = createScope(() => this, this.idGen)
  private config: RuntimeConfig | null = null

  private readonly notify = (details: CollapsibleOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<FloatButtonSchema>(
    this,
    floatButtonMachine,
    () => this.machineProps(),
    { scope: this.floatButtonScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<FloatButtonSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: this.disabled ?? false,
      expandTrigger: this.expandTrigger,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    this.config ??= createRuntimeConfig({ scope: this.floatButtonScope, idGenerator: this.idGen })
  }

  private readonly registerLayer = (
    layer: Omit<Layer, 'id'>,
  ): ReturnType<RuntimeConfig['layerRegistry']['register']> => {
    this.ensureConfig()
    return this.config!.layerRegistry.register(layer)
  }

  private injectRefs(svc: Service<FloatButtonSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  private appearance(): FloatButtonAppearance {
    return {
      placement: this.placement,
      offset: this.offset,
      shape: this.shape,
      expandTrigger: this.expandTrigger,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
    }
  }

  protected wire(): void {
    const api = connectFloatButton(this.ctrl.service, this.appearance(), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)

    const list = this.getPart('list')
    if (list) {
      const props = api.getListProps() as Record<string, unknown>
      this.spreader.spread(list, props)
      // Light DOM 常驻，WC 自管可见性：作者层若给这个 part 声明了 display，
      // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来
      this.setPartHidden(list, props.hidden === true)
    }
  }

  override disconnectedCallback(): void {
    // super 先停机并逆序释放 Headless 持有的消解层与 LayerRegistry 登记。
    super.disconnectedCallback()
    this.config = null
  }
}
