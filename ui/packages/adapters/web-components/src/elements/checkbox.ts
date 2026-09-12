import type { Size, Tone } from '@xihan-ui/core'
import type { CheckboxCheckedChangeDetails, CheckboxCheckedState, CheckboxSchema, FormControlState } from '@xihan-ui/headless'
import { checkboxAnatomy, checkboxMachine, checkboxMeta, connectCheckbox, resolveFormControlState } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-checkbox>` —— Light-DOM 行为宿主，跑 checkbox 机器并把 connect 产出打到 root/indicator 角色节点。
 *
 * @customElement xh-checkbox
 * @attr {boolean|'indeterminate'} checked - 受控选中；写 indeterminate 为半选，缺省该属性即非受控
 * @attr {boolean|'indeterminate'} default-checked - 非受控初值
 * @attr {boolean} disabled - 禁用
 * @attr {boolean} read-only - 只读：勾不动，但仍可聚焦、仍参与提交
 * @attr {boolean} invalid - 校验失败态
 * @attr {boolean} required - 必填
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
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    value: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    tone: {},
    size: {},
  }

  declare checked?: CheckboxCheckedState
  declare defaultChecked?: CheckboxCheckedState
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare value?: string
  declare tone?: Tone
  declare size?: Size

  private readonly notify = (details: CheckboxCheckedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('checked-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CheckboxSchema>(this, checkboxMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；四轴优先级由 Headless 真源结算。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<CheckboxSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      required: this.required,
    }, this.inheritedControl)
    return {
      checked: this.checked,
      defaultChecked: this.defaultChecked ?? false,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      required: control.required,
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
