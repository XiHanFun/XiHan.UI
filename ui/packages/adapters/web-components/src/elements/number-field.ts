import type { NumberFieldSchema, NumberFieldValueChangeDetails } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import { connectNumberField, numberFieldAnatomy, numberFieldMachine, numberFieldMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-number-field>` —— Light-DOM 行为宿主：作者写 root/label/input/加减按钮四类角色节点，
 * 元素跑 number-field 机器并把 connect 产出打上去。
 *
 * 键盘全在 input 上（ArrowUp/Down 步进、PageUp/Down 大步进、Home/End 取端点），
 * 两个按钮对读屏隐藏——它们只是指针用户的快捷方式，暴露出来等于把同一个控件报两遍。
 *
 * @customElement xh-number-field
 * @attr {string} value - 受控值（原始输入串）；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {number} min - 下界；给了 Home 才接管
 * @attr {number} max - 上界；给了 End 才接管
 * @attr {number} step - 方向键与按钮的步长，默认 1
 * @attr {number} large-step - PageUp/PageDown 的步长，默认 10 倍 step
 * @attr {boolean} disabled - 禁用：不可聚焦、推不动
 * @attr {boolean} read-only - 只读：仍可聚焦与复制，推不动
 * @attr {boolean} required - 必填标注
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} name - 表单字段名；给了才参与提交
 * @attr {number} change-delay - 按住加减按钮多久开始连发，默认 300ms
 * @attr {number} change-interval - 连发间隔，默认 50ms
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 值变化；detail 为 `{ value: string, valueAsNumber: number }`
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty 的容器
 * @csspart label - 标题；`for` 恒写向 input，故须是原生 `<label>` 才点得动
 * @csspart input - role=spinbutton 的输入框，键盘交互全在它身上
 * @csspart increment-trigger - 加一步；贴住 max 时转 disabled
 * @csspart decrement-trigger - 减一步；贴住 min 时转 disabled
 */
export class XhNumberFieldElement extends XhElement {
  static override partContract = { anatomy: numberFieldAnatomy, meta: numberFieldMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    min: { converter: NUMBER_CONVERTER },
    max: { converter: NUMBER_CONVERTER },
    step: { converter: NUMBER_CONVERTER },
    largeStep: { converter: NUMBER_CONVERTER, attribute: 'large-step' },
    disabled: { type: Boolean },
    readOnly: { type: Boolean, attribute: 'read-only' },
    required: { type: Boolean },
    invalid: { type: Boolean },
    name: { converter: STRING_CONVERTER },
    changeDelay: { converter: NUMBER_CONVERTER, attribute: 'change-delay' },
    changeInterval: { converter: NUMBER_CONVERTER, attribute: 'change-interval' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare value?: string
  declare defaultValue?: string
  declare min?: number
  declare max?: number
  declare step?: number
  declare largeStep?: number
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare changeDelay?: number
  declare changeInterval?: number
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size

  private readonly notify = (details: NumberFieldValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<NumberFieldSchema>(this, numberFieldMachine, () => this.machineProps())

  private machineProps(): Partial<NumberFieldSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      min: this.min,
      max: this.max,
      step: this.step,
      largeStep: this.largeStep,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      required: this.required ?? false,
      invalid: this.invalid ?? false,
      name: this.name,
      changeDelay: this.changeDelay,
      changeInterval: this.changeInterval,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectNumberField(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('increment-trigger', api.getIncrementTriggerProps() as Record<string, unknown>)
    put('decrement-trigger', api.getDecrementTriggerProps() as Record<string, unknown>)
    // 输入框的 value 不需要在这里另外回写：spreader 把 value/checked/selected 三个键
    // 当 property 写（dom/spread.ts 的 PROP_KEYS），属性写法只管初值、盖不住用户输入过的框
  }
}
