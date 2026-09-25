/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time range picker 相关实现。

import type { Cleanup, ControlVariant, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type {
  FormControlState,
  TimeGranularity,
  TimeHourCycle,
  TimePickerColumn,
  TimePickerColumnUnit,
  TimeRangePickerColumnGroup,
  TimeRangePickerEndIndex,
  TimeRangePickerOpenChangeDetails,
  TimeRangePickerPreset,
  TimeRangePickerSchema,
  TimeRangePickerValueChangeDetails,
  TimeSegmentType,
} from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectTimeRangePicker, resolveFormControlState, resolveTimeRangePickerEndIndex, timeRangePickerAnatomy, timeRangePickerMachine, timeRangePickerMeta } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

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
const COLUMN_UNITS: readonly TimePickerColumnUnit[] = ['hour', 'minute', 'second', 'dayPeriod']

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

/** 作者写在段位容器 / 时列外壳 / 隐藏输入上的端号，缺席时按文档序：第一个是起点、第二个是终点。 */
function declaredEnd(el: HTMLElement, position: number): TimeRangePickerEndIndex {
  const raw = el.getAttribute('index')
  return resolveTimeRangePickerEndIndex(raw == null || raw.trim() === '' ? position : raw.trim())
}

/**
 * `<xh-time-range-picker>`：Light-DOM 行为宿主：作者写 root / label / control / segment-group（两个）/ segment（多个）/
 * range-separator / trigger / clear-trigger / positioner / content / column-group（两个）/ column（多个）/ item（多个）/
 * hidden-input（两个）角色节点，元素运行 time-range-picker 状态机并把 connect 产出接上。
 * 浮层定位引擎在本元素中创建、经 refs 注入状态机，锚点取 control（浮层因此与整个输入行对齐），被定位的浮层取 positioner。
 *
 * 起止两端各一组：segment-group、column-group 与 hidden-input 都写两个，文档序在前的是起点、在后的是终点，
 * 也可以自带 index 属性显式声明；段位、列与格子按所在的组归属到对应的端。
 *
 * 两条改值路径写入同一份值：输入行中逐段输入（每段是 role=spinbutton，上下键加减、数字直接输入自动跳段，方向键不跨组），
 * 浮层中按列选择（每列是一个 listbox，上下键在列内移动、左右键换列（跨组也换）、Enter 选中）。
 *
 * 段与格子上的文字由元素填入；作者自行写了内容的不修改。
 *
 * @customElement xh-time-range-picker
 * @prop {string[]} value - 受控的区间两端 [start, end]（数组只能通过 property 设置），每端是 ISO 时间串；空缺的一端用空串占位；未提供即非受控
 * @prop {string[]} default-value - 非受控初始区间
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} min - 下界（含）：裁掉浮层中落在界外的可选值，并把已填的越界值标注出来；终点组还以起点为下界
 * @attr {string} max - 上界（含），同上；起点组还以终点为上界
 * @attr {string} locale - BCP 47 语言标记，决定上午 / 下午文字与默认小时制
 * @attr {'12'|'24'} hour-cycle - 小时制；未提供时按 locale 推断，仍没有时使用 24
 * @attr {'hour'|'minute'|'second'} granularity - 值精确到哪一段，默认 minute
 * @attr {number} step - 分列的步进（分钟），默认 1
 * @prop {TimeRangePickerPreset[]} presets - 快捷选项（数组只能通过 property 设置）：提供后浮层中多出一列
 * @attr {boolean} disabled - 禁用：段整组退出 Tab 序列，触发器使用原生 disabled，隐藏输入不参与提交
 * @attr {boolean} read-only - 只读：浮层照常展开与浏览，但值不可修改也不可清空
 * @attr {boolean} invalid - 校验失败标注；未提供时也会自行判定：任一端越界，或终点早于起点
 * @attr {boolean} required - 必填标注，写入每段的 aria-required
 * @attr {string} name - 起点隐藏输入的表单字段名；提供后才带 name
 * @attr {string} end-name - 终点隐藏输入的表单字段名；未提供时终点不参与提交
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：outline / subtle / ghost，默认 outline
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位置写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {'ltr'|'rtl'} dir - 文字方向，翻转浮层在行内轴上 start 与 end 的落点；只在显式提供时才写到定位层上
 * @fires value-change - 两端变化；detail 为 `{ value: string[] }`，只填终点时为 `['', end]`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state / data-disabled / data-readonly / data-invalid / data-empty）
 * @csspart label - 标题；点击它把焦点送到第一段
 * @csspart control - role=group 的输入行，同时是浮层的定位锚点
 * @csspart segment-group - 一端的段位容器（role=group），起止各一个，可自带 index 属性（0 / 1），默认按文档序
 * @csspart segment - 一段一个的 spinbutton，可自带 segment 属性声明身份，默认按所在组内的文档序
 * @csspart range-separator - 起止两组段位之间的视觉分隔，退出可访问树
 * @csspart trigger - 展开 / 收起按钮，须是原生 button
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位，可及名使用 translations.clearTrigger；无值时收起
 * @csspart positioner - 浮层定位容器，坐标由引擎写为内联样式
 * @csspart content - 浮层容器（消解层与焦点域的根节点），收起时带 hidden
 * @csspart preset-group - 快捷选项列（role=listbox）；未提供 presets 时带 hidden
 * @csspart preset - 一条快捷选项（role=option），须自带 value 属性（与 presets 数据中的 value 逐字一致）
 * @csspart column-group - 一端的时列外壳（role=group），起止各一个，可自带 index 属性（0 / 1），默认按文档序
 * @csspart column-group-label - 时列外壳顶部的小标题（「开始」「结束」），纯视觉
 * @csspart column - role=listbox 的一列，可自带 unit 属性声明单位，默认按所在组内的文档序
 * @csspart item - role=option 的一格，须自带 value 属性（两位补零的显示串；上下午列写 '00' / '01'）
 * @csspart hidden-input - type=hidden 的表单出口，起止各一份，可自带 index 属性，默认按文档序；值是完整 ISO 串
 */
