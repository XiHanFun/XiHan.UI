import type { TextFieldSchema, TextFieldValueChangeDetails } from '@xihan-ui/headless'
import { connectTextField, textFieldAnatomy, textFieldMachine, textFieldMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关会因此永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-text-field>` —— Light-DOM 行为宿主：作者写 root/label/input/clear-trigger 四类角色节点，
 * 元素跑 text-field 机器并把 connect 产出打上去。
 *
 * label 的 `for` 恒写向 input 的 id，所以 label 角色节点必须是原生 `<label>`、
 * input 角色节点必须是原生 `<input>`：任一边换成 `<div>`，点标题不聚焦、读屏也念不出名字。
 *
 * 键盘只额外接一个 Escape（clearable 且有值时清空），其余光标与选区行为全归浏览器。
 * 清空按钮对读屏隐藏、不占 Tab 位——它只是指针用户的快捷方式，键盘那一路走 Escape。
 *
 * @customElement xh-text-field
 * @attr {string} value - 受控值；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {string} placeholder - 占位文案
 * @attr {boolean} disabled - 禁用：不可聚焦、写不进
 * @attr {boolean} read-only - 只读：仍可聚焦与复制，写不进
 * @attr {boolean} required - 必填标注
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} name - 表单字段名；给了才参与提交
 * @attr {number} max-length - 字符数上限；同时落成原生 maxlength 与机器侧截断
 * @attr {boolean} clearable - 开启清空：清空按钮显出并在有值时可用，Escape 接管
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty / data-at-limit 的容器
 * @csspart label - 标题；`for` 恒写向 input，故须是原生 `<label>` 才点得动
 * @csspart input - 真正的输入框，须是原生 `<input>`；键盘交互全在它身上
 * @csspart clear-trigger - 清空按钮；未开 clearable 时收起，无值或不可编辑时置灰
 */
export class XhTextFieldElement extends XhElement {
  static override partContract = { anatomy: textFieldAnatomy, meta: textFieldMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    placeholder: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    maxLength: { converter: NUMBER_CONVERTER, attribute: 'max-length' },
    clearable: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare value?: string
  declare defaultValue?: string
  declare placeholder?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare maxLength?: number
  declare clearable?: boolean
  declare variant?: string
  declare tone?: string
  declare size?: string

  private readonly notify = (details: TextFieldValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TextFieldSchema>(this, textFieldMachine, () => this.machineProps())

  private machineProps(): Partial<TextFieldSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      placeholder: this.placeholder,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      required: this.required ?? false,
      invalid: this.invalid ?? false,
      name: this.name,
      maxLength: this.maxLength,
      clearable: this.clearable ?? false,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notify,
    }
  }

  protected wire(): void {
    const api = connectTextField(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    // 输入框的 value 不必在这里另外回写：spreader 把 value/checked/selected 三个键
    // 当 property 写（dom/spread.ts 的 PROP_KEYS），属性写法只管初值、盖不住用户输入过的框

    // 收起清空按钮只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条 display
    // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
    this.setPartHidden(this.getPart('clear-trigger'), !api.clearable)
  }
}
