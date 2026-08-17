import type { DrawerOpenChangeDetails, DrawerSchema } from '@xihan-ui/headless'
import type { Cleanup, IdGenerator, Layer, RuntimeConfig, Size } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { OverlayExit } from '../overlay-exit'
import { connectDrawer, drawerAnatomy, drawerMachine, drawerMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-drawer>` —— Light-DOM 行为宿主，跑 drawer 机器并把 connect 产出打到角色节点上，
 * 关闭时用内联 style.display 隐藏浮层子树。
 *
 * 键盘与 ARIA 契约同 dialog；side 决定滑入方向，以 data-side 落在 root 与 content 上供样式取用。
 *
 * @customElement xh-drawer
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为打开
 * @attr {boolean} modal - 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true
 * @attr {boolean} contained - 局部抽屉：遮罩与定位层从 fixed 换成 absolute，只罩住最近的定位祖先而不是盖满整屏。
 *   本元素是 Light DOM、作者写在哪浮层就在哪，所以「挂到哪个容器」这件事本身不需要属性——写上它是为了让皮肤按容器画
 * @attr {'top'|'right'|'bottom'|'left'} side - 从哪条边滑出，默认 right
 * @attr {'dialog'|'alertdialog'} role - 语义角色，默认 dialog
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true
 * @attr {boolean} close-on-interact-outside - 点击浮层外关闭；默认跟随 modal，alertdialog 恒不关
 * @attr {boolean} restore-focus - 关闭后把焦点归还触发元素，默认 true
 * @attr {'sm'|'md'|'lg'} size - 尺寸：横放时换面板宽度、竖放时换面板高度
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 留在页面原地的容器，承载 data-side / data-size / data-state
 * @csspart trigger - 触发按钮
 * @csspart backdrop - 遮罩层
 * @csspart positioner - 浮层定位容器（贴边布局写在它身上）
 * @csspart content - 抽屉面板（role/aria-modal/焦点陷阱所在，另带 data-side / data-size）
 * @csspart title - 标题（aria-labelledby 目标）
 * @csspart description - 描述（aria-describedby 目标）
 * @csspart close-trigger - 关闭按钮
 */
export class XhDrawerElement extends XhElement {
  static override partContract = { anatomy: drawerAnatomy, meta: drawerMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  // role 不声明为响应式属性，复用 HTMLElement 原生反射，在 machineProps 里经 getAttribute 读取。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    modal: { converter: BOOLEAN_CONVERTER },
    contained: { converter: BOOLEAN_CONVERTER },
    side: { converter: STRING_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    closeOnInteractOutside: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-interact-outside' },
    restoreFocus: { converter: BOOLEAN_CONVERTER, attribute: 'restore-focus' },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare modal?: boolean
  declare contained?: boolean
  declare side?: DrawerSchema['props']['side']
  declare closeOnEscape?: boolean
  declare closeOnInteractOutside?: boolean
  declare restoreFocus?: boolean
  declare size?: Size
  declare translations?: DrawerSchema['props']['translations']

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly drawerScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null
  private contentNode: HTMLElement | null = null
  private exit: OverlayExit | null = null
  private backdropNode: HTMLElement | null = null

  private readonly notify = (details: DrawerOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<DrawerSchema>(
    this,
    drawerMachine,
    () => this.machineProps(),
    { scope: this.drawerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<DrawerSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      modal: this.modal,
      contained: this.contained ?? false,
      side: this.side,
      role: (this.getAttribute('role') as DrawerSchema['props']['role']) ?? undefined,
      closeOnEscape: this.closeOnEscape,
      closeOnInteractOutside: this.closeOnInteractOutside,
      restoreFocus: this.restoreFocus,
      size: this.size,
      translations: this.translations,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.drawerScope, idGenerator: this.idGen })
  }

  /** 退场闸门建一次；presence 不是响应式 cell，退场结束要显式排一次更新才轮得到收起。 */
  private ensureExit(): OverlayExit {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: this.ctrl.service.state.get() === 'open',
      onExitComplete: () => this.requestUpdate(),
    })
    return this.exit
  }

  // 只交注册函数，层的入栈出栈由机器的 trackOverlay 效应跟着展开态做。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'modal',
      node: () => this.contentNode,
      branches: () => [],
      isModal: () => this.machineProps().modal ?? true,
      setModal: () => {},
      surfaces: () => [this.backdropNode].filter(Boolean) as Element[],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<DrawerSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', null)
    svc.refs.set('getContentEl', () => this.contentNode)
    svc.refs.set('getTriggerEl', () => this.getPart('trigger'))
    svc.refs.set('branches', () => [])
  }

  protected wire(): void {
    const svc = this.ctrl.service
    const api = connectDrawer(svc, wcNormalize)
    const open = svc.state.get() === 'open'

    this.contentNode = this.getPart('content')
    this.backdropNode = this.getPart('backdrop')

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('backdrop', api.getBackdropProps() as Record<string, unknown>)
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)

    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    const exit = this.ensureExit()
    exit.track(this.contentNode)
    exit.update(open)
    const visible = exit.visible

    // 收起用内联 display，优先级高于样式表对 [hidden] 的覆盖
    const positioner = this.getPart('positioner')
    if (positioner)
      this.setPartHidden(positioner, !visible)
    if (this.backdropNode)
      this.setPartHidden(this.backdropNode, !visible)
    // positioner 不是必需部件，content 自己也要收起
    this.setPartHidden(this.contentNode, !visible)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并把子树收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上。
    // 只在机器已经收起时才强收——元素被移动（remove 后立刻 append）时展开态不该被打断
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.contentNode, true)
    this.config = null // 重连时 ensureConfig 重建
  }
}
