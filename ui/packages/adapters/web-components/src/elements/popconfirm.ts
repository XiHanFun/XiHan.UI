import type { Cleanup, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type { PopconfirmIntents, PopoverOpenChangeDetails, PopoverSchema } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectPopconfirm, popconfirmAnatomy, popconfirmMeta, popoverMachine } from '@xihan-ui/headless'
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
 * `<xh-popconfirm>` —— Light-DOM 行为宿主：用户写 root/trigger/positioner/content/... 角色节点，
 * 元素跑 popover 机器（开合、定位、消解层、焦点域都在那里）并把 connectPopconfirm 产出打上去。
 * 确认与取消不入机器，点下去先派出对应事件再请求收起。
 *
 * 浮层不陷焦点，也没有关闭按钮：答复由 confirm-trigger / cancel-trigger 两颗按钮给出，
 * Escape 与层外交互只收起浮层、只派 open-change。
 *
 * @customElement xh-popconfirm
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} placement - 首选放置位，默认 bottom；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px），默认 8
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true；写 close-on-escape="false" 关掉
 * @attr {boolean} close-on-interact-outside - 层外交互关闭，默认 true；写 "false" 关掉
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires confirm - 点了确认按钮；随后浮层收起。异步门走 confirmAction 属性：
 *   事件拿不到监听函数的返回值，给元素赋 `confirmAction = () => Promise` 即挂起确认门
 *   （浮层等兑现才收、确认按钮转圈，落空留在原地），confirm 事件照发只作通知
 * @fires cancel - 点了取消按钮；随后浮层收起
 * @csspart root - 框住触发器的根容器，承载 data-state
 * @csspart trigger - 触发按钮（aria-haspopup/aria-expanded/aria-controls 所在），同时是定位锚点
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - 浮层内容（role=alertdialog；焦点域与消解层的根节点），收起时带 hidden
 * @csspart title - 标题（aria-labelledby 目标）
 * @csspart description - 问题正文（aria-describedby 目标）
 * @csspart confirm-trigger - 确认按钮
 * @csspart cancel-trigger - 取消按钮
 */
export class XhPopconfirmElement extends XhElement {
  static override partContract = { anatomy: popconfirmAnatomy, meta: popconfirmMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    closeOnInteractOutside: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-interact-outside' },
    size: { converter: STRING_CONVERTER },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare placement?: Placement
  declare offset?: number
  declare closeOnEscape?: boolean
  declare closeOnInteractOutside?: boolean
  declare size?: Size

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly popconfirmScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notify = (details: PopoverOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  /**
   * 异步确认动作：事件拿不到监听函数的返回值，异步门走这个属性——
   * 返回 Promise 即挂起（浮层等兑现才收、确认按钮转圈），落空留在原地。
   * confirm 事件照发，只作通知。
   */
  declare confirmAction?: () => void | Promise<unknown>

  /** 异步确认的挂起布尔；变化时重打属性。 */
  private pendingState = false

  private readonly intents: PopconfirmIntents = {
    onConfirm: () => {
      this.dispatchEvent(new CustomEvent('confirm', { bubbles: true, composed: true }))
      return this.confirmAction?.()
    },
    onCancel: () => {
      this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
    },
    onPendingChange: (next) => {
      this.pendingState = next
      this.requestUpdate()
    },
  }

  private readonly ctrl = new MachineController<PopoverSchema>(
    this,
    popoverMachine,
    () => this.machineProps(),
    { scope: this.popconfirmScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<PopoverSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      placement: this.placement,
      offset: this.offset,
      closeOnEscape: this.closeOnEscape,
      closeOnInteractOutside: this.closeOnInteractOutside,
      size: this.size,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.popconfirmScope, idGenerator: this.idGen })
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
      isModal: () => false,
      setModal: () => {},
      // 气泡确认不自带遮罩，没有"点它就该关本层"的表面
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
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  protected wire(): void {
    // 挂起布尔按 wire 那一刻现读
    const api = connectPopconfirm(this.ctrl.service, { ...this.intents, pending: this.pendingState }, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可。
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('confirm-trigger', api.getConfirmTriggerProps() as Record<string, unknown>)
    put('cancel-trigger', api.getCancelTriggerProps() as Record<string, unknown>)

    // content 常驻 Light DOM，收起态由宿主用内联 display 兜住：皮肤给 content 设了 display，
    // 会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住。
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
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
