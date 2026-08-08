import type { TimeFieldSchema, TimeFieldValueChangeDetails, TimeGranularity, TimeHourCycle, TimeSegmentType } from '@xihan-ui/headless'
import { connectTimeField, timeFieldAnatomy, timeFieldMachine, timeFieldMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关会因此永远关不掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 小时制只有 12 与 24 两个取值，写别的一律当作没写（回落到 locale 推断）
const HOUR_CYCLE_CONVERTER = {
  fromAttribute: (v: string | null): TimeHourCycle | undefined => (v === '12' ? 12 : v === '24' ? 24 : undefined),
}

const SEGMENT_TYPES: readonly TimeSegmentType[] = ['hour', 'minute', 'second', 'dayPeriod']

/** 作者写在段上的身份声明。写坏了或没写就按文档序补，手写 HTML 时按顺序排下来本身就是声明。 */
function declaredSegment(el: HTMLElement, position: number): TimeSegmentType {
  const raw = el.getAttribute('segment')?.trim()
  if (raw && (SEGMENT_TYPES as readonly string[]).includes(raw))
    return raw as TimeSegmentType
  return SEGMENT_TYPES[Math.min(position, SEGMENT_TYPES.length - 1)]!
}

/**
 * `<xh-time-field>` —— Light-DOM 行为宿主：作者写 root/label/control/segment（多个）/hidden-input
 * 角色节点，元素跑 time-field 机器并把 connect 产出打上去。
 *
 * 每一段是一个 role=spinbutton 的展示节点：上下键加减、左右键换段、数字直输并自动跳段、
 * Backspace 清段；12 小时制下多出一个上午/下午段，可用上下键翻面或直接按 a/p。
 * 整组只占一个 Tab 位（roving tabindex）。完整的 ISO 串另由 hidden-input 随表单提交。
 *
 * 段上的文字由元素填（作者写不出"此刻该显示几点"）；作者自己写了内容的段一概不碰。
 *
 * @customElement xh-time-field
 * @attr {string} value - 受控值，ISO 时间串（'13:45' / '13:45:30'）；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {string} min - 下界（含），只用来标注越界，不改写值
 * @attr {string} max - 上界（含），同上
 * @attr {string} locale - BCP 47 语言标记，决定上午/下午文字与默认小时制
 * @attr {'12'|'24'} hour-cycle - 小时制；不写则按 locale 推断，再没有就用 24
 * @attr {'hour'|'minute'|'second'} granularity - 值精确到哪一段，默认 minute
 * @attr {boolean} disabled - 禁用：整组退出 Tab 序列，隐藏输入不参与提交
 * @attr {boolean} read-only - 只读：仍可聚焦与换段，改不动值
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} required - 必填标注，落到每段的 aria-required 上
 * @attr {string} name - 表单字段名；给了隐藏输入才带 name
 * @attr {string} placeholder - 空段的占位字符（单字符），默认 '-'
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @csspart root - 承载 data-disabled / data-readonly / data-invalid / data-empty / data-out-of-range 的容器
 * @csspart label - 标题；点它会把焦点送到第一段
 * @csspart control - role=group 的段容器，由 label 命名
 * @csspart segment - 一段一个的 spinbutton，可自带 segment 属性声明身份，缺省按文档序
 * @csspart hidden-input - type=hidden 的表单出口，值是完整 ISO 串
 */
export class XhTimeFieldElement extends XhElement {
  static override partContract = { anatomy: timeFieldAnatomy, meta: timeFieldMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    min: { converter: STRING_CONVERTER },
    max: { converter: STRING_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    hourCycle: { converter: HOUR_CYCLE_CONVERTER, attribute: 'hour-cycle' },
    granularity: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
  }

  declare value?: string
  declare defaultValue?: string
  declare min?: string
  declare max?: string
  declare locale?: string
  declare hourCycle?: TimeHourCycle
  declare granularity?: TimeGranularity
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare placeholder?: string

  private readonly notifyChange = (details: TimeFieldValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // time-field 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<TimeFieldSchema>(this, timeFieldMachine, () => this.machineProps())

  private machineProps(): Partial<TimeFieldSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      min: this.min,
      max: this.max,
      locale: this.locale,
      hourCycle: this.hourCycle,
      granularity: this.granularity,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      required: this.required ?? false,
      name: this.name,
      placeholder: this.placeholder,
      onValueChange: this.notifyChange,
    }
  }

  /** 段上的文字归谁写：作者首次被看到时就写了内容，之后一概不碰。 */
  private readonly ownsSegmentText = new WeakMap<HTMLElement, boolean>()

  /**
   * 填段上的文字。每帧回读分不清"作者写的"还是"上一帧自己写的"，
   * 所以归属只在第一次见到这个节点时定一次，一旦写过就再也让不回去。
   */
  private fillSegmentText(el: HTMLElement, text: string): void {
    let owned = this.ownsSegmentText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsSegmentText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  protected wire(): void {
    const api = connectTimeField(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 段是多实例 part，逐个打。打上去的 data-scope/data-part/data-value 正是换段与
    // 自动跳段在事件那一刻现查 DOM 的依据，所以 wire 必须先于事件跑过——updated() 已保证。
    this.getParts('segment').forEach((el, position) => {
      const segment = declaredSegment(el, position)
      this.spreader.spread(el, api.getSegmentProps({ segment }) as Record<string, unknown>)
      this.fillSegmentText(el, api.getSegmentText({ segment }))
      // 收起不参与显示的段只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条
      // display 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
      this.setPartHidden(el, !api.segments.includes(segment))
    })
  }
}
