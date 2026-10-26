/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 heatmap 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type {
  HeatmapActiveKeyChangeDetails,
  HeatmapAxisInput,
  HeatmapDatumDetails,
  HeatmapGrid,
  HeatmapLegendEntry,
  HeatmapMatrixGrid,
  HeatmapMonthGrid,
  HeatmapPalette,
  HeatmapPolarity,
  HeatmapRowProps,
  HeatmapScaleMode,
  HeatmapSchema,
  HeatmapTranslations,
  HeatmapValue,
  HeatmapVariant,
  NumberFormatSpec,
} from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import { DATA_PART, DATA_SCOPE } from '@xihan-ui/core'
import {
  buildHeatmapGrid,
  connectHeatmap,
  HEATMAP_LEGEND_TEXT,
  HEATMAP_STRUCTURE_TAKEOVER,
  heatmapAnatomy,
  heatmapLegendEntries,
  heatmapMachine,
  heatmapMeta,
  heatmapStructure,
  normalizeHeatmapNumber,
  normalizeHeatmapString,
} from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { createGeneratedElement, generatedChildren, hasAuthorContent } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样就再也表达不了「没写」。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 数字属性：属性缺席或空串即 undefined，交回 connect 定缺省。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/** 往上找最近的某个角色节点，取它写着的 value：块把月份传给行，行把行身份传给格子。 */
/** 作者写在 legend-item 上的 polarity 属性；只认两侧，其余一律当顺序色阶或中点那一格。 */
function legendPolarity(el: HTMLElement): HeatmapPolarity | null {
  const polarity = el.getAttribute('polarity')
  return polarity === 'negative' || polarity === 'positive' ? polarity : null
}

function ancestorValue(el: HTMLElement, part: string): string | undefined {
  const host = el.parentElement?.closest<HTMLElement>(`[${DATA_SCOPE}="heatmap"][${DATA_PART}="${part}"]`)
  return normalizeHeatmapString(host?.getAttribute('value'))
}

