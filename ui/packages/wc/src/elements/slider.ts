import type { Direction, IdGenerator, Orientation } from '@xihan-ui/core'
import type { SliderSchema, SliderValueChangeDetails, SliderValueChangeEndDetails, SliderValueTextDetails } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectSlider, sliderAnatomy, sliderMachine, sliderMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定；Lit 自带转换器会落成 null / false，
// 那样就表达不了"未指定"（value 尤其：落成 null 分不出"非受控"与"受控且当前为空"）。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 默认的 Boolean 转换器是 v !== null，缺省为真的开关会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
/**
 * 值恒是数组，属性写成逗号分隔（单滑块 value="30"，双滑块 value="20,80"）。
 * 解析不出任何有限数就当没写：留下 NaN 会一路写进 aria-valuenow 与定位百分比。
 */
const NUMBER_LIST_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v == null || v.trim() === '')
      return undefined
    const out = v.split(',').map(Number).filter(Number.isFinite)
    return out.length ? out : undefined
  },
}

/**
 * `<xh-slider>` —— Light-DOM 行为宿主：作者写 root/label/control/track/range/thumb
 * 与拇指内的 hidden-input 角色节点，元素跑 slider 机器并把 connect 产出打上去。
 *
 * 键盘全在拇指上（方向键步进、PageUp/PageDown 大步进、Home/End 取端点），
 * 指针拖动挂在 control 上（拇指常浮出轨道，只挂 track 会抓不住拇指本身），
 * 值与坐标的换算取 track 的矩形——矩形在事件发生的那一刻才量，连接期一律不碰 DOM。
 *
 * 多滑块时每个拇指要用 index 属性写明自己是第几个（`index="1"`），
 * 拇指内的 hidden-input 按所在拇指的下标取值，不必另写。
 *
 * @customElement xh-slider
 * @attr {string} value - 受控值，逗号分隔（如 "20,80"）；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值，同样逗号分隔；缺省时是单滑块停在 min
 * @attr {number} min - 下界，默认 0
 * @attr {number} max - 上界，默认 100
 * @attr {number} step - 方向键与吸附网格的步长，默认 1
 * @attr {number} large-step - PageUp/PageDown 的步长，默认 10 倍 step
 * @attr {number} min-steps-between-thumbs - 相邻滑块至少隔几格，默认 0
 * @attr {'horizontal'|'vertical'} orientation - 轨道朝向，默认 horizontal
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写水平轨道上左右两键与指针的语义，默认 ltr
 * @attr {boolean} disabled - 禁用：拇指退出 Tab 序列、推不动、不参与表单提交
 * @attr {boolean} read-only - 只读：仍可聚焦与被读屏念出，推不动
 * @attr {boolean} invalid - 校验失败标注
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {string} name - 表单字段名；给了才参与提交，多滑块逐个同名 append
 * @fires value-change - 值变化（拖动途中会连发）；detail 为 `{ value: number[] }`
 * @fires value-change-end - 一次操作收尾发一次；detail 为 `{ value: number[], index: number }`
 * @csspart root - 承载 data-orientation / data-disabled / data-readonly / data-invalid / data-dragging 的容器
 * @csspart label - 组标题（拇指的 aria-labelledby 目标）
 * @csspart control - 指针命中区，按下即跳到落点并接管拖动
 * @csspart track - 轨道本体，值与坐标的换算以它的矩形为准
 * @csspart range - 已选区间，起止由内联逻辑属性给出
 * @csspart thumb - role=slider 的拇指，键盘交互全在它身上；多滑块须写 index 属性
 * @csspart hidden-input - 拇指内的表单影子（须是原生 input）
 */
export class XhSliderElement extends XhElement {
  static override partContract = { anatomy: sliderAnatomy, meta: sliderMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: NUMBER_LIST_CONVERTER },
    defaultValue: { converter: NUMBER_LIST_CONVERTER, attribute: 'default-value' },
    min: { converter: NUMBER_CONVERTER },
    max: { converter: NUMBER_CONVERTER },
    step: { converter: NUMBER_CONVERTER },
    largeStep: { converter: NUMBER_CONVERTER, attribute: 'large-step' },
    minStepsBetweenThumbs: { converter: NUMBER_CONVERTER, attribute: 'min-steps-between-thumbs' },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    name: { converter: STRING_CONVERTER },
    // 格式化函数只能按 property 给（属性表达不了函数），与 Vue 的同名 prop 是同一件事
    getValueText: { attribute: false },
  }

  declare value?: number[]
  declare defaultValue?: number[]
  declare min?: number
  declare max?: number
  declare step?: number
  declare largeStep?: number
  declare minStepsBetweenThumbs?: number
  declare orientation?: Orientation
  declare direction?: Direction
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare tone?: string
  declare size?: string
  declare name?: string
  declare getValueText?: (details: SliderValueTextDetails) => string

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly sliderScope = createScope(null, this.idGen)

  private readonly notifyValue = (details: SliderValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyValueEnd = (details: SliderValueChangeEndDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change-end', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<SliderSchema>(
    this,
    sliderMachine,
    () => this.machineProps(),
    { scope: this.sliderScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SliderSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      min: this.min,
      max: this.max,
      step: this.step,
      largeStep: this.largeStep,
      minStepsBetweenThumbs: this.minStepsBetweenThumbs,
      orientation: this.orientation,
      dir: this.direction,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      tone: this.tone,
      size: this.size,
      name: this.name,
      getValueText: this.getValueText,
      onValueChange: this.notifyValue,
      onValueChangeEnd: this.notifyValueEnd,
    }
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 轨道懒读：角色节点要等首次 updated 才发现得到，机器建起来的那一刻 partMap 还空着。
  private injectRefs(svc: Service<SliderSchema>): void {
    svc.refs.set('getTrackEl', () => this.getPart('track'))
  }

  /**
   * 拇指自报的下标。多滑块时作者在节点上写 index="1"，与 Vue 侧的 `:index` 是同一份声明；
   * 写不出数字（没写、写错）时退回 0，单滑块因此不必写。
   */
  private thumbIndex(el: HTMLElement): number {
    const raw = Number(el.getAttribute('index'))
    return Number.isFinite(raw) ? raw : 0
  }

  // 拇指内的子部件：getParts 收的是整个元素范围，按拇指子树过滤才归得对下标。
  private partsIn(thumb: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => thumb.contains(el))
  }

  protected wire(): void {
    const api = connectSlider(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('track', api.getTrackProps() as Record<string, unknown>)
    put('range', api.getRangeProps() as Record<string, unknown>)

    for (const el of this.getParts('thumb')) {
      const index = this.thumbIndex(el)
      this.spreader.spread(el, api.getThumbProps(index) as Record<string, unknown>)
      for (const input of this.partsIn(el, 'hidden-input'))
        this.spreader.spread(input, api.getHiddenInputProps(index) as Record<string, unknown>)
    }
  }
}
