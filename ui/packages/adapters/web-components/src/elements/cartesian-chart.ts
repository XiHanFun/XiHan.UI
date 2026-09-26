/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type {
  CartesianAxis,
  CartesianChartApi,
  CartesianChartSchema,
  CartesianChartTranslations,
  CartesianLegendItem,
  CartesianOrientation,
  CartesianSeries,
  CartesianTooltipModel,
  CartesianTrigger,
  ChartActiveKeyChangeDetails,
  ChartDatumDetails,
  ChartHiddenSeriesChangeDetails,
  ChartKey,
  ChartMark,
  ChartRow,
} from '@xihan-ui/headless'
import { cartesianChartAnatomy, cartesianChartMachine, cartesianChartMeta, connectCartesianChart } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

const SVG_NS = 'http://www.w3.org/2000/svg'

/** 本元素生成的节点的标记：作者写的节点不带它，重画时只动自己生成的那些。 */
const GEN_ATTR = 'data-xh-gen'

/** 生成节点按 key 复用：父节点 → (key → 节点)。 */
type KeyedChildren = WeakMap<Element, Map<string, Element>>

function generated(parent: Element): Element[] {
  return Array.from(parent.children).filter(node => node.hasAttribute(GEN_ATTR))
}

/**
 * 按 key 把一组节点排进父节点：已有的复用、缺的新建、多的移除，次序与输入一致。
 * 作者写在父节点里的节点不动，生成的节点排在它们之后。
 * 先摘掉多出的再排次序：挪动一个已在文档里的节点会让它里面的焦点丢掉，
 * 十字准线收起时若先排后摘，其后的系列分组都得挪一遍，聚焦的柱随之失焦。
 */
function reconcile<T>(
  parent: Element,
  items: readonly T[],
  keys: KeyedChildren,
  keyOf: (item: T) => string,
  make: (item: T, reuse: Element | undefined) => Element,
): void {
  const known = keys.get(parent) ?? new Map<string, Element>()
  const next = new Map<string, Element>()
  for (const item of items) {
    const key = keyOf(item)
    next.set(key, make(item, known.get(key)))
  }
  const kept = new Set(next.values())
  for (const node of generated(parent)) {
    if (!kept.has(node))
      node.remove()
  }
  let cursor: Element | null = generated(parent)[0] ?? null
  for (const node of next.values()) {
    if (node === cursor)
      cursor = cursor.nextElementSibling
    else
      parent.insertBefore(node, cursor)
  }
  keys.set(parent, next)
}

function makeGen<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag)
  node.setAttribute(GEN_ATTR, '')
  return node
}

/**
 * `<xh-cartesian-chart>`：直角坐标图宿主，柱与折线共用一根自变量轴与一根数值轴。
 *
 * 作者写外壳：root（`<figure>`）、caption、legend、viewport 与其中空的 `<svg data-xh-part="plot">`、tooltip，
 * 可选 empty。几何是从数据算出来的，作者写不出：网格、坐标轴、系列与前景层由本元素按场景生成进 plot，
 * 按标记的 key 复用节点，只写变化的属性；图例项生成进 legend；tooltip 留空时写入缺省内容，
 * 作者也可以自行填充（监听 `datum-active`），里面有作者写的节点时元素不碰它。
 * 摘要与数据表由元素追加在 root 末尾，视觉隐藏。
 *
 * 数据、系列与坐标轴是对象，只走 JS property。
 *
 * @customElement xh-cartesian-chart
 * @attr {'vertical'|'horizontal'} orientation - 朝向，默认 vertical；horizontal 即条形图
 * @attr {'axis'|'item'} trigger - 提示框汇报什么，默认 axis：同一个键上的全部系列
 * @attr {boolean} pending - 数据重取中：保留上一帧、整体降低不透明度
 * @attr {string} locale - 数字、日期与内建文案的语言；未提供时按宿主语言
 * @attr {string} active-key - 激活的类目键（受控）；数值与日期键走 activeKey property
 * @fires hidden-series-change - 图例切换显隐；detail 为 `{ hiddenSeries: string[] }`
 * @fires active-key-change - 指针或键盘换了激活的键；detail 为 `{ activeKey }`，收起时为 null
 * @fires datum-active - 悬停或聚焦到某个数据；detail 为数据详情，收起时为 null
 * @fires datum-press - 指针点击、Enter 或 Space 按在某个数据上；detail 为数据详情
 * @csspart root - `<figure>`，承载 orientation、pending 与错误状态
 * @csspart caption - `<figcaption>`，图表的可及名来源
 * @csspart legend - 图例工具条，项由元素生成
 * @csspart viewport - 尺寸观测的宿主
 * @csspart plot - 绘图区 `<svg>`，标记由元素生成
 * @csspart tooltip - 提示框，留空时由元素写入缺省内容
 * @csspart empty - 没有可画的数据时显示
 */