/**
 * `<xh-heatmap>`：Light-DOM 行为宿主，元素运行 heatmap 状态机并把 connect 产出接上。
 *
 * 作者只写 root（可另写 tooltip、empty、legend）时，元素按网格模型在 root 里生成整套结构：日历形态的月份行、
 * grid、行、星期名、月份名、行列表头、格子、空态与图例，与 Vue / React 的缺省树逐节点一致，生成的节点带
 * `data-xh-gen`、按身份复用。root 里有作者写的 grid 时元素不生成任何结构，各部件由作者写进标记；
 * 这时可读取 `grid` / `monthGrid` / `matrixGrid` 三个只读属性按推导出的行、列、月份段循环铺设
 * （三种形态各读其中一个），每次读取都重新计算，取一次后保存使用。
 *
 * 角色节点的身份一律取作者写在节点上的 value 属性，解释方式由 variant 决定：
 * 日历形态中 row 与 week-day 上是行序 0-6（未写即网格之外的月份行与其行首占位）、
 * cell 上是 ISO 日期、month-label 上是 YYYY-MM；月历形态中 month-block 上是 YYYY-MM、
 * row 上是月内周序（未写即块内的星期名坐标轴）；矩阵形态中 row 与 row-label 上是行身份
 * （未写即表头行与角落占位）、column-label 与 cell 上是列身份，格子的行身份从所在的行取。
 * legend-item 上是档位（发散色阶下另写 polarity 属性标明在中点哪一侧，逐格读取 `legendItems`）、
 * legend-label 上是 low 或 high（两端的文字，文案读取 `legendText`）。
 *
 * 数据、行列、档位下界、数值格式与文案只能通过 property 设置（`el.value = [...]`）：HTML 属性无法承载数组与函数。
 *
 * @customElement xh-heatmap
 * @attr {'calendar'|'month'|'matrix'} variant - 形态；默认 calendar
 * @attr {string} start-date - 区间起点（含），ISO YYYY-MM-DD
 * @attr {string} end-date - 区间终点（含）
 * @attr {number} levels - 档数，默认 5；提供 thresholds 时档数由它决定
 * @attr {'sequential'|'diverging'} scale - 色阶；缺省时数据里出现负数就按发散色阶（以中点分两侧）
 * @attr {number} midpoint - 发散色阶的中点，默认 0
 * @attr {boolean} continuous - 连续色阶：着色按数值的确切比例，不按档位取整
 * @attr {number} first-day-of-week - 周首日，0 = 星期日，默认 1
 * @attr {string} locale - 月份名与星期名的书写 locale；未提供时按宿主语言，宿主也没有时按 en-US
 * @attr {'ltr'|'rtl'} dir - 文字方向；只作显式覆盖，未提供时方向从 DOM 读取
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'red'|'orange'|'amber'|'yellow'|'lime'|'green'|'teal'|'cyan'|'blue'|'indigo'|'purple'|'pink'|'gray'} palette - 色板，取基础色板同名色相作色阶满档的颜色；同时提供 tone 时以色板为准
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} animated - 播放过渡，默认开；`animated="false"` 时直接画终态
 * @attr {boolean} pending - 数据重取中：保留上一帧、网格整体降低不透明度
 * @attr {string} active-key - 激活的键（受控）：日期形态是 ISO 日期，矩阵形态是 heatmapMatrixKey(row, column)
 * @fires datum-active - 详情应显示哪一格（悬停或聚焦）；detail 为 `{ key, date, row, column, count, level, polarity, percent, formatted }`，收起时为 null
 * @fires datum-press - 点按一格，或焦点在格上按 Enter；detail 与 datum-active 同形
 * @fires active-key-change - 指针或键盘换了激活的格子；detail 为 `{ activeKey }`，收起时为 null
 * @csspart root - 承载三轴的最外层节点
 * @csspart grid - role=grid 的网格容器，键盘在它身上收口
 * @csspart month-block - 月历形态中的一个自然月块
 * @csspart row - 一行；提供 value 即数据行，未提供即坐标轴行
 * @csspart week-day - 星期名，只用于视觉
 * @csspart month-label - 月份名
 * @csspart row-label - 矩阵的行名；未提供 value 即表头行行首的角落占位
 * @csspart column-label - 矩阵的列名
 * @csspart cell - 一格，身份取自节点上的 value
 * @csspart tooltip - 悬停或聚焦时显示的详情条，位置由元素测量后写为内联样式
 * @csspart legend - 色阶对照条
 * @csspart legend-label - 对照条一端的文字，value 是 low 或 high
 * @csspart legend-item - 对照条中的一格，value 是档位，发散色阶下 polarity 是 negative 或 positive
 * @csspart empty - 网格里一条数据都没有时叠在网格上的空态，留空时由元素写入空态文案，取数中改写加载文案
 */
export class XhHeatmapElement extends XhElement {
  static override partContract = { anatomy: heatmapAnatomy, meta: heatmapMeta }

