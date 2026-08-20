import type { MasonryColumns, MasonryProps } from '@xihan-ui/headless'
import { connectMasonry, distributeMasonry, masonryAnatomy, masonryMeta, resolveMasonryColumns } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/** 断点对象形态的列数，从 MasonryColumns 上取，不在这里另抄一份档位清单。 */
type ColumnsByBreakpoint = Exclude<MasonryColumns, number>

// 属性缺席翻成 undefined，缺省值由 connect 与落格算法决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 布尔三态：缺席 = undefined（用默认值），="false" = false，其余 = true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * 列数写整数就是各档同一个列数（`columns="3"`），写 JSON 对象就是逐档的列数
 * （`columns='{"base":1,"md":3}'`）。解析不出对象时当没写：落一个半截对象进去，
 * 缺的那几档会安静地退回缺省列数，而作者看不出是哪里写坏了。
 */
const COLUMNS_CONVERTER = {
  fromAttribute: (v: string | null) => {
    if (v === null)
      return undefined
    if (!v.trimStart().startsWith('{'))
      return Number(v)
    try {
      const parsed: unknown = JSON.parse(v)
      return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as ColumnsByBreakpoint)
        : undefined
    }
    catch {
      return undefined
    }
  },
}

/**
 * `<xh-masonry>` —— Light-DOM 行为宿主，无状态机。作者写一个 root、若干 column 空容器，
 * 以及一批 item；元素量出容器宽度与每一项的高度，算出各项落在第几列，再把项搬进对应的列里。
 *
 * 列由作者写，因为元素不生成结构：请按最宽那一档需要的列数写足 column 节点，
 * 当前档位用不上的那几列会被收起。项写在 root 里即可，写在哪儿都会被搬进列里，
 * 所以 column 节点必须是空容器，别在里面另放内容。
 *
 * 项的先后取「首次见到的顺序」——静态标记就是作者写的顺序；运行期新增的项排在末尾，
 * 需要精确插到中间时请整块重建这批项。
 *
 * 浏览器没有 ResizeObserver 时只在每次接线那一刻量，之后不再跟随尺寸变化。
 *
 * @customElement xh-masonry
 * @attr {number|string} columns - 分几列，不写按三列；写 JSON 对象则逐档给列数（base / sm / md / lg / xl），按容器自身宽度换档
 * @attr {'xs'|'sm'|'md'|'lg'|'xl'} gap - 列与列、项与项之间的间距档位，逐档对应一个间距令牌
 * @attr {boolean} sequential - 按文档序逐列填，不写则最短列优先
 * @csspart root - 排布容器，承载 data-gap / data-sequential
 * @csspart column - 一列，承载 data-index；须是空容器，项由元素搬进来
 * @csspart item - 一项，承载 data-index（作者写的原序）与 data-column（落在第几列）
 */
export class XhMasonryElement extends XhElement {
  static override partContract = { anatomy: masonryAnatomy, meta: masonryMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    columns: { converter: COLUMNS_CONVERTER },
    gap: { converter: STRING_CONVERTER },
    sequential: { converter: BOOLEAN_CONVERTER },
  }

  declare columns?: MasonryColumns
  declare gap?: MasonryProps['gap']
  declare sequential?: boolean

  /** 每一项首次被看到时的序号，重排后 DOM 序等于列序，原序只剩它认得出来。 */
  private readonly seen = new WeakMap<HTMLElement, number>()
  private nextSeq = 0

  private observer: ResizeObserver | null = null
  /** 当前挂着尺寸观察器的节点，与新一轮比对后才决定要不要重挂。 */
  private observed: readonly HTMLElement[] = []

  override connectedCallback(): void {
    super.connectedCallback()
    const win = this.ownerDocument.defaultView
    // 无布局环境没有 ResizeObserver：只在每次接线那一刻量，之后不跟随尺寸变化
    if (!this.observer && win && typeof win.ResizeObserver === 'function')
      this.observer = new win.ResizeObserver(() => this.requestUpdate())
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.observer?.disconnect()
    this.observer = null
    this.observed = []
  }

  /** 按首次见到的先后排好当前在场的项。 */
  private orderedItems(): HTMLElement[] {
    const items = this.getParts('item')
    for (const el of items) {
      if (!this.seen.has(el))
        this.seen.set(el, this.nextSeq++)
    }
    return [...items].sort((a, b) => this.seen.get(a)! - this.seen.get(b)!)
  }

  /** 把项按落格结果搬进各列。位置已经对的节点原地不动，免得每次接线都产生一堆变更记录。 */
  private place(columns: readonly HTMLElement[], items: readonly HTMLElement[], assign: readonly number[]): void {
    const cursors = columns.map(() => 0)
    items.forEach((el, index) => {
      const which = assign[index]
      if (which == null)
        return
      const column = columns[which]
      if (!column)
        return
      const at = cursors[which]!
      if (column.children[at] !== el)
        column.insertBefore(el, column.children[at] ?? null)
      cursors[which] = at + 1
    })
  }

  /** 把尺寸观察器挂到这一批节点上。节点没变就不重挂：重挂会白白多跑一轮回调。 */
  private observeSizes(nodes: readonly HTMLElement[]): void {
    if (!this.observer)
      return
    const changed = nodes.length !== this.observed.length || nodes.some((el, i) => el !== this.observed[i])
    if (!changed)
      return
    this.observer.disconnect()
    for (const el of nodes) this.observer.observe(el)
    this.observed = [...nodes]
  }

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    const columnEls = this.getParts('column')
    // 读响应式 property，不回读 DOM 特性
    const api = connectMasonry({
      columns: this.columns,
      gap: this.gap,
      sequential: this.sequential,
    } satisfies MasonryProps, wcNormalize)
    this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
    if (!columnEls.length)
      return

    // 作者写的列数是上限：元素不生成结构，档位要更多列时也只能用手上这几个
    const columnCount = Math.min(
      columnEls.length,
      resolveMasonryColumns(this.columns, root.getBoundingClientRect().width),
    )
    const items = this.orderedItems()
    // 项已经在列里时，搬到另一列不改它的宽度，量到的高度对搬动前后都成立。
    // 头一回接线时项还堆在 root 上，量到的是按内容宽度撑出来的高度；搬进列后尺寸变了，
    // 尺寸观察器会再拉一轮接线，那一轮量到的才是最终版面。
    const heights = items.map(el => el.getBoundingClientRect().height)
    const assign = distributeMasonry(heights, columnCount, this.sequential ?? false)

    this.getParts('column').forEach((el, index) => {
      this.spreader.spread(el, api.getColumnProps({ index }) as Record<string, unknown>)
      // 当前档位用不上的那几列收起来，否则空列照样等分掉一份宽度
      this.setPartHidden(el, index >= columnCount)
    })
    items.forEach((el, index) => {
      this.spreader.spread(el, api.getItemProps({ index, column: assign[index]! }) as Record<string, unknown>)
    })

    this.place(columnEls.slice(0, columnCount), items, assign)
    this.observeSizes([root, ...items])
  }
}
