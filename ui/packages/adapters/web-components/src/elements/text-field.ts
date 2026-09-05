import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TextFieldSchema, TextFieldType, TextFieldValueChangeDetails } from '@xihan-ui/headless'
import { autoSizeTextarea, connectTextField, textFieldAnatomy, textFieldMachine, textFieldMeta } from '@xihan-ui/headless'
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
 * @attr {'text'|'password'|'email'|'tel'|'url'|'search'} type - 单行输入类型，缺省 text；宿主写成 textarea 时该属性不发
 * @attr {string} placeholder - 占位文案
 * @attr {boolean} disabled - 禁用：不可聚焦、写不进
 * @attr {boolean} read-only - 只读：仍可聚焦与复制，写不进
 * @attr {boolean} required - 必填标注
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} name - 表单字段名；给了才参与提交
 * @attr {number} max-length - 字符数上限；同时落成原生 maxlength 与机器侧截断
 * @attr {boolean} clearable - 开启清空：有值时清空按钮显出，Escape 接管
 * @attr {boolean} auto-size - 多行宿主（input 部件写成 textarea）的自动高度；行数界限对象经 autoSize property 赋
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @prop {object} translations - 读屏文案（只走 property）：clearTrigger 是清空按钮的名字
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty / data-at-max 的容器
 * @csspart control - 视觉盒；写了它就由它画描边、底色与聚焦环，输入框与清空按钮排在它里面
 * @csspart label - 标题；`for` 恒写向 input，故须是原生 `<label>` 才点得动
 * @csspart input - 真正的输入框，须是原生 `<input>`；键盘交互全在它身上
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位，名字取 translations.clearTrigger；清不了时收起
 */
export class XhTextFieldElement extends XhElement {
  static override partContract = { anatomy: textFieldAnatomy, meta: textFieldMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    type: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    maxLength: { converter: NUMBER_CONVERTER, attribute: 'max-length' },
    clearable: { converter: BOOLEAN_CONVERTER },
    autoSize: { converter: BOOLEAN_CONVERTER, attribute: 'auto-size' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare type?: TextFieldType
  declare placeholder?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare name?: string
  declare maxLength?: number
  declare clearable?: boolean
  /** 布尔走 auto-size 属性；行数界限对象进不了属性，只作为 property 赋。 */
  declare autoSize?: TextFieldSchema['props']['autoSize']
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: TextFieldSchema['props']['translations']

  private readonly notify = (details: TextFieldValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TextFieldSchema>(this, textFieldMachine, () => this.machineProps())

  private machineProps(): Partial<TextFieldSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      type: this.type,
      placeholder: this.placeholder,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      required: this.required ?? false,
      invalid: this.invalid ?? false,
      name: this.name,
      maxLength: this.maxLength,
      clearable: this.clearable ?? false,
      autoSize: this.autoSize,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  /**
   * 清空此刻可不可行（开了 clearable、可编辑、且有值）。
   * 作者据它禁用自己写在组件外面的清空钮。机器尚未建起时为 false。
   */
  get canClear(): boolean {
    return this.ctrl.service ? connectTextField(this.ctrl.service, wcNormalize).canClear : false
  }

  /**
   * 从外面写值，只受禁用、只读与字数上限约束，与 clearable 无关。
   * 机器尚未建起时是空操作。
   */
  setValue(next: string): void {
    if (this.ctrl.service)
      connectTextField(this.ctrl.service, wcNormalize).setValue(next)
  }

  /**
   * 走清空意图，canClear 不成立时按兵不动；无条件清空请用 setValue('')。
   * 机器尚未建起时是空操作。
   */
  clear(): void {
    if (this.ctrl.service)
      connectTextField(this.ctrl.service, wcNormalize).clear()
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
    put('control', api.getControlProps() as Record<string, unknown>)
    // 作者把 input 部件写成 <textarea> 即多行宿主：connect 撤掉 type、接上自动高度
    const inputEl = this.getPart('input')
    const host = inputEl?.tagName === 'TEXTAREA' ? 'textarea' as const : 'input' as const
    put('input', api.getInputProps({ as: host }) as Record<string, unknown>)
    // 程序化写值不触发 input 事件，spread 后补量一次
    if (host === 'textarea' && inputEl)
      autoSizeTextarea(inputEl as HTMLTextAreaElement, api.autoSize)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    // 输入框的 value 不必在这里另外回写：spreader 把 value/checked/selected 三个键
    // 当 property 写（dom/spread.ts 的 PROP_KEYS），属性写法只管初值、盖不住用户输入过的框

    // 收起清空按钮只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条 display
    // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
    this.setPartHidden(this.getPart('clear-trigger'), !api.canClear)
  }
}
