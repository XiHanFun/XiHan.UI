import type {
  TableColumnDef,
  TableColumnKind,
  TableColumnPreference,
  TableColumnProps,
  TableExpandedChangeDetails,
  TableRowDef,
  TableRowProps,
  TableSchema,
  TableSelection,
  TableSelectionChangeDetails,
  TableSelectionMode,
  TableSortChangeDetails,
  TableSortDescriptor,
} from '@xihan-ui/headless'
import type { Direction, Size } from '@xihan-ui/kernel'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectTable, tableAnatomy, tableMachine, tableMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 数值属性：属性缺席即 undefined，缺省值的唯一事实源留在 connect
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 行换位事件的 detail：从机器 props 上的回调取，不在适配器里另抄一份类型。 */
type TableRowMoveDetails = Parameters<NonNullable<TableSchema['props']['onRowMove']>>[0]

/** 行系部件的归属容器：行内的把手与单元格向上找最近的那一行。 */
const ROW_SELECTOR = '[data-xh-part="row"]'
/** 列系部件的归属容器：排序把手向上找最近的那个列标题。 */
const COLUMN_HEADER_SELECTOR = '[data-xh-part="column-header"]'
const HEADER_SELECTOR = '[data-xh-part="header"]'
const FOOTER_SELECTOR = '[data-xh-part="footer"]'

/**
 * `<xh-table>` —— Light-DOM 行为宿主：作者写 root/caption/header/body/footer 与若干
 * row / column-header / cell 角色节点，元素跑 table 机器并把 connect 产出打上去。
 * 身份取自节点上的 value 属性：行系部件上是行 id，列系部件上是列 id。
 *
 * 行号（aria-rowindex / aria-rowcount）与列号（aria-colindex / aria-colcount）查 `rows` 与
 * `columns` 两份定义，不从 DOM 反推，故两份定义必须与标记同源。
 *
 * 同一个 row 部件写在 header / body / footer 里语义不同（表头行、数据行、脚注行），
 * 元素按祖先链现查区段，作者无需换用别的部件名。
 *
 * 两份定义与三个集合都是数组/对象，只走 property（`el.rows = [...]`）。
 *
 * @customElement xh-table
 * @attr {'none'|'single'|'multiple'} selection-mode - 选择模式，默认 none（不声明就没有选择这回事）
 * @attr {boolean} loading - 数据在路上：root 报 aria-busy，表体为空时加载态节点显形
 * @attr {boolean} empty - 显式声明表体为空；缺省按 rows 是否为空推导，写 empty="false" 强制不空
 * @attr {boolean} sticky-header - 表头吸顶，只落 data-sticky（布尔）；列冻结另走 data-frozen
 * @attr {boolean} striped - 斑马纹：表体偶数行换一层浅底
 * @attr {boolean} borderless - 去掉外框，只留行间横线
 * @attr {boolean} ruled - 列与列之间加竖分隔线
 * @attr {boolean} footer - 表格带脚注行：行号空间的最后一行留给它，aria-rowcount 也算上
 * @attr {boolean} row-reorderable - 行可以拖着换位：整行都是拖动源，不另出把手
 * @attr {boolean} loop - 上下键走到首尾回绕，默认关；写 loop="true" 打开
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的展开/收起语义，默认 ltr
 * @attr {'sm'|'md'|'lg'} size - 密度：只换单元格的纵向内边距与字号，列宽不受影响
 * @fires sort-change - 排序链变化；detail 为 `{ value: { id, direction }[] }`
 * @fires column-preference-change - 列偏好变化；detail 为 `{ value: TableColumnPreference }`
 * @prop {TableColumnPreference} columnPreference - 列偏好（显隐/顺序/宽/冻结），给定即受控
 * @prop {TableColumnKind[]} prefixColumns - 要哪几列前缀列，按给定顺序插在最前面
 * @fires selection-change - 选中集合变化；detail 为 `{ value: string[] | 'all' }`
 * @fires expanded-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @fires row-move - 行换了位置；detail 为 `{ id, from, to, ids }`，ids 是重排好的整份可见数据行序
 * @csspart root - role=grid 容器（rows 里有可展开的行时为 treegrid），报行列总数与多选声明
 * @csspart caption - 表格标题（aria-labelledby 目标）
 * @csspart header - role=rowgroup 表头区
 * @csspart body - role=rowgroup 表体区，键盘在此收口，也是行级 roving 的兜底 Tab 位
 * @csspart footer - role=rowgroup 脚注区
 * @csspart row - role=row；写在 body 里的须自带 value 属性标识行身份
 * @csspart column-header - role=columnheader，须自带 value 属性标识列身份；承载 aria-sort
 * @csspart cell - role=gridcell，须自带 value 属性标识列身份；可写 colspan 属性声明跨列数
 * @csspart select-all-trigger - 全选把手，三态（aria-checked 半选为 mixed），自占一个 Tab 位
 * @csspart row-select-trigger - 行选择把手（aria-hidden 且不占 Tab 位，键盘那一路由 Space 承担）
 * @csspart sort-trigger - 排序把手，自占一个 Tab 位；按住 Shift 点是追加到排序链
 * @csspart column-resize-trigger - 列宽把手，自占一个 Tab 位；方向键改一步、按住 Shift 是大步
 * @csspart column-drag-trigger - 列拖拽把手，自占一个 Tab 位；方向键移一位、Home/End 移到可拖区段首末
 * @csspart live-region - 视觉隐藏的播报区，列拖拽过程的读屏文案写在这里；须写在 root 之外（root 是 role=grid，它的子节点只能是 row 与 rowgroup）
 * @csspart expand-trigger - 展开把手（aria-hidden 且不占 Tab 位，键盘那一路由左右方向键承担）
 * @csspart expanded-row - role=row 详情行，须自带 value 属性与它所属的数据行配对，内部须放一个 cell 承载详情；收起时 hidden
 * @csspart empty - 空态节点，表体为空且不在加载时显形
 * @csspart loading-state - 加载态节点，表体为空且正在加载时显形
 */
