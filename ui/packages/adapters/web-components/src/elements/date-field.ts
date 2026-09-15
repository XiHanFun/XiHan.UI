/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date field 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { DateFieldSchema, DateFieldSegmentProps, DateFieldTranslations, DateFieldValueChangeDetails, DateGranularity, DateSegmentSet, DateSegmentType, FormControlState } from '@xihan-ui/headless'
import { connectDateField, dateFieldAnatomy, dateFieldMachine, dateFieldMeta, resolveFormControlState } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 默认的 Boolean 转换器判的是 v !== null，写 disabled="false" 反而成了真
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 段集用属性也表达得了：逗号分隔的段名。空串与只剩分隔符的写法等同于没给
const SEGMENT_SET_CONVERTER = {
  fromAttribute: (v: string | null): DateSegmentSet | undefined => {
    if (v === null)
      return undefined
    const list = v.split(',').map(part => part.trim()).filter(Boolean) as DateSegmentType[]
    return list.length > 0 ? list : undefined
  },
}

type SegmentTexts = { readonly [K in DateSegmentType]?: string }

/** 九个段位的名字，按段名声明时据此识别。 */
const SEGMENT_TYPES: readonly DateSegmentType[] = [
  'year',
  'quarter',
  'month',
  'week',
  'day',
  'hour',
  'minute',
  'second',
  'dayPeriod',
]

/** 作者写在段位上的下标。缺席或写错时退回文档序：手写 HTML 时把段位按顺序排列本身就是声明。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * 作者写在段位上的声明：`segment="quarter"` 按段名识别，否则按下标（默认退回文档序）。
 * 段名写错时视为未写，退回下标路径。
 */
function declaredSegment(el: HTMLElement, position: number): DateFieldSegmentProps {
  const raw = el.getAttribute('segment')?.trim()
  if (raw && (SEGMENT_TYPES as readonly string[]).includes(raw))
    return { segment: raw as DateSegmentType }
  return { index: declaredIndex(el, position) }
}

/**
 * `<xh-date-field>`：Light-DOM 行为宿主：作者写 root / label / control / segment-group / segment（多个）/ hidden-input
 * 角色节点，元素运行 date-field 状态机并把 connect 产出接上。
 *
 * 每一段是一个 role=spinbutton 的可聚焦节点：上下键加减并在段区间内回绕、左右键与 Home/End 换段、
 * 数字键直接填入且输满自动跳到下一段、Backspace 清除本段；可选的 clear-trigger 一键清空全部段。
 *
 * 段的身份有两种写法：只声明下标（`index`，或按文档序），具体是哪一段由 locale（zh-CN 年月日、
 * en-US 月日年）与段集计算：同一份标记更换 locale 即更换形态；或按段名固定
 * （`segment="quarter"`），段集中没有该段时该格收起。不使用的段带 hidden 保留在文档中，
 * 不卸载作者节点。
 *
 * 段位未填齐时整份值为 null；填齐后才拼出 ISO 串，由 hidden-input 随表单提交。
 *
 * 占位串与读屏名字是逐段的对象，属性无法表达，只能通过 property 设置
 * （`el.placeholder = { year: '年' }`）。
 *
 * @customElement xh-date-field
 * @attr {string} value - 受控值，ISO 串；写为空串即受控且当前为空；未提供该属性即非受控
 * @attr {string} default-value - 非受控初值，同样是 ISO 串
 * @attr {string} min - 下界 ISO 串，参与各段区间的收窄
 * @attr {string} max - 上界 ISO 串
 * @attr {string} locale - BCP 47 语言标记，决定年月日三段的先后；未提供时按宿主语言，宿主也没有时按 en-US
 * @attr {string} time-zone - IANA 时区名，只用于取今天（空段按上下键时的起点）
 * @attr {'day'|'hour'|'minute'|'second'} granularity - 精度，决定共有几段，默认 day
 * @attr {string} segments - 段集，逗号分隔的段名（`year,quarter`）；提供后 granularity 让位。
 *   可选的九块：year / quarter / month / week / day / hour / minute / second / dayPeriod。
 *   季度与月、周与日两两互斥，都写时以较细的粒度为准
 * @attr {boolean} disabled - 禁用：整组退出 Tab 序列，隐藏输入不参与提交
 * @attr {boolean} read-only - 只读：可聚焦、可换段，但不可修改
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} required - 必填标注，写入每段的 aria-required
 * @attr {string} name - 表单字段名；提供后隐藏输入才带 name
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：outline / subtle / ghost，默认 outline
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 值变化；detail 为 `{ value: string | null }`
 * @csspart root - 最外层，承载 data-disabled / data-invalid / data-complete / data-out-of-range
 * @csspart label - 标题；点击它把焦点送进首段
 * @csspart control - role=group 的分段容器
 * @csspart segment-group - 段位与分隔符的外壳，占满盒内剩余宽度
 * @csspart segment - 一段一个的 spinbutton 节点。可自带 segment 属性按段名归属（segment="quarter"），
 *   或自带 index 属性声明下标，两者都没写按文档序
 * @csspart clear-trigger - 清空按钮，不占 Tab 位；无值或不可编辑时收起，点击后焦点回到首段
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
    segments: { converter: SEGMENT_SET_CONVERTER },
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
  declare segments?: DateSegmentSet
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare placeholder?: SegmentTexts
  declare translations?: DateFieldTranslations
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size

  private readonly notifyChange = (details: DateFieldValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // date-field 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<DateFieldSchema>(this, dateFieldMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；四轴优先级由 Headless 真源结算。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<DateFieldSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      required: this.required,
    }, this.inheritedControl)
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      min: this.min,
      max: this.max,
      locale: this.locale,
      timeZone: this.timeZone,
      granularity: this.granularity,
      segments: this.segments,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      required: control.required,
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
    put('segment-group', api.getSegmentGroupProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 段位是多实例 part，逐个打。打上去的 data-scope/data-part 正是换段在事件那一刻
    // 现查 DOM 的依据，所以 wire 必须先于事件跑过——updated() 已保证。
    this.getParts('segment').forEach((el, position) => {
      const declared = declaredSegment(el, position)
      this.spreader.spread(el, api.getSegmentProps(declared) as Record<string, unknown>)
      const state = api.segmentOf(declared)
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
