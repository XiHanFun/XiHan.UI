import type { DialogOpenChangeDetails, DialogSchema } from '@xihan-ui/headless'
import type { Cleanup, IdGenerator, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectDialog, dialogAnatomy, dialogMachine, dialogMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
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
 * @attr {'sm'|'md'|'lg'} size - 尺寸：只换 content 的最大宽度，落在 content 上
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart trigger - 触发按钮
 * @csspart backdrop - 遮罩层
 * @csspart positioner - 浮层定位容器
 * @csspart content - 对话框内容（role/aria-modal/焦点陷阱所在）
 * @csspart title - 标题（aria-labelledby 目标）
 * @csspart description - 描述（aria-describedby 目标）
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
    size: { converter: STRING_CONVERTER },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare modal?: boolean
  declare closeOnEscape?: boolean
  declare restoreFocus?: boolean
  declare size?: string

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly dialogScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null
  private contentNode: HTMLElement | null = null
  private backdropNode: HTMLElement | null = null

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
      size: this.size,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.dialogScope, idGenerator: this.idGen })
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
  private injectRefs(svc: Service<DialogSchema>): void {
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
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('close-trigger', api.getCloseTriggerProps() as Record<string, unknown>)

    // 关闭时用内联 display 隐藏浮层子树，优先级高于样式表对 [hidden] 的覆盖
    const positioner = this.getPart('positioner')
    if (positioner)
      this.setPartHidden(positioner, !open)
    if (this.backdropNode)
      this.setPartHidden(this.backdropNode, !open)
    // positioner 不是必需部件，content 自己也要收起
    this.setPartHidden(this.contentNode, !open)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.config = null // 重连时 ensureConfig 重建
  }
}