export class XhTableElement extends XhElement {
  static override partContract = { anatomy: tableAnatomy, meta: tableMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    columns: { attribute: false },
    rows: { attribute: false },
    sort: { attribute: false },
    defaultSort: { attribute: false },
    selection: { attribute: false },
    defaultSelection: { attribute: false },
    expanded: { attribute: false },
    defaultExpanded: { attribute: false },
    selectionMode: { converter: STRING_CONVERTER, attribute: 'selection-mode' },
    // 前缀列是数组，走不了属性；只作为 property 暴露
    prefixColumns: { attribute: false },
    // 列偏好是对象，走不了属性；只作为 property 暴露
    columnPreference: { attribute: false },
    defaultColumnPreference: { attribute: false },
    page: { converter: NUMBER_CONVERTER },
    pageSize: { converter: NUMBER_CONVERTER, attribute: 'page-size' },
    loading: { type: Boolean },
    empty: { converter: BOOLEAN_CONVERTER },
    stickyHeader: { type: Boolean, attribute: 'sticky-header' },
    striped: { type: Boolean },
    borderless: { type: Boolean },
    ruled: { type: Boolean },
    footer: { type: Boolean },
    rowReorderable: { type: Boolean, attribute: 'row-reorderable' },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    size: { converter: STRING_CONVERTER },
  }

