import type { HoverCardOpenChangeDetails, HoverCardSchema } from '@xihan-ui/headless'
import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Size } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { OverlayExit } from '../overlay-exit'
import { connectHoverCard, hoverCardAnatomy, hoverCardMachine, hoverCardMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 写不成数的值（文字、单位后缀）当作没写，缺省仍由机器给
const NUMBER_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v === null)
      return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  },
}
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-hover-card>` —— Light-DOM 行为宿主：作者写 root/trigger/positioner/content/arrow 角色节点，
 * 元素跑 hover-card 机器并把 connect 产出打上去。
 *
 * 它是 popover 的悬停变体：指针停在 trigger 上够久才展开，离开 trigger 或 content 够久才收起——
 * 那段收起等待同时是指针从 trigger 走到 content 的通行时间，两者之间隔着 offset 也走得过去。
 * 与 tooltip 相反，卡片内容是可交互、可聚焦的一块面板：Tab 走得进去，Escape 收得掉，
 * 但从不陷焦点、不锁滚动，展开时也不抢焦点。
 *
 * @customElement xh-hover-card
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} placement - 请求的浮层朝向（top/right/bottom/left，可带 -start/-end 后缀），默认 bottom；空间不足时由引擎避让
 * @attr {number} offset - 浮层与锚点的间距（px），默认 8
 * @attr {number} open-delay - 悬停进入到展开的等待毫秒，默认 700
 * @attr {number} close-delay - 指针移出到收起的等待毫秒，默认 300
 * @attr {'ltr'|'rtl'} dir - 文字方向，只在显式给了才写到 root 上
 * @attr {boolean} disabled - 只关掉卡片，trigger 本身仍可点、可聚焦
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 承载 data-state / data-disabled / dir 的容器
 * @csspart trigger - 悬停/聚焦的锚点（aria-expanded/aria-controls 所在），同时是定位锚点
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=dialog 的卡片内容（消解层的根节点），收起时带 hidden
 * @csspart arrow - 指向锚点的箭头（aria-hidden，data-placement 随实际放置位翻转）
 */
export class XhHoverCardElement extends XhElement {
  static override partContract = { anatomy: hoverCardAnatomy, meta: hoverCardMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    openDelay: { converter: NUMBER_CONVERTER, attribute: 'open-delay' },
    closeDelay: { converter: NUMBER_CONVERTER, attribute: 'close-delay' },
    // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
    // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    disabled: { type: Boolean },
    size: { converter: STRING_CONVERTER },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare placement?: Placement
  declare offset?: number
  declare openDelay?: number
  declare closeDelay?: number
  declare direction?: Direction
  declare disabled?: boolean
  declare size?: Size

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly hoverCardScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notify = (details: HoverCardOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<HoverCardSchema>(
    this,
    hoverCardMachine,
    () => this.machineProps(),
    { scope: this.hoverCardScope, onBuilt: svc => this.injectRefs(svc) },
  )

  /** 卡片内容的自绘条：与 content 同级挂在已经 fixed 的 positioner 上 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
  })

  private machineProps(): Partial<HoverCardSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      placement: this.placement,
      offset: this.offset,
      openDelay: this.openDelay,
      closeDelay: this.closeDelay,
      dir: this.direction,
      disabled: this.disabled ?? false,
      size: this.size,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.hoverCardScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着可见态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // trigger 记为本层分支：指针按在它上面算层内交互，不该把刚悬停出来的卡片关掉。
      // 浮层壳一并记上：卡片之外还浮着自绘滚动条，按住它拖动不该把卡片消解掉
      branches: () => [this.getPart('trigger'), this.getPart('positioner')].filter(Boolean) as Element[],
      // 悬停卡片从不模态：不陷焦点、不锁滚动、没有自带遮罩
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 每次(重)建机器后都要重注：refs 属于机器实例，重连时的新机器不会继承旧的。
  private injectRefs(svc: Service<HoverCardSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 角色节点提前发现一次：default-open 时机器在 hostConnected 当场进入可见态，
   * 定位副作用同步取一次 trigger/positioner——而常规发现要等首次 updated，
   * 那一刻 partMap 还空着，引擎挂不上，浮层会停在容器左上角。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  protected wire(): void {
    const api = connectHoverCard(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是坐标对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('arrow', api.getArrowProps() as Record<string, unknown>)

    // Light DOM content 常驻，WC 自管可见性：本仓的 hover-card.css 给 content 设了 display:flex，
    // 任何 display 都会盖过 UA 的 [hidden]{display:none}。那份样式自带
    // [data-part=content][hidden]{display:none} 压得住，但宿主不能指望作者装了它——
    // 换别家样式给 content 来一句 display，收起态的卡片就会永久悬在页面上，只有内联 style 压得住。
    const content = this.getPart('content')
    if (content)
      // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
      // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
      this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(content)
    this.exit.update(api.open)
    this.setPartHidden(content, !this.exit.visible)

    this.bars.wire()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    this.setPartHidden(this.getPart('content'), true)
    // 层由可见态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
