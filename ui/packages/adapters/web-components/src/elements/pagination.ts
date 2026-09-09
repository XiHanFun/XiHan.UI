import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { PaginationApi, PaginationEllipsisSide, PaginationEntryRange, PaginationPage, PaginationPageChangeDetails, PaginationPageItem, PaginationSchema, PaginationTranslations, SelectApi, SelectSchema } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectPagination, paginationAnatomy, paginationMachine, paginationMeta, paginationPageSizeSelectProps, selectMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 数值属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// 空串也当缺席：`page=""` 经 Number() 会变成 0，那是个不存在的页。
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/** 页码按钮自报的页数；缺失或空串一律给 NaN（见 wire 里的说明）。 */
function itemPage(el: HTMLElement): number {
  const raw = el.getAttribute('value')
  return raw == null || raw === '' ? Number.NaN : Number(raw)
}

/** 内嵌下拉那套节点。作者只写 page-size-select 那一格，里头这些由元素自己建。 */
interface PageSizeNodes {
  root: HTMLElement
  control: HTMLElement
  trigger: HTMLElement
  valueText: HTMLElement
  indicator: HTMLElement
  positioner: HTMLElement
  content: HTMLElement
  list: HTMLElement
  /** 档位节点，按档位值索引：档位表变了只补差额，不整套重建。 */
  items: Map<string, { item: HTMLElement, text: HTMLElement, indicator: HTMLElement }>
}

/**
 * `<xh-pagination>` —— Light-DOM 行为宿主：作者写 root/prev-trigger/item/ellipsis-trigger/next-trigger
 * 角色节点，元素跑 pagination 机器并把 connect 产出打上去。
 *
 * root 必须是 `<nav>`：分页器是"跳到某一页"的导航地标，元素只往上打 aria-label，
 * 地标语义得由标签自己给。页码按钮须自带 `value` 属性标明是第几页。
 *
 * 页码序列（几号页、哪里该出省略号）由作者照 `pages` 渲染，元素不替作者生成节点：
 * 生成节点就等于收走模板控制权，外层 `<li>` 壳、图标、i18n 文案都再塞不进来。序列本身
 * 从元素上取（`pages` / `pageItems`），不必自己按当前页与总页数推一遍。
 *
 * 取数口是现算的，读到的恒是此刻那一份。什么时候重读：`page-change` 与 `page-size-change`
 * 两条事件覆盖了运行期会改动序列的全部输入，在它们的处理器里重读即可；改 `count` /
 * `sibling-count` 这类作者自己写的属性，写完当场重读，不必等事件。受控（写了 `page` 属性）时
 * 得先把新页码写回 `page` 再读——受控下当前页住在属性里，不写回读到的还是上一页那份序列。
 *
 * @customElement xh-pagination
 * @attr {number} count - 总条数（不是总页数）
 * @attr {number} page-size - 每页条数，默认 10
 * @attr {number} page - 受控页码；缺省该属性即非受控
 * @attr {number} default-page - 非受控初始页，默认 1
 * @attr {number} sibling-count - 当前页两侧各显示几页，默认 1
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响排版；上一页/下一页的语义不随之翻转
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires page-change - 页码变化；detail 为 `{ page: number, pageSize: number }`
 * @fires page-size-change - 每页条数变化；detail 为 `{ pageSize: number, page: number }`，页码是换算后的
 * @attr {string} placement - 省略位摊开后的落点，默认 bottom-start
 * @attr {number} offset - 浮层与省略位之间的间距（px），默认 8
 * @attr {number} open-delay - 指针停在省略位多久才摊开（ms），默认 200
 * @attr {number} close-delay - 指针离开后多久收起（ms），默认 300
 * @attr {number} default-page-size - 非受控初始每页条数，默认 10
 * @prop {number[]} pageSizeOptions - 可选的每页条数档位，默认 [10, 20, 50, 100]
 * @csspart root - nav 地标，承载 aria-label 与 data-empty
 * @csspart summary - 信息区容器；文本由作者放，缺省文案取 api.summaryText
 * @csspart jumper - 跳页输入框（input），敲页码按回车即跳
 * @csspart prev-trigger - 上一页；首页时转原生 disabled
 * @csspart next-trigger - 下一页；末页时转原生 disabled
 * @csspart item - 页码按钮，须自带 value 属性；当前页带 aria-current="page" 与 data-current
 * @csspart ellipsis-trigger - 折进去那几页的入口，须自带 side 属性（start / end）；承载 data-side 与 aria-expanded
 * @csspart page-size-select - 每页条数控制器的挂载点，写一个空 `<div>` 即可；里头那套下拉的角色节点由元素自己建
 */
