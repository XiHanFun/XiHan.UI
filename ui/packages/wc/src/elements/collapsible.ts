import type { CollapsibleOpenChangeDetails, CollapsibleSchema } from '@xihan-ui/headless'
import { collapsibleMachine, connectCollapsible } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-collapsible>` —— Light-DOM 行为宿主：用户写 trigger/content 角色节点，
 * 元素跑 collapsible 机器并把 connect 产出打上去。收起时用内联 style.display 隐藏 content。
 *
 * @customElement xh-collapsible
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 禁用 trigger 切换
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 披露根容器
 * @csspart trigger - 触发按钮（aria-expanded/aria-controls 所在）
 * @csspart content - 可折叠内容（收起时隐藏）
 */
export class XhCollapsibleElement extends XhElement {
  static override properties = {
    open: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { type: Boolean },
  }

  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean

  private readonly notify = (details: CollapsibleOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  // collapsible 机器无副作用：不需要 config/layer/refs/scope，故 controller 只带 props。
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

    // Light DOM content 常驻，WC 自管可见性：收起时隐藏 content。
    // connect 已置 hidden，但 styled 若给 [data-part=content] 设 display 会盖过
    // UA 的 [hidden]{display:none}；内联 style.display 优先级更高，压得住。
    const content = this.getPart('content')
    if (content)
      this.setPartHidden(content, this.ctrl.service.state.get() !== 'open')
  }
}
