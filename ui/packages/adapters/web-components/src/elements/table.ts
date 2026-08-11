import type {
  TableColumnDef,
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
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

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
 * @attr {boolean} sticky-header - 表头吸顶，只落 data-sticky，钉住的实现归皮肤
 * @attr {boolean} footer - 表格带脚注行：行号空间的最后一行留给它，aria-rowcount 也算上
 * @attr {boolean} loop - 上下键走到首尾回绕，默认关；写 loop="true" 打开
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的展开/收起语义，默认 ltr
 * @attr {'sm'|'md'|'lg'} size - 密度：只换单元格的纵向内边距与字号，列宽不受影响
 * @fires sort-change - 排序链变化；detail 为 `{ value: { id, direction }[] }`
 * @fires selection-change - 选中集合变化；detail 为 `{ value: string[] | 'all' }`
 * @fires expanded-change - 展开集合变化；detail 为 `{ value: string[] }`
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
    loading: { type: Boolean },
    empty: { converter: BOOLEAN_CONVERTER },
    stickyHeader: { type: Boolean, attribute: 'sticky-header' },
    footer: { type: Boolean },
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
  declare loading?: boolean
  declare empty?: boolean
  declare stickyHeader?: boolean
  declare footer?: boolean
  declare loop?: boolean
  declare direction?: Direction
  declare size?: Size

  private readonly notifySort = (details: TableSortChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('sort-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelection = (details: TableSelectionChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('selection-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyExpanded = (details: TableExpandedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-change', { detail: details, bubbles: true, composed: true }))
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
      loading: this.loading ?? false,
      empty: this.empty,
      stickyHeader: this.stickyHeader ?? false,
      footer: this.footer ?? false,
      loop: this.loop,
      dir: this.direction,
      size: this.size,
      onSortChange: this.notifySort,
      onSelectionChange: this.notifySelection,
      onExpandedChange: this.notifyExpanded,
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
    putAll('expand-trigger', el => api.getExpandTriggerProps(this.rowOf(el)))
    putAll('expanded-row', el => api.getExpandedRowProps({ value: el.getAttribute('value') ?? '' }))

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
