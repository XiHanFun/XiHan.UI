/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hierarchy chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type {
  ChartActiveKeyChangeDetails,
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  ChartPalette,
  ChartRow,
  HierarchyChartApi,
  HierarchyChartSchema,
  HierarchyChartTranslations,
  HierarchyColorBy,
  HierarchyLayout,
  HierarchyPathItem,
  HierarchyRootKeyChangeDetails,
  HierarchyTile,
  HierarchyTooltipModel,
  NumberFormatSpec,
} from '@xihan-ui/headless'
import type { KeyedChildren } from '../dom/generated-nodes'
import { connectHierarchyChart, hierarchyChartAnatomy, hierarchyChartMachine, hierarchyChartMeta } from '@xihan-ui/headless'
import { GEN_ATTR, generated, hasAuthorContent, makeGen, reconcile, SVG_NS } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/** 最顶层那一项没有身份：路径项的 key 表里给它一个占位。 */
const TOP_KEY = '\u0000top'

/**
 * `<xh-hierarchy-chart>`：层级图宿主，看层级数据中各部分的占比，并逐层下钻。
 *
 * 作者写外壳：root（`<figure>`）、caption、path、viewport 与其中空的 `<svg data-xh-part="plot">`，可选 legend、empty 与 tooltip。
 * 路径项、色阶、节点、节点名与分组标题由本元素生成：路径项生成进 path，按值着色时每层一条色阶生成进 legend，
 * 其余按场景生成进 plot，按 key 复用节点；
 * tooltip 留空时写入缺省内容（路径、数值与两种占比），里面有作者写的节点时元素不碰它。摘要与数据表由元素追加在
 * root 末尾，视觉隐藏。
 *
 * 数据与数值格式是对象或函数，只走 JS property。受控回到最顶层写 `rootKey = null`（property）。
 *
 * @customElement xh-hierarchy-chart
 * @attr {string} children-field - 嵌套数据的子节点字段，默认 children
 * @attr {string} id-field - 扁平数据：行的身份字段
 * @attr {string} parent-field - 扁平数据：父节点的身份字段
 * @attr {string} name-field - 名字字段，默认 name
 * @attr {string} value-field - 数值字段，默认 value：只取叶子的值
 * @attr {'treemap'|'sunburst'|'icicle'|'pack'} layout - 空间填充的方式，默认 treemap
 * @attr {'squarify'|'binary'|'slice-dice'} tile - 矩形树图的铺法，默认 squarify
 * @attr {number} depth - 同时看得见的层数，默认 2
 * @attr {'branch'|'value'|'uniform'} color-by - 着色，默认 branch
 * @attr {'red'|'orange'|'amber'|'yellow'|'lime'|'green'|'teal'|'cyan'|'blue'|'indigo'|'purple'|'pink'|'gray'} palette - 按值着色时顺序色阶的色板
 * @attr {'vertical'|'horizontal'} orientation - 冰柱图的方向，默认 vertical
 * @attr {string} root-key - 当前的根（受控）：节点的身份
 * @attr {string} default-root-key - 初始的根（非受控）
 * @attr {boolean} pending - 数据重取中：保留上一帧、整体降低不透明度
 * @attr {boolean} animated - 播放过渡动画，默认开；`animated="false"` 时直接画终态
 * @attr {string} locale - 数字与内建文案的语言；未提供时按宿主语言
 * @attr {string} active-key - 激活的节点（受控）：与别的图联动时是节点的身份
 * @fires root-key-change - 下钻或上钻换了根；detail 为 `{ rootKey }`，最顶层为 null
 * @fires active-key-change - 指针或键盘换了激活的节点；detail 为 `{ activeKey }`，收起时为 null
 * @fires datum-active - 悬停或聚焦到某个节点；detail 为节点详情，收起时为 null
 * @fires datum-press - 指针点击叶子、Enter 按在叶子上或 Space 按在节点上；detail 为节点详情
 * @csspart root - `<figure>`，承载 pending、错误状态与色板
 * @csspart caption - `<figcaption>`，图表的可及名来源
 * @csspart path - 下钻路径，路径项由元素生成；还在最顶层时收起
 * @csspart legend - 图例：按值着色时每个看得见的层一条色阶，由元素生成；其余着色方式收起
 * @csspart viewport - 尺寸观测的宿主
 * @csspart plot - 绘图区 `<svg>`，节点与标签由元素生成
 * @csspart tooltip - 提示框，留空时由元素写入缺省内容
 * @csspart empty - 没有可画的节点时显示
 */