  declare columns?: TableColumnDef[]
  declare rows?: TableRowDef[]
  declare sort?: TableSortDescriptor[]
  declare defaultSort?: TableSortDescriptor[]
  declare selection?: TableSelection
  declare defaultSelection?: TableSelection
  declare expanded?: string[]
  declare defaultExpanded?: string[]
  declare selectionMode?: TableSelectionMode
  declare prefixColumns?: TableColumnKind[]
  declare columnPreference?: TableColumnPreference
  declare defaultColumnPreference?: TableColumnPreference
  declare page?: number
  declare pageSize?: number
  declare loading?: boolean
  declare empty?: boolean
  declare stickyHeader?: boolean
  declare striped?: boolean
  declare borderless?: boolean
  declare ruled?: boolean
  declare footer?: boolean
  declare rowReorderable?: boolean
  declare loop?: boolean
  declare direction?: Direction
  declare size?: Size

  private readonly notifyColumnPreference = (details: { value: TableColumnPreference }): void => {
    this.dispatchEvent(new CustomEvent('column-preference-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySort = (details: TableSortChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('sort-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelection = (details: TableSelectionChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('selection-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyExpanded = (details: TableExpandedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyRowMove = (details: TableRowMoveDetails): void => {
    this.dispatchEvent(new CustomEvent('row-move', { detail: details, bubbles: true, composed: true }))
  }

  // table 机器无副作用，controller 只带 props。
  private readonly ctrl = new MachineController<TableSchema>(this, tableMachine, () => this.machineProps())

  private machineProps(): Partial<TableSchema['props']> {
    return {
      columns: this.columns,
      rows: this.rows,
      sort: this.sort,
      // 不补 []，缺省由机器兜
      defaultSort: this.defaultSort,
      selection: this.selection,
      defaultSelection: this.defaultSelection,
      expanded: this.expanded,
      defaultExpanded: this.defaultExpanded,
      selectionMode: this.selectionMode,
      prefixColumns: this.prefixColumns,
      columnPreference: this.columnPreference,
      defaultColumnPreference: this.defaultColumnPreference,
      onColumnPreferenceChange: this.notifyColumnPreference,
      page: this.page,
      pageSize: this.pageSize,
      loading: this.loading ?? false,
      empty: this.empty,
      stickyHeader: this.stickyHeader ?? false,
      striped: this.striped ?? false,
      borderless: this.borderless ?? false,
      ruled: this.ruled ?? false,
      footer: this.footer ?? false,
      rowReorderable: this.rowReorderable ?? false,
      loop: this.loop,
      dir: this.direction,
      size: this.size,
      onSortChange: this.notifySort,
      onSelectionChange: this.notifySelection,
      onExpandedChange: this.notifyExpanded,
      onRowMove: this.notifyRowMove,
    }
  }

  /** 承载焦点的行被移出 DOM 时上报 TABLE.BLUR，让机器重挑焦点锚点。 */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 机器已停机则跳过
    if (getStatus() !== 'Started')
      return
    const focusedRow = context.get('focusedRow')
    if (focusedRow == null)
      return
    // data-value 只写在数据行与列头上，且只有持有锚点的那一行离场才报
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedRow))
      send({ type: 'TABLE.BLUR' })
  }

  /**
   * 取角色节点自报的身份：行系部件上是行 id，列系部件上是列 id。
   * 行内的把手与装饰节点向上找本宿主内最近的容器，没有则读节点自身。
   */
  private identityOf(el: HTMLElement, selector: string): string {
    const owner = el.closest<HTMLElement>(selector)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return source.getAttribute('value') ?? ''
  }

  private rowOf(el: HTMLElement): TableRowProps {
    return { value: this.identityOf(el, ROW_SELECTOR) }
  }

  private columnOf(el: HTMLElement): TableColumnProps {
    return { value: this.identityOf(el, COLUMN_HEADER_SELECTOR) }
  }

  /**
   * 播报区节点。第一次用时建出来挂在元素末尾，之后一直复用——
   * 读屏不播报后插入的节点，等到拾起才建等于没有。
   */
  private ensureLiveRegion(): HTMLElement {
    const existing = this.querySelector<HTMLElement>(`:scope > [data-xh-part="live-region"]`)
    if (existing)
      return existing
    const el = this.ownerDocument.createElement('div')
    el.setAttribute('data-xh-part', 'live-region')
    this.append(el)
    return el
  }

  /** 按祖先链现查行所在的区段。 */
  private sectionOf(el: HTMLElement): 'header' | 'body' | 'footer' {
    const header = el.closest<HTMLElement>(HEADER_SELECTOR)
    if (header && this.contains(header))
      return 'header'
    const footer = el.closest<HTMLElement>(FOOTER_SELECTOR)
    if (footer && this.contains(footer))
      return 'footer'
    return 'body'
  }

  protected wire(): void {
    const api = connectTable(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('caption', api.getCaptionProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('body', api.getBodyProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
    // 两个状态节点的显隐直接读连接层给的 hidden
    const emptyProps = api.getEmptyProps() as Record<string, unknown>
    const loadingProps = api.getLoadingStateProps() as Record<string, unknown>
    put('empty', emptyProps)
    put('loading-state', loadingProps)

    // 集合类 part 逐个 spread，身份由节点自报，不依赖下标。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供连接层现查。
    const putAll = (name: string, get: (el: HTMLElement) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(el) as Record<string, unknown>)
    }
    putAll('row', (el) => {
      const section = this.sectionOf(el)
      if (section === 'header')
        return api.getHeaderRowProps()
      if (section === 'footer')
        return api.getFooterRowProps()
      return api.getRowProps(this.rowOf(el))
    })
    putAll('column-header', el => api.getColumnHeaderProps(this.columnOf(el)))
    // 单元格自报列身份，行身份跟着所在行走；表头与脚注的格子没有行可跟
    putAll('cell', (el) => {
      const row = el.closest<HTMLElement>(ROW_SELECTOR)
      const inBody = !!row && this.contains(row) && this.sectionOf(el) === 'body'
      const colspan = el.getAttribute('colspan')
      return api.getCellProps({
        value: el.getAttribute('value') ?? '',
        row: inBody ? (row.getAttribute('value') ?? '') : undefined,
        colSpan: colspan == null ? undefined : Number(colspan),
      })
    })
    putAll('select-all-trigger', () => api.getSelectAllTriggerProps())
    putAll('row-select-trigger', el => api.getRowSelectTriggerProps(this.rowOf(el)))
    putAll('sort-trigger', el => api.getSortTriggerProps(this.columnOf(el)))
    putAll('column-resize-trigger', el => api.getColumnResizeTriggerProps(this.columnOf(el)))
    putAll('column-drag-trigger', el => api.getColumnDragTriggerProps(this.columnOf(el)))
    putAll('expand-trigger', el => api.getExpandTriggerProps(this.rowOf(el)))
    putAll('expanded-row', el => api.getExpandedRowProps({ value: el.getAttribute('value') ?? '' }))

    // 播报区由元素自己挂，不收作者写的：它必须落在 root 之外
    // （root 是 role=grid，塞活动区域进去是 aria-required-children），
    // 而作者是把整棵子树写在元素里的，位置由不得约束。挂在元素自己身上两个条件都满足。
    const live = this.ensureLiveRegion()
    this.spreader.spread(live, api.getLiveRegionProps() as Record<string, unknown>)
    // 播报文案由元素写，不经属性铺开：它是文本内容不是属性
    live.textContent = this.ctrl.service.context.get('announcement')

    // 行的禁用只认 rows 里的声明并归一到 aria-disabled，摘掉作者写在行上的原生 disabled
    for (const el of this.getParts('row')) {
      if (el.hasAttribute('disabled'))
        el.removeAttribute('disabled')
    }

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    for (const el of this.getParts('expanded-row'))
      this.setPartHidden(el, !api.isExpanded(el.getAttribute('value') ?? ''))
    this.setPartHidden(this.getPart('empty'), !!emptyProps.hidden)
    this.setPartHidden(this.getPart('loading-state'), !!loadingProps.hidden)
  }
}