export class XhTimeRangePickerElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  static override partContract = { anatomy: timeRangePickerAnatomy, meta: timeRangePickerMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 区间两端是数组，只能走 property
    value: { attribute: false },
    defaultValue: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    min: { converter: STRING_CONVERTER },
    max: { converter: STRING_CONVERTER },
    locale: { converter: STRING_CONVERTER },
    hourCycle: { converter: HOUR_CYCLE_CONVERTER, attribute: 'hour-cycle' },
    granularity: { converter: STRING_CONVERTER },
    step: { converter: NUMBER_CONVERTER },
    // 快捷选项是数组，只能走 property
    presets: { attribute: false },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
    isTimeUnavailable: { attribute: false },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    endName: { converter: STRING_CONVERTER, attribute: 'end-name' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
    // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
  }

  declare value?: string[]
  declare defaultValue?: string[]
  declare open?: boolean
  declare defaultOpen?: boolean
  declare min?: string
  declare max?: string
  declare locale?: string
  declare hourCycle?: TimeHourCycle
  declare granularity?: TimeGranularity
  declare step?: number
  declare presets?: TimeRangePickerPreset[]
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare translations?: TimeRangePickerSchema['props']['translations']
  declare isTimeUnavailable?: TimeRangePickerSchema['props']['isTimeUnavailable']
  declare required?: boolean
  declare name?: string
  declare endName?: string
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare placement?: Placement
  declare offset?: number
  declare direction?: Direction

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly pickerScope = createScope(() => this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null
  private readonly portal = this.createAnchoredPortalController({
    name: 'TimeRangePicker',
    config: () => this.config,
    source: () => this.getPart('control'),
    root: () => this.getPart('positioner'),
    onChange: () => this.requestUpdate(),
  })

  private readonly notifyValue = (details: TimeRangePickerValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: TimeRangePickerOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TimeRangePickerSchema>(
    this,
    timeRangePickerMachine,
    () => this.machineProps(),
    { scope: this.pickerScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private inheritedControl: FormControlState | undefined

  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<TimeRangePickerSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      required: this.required,
    }, this.inheritedControl)
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
      presets: this.presets,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      translations: this.translations,
      isTimeUnavailable: this.isTimeUnavailable,
      required: control.required,
      name: this.name,
      endName: this.endName,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      placement: this.placement,
      offset: this.offset,
      dir: this.direction,
      onValueChange: this.notifyValue,
      onOpenChange: this.notifyOpen,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.pickerScope, idGenerator: this.idGen })
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  /** 浮层面板的自绘横条：两组时列并排放不下时面板整体横滚，条子与 content 同级挂在已经 fixed 的 positioner 上，走浮层 4px 档 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
    axes: ['horizontal'],
    props: () => ({ dir: this.direction, size: 'sm' }),
  })

  /**
   * 快捷选项列与各时间列各自的竖条：都住在 content 里，条子贴在各自的盒子上、紧跟在那一层后面；
   * 时间列按在场的列逐列建一套，列离场即拆
   */
  private readonly presetBars = new ScrollbarsController(this, {
    shell: () => this.getPart('content'),
    scrollable: () => this.getPart('preset-group'),
    anchor: 'layer',
    props: () => ({ dir: this.direction, size: 'sm' }),
  })

