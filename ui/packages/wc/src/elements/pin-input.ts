import type { PinInputSchema, PinInputTranslations, PinInputType, PinInputValueChangeDetails } from '@xihan-ui/headless'
import { connectPinInput, pinInputAnatomy, pinInputMachine, pinInputMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 值在属性里是一整串（value="1234"），逐字符摊成数组；长度归一交给机器。
// 直接给 property 赋数组时不过转换器，两种写法都通
const ARRAY_CONVERTER = { fromAttribute: (v: string | null) => (v == null ? undefined : [...v]) }

/** 作者写在格子上的下标。缺席或写坏了就退回文档序——手写 HTML 时把格子按顺序排下来本身就是声明。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * `<xh-pin-input>` —— Light-DOM 行为宿主：作者写 root/label/input（多个）/hidden-input 角色节点，
 * 元素跑 pin-input 机器并把 connect 产出打上去。
 *
 * 每格是一个原生输入框：敲一个字符自动跳下一格，退格在空格上回退并清掉上一格，
 * 左右键与 Home/End 在格间移动，粘贴整串按格分发。不接受的字符直接丢弃，
 * 既不进值也不留在框里。整份值另由 hidden-input 随表单提交。
 *
 * @customElement xh-pin-input
 * @attr {string} value - 受控值，逐字符摊进各格；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值，同样逐字符摊开
 * @attr {number} length - 格数，默认 6
 * @attr {'numeric'|'alphanumeric'|'alphabetic'} type - 接受的字符类别，默认 numeric
 * @attr {boolean} mask - 遮蔽显示：每格转 type=password
 * @attr {boolean} otp - 一次性验证码：补 autocomplete=one-time-code
 * @attr {string} placeholder - 空格子的占位字符
 * @attr {boolean} disabled - 禁用：每格带原生 disabled，隐藏输入不参与提交
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} blur-on-complete - 填满即把焦点撤走
 * @attr {string} name - 表单字段名；给了隐藏输入才带 name
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 值变化；detail 为 `{ value: string[], valueAsString: string }`
 * @fires value-complete - 每格都填满；detail 同上
 * @csspart root - role=group 的容器，承载 data-disabled / data-invalid / data-complete
 * @csspart label - 标题；`for` 恒写向首格，故须是原生 `<label>` 才点得动
 * @csspart input - 一格一个的输入框，可自带 index 属性声明下标，缺省按文档序；aria-label 由内置文案给出
 * @csspart hidden-input - type=hidden 的表单出口，值是拼好的整串
 */
export class XhPinInputElement extends XhElement {
  static override partContract = { anatomy: pinInputAnatomy, meta: pinInputMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: ARRAY_CONVERTER },
    defaultValue: { converter: ARRAY_CONVERTER, attribute: 'default-value' },
    length: { converter: NUMBER_CONVERTER },
    type: { converter: STRING_CONVERTER },
    mask: { type: Boolean },
    otp: { type: Boolean },
    placeholder: { converter: STRING_CONVERTER },
    disabled: { type: Boolean },
    invalid: { type: Boolean },
    blurOnComplete: { type: Boolean, attribute: 'blur-on-complete' },
    name: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare value?: string[]
  declare defaultValue?: string[]
  declare length?: number
  declare type?: PinInputType
  declare mask?: boolean
  declare otp?: boolean
  declare placeholder?: string
  declare disabled?: boolean
  declare invalid?: boolean
  declare blurOnComplete?: boolean
  declare name?: string
  declare variant?: string
  declare tone?: string
  declare size?: string
  declare translations?: Partial<PinInputTranslations>

  private readonly notifyChange = (details: PinInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyComplete = (details: PinInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-complete', { detail: details, bubbles: true, composed: true }))
  }

  // pin-input 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<PinInputSchema>(this, pinInputMachine, () => this.machineProps())

  private machineProps(): Partial<PinInputSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      length: this.length,
      type: this.type,
      mask: this.mask ?? false,
      otp: this.otp ?? false,
      placeholder: this.placeholder,
      disabled: this.disabled ?? false,
      invalid: this.invalid ?? false,
      blurOnComplete: this.blurOnComplete ?? false,
      name: this.name,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notifyChange,
      onValueComplete: this.notifyComplete,
    }
  }

  protected wire(): void {
    const api = connectPinInput(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 格子是多实例 part，逐个打。打上去的 data-scope/data-part 正是移格与粘贴在事件那一刻
    // 现查 DOM 的依据，所以 wire 必须先于事件跑过——updated() 已保证。
    this.getParts('input').forEach((el, position) => {
      const props = api.getInputProps({ index: declaredIndex(el, position) })
      this.spreader.spread(el, props as Record<string, unknown>)
    })
    // 各格的 value 不需要在这里另外回写：spreader 把 value/checked/selected 三个键
    // 当 property 写（dom/spread.ts 的 PROP_KEYS），属性写法只管初值、盖不住用户输入过的框
  }
}
