/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 funnel chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type {
  ChartActiveKeyChangeDetails,
  ChartDatumDetails,
  ChartHiddenSeriesChangeDetails,
  ChartKey,
  ChartMark,
  ChartPalette,
  ChartRow,
  FunnelAlign,
  FunnelChartApi,
  FunnelChartSchema,
  FunnelChartTranslations,
  FunnelConversion,
  FunnelDirection,
  FunnelLabels,
  FunnelShape,
  FunnelTooltipModel,
  NumberFormatSpec,
} from '@xihan-ui/headless'
import type { KeyedChildren } from '../dom/generated-nodes'
import { connectFunnelChart, funnelChartAnatomy, funnelChartMachine, funnelChartMeta } from '@xihan-ui/headless'
import { GEN_ATTR, generated, hasAuthorContent, makeGen, reconcile, SVG_NS } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-funnel-chart>`：漏斗图宿主，一行数据一个阶段，看各阶段的保留量与逐级转化率。
 *
 * 作者写外壳：root（`<figure>`）、caption、viewport 与其中空的 `<svg data-xh-part="plot">`，可选 empty 与 tooltip。
 * 阶段、阶段标签与转化率由本元素按场景生成进 plot，按标记的 key 复用节点；tooltip 留空时写入缺省内容
 * （阶段名、数值与转化率），里面有作者写的节点时元素不碰它。摘要与数据表由元素追加在 root 末尾，视觉隐藏。
 *
 * 数据与数值格式是对象或函数，只走 JS property。
 *
 * @customElement xh-funnel-chart
 * @attr {string} name-field - 阶段名所在的字段
 * @attr {string} value-field - 数值所在的字段
 * @attr {'trapezoid'|'bar'} shape - 阶段的形状，默认 trapezoid
 * @attr {'center'|'start'} align - 阶段的对齐，默认 center
 * @attr {'down'|'up'} direction - 排列方向，默认 down；up 即金字塔
 * @attr {'previous'|'first'|'none'} conversion - 转化率的基准，默认 previous
 * @attr {'inside'|'outside'} labels - 阶段标签，默认 inside（放不下时写到阶段外侧）
 * @attr {'red'|'orange'|'amber'|'yellow'|'lime'|'green'|'teal'|'cyan'|'blue'|'indigo'|'purple'|'pink'|'gray'} palette - 顺序色阶的色板：阶段由深入浅取这个色相
 * @attr {boolean} pending - 数据重取中：保留上一帧、整体降低不透明度
 * @attr {boolean} animated - 播放过渡动画，默认开；`animated="false"` 时直接画终态
 * @attr {string} locale - 数字与内建文案的语言；未提供时按宿主语言
 * @attr {string} active-key - 激活的阶段（受控）：与别的图联动时是阶段名
 * @fires hidden-series-change - 阶段的显隐变了；detail 为 `{ hiddenSeries: string[] }`
 * @fires active-key-change - 指针或键盘换了激活的阶段；detail 为 `{ activeKey }`，收起时为 null
 * @fires datum-active - 悬停或聚焦到某个阶段；detail 为阶段详情，收起时为 null
 * @fires datum-press - 指针点击、Enter 或 Space 按在某个阶段上；detail 为阶段详情
 * @csspart root - `<figure>`，承载 pending、错误状态与色板
 * @csspart caption - `<figcaption>`，图表的可及名来源
 * @csspart viewport - 尺寸观测的宿主
 * @csspart plot - 绘图区 `<svg>`，阶段、标签与转化率由元素生成
 * @csspart tooltip - 提示框，留空时由元素写入缺省内容
 * @csspart empty - 没有可画的阶段时显示
 */
export class XhFunnelChartElement extends XhElement {
  static override partContract = {
    anatomy: funnelChartAnatomy,
    meta: funnelChartMeta,
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
    shape: { converter: STRING_CONVERTER },
    align: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER },
    conversion: { converter: STRING_CONVERTER },
    labels: { converter: STRING_CONVERTER },
    palette: { converter: STRING_CONVERTER },
    activeKey: { converter: STRING_CONVERTER, attribute: 'active-key' },
    pending: { converter: BOOLEAN_CONVERTER },
    animated: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
  }

  declare data?: readonly ChartRow[]
  declare format?: NumberFormatSpec | ((value: number) => string)
  declare hiddenSeries?: string[]
  declare defaultHiddenSeries?: string[]
  declare translations?: Partial<FunnelChartTranslations>
  declare nameField?: string
  declare valueField?: string
  declare shape?: FunnelShape
  declare align?: FunnelAlign
  declare direction?: FunnelDirection
  declare conversion?: FunnelConversion
  declare labels?: FunnelLabels
  declare palette?: ChartPalette
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

  private readonly ctrl = new MachineController<FunnelChartSchema>(
    this,
    funnelChartMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<FunnelChartSchema['props']> {
    return {
      data: this.data,
      nameField: this.nameField,
      valueField: this.valueField,
      shape: this.shape,
      align: this.align,
      direction: this.direction,
      conversion: this.conversion,
      labels: this.labels,
      palette: this.palette,
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
  private injectRefs(svc: Service<FunnelChartSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
  }

  /** 连接层的产出：下面这些只读口都从这里取，机器尚未建立时为 null。 */
  private api(): FunnelChartApi | null {
    return this.ctrl.service ? connectFunnelChart(this.ctrl.service, wcNormalize) : null
  }

  /** 激活的阶段（悬停或聚焦）；没有时为 null。 */
  get active(): ChartDatumDetails | null {
    return this.api()?.active ?? null
  }

  /** 提示框的缺省内容模型；收起时为 null。 */
  get tooltip(): FunnelTooltipModel | null {
    return this.api()?.tooltip ?? null
  }

  /** 没有可画的数据。 */
  get empty(): boolean {
    return this.api()?.empty ?? true
  }

  /** 此刻隐藏的阶段。hiddenSeries 是作者递进来的受控值，非受控时读这里。 */
  get currentHiddenSeries(): string[] {
    return this.api()?.hiddenSeries ?? []
  }

  /** 此刻激活的键。activeKey 是作者递进来的受控值，非受控时读这里。 */
  get currentActiveKey(): ChartKey | null {
    return this.api()?.activeKey ?? null
  }

  /** 切换某个阶段的显隐，与点图例项同一条路。 */
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
  #table: FunnelChartApi['table'] | null = null
  #tableHost: Element | null = null

  protected wire(): void {
    const api = connectFunnelChart(this.ctrl.service, wcNormalize)
    const put = (name: string, props: Record<string, unknown>): HTMLElement | null => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
      return el
    }
    const root = put('root', api.getRootProps() as Record<string, unknown>)
    put('caption', api.getCaptionProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)

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

  /** 绘图区：场景标记按 key 复用节点。 */
  #paintPlot(plot: Element, marks: readonly ChartMark[], api: FunnelChartApi): void {
    this.#paintMarks(plot, marks, api)
  }

  /** 场景标记画成 SVG 图元：createElementNS 建节点，SVG 图元挂在非 SVG 命名空间下不会显示。 */
  #paintMarks(parent: Element, marks: readonly ChartMark[], api: FunnelChartApi): void {
    reconcile(parent, marks, this.#keys, mark => mark.key, (mark, reuse) => this.#paintMark(parent.ownerDocument, mark, reuse, api))
  }

  #paintMark(doc: Document, mark: ChartMark, reuse: Element | undefined, api: FunnelChartApi): Element {
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

  /** 提示框留空时写缺省内容：头部是阶段名，下面是数值与两种转化率。 */
  #paintTooltip(tooltip: HTMLElement, api: FunnelChartApi): void {
    if (hasAuthorContent(tooltip))
      return
    const model = api.tooltip
    const key = model ? JSON.stringify([model.header, model.rows.map(row => [row.key, row.value, row.name])]) : ''
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
  #paintA11y(root: HTMLElement, api: FunnelChartApi): void {
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
