import type { SwitchCheckedChangeDetails, SwitchSchema } from '@xihan-ui/headless'
import { connectSwitch, switchMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-switch>` —— Light-DOM 行为宿主，跑 switch 机器并把 connect 产出打到 root/thumb 角色节点。
 *
 * @customElement xh-switch
 * @attr {boolean} checked - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-checked - 非受控初始为选中
 * @attr {boolean} disabled - 禁用
 * @fires checked-change - checked 状态变化；detail 为 `{ checked: boolean }`
 * @csspart root - role=switch 的按钮（承载 aria-checked / data-state）
 * @csspart thumb - 滑块
 */
export class XhSwitchElement extends XhElement {
  static override properties = {
    checked: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultChecked: { type: Boolean, attribute: 'default-checked' },
    disabled: { type: Boolean },
  }

  declare checked?: boolean
  declare defaultChecked?: boolean
  declare disabled?: boolean

  private readonly notify = (details: SwitchCheckedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('checked-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<SwitchSchema>(this, switchMachine, () => this.machineProps())

  private machineProps(): Partial<SwitchSchema['props']> {
    return {
      checked: this.checked,
      defaultChecked: this.defaultChecked ?? false,
      disabled: this.disabled ?? false,
      onCheckedChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectSwitch(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    const thumb = this.getPart('thumb')
    if (thumb)
      this.spreader.spread(thumb, api.getThumbProps() as Record<string, unknown>)
  }
}
