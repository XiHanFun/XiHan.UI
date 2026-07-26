import type { IdGenerator, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { DialogOpenChangeDetails, DialogSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDialog, dialogMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-dialog>` —— Light-DOM 行为宿主：用户写 trigger/backdrop/positioner/content/... 角色节点，
 * 元素跑 dialog 机器并把 connect 产出打上去。关闭时用内联 style.display 隐藏浮层子树。
 *
 * @customElement xh-dialog
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为打开
 * @attr {boolean} modal - 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true
 * @attr {'dialog'|'alertdialog'} role - 语义角色，默认 dialog
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true
 * @attr {boolean} restore-focus - 关闭后把焦点归还触发元素，默认 true
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
  // role 不声明为响应式属性——复用 HTMLElement 原生的 role 属性反射（避免类型冲突），
  // 在 machineProps 里经 getAttribute 读取。
  static override properties = {
    open: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    modal: { type: Boolean },
    closeOnEscape: { type: Boolean, attribute: 'close-on-escape' },
    restoreFocus: { type: Boolean, attribute: 'restore-focus' },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare modal?: boolean
  declare closeOnEscape?: boolean
  declare restoreFocus?: boolean

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly dialogScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null
  private layer: Layer | null = null
  private disposeLayer: (() => void) | null = null
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
      modal: this.hasAttribute('modal') ? this.modal : undefined,
      role: (this.getAttribute('role') as DialogSchema['props']['role']) ?? undefined,
      closeOnEscape: this.hasAttribute('close-on-escape') ? this.closeOnEscape : undefined,
      restoreFocus: this.hasAttribute('restore-focus') ? this.restoreFocus : undefined,
      onOpenChange: this.notify,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.dialogScope, idGenerator: this.idGen })
    const reg = this.config.layerRegistry.register({
      kind: 'modal',
      node: () => this.contentNode,
      branches: () => [],
      isModal: () => this.machineProps().modal ?? true,
      setModal: () => {},
      surfaces: () => [this.backdropNode].filter(Boolean) as Element[],
    })
    this.layer = reg.layer
    this.disposeLayer = reg.dispose
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<DialogSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('layer', this.layer)
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

    // Light DOM content 常驻，WC 自管可见性：关闭时隐藏浮层子树。
    // 用内联 style.display 而非 hidden——styled 的 [data-part=positioner]{display:flex}
    // （author 层）优先级高于 UA 的 [hidden]{display:none}，hidden 压不住；内联样式才压得住。
    // Vue 靠卸载不走这条路，styled 不改，其退场动画不受影响。
    const positioner = this.getPart('positioner')
    if (positioner)
      positioner.style.display = open ? '' : 'none'
    if (this.backdropNode)
      this.backdropNode.style.display = open ? '' : 'none'
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.disposeLayer?.()
    this.disposeLayer = null
    this.layer = null
    this.config = null // 重连时 ensureConfig 重建
  }
}
