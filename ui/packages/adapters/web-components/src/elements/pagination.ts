import type { PaginationApi, PaginationEllipsisSide, PaginationEntryRange, PaginationPage, PaginationPageChangeDetails, PaginationPageItem, PaginationSchema, PaginationTranslations } from '@xihan-ui/headless'
import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { OverlayExit } from '../overlay-exit'
import { connectPagination, paginationAnatomy, paginationMachine, paginationMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
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

/**
 * `<xh-pagination>` —— Light-DOM 行为宿主：作者写 root/prev-trigger/item/ellipsis/next-trigger
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
 * @csspart prev-trigger - 上一页；首页时转原生 disabled
 * @csspart next-trigger - 下一页；末页时转原生 disabled
 * @csspart item - 页码按钮，须自带 value 属性；当前页带 aria-current="page" 与 data-current
 * @csspart ellipsis - 折进去那几页的入口，须自带 side 属性（start / end）；承载 data-side 与 aria-expanded
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
    for (const el of this.getParts('ellipsis')) {
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
      branches: () => [...this.getParts('ellipsis'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
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
    const service = this.ctrl.service as Service<PaginationSchema> | undefined
    return service ? connectPagination(service, wcNormalize) : null
  }

  /**
   * 页码序列：页码与省略位交替的一串，作者照它渲染 item 与 ellipsis。
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
    const api = connectPagination(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
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
    for (const el of this.getParts('ellipsis')) {
      const side = (el.getAttribute('side') === 'end' ? 'end' : 'start') as PaginationEllipsisSide
      this.spreader.spread(el, api.getEllipsisProps({ side }) as Record<string, unknown>)
    }

    // positioner 的 style 是坐标对象，spreader 会逐条写成内联样式
    put('page-size-select', api.getPageSizeSelectProps() as Record<string, unknown>)
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

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    this.setPartHidden(this.getPart('content'), true)
    // 层由可见态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
