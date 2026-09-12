import type { Cleanup, IdGenerator, Layer, OverlayBackdropVariant, PortalLease, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type { DialogOpenChangeDetails, DialogSchema } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createPortalLease, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDialog, dialogAnatomy, dialogMachine, dialogMeta } from '@xihan-ui/headless'
import { resolveXhConfig } from '../config'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 属性缺席翻成 undefined，缺省值由皮肤的缺省档决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-dialog>` —— Light-DOM 行为宿主，跑 dialog 机器并把 connect 产出打到角色节点上，
 * 关闭时用内联 style.display 隐藏浮层子树。
 *
 * @customElement xh-dialog
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为打开
 * @attr {boolean} modal - 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true
 * @attr {'dialog'|'alertdialog'} role - 语义角色，默认 dialog
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true
 * @attr {boolean} restore-focus - 关闭后把焦点归还触发元素，默认 true
 * @attr {string} initial-focus - 展开后先聚焦到 content 内匹配此选择器的元素
 * @attr {'sm'|'md'|'lg'} size - 尺寸：只换 content 的最大宽度，落在 content 上
 * @attr {'opaque'|'blur'|'transparent'} variant - 遮罩形态：只换 backdrop 的底色与模糊
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires exit-complete - 退出完成且本层资源已释放
 * @csspart trigger - 触发按钮
 * @csspart backdrop - 遮罩层
 * @csspart positioner - 浮层定位容器
 * @csspart content - 对话框内容（role/aria-modal/焦点陷阱所在）
 * @csspart header - 面板头：标题与说明所在的那一段，不跟着正文滚
 * @csspart indicator - 语气徽记：不给内容就由皮肤按节点上的 data-tone 画兜底字形
 * @csspart title - 标题（aria-labelledby 目标）
 * @csspart description - 描述（aria-describedby 目标）
 * @csspart body - 正文：面板里唯一会滚的一段
 * @csspart footer - 面板尾：动作按钮所在的那一段，不跟着正文滚
 * @csspart close-trigger - 关闭按钮
 */
export class XhDialogElement extends XhElement {
  static override partContract = { anatomy: dialogAnatomy, meta: dialogMeta }

  // role 不声明为响应式属性，复用 HTMLElement 原生反射，在 machineProps 里经 getAttribute 读取。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    modal: { converter: BOOLEAN_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    restoreFocus: { converter: BOOLEAN_CONVERTER, attribute: 'restore-focus' },
    initialFocus: { converter: STRING_CONVERTER, attribute: 'initial-focus' },
    size: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    // 对象进不了属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare modal?: boolean
  declare closeOnEscape?: boolean
  declare restoreFocus?: boolean
  declare initialFocus?: string
  declare size?: Size
  declare variant?: OverlayBackdropVariant
  /** 关闭按钮的无障碍名；connect 每帧重写 aria-label，作者写在节点上会被盖掉，只能从这里给。 */
  declare translations?: DialogSchema['props']['translations']

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // 运行时环境必须始终取宿主当前所属 Document：iframe 创建或 adopt 之后不能继续用构造时的全局 realm。
  private readonly dialogScope = createScope(() => this, this.idGen)
  private config: RuntimeConfig | null = null
  private contentNode: HTMLElement | null = null
  private exit: OverlayExit | null = null
  private backdropNode: HTMLElement | null = null
  private portal: PortalLease | null = null

  private readonly notify = (details: DialogOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<DialogSchema>(
    this,
    dialogMachine,
    () => this.machineProps(),
    { scope: this.dialogScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<DialogSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      modal: this.modal,
      role: (this.getAttribute('role') as DialogSchema['props']['role']) ?? undefined,
      closeOnEscape: this.closeOnEscape,
      restoreFocus: this.restoreFocus,
      initialFocus: this.initialFocus,
      size: this.size,
      variant: this.variant,
      translations: this.translations,
      onOpenChange: this.notify,
      onExitComplete: () => this.dispatchEvent(new CustomEvent('exit-complete', { bubbles: true, composed: true })),
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    // scrollRoot 每次现读：配置沿祖先链解析，元素搬家或 <xh-config> 改了都要跟上
    this.config = createRuntimeConfig({
      scope: this.dialogScope,
      idGenerator: this.idGen,
      scrollRoot: () => resolveXhConfig(this).scrollRoot?.() ?? null,
    })
  }

  /** 退场闸门建一次；presence 不是响应式 cell，退场结束要显式排一次更新才轮得到收起。 */
  private ensureExit(open: boolean): OverlayExit {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open,
      onExitComplete: () => this.requestUpdate(),
    })
    return this.exit
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal?.roots ?? []
  }

  /**
   * 视口模态层的 backdrop 与 positioner 一起租到当前 Document 的 Portal 根。两根共用一枚租约，
   * 关闭完成、转为非模态、作者换根或宿主断开时，Core 用各自 placeholder 精确归还作者位置。
   */
  private mountViewportPortal(backdrop: HTMLElement, positioner: HTMLElement): void {
    if (this.portal?.roots[0] === backdrop && this.portal.roots[1] === positioner && this.portal.source === this)
      return
    this.restoreViewportPortal()
    this.ensureConfig()
    const target = this.config!.portalContainer()
    if (!target)
      throw new Error('[xh] Dialog 视口模态浮层需要显式可用的 Portal 容器')
    this.portal = createPortalLease({
      source: this,
      target,
      roots: [backdrop, positioner],
    })
    this.requestUpdate()
  }

  private restoreViewportPortal(): void {
    const portal = this.portal
    if (!portal)
      return
    this.portal = null
    try {
      portal.release()
    }
    finally {
      if (this.isConnected)
        this.requestUpdate()
    }
  }

  // 只交注册函数，层的入栈出栈由机器的 trackOverlay 效应跟着展开态做。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'modal',
      node: () => this.contentNode,
      branches: () => [],
      isModal: () => this.machineProps().modal ?? true,
      surfaces: () => [this.backdropNode].filter(Boolean) as Element[],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<DialogSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.ensureExit(svc.state.get() === 'open').presence)
    svc.refs.set('getContentEl', () => this.contentNode)
    svc.refs.set('getTriggerEl', () => this.getPart('trigger'))
    svc.refs.set('branches', () => [])
  }

  protected wire(): void {
    const svc = this.ctrl.service
    const api = connectDialog(svc, wcNormalize)
    const open = svc.state.get() === 'open'

    this.contentNode = this.getPart('content')
    this.backdropNode = this.getPart('backdrop')

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('backdrop', api.getBackdropProps() as Record<string, unknown>)
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('body', api.getBodyProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)

    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    const exit = this.ensureExit(open)
    const modal = this.machineProps().modal ?? true
    exit.track(this.contentNode, modal ? this.backdropNode : null)
    exit.update(open)
    const visible = exit.visible

    const positioner = this.getPart('positioner')
    // 非模态不领取视口租约；Drawer 的 contained 档也保持作者局部坐标（此处 Dialog 没有 contained）。
    // 缺一个根时不做半搬运，仍让既有 Light-DOM 结构正常工作。
    if (modal && (open || visible) && this.backdropNode && positioner)
      this.mountViewportPortal(this.backdropNode, positioner)
    else
      this.restoreViewportPortal()

    // 收起用内联 display，优先级高于样式表对 [hidden] 的覆盖
    if (positioner)
      this.setPartHidden(positioner, !visible)
    if (this.backdropNode)
      this.setPartHidden(this.backdropNode, !visible || !modal)
    // positioner 不是必需部件，content 自己也要收起
    this.setPartHidden(this.contentNode, !visible)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并把子树收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上。
    // 只在机器已经收起时才强收——元素被移动（remove 后立刻 append）时展开态不该被打断
    this.exit?.dispose()
    this.exit = null
    this.restoreViewportPortal()
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.contentNode, true)
    this.config = null // 重连时 ensureConfig 重建
  }
}
