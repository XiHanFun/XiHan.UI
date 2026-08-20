import type { HeatmapCellFocusDetails, HeatmapDatum, HeatmapSchema, HeatmapTranslations } from '@xihan-ui/headless'
import type { Direction, Size, Tone } from '@xihan-ui/kernel'
import { connectHeatmap, heatmapAnatomy, heatmapMachine, heatmapMeta } from '@xihan-ui/headless'
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

/**
 * `<xh-heatmap>` —— Light-DOM 行为宿主：作者写 root、grid、若干 row 与 cell 角色节点，
 * 元素跑 heatmap 机器并把 connect 产出打上去。
 *
 * 角色节点的身份一律取作者写在节点上的 value 属性：row 与 week-day-label 上是行序 0-6
 * （不写即网格之外那条月份行与它的行首占位），cell 上是 ISO 日期，month-label 上是 YYYY-MM，
 * legend-item 上是档位。
 *
 * 数据、档位下界与文案只能走 property（`el.value = [...]`）：HTML 属性装不下数组与函数。
 *
 * @customElement xh-heatmap
 * @attr {string} start-date - 区间起点（含），ISO YYYY-MM-DD
 * @attr {string} end-date - 区间终点（含）
 * @attr {number} levels - 档数，缺省 5；给了 thresholds 则档数由它定
 * @attr {number} first-day-of-week - 周首日，0 = 星期日，缺省 1
 * @attr {string} locale - 月份名与星期名的书写 locale，缺省 zh-CN
 * @attr {'ltr'|'rtl'} dir - 文字方向；只作显式覆盖，不写时方向从 DOM 现读
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires cell-focus - 焦点落到某一天；detail 为 `{ date, count, level }`
 * @csspart root - 承载三轴的最外层节点
 * @csspart grid - role=grid 的网格容器，键盘在它身上收口
 * @csspart row - 一行；写了 value 即网格里的星期行，不写即网格之外的月份行
 * @csspart week-day-label - 行首的星期名，只给眼睛看
 * @csspart month-label - 月份名，宽度按它占的列数算
 * @csspart cell - 一天一格，身份取写在节点上的 value（ISO 日期）
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
    thresholds: { attribute: false },
    translations: { attribute: false },
    startDate: { converter: STRING_CONVERTER, attribute: 'start-date' },
    endDate: { converter: STRING_CONVERTER, attribute: 'end-date' },
    levels: { converter: NUMBER_CONVERTER },
    firstDayOfWeek: { converter: NUMBER_CONVERTER, attribute: 'first-day-of-week' },
    locale: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare value?: HeatmapDatum[]
  declare thresholds?: number[]
  declare translations?: Partial<HeatmapTranslations>
  declare startDate?: string
  declare endDate?: string
  declare levels?: number
  declare firstDayOfWeek?: number
  declare locale?: string
  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size

  private readonly notify = (details: HeatmapCellFocusDetails): void => {
    this.dispatchEvent(new CustomEvent('cell-focus', { detail: details, bubbles: true, composed: true }))
  }

  // heatmap 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<HeatmapSchema>(this, heatmapMachine, () => this.machineProps())

  private machineProps(): Partial<HeatmapSchema['props']> {
    return {
      value: this.value,
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
      onCellFocus: this.notify,
    }
  }

  protected wire(): void {
    const api = connectHeatmap(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('grid', api.getGridProps() as Record<string, unknown>)
    put('legend', api.getLegendProps() as Record<string, unknown>)

    // 行序取作者写的 value；没写的那一行就是网格之外的月份行
    for (const el of this.getParts('row'))
      this.spreader.spread(el, api.getRowProps({ weekDay: numberOf(el) }) as Record<string, unknown>)

    for (const el of this.getParts('week-day-label'))
      this.spreader.spread(el, api.getWeekDayLabelProps({ weekDay: numberOf(el) }) as Record<string, unknown>)

    for (const el of this.getParts('month-label'))
      this.spreader.spread(el, api.getMonthLabelProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    // 格子逐个打：身份取作者写的 value（ISO 日期），计数与档位由 connect 回网格里查。
    // 打上去的 data-scope/data-part/data-value 正是键盘导航在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证
    for (const el of this.getParts('cell'))
      this.spreader.spread(el, api.getCellProps({ date: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    for (const el of this.getParts('legend-item'))
      this.spreader.spread(el, api.getLegendItemProps({ level: numberOf(el) ?? 0 }) as Record<string, unknown>)
  }
}
