import type {
  TourCompleteDetails,
  TourOpenChangeDetails,
  TourSchema,
  TourSkipDetails,
  TourStep,
  TourStepChangeDetails,
  TourTranslations,
} from '@xihan-ui/headless'
import type { Cleanup, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectTour, tourAnatomy, tourMachine, tourMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（Esc 退出、画遮罩）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-tour>` —— Light-DOM 行为宿主：用户写 root/backdrop/spotlight/positioner/content/... 角色节点，
 * 元素跑 tour 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点是每一步 target 选择器查出来的页面节点（由机器解析），被定位的浮层取 positioner。
 *
 * @customElement xh-tour
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {number} step - 受控步序（0 起）；缺省该属性即非受控
 * @attr {number} default-step - 非受控初始步序，默认 0
 * @attr {string} placement - 整份引导的首选放置位，默认 bottom；单步可用自己的 placement 覆盖
 * @attr {number} offset - 气泡与目标的间距（px）
 * @attr {boolean} close-on-escape - Esc 放弃引导，默认 true；写 close-on-escape="false" 关掉
 * @attr {boolean} close-on-interact-outside - 层外交互关闭，默认 false；写 "true" 打开
 * @attr {boolean} show-backdrop - 画遮罩，默认 true；写 show-backdrop="false" 关掉
 * @attr {number} spotlight-padding - 高亮框在目标四周留出的空白（px），默认 8
 * @attr {boolean} auto-scroll - 展开与换步时自动把目标滚进视口（nearest），默认 true；写 auto-scroll="false" 关掉
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires step-change - 步序变化；detail 为 `{ step: number }`
 * @fires complete - 末步再按下一步；detail 为 `{ step: number }`
 * @fires skip - 用户放弃（跳过按钮或 Escape）；detail 为 `{ step: number }`
 * @csspart root - 引导根节点（data-state/data-step 所在）
 * @csspart backdrop - 遮罩层（aria-hidden；showBackdrop 为假时带 hidden）
 * @csspart spotlight - 挖洞的高亮框，位置尺寸由内联 style 给出；居中步带 hidden
 * @csspart positioner - 浮层定位容器；锚定步坐标由引擎写成内联样式，居中步交给样式表摆
 * @csspart content - 引导浮层（role=dialog + aria-modal；焦点域与消解层的根节点），收起时带 hidden
 * @csspart title - 标题（aria-labelledby 目标）；作者没写内容时由元素填当前步的 title
 * @csspart description - 描述（aria-describedby 目标）；作者没写内容时填当前步的 description
 * @csspart progress-text - "第 m 步，共 n 步"（aria-live=polite）；作者没写内容时由元素填
 * @csspart prev-trigger - 上一步（首步时原生 disabled）
 * @csspart next-trigger - 下一步（末步带 data-last，语义是"完成"）
 * @csspart skip-trigger - 跳过（发 skip 事件后关闭）
 * @csspart close-trigger - 关闭（只关，不算放弃）
 * @csspart arrow - 指向目标的箭头（aria-hidden；居中步带 hidden）
 */
export class XhTourElement extends XhElement {
  static override partContract = { anatomy: tourAnatomy, meta: tourMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    step: { converter: NUMBER_CONVERTER },
    defaultStep: { converter: NUMBER_CONVERTER, attribute: 'default-step' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    closeOnInteractOutside: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-interact-outside' },
    showBackdrop: { converter: BOOLEAN_CONVERTER, attribute: 'show-backdrop' },
    spotlightPadding: { converter: NUMBER_CONVERTER, attribute: 'spotlight-padding' },
    autoScroll: { converter: BOOLEAN_CONVERTER, attribute: 'auto-scroll' },
    // 对象值进不了属性，只作为 property 暴露
    steps: { attribute: false },
    translations: { attribute: false },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare step?: number
  declare defaultStep?: number
  declare placement?: Placement
  declare offset?: number
  declare closeOnEscape?: boolean
  declare closeOnInteractOutside?: boolean
  declare showBackdrop?: boolean
  declare spotlightPadding?: number
  declare autoScroll?: boolean
  /** 步骤清单。它是步序的上界，也是读屏"第 m 步，共 n 步"的分母。 */
  declare steps?: TourStep[]
  /** 关闭按钮的无障碍名与进度文案；connect 每帧重写，作者写在节点上会被盖掉，只能从这里给。 */
  declare translations?: Partial<TourTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly tourScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  private contentNode: HTMLElement | null = null
  private backdropNode: HTMLElement | null = null
  /** 哪些文本节点归元素填：作者自己写了内容的一概不碰。 */
  private readonly ownsText = new WeakMap<HTMLElement, boolean>()

  private readonly emit = (type: string, detail: unknown): void => {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: TourOpenChangeDetails): void => this.emit('open-change', details)
  private readonly notifyStep = (details: TourStepChangeDetails): void => this.emit('step-change', details)
  private readonly notifyComplete = (details: TourCompleteDetails): void => this.emit('complete', details)
  private readonly notifySkip = (details: TourSkipDetails): void => this.emit('skip', details)

  private readonly ctrl = new MachineController<TourSchema>(
    this,
    tourMachine,
    () => this.machineProps(),
    { scope: this.tourScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<TourSchema['props']> {
    return {
      steps: this.steps,
      step: this.step,
      defaultStep: this.defaultStep,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      placement: this.placement,
      offset: this.offset,
      closeOnEscape: this.closeOnEscape,
      closeOnInteractOutside: this.closeOnInteractOutside,
      showBackdrop: this.showBackdrop,
      spotlightPadding: this.spotlightPadding,
      autoScroll: this.autoScroll,
      translations: this.translations,
      onOpenChange: this.notifyOpen,
      onStepChange: this.notifyStep,
      onComplete: this.notifyComplete,
      onSkip: this.notifySkip,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.tourScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层常驻栈里占着栈顶，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'modal',
      node: () => this.contentNode,
      branches: () => [],
      isModal: () => true,
      setModal: () => {},
      // 遮罩是"点它就该关本层"的表面；关不关仍由 closeOnInteractOutside 说了算（缺省不关）
      surfaces: () => [this.backdropNode].filter(Boolean) as Element[],
    })
  }

  // onBuilt 在机器建好、启动之前跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<TourSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    // 机器启动前先接一次线。default-open 时机器在紧接着的 mount 里当场进入 open，
    // 焦点域会在同一拍里挑落点——那一刻 content 若还没被写上 tabindex 就不可聚焦，
    // 焦点只能推到下一帧才落下，而 Vue 侧首帧就已经接好线、焦点当场落定：两侧首帧分叉。
    // 角色节点由 connectedCallback 里的 refreshParts 提前发现，这里已经够得着。
    this.wireWith(svc)
  }

  /**
   * 角色节点提前发现一次：default-open 时机器在 hostConnected 当场进入 open，
   * 定位副作用同步取一次 positioner——而常规发现要等首次 updated，
   * 那一刻 partMap 还空着，引擎挂不上，浮层会停在容器左上角。
   * 消解层与焦点域的 ref 是懒读的，不受影响，这里只为定位补上时机。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 标题、描述与进度文案的文字只有步骤清单里才有，作者在标记里写不出来（每步都不一样），
   * 由元素填。作者若自己写了内容（自定义渲染），首次见到时就定为归作者，之后一概不碰——
   * 每帧回读分不清"作者写的"还是"上一帧自己写的"，一旦写过就再也让不回去。
   */
  private fillText(el: HTMLElement | null, text: string | undefined): void {
    if (!el || text === undefined)
      return
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
    this.wireWith(this.ctrl.service)
  }

  /** 重量高亮框与浮层位置：目标节点被外部改动（换位、变尺寸）后调它校准。 */
  remeasure(): void {
    this.ctrl?.service.send({ type: 'GEOMETRY.SYNC' })
  }

  // service 由参数传入：机器启动前的那次接线发生在 this.ctrl 赋值之前，取不到 this.ctrl.service
  private wireWith(svc: Service<TourSchema>): void {
    const api = connectTour(svc, wcNormalize)

    this.contentNode = this.getPart('content')
    this.backdropNode = this.getPart('backdrop')

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('backdrop', api.getBackdropProps() as Record<string, unknown>)
    // spotlight 与 positioner 的 style 是对象（position/inset/尺寸），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可
    put('spotlight', api.getSpotlightProps() as Record<string, unknown>)
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('progress-text', api.getProgressTextProps() as Record<string, unknown>)
    put('prev-trigger', api.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.getNextTriggerProps() as Record<string, unknown>)
    put('skip-trigger', api.getSkipTriggerProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)
    put('arrow', api.getArrowProps() as Record<string, unknown>)

    this.fillText(this.getPart('title'), api.currentStep?.title)
    this.fillText(this.getPart('description'), api.currentStep?.description)
    this.fillText(this.getPart('progress-text'), api.progressText)

    // Light DOM 常驻，WC 自管可见性：connect 已经给这几个角色发了 hidden，但样式表里
    // 只要给它们声明过 display（本仓的 tour.css 给 positioner/content/spotlight 都声明了），
    // author 层就会盖掉 UA 的 [hidden]{display:none}。宿主不能指望作者装的是哪一份样式，
    // 只有内联 style.display 压得住；展开时还回作者原本写的内联值。
    for (const name of ['backdrop', 'spotlight', 'positioner', 'content', 'arrow']) {
      const el = this.getPart(name)
      if (el)
        this.setPartHidden(el, el.hasAttribute('hidden'))
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
