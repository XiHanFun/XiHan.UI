/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sankey chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type {
  ChartActiveKeyChangeDetails,
  ChartDatumDetails,
  ChartHiddenSeriesChangeDetails,
  ChartKey,
  ChartMark,
  NumberFormatSpec,
  SankeyChartApi,
  SankeyChartSchema,
  SankeyChartTranslations,
  SankeyLegendItem,
  SankeyLinkColor,
  SankeyLinkDatum,
  SankeyNodeAlign,
  SankeyNodeDatum,
  SankeyNodeSort,
  SankeyOrientation,
  SankeyTooltipModel,
} from '@xihan-ui/headless'
import type { KeyedChildren } from '../dom/generated-nodes'
import { connectSankeyChart, sankeyChartAnatomy, sankeyChartMachine, sankeyChartMeta } from '@xihan-ui/headless'
import { GEN_ATTR, generated, hasAuthorContent, makeGen, reconcile, SVG_NS } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/** 渐变定义在绘图区生成节点里的 key：标记的 key 都带前缀或是部件名，不会与它相同。 */
const DEFS_KEY = 'defs'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-sankey-chart>`：桑基图宿主，节点分列排开、流带的宽度与流量成正比，看流量从哪里来、到哪里去。
 *
 * 作者写外壳：root（`<figure>`）、caption、legend、viewport 与其中空的 `<svg data-xh-part="plot">`，
 * 可选 empty 与 tooltip。渐变、流带、节点与节点名由本元素按场景生成进 plot，按标记的 key 复用节点；
 * 图例项生成进 legend；tooltip 留空时写入缺省内容（节点的流入流出明细，或流带的流量与占比），里面有作者写的节点时元素不碰它。
 * 摘要与数据表由元素追加在 root 末尾，视觉隐藏。
 *
 * 节点、流带与数值格式是对象或函数，只走 JS property。
 *
 * @customElement xh-sankey-chart
 * @attr {'horizontal'|'vertical'} orientation - 流向，默认 horizontal（自左而右）
 * @attr {'justify'|'start'|'end'|'center'} node-align - 节点分列的方式，默认 justify
 * @attr {'neutral'|'source'|'target'|'gradient'} link-color - 流带的颜色，默认 neutral
 * @attr {'auto'|'input'} node-sort - 列内次序，默认 auto
 * @attr {boolean} pending - 数据重取中：保留上一帧、整体降低不透明度
 * @attr {boolean} animated - 播放过渡动画，默认开；`animated="false"` 时直接画终态
 * @attr {string} locale - 数字与内建文案的语言；未提供时按宿主语言
 * @attr {string} active-key - 激活的节点或流带（受控）：节点的身份或「源→目标」
 * @fires hidden-series-change - 图例切换显隐；detail 为 `{ hiddenSeries: string[] }`
 * @fires active-key-change - 指针或键盘换了激活的节点或流带；detail 为 `{ activeKey }`，收起时为 null
 * @fires datum-active - 悬停或聚焦到某个节点或流带；detail 为数据详情，收起时为 null
 * @fires datum-press - 指针点击、Enter 或 Space 按在某个节点或流带上；detail 为数据详情
 * @csspart root - `<figure>`，承载 pending 与错误状态
 * @csspart caption - `<figcaption>`，图表的可及名来源
 * @csspart legend - 图例工具条，项由元素生成
 * @csspart viewport - 尺寸观测的宿主
 * @csspart plot - 绘图区 `<svg>`，流带与节点由元素生成
 * @csspart tooltip - 提示框，留空时由元素写入缺省内容
 * @csspart empty - 没有可画的数据时显示
 */
export class XhSankeyChartElement extends XhElement {
  static override partContract = {
    anatomy: sankeyChartAnatomy,
    meta: sankeyChartMeta,
    // plot 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，生成的图元也不显示
    tags: { plot: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    nodes: { attribute: false },
    links: { attribute: false },
    format: { attribute: false },
    hiddenSeries: { attribute: false },
    defaultHiddenSeries: { attribute: false },
    translations: { attribute: false },
    orientation: { converter: STRING_CONVERTER },
    nodeAlign: { converter: STRING_CONVERTER, attribute: 'node-align' },
    linkColor: { converter: STRING_CONVERTER, attribute: 'link-color' },
    nodeSort: { converter: STRING_CONVERTER, attribute: 'node-sort' },
    activeKey: { converter: STRING_CONVERTER, attribute: 'active-key' },
    pending: { converter: BOOLEAN_CONVERTER },
    animated: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
  }

  declare nodes?: readonly SankeyNodeDatum[]
  declare links?: readonly SankeyLinkDatum[]
  declare format?: NumberFormatSpec | ((value: number) => string)
  declare hiddenSeries?: string[]
  declare defaultHiddenSeries?: string[]
  declare translations?: Partial<SankeyChartTranslations>
  declare orientation?: SankeyOrientation
  declare nodeAlign?: SankeyNodeAlign
  declare linkColor?: SankeyLinkColor
  declare nodeSort?: SankeyNodeSort
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

  private readonly ctrl = new MachineController<SankeyChartSchema>(
    this,
    sankeyChartMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SankeyChartSchema['props']> {
    return {
      nodes: this.nodes,
      links: this.links,
      orientation: this.orientation,
      nodeAlign: this.nodeAlign,
      linkColor: this.linkColor,
      nodeSort: this.nodeSort,
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
  private injectRefs(svc: Service<SankeyChartSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
  }

  /** 连接层的产出：下面这些只读口都从这里取，机器尚未建立时为 null。 */
  private api(): SankeyChartApi | null {
    return this.ctrl.service ? connectSankeyChart(this.ctrl.service, wcNormalize) : null
  }

  /** 图例项：一个分组一项，带色槽与显隐；自行铺图例时照它生成节点。 */
  get legendItems(): readonly SankeyLegendItem[] {
    return this.api()?.legendItems ?? []
  }

  /** 激活的节点或流带（悬停或聚焦）；没有时为 null。 */
  get active(): ChartDatumDetails | null {
    return this.api()?.active ?? null
  }

  /** 提示框的缺省内容模型；收起时为 null。 */
  get tooltip(): SankeyTooltipModel | null {
    return this.api()?.tooltip ?? null
  }

  /** 没有可画的数据。 */
  get empty(): boolean {
    return this.api()?.empty ?? true
  }

  /** 此刻隐藏的分组。hiddenSeries 是作者递进来的受控值，非受控时读这里。 */
  get currentHiddenSeries(): string[] {
    return this.api()?.hiddenSeries ?? []
  }

  /** 此刻激活的键。activeKey 是作者递进来的受控值，非受控时读这里。 */
  get currentActiveKey(): ChartKey | null {
    return this.api()?.activeKey ?? null
  }

  /** 切换某个分组的显隐，与点图例项同一条路。 */
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
  #table: SankeyChartApi['table'] | null = null
  #tableHost: Element | null = null

  protected wire(): void {
    const api = connectSankeyChart(this.ctrl.service, wcNormalize)
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
      this.#paintPlot(plot, [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over], api)

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

  /** 绘图区：渐变定义排在最前，其后是场景标记；两者同一次排序，重画时一起复用。 */
  #paintPlot(plot: Element, marks: readonly ChartMark[], api: SankeyChartApi): void {
    reconcile<ChartMark | null>(plot, [null, ...marks], this.#keys, mark => mark?.key ?? DEFS_KEY, (mark, reuse) =>
      mark == null ? this.#paintDefs(plot.ownerDocument, reuse, api) : this.#paintMark(plot.ownerDocument, mark, reuse, api))
  }

  /** 场景标记画成 SVG 图元：createElementNS 建节点，SVG 图元挂在非 SVG 命名空间下不会显示。 */
  #paintMarks(parent: Element, marks: readonly ChartMark[], api: SankeyChartApi): void {
    reconcile(parent, marks, this.#keys, mark => mark.key, (mark, reuse) => this.#paintMark(parent.ownerDocument, mark, reuse, api))
  }

  #paintMark(doc: Document, mark: ChartMark, reuse: Element | undefined, api: SankeyChartApi): Element {
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

  /** 渐变定义：linkColor="gradient" 时每条流带一个渐变、两端各一个色标。 */
  #paintDefs(doc: Document, reuse: Element | undefined, api: SankeyChartApi): Element {
    const defs = reuse?.localName === 'defs' ? reuse : doc.createElementNS(SVG_NS, 'defs')
    defs.setAttribute(GEN_ATTR, '')
    this.spreader.spread(defs as HTMLElement, api.getDefsProps() as Record<string, unknown>)
    reconcile(defs, api.gradients, this.#keys, gradient => gradient.id, (gradient, old) => {
      const node = old ?? doc.createElementNS(SVG_NS, 'linearGradient')
      node.setAttribute(GEN_ATTR, '')
      this.spreader.spread(node as HTMLElement, api.getGradientProps(gradient) as Record<string, unknown>)
      let [from, to] = generated(node)
      if (!from || !to) {
        for (const stale of generated(node)) stale.remove()
        from = doc.createElementNS(SVG_NS, 'stop')
        to = doc.createElementNS(SVG_NS, 'stop')
        from.setAttribute(GEN_ATTR, '')
        to.setAttribute(GEN_ATTR, '')
        node.append(from, to)
      }
      this.spreader.spread(from as HTMLElement, api.getGradientStopProps(gradient, 'from') as Record<string, unknown>)
      this.spreader.spread(to as HTMLElement, api.getGradientStopProps(gradient, 'to') as Record<string, unknown>)
      return node
    })
    return defs
  }

  /** 图例项：一个分组一个按钮，色标与名字各一个 span。 */
  #paintLegend(legend: Element, api: SankeyChartApi): void {
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

  /** 提示框留空时写缺省内容：节点写合计与流入流出的明细，流带写流量与占比；激活的对象换了就重写。 */
  #paintTooltip(tooltip: HTMLElement, api: SankeyChartApi): void {
    if (hasAuthorContent(tooltip))
      return
    const model = api.tooltip
    const key = model ? JSON.stringify([model.header, api.active?.key ?? null, model.rows.map(row => [row.key, row.value, row.name, row.slot])]) : ''
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
  #paintA11y(root: HTMLElement, api: SankeyChartApi): void {
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
