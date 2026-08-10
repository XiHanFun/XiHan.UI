import type { DateFieldSchema, DateFieldValueChangeDetails, DateGranularity, DateSegmentType } from '@xihan-ui/headless'
import { connectDateField, dateFieldAnatomy, dateFieldMachine, dateFieldMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 默认的 Boolean 转换器判的是 v !== null，写 disabled="false" 反而成了真
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

type SegmentTexts = { readonly [K in DateSegmentType]?: string }

/** 作者写在段位上的下标。缺席或写坏了就退回文档序——手写 HTML 时把段位按顺序排下来本身就是声明。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * `<xh-date-field>` —— Light-DOM 行为宿主：作者写 root/label/control/segment（多个）/hidden-input
 * 角色节点，元素跑 date-field 机器并把 connect 产出打上去。
 *
 * 每一段是一个 role=spinbutton 的可聚焦节点：上下键加减并在段区间里回绕、左右键与 Home/End 换段、
 * 数字键直填且敲满自动跳下一段、Backspace 清掉本段。是哪一段由 locale（zh-CN 年月日、
 * en-US 月日年）与 granularity 算出来，作者只声明下标，不声明段名——同一份标记换个 locale
 * 就换一副面孔。精度用不上的段带 hidden 留在文档里，不卸载作者节点。
 *
 * 段位没填齐时整份值是 null；填齐了才拼出 ISO 串，由 hidden-input 随表单提交。
 *
 * 占位串与读屏名字是逐段的对象，属性表达不了，只能走 property
 * （`el.placeholder = { year: '年' }`）。
 *
 * @customElement xh-date-field
 * @attr {string} value - 受控值，ISO 串；写成空串即"受控且当前为空"；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值，同样是 ISO 串
 * @attr {string} min - 下界 ISO 串，参与各段区间的收窄
 * @attr {string} max - 上界 ISO 串
 * @attr {string} locale - BCP 47 语言标记，决定年月日三段的先后，默认 en-US
 * @attr {string} time-zone - IANA 时区名，只用来取"今天"（空段按上下键时的起点）
 * @attr {'day'|'hour'|'minute'|'second'} granularity - 精度，决定一共几段，默认 day
 * @attr {boolean} disabled - 禁用：整组退出 Tab 序，隐藏输入不参与提交
 * @attr {boolean} read-only - 只读：可聚焦、可换段，但改不动
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} required - 必填标注，落到每段的 aria-required 上
 * @attr {string} name - 表单字段名；给了隐藏输入才带 name
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 值变化；detail 为 `{ value: string | null }`
 * @csspart root - 最外层，承载 data-disabled / data-invalid / data-complete / data-out-of-range
 * @csspart label - 标题；点它把焦点送进首段
 * @csspart control - role=group 的分段容器
 * @csspart segment - 一段一个的 spinbutton 节点，可自带 index 属性声明下标，缺省按文档序
 * @csspart hidden-input - type=hidden 的表单出口，值是 ISO 串
 */
export class XhDateFieldElement extends XhElement {
  static override partContract = { anatomy: dateFieldAnatomy, meta: dateFieldMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    min: { converter: STRING_CONVERTER },
    max: { converter: STRING_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    timeZone: { converter: STRING_CONVERTER, attribute: 'time-zone' },
    granularity: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    placeholder: { attribute: false },
    translations: { attribute: false },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare value?: string
  declare defaultValue?: string
  declare min?: string
  declare max?: string
  declare locale?: string
  declare timeZone?: string
  declare granularity?: DateGranularity
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare placeholder?: SegmentTexts
  declare translations?: SegmentTexts
  declare variant?: string
  declare tone?: string
  declare size?: string

  private readonly notifyChange = (details: DateFieldValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // date-field 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<DateFieldSchema>(this, dateFieldMachine, () => this.machineProps())

  private machineProps(): Partial<DateFieldSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      min: this.min,
      max: this.max,
      locale: this.locale,
      timeZone: this.timeZone,
      granularity: this.granularity,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      required: this.required ?? false,
      name: this.name,
      placeholder: this.placeholder,
      translations: this.translations,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notifyChange,
    }
  }

  protected wire(): void {
    const api = connectDateField(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 段位是多实例 part，逐个打。打上去的 data-scope/data-part 正是换段在事件那一刻
    // 现查 DOM 的依据，所以 wire 必须先于事件跑过——updated() 已保证。
    this.getParts('segment').forEach((el, position) => {
      const index = declaredIndex(el, position)
      this.spreader.spread(el, api.getSegmentProps({ index }) as Record<string, unknown>)
      const state = api.segments[index]
      // 段位的文字归元素写：spreader 只管属性与事件，写不了文本。
      // 比一次再写：无谓的赋值会清掉这个节点里的选区，还会白白惊动一次变更记录
      const text = state?.text ?? ''
      if (el.textContent !== text)
        el.textContent = text
      // connect 已置 hidden，但作者若给段位设了 display 就会盖过 UA 的 [hidden]{display:none}；
      // 内联 style.display 优先级更高，压得住
      this.setPartHidden(el, state == null)
    })
  }
}
