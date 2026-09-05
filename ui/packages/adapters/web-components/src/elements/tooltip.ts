import type { Cleanup, Direction, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { TooltipOpenChangeDetails, TooltipSchema } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectTooltip, tooltipAnatomy, tooltipMachine, tooltipMeta } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在机器。
// Lit 默认转换器会在属性被移除时把值落成 null，那样就再也表达不了"没写过"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 数值属性同理；写不成数的值（文字、单位后缀）当作没写，缺省仍由机器给。
const NUMBER_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v === null)
      return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  },
}

/**
 * `<xh-tooltip>` —— Light-DOM 行为宿主：用户写 trigger/positioner/content/arrow 角色节点，
 * 元素跑 tooltip 机器并把 connect 产出打上去。浮层坐标由本元素建的定位引擎算出，
 * 经 refs 交给机器的定位效应；引擎或角色节点缺席时机器照常转移，只是不产出坐标。
 *
 * @customElement xh-tooltip
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} placement - 请求的浮层朝向（top/right/bottom/left，可带 -start/-end 后缀），默认 bottom；空间不足时由引擎避让
 * @attr {number} offset - 浮层与锚点的间距（px），默认 8
 * @attr {'ltr'|'rtl'} dir - 文字方向，翻转浮层在行内轴上 start 与 end 的落点；只在显式给了才写到定位层上
 * @attr {number} open-delay - 悬停进入到展开的等待毫秒，默认 700
 * @attr {number} close-delay - 悬停移出到收起的等待毫秒，默认 300
 * @attr {boolean} disabled - 只关掉提示，被包裹的控件仍可用
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart trigger - 悬停/聚焦的锚点按钮（aria-describedby 指向 content）
 * @csspart positioner - 浮层定位容器（坐标写成内联样式，落定朝向在 data-placement）
 * @csspart content - role=tooltip 的提示内容（收起时 hidden）
 * @csspart arrow - 指向锚点的箭头，装饰性
 */
export class XhTooltipElement extends XhElement {
  static override partContract = { anatomy: tooltipAnatomy, meta: tooltipMeta }

  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    open: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
    // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    openDelay: { converter: NUMBER_CONVERTER, attribute: 'open-delay' },
    closeDelay: { converter: NUMBER_CONVERTER, attribute: 'close-delay' },
    disabled: { type: Boolean },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare placement?: Placement
  declare offset?: number
  declare direction?: Direction
  declare openDelay?: number
  declare closeDelay?: number
  declare disabled?: boolean
  declare tone?: Tone
  declare size?: Size

  private engine: PositionEnginePort | null = null

  /** 消解层与退场闸门共用一份环境包。 */
  private config: RuntimeConfig | null = null

  private readonly notify = (details: TooltipOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TooltipSchema>(
    this,
    tooltipMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<TooltipSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      placement: this.placement,
      offset: this.offset,
      dir: this.direction,
      openDelay: this.openDelay,
      closeDelay: this.closeDelay,
      disabled: this.disabled ?? false,
      tone: this.tone,
      size: this.size,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    this.config ??= createRuntimeConfig()
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着可见态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      // 提示只参与 Escape 仲裁与栈顶判定：节点就在文档流里，不陷焦点、不锁滚动、没有遮罩
      kind: 'inline',
      node: () => this.getPart('content'),
      // trigger 记为本层分支，点它算层内交互
      branches: () => [this.getPart('trigger')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
  }

  // 每次(重)建机器后都要重注：refs 属于机器实例，重连时的新机器不会继承旧的。
  // service 取参数不取 this.ctrl，重建时不依赖字段已回填。
  private injectRefs(svc: Service<TooltipSchema>): void {
    // 无 DOM（SSR / 纯逻辑测试）时不建引擎，机器读到 null 会跳过定位
    if (!this.engine && typeof document !== 'undefined')
      this.engine = createPositionEngine()
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.engine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
  }

  /**
   * 机器在 hostConnected 就挂载，初始即展开（open / default-open）时定位效应当场执行；
   * 而基类要到首次 updated 才发现角色节点，refs 的 getter 此刻取到 null，引擎静默跳过，
   * 之后状态不变就没有第二次机会——浮层会停在 0,0。故连接时先自行发现一次。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  protected wire(): void {
    const api = connectTooltip(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是坐标对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    // 提示内容常挂，收起时由 connect 输出 hidden。这里不做内联 display 兜底：
    // styles 的 [data-part=content] 只设 pointer-events/尺寸/配色，
    // [data-part=positioner] 只设 position/inset/z-index/pointer-events，两处都没有 display 声明，
    // UA 的 [hidden]{display:none} 压得住（collapsible/dialog 那两处 author 层给了 display，
    // 才必须用内联样式盖过）。
    put('content', api.getContentProps() as Record<string, unknown>)
    put('arrow', api.getArrowProps() as Record<string, unknown>)

    // 本仓自带的 tooltip.css 确实没给 content 设 display，但宿主不该指望作者装了这份样式：
    // 作者层只要给 content 来一句 display（Tailwind 的 flex/block 也算），
    // 就会盖过 UA 的 [hidden]{display:none}，收起态的提示框会永久悬在页面上。
    // 与 dialog/collapsible/popover 一致，用内联样式兜底。
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
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (!this.ctrl.service.state.matches('visible'))
      this.setPartHidden(this.getPart('content'), true)
  }
}
