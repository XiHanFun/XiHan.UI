import type { CheckboxCheckedChangeDetails, CheckboxCheckedState, CheckboxSchema } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { checkboxAnatomy, checkboxMachine, checkboxMeta, connectCheckbox } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-checkbox>` —— Light-DOM 行为宿主，跑 checkbox 机器并把 connect 产出打到 root/indicator 角色节点。
 *
 * @customElement xh-checkbox
 * @attr {boolean|'indeterminate'} checked - 受控选中；写 indeterminate 为半选，缺省该属性即非受控
 * @attr {boolean|'indeterminate'} default-checked - 非受控初值
 * @attr {boolean} disabled - 禁用
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires checked-change - checked 状态变化；detail 为 `{ checked: boolean }`
 * @csspart root - role=checkbox 的按钮（承载 aria-checked / data-state）
 * @csspart indicator - 选中标记
 * @attr {string} name - 表单字段名；给了 hidden-input 才参与提交
 * @csspart hidden-input - type=hidden 的表单出口，省略该节点即不参与表单
 * @csspart label - 可选：包住 root 与 text 的 <label>，点文字即切换
 * @csspart text - 可选：控件旁的文字
 */
export class XhCheckboxElement extends XhElement {
  static override partContract = { anatomy: checkboxAnatomy, meta: checkboxMeta }

  static override properties = {
    // 三态：写 checked="indeterminate" 表示半选；缺席即非受控
    checked: { converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v === 'indeterminate' ? 'indeterminate' : v !== 'false') } },
    defaultChecked: { attribute: 'default-checked', converter: { fromAttribute: (v: string | null) => (v === null ? undefined : v === 'indeterminate' ? 'indeterminate' : v !== 'false') } },
    disabled: { type: Boolean },
    name: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    value: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    tone: {},
    size: {},
  }

  declare checked?: CheckboxCheckedState
  declare defaultChecked?: CheckboxCheckedState
  declare disabled?: boolean
  declare name?: string
  declare value?: string
  declare tone?: Tone
  declare size?: Size

  private readonly notify = (details: CheckboxCheckedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('checked-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CheckboxSchema>(this, checkboxMachine, () => this.machineProps())

  private machineProps(): Partial<CheckboxSchema['props']> {
    return {
      checked: this.checked,
      defaultChecked: this.defaultChecked ?? false,
      disabled: this.disabled ?? false,
      tone: this.tone,
      size: this.size,
      name: this.name,
      value: this.value,
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
    const hidden = this.getPart('hidden-input')
    if (hidden)
      this.spreader.spread(hidden, api.getHiddenInputProps() as Record<string, unknown>)
    // 带文字时作者自己写 <label data-part=label> 包住 root 与 <span data-part=text>
    const label = this.getPart('label')
    if (label)
      this.spreader.spread(label, api.getLabelProps() as Record<string, unknown>)
    const text = this.getPart('text')
    if (text)
      this.spreader.spread(text, api.getTextProps() as Record<string, unknown>)
  }
}
