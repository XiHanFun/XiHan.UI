/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pie chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type {
  ChartActiveKeyChangeDetails,
  ChartDatumDetails,
  ChartHiddenSeriesChangeDetails,
  ChartKey,
  ChartMark,
  ChartRow,
  PieChartApi,
  PieChartSchema,
  PieChartTranslations,
  PieLabels,
  PieLegendItem,
  PieSort,
  PieSweep,
  PieTooltipModel,
  PieVariant,
} from '@xihan-ui/headless'
import type { NumberFormatSpec } from '@xihan-ui/viz'
import type { KeyedChildren } from '../dom/generated-nodes'
import { connectPieChart, pieChartAnatomy, pieChartMachine, pieChartMeta } from '@xihan-ui/headless'
import { GEN_ATTR, generated, hasAuthorContent, makeGen, reconcile, SVG_NS } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-pie-chart>`：饼图宿主，一行数据一个扇区，缺省画成环形。
 *
 * 作者写外壳：root（`<figure>`）、caption、legend、viewport 与其中空的 `<svg data-xh-part="plot">`，
 * 可选 center、empty 与 tooltip。扇区、引导线与标签由本元素按场景生成进 plot，按标记的 key 复用节点；
 * 图例项生成进 legend；center 与 tooltip 留空时写入缺省内容（合计、扇区名与数值），里面有作者写的节点时元素不碰它。
 * 摘要与数据表由元素追加在 root 末尾，视觉隐藏。
 *
 * 数据与数值格式是对象，只走 JS property。
 *
 * @customElement xh-pie-chart
 * @attr {string} name-field - 扇区名所在的字段
 * @attr {string} value-field - 数值所在的字段
 * @attr {'pie'|'donut'} variant - 形态，默认 donut
 * @attr {boolean} rose - 南丁格尔玫瑰图：角度均分，半径按数值
 * @attr {'full'|'half'} sweep - 扫过的角度，默认 full
 * @attr {'none'|'descending'} sort - 扇区次序，默认 descending（自 12 点顺时针由大到小）
 * @attr {number} max-slices - 最多保留几个扇区（含「其他」），默认 6
 * @attr {'none'|'inside'|'outside'} labels - 扇区标签，默认 outside（带引导线）
 * @attr {boolean} pending - 数据重取中：保留上一帧、整体降低不透明度
 * @attr {string} locale - 数字与内建文案的语言；未提供时按宿主语言
 * @attr {string} active-key - 激活的类目（受控）：与别的图联动时是扇区名
 * @fires hidden-series-change - 图例切换显隐；detail 为 `{ hiddenSeries: string[] }`
 * @fires active-key-change - 指针或键盘换了激活的扇区；detail 为 `{ activeKey }`，收起时为 null
 * @fires datum-active - 悬停或聚焦到某个扇区；detail 为扇区详情，收起时为 null
 * @fires datum-press - 指针点击、Enter 或 Space 按在某个扇区上；detail 为扇区详情
 * @csspart root - `<figure>`，承载 pending 与错误状态
 * @csspart caption - `<figcaption>`，图表的可及名来源
 * @csspart legend - 图例工具条，项由元素生成
 * @csspart viewport - 尺寸观测的宿主
 * @csspart plot - 绘图区 `<svg>`，扇区与标签由元素生成
 * @csspart center - 环形中心，留空时由元素写入合计
 * @csspart tooltip - 提示框，留空时由元素写入缺省内容
 * @csspart empty - 没有可画的扇区时显示
 */
export class XhPieChartElement extends XhElement {
  static override partContract = {
    anatomy: pieChartAnatomy,
    meta: pieChartMeta,
    // plot 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，生成的图元也不显示
    tags: { plot: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    data: { attribute: false },
    format: { attribute: false },
    hiddenSeries: { attribute: false },
    defaultHiddenSeries: { attribute: false },
    translations: { attribute: false },
    nameField: { converter: STRING_CONVERTER, attribute: 'name-field' },
    valueField: { converter: STRING_CONVERTER, attribute: 'value-field' },
    variant: { converter: STRING_CONVERTER },
    rose: { converter: BOOLEAN_CONVERTER },
    sweep: { converter: STRING_CONVERTER },
    sort: { converter: STRING_CONVERTER },
    maxSlices: { converter: NUMBER_CONVERTER, attribute: 'max-slices' },
    labels: { converter: STRING_CONVERTER },
    activeKey: { converter: STRING_CONVERTER, attribute: 'active-key' },
    pending: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
  }

  declare data?: readonly ChartRow[]
  declare format?: NumberFormatSpec | ((value: number) => string)
  declare hiddenSeries?: string[]
  declare defaultHiddenSeries?: string[]
  declare translations?: Partial<PieChartTranslations>
  declare nameField?: string
  declare valueField?: string
  declare variant?: PieVariant
  declare rose?: boolean
  declare sweep?: PieSweep
  declare sort?: PieSort
  declare maxSlices?: number
  declare labels?: PieLabels
  declare activeKey?: ChartKey | null
  declare pending?: boolean
  declare locale?: string

  private readonly notifyHidden = (details: ChartHiddenSeriesChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('hidden-series-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyKey = (details: ChartActiveKeyChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('active-key-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyActive = (details: ChartDatumDetails | null): void => {
    this.dispatchEvent(new CustomEvent('datum-active', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyPress = (details: ChartDatumDetails): void => {
    this.dispatchEvent(new CustomEvent('datum-press', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<PieChartSchema>(
    this,
    pieChartMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<PieChartSchema['props']> {
    return {
      data: this.data,
      nameField: this.nameField,
      valueField: this.valueField,
      variant: this.variant,
      rose: this.rose,
      sweep: this.sweep,
      sort: this.sort,
      maxSlices: this.maxSlices,
      labels: this.labels,
      format: this.format,
      hiddenSeries: this.hiddenSeries,
      defaultHiddenSeries: this.defaultHiddenSeries,
      activeKey: this.activeKey,
      pending: this.pending,
      locale: this.locale,
      translations: this.translations,
      onHiddenSeriesChange: this.notifyHidden,
      onActiveKeyChange: this.notifyKey,
      onDatumActive: this.notifyActive,
      onDatumPress: this.notifyPress,
    }
  }

  // onBuilt 在 ctrl 构造期就跑；取值口惰性读，角色节点要等首次 updated 才发现得到
  private injectRefs(svc: Service<PieChartSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
  }

  /** 连接层的产出：下面这些只读口都从这里取，机器尚未建立时为 null。 */
  private api(): PieChartApi | null {
    return this.ctrl.service ? connectPieChart(this.ctrl.service, wcNormalize) : null
  }

  /** 图例项：一个扇区一项，带色槽与显隐；自行铺图例时照它生成节点。 */
  get legendItems(): readonly PieLegendItem[] {
    return this.api()?.legendItems ?? []
  }

  /** 激活的扇区（悬停或聚焦）；没有时为 null。 */
  get active(): ChartDatumDetails | null {
    return this.api()?.active ?? null
  }

  /** 提示框的缺省内容模型；收起时为 null。 */
  get tooltip(): PieTooltipModel | null {
    return this.api()?.tooltip ?? null
  }

  /** 环形中心的缺省内容：可见扇区的合计与说明文字。 */
  get center(): PieChartApi['center'] {
    return this.api()?.center ?? { value: '', label: '' }
  }

  /** 没有可画的扇区。 */
  get empty(): boolean {
    return this.api()?.empty ?? true
  }

  /** 此刻隐藏的扇区。hiddenSeries 是作者递进来的受控值，非受控时读这里。 */
  get currentHiddenSeries(): string[] {
    return this.api()?.hiddenSeries ?? []
  }

  /** 此刻激活的键。activeKey 是作者递进来的受控值，非受控时读这里。 */
  get currentActiveKey(): ChartKey | null {
    return this.api()?.activeKey ?? null
  }

  /** 切换某个扇区的显隐，与点图例项同一条路。 */
  toggleSeries(id: string): void {
    this.api()?.toggleSeries(id)
  }

  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发事件。 */
  setFocusedDatum(ref: { seriesId: string, index: number } | null): void {
    this.api()?.setFocusedDatum(ref)
  }

  /** 生成节点的 key 表。 */
  readonly #keys: KeyedChildren = new WeakMap()
  /** 上一次写进提示框、中心与数据表的内容：没变就不重建。 */
  #tooltipKey = ''
  #table: PieChartApi['table'] | null = null
  #tableHost: Element | null = null

  protected wire(): void {
    const api = connectPieChart(this.ctrl.service, wcNormalize)
    const put = (name: string, props: Record<string, unknown>): HTMLElement | null => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
      return el
    }
    const root = put('root', api.getRootProps() as Record<string, unknown>)
    put('caption', api.getCaptionProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)

    const legend = put('legend', api.getLegendProps() as Record<string, unknown>)
    if (legend)
      this.#paintLegend(legend, api)

    const plot = put('plot', api.getPlotProps() as Record<string, unknown>)
    if (plot)
      this.#paintMarks(plot, [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over], api)

    const center = put('center', api.getCenterProps() as Record<string, unknown>)
    if (center)
      this.#paintCenter(center, api)

    const tooltip = put('tooltip', api.getTooltipProps() as Record<string, unknown>)
    if (tooltip)
      this.#paintTooltip(tooltip, api)

    const empty = put('empty', api.getEmptyProps() as Record<string, unknown>)
    if (empty && !hasAuthorContent(empty)) {
      const [own] = generated(empty)
      const span = own ?? empty.appendChild(makeGen(empty.ownerDocument, 'span'))
      if (span.textContent !== api.emptyText)
        span.textContent = api.emptyText
    }

    if (root)
      this.#paintA11y(root, api)
  }

  /** 场景标记画成 SVG 图元：createElementNS 建节点，SVG 图元挂在非 SVG 命名空间下不会显示。 */
  #paintMarks(parent: Element, marks: readonly ChartMark[], api: PieChartApi): void {
    const doc = parent.ownerDocument
    reconcile(parent, marks, this.#keys, mark => mark.key, (mark, reuse) => {
      const tag = api.markTag(mark)
      const node = reuse?.localName === tag ? reuse : doc.createElementNS(SVG_NS, tag)
      node.setAttribute(GEN_ATTR, '')
      this.spreader.spread(node as HTMLElement, api.getMarkProps(mark) as Record<string, unknown>)
      if (mark.kind === 'group')
        this.#paintMarks(node, mark.children, api)
      else if (mark.kind === 'text' && node.textContent !== mark.text)
        node.textContent = mark.text
      return node
    })
  }

  /** 图例项：一个扇区一个按钮，色标与名字各一个 span。 */
  #paintLegend(legend: Element, api: PieChartApi): void {
    const doc = legend.ownerDocument
    reconcile(legend, api.legendItems, this.#keys, item => item.id, (item, reuse) => {
      const button = reuse instanceof HTMLButtonElement ? reuse : makeGen(doc, 'button')
      if (!reuse)
        button.append(doc.createElement('span'), doc.createElement('span'))
      const [swatch, label] = Array.from(button.children) as HTMLElement[]
      this.spreader.spread(button, api.getLegendItemProps(item) as Record<string, unknown>)
      this.spreader.spread(swatch!, api.getLegendSwatchProps(item) as Record<string, unknown>)
      this.spreader.spread(label!, api.getLegendLabelProps(item) as Record<string, unknown>)
      if (label!.textContent !== item.name)
        label!.textContent = item.name
      return button
    })
  }

  /** 环形中心留空时写合计：数值一行，说明文字一行。 */
  #paintCenter(center: HTMLElement, api: PieChartApi): void {
    if (hasAuthorContent(center))
      return
    let [value, label] = generated(center) as HTMLElement[]
    if (!value || !label) {
      for (const node of generated(center)) node.remove()
      value = center.appendChild(makeGen(center.ownerDocument, 'span'))
      label = center.appendChild(makeGen(center.ownerDocument, 'span'))
    }
    this.spreader.spread(value, api.getCenterValueProps() as Record<string, unknown>)
    this.spreader.spread(label, api.getCenterLabelProps() as Record<string, unknown>)
    if (value.textContent !== api.center.value)
      value.textContent = api.center.value
    if (label.textContent !== api.center.label)
      label.textContent = api.center.label
  }

  /** 提示框留空时写缺省内容：头部是扇区名，下面是数值与占比。 */
  #paintTooltip(tooltip: HTMLElement, api: PieChartApi): void {
    if (hasAuthorContent(tooltip))
      return
    const model = api.tooltip
    const key = model ? JSON.stringify([model.header, model.rows.map(row => [row.key, row.value, row.name, row.slot, row.other])]) : ''
    if (key === this.#tooltipKey && (generated(tooltip).length > 0) === (model != null))
      return
    this.#tooltipKey = key
    for (const node of generated(tooltip)) node.remove()
    if (!model)
      return
    const doc = tooltip.ownerDocument
    const header = makeGen(doc, 'div')
    this.spreader.spread(header, api.getTooltipHeaderProps() as Record<string, unknown>)
    header.textContent = model.header
    const rows = model.rows.map((row) => {
      const line = makeGen(doc, 'div')
      this.spreader.spread(line, api.getTooltipRowProps(row) as Record<string, unknown>)
      const swatch = doc.createElement('span')
      this.spreader.spread(swatch, api.getTooltipSwatchProps(row) as Record<string, unknown>)
      const value = doc.createElement('span')
      this.spreader.spread(value, api.getTooltipValueProps(row) as Record<string, unknown>)
      value.textContent = row.value
      const name = doc.createElement('span')
      this.spreader.spread(name, api.getTooltipNameProps(row) as Record<string, unknown>)
      name.textContent = row.name
      line.append(swatch, value, name)
      return line
    })
    tooltip.append(header, ...rows)
  }

  /** 摘要与数据表追加在 root 末尾，视觉隐藏：无障碍等价物始终存在。 */
  #paintA11y(root: HTMLElement, api: PieChartApi): void {
    const doc = root.ownerDocument
    let [summary, table] = generated(root) as HTMLElement[]
    if (!summary || !table) {
      for (const node of generated(root)) node.remove()
      summary = root.appendChild(makeGen(doc, 'p'))
      table = root.appendChild(makeGen(doc, 'table'))
      this.#table = null
    }
    this.spreader.spread(summary, api.getSummaryProps() as Record<string, unknown>)
    if (summary.textContent !== api.summary)
      summary.textContent = api.summary
    this.spreader.spread(table, api.getTableProps() as Record<string, unknown>)
    if (this.#table === api.table && this.#tableHost === table)
      return
    this.#table = api.table
    this.#tableHost = table
    const caption = doc.createElement('caption')
    caption.textContent = api.tableCaption
    const head = doc.createElement('thead')
    const headRow = doc.createElement('tr')
    for (const column of api.table.columns) {
      const th = doc.createElement('th')
      th.scope = 'col'
      th.textContent = column.label
      headRow.append(th)
    }
    head.append(headRow)
    const body = doc.createElement('tbody')
    for (const row of api.table.rows) {
      const tr = doc.createElement('tr')
      row.cells.forEach((cell, c) => {
        const td = doc.createElement(c === 0 ? 'th' : 'td')
        if (c === 0)
          (td as HTMLTableCellElement).scope = 'row'
        td.textContent = cell.text
        tr.append(td)
      })
      body.append(tr)
    }
    table.replaceChildren(caption, head, body)
  }
}