export class XhCartesianChartElement extends XhElement {
  static override partContract = {
    anatomy: cartesianChartAnatomy,
    meta: cartesianChartMeta,
    // plot 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，生成的图元也不显示
    tags: { plot: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    data: { attribute: false },
    series: { attribute: false },
    xAxis: { attribute: false },
    yAxis: { attribute: false },
    hiddenSeries: { attribute: false },
    defaultHiddenSeries: { attribute: false },
    activeKey: { converter: STRING_CONVERTER, attribute: 'active-key' },
    translations: { attribute: false },
    orientation: { converter: STRING_CONVERTER },
    trigger: { converter: STRING_CONVERTER },
    pending: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
  }

  declare data?: readonly ChartRow[]
  declare series?: readonly CartesianSeries[]
  declare xAxis?: CartesianAxis
  declare yAxis?: CartesianAxis
  declare hiddenSeries?: string[]
  declare defaultHiddenSeries?: string[]
  declare activeKey?: ChartKey | null
  declare translations?: Partial<CartesianChartTranslations>
  declare orientation?: CartesianOrientation
  declare trigger?: CartesianTrigger
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

  private readonly ctrl = new MachineController<CartesianChartSchema>(
    this,
    cartesianChartMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<CartesianChartSchema['props']> {
    return {
      data: this.data,
      series: this.series,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      orientation: this.orientation,
      trigger: this.trigger,
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
  private injectRefs(svc: Service<CartesianChartSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
  }

  /** 连接层的产出：下面这些只读口都从这里取，机器尚未建立时为 null。 */
  private api(): CartesianChartApi | null {
    return this.ctrl.service ? connectCartesianChart(this.ctrl.service, wcNormalize) : null
  }

  /** 图例项：一个系列一项，带色槽、语气、标记与显隐；自行铺图例时照它生成节点。 */
  get legendItems(): readonly CartesianLegendItem[] {
    return this.api()?.legendItems ?? []
  }

  /** 激活的数据（悬停或聚焦），axis 模式带同一个键上的全部系列；没有时为 null。 */
  get active(): ChartDatumDetails | null {
    return this.api()?.active ?? null
  }

  /** 提示框的缺省内容模型：头部与逐系列的行；收起时为 null。 */
  get tooltip(): CartesianTooltipModel | null {
    return this.api()?.tooltip ?? null
  }

  /** 没有可画的数据。 */
  get empty(): boolean {
    return this.api()?.empty ?? true
  }

  /** 此刻隐藏的系列。hiddenSeries 是作者递进来的受控值，非受控时读这里。 */
  get currentHiddenSeries(): string[] {
    return this.api()?.hiddenSeries ?? []
  }

  /** 此刻激活的键。activeKey 是作者递进来的受控值，非受控时读这里。 */
  get currentActiveKey(): ChartKey | null {
    return this.api()?.activeKey ?? null
  }

  /** 切换某个系列的显隐，与点图例项同一条路。 */
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
  #table: CartesianChartApi['table'] | null = null
  #tableHost: Element | null = null

  protected wire(): void {
    const api = connectCartesianChart(this.ctrl.service, wcNormalize)
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
    if (plot) {
      this.#paintMarks(plot, [
        ...api.scene.layers.back,
        ...api.overlay.under,
        ...api.scene.layers.data,
        ...api.overlay.over,
      ], api)
    }

    const tooltip = put('tooltip', api.getTooltipProps() as Record<string, unknown>)
    if (tooltip)
      this.#paintTooltip(tooltip, api)

    const empty = put('empty', api.getEmptyProps() as Record<string, unknown>)
    if (empty)
      this.#paintOwnText(empty, api.emptyText)

    if (root)
      this.#paintA11y(root, api)
  }

  /** 场景标记画成 SVG 图元：createElementNS 建节点，SVG 图元挂在非 SVG 命名空间下不会显示。 */
  #paintMarks(parent: Element, marks: readonly ChartMark[], api: CartesianChartApi): void {
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

  /** 图例项：一个系列一个按钮，色标与名字各一个 span。 */
  #paintLegend(legend: Element, api: CartesianChartApi): void {
    const doc = legend.ownerDocument
    reconcile(legend, api.legendItems, this.#keys, item => item.id, (item, reuse) => {
      const button = reuse instanceof HTMLButtonElement ? reuse : makeGen(doc, 'button')
      if (!reuse) {
        button.append(doc.createElement('span'), doc.createElement('span'))
      }
      const [marker, label] = Array.from(button.children) as HTMLElement[]
      this.spreader.spread(button, api.getLegendItemProps(item) as Record<string, unknown>)
      this.spreader.spread(marker!, api.getLegendSwatchProps(item) as Record<string, unknown>)
      this.spreader.spread(label!, api.getLegendLabelProps(item) as Record<string, unknown>)
      if (label!.textContent !== item.name)
        label!.textContent = item.name
      return button
    })
  }

