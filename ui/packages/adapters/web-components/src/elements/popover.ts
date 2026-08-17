import type { PopoverOpenChangeDetails, PopoverSchema, PopoverTranslations } from '@xihan-ui/headless'
import type { Cleanup, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Size } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { OverlayExit } from '../overlay-exit'
import { connectPopover, popoverAnatomy, popoverMachine, popoverMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（Esc 关闭、外部交互关闭）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-popover>` —— Light-DOM 行为宿主：用户写 trigger/positioner/content/... 角色节点，
 * 元素跑 popover 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点取 trigger、被定位的浮层取 positioner；机器只认端口，不认识具体引擎。
 *
 * @customElement xh-popover
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} placement - 首选放置位，默认 bottom；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px），默认 8
 * @attr {boolean} modal - 模态浮层陷住焦点并回绕 Tab，默认 false
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true；写 close-on-escape="false" 关掉
 * @attr {boolean} close-on-interact-outside - 层外交互关闭，默认 true；写 "false" 关掉
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart trigger - 触发按钮（aria-haspopup/aria-expanded/aria-controls 所在），同时是定位锚点
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - 浮层内容（role=dialog；焦点域与消解层的根节点），收起时带 hidden
 * @csspart title - 标题（aria-labelledby 目标）
 * @csspart description - 描述（aria-describedby 目标）
 * @csspart close-trigger - 关闭按钮
 * @csspart arrow - 指向锚点的箭头（aria-hidden，data-placement 随实际放置位翻转）
 */
export class XhPopoverElement extends XhElement {
  static override partContract = { anatomy: popoverAnatomy, meta: popoverMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    modal: { converter: BOOLEAN_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    closeOnInteractOutside: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-interact-outside' },
    size: { converter: STRING_CONVERTER },
    // 对象值进不了属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare placement?: Placement
  declare offset?: number
  declare modal?: boolean
  declare closeOnEscape?: boolean
  declare closeOnInteractOutside?: boolean
  declare size?: Size
  /** 关闭按钮的无障碍名；connect 每帧重写 aria-label，作者自己写在节点上会被盖掉，只能从这里给。 */
  declare translations?: Partial<PopoverTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly popoverScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notify = (details: PopoverOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<PopoverSchema>(
    this,
    popoverMachine,
    () => this.machineProps(),
    { scope: this.popoverScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<PopoverSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      placement: this.placement,
      offset: this.offset,
      modal: this.modal,
      closeOnEscape: this.closeOnEscape,
      closeOnInteractOutside: this.closeOnInteractOutside,
      translations: this.translations,
      size: this.size,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.popoverScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，浮层等于关不掉。
      branches: () => [this.getPart('trigger')].filter(Boolean) as Element[],
      isModal: () => this.modal ?? false,
      setModal: () => {},
      // 非模态浮层不自带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<PopoverSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 角色节点提前发现一次：default-open 时机器在 hostConnected 当场进入 open，
   * 定位副作用同步取一次 trigger/positioner——而常规发现要等首次 updated，
   * 那一刻 partMap 还空着，引擎挂不上，浮层会停在容器左上角。
   * 消解层与焦点域的 ref 是懒读的，不受影响，这里只为定位补上时机。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  protected wire(): void {
    const api = connectPopover(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可。
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)
    put('arrow', api.getArrowProps() as Record<string, unknown>)

    // Light DOM content 常驻，WC 自管可见性。读 styles/css/popover.css 的结论：
    // content 是 display:flex，positioner 只声明 position/z-index/pointer-events、没有 display，
    // connect 也不给 positioner 发 hidden——所以只兜 content 这一处。
    // 该文件自己带了 [data-part=content][hidden]{display:none} 压住那条 flex，
    // 但宿主不能指望作者装了这份样式：换别家样式给 content 设 display 就又盖过 UA 的
    // [hidden]{display:none}，只有内联 style.display 压得住。open 时置空串即撤掉内联声明。
    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    const content = this.getPart('content')
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(content)
    this.exit.update(api.open)
    if (content)
      this.setPartHidden(content, !this.exit.visible)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    this.config = null // 重连时 ensureConfig 重建
  }
}