export class XhHierarchyChartElement extends XhElement {
  static override partContract = {
    anatomy: hierarchyChartAnatomy,
    meta: hierarchyChartMeta,
    // plot 不是 <svg> 时 viewBox 会被小写成 viewbox 而静默失效，生成的图元也不显示
    tags: { plot: ['svg'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    data: { attribute: false },
    format: { attribute: false },
    translations: { attribute: false },
    childrenField: { converter: STRING_CONVERTER, attribute: 'children-field' },
    idField: { converter: STRING_CONVERTER, attribute: 'id-field' },
    parentField: { converter: STRING_CONVERTER, attribute: 'parent-field' },
    nameField: { converter: STRING_CONVERTER, attribute: 'name-field' },
    valueField: { converter: STRING_CONVERTER, attribute: 'value-field' },
    layout: { converter: STRING_CONVERTER },
    tile: { converter: STRING_CONVERTER },
    depth: { converter: NUMBER_CONVERTER },
    colorBy: { converter: STRING_CONVERTER, attribute: 'color-by' },
    palette: { converter: STRING_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    rootKey: { converter: STRING_CONVERTER, attribute: 'root-key' },
    defaultRootKey: { converter: STRING_CONVERTER, attribute: 'default-root-key' },
    activeKey: { converter: STRING_CONVERTER, attribute: 'active-key' },
    pending: { converter: BOOLEAN_CONVERTER },
    animated: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
  }

  declare data?: ChartRow | readonly ChartRow[]
  declare format?: NumberFormatSpec | ((value: number) => string)
  declare translations?: Partial<HierarchyChartTranslations>
  declare childrenField?: string
  declare idField?: string
  declare parentField?: string
  declare nameField?: string
  declare valueField?: string
  declare layout?: HierarchyLayout
  declare tile?: HierarchyTile
  declare depth?: number
  declare colorBy?: HierarchyColorBy
  declare palette?: ChartPalette
  declare orientation?: 'vertical' | 'horizontal'
  declare rootKey?: string | null
  declare defaultRootKey?: string | null
  declare activeKey?: ChartKey | null
  declare pending?: boolean
  declare animated?: boolean
  declare locale?: string

  private readonly notifyRoot = (details: HierarchyRootKeyChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('root-key-change', { detail: details, bubbles: true, composed: true }))
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

  private readonly ctrl = new MachineController<HierarchyChartSchema>(
    this,
    hierarchyChartMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<HierarchyChartSchema['props']> {
    return {
      data: this.data,
      childrenField: this.childrenField,
      idField: this.idField,
      parentField: this.parentField,
      nameField: this.nameField,
      valueField: this.valueField,
      layout: this.layout,
      tile: this.tile,
      depth: this.depth,
      colorBy: this.colorBy,
      palette: this.palette,
      orientation: this.orientation,
      rootKey: this.rootKey,
      defaultRootKey: this.defaultRootKey,
      format: this.format,
      activeKey: this.activeKey,
      pending: this.pending,
      animated: this.animated,
      locale: this.locale,
      translations: this.translations,
      onRootKeyChange: this.notifyRoot,
      onActiveKeyChange: this.notifyKey,
      onDatumActive: this.notifyActive,
      onDatumPress: this.notifyPress,
    }
  }

  // onBuilt 在 ctrl 构造期就跑；取值口惰性读，角色节点要等首次 updated 才发现得到
  private injectRefs(svc: Service<HierarchyChartSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
  }

  /** 连接层的产出：下面这些只读口都从这里取，机器尚未建立时为 null。 */
  private api(): HierarchyChartApi | null {
    return this.ctrl.service ? connectHierarchyChart(this.ctrl.service, wcNormalize) : null
  }

  /** 激活的节点（悬停或聚焦）；没有时为 null。 */
  get active(): ChartDatumDetails | null {
    return this.api()?.active ?? null
  }

  /** 提示框的缺省内容模型；收起时为 null。 */
  get tooltip(): HierarchyTooltipModel | null {
    return this.api()?.tooltip ?? null
  }

  /** 没有可画的节点。 */
  get empty(): boolean {
    return this.api()?.empty ?? true
  }

  /** 数据表模型：与根里视觉隐藏的那张表同一份，要可见的表格视图时交给表格组件。 */
  get table(): HierarchyChartApi['table'] {
    return this.api()?.table ?? { columns: [], rows: [] }
  }

  /** 下钻路径：从最顶层到当前的根。 */
  get path(): readonly HierarchyPathItem[] {
    return this.api()?.path ?? []
  }

  /** 此刻的根。rootKey 是作者递进来的受控值，非受控时读这里。 */
  get currentRootKey(): string | null {
    return this.api()?.rootKey ?? null
  }

  /** 此刻激活的键。activeKey 是作者递进来的受控值，非受控时读这里。 */
  get currentActiveKey(): ChartKey | null {
    return this.api()?.activeKey ?? null
  }

  /** 下钻到某个节点（有子节点才下得去），null 回到最顶层。 */
  drillTo(key: string | null): void {
    this.api()?.drillTo(key)
  }

  /** 上钻一层。 */
  drillUp(): void {
    this.api()?.drillUp()
  }

  /** 移动键盘锚点：只改锚点，不移动 DOM 焦点，也不派发事件。 */
  setFocusedDatum(ref: { seriesId: string, index: number } | null): void {
    this.api()?.setFocusedDatum(ref)
  }

  /** 生成节点的 key 表。 */
  readonly #keys: KeyedChildren = new WeakMap()
  /** 上一次写进提示框与数据表的内容：没变就不重建。 */
  #tooltipKey = ''
  #table: HierarchyChartApi['table'] | null = null
  #tableHost: Element | null = null

  protected wire(): void {
    const api = connectHierarchyChart(this.ctrl.service, wcNormalize)
    const put = (name: string, props: Record<string, unknown>): HTMLElement | null => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
      return el
    }
    const root = put('root', api.getRootProps() as Record<string, unknown>)
    put('caption', api.getCaptionProps() as Record<string, unknown>)

    const path = put('path', api.getPathProps() as Record<string, unknown>)
    if (path)
      this.#paintPath(path, api)

    const legend = put('legend', api.getLegendProps() as Record<string, unknown>)
    if (legend)
      this.#paintLegend(legend, api)

    put('viewport', api.getViewportProps() as Record<string, unknown>)

    const plot = put('plot', api.getPlotProps() as Record<string, unknown>)
    if (plot)
      this.#paintMarks(plot, [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over], api)

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
  #paintMarks(parent: Element, marks: readonly ChartMark[], api: HierarchyChartApi): void {
    reconcile(parent, marks, this.#keys, mark => mark.key, (mark, reuse) => this.#paintMark(parent.ownerDocument, mark, reuse, api))
  }

  #paintMark(doc: Document, mark: ChartMark, reuse: Element | undefined, api: HierarchyChartApi): Element {
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

  /** 下钻路径：每一项生成一个按钮，按节点的身份复用。 */
  #paintPath(path: Element, api: HierarchyChartApi): void {
    const doc = path.ownerDocument
    reconcile(path, api.path, this.#keys, item => item.key ?? TOP_KEY, (item, reuse) => {
      const button = reuse instanceof HTMLButtonElement ? reuse : makeGen(doc, 'button')
      this.spreader.spread(button, api.getPathItemProps(item) as Record<string, unknown>)
      if (button.textContent !== item.name)
        button.textContent = item.name
      return button
    })
  }

  /** 图例：每个看得见的层一条色阶（名字、低端的值、渐变条、高端的值），按层号复用。 */
  #paintLegend(legend: Element, api: HierarchyChartApi): void {
    const doc = legend.ownerDocument
    reconcile(legend, api.legendScales, this.#keys, scale => `level:${scale.level}`, (scale, reuse) => {
      const node = reuse ?? makeGen(doc, 'div')
      if (node.children.length !== 4)
        node.replaceChildren(...Array.from({ length: 4 }, () => doc.createElement('span')))
      const [name, min, bar, max] = Array.from(node.children) as HTMLElement[]
      this.spreader.spread(node as HTMLElement, api.getLegendScaleProps(scale) as Record<string, unknown>)
      this.spreader.spread(name!, api.getLegendScaleNameProps() as Record<string, unknown>)
      this.spreader.spread(min!, api.getLegendScaleValueProps('min') as Record<string, unknown>)
      this.spreader.spread(bar!, api.getLegendScaleBarProps() as Record<string, unknown>)
      this.spreader.spread(max!, api.getLegendScaleValueProps('max') as Record<string, unknown>)
      for (const [el, text] of [[name!, scale.name], [min!, scale.min], [max!, scale.max]] as const) {
        if (el.textContent !== text)
          el.textContent = text
      }
      return node
    })
  }

  /** 提示框留空时写缺省内容：头部是从当前的根到节点的路径，下面是数值与两种占比。 */
  #paintTooltip(tooltip: HTMLElement, api: HierarchyChartApi): void {
    if (hasAuthorContent(tooltip))
      return
    const model = api.tooltip
    // 色标画成节点的颜色：换了节点就要重写，哪怕数值碰巧一样
    const key = model ? JSON.stringify([model.header, api.active?.seriesId ?? null, model.rows.map(row => [row.key, row.value, row.name])]) : ''
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
  #paintA11y(root: HTMLElement, api: HierarchyChartApi): void {
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