  /** 提示框留空时写缺省内容：头部是自变量，每个系列一行（色标、数值、系列名）。 */
  #paintTooltip(tooltip: HTMLElement, api: CartesianChartApi): void {
    // 作者自己填了内容就归作者
    if (Array.from(tooltip.childNodes).some(node => !(node instanceof Element && node.hasAttribute(GEN_ATTR)) && node.textContent?.trim()))
      return
    const model = api.tooltip
    // 行上带着激活系列的标记，激活的系列换了也要重建
    const key = model ? JSON.stringify([model.header, api.active?.seriesId, model.rows.map(row => [row.seriesId, row.value, row.name, row.slot, row.tone])]) : ''
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
      const marker = doc.createElement('span')
      this.spreader.spread(marker, api.getTooltipSwatchProps(row) as Record<string, unknown>)
      const value = doc.createElement('span')
      this.spreader.spread(value, api.getTooltipValueProps(row) as Record<string, unknown>)
      value.textContent = row.value
      const name = doc.createElement('span')
      this.spreader.spread(name, api.getTooltipNameProps(row) as Record<string, unknown>)
      name.textContent = row.name
      line.append(marker, value, name)
      return line
    })
    tooltip.append(header, ...rows)
  }

  /** 作者没写内容的部件里放一段缺省文字。 */
  #paintOwnText(host: HTMLElement, text: string): void {
    if (Array.from(host.childNodes).some(node => !(node instanceof Element && node.hasAttribute(GEN_ATTR)) && node.textContent?.trim()))
      return
    const [own] = generated(host)
    const span = own ?? host.appendChild(makeGen(host.ownerDocument, 'span'))
    if (span.textContent !== text)
      span.textContent = text
  }

  /** 摘要与数据表追加在 root 末尾，视觉隐藏：无障碍等价物始终存在。 */
  #paintA11y(root: HTMLElement, api: CartesianChartApi): void {
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
