import type { CheckboxCheckedChangeDetails, CheckboxSchema } from '@xihan-ui/headless'
import { checkboxAnatomy, checkboxMachine, checkboxMeta, connectCheckbox } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-checkbox>` —— Light-DOM 行为宿主，跑 checkbox 机器并把 connect 产出打到 root/indicator 角色节点。
 *
 * @customElement xh-checkbox
 * @attr {boolean} checked - 受控选中；缺省该属性即非受控
 * @attr {boolean} default-checked - 非受控初始为选中
 * @attr {boolean} disabled - 禁用
 * @fires checked-change - checked 状态变化；detail 为 `{ checked: boolean }`
 * @csspart root - role=checkbox 的按钮（承载 aria-checked / data-state）
 * @csspart indicator - 选中标记
 */
export class XhCheckboxElement extends XhElement {
  static override partContract = { anatomy: checkboxAnatomy, meta: checkboxMeta }

  static override properties = {
    checked: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') } },
    defaultChecked: { type: Boolean, attribute: 'default-checked' },
    disabled: { type: Boolean },
  }

  declare checked?: boolean
  declare defaultChecked?: boolean
  declare disabled?: boolean

  private readonly notify = (details: CheckboxCheckedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('checked-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CheckboxSchema>(this, checkboxMachine, () => this.machineProps())

  private machineProps(): Partial<CheckboxSchema['props']> {
    return {
      checked: this.checked,
      defaultChecked: this.defaultChecked ?? false,
      disabled: this.disabled ?? false,
      onCheckedChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectCheckbox(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    const indicator = this.getPart('indicator')
    if (indicator)
      this.spreader.spread(indicator, api.getIndicatorProps() as Record<string, unknown>)
  }
}
