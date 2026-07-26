import type { IdGenerator, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { DialogOpenChangeDetails, DialogSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDialog, dialogMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// <xh-dialog> —— Light-DOM 行为宿主：用户写 trigger/backdrop/positioner/content/... 角色节点，
// 元素跑 dialog 机器并把 connect 产出打上去。presence 用 hidden 切换（Light DOM 不能删用户节点；
// 真机顶层可另加 Popover，jsdom 用 hidden 即可）。
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
    // 视觉隐藏交给 styled 层的 [data-state='closed']{display:none}；行为宿主只设 data-state。
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.disposeLayer?.()
    this.disposeLayer = null
    this.layer = null
    this.config = null // 重连时 ensureConfig 重建
  }
}
