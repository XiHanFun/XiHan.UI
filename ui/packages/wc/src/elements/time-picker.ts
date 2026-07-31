import type { Cleanup, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/core'
import type {
  TimeGranularity,
  TimeHourCycle,
  TimePickerColumnUnit,
  TimePickerOpenChangeDetails,
  TimePickerSchema,
  TimePickerValueChangeDetails,
  TimeSegmentType,
} from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectTimePicker, timePickerMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 小时制只认 12 与 24，写别的当作没写
const HOUR_CYCLE_CONVERTER = {
  fromAttribute: (v: string | null): TimeHourCycle | undefined => (v === '12' ? 12 : v === '24' ? 24 : undefined),
}

const SEGMENT_TYPES: readonly TimeSegmentType[] = ['hour', 'minute', 'second', 'dayPeriod']
const COLUMN_UNITS: readonly TimePickerColumnUnit[] = ['hour', 'minute', 'second']

/** 取作者写在段上的 segment，缺席或写坏了按文档序补。 */
function declaredSegment(el: HTMLElement, position: number): TimeSegmentType {
  const raw = el.getAttribute('segment')?.trim()
  if (raw && (SEGMENT_TYPES as readonly string[]).includes(raw))
    return raw as TimeSegmentType
  return SEGMENT_TYPES[Math.min(position, SEGMENT_TYPES.length - 1)]!
}

/** 作者写在列上的单位声明，规则同上。 */
function declaredUnit(el: HTMLElement, position: number): TimePickerColumnUnit {
  const raw = el.getAttribute('unit')?.trim()
  if (raw && (COLUMN_UNITS as readonly string[]).includes(raw))
    return raw as TimePickerColumnUnit
  return COLUMN_UNITS[Math.min(position, COLUMN_UNITS.length - 1)]!
}

/**
 * `<xh-time-picker>` —— Light-DOM 行为宿主：作者写 root/label/control/input（多个）/trigger/
 * clear-trigger/positioner/content/column（多个）/option（多个）/hidden-input 角色节点，
 * 元素跑 time-picker 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点取 control（浮层因此与整个输入行对齐），被定位的浮层取 positioner。
 *
 * 两条改值的路写同一份值：输入行里逐段敲（每段是 role=spinbutton，上下键加减、数字直输自动跳段），
 * 浮层里按列挑（每列是一个 listbox，上下键在列内走、左右键换列、Enter 选中）。
 *
 * 段与格子上的文字由元素填；作者自己写了内容的不碰。
 *
 * @customElement xh-time-picker
 * @attr {string} value - 受控值，ISO 时间串（'13:45' / '13:45:30'）；缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} min - 下界（含）：裁掉浮层里落在界外的可选值，并把已填的越界值标注出来
 * @attr {string} max - 上界（含），同上
 * @attr {string} locale - BCP 47 语言标记，决定上午/下午文字与默认小时制
 * @attr {'12'|'24'} hour-cycle - 小时制；不写则按 locale 推断，再没有就用 24
 * @attr {'hour'|'minute'|'second'} granularity - 值精确到哪一段，默认 minute
 * @attr {number} step - 分列的步进（分钟），默认 1
 * @attr {boolean} disabled - 禁用：段整组退出 Tab 序列，触发器用原生 disabled，隐藏输入不参与提交
 * @attr {boolean} read-only - 只读：浮层照常展开与浏览，但值改不动也清不掉
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} required - 必填标注
 * @attr {string} name - 表单字段名；给了隐藏输入才带 name
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state/data-disabled/data-readonly/data-invalid/data-empty）
 * @csspart label - 标题；点它会把焦点送到第一段
 * @csspart control - role=group 的输入行，同时是浮层的定位锚点
 * @csspart input - 一段一个的 spinbutton，可自带 segment 属性声明身份，缺省按文档序
 * @csspart trigger - 展开/收起按钮，须是原生 button
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位且对读屏隐藏
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - 浮层容器（消解层与焦点域的根节点），收起时带 hidden
 * @csspart column - role=listbox 的一列，可自带 unit 属性声明单位，缺省按文档序
 * @csspart option - role=option 的一格，须自带 value 属性（两位补零的显示串）
 * @csspart hidden-input - type=hidden 的表单出口，值是完整 ISO 串
 */
export class XhTimePickerElement extends XhElement {
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    min: { converter: STRING_CONVERTER },
    max: { converter: STRING_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    hourCycle: { converter: HOUR_CYCLE_CONVERTER, attribute: 'hour-cycle' },
    granularity: { converter: STRING_CONVERTER },
    step: { converter: NUMBER_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
  }

  declare value?: string
  declare defaultValue?: string
  declare open?: boolean
  declare defaultOpen?: boolean
  declare min?: string
  declare max?: string
  declare locale?: string
  declare hourCycle?: TimeHourCycle
  declare granularity?: TimeGranularity
  declare step?: number
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare placement?: Placement
  declare offset?: number

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly pickerScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  private readonly notifyValue = (details: TimePickerValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: TimePickerOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TimePickerSchema>(
    this,
    timePickerMachine,
    () => this.machineProps(),
    { scope: this.pickerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<TimePickerSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      min: this.min,
      max: this.max,
      locale: this.locale,
      hourCycle: this.hourCycle,
      granularity: this.granularity,
      step: this.step,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      required: this.required ?? false,
      name: this.name,
      placement: this.placement,
      offset: this.offset,
      onValueChange: this.notifyValue,
      onOpenChange: this.notifyOpen,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.pickerScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 整个输入行记为本层分支：点触发器算层内交互，开合交给它自己切换。
      branches: () => [this.getPart('control')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<TimePickerSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('control'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /** 提前发现一次角色节点：default-open 时焦点域在 hostConnected 当场要去 content 里找那一格。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /** 段与格子上的文字是否归元素填，首次见到该节点时定。 */
  private readonly ownsText = new WeakMap<HTMLElement, boolean>()

  /** 填节点上的文字，归属只在第一次见到这个节点时定一次。 */
  private fillText(el: HTMLElement, text: string): void {
    let owned = this.ownsText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  protected wire(): void {
    const api = connectTimePicker(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 段逐个打；wire 跑在事件之前，换段与自动跳段时 data-scope/data-part/data-value 已在 DOM 上
    this.getParts('input').forEach((el, position) => {
      const segment = declaredSegment(el, position)
      this.spreader.spread(el, api.getInputProps({ segment }) as Record<string, unknown>)
      this.fillText(el, api.getSegmentText({ segment }))
      // 用内联 display 收起不参与显示的段（作者层的 display 声明会盖过 [hidden]）
      this.setPartHidden(el, !api.segments.includes(segment))
    })

    // 列同理，格子归属按子树切分
    this.getParts('column').forEach((columnEl, position) => {
      const unit = declaredUnit(columnEl, position)
      this.spreader.spread(columnEl, api.getColumnProps({ unit }) as Record<string, unknown>)
      this.setPartHidden(columnEl, !api.columns.some(column => column.unit === unit))
      for (const optionEl of this.getParts('option').filter(el => columnEl.contains(el))) {
        const value = optionEl.getAttribute('value') ?? ''
        this.spreader.spread(optionEl, api.getOptionProps({ unit, value }) as Record<string, unknown>)
        this.fillText(optionEl, value)
      }
    })

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    this.setPartHidden(this.getPart('content'), !api.open)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层随机器停机一并撤掉，此处不再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
