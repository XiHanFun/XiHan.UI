import type {
  HeatmapAxisInput,
  HeatmapCellDetails,
  HeatmapCellFocusDetails,
  HeatmapRowProps,
  HeatmapSchema,
  HeatmapTranslations,
  HeatmapValue,
  HeatmapVariant,
} from '@xihan-ui/headless'
import type { Direction, Size, Tone } from '@xihan-ui/kernel'
import { connectHeatmap, heatmapAnatomy, heatmapMachine, heatmapMeta } from '@xihan-ui/headless'
import { DATA_PART, DATA_SCOPE } from '@xihan-ui/kernel'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样就再也表达不了「没写」。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 数字属性：属性缺席或空串即 undefined，交回 connect 定缺省。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/** 角色节点上作者写的 value，解不出数字即当没写。 */
function numberOf(el: HTMLElement): number | undefined {
  const raw = el.getAttribute('value')
  if (raw == null || raw === '')
    return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** 角色节点上作者写的 value，空串即当没写。 */
function stringOf(el: HTMLElement): string | undefined {
  const raw = el.getAttribute('value')
  return raw == null || raw === '' ? undefined : raw
}

/** 往上找最近的某个角色节点，取它写着的 value：块把月份传给行，行把行身份传给格子。 */
function ancestorValue(el: HTMLElement, part: string): string | undefined {
  const host = el.parentElement?.closest<HTMLElement>(`[${DATA_SCOPE}="heatmap"][${DATA_PART}="${part}"]`)
  return host == null ? undefined : stringOf(host)
}

/**
 * `<xh-heatmap>` —— Light-DOM 行为宿主：作者写 root、grid、若干 row 与 cell 角色节点，
 * 元素跑 heatmap 机器并把 connect 产出打上去。
 *
 * 角色节点的身份一律取作者写在节点上的 value 属性，怎么解释由 variant 决定：
 * 日历形态里 row 与 week-day-label 上是行序 0-6（不写即网格之外那条月份行与它的行首占位）、
 * cell 上是 ISO 日期、month-label 上是 YYYY-MM；月历形态里 month-block 上是 YYYY-MM、
 * row 上是月内周序（不写即块内那条星期名坐标轴）；矩阵形态里 row 与 row-label 上是行身份
 * （不写即表头行与角落占位）、column-label 与 cell 上是列身份，格子的行身份从所在的行取。
 * legend-item 上是档位。
 *
 * 数据、行列、档位下界与文案只能走 property（`el.value = [...]`）：HTML 属性装不下数组与函数。
 *
 * @customElement xh-heatmap
 * @attr {'calendar'|'month'|'matrix'} variant - 形态；缺省 calendar
 * @attr {string} start-date - 区间起点（含），ISO YYYY-MM-DD
 * @attr {string} end-date - 区间终点（含）
 * @attr {number} levels - 档数，缺省 5；给了 thresholds 则档数由它定
 * @attr {number} first-day-of-week - 周首日，0 = 星期日，缺省 1
 * @attr {string} locale - 月份名与星期名的书写 locale，缺省 zh-CN
 * @attr {'ltr'|'rtl'} dir - 文字方向；只作显式覆盖，不写时方向从 DOM 现读
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires cell-focus - 焦点落到某一格；detail 为 `{ date, row, column, count, level, percent }`
 * @fires cell-active - 详情该显示哪一格（悬停或聚焦）；收起时 detail 为 null
 * @csspart root - 承载三轴的最外层节点
 * @csspart grid - role=grid 的网格容器，键盘在它身上收口
 * @csspart month-block - 月历形态里的一个自然月块
 * @csspart row - 一行；写了 value 即数据行，不写即坐标轴那一行
 * @csspart week-day-label - 星期名，只给眼睛看
 * @csspart month-label - 月份名
 * @csspart row-label - 矩阵的行名；不写 value 即表头行行首的角落占位
 * @csspart column-label - 矩阵的列名
 * @csspart cell - 一格，身份取写在节点上的 value
 * @csspart tooltip - 悬停或聚焦时显示的详情条，位置由元素量好写成内联样式
 * @csspart legend - 色阶对照条
 * @csspart legend-item - 对照条里的一格，value 是档位
 */
export class XhHeatmapElement extends XhElement {
  static override partContract = { anatomy: heatmapAnatomy, meta: heatmapMeta }

  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { attribute: false },
    rows: { attribute: false },
    columns: { attribute: false },
    thresholds: { attribute: false },
    translations: { attribute: false },
    variant: { converter: STRING_CONVERTER },
    startDate: { converter: STRING_CONVERTER, attribute: 'start-date' },
    endDate: { converter: STRING_CONVERTER, attribute: 'end-date' },
    levels: { converter: NUMBER_CONVERTER },
    firstDayOfWeek: { converter: NUMBER_CONVERTER, attribute: 'first-day-of-week' },
    locale: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare value?: HeatmapValue[]
  declare rows?: HeatmapAxisInput[]
  declare columns?: HeatmapAxisInput[]
  declare thresholds?: number[]
  declare translations?: Partial<HeatmapTranslations>
  declare variant?: HeatmapVariant
  declare startDate?: string
  declare endDate?: string
  declare levels?: number
  declare firstDayOfWeek?: number
  declare locale?: string
  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size

  private readonly notifyFocus = (details: HeatmapCellFocusDetails): void => {
    this.dispatchEvent(new CustomEvent('cell-focus', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyActive = (details: HeatmapCellDetails | null): void => {
    this.dispatchEvent(new CustomEvent('cell-active', { detail: details, bubbles: true, composed: true }))
  }

  // heatmap 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<HeatmapSchema>(this, heatmapMachine, () => this.machineProps())

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
      firstDayOfWeek: this.firstDayOfWeek,
      locale: this.locale,
      dir: this.direction,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onCellFocus: this.notifyFocus,
      onCellActive: this.notifyActive,
    }
  }

  /** 作者写在行上的身份，按形态翻成连接层认得的那一组坐标。 */
  private rowProps(el: HTMLElement, variant: HeatmapVariant): HeatmapRowProps {
    if (variant === 'matrix')
      return { row: stringOf(el) }
    if (variant === 'month')
      return { month: ancestorValue(el, 'month-block'), week: numberOf(el) }
    return { weekDay: numberOf(el) }
  }

  protected wire(): void {
    const api = connectHeatmap(this.ctrl.service, wcNormalize)
    const variant = api.variant

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('grid', api.getGridProps() as Record<string, unknown>)
    put('tooltip', api.getTooltipProps() as Record<string, unknown>)
    put('legend', api.getLegendProps() as Record<string, unknown>)

    for (const el of this.getParts('month-block'))
      this.spreader.spread(el, api.getMonthBlockProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    for (const el of this.getParts('row'))
      this.spreader.spread(el, api.getRowProps(this.rowProps(el, variant)) as Record<string, unknown>)

    for (const el of this.getParts('week-day-label'))
      this.spreader.spread(el, api.getWeekDayLabelProps({ weekDay: numberOf(el) }) as Record<string, unknown>)

    for (const el of this.getParts('month-label'))
      this.spreader.spread(el, api.getMonthLabelProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    for (const el of this.getParts('row-label'))
      this.spreader.spread(el, api.getRowLabelProps({ value: stringOf(el) }) as Record<string, unknown>)

    for (const el of this.getParts('column-label'))
      this.spreader.spread(el, api.getColumnLabelProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    // 格子逐个打：日期形态身份就是 value，矩阵形态还要往上取一次行身份。
    // 打上去的 data-scope/data-part/data-value 正是键盘导航在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证
    for (const el of this.getParts('cell')) {
      const props = variant === 'matrix'
        ? { row: ancestorValue(el, 'row'), column: el.getAttribute('value') ?? '' }
        : { date: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getCellProps(props) as Record<string, unknown>)
    }

    for (const el of this.getParts('legend-item'))
      this.spreader.spread(el, api.getLegendItemProps({ level: numberOf(el) ?? 0 }) as Record<string, unknown>)
  }
}
