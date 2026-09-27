/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radar chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type {
  ChartActiveKeyChangeDetails,
  ChartDatumDetails,
  ChartHiddenSeriesChangeDetails,
  ChartKey,
  ChartMark,
  ChartRow,
  RadarChartApi,
  RadarChartSchema,
  RadarChartTranslations,
  RadarCurve,
  RadarIndicator,
  RadarLegendItem,
  RadarScale,
  RadarShape,
  RadarTooltipModel,
} from '@xihan-ui/headless'
import type { NumberFormatSpec } from '@xihan-ui/viz'
import type { KeyedChildren } from '../dom/generated-nodes'
import { connectRadarChart, radarChartAnatomy, radarChartMachine, radarChartMeta } from '@xihan-ui/headless'
import { GEN_ATTR, generated, hasAuthorContent, makeGen, reconcile, SVG_NS } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/** 纹理定义在绘图区生成节点里的 key：标记的 key 都带前缀或是部件名，不会与它相同。 */
const DEFS_KEY = 'defs'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-radar-chart>`：雷达图宿主，一行数据一个实体，每个指标一根轴，比较少数几个实体的画像。
 *
 * 作者写外壳：root（`<figure>`）、caption、legend、viewport 与其中空的 `<svg data-xh-part="plot">`，
 * 可选 empty 与 tooltip。网格、指标名、各实体的面积、轮廓与顶点由本元素按场景生成进 plot，按标记的 key 复用节点；
 * 图例项生成进 legend；tooltip 留空时写入缺省内容（指标名与各实体的值），里面有作者写的节点时元素不碰它。
 * 摘要与数据表由元素追加在 root 末尾，视觉隐藏。
 *
 * 数据、指标与数值格式是对象或函数，只走 JS property。
 *
 * @customElement xh-radar-chart
 * @attr {string} name-field - 实体名所在的字段
 * @attr {'polygon'|'circle'} shape - 网格形状，默认 polygon
 * @attr {boolean} area - 轮廓里铺一层系列色的淡洗，默认开；`area="false"` 时只画轮廓
 * @attr {'shared'|'independent'} scale - 量程，默认 independent（每个指标自己的量程）
 * @attr {'linear'|'catmull-rom'} curve - 轮廓的画法，默认 linear
 * @attr {boolean} pending - 数据重取中：保留上一帧、整体降低不透明度
 * @attr {boolean} animated - 播放过渡动画，默认开；`animated="false"` 时直接画终态
 * @attr {string} locale - 数字与内建文案的语言；未提供时按宿主语言
 * @attr {string} active-key - 激活的指标（受控）：与别的图联动时是指标的 key
 * @fires hidden-series-change - 图例切换显隐；detail 为 `{ hiddenSeries: string[] }`
 * @fires active-key-change - 指针或键盘换了激活的指标；detail 为 `{ activeKey }`，收起时为 null
 * @fires datum-active - 悬停或聚焦到某个顶点；detail 为数据详情，收起时为 null
 * @fires datum-press - 指针点击、Enter 或 Space 按在某个顶点上；detail 为数据详情
 * @csspart root - `<figure>`，承载 pending 与错误状态
 * @csspart caption - `<figcaption>`，图表的可及名来源
 * @csspart legend - 图例工具条，项由元素生成
 * @csspart viewport - 尺寸观测的宿主
 * @csspart plot - 绘图区 `<svg>`，网格与各实体由元素生成
 * @csspart tooltip - 提示框，留空时由元素写入缺省内容
 * @csspart empty - 没有可画的数据时显示
 */
export class XhRadarChartElement extends XhElement {
  static override partContract = {
    anatomy: radarChartAnatomy,
    meta: radarChartMeta,
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
    indicators: { attribute: false },
    shape: { converter: STRING_CONVERTER },
    area: { converter: BOOLEAN_CONVERTER },
    scale: { converter: STRING_CONVERTER },
    curve: { converter: STRING_CONVERTER },
    activeKey: { converter: STRING_CONVERTER, attribute: 'active-key' },
    pending: { converter: BOOLEAN_CONVERTER },
    animated: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
  }

  declare data?: readonly ChartRow[]
  declare format?: NumberFormatSpec | ((value: number) => string)
  declare hiddenSeries?: string[]
  declare defaultHiddenSeries?: string[]
  declare translations?: Partial<RadarChartTranslations>
  declare nameField?: string
  declare indicators?: readonly RadarIndicator[]
  declare shape?: RadarShape
  declare area?: boolean
  declare scale?: RadarScale
  declare curve?: RadarCurve
  declare activeKey?: ChartKey | null
  declare pending?: boolean
  declare animated?: boolean
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

  private readonly ctrl = new MachineController<RadarChartSchema>(
    this,
    radarChartMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<RadarChartSchema['props']> {
    return {
      data: this.data,
      nameField: this.nameField,
      indicators: this.indicators,
      shape: this.shape,
      area: this.area,
      scale: this.scale,
      curve: this.curve,
      format: this.format,
      hiddenSeries: this.hiddenSeries,
      defaultHiddenSeries: this.defaultHiddenSeries,
      activeKey: this.activeKey,
      pending: this.pending,
      animated: this.animated,
      locale: this.locale,
      translations: this.translations,
      onHiddenSeriesChange: this.notifyHidden,
      onActiveKeyChange: this.notifyKey,
      onDatumActive: this.notifyActive,
      onDatumPress: this.notifyPress,
    }
  }

  // onBuilt 在 ctrl 构造期就跑；取值口惰性读，角色节点要等首次 updated 才发现得到
  private injectRefs(svc: Service<RadarChartSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
  }

  /** 连接层的产出：下面这些只读口都从这里取，机器尚未建立时为 null。 */
  private api(): RadarChartApi | null {
    return this.ctrl.service ? connectRadarChart(this.ctrl.service, wcNormalize) : null
  }

  /** 图例项：一个实体一项，带色槽与显隐；自行铺图例时照它生成节点。 */
  get legendItems(): readonly RadarLegendItem[] {
    return this.api()?.legendItems ?? []
  }

  /** 激活的顶点（悬停或聚焦）；没有时为 null。 */
  get active(): ChartDatumDetails | null {
    return this.api()?.active ?? null
  }

  /** 提示框的缺省内容模型；收起时为 null。 */
  get tooltip(): RadarTooltipModel | null {
    return this.api()?.tooltip ?? null
  }

  /** 没有可画的数据。 */
  get empty(): boolean {
    return this.api()?.empty ?? true
  }

  /** 此刻隐藏的实体。hiddenSeries 是作者递进来的受控值，非受控时读这里。 */
  get currentHiddenSeries(): string[] {
    return this.api()?.hiddenSeries ?? []
  }

  /** 此刻激活的键。activeKey 是作者递进来的受控值，非受控时读这里。 */
  get currentActiveKey(): ChartKey | null {
    return this.api()?.activeKey ?? null
  }

  /** 切换某个实体的显隐，与点图例项同一条路。 */
  toggleSeries(id: string): void {
    this.api()?.toggleSeries(id)
  }

  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发事件。 */
  setFocusedDatum(ref: { seriesId: string, index: number } | null): void {
    this.api()?.setFocusedDatum(ref)
  }

  /** 生成节点的 key 表。 */
  readonly #keys: KeyedChildren = new WeakMap()
  /** 上一次写进提示框与数据表的内容：没变就不重建。 */
  #tooltipKey = ''
  #table: RadarChartApi['table'] | null = null
  #tableHost: Element | null = null

  protected wire(): void {
    const api = connectRadarChart(this.ctrl.service, wcNormalize)
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
      this.#paintPlot(plot, [...api.scene.layers.back, ...api.overlay.under, ...api.scene.layers.data, ...api.overlay.over], api)

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

  /** 绘图区：纹理定义排在最前，其后是场景标记；两者同一次排序，重画时一起复用。 */
  #paintPlot(plot: Element, marks: readonly ChartMark[], api: RadarChartApi): void {
    reconcile<ChartMark | null>(plot, [null, ...marks], this.#keys, mark => mark?.key ?? DEFS_KEY, (mark, reuse) =>
      mark == null ? this.#paintDefs(plot.ownerDocument, reuse, api) : this.#paintMark(plot.ownerDocument, mark, reuse, api))
  }

  /** 场景标记画成 SVG 图元：createElementNS 建节点，SVG 图元挂在非 SVG 命名空间下不会显示。 */
  #paintMarks(parent: Element, marks: readonly ChartMark[], api: RadarChartApi): void {
    reconcile(parent, marks, this.#keys, mark => mark.key, (mark, reuse) => this.#paintMark(parent.ownerDocument, mark, reuse, api))
  }

  #paintMark(doc: Document, mark: ChartMark, reuse: Element | undefined, api: RadarChartApi): Element {
    const tag = api.markTag(mark)
    const node = reuse?.localName === tag ? reuse : doc.createElementNS(SVG_NS, tag)
    node.setAttribute(GEN_ATTR, '')
    this.spreader.spread(node as HTMLElement, api.getMarkProps(mark) as Record<string, unknown>)
    if (mark.kind === 'group')
      this.#paintMarks(node, mark.children, api)
    else if (mark.kind === 'text' && node.textContent !== mark.text)
      node.textContent = mark.text
    return node
  }

  /** 纹理定义：每种纹理一个 pattern、里面一条线。 */
  #paintDefs(doc: Document, reuse: Element | undefined, api: RadarChartApi): Element {
    const defs = reuse?.localName === 'defs' ? reuse : doc.createElementNS(SVG_NS, 'defs')
    defs.setAttribute(GEN_ATTR, '')
    this.spreader.spread(defs as HTMLElement, api.getDefsProps() as Record<string, unknown>)
    reconcile(defs, api.patterns, this.#keys, pattern => pattern.id, (pattern, old) => {
      const node = old ?? doc.createElementNS(SVG_NS, 'pattern')
      node.setAttribute(GEN_ATTR, '')
      this.spreader.spread(node as HTMLElement, api.getPatternProps(pattern) as Record<string, unknown>)
      let line = generated(node)[0]
      if (!line) {
        line = doc.createElementNS(SVG_NS, 'path')
        line.setAttribute(GEN_ATTR, '')
        node.append(line)
      }
      this.spreader.spread(line as HTMLElement, api.getPatternLineProps(pattern) as Record<string, unknown>)
      return node
    })
    return defs
  }

  /** 图例项：一个实体一个按钮，色标与名字各一个 span。 */
  #paintLegend(legend: Element, api: RadarChartApi): void {
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

  /** 提示框留空时写缺省内容：头部是指标名，每个可见实体一行；激活的实体换了也要重写，那一行带着 data-current。 */
  #paintTooltip(tooltip: HTMLElement, api: RadarChartApi): void {
    if (hasAuthorContent(tooltip))
      return
    const model = api.tooltip
    const key = model ? JSON.stringify([model.header, api.active?.seriesId ?? null, model.rows.map(row => [row.seriesId, row.value, row.name, row.slot])]) : ''
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
  #paintA11y(root: HTMLElement, api: RadarChartApi): void {
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