  private readonly columnBars = new ScrollbarsController(this, {
    shell: () => this.getPart('content'),
    scrollables: () => this.getParts('column'),
    anchor: 'layer',
    props: () => ({ dir: this.direction, size: 'sm' }),
  })

  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 整个输入行记为本层分支：点触发器算层内交互，开合交给它自己切换。
      // 浮层壳一并记上：content 之外还浮着自绘横条，按住它拖动不该把浮层消解掉
      branches: () => [this.getPart('control'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<TimeRangePickerSchema>): void {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: (this.open ?? this.defaultOpen) ?? false,
      onExitComplete: () => this.requestUpdate(),
    })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.exit.presence)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('control'))
    svc.refs.set('getTriggerEl', () => this.getPart('trigger'))
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

  /**
   * 起止两组各自当前应排列的列及每列的可选值：落在 min/max 之外的、不符合 step 的、
   * 被另一端限制的、以及随已选的时（分）收窄后排除的值都已剔除。作者据此渲染两组列与格子。
   * 状态机尚未建立时两组都是空数组。
   */
  get columnGroups(): readonly TimeRangePickerColumnGroup[] {
    return this.ctrl.service
      ? connectTimeRangePicker(this.ctrl.service, wcNormalize).columnGroups
      : [{ index: 0, columns: [] as TimePickerColumn[] }, { index: 1, columns: [] as TimePickerColumn[] }]
  }

  /** 取指定角色节点在 owner 子树内的实例：段、列与格子按所在的那一组切分。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectTimeRangePicker(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('range-separator', api.getRangeSeparatorProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('preset-group', api.getPresetGroupProps() as Record<string, unknown>)
    // 表单出口起止各一份：写了 index 按 index，没写按文档序
    this.getParts('hidden-input').forEach((el, position) => {
      this.spreader.spread(el, api.getHiddenInputProps({ index: declaredEnd(el, position) }) as Record<string, unknown>)
    })

    // 快捷选项是多实例 part：条目自报 value
    for (const el of this.getParts('preset'))
      this.spreader.spread(el, api.getPresetProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    // 段位容器起止各一组；组内的段逐个打，下标在组内从 0 数起。
    // wire 跑在事件之前，换段与自动跳段时 data-scope/data-part/data-value 已在 DOM 上
    this.getParts('segment-group').forEach((groupEl, groupPosition) => {
      const index = declaredEnd(groupEl, groupPosition)
      this.spreader.spread(groupEl, api.getSegmentGroupProps({ index }) as Record<string, unknown>)
      let position = 0
      for (const segmentEl of this.partsIn(groupEl, 'segment')) {
        const segment = declaredSegment(segmentEl, position++)
        this.spreader.spread(segmentEl, api.getSegmentProps({ index, segment }) as Record<string, unknown>)
        this.fillText(segmentEl, api.getSegmentText({ index, segment }))
        // 用内联 display 收起不参与显示的段（作者层的 display 声明会盖过 [hidden]）
        this.setPartHidden(segmentEl, !api.segments.includes(segment))
      }
    })

    // 时列外壳起止各一组；列与格子的归属按子树切分
    this.getParts('column-group').forEach((groupEl, groupPosition) => {
      const index = declaredEnd(groupEl, groupPosition)
      this.spreader.spread(groupEl, api.getColumnGroupProps({ index }) as Record<string, unknown>)
      for (const labelEl of this.partsIn(groupEl, 'column-group-label'))
        this.spreader.spread(labelEl, api.getColumnGroupLabelProps({ index }) as Record<string, unknown>)
      const columns = api.columnGroups[index].columns
      let position = 0
      for (const columnEl of this.partsIn(groupEl, 'column')) {
        const unit = declaredUnit(columnEl, position++)
        this.spreader.spread(columnEl, api.getColumnProps({ index, unit }) as Record<string, unknown>)
        this.setPartHidden(columnEl, !columns.some(column => column.unit === unit))
        for (const itemEl of this.partsIn(columnEl, 'item')) {
          const value = itemEl.getAttribute('value') ?? ''
          this.spreader.spread(itemEl, api.getItemProps({ index, unit, value }) as Record<string, unknown>)
          this.fillText(itemEl, api.getItemText({ unit, value }))
        }
      }
    })

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(this.getPart('content'))
    this.exit.update(api.open)
    this.setPartHidden(this.getPart('content'), !this.exit.visible)

    this.bars.wire()
    this.presetBars.wire()
    this.columnBars.wire()
    this.portal.sync(this.exit.visible)
  }

  override disconnectedCallback(): void {
    this.portal.dispose()
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    // 层随机器停机一并撤掉，此处不再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