export class XhPaginationElement extends XhElement {
  static override partContract = { anatomy: paginationAnatomy, meta: paginationMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    count: { converter: NUMBER_CONVERTER },
    pageSize: { converter: NUMBER_CONVERTER, attribute: 'page-size' },
    defaultPageSize: { converter: NUMBER_CONVERTER, attribute: 'default-page-size' },
    pageSizeOptions: { attribute: false },
    page: { converter: NUMBER_CONVERTER },
    defaultPage: { converter: NUMBER_CONVERTER, attribute: 'default-page' },
    siblingCount: { converter: NUMBER_CONVERTER, attribute: 'sibling-count' },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    openDelay: { converter: NUMBER_CONVERTER, attribute: 'open-delay' },
    closeDelay: { converter: NUMBER_CONVERTER, attribute: 'close-delay' },
  }

  declare count?: number
  declare pageSize?: number
  declare defaultPageSize?: number
  declare pageSizeOptions?: number[]
  declare page?: number
  declare defaultPage?: number
  declare siblingCount?: number
  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<PaginationTranslations>
  declare placement?: Placement
  declare offset?: number
  declare openDelay?: number
  declare closeDelay?: number

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly paginationScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着展开态走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notify = (details: PaginationPageChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('page-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyPageSize = (details: { pageSize: number, page: number }): void => {
    this.dispatchEvent(new CustomEvent('page-size-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<PaginationSchema>(
    this,
    paginationMachine,
    () => this.machineProps(),
    { scope: this.paginationScope, onBuilt: svc => this.injectRefs(svc) },
  )

  /**
   * 每页条数那个下拉：用的是库里的 select，不再是原生下拉。
   * props 从翻页机现读，故必须排在 ctrl 之后建。
   */
  private readonly pageSizeCtrl = new MachineController<SelectSchema>(
    this,
    selectMachine,
    () => paginationPageSizeSelectProps(this.ctrl.service as Service<PaginationSchema>),
    { scope: this.paginationScope, onBuilt: svc => this.injectPageSizeRefs(svc) },
  )

  /** 下拉那套节点；作者写的挂载点换了就整套重建。 */
  private pageSizeNodes: PageSizeNodes | null = null
  private pageSizeMount: HTMLElement | null = null
  /** 下拉浮层的退场闸门，与省略位那层各走各的。 */
  private pageSizeExit: OverlayExit | null = null

  /** 折叠页码列表的自绘条：与 content 同级挂在已经 fixed 的 positioner 上 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
  })

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.paginationScope, idGenerator: this.idGen })
  }

  /** 此刻摊开的是哪个省略位的节点——它是定位锚点。 */
  private openEllipsisEl(side: PaginationEllipsisSide | null): HTMLElement | null {
    if (!side)
      return null
    for (const el of this.getParts('ellipsis-trigger')) {
      if (el.getAttribute('data-side') === side)
        return el as HTMLElement
    }
    return null
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着可见态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 省略位记为本层分支：指针按在它上面算层内交互。
      // 浮层壳一并记上：页码列表之外还浮着自绘滚动条，按住它拖动不该把列表消解掉
      branches: () => [...this.getParts('ellipsis-trigger'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
  }

  // 下拉自己一层：触发器记为本层分支，点它算层内交互
  private readonly registerPageSizeLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.pageSizeNodes?.content ?? null,
      branches: () => [this.pageSizeNodes?.trigger].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
  }

  private injectPageSizeRefs(svc: Service<SelectSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerPageSizeLayer)
    svc.refs.set('position', createPositionEngine())
    svc.refs.set('getAnchorEl', () => this.pageSizeNodes?.trigger ?? null)
    svc.refs.set('getFloatingEl', () => this.pageSizeNodes?.positioner ?? null)
    svc.refs.set('getContentEl', () => this.pageSizeNodes?.content ?? null)
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  // 每次(重)建机器后都要重注：refs 属于机器实例，重连时的新机器不会继承旧的。
  private injectRefs(svc: Service<PaginationSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.openEllipsisEl(svc.context.get('openEllipsis')))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 角色节点提前发现一次：常规发现要等首次 updated，那一刻 partMap 还空着，
   * 引擎挂不上，浮层会停在容器左上角。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 取数口与命令共用的取法。机器要到进文档（hostConnected）才建，
   * 而这些都是公开面，作者拿到元素随时可能读、可能调——还没进文档时如实给空，不抛错。
   */
  private api(): PaginationApi | null {
    const root = this.ctrl.service as Service<PaginationSchema> | undefined
    const pageSizeSelect = this.pageSizeCtrl.service as Service<SelectSchema> | undefined
    return root && pageSizeSelect ? connectPagination({ root, pageSizeSelect }, wcNormalize) : null
  }

  /**
   * 页码序列：页码与省略位交替的一串，作者照它渲染 item 与 ellipsis-trigger。
   * 机器尚未建起时给空数组。
   */
  get pages(): PaginationPage[] {
    return this.api()?.pages ?? []
  }

  /**
   * 同一串序列，但省略位带着被折叠的是哪几页——摊开省略号照它铺面板。
   * 机器尚未建起时给空数组。
   */
  get pageItems(): PaginationPageItem[] {
    return this.api()?.pageItems ?? []
  }

  /**
   * 此刻显示的是第几页，已夹进合法区间（`page` 属性是受控入参，可能缺席或越界，这里是结果）。
   * 机器尚未建起时给 1：页码没有第 0 页，1 也正是无数据时的取值。
   */
  get currentPage(): number {
    return this.api()?.page ?? 1
  }

  /**
   * 此刻每页几条（`page-size` 属性缺席时非受控的那份住在机器里，只有这里读得到）。
   * 机器尚未建起时给 0。
   */
  get currentPageSize(): number {
    return this.api()?.pageSize ?? 0
  }

  /** 总页数，由总条数与每页条数算出。无数据是 0 页，不是 1 页空页。 */
  get totalPages(): number {
    return this.api()?.totalPages ?? 0
  }

  /** 当前页对应的条目区间，1 基闭区间（"第 x-y 条"里的 x 与 y）。无数据时两端都是 0。 */
  get pageRange(): PaginationEntryRange {
    return this.api()?.pageRange ?? { start: 0, end: 0 }
  }

  /**
   * 跳到某一页，越界页码夹回合法区间。
   * 受控（写了 `page` 属性）时只发 page-change，页码归宿主写回。机器尚未建起时不动。
   */
  setPage(page: number): void {
    this.api()?.setPage(page)
  }

  /**
   * 换每页条数：页码跟着换算，让改档前第一条仍留在页内。
   * 受控时语义同 setPage。机器尚未建起时不动。
   */
  setPageSize(pageSize: number): void {
    this.api()?.setPageSize(pageSize)
  }

  /** 按当前页从整份数据里切出这一页。机器尚未建起时给空数组。 */
  slice<V>(data: readonly V[]): V[] {
    return this.api()?.slice(data) ?? []
  }

  /** 收起摊开的那个省略位。机器尚未建起时不动。 */
  closeEllipsis(): void {
    this.api()?.closeEllipsis()
  }

  private machineProps(): Partial<PaginationSchema['props']> {
    return {
      count: this.count,
      pageSize: this.pageSize,
      defaultPageSize: this.defaultPageSize,
      pageSizeOptions: this.pageSizeOptions,
      page: this.page,
      defaultPage: this.defaultPage,
      siblingCount: this.siblingCount,
      dir: this.direction,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      placement: this.placement,
      offset: this.offset,
      openDelay: this.openDelay,
      closeDelay: this.closeDelay,
      onPageChange: this.notify,
      onPageSizeChange: this.notifyPageSize,
    }
  }

  protected wire(): void {
    const api = connectPagination(
      { root: this.ctrl.service, pageSizeSelect: this.pageSizeCtrl.service as Service<SelectSchema> },
      wcNormalize,
    )

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('summary', api.getSummaryProps() as Record<string, unknown>)
    put('jumper', api.getJumperProps() as Record<string, unknown>)
    put('prev-trigger', api.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.getNextTriggerProps() as Record<string, unknown>)

    // 页码是多实例 part，逐个打：身份取作者写的 value。
    // 漏写时给 NaN 而不是 Number(null) 的 0：NaN 与任何页都不相等，按钮点了会被机器
    // 夹回第 1 页，但绝不会冒充当前页；Vue 侧漏写 value 拿到的同样是 NaN，两侧一致。
    for (const el of this.getParts('item')) {
      const props = api.getItemProps({ page: itemPage(el) })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    // 省略位逐个打：身份取作者写的 side，缺省当 start。
    // 读的是作者写的 side 而不是元素自己回写的 data-side：后者是本元素的产出，
    // 拿产出当输入等于让第一帧（还没写过）与之后各帧的身份不一样
    for (const el of this.getParts('ellipsis-trigger')) {
      const side = (el.getAttribute('side') === 'end' ? 'end' : 'start') as PaginationEllipsisSide
      this.spreader.spread(el, api.getEllipsisTriggerProps({ side }) as Record<string, unknown>)
    }

    // positioner 的 style 是坐标对象，spreader 会逐条写成内联样式
    put('page-size-select', api.getPageSizeSelectProps() as Record<string, unknown>)
    this.wirePageSizeSelect(api.pageSizeSelect)
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // Light DOM 的 content 常驻，可见性由宿主自管：皮肤给 content 设了 display，
    // 会盖过 UA 的 [hidden]{display:none}；换别家样式同理，只有内联 style 压得住。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    const content = this.getPart('content')
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: api.openEllipsis != null,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(content)
    this.exit.update(api.openEllipsis != null)
    this.setPartHidden(content, !this.exit.visible)

    this.bars.wire()
  }

  /**
   * 内嵌下拉的角色节点由元素自己建：作者只写 page-size-select 那一格挂载点。
   *
   * 建出来的节点一律不打 data-xh-part——打了会被 discoverParts 收进 partMap，
   * 而它们归 select 的 scope 管，本就不在分页的解剖里。
   */
  private ensurePageSizeNodes(): PageSizeNodes | null {
    const mount = this.getPart('page-size-select')
    if (!mount)
      return null
    if (this.pageSizeMount === mount && this.pageSizeNodes)
      return this.pageSizeNodes

    if (this.pageSizeNodes)
      this.releasePageSizeNodes()

    const doc = this.ownerDocument
    const el = (tag: string): HTMLElement => doc.createElement(tag)
    const nodes: PageSizeNodes = {
      root: el('div'),
      control: el('div'),
      trigger: el('button'),
      valueText: el('span'),
      indicator: el('span'),
      positioner: el('div'),
      content: el('div'),
      list: el('div'),
      items: new Map(),
    }
    nodes.trigger.append(nodes.valueText, nodes.indicator)
    nodes.control.append(nodes.trigger)
    nodes.root.append(nodes.control)
    nodes.content.append(nodes.list)
    nodes.positioner.append(nodes.content)
    // 浮层留在挂载点里：它是 fixed，坐标由引擎给，摆在哪一层都不影响落位
    mount.append(nodes.root, nodes.positioner)

    this.pageSizeNodes = nodes
    this.pageSizeMount = mount
    // 本轮接线已经走过一半，新节点这一轮打不上：再催一轮
    this.requestUpdate()
    return nodes
  }

  private releasePageSizeNodes(): void {
    const nodes = this.pageSizeNodes
    if (!nodes)
      return
    for (const node of [nodes.root, nodes.control, nodes.trigger, nodes.valueText, nodes.indicator, nodes.positioner, nodes.content, nodes.list])
      this.spreader.release(node)
    for (const entry of nodes.items.values()) {
      this.spreader.release(entry.item)
      this.spreader.release(entry.text)
      this.spreader.release(entry.indicator)
    }
    nodes.root.remove()
    nodes.positioner.remove()
    this.pageSizeNodes = null
    this.pageSizeMount = null
  }

  /** 把内嵌下拉那份 api 打到自建的节点上；档位表变了只补差额。 */
  private wirePageSizeSelect(select: SelectApi): void {
    const nodes = this.ensurePageSizeNodes()
    if (!nodes)
      return

    this.spreader.spread(nodes.root, select.getRootProps() as Record<string, unknown>)
    this.spreader.spread(nodes.control, select.getControlProps() as Record<string, unknown>)
    this.spreader.spread(nodes.trigger, select.getTriggerProps() as Record<string, unknown>)
    this.spreader.spread(nodes.valueText, select.getValueTextProps() as Record<string, unknown>)
    nodes.valueText.textContent = select.displayText
    this.spreader.spread(nodes.indicator, select.getIndicatorProps() as Record<string, unknown>)
    this.spreader.spread(nodes.positioner, select.getPositionerProps() as Record<string, unknown>)
    this.spreader.spread(nodes.content, select.getContentProps() as Record<string, unknown>)
    this.spreader.spread(nodes.list, select.getListProps() as Record<string, unknown>)

    const alive = new Set<string>()
    for (const option of select.collection) {
      alive.add(option.value)
      let entry = nodes.items.get(option.value)
      if (!entry) {
        const doc = this.ownerDocument
        entry = { item: doc.createElement('div'), text: doc.createElement('span'), indicator: doc.createElement('span') }
        entry.item.append(entry.text, entry.indicator)
        nodes.list.append(entry.item)
        nodes.items.set(option.value, entry)
      }
      this.spreader.spread(entry.item, select.getItemProps({ value: option.value }) as Record<string, unknown>)
      this.spreader.spread(entry.text, select.getItemTextProps({ value: option.value }) as Record<string, unknown>)
      entry.text.textContent = option.label
      this.spreader.spread(entry.indicator, select.getItemIndicatorProps({ value: option.value }) as Record<string, unknown>)
    }
    for (const [value, entry] of nodes.items) {
      if (alive.has(value))
        continue
      this.spreader.release(entry.item)
      this.spreader.release(entry.text)
      this.spreader.release(entry.indicator)
      entry.item.remove()
      nodes.items.delete(value)
    }

    // 与省略位那层同一套：收起押后到退场播完，皮肤给 content 设了 display，只有内联 style 压得住
    this.ensureConfig()
    this.pageSizeExit ??= createOverlayExit({
      config: this.config!,
      open: select.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.pageSizeExit.track(nodes.content)
    this.pageSizeExit.update(select.open)
    // 直接写而不走 setPartHidden：那条路是为作者写的角色节点留的，要护住作者自己的内联
    // display；这颗是元素建的，没有作者的那一份，也没有「标签已在、类未到」那段升级前空窗
    nodes.content.style.display = this.pageSizeExit.visible ? '' : 'none'
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.pageSizeExit?.dispose()
    this.pageSizeExit = null
    this.releasePageSizeNodes()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    this.setPartHidden(this.getPart('content'), true)
    // 层由可见态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