  /** 作者没写结构时按网格模型生成；作者在 root 里写了 tooltip、empty 或 legend 的用作者的，其余照常生成。 */
  static override structure: ElementStructure<XhHeatmapElement> = {
    takeover: HEATMAP_STRUCTURE_TAKEOVER,
    build: (host, taken) => host.ctrl.service
      ? heatmapStructure(connectHeatmap(host.ctrl.service, wcNormalize), { empty: !taken.has('empty'), legend: !taken.has('legend') })
      : undefined,
  }

  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { attribute: false },
    rows: { attribute: false },
    columns: { attribute: false },
    thresholds: { attribute: false },
    format: { attribute: false },
    translations: { attribute: false },
    variant: { converter: STRING_CONVERTER },
    startDate: { converter: STRING_CONVERTER, attribute: 'start-date' },
    endDate: { converter: STRING_CONVERTER, attribute: 'end-date' },
    levels: { converter: NUMBER_CONVERTER },
    scale: { converter: STRING_CONVERTER },
    midpoint: { converter: NUMBER_CONVERTER },
    continuous: { converter: BOOLEAN_CONVERTER },
    firstDayOfWeek: { converter: NUMBER_CONVERTER, attribute: 'first-day-of-week' },
    locale: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    palette: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    animated: { converter: BOOLEAN_CONVERTER },
    pending: { converter: BOOLEAN_CONVERTER },
    activeKey: { converter: STRING_CONVERTER, attribute: 'active-key' },
  }

  declare value?: HeatmapValue[]
  declare rows?: HeatmapAxisInput[]
  declare columns?: HeatmapAxisInput[]
  declare thresholds?: number[]
  declare format?: NumberFormatSpec | ((value: number) => string)
  declare translations?: Partial<HeatmapTranslations>
  declare variant?: HeatmapVariant
  declare startDate?: string
  declare endDate?: string
  declare levels?: number
  declare scale?: HeatmapScaleMode
  declare midpoint?: number
  declare continuous?: boolean
  declare firstDayOfWeek?: number
  declare locale?: string
  declare direction?: Direction
  declare tone?: Tone
  declare palette?: HeatmapPalette
  declare size?: Size
  declare animated?: boolean
  declare pending?: boolean
  declare activeKey?: string | null

  private readonly notifyActive = (details: HeatmapDatumDetails | null): void => {
    this.dispatchEvent(new CustomEvent('datum-active', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyPress = (details: HeatmapDatumDetails): void => {
    this.dispatchEvent(new CustomEvent('datum-press', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyKey = (details: HeatmapActiveKeyChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('active-key-change', { detail: details, bubbles: true, composed: true }))
  }

  // 过渡的时长与减弱动效从 root 读：取值口惰性读，角色节点要等首次 updated 才发现得到
  private readonly ctrl = new MachineController<HeatmapSchema>(
    this,
    heatmapMachine,
    () => this.machineProps(),
    { onBuilt: svc => svc.refs.set('getRootEl', () => this.getPart('root')) },
  )

  private machineProps(): Partial<HeatmapSchema['props']> {
    return {
      variant: this.variant,
      value: this.value,
      rows: this.rows,
      columns: this.columns,
      startDate: this.startDate,
      endDate: this.endDate,
      levels: this.levels,
      thresholds: this.thresholds,
      scale: this.scale,
      midpoint: this.midpoint,
      continuous: this.continuous,
      firstDayOfWeek: this.firstDayOfWeek,
      locale: this.locale,
      dir: this.direction,
      tone: this.tone,
      palette: this.palette,
      size: this.size,
      animated: this.animated,
      format: this.format,
      pending: this.pending,
      activeKey: this.activeKey,
      translations: this.translations,
      onDatumActive: this.notifyActive,
      onDatumPress: this.notifyPress,
      onActiveKeyChange: this.notifyKey,
    }
  }

  /**
   * 日历网格：七行星期 × 若干周列，另带月份段、星期名与档位标尺，作者据此铺设节点。
   * 其余形态下是一张空网格。状态机尚未建立时同样返回空网格。
   */
  get grid(): HeatmapGrid {
    return this.ctrl.service ? connectHeatmap(this.ctrl.service, wcNormalize).grid : buildHeatmapGrid()
  }

  /** 月历网格：按自然月分块，块内逐周一行；非 month 形态时为 null。 */
  get monthGrid(): HeatmapMonthGrid | null {
    return this.ctrl.service ? connectHeatmap(this.ctrl.service, wcNormalize).monthGrid : null
  }

  /** 矩阵网格：行列由作者提供；非 matrix 形态时为 null。 */
  get matrixGrid(): HeatmapMatrixGrid | null {
    return this.ctrl.service ? connectHeatmap(this.ctrl.service, wcNormalize).matrixGrid : null
  }

  /** 对照条两端的文字，据此填入 legend-label 节点。 */
  get legendText(): { low: string, high: string } {
    return this.ctrl.service
      ? connectHeatmap(this.ctrl.service, wcNormalize).legendText
      : HEATMAP_LEGEND_TEXT
  }

  /** 当前生效的色阶：显式写了 scale 就是它，否则数据里出现负数即 diverging。 */
  get scaleMode(): HeatmapScaleMode {
    return this.ctrl.service ? connectHeatmap(this.ctrl.service, wcNormalize).scaleMode : 'sequential'
  }

  /**
   * 对照条逐格的档位与侧别，按顺序铺设 legend-item：顺序色阶从第 0 档到满档，
   * 发散色阶从负向满档经中点到正向满档。状态机尚未建立时按缺省档数给一排。
   */
  get legendItems(): readonly HeatmapLegendEntry[] {
    return this.ctrl.service
      ? connectHeatmap(this.ctrl.service, wcNormalize).legendItems
      : heatmapLegendEntries(buildHeatmapGrid().scale)
  }

  /** 网格里一条数据都没有。状态机尚未建立时为 true。 */
  get empty(): boolean {
    return this.ctrl.service ? connectHeatmap(this.ctrl.service, wcNormalize).empty : true
  }

  /** 此刻激活的键。activeKey 是作者递进来的受控值，非受控时读这里。 */
  get currentActiveKey(): string | null {
    return this.ctrl.service ? connectHeatmap(this.ctrl.service, wcNormalize).activeKey : null
  }

  /** 作者写在行上的身份，按形态转换为连接层识别的坐标。 */
  private rowProps(el: HTMLElement, variant: HeatmapVariant): HeatmapRowProps {
    if (variant === 'matrix')
      return { row: normalizeHeatmapString(el.getAttribute('value')) }
    if (variant === 'month')
      return { month: ancestorValue(el, 'month-block'), week: normalizeHeatmapNumber(el.getAttribute('value')) }
    return { weekDay: normalizeHeatmapNumber(el.getAttribute('value')) }
  }

  protected wire(): void {
    const api = connectHeatmap(this.ctrl.service, wcNormalize)
    const variant = api.variant

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps())
    put('grid', api.getGridProps())
    put('tooltip', api.getTooltipProps())
    put('legend', api.getLegendProps())
    put('empty', api.getEmptyProps())

    // 空态留空时写入文案：取数中是加载文案，否则是空态文案
    const empty = this.getPart('empty')
    if (empty && !hasAuthorContent(empty)) {
      const [own] = generatedChildren(empty)
      const span = own ?? empty.appendChild(createGeneratedElement(empty.ownerDocument, 'span'))
      if (span.textContent !== api.emptyText)
        span.textContent = api.emptyText
    }

    for (const el of this.getParts('month-block'))
      this.spreader.spread(el, api.getMonthBlockProps({ value: el.getAttribute('value') ?? '' }))

    for (const el of this.getParts('row'))
      this.spreader.spread(el, api.getRowProps(this.rowProps(el, variant)))

    for (const el of this.getParts('week-day'))
      this.spreader.spread(el, api.getWeekDayProps({ weekDay: normalizeHeatmapNumber(el.getAttribute('value')) }))

    for (const el of this.getParts('month-label'))
      this.spreader.spread(el, api.getMonthLabelProps({ value: el.getAttribute('value') ?? '' }))

    for (const el of this.getParts('row-label'))
      this.spreader.spread(el, api.getRowLabelProps({ value: normalizeHeatmapString(el.getAttribute('value')) }))

    for (const el of this.getParts('column-label'))
      this.spreader.spread(el, api.getColumnLabelProps({ value: el.getAttribute('value') ?? '' }))

    // 格子逐个打：日期形态身份就是 value，矩阵形态还要往上取一次行身份。
    // 打上去的 data-scope/data-part/data-value 正是键盘导航在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证
    for (const el of this.getParts('cell')) {
      const props = variant === 'matrix'
        ? { row: ancestorValue(el, 'row'), column: el.getAttribute('value') ?? '' }
        : { date: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getCellProps(props))
    }

    // 两端那两个字：value 写 low 或 high，不写即当起点那一端
    for (const el of this.getParts('legend-label'))
      this.spreader.spread(el, api.getLegendLabelProps({ bound: normalizeHeatmapString(el.getAttribute('value')) === 'high' ? 'high' : 'low' }))

    for (const el of this.getParts('legend-item'))
      this.spreader.spread(el, api.getLegendItemProps({ level: normalizeHeatmapNumber(el.getAttribute('value')) ?? 0, polarity: legendPolarity(el) }))
  }
}
