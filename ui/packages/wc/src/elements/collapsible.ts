import type { CollapsibleOpenChangeDetails, CollapsibleSchema } from '@xihan-ui/headless'
import { collapsibleAnatomy, collapsibleMachine, collapsibleMeta, connectCollapsible } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-collapsible>` —— Light-DOM 行为宿主，跑 collapsible 机器打到 root/trigger/content 角色节点，
 * 收起时用内联 style.display 隐藏 content。
 *
 * @customElement xh-collapsible
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 禁用 trigger 切换
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 披露根容器
 * @csspart trigger - 触发按钮（aria-expanded/aria-controls 所在）
 * @csspart content - 可折叠内容（收起时隐藏）
 */
export class XhCollapsibleElement extends XhElement {
  static override partContract = { anatomy: collapsibleAnatomy, meta: collapsibleMeta }

  static override properties = {
    open: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { type: Boolean },
    size: {},
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean
  declare size?: string

  private readonly notify = (details: CollapsibleOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CollapsibleSchema>(
    this,
    collapsibleMachine,
    () => this.machineProps(),
  )

  private machineProps(): Partial<CollapsibleSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: this.disabled ?? false,
      size: this.size,
      onOpenChange: this.notify,
    }
  }

  protected wire(): void {
    const svc = this.ctrl.service
    const api = connectCollapsible(svc, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // 收起时用内联 display 隐藏 content
    const content = this.getPart('content')
    if (content)
      this.setPartHidden(content, this.ctrl.service.state.get() !== 'open')
  }
}
