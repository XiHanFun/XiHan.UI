/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { Service } from '@xihan-ui/core'
import type {
  CartesianAnnotation,
  CartesianAxis,
  CartesianBrush,
  CartesianBrushSelection,
  CartesianBrushSelectionChangeDetails,
  CartesianChartApi,
  CartesianChartSchema,
  CartesianChartTranslations,
  CartesianFollowChangeDetails,
  CartesianLegendItem,
  CartesianOrientation,
  CartesianRenderer,
  CartesianSeries,
  CartesianTooltipModel,
  CartesianTooltipOrder,
  CartesianTrigger,
  CartesianWindow,
  CartesianWindowChangeDetails,
  CartesianZoom,
  ChartActiveKeyChangeDetails,
  ChartDatumDetails,
  ChartHiddenSeriesChangeDetails,
  ChartKey,
  ChartMark,
  ChartPalette,
  ChartRow,
  ColumnSource,
} from '@xihan-ui/headless'
import type { KeyedChildren } from '../dom/generated-nodes'
import { cartesianChartAnatomy, cartesianChartMachine, cartesianChartMeta, connectCartesianChart } from '@xihan-ui/headless'
import { GEN_ATTR, generated, hasAuthorContent, makeGen, reconcile, SVG_NS } from '../dom/generated-nodes'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/** 纹理定义在绘图区生成节点里的 key：标记的 key 都带前缀或是部件名，不会与它相同。 */
const DEFS_KEY = 'defs'

/** 画布模式下元素在绘图区前面生成的两个节点：垫层 svg 与画布。 */
const UNDERLAY = 'underlay'
const CANVAS = 'canvas'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席是没给，`x="false"` 是关，其余写法都是开
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 一行单元格按位置复用：个数对齐、文字变了才写。scope 为 col 时整行是列头，为 row 时首格是行头。 */
function syncTableRow(tr: Element, texts: readonly string[], scope: 'col' | 'row'): void {
  const doc = tr.ownerDocument
  while (tr.children.length > texts.length)
    tr.lastElementChild!.remove()
  texts.forEach((text, c) => {
    const tag = scope === 'col' || c === 0 ? 'th' : 'td'
    let cell = tr.children[c] as HTMLTableCellElement | undefined
    if (!cell || cell.localName !== tag) {
      const next = doc.createElement(tag)
      if (tag === 'th')
        next.scope = scope
      if (cell)
        cell.replaceWith(next)
      else
        tr.append(next)
      cell = next
    }
    if (cell.textContent !== text)
      cell.textContent = text
  })
}

