import type { ImageViewerIndexChangeDetails, ImageViewerItem, ImageViewerOpenChangeDetails, ImageViewerSchema, ImageViewerTranslations } from '@xihan-ui/headless'
import type { Cleanup, IdGenerator, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { OverlayExit } from '../overlay-exit'
import { connectImageViewer, imageViewerAnatomy, imageViewerCounterText, imageViewerMachine, imageViewerMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }

/**
 * `<xh-image-viewer>` —— Light-DOM 行为宿主，跑 image-viewer 机器：
 * 模态看片浮层，滚轮缩放、拖拽平移、旋转翻转与多图翻页。
 *
 * @customElement xh-image-viewer
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为打开
 * @attr {number} index - 受控下标（0 起）
 * @attr {number} default-index - 非受控初始下标，默认 0
 * @attr {boolean} loop - 前后翻页到头回绕，默认 true；写 loop="false" 关掉
 * @attr {number} zoom-step - 缩放步长（加法），默认 0.5
 * @attr {number} min-scale - 缩放下限，默认 0.25
 * @attr {number} max-scale - 缩放上限，默认 8
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true
 * @attr {boolean} close-on-interact-outside - 点遮罩关闭，默认 true
 * @attr {boolean} restore-focus - 关闭后把焦点归还触发元素，默认 true
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires index-change - 下标变化；detail 为 `{ index: number }`
 * @csspart trigger - 触发按钮
 * @csspart backdrop - 遮罩层
 * @csspart positioner - 浮层定位容器
 * @csspart content - 看片容器（role=dialog + aria-modal；方向键翻页在这里）
 * @csspart viewport - 手势视口（滚轮缩放、拖拽平移）
 * @csspart image - 当前那张图（src/alt/transform 由元素代填）
 * @csspart toolbar - 工具条容器
 * @csspart zoom-in-trigger - 放大
 * @csspart zoom-out-trigger - 缩小
 * @csspart rotate-left-trigger - 左转 90°
 * @csspart rotate-right-trigger - 右转 90°
 * @csspart flip-horizontal-trigger - 水平翻转
 * @csspart flip-vertical-trigger - 垂直翻转
 * @csspart reset-trigger - 变换归零
 * @csspart prev-trigger - 上一张
 * @csspart next-trigger - 下一张
 * @csspart counter - 「第 n / 共 m」计数（元素代填）
 * @csspart close-trigger - 关闭
 */
export class XhImageViewerElement extends XhElement {
  static override partContract = { anatomy: imageViewerAnatomy, meta: imageViewerMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    index: { converter: NUMBER_CONVERTER },
    defaultIndex: { converter: NUMBER_CONVERTER, attribute: 'default-index' },
    loop: { converter: BOOLEAN_CONVERTER },
    zoomStep: { converter: NUMBER_CONVERTER, attribute: 'zoom-step' },
    minScale: { converter: NUMBER_CONVERTER, attribute: 'min-scale' },
    maxScale: { converter: NUMBER_CONVERTER, attribute: 'max-scale' },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    closeOnInteractOutside: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-interact-outside' },
    restoreFocus: { converter: BOOLEAN_CONVERTER, attribute: 'restore-focus' },
    // 对象值进不了属性，只作为 property 暴露
    items: { attribute: false },
    translations: { attribute: false },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare index?: number
  declare defaultIndex?: number
  declare loop?: boolean
  declare zoomStep?: number
  declare minScale?: number
  declare maxScale?: number
  declare closeOnEscape?: boolean
  declare closeOnInteractOutside?: boolean
  declare restoreFocus?: boolean
  /** 图片清单。看单张就给长度 1 的数组。 */
  declare items?: ImageViewerItem[]
  /** 工具条按钮的可及名与计数文案；connect 每帧重写，只能从这里给。 */
  declare translations?: Partial<ImageViewerTranslations>

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly viewerScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null
  private contentNode: HTMLElement | null = null
  private exit: OverlayExit | null = null
  private backdropNode: HTMLElement | null = null
  /** counter 的文本归属：首帧为空才代填，作者写过内容就不碰。 */
  private counterOwned: boolean | null = null

  private readonly notifyOpen = (details: ImageViewerOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyIndex = (details: ImageViewerIndexChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('index-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ImageViewerSchema>(
    this,
    imageViewerMachine,
    () => this.machineProps(),
    { scope: this.viewerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<ImageViewerSchema['props']> {
    return {
      items: this.items,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      index: this.index,
      defaultIndex: this.defaultIndex,
      loop: this.loop,
      zoomStep: this.zoomStep,
      minScale: this.minScale,
      maxScale: this.maxScale,
      closeOnEscape: this.closeOnEscape,
      closeOnInteractOutside: this.closeOnInteractOutside,
      restoreFocus: this.restoreFocus,
      translations: this.translations,
      onOpenChange: this.notifyOpen,
      onIndexChange: this.notifyIndex,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.viewerScope, idGenerator: this.idGen })
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
      isModal: () => true,
      setModal: () => {},
      surfaces: () => [this.backdropNode].filter(Boolean) as Element[],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<ImageViewerSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('getContentEl', () => this.contentNode)
  }

  protected wire(): void {
    const svc = this.ctrl.service
    const api = connectImageViewer(svc, wcNormalize)
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
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('image', api.getImageProps() as Record<string, unknown>)
    put('toolbar', api.getToolbarProps() as Record<string, unknown>)
    put('zoom-in-trigger', api.getZoomInTriggerProps() as Record<string, unknown>)
    put('zoom-out-trigger', api.getZoomOutTriggerProps() as Record<string, unknown>)
    put('rotate-left-trigger', api.getRotateLeftTriggerProps() as Record<string, unknown>)
    put('rotate-right-trigger', api.getRotateRightTriggerProps() as Record<string, unknown>)
    put('flip-horizontal-trigger', api.getFlipHorizontalTriggerProps() as Record<string, unknown>)
    put('flip-vertical-trigger', api.getFlipVerticalTriggerProps() as Record<string, unknown>)
    put('reset-trigger', api.getResetTriggerProps() as Record<string, unknown>)
    put('prev-trigger', api.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.getNextTriggerProps() as Record<string, unknown>)
    put('counter', api.getCounterProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)

    // counter 首帧为空才代填；作者写过内容就归作者
    const counter = this.getPart('counter')
    if (counter) {
      if (this.counterOwned === null)
        this.counterOwned = (counter.textContent ?? '').trim() === ''
      if (this.counterOwned) {
        const text = imageViewerCounterText(this.translations, api.index, api.count)
        if (counter.textContent !== text)
          counter.textContent = text
      }
    }

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