/**
 * `<xh-cartesian-chart>`：直角坐标图宿主，柱、折线与散点共用一根自变量轴与一根数值轴。
 *
 * 作者写外壳：root（`<figure>`）、caption、legend、viewport 与其中空的 `<svg data-xh-part="plot">`、tooltip，
 * 可选 empty。几何是从数据算出来的，作者写不出：网格、坐标轴、系列与前景层由本元素按场景生成进 plot，
 * 按标记的 key 复用节点，只写变化的属性；图例项与按值着色时的色阶生成进 legend；tooltip 留空时写入缺省内容，
 * 作者也可以自行填充（监听 `datum-active`），里面有作者写的节点时元素不碰它。
 * 摘要与数据表由元素追加在 root 末尾，视觉隐藏。
 * 数据层画在画布上时（renderer 解析为 canvas），元素在绘图区前面生成垫层 `<svg>`（网格、坐标轴、参考带、准线）
 * 与 `<canvas>`，作者不用写；切回 svg 时撤掉。
 *
 * 数据、系列、坐标轴与注释是对象，只走 JS property。
 *
 * @customElement xh-cartesian-chart
 * @attr {'vertical'|'horizontal'} orientation - 朝向，默认 vertical；horizontal 即条形图
 * @attr {'svg'|'canvas'|'auto'} renderer - 数据层画在哪，默认 auto：数据层逐个成节点的标记超过节点预算时改用画布
 * @attr {'axis'|'item'} trigger - 提示框汇报什么；默认含柱或折线时 axis（同一个键上的全部系列），只有散点时 item
 * @attr {'none'|'x'|'y'|'xy'} zoom - 缩放的方向，默认 none；开启后 Ctrl（⌘）滚轮、捏合、键盘 + / − 缩放，放大后拖动平移
 * @attr {'none'|'x'|'y'|'xy'} brush - 刷选的方向，默认 none；开启后在绘图区拖动即刷选，Shift + 方向键从锚点起扩展，Escape 清掉
 * @attr {'red'|'orange'|'amber'|'yellow'|'lime'|'green'|'teal'|'cyan'|'blue'|'indigo'|'purple'|'pink'|'gray'} palette - 顺序色阶的色板：按值着色的点与色阶图例换到这个色相上
 * @attr {boolean} totals - 堆叠柱的合计：每个堆叠组在最外端写出合计
 * @attr {'series'|'descending'|'ascending'} tooltip-order - 提示框里各系列的行序，默认 series（按图例次序）
 * @attr {boolean} follow - 缩放窗口跟随最新的数据（受控）：窗口右端贴着数据末端时，新数据到来窗口随之右移；未提供该属性即非受控
 * @attr {boolean} default-follow - 非受控时初始是否跟随，默认 true
 * @attr {boolean} pending - 数据重取中：保留上一帧、整体降低不透明度
 * @attr {boolean} animated - 播放过渡动画，默认开；`animated="false"` 时直接画终态
 * @attr {string} locale - 数字、日期与内建文案的语言；未提供时按宿主语言
 * @attr {string} active-key - 激活的类目键（受控）；数值与日期键走 activeKey property
 * @fires hidden-series-change - 图例切换显隐；detail 为 `{ hiddenSeries: string[] }`
 * @fires active-key-change - 指针或键盘换了激活的键；detail 为 `{ activeKey }`，收起时为 null
 * @fires window-change - 滚轮、捏合、拖动、键盘或缩放条改了缩放窗口；detail 为 `{ window }`
 * @fires follow-change - 用户把窗口拖离或拖回数据末端，跟随的开关变了；detail 为 `{ follow }`
 * @fires brush-selection-change - 刷选范围变了（指针松手时一次，键盘每按一次）；detail 为 `{ selection, data }`
 * @fires datum-active - 悬停或聚焦到某个数据；detail 为数据详情，收起时为 null
 * @fires datum-press - 指针点击、Enter 或 Space 按在某个数据上；detail 为数据详情
 * @csspart root - `<figure>`，承载 orientation、pending 与错误状态
 * @csspart caption - `<figcaption>`，图表的可及名来源
 * @csspart legend - 图例工具条，项与色阶由元素生成
 * @csspart viewport - 尺寸观测的宿主
 * @csspart plot - 绘图区 `<svg>`，标记由元素生成
 * @csspart underlay - 画布模式下垫在画布之下的 `<svg>`，由元素生成
 * @csspart canvas - 画布模式下的数据层 `<canvas>`，由元素生成
 * @csspart zoom-slider - 缩放条外壳，轨道、窗口、两端的手柄与缩略线由元素生成
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
    annotations: { attribute: false },
    window: { attribute: false },
    defaultWindow: { attribute: false },
    zoom: { converter: STRING_CONVERTER },
    follow: { converter: BOOLEAN_CONVERTER },
    defaultFollow: { converter: BOOLEAN_CONVERTER, attribute: 'default-follow' },
    brush: { converter: STRING_CONVERTER },
    brushSelection: { attribute: false },
    defaultBrushSelection: { attribute: false },
    orientation: { converter: STRING_CONVERTER },
    renderer: { converter: STRING_CONVERTER },
    trigger: { converter: STRING_CONVERTER },
    totals: { converter: BOOLEAN_CONVERTER },
    tooltipOrder: { converter: STRING_CONVERTER, attribute: 'tooltip-order' },
    palette: { converter: STRING_CONVERTER },
    pending: { converter: BOOLEAN_CONVERTER },
    animated: { converter: BOOLEAN_CONVERTER },
    locale: { converter: STRING_CONVERTER },
  }

  declare data?: readonly ChartRow[] | ColumnSource
  declare series?: readonly CartesianSeries[]
  declare xAxis?: CartesianAxis
  declare yAxis?: CartesianAxis
  declare hiddenSeries?: string[]
  declare defaultHiddenSeries?: string[]
  declare activeKey?: ChartKey | null
  declare translations?: Partial<CartesianChartTranslations>
  declare annotations?: readonly CartesianAnnotation[]
  declare window?: CartesianWindow
  declare defaultWindow?: CartesianWindow
  declare zoom?: CartesianZoom
  declare follow?: boolean
  declare defaultFollow?: boolean
  declare brush?: CartesianBrush
  declare brushSelection?: CartesianBrushSelection | null
  declare defaultBrushSelection?: CartesianBrushSelection | null
  declare orientation?: CartesianOrientation
  declare renderer?: CartesianRenderer
  declare trigger?: CartesianTrigger
  declare totals?: boolean
  declare tooltipOrder?: CartesianTooltipOrder
  declare palette?: ChartPalette
  declare pending?: boolean
  declare animated?: boolean
  declare locale?: string

  private readonly notifyHidden = (details: ChartHiddenSeriesChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('hidden-series-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyKey = (details: ChartActiveKeyChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('active-key-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyWindow = (details: CartesianWindowChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('window-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyFollow = (details: CartesianFollowChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('follow-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyBrush = (details: CartesianBrushSelectionChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('brush-selection-change', { detail: details, bubbles: true, composed: true }))
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
      renderer: this.renderer,
      trigger: this.trigger,
      totals: this.totals,
      tooltipOrder: this.tooltipOrder,
      palette: this.palette,
      annotations: this.annotations,
      zoom: this.zoom,
      window: this.window,
      defaultWindow: this.defaultWindow,
      follow: this.follow,
      defaultFollow: this.defaultFollow,
      brush: this.brush,
      brushSelection: this.brushSelection,
      defaultBrushSelection: this.defaultBrushSelection,
      hiddenSeries: this.hiddenSeries,
      defaultHiddenSeries: this.defaultHiddenSeries,
      activeKey: this.activeKey,
      pending: this.pending,
      animated: this.animated,
      locale: this.locale,
      translations: this.translations,
      onHiddenSeriesChange: this.notifyHidden,
      onActiveKeyChange: this.notifyKey,
      onWindowChange: this.notifyWindow,
      onFollowChange: this.notifyFollow,
      onBrushSelectionChange: this.notifyBrush,
      onDatumActive: this.notifyActive,
      onDatumPress: this.notifyPress,
    }
  }

  // onBuilt 在 ctrl 构造期就跑；取值口惰性读，角色节点要等首次 updated 才发现得到
  private injectRefs(svc: Service<CartesianChartSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
    svc.refs.set('getViewportEl', () => this.getPart('viewport'))
    svc.refs.set('getCanvasEl', () => this.#canvas)
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

  /** 数据表模型：与根里视觉隐藏的那张表同一份，要可见的表格视图时交给表格组件。 */
  get table(): CartesianChartApi['table'] {
    return this.api()?.table ?? { columns: [], rows: [] }
  }

  /** 此刻隐藏的系列。hiddenSeries 是作者递进来的受控值，非受控时读这里。 */
  get currentHiddenSeries(): string[] {
    return this.api()?.hiddenSeries ?? []
  }

  /** 数据层此刻画在哪：renderer 是作者递进来的写法，auto 解析的结果读这里。 */
  get currentRenderer(): 'svg' | 'canvas' {
    return this.api()?.renderer ?? 'svg'
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
  /** 画布模式下生成的画布；svg 模式为 null。 */
  #canvas: HTMLCanvasElement | null = null

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
      this.#paintLayers(plot, api)
      this.#paintPlot(plot, api.layers.plot, api)
    }

    const slider = put('zoom-slider', api.getZoomSliderProps() as Record<string, unknown>)
    if (slider)
      this.#paintZoomSlider(slider, api)

    const tooltip = put('tooltip', api.getTooltipProps() as Record<string, unknown>)
    if (tooltip)
      this.#paintTooltip(tooltip, api)

    const empty = put('empty', api.getEmptyProps() as Record<string, unknown>)
    if (empty)
      this.#paintOwnText(empty, api.emptyText)

    if (root)
      this.#paintA11y(root, api)
  }

  /**
   * 画布模式：绘图区前面依次是垫层 svg 与画布，都是生成节点，与绘图区同一个父节点；svg 模式撤掉。
   * 画布的后备尺寸由机器按视口与 DPR 设，这里只写部件属性。
   */
  #paintLayers(plot: Element, api: CartesianChartApi): void {
    const parent = plot.parentElement
    if (!parent)
      return
    const doc = plot.ownerDocument
    const own = generated(parent).filter(node => node.getAttribute(GEN_ATTR) === UNDERLAY || node.getAttribute(GEN_ATTR) === CANVAS)
    if (api.renderer !== 'canvas') {
      for (const node of own)
        node.remove()
      this.#canvas = null
      return
    }
    let underlay = own.find(node => node.getAttribute(GEN_ATTR) === UNDERLAY)
    let canvas = own.find(node => node.getAttribute(GEN_ATTR) === CANVAS) as HTMLCanvasElement | undefined
    if (!underlay) {
      underlay = doc.createElementNS(SVG_NS, 'svg')
      underlay.setAttribute(GEN_ATTR, UNDERLAY)
    }
    if (!canvas) {
      canvas = doc.createElement('canvas')
      canvas.setAttribute(GEN_ATTR, CANVAS)
    }
    if (underlay.nextElementSibling !== canvas || canvas.nextElementSibling !== plot) {
      parent.insertBefore(underlay, plot)
      parent.insertBefore(canvas, plot)
    }
    this.spreader.spread(underlay as HTMLElement, api.getUnderlayProps() as Record<string, unknown>)
    this.spreader.spread(canvas, api.getCanvasProps() as Record<string, unknown>)
    this.#paintMarks(underlay, api.layers.underlay, api)
    this.#canvas = canvas
  }

  /** 绘图区：纹理定义排在最前，其后是场景标记；两者同一次排序，重画时一起复用。 */
  #paintPlot(plot: Element, marks: readonly ChartMark[], api: CartesianChartApi): void {
    reconcile<ChartMark | null>(plot, [null, ...marks], this.#keys, mark => mark?.key ?? DEFS_KEY, (mark, reuse) =>
      mark == null ? this.#paintDefs(plot.ownerDocument, reuse, api) : this.#paintMark(plot.ownerDocument, mark, reuse, api))
  }

  /** 场景标记画成 SVG 图元：createElementNS 建节点，SVG 图元挂在非 SVG 命名空间下不会显示。 */
  #paintMarks(parent: Element, marks: readonly ChartMark[], api: CartesianChartApi): void {
    reconcile(parent, marks, this.#keys, mark => mark.key, (mark, reuse) => this.#paintMark(parent.ownerDocument, mark, reuse, api))
  }

  #paintMark(doc: Document, mark: ChartMark, reuse: Element | undefined, api: CartesianChartApi): Element {
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
  #paintDefs(doc: Document, reuse: Element | undefined, api: CartesianChartApi): Element {
    const defs = reuse?.localName === 'defs' ? reuse : doc.createElementNS(SVG_NS, 'defs')
    defs.setAttribute(GEN_ATTR, '')
    this.spreader.spread(defs as HTMLElement, api.getDefsProps() as Record<string, unknown>)
    // 纹理之后是缩放后的裁剪区：窗外的系列与注释按它裁掉
    const entries: (CartesianChartApi['patterns'][number] | null)[] = [...api.patterns, ...(api.clip ? [null] : [])]
    reconcile(defs, entries, this.#keys, pattern => pattern?.id ?? 'clip', (pattern, old) => {
      if (!pattern)
        return this.#paintClip(doc, old, api)
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

  /** 裁剪区：一个 clipPath 里一个矩形。 */
  #paintClip(doc: Document, reuse: Element | undefined, api: CartesianChartApi): Element {
    const node = reuse?.localName === 'clipPath' ? reuse : doc.createElementNS(SVG_NS, 'clipPath')
    node.setAttribute(GEN_ATTR, '')
    this.spreader.spread(node as HTMLElement, api.getClipPathProps() as Record<string, unknown>)
    let rect = generated(node)[0]
    if (!rect) {
      rect = doc.createElementNS(SVG_NS, 'rect')
      rect.setAttribute(GEN_ATTR, '')
      node.append(rect)
    }
    this.spreader.spread(rect as HTMLElement, api.getClipRectProps() as Record<string, unknown>)
    return node
  }

  /** 缩放条：轨道里一个窗口，窗口两端各一个手柄；作者只写外壳。 */
  #paintZoomSlider(slider: Element, api: CartesianChartApi): void {
    const doc = slider.ownerDocument
    let track = generated(slider)[0] as HTMLElement | undefined
    if (!track) {
      track = makeGen(doc, 'div')
      const win = makeGen(doc, 'div')
      win.append(makeGen(doc, 'span'), makeGen(doc, 'span'))
      // 缩略线跟在窗口后面：画在窗口的淡底之上、手柄之下；SVG 图元要在 SVG 命名空间里建
      const preview = doc.createElementNS(SVG_NS, 'svg')
      const line = doc.createElementNS(SVG_NS, 'path')
      preview.setAttribute(GEN_ATTR, '')
      line.setAttribute(GEN_ATTR, '')
      preview.append(line)
      track.append(win, preview)
      slider.append(track)
    }
    const [win, preview] = generated(track) as HTMLElement[]
    const [start, end] = generated(win!) as HTMLElement[]
    this.spreader.spread(track, api.getZoomTrackProps() as Record<string, unknown>)
    this.spreader.spread(win!, api.getZoomWindowProps() as Record<string, unknown>)
    this.spreader.spread(start!, api.getZoomHandleProps('start') as Record<string, unknown>)
    this.spreader.spread(end!, api.getZoomHandleProps('end') as Record<string, unknown>)
    this.spreader.spread(preview!, api.getZoomPreviewProps() as Record<string, unknown>)
    this.spreader.spread(generated(preview!)[0] as HTMLElement, api.getZoomPreviewLineProps() as Record<string, unknown>)
  }

  /** 图例项：一个系列一个按钮，色标与名字各一个 span；末尾是色阶，没有按值着色时收起，节点常在。 */
  #paintLegend(legend: Element, api: CartesianChartApi): void {
    const doc = legend.ownerDocument
    const entries: (CartesianLegendItem | null)[] = [...api.legendItems, null]
    reconcile(legend, entries, this.#keys, item => (item ? `item:${item.id}` : 'scale'), (item, reuse) => {
      if (!item)
        return this.#paintLegendScale(reuse ?? makeGen(doc, 'div'), api)
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

  /** 色阶：名字、低端的值、渐变条、高端的值。 */
  #paintLegendScale(node: Element, api: CartesianChartApi): Element {
    const doc = node.ownerDocument
    this.spreader.spread(node as HTMLElement, api.getLegendScaleProps() as Record<string, unknown>)
    const scale = api.legendScale
    if (!scale) {
      node.replaceChildren()
      return node
    }
    if (node.children.length !== 4)
      node.replaceChildren(...Array.from({ length: 4 }, () => doc.createElement('span')))
    const [name, min, bar, max] = Array.from(node.children) as HTMLElement[]
    this.spreader.spread(name!, api.getLegendScaleNameProps() as Record<string, unknown>)
    this.spreader.spread(min!, api.getLegendScaleValueProps('min') as Record<string, unknown>)
    this.spreader.spread(bar!, api.getLegendScaleBarProps() as Record<string, unknown>)
    this.spreader.spread(max!, api.getLegendScaleValueProps('max') as Record<string, unknown>)
    for (const [el, text] of [[name!, scale.name], [min!, scale.min], [max!, scale.max]] as const) {
      if (el.textContent !== text)
        el.textContent = text
    }
    return node
  }

  /** 提示框留空时写缺省内容：头部是自变量，每个系列一行（色标、数值、系列名）。 */
  #paintTooltip(tooltip: HTMLElement, api: CartesianChartApi): void {
    // 作者自己填了内容就归作者
    if (hasAuthorContent(tooltip))
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
    if (hasAuthorContent(host))
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
    // 表格按位置复用行与单元格，文字变了才写：流式追加时只有末尾几行在变，整张表不重建，读屏的浏览缓冲不被整个换掉
    let [caption, head, body] = [...table.children] as HTMLElement[]
    if (table.children.length !== 3 || !caption || !head || !body) {
      caption = doc.createElement('caption')
      head = doc.createElement('thead')
      body = doc.createElement('tbody')
      table.replaceChildren(caption, head, body)
    }
    if (caption.textContent !== api.tableCaption)
      caption.textContent = api.tableCaption
    syncTableRow(head.firstElementChild ?? head.appendChild(doc.createElement('tr')), api.table.columns.map(column => column.label), 'col')
    const rows = api.table.rows
    while (body.children.length > rows.length)
      body.lastElementChild!.remove()
    rows.forEach((row, i) => syncTableRow(body.children[i] ?? body.appendChild(doc.createElement('tr')), row.cells.map(cell => cell.text), 'row'))
  }
}
