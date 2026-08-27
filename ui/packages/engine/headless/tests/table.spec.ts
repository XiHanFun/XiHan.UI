// @vitest-environment jsdom
import type { TableApi, TableColumnDef, TableRowDef, TableSchema } from '../src/table'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  connectTable,
  flattenTableRows,
  tableMachine,
  tableNormalizeSort,
  tableRowSelected,
  tableSelectableRowIds,
  tableSelectionIds,
  tableSelectionState,
  tableSortDirectionOf,
  tableSortIndexOf,
  tableToggleRowSelection,
  tableToggleSelectAll,
  tableToggleSort,
} from '../src/table'

type Props = TableSchema['props']

/**
 * 三列：select 只放把手（没有它，选择那一格算不出列号，右边两列的列号会整体串位）；
 * name 可排序且横向吸附；size 可排序并给了字符串列宽。
 */
const COLUMNS: TableColumnDef[] = [
  { id: 'select', label: 'Select', width: 40 },
  { id: 'name', label: 'Name', sortable: true, sticky: true },
  { id: 'size', label: 'Size', sortable: true, width: '8rem' },
]

/**
 * 四行：a/d 可展开，b 是普通行，c 禁用且可展开
 * （方向键跳过它、选不动也展不开，但它仍可聚焦、仍是导航起点，也不算进全选基数）。
 */
const ROWS: TableRowDef[] = [
  { id: 'a', expandable: true },
  { id: 'b' },
  { id: 'c', disabled: true, expandable: true },
  { id: 'd', expandable: true },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，style 对象逐条写内联，
 * 其余落属性）。有它才跑得到真实事件流——纯粹比对 connect 的返回值只能验静态属性，
 * 「按键落到哪一行上」这类事实必须有活 DOM 才立得住。
 */
function spread(el: HTMLElement, props: Record<string, unknown>): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z') {
      const type = key.slice(2).toLowerCase()
      const map = listeners.get(el) ?? new Map<string, EventListener>()
      listeners.set(el, map)
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      if (typeof raw === 'function') {
        el.addEventListener(type, raw as EventListener)
        map.set(type, raw as EventListener)
      }
      continue
    }
    if (key === 'style' && raw !== null && typeof raw === 'object') {
      Object.assign(el.style, raw as Record<string, string>)
      continue
    }
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, String(raw))
  }
}

interface RowEls {
  row: HTMLElement
  selectTrigger: HTMLElement
  expandTrigger: HTMLElement
  cells: Record<string, HTMLElement>
  expandedRow: HTMLElement
}

interface Harness {
  api: () => TableApi
  root: HTMLElement
  caption: HTMLElement
  header: HTMLElement
  headerRow: HTMLElement
  body: HTMLElement
  footerRow: HTMLElement
  selectAll: HTMLElement
  columnHeader: (id: string) => HTMLElement
  sortTrigger: (id: string) => HTMLElement
  row: (id: string) => RowEls
  emptyState: HTMLElement
  loadingState: HTMLElement
  setProps: (next: Partial<Props>) => void
  sort: () => TableSchema['context']['sort']
  selection: () => TableSchema['context']['selection']
  expanded: () => string[]
}

function mount(initial: Partial<Props> = {}): Harness {
  const props: Partial<Props> = { columns: COLUMNS, rows: ROWS, ...initial }
  // 作者标记镜像的是机器手上的那两份定义：不同源的话，摊平算出来的可见行在 DOM 里
  // 一个也找不到，用例会假绿
  const columns = props.columns!
  const rows = props.rows!
  const runtime = createVanillaRuntime()
  const service = createService(tableMachine, { props: () => props, runtime })
  runtime.start()

  const doc = document
  const make = (tag = 'div'): HTMLElement => doc.createElement(tag)

  const root = make()
  const caption = make('span')
  caption.textContent = '文件列表'
  const header = make()
  const headerRow = make()
  const body = make()
  const footer = make()
  const footerRow = make()
  const emptyState = make()
  const loadingState = make()

  const columnHeaders = new Map<string, HTMLElement>()
  const sortTriggers = new Map<string, HTMLElement>()
  const selectAll = make('span')
  for (const column of columns) {
    const cell = make()
    columnHeaders.set(column.id, cell)
    if (column.id === 'select') {
      cell.appendChild(selectAll)
    }
    else {
      const trigger = make('span')
      trigger.textContent = column.label ?? column.id
      sortTriggers.set(column.id, trigger)
      cell.appendChild(trigger)
    }
    headerRow.appendChild(cell)
  }
  header.appendChild(headerRow)

  const rowEls = new Map<string, RowEls>()
  for (const row of rows) {
    const rowEl = make()
    const cells: Record<string, HTMLElement> = {}
    const selectTrigger = make('span')
    const expandTrigger = make('span')
    for (const column of columns) {
      const cell = make()
      cells[column.id] = cell
      if (column.id === 'select')
        cell.append(expandTrigger, selectTrigger)
      else
        cell.textContent = `${row.id}-${column.id}`
      rowEl.appendChild(cell)
    }
    const expandedRow = make()
    expandedRow.textContent = `${row.id} 详情`
    body.append(rowEl, expandedRow)
    rowEls.set(row.id, { row: rowEl, selectTrigger, expandTrigger, cells, expandedRow })
  }

  const footerCells = new Map<string, HTMLElement>()
  for (const column of columns) {
    const cell = make()
    footerCells.set(column.id, cell)
    footerRow.appendChild(cell)
  }
  footer.appendChild(footerRow)

  root.append(caption, header, body, footer, emptyState, loadingState)
  doc.body.appendChild(root)

  const render = (): void => {
    const api = connectTable(service, normalizeProps)
    spread(root, api.getRootProps() as Record<string, unknown>)
    spread(caption, api.getCaptionProps() as Record<string, unknown>)
    spread(header, api.getHeaderProps() as Record<string, unknown>)
    spread(headerRow, api.getHeaderRowProps() as Record<string, unknown>)
    spread(body, api.getBodyProps() as Record<string, unknown>)
    spread(footer, api.getFooterProps() as Record<string, unknown>)
    spread(footerRow, api.getFooterRowProps() as Record<string, unknown>)
    spread(selectAll, api.getSelectAllTriggerProps() as Record<string, unknown>)
    for (const [id, el] of columnHeaders)
      spread(el, api.getColumnHeaderProps({ value: id }) as Record<string, unknown>)
    for (const [id, el] of sortTriggers)
      spread(el, api.getSortTriggerProps({ value: id }) as Record<string, unknown>)
    for (const [id, el] of footerCells)
      spread(el, api.getCellProps({ value: id }) as Record<string, unknown>)
    for (const [id, els] of rowEls) {
      spread(els.row, api.getRowProps({ value: id }) as Record<string, unknown>)
      spread(els.selectTrigger, api.getRowSelectTriggerProps({ value: id }) as Record<string, unknown>)
      spread(els.expandTrigger, api.getExpandTriggerProps({ value: id }) as Record<string, unknown>)
      spread(els.expandedRow, api.getExpandedRowProps({ value: id }) as Record<string, unknown>)
      for (const column of columns)
        spread(els.cells[column.id]!, api.getCellProps({ value: column.id, row: id }) as Record<string, unknown>)
    }
    spread(emptyState, api.getEmptyProps() as Record<string, unknown>)
    spread(loadingState, api.getLoadingStateProps() as Record<string, unknown>)
  }

  // 任一 cell 变化即重渲，与两个适配器同语义（受控时内部不写值，因此也不会重渲——
  // 那一路要宿主自己写回 props，由 setProps 承担）
  runtime.subscribe(render)
  render()

  return {
    api: () => connectTable(service, normalizeProps),
    root,
    caption,
    header,
    headerRow,
    body,
    footerRow,
    selectAll,
    columnHeader: id => columnHeaders.get(id)!,
    sortTrigger: id => sortTriggers.get(id)!,
    row: id => rowEls.get(id)!,
    emptyState,
    loadingState,
    setProps: (next) => {
      Object.assign(props, next)
      render()
    },
    sort: () => service.context.get('sort'),
    selection: () => service.context.get('selection'),
    expanded: () => service.context.get('expanded'),
  }
}

/** 合成事件默认 cancelable=false，那样 preventDefault 是空操作、defaultPrevented 永远为假。 */
function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

function click(el: HTMLElement, init: MouseEventInit = {}): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
}

function focused(): string | null {
  return document.activeElement?.getAttribute('data-value') ?? null
}

/** 当下持有焦点的节点，按键一律从它发出（键盘处理器在 body 上收口，靠冒泡）。 */
function active(): HTMLElement {
  return (document.activeElement as HTMLElement | null) ?? document.body
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('flattenTableRows 展开摊平', () => {
  it('空表摊出空序列', () => {
    expect(flattenTableRows([], [])).toEqual([])
    expect(flattenTableRows([], ['a'])).toEqual([])
  })

  it('全收起：可见序就是行序，详情行一条不出', () => {
    const visible = flattenTableRows(ROWS, [])
    expect(visible.map(r => r.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(visible.every(r => r.kind === 'data')).toBe(true)
    expect(visible.map(r => r.index)).toEqual([0, 1, 2, 3])
  })

  it('详情行紧跟它所属的数据行，并把后面所有行整体后移一位', () => {
    const visible = flattenTableRows(ROWS, ['a'])
    expect(visible.map(r => `${r.id}:${r.kind}`))
      .toEqual(['a:data', 'a:expanded', 'b:data', 'c:data', 'd:data'])
    // 行号靠的就是这个位移：b 从第 1 位挪到了第 2 位
    expect(visible.find(r => r.id === 'b')!.index).toBe(2)
    expect(visible.find(r => r.id === 'd')!.index).toBe(4)
  })

  it('多行同时展开各插各的详情行', () => {
    const visible = flattenTableRows(ROWS, ['a', 'd'])
    expect(visible.map(r => `${r.id}:${r.kind}`))
      .toEqual(['a:data', 'a:expanded', 'b:data', 'c:data', 'd:data', 'd:expanded'])
  })

  it('不可展开的行混进展开集合也不出详情行：能不能展开由 rows 说了算', () => {
    const visible = flattenTableRows(ROWS, ['b', 'ghost'])
    expect(visible.map(r => r.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(visible.find(r => r.id === 'b')!.expanded).toBe(false)
  })

  it('禁用行照样是可见行：禁用不等于隐藏，它还得当方向键的起点', () => {
    const visible = flattenTableRows(ROWS, [])
    expect(visible.find(r => r.id === 'c')!.disabled).toBe(true)
  })

  it('禁用的可展开行仍能被展开集合展开：禁用管的是用户改不改得动，不是能不能展开', () => {
    const visible = flattenTableRows(ROWS, ['c'])
    expect(visible.map(r => `${r.id}:${r.kind}`))
      .toEqual(['a:data', 'b:data', 'c:data', 'c:expanded', 'd:data'])
  })

  it('id 重复只认先出现的那一行：两行同 id 会在 DOM 上抢同一个 data-value', () => {
    const visible = flattenTableRows([{ id: 'x' }, { id: 'x', disabled: true }, { id: 'y' }], [])
    expect(visible.map(r => r.id)).toEqual(['x', 'y'])
    expect(visible[0]!.disabled).toBe(false)
  })
})

describe('选择集合的三态推导', () => {
  it('可选行不含禁用行：把它算进分母，全选把手就永远停在半选上', () => {
    expect(tableSelectableRowIds(ROWS)).toEqual(['a', 'b', 'd'])
    expect(tableSelectableRowIds([{ id: 'x' }, { id: 'x' }])).toEqual(['x'])
  })

  it('三态：空 / 部分 / 全部', () => {
    const ids = ['a', 'b', 'd']
    expect(tableSelectionState([], ids)).toBe('unchecked')
    expect(tableSelectionState(['a'], ids)).toBe('indeterminate')
    expect(tableSelectionState(['a', 'b'], ids)).toBe('indeterminate')
    expect(tableSelectionState(['a', 'b', 'd'], ids)).toBe('checked')
    // 禁用行被选中不影响三态：它压根不在分母里
    expect(tableSelectionState(['c'], ids)).toBe('unchecked')
  })

  it('裸 all 恒为全选；一行可选的都没有时恒为空态', () => {
    expect(tableSelectionState('all', ['a'])).toBe('checked')
    expect(tableSelectionState('all', [])).toBe('unchecked')
    expect(tableSelectionState(['a'], [])).toBe('unchecked')
  })

  it('单行选中判定认得裸 all', () => {
    expect(tableRowSelected('all', 'ghost')).toBe(true)
    expect(tableRowSelected(['a'], 'a')).toBe(true)
    expect(tableRowSelected(['a'], 'b')).toBe(false)
  })

  it('摊平：all 摊成当前可选行全集，数组只去重', () => {
    expect(tableSelectionIds('all', ['a', 'b'])).toEqual(['a', 'b'])
    expect(tableSelectionIds(['a', 'a', 'c'], ['a', 'b'])).toEqual(['a', 'c'])
  })

  it('切换单行：复选增删、单选替换、再点一次取消', () => {
    const ids = ['a', 'b', 'd']
    expect(tableToggleRowSelection([], 'a', 'multiple', ids)).toEqual(['a'])
    expect(tableToggleRowSelection(['a'], 'b', 'multiple', ids)).toEqual(['a', 'b'])
    expect(tableToggleRowSelection(['a', 'b'], 'a', 'multiple', ids)).toEqual(['b'])
    expect(tableToggleRowSelection(['a'], 'b', 'single', ids)).toEqual(['b'])
    expect(tableToggleRowSelection(['a'], 'a', 'single', ids)).toEqual([])
    // none 下集合纹丝不动
    expect(tableToggleRowSelection(['a'], 'b', 'none', ids)).toEqual(['a'])
  })

  it('全选把手：满则清空、不满则补齐，禁用行的选中留着不动', () => {
    const ids = ['a', 'b', 'd']
    expect(tableToggleSelectAll([], ids)).toEqual(['a', 'b', 'd'])
    expect(tableToggleSelectAll(['a'], ids)).toEqual(['a', 'b', 'd'])
    expect(tableToggleSelectAll(['a', 'b', 'd'], ids)).toEqual([])
    // c 不在可选行里：清空那一路不该顺手把用户够不着的也摘掉
    expect(tableToggleSelectAll(['a', 'b', 'c', 'd'], ids)).toEqual(['c'])
    // 裸 all 摊平后即"全选着"，再点一次清空
    expect(tableToggleSelectAll('all', ids)).toEqual([])
    // 一行可选的都没有：什么也不发生
    expect(tableToggleSelectAll(['c'], [])).toEqual(['c'])
  })
})

describe('排序链的增删改', () => {
  it('三态循环：升序 → 降序 → 不排序', () => {
    let chain = tableToggleSort([], 'name')
    expect(chain).toEqual([{ id: 'name', direction: 'asc' }])
    chain = tableToggleSort(chain, 'name')
    expect(chain).toEqual([{ id: 'name', direction: 'desc' }])
    chain = tableToggleSort(chain, 'name')
    expect(chain).toEqual([])
  })

  it('不追加即整条链被这一列替换掉', () => {
    const chain = tableToggleSort([{ id: 'size', direction: 'desc' }], 'name')
    expect(chain).toEqual([{ id: 'name', direction: 'asc' }])
  })

  it('追加：新列排到链尾，已在链里的只改方向、位置不动', () => {
    let chain = tableToggleSort([{ id: 'name', direction: 'asc' }], 'size', { append: true })
    expect(chain).toEqual([
      { id: 'name', direction: 'asc' },
      { id: 'size', direction: 'asc' },
    ])
    chain = tableToggleSort(chain, 'name', { append: true })
    expect(chain).toEqual([
      { id: 'name', direction: 'desc' },
      { id: 'size', direction: 'asc' },
    ])
  })

  it('追加时循环到"不排序"即把这一环从链里摘掉，别的环不动', () => {
    const chain = tableToggleSort([
      { id: 'name', direction: 'desc' },
      { id: 'size', direction: 'asc' },
    ], 'name', { append: true })
    expect(chain).toEqual([{ id: 'size', direction: 'asc' }])
  })

  it('返回的是新链，原链一个字节都不改', () => {
    const source = [{ id: 'name', direction: 'asc' } as const]
    const next = tableToggleSort(source, 'size', { append: true })
    expect(source).toEqual([{ id: 'name', direction: 'asc' }])
    expect(next[0]).not.toBe(source[0])
  })

  it('方向与优先级查询：不在链里分别是 null 与 0', () => {
    const chain = [
      { id: 'name', direction: 'asc' } as const,
      { id: 'size', direction: 'desc' } as const,
    ]
    expect(tableSortDirectionOf(chain, 'name')).toBe('asc')
    expect(tableSortDirectionOf(chain, 'ghost')).toBeNull()
    expect(tableSortIndexOf(chain, 'name')).toBe(1)
    expect(tableSortIndexOf(chain, 'size')).toBe(2)
    expect(tableSortIndexOf(chain, 'ghost')).toBe(0)
  })

  it('归一按 id 去重且保序：同一列排两次自相矛盾，aria-sort 也只报得出一个方向', () => {
    expect(tableNormalizeSort([
      { id: 'name', direction: 'asc' },
      { id: 'size', direction: 'desc' },
      { id: 'name', direction: 'desc' },
    ])).toEqual([
      { id: 'name', direction: 'asc' },
      { id: 'size', direction: 'desc' },
    ])
  })
})

describe('tableMachine 排序 / 选择 / 展开', () => {
  it('排序把手只认 sortable 的列', () => {
    const h = mount()
    h.api().toggleSort('name')
    expect(h.sort()).toEqual([{ id: 'name', direction: 'asc' }])
    h.api().toggleSort('select')
    expect(h.sort()).toEqual([{ id: 'name', direction: 'asc' }])
  })

  it('多字段：Shift 追加，裸点替换整条链', () => {
    const h = mount()
    h.api().toggleSort('name')
    h.api().toggleSort('size', { append: true })
    expect(h.sort()).toEqual([
      { id: 'name', direction: 'asc' },
      { id: 'size', direction: 'asc' },
    ])
    h.api().toggleSort('size')
    expect(h.sort()).toEqual([{ id: 'size', direction: 'desc' }])
  })

  it('selectionMode=none：选中集合怎么推都不动', () => {
    const onSelectionChange = vi.fn()
    const h = mount({ onSelectionChange })
    h.api().selectRow('a')
    h.api().toggleSelectAll()
    h.api().setSelection(['a', 'b'])
    expect(h.selection()).toEqual([])
    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it('单选：一次只中一行，setSelection 也守同一条不变量', () => {
    const h = mount({ selectionMode: 'single' })
    h.api().selectRow('a')
    expect(h.selection()).toEqual(['a'])
    h.api().selectRow('b')
    expect(h.selection()).toEqual(['b'])
    h.api().setSelection(['a', 'b'])
    expect(h.selection()).toEqual(['a'])
    // 单选下的裸 all 自相矛盾
    h.api().setSelection('all')
    expect(h.selection()).toEqual([])
  })

  it('复选：增删累加，禁用行与不在 rows 里的行都选不动', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.api().selectRow('a')
    h.api().selectRow('b')
    expect(h.selection()).toEqual(['a', 'b'])
    h.api().selectRow('c')
    h.api().selectRow('ghost')
    expect(h.selection()).toEqual(['a', 'b'])
    h.api().selectRow('a')
    expect(h.selection()).toEqual(['b'])
  })

  it('全选只在复选下生效，且把裸 all 摊成可选行全集', () => {
    const single = mount({ selectionMode: 'single' })
    single.api().toggleSelectAll()
    expect(single.selection()).toEqual([])

    const h = mount({ selectionMode: 'multiple' })
    h.api().toggleSelectAll()
    expect(h.selection()).toEqual(['a', 'b', 'd'])
    h.api().toggleSelectAll()
    expect(h.selection()).toEqual([])
    h.api().setSelection('all')
    expect(h.selection()).toBe('all')
    h.api().toggleSelectAll()
    expect(h.selection()).toEqual([])
  })

  it('展开：只有可展开且未禁用的行改得动，重复展开不重复通知', () => {
    const onExpandedChange = vi.fn()
    const h = mount({ onExpandedChange })
    h.api().expandRow('a')
    expect(h.expanded()).toEqual(['a'])
    h.api().expandRow('a')
    expect(onExpandedChange).toHaveBeenCalledTimes(1)
    // b 不可展开、c 禁用
    h.api().expandRow('b')
    h.api().expandRow('c')
    h.api().toggleExpandRow('c')
    expect(h.expanded()).toEqual(['a'])
    h.api().toggleExpandRow('d')
    expect(h.expanded()).toEqual(['a', 'd'])
    h.api().collapseRow('a')
    expect(h.expanded()).toEqual(['d'])
    h.api().setExpandedValue(['a', 'a', 'd'])
    expect(h.expanded()).toEqual(['a', 'd'])
  })

  it('受控：内部值纹丝不动，回调照发；宿主写回后才生效', () => {
    const onSortChange = vi.fn()
    const onSelectionChange = vi.fn()
    const onExpandedChange = vi.fn()
    const h = mount({
      selectionMode: 'multiple',
      sort: [{ id: 'name', direction: 'asc' }],
      selection: [],
      expanded: [],
      onSortChange,
      onSelectionChange,
      onExpandedChange,
    })
    h.api().toggleSort('name')
    h.api().selectRow('a')
    h.api().expandRow('a')
    expect(h.sort()).toEqual([{ id: 'name', direction: 'asc' }])
    expect(h.selection()).toEqual([])
    expect(h.expanded()).toEqual([])
    expect(onSortChange).toHaveBeenCalledWith({ value: [{ id: 'name', direction: 'desc' }] })
    expect(onSelectionChange).toHaveBeenCalledWith({ value: ['a'] })
    expect(onExpandedChange).toHaveBeenCalledWith({ value: ['a'] })

    h.setProps({ sort: [{ id: 'name', direction: 'desc' }], selection: ['a'], expanded: ['a'] })
    expect(h.sort()).toEqual([{ id: 'name', direction: 'desc' }])
    expect(h.selection()).toEqual(['a'])
    expect(h.expanded()).toEqual(['a'])
  })

  it('同一份值重复写入不重复通知：数组按元素比，裸 all 与"恰好列全了"不算相等', () => {
    const onSelectionChange = vi.fn()
    const h = mount({ selectionMode: 'multiple', defaultSelection: ['a', 'b', 'd'], onSelectionChange })
    h.api().setSelection(['a', 'b', 'd'])
    expect(onSelectionChange).not.toHaveBeenCalled()
    h.api().setSelection('all')
    expect(onSelectionChange).toHaveBeenCalledTimes(1)
    expect(h.selection()).toBe('all')
  })
})

describe('connectTable 属性输出', () => {
  it('root 是 role=treegrid，行列总数与多选声明都显式给出', () => {
    const h = mount({ selectionMode: 'multiple' })
    expect(h.root.getAttribute('role')).toBe('treegrid')
    // 表头 1 行 + 四个数据行；脚注没声明就不算
    expect(h.root.getAttribute('aria-rowcount')).toBe('5')
    expect(h.root.getAttribute('aria-colcount')).toBe('3')
    expect(h.root.getAttribute('aria-multiselectable')).toBe('true')
    expect(h.root.getAttribute('aria-busy')).toBeNull()
    expect(h.root.getAttribute('aria-labelledby')).toBe(h.caption.id)
    expect(mount().root.getAttribute('aria-multiselectable')).toBe('false')
  })

  it('一行都展不开时 root 退回 role=grid，也不报层级', () => {
    const h = mount({ rows: [{ id: 'a' }, { id: 'b' }] })
    expect(h.root.getAttribute('role')).toBe('grid')
    expect(h.row('a').row.hasAttribute('aria-level')).toBe(false)
    expect(h.row('a').row.hasAttribute('aria-posinset')).toBe(false)
    expect(h.row('a').row.hasAttribute('aria-setsize')).toBe(false)
  })

  it('treegrid 的层级逐行报出：数据行第一层，详情行是它的下一层', () => {
    const h = mount()
    const a = h.row('a')
    expect(a.row.getAttribute('aria-level')).toBe('1')
    expect(a.row.getAttribute('aria-posinset')).toBe('1')
    expect(a.row.getAttribute('aria-setsize')).toBe('4')
    expect(h.row('d').row.getAttribute('aria-posinset')).toBe('4')
    expect(a.expandedRow.getAttribute('aria-level')).toBe('2')
    expect(a.expandedRow.getAttribute('aria-posinset')).toBe('1')
    expect(a.expandedRow.getAttribute('aria-setsize')).toBe('1')
    // 层级不写在表头行与脚注行上
    expect(h.headerRow.hasAttribute('aria-level')).toBe(false)
    expect(h.footerRow.hasAttribute('aria-level')).toBe(false)
  })

  it('单元格跨列数只在真跨列时报，1 与省略同义', () => {
    const h = mount()
    const el = document.createElement('div')
    spread(el, h.api().getCellProps({ value: 'name' }) as Record<string, unknown>)
    expect(el.hasAttribute('aria-colspan')).toBe(false)
    spread(el, h.api().getCellProps({ value: 'name', colSpan: 1 }) as Record<string, unknown>)
    expect(el.hasAttribute('aria-colspan')).toBe(false)
    spread(el, h.api().getCellProps({ value: 'name', colSpan: 3 }) as Record<string, unknown>)
    expect(el.getAttribute('aria-colspan')).toBe('3')
  })

  it('表头格与表体格暴露同一份列身份：使用者按列写的样式两侧同时命中', () => {
    const h = mount()
    for (const id of ['select', 'name']) {
      const head = document.createElement('div')
      const cell = document.createElement('div')
      spread(head, h.api().getColumnHeaderProps({ value: id }) as Record<string, unknown>)
      spread(cell, h.api().getCellProps({ value: id }) as Record<string, unknown>)
      expect(cell.getAttribute('data-value')).toBe(id)
      expect(cell.getAttribute('data-value')).toBe(head.getAttribute('data-value'))
    }
  })

  it('脚注声明后进行号空间：总数多一行，脚注行号排在最后', () => {
    const h = mount({ footer: true })
    expect(h.root.getAttribute('aria-rowcount')).toBe('6')
    expect(h.headerRow.getAttribute('aria-rowindex')).toBe('1')
    expect(h.footerRow.getAttribute('aria-rowindex')).toBe('6')
  })

  it('渲了脚注行却没声明 footer prop 时不报行号，宁可不报也不与末行数据行撞号', () => {
    const h = mount()
    // 行号空间按 footer prop 算：没声明时 rowcount 就等于末行数据行的行号
    expect(h.root.getAttribute('aria-rowcount')).toBe('5')
    expect(h.row('d').row.getAttribute('aria-rowindex')).toBe('5')
    expect(h.footerRow.hasAttribute('aria-rowindex')).toBe(false)
  })

  it('展开一行会把它后面所有行的行号整体后移一位，详情行占的是真实行号', () => {
    const h = mount({ defaultExpanded: ['a'] })
    expect(h.row('a').row.getAttribute('aria-rowindex')).toBe('2')
    expect(h.row('a').expandedRow.getAttribute('aria-rowindex')).toBe('3')
    expect(h.row('b').row.getAttribute('aria-rowindex')).toBe('4')
    expect(h.row('d').row.getAttribute('aria-rowindex')).toBe('6')
    expect(h.root.getAttribute('aria-rowcount')).toBe('6')
    // 收起后行号回落
    h.api().collapseRow('a')
    expect(h.row('b').row.getAttribute('aria-rowindex')).toBe('3')
  })

  it('行是 role=row，列头是 columnheader，格子是 gridcell，列号取自 columns', () => {
    const h = mount()
    expect(h.row('a').row.getAttribute('role')).toBe('row')
    expect(h.columnHeader('name').getAttribute('role')).toBe('columnheader')
    expect(h.columnHeader('select').getAttribute('aria-colindex')).toBe('1')
    expect(h.columnHeader('name').getAttribute('aria-colindex')).toBe('2')
    expect(h.columnHeader('size').getAttribute('aria-colindex')).toBe('3')
    const cells = h.row('a').cells
    expect(cells.size!.getAttribute('role')).toBe('gridcell')
    expect(cells.size!.getAttribute('aria-colindex')).toBe('3')
  })

  it('列宽由连接层写进内联 inline-size：数字按 px，字符串原样', () => {
    const h = mount()
    expect(h.columnHeader('select').style.inlineSize).toBe('40px')
    expect(h.columnHeader('size').style.inlineSize).toBe('8rem')
    expect(h.row('a').cells.size!.style.inlineSize).toBe('8rem')
    expect(h.columnHeader('name').style.inlineSize).toBe('')
  })

  it('横向吸附与表头吸顶各管各的轴：表头只落标记，吸附列还报出钉在哪一侧', () => {
    const h = mount({ stickyHeader: true })
    expect(h.root.getAttribute('data-sticky')).toBe('')
    expect(h.header.getAttribute('data-sticky')).toBe('')
    expect(h.columnHeader('name').getAttribute('data-frozen')).toBe('start')
    expect(h.row('a').cells.name!.getAttribute('data-frozen')).toBe('start')
    expect(h.columnHeader('size').hasAttribute('data-frozen')).toBe(false)
    expect(mount().header.hasAttribute('data-sticky')).toBe(false)
  })

  it('aria-sort 只在参与排序时给方向：可排序未排是 none，不可排序一个字不提', () => {
    const h = mount()
    expect(h.columnHeader('name').getAttribute('aria-sort')).toBe('none')
    expect(h.columnHeader('select').hasAttribute('aria-sort')).toBe(false)
    expect(h.columnHeader('select').getAttribute('data-sortable')).toBeNull()

    h.api().toggleSort('name')
    expect(h.columnHeader('name').getAttribute('aria-sort')).toBe('ascending')
    expect(h.columnHeader('name').getAttribute('data-sort')).toBe('asc')
    expect(h.columnHeader('name').getAttribute('data-sort-index')).toBe('1')
    // 没参与的列不报优先级，也不报方向
    expect(h.columnHeader('size').getAttribute('aria-sort')).toBe('none')
    expect(h.columnHeader('size').hasAttribute('data-sort-index')).toBe(false)

    h.api().toggleSort('name')
    expect(h.columnHeader('name').getAttribute('aria-sort')).toBe('descending')
  })

  it('多字段排序：每一环各报各的方向与优先级', () => {
    const h = mount({ defaultSort: [{ id: 'size', direction: 'desc' }, { id: 'name', direction: 'asc' }] })
    expect(h.columnHeader('size').getAttribute('aria-sort')).toBe('descending')
    expect(h.columnHeader('size').getAttribute('data-sort-index')).toBe('1')
    expect(h.columnHeader('name').getAttribute('aria-sort')).toBe('ascending')
    expect(h.columnHeader('name').getAttribute('data-sort-index')).toBe('2')
  })

  it('选择关停时行不报 aria-selected：省略说的是"这不是可选行"', () => {
    const off = mount()
    expect(off.row('a').row.hasAttribute('aria-selected')).toBe(false)
    const on = mount({ selectionMode: 'multiple', defaultSelection: ['a'] })
    expect(on.row('a').row.getAttribute('aria-selected')).toBe('true')
    expect(on.row('a').row.getAttribute('data-selected')).toBe('')
    expect(on.row('b').row.getAttribute('aria-selected')).toBe('false')
    expect(on.row('b').row.hasAttribute('data-selected')).toBe(false)
  })

  it('可展开的行才报 aria-expanded，并用 aria-controls 指向自己的详情行', () => {
    const h = mount()
    const a = h.row('a')
    expect(a.row.getAttribute('aria-expanded')).toBe('false')
    expect(a.row.getAttribute('aria-controls')).toBe(a.expandedRow.id)
    expect(a.row.getAttribute('data-state')).toBe('closed')
    // b 不可展开：三个属性一个都不出
    expect(h.row('b').row.hasAttribute('aria-expanded')).toBe(false)
    expect(h.row('b').row.hasAttribute('aria-controls')).toBe(false)
    expect(h.row('b').row.hasAttribute('data-state')).toBe(false)

    h.api().expandRow('a')
    expect(a.row.getAttribute('aria-expanded')).toBe('true')
    expect(a.row.getAttribute('data-state')).toBe('open')
  })

  it('详情行常挂：收起时只加 hidden，不卸载作者节点', () => {
    const h = mount()
    const a = h.row('a')
    expect(a.expandedRow.getAttribute('role')).toBe('row')
    expect(a.expandedRow.hasAttribute('hidden')).toBe(true)
    expect(a.expandedRow.getAttribute('data-state')).toBe('closed')
    expect(a.expandedRow.textContent).toBe('a 详情')
    h.api().expandRow('a')
    expect(a.expandedRow.hasAttribute('hidden')).toBe(false)
    expect(a.expandedRow.getAttribute('data-state')).toBe('open')
    // 不可展开的行没有行号可给它的详情行
    expect(h.row('b').expandedRow.hasAttribute('aria-rowindex')).toBe(false)
  })

  it('禁用行走 aria-disabled，绝不输出原生 disabled', () => {
    const h = mount({ selectionMode: 'multiple' })
    expect(h.row('c').row.getAttribute('aria-disabled')).toBe('true')
    expect(h.row('c').row.getAttribute('data-disabled')).toBe('')
    expect(h.row('c').row.hasAttribute('disabled')).toBe(false)
    expect(h.row('a').row.getAttribute('aria-disabled')).toBe('false')
  })

  it('全选把手三态：mixed 是它存在的理由', () => {
    const h = mount({ selectionMode: 'multiple' })
    expect(h.selectAll.getAttribute('role')).toBe('checkbox')
    expect(h.selectAll.getAttribute('aria-checked')).toBe('false')
    expect(h.selectAll.getAttribute('data-state')).toBe('unchecked')
    expect(h.selectAll.getAttribute('tabindex')).toBe('0')
    expect(h.selectAll.getAttribute('aria-disabled')).toBe('false')

    h.api().selectRow('a')
    expect(h.selectAll.getAttribute('aria-checked')).toBe('mixed')
    expect(h.selectAll.getAttribute('data-state')).toBe('indeterminate')

    h.api().toggleSelectAll()
    expect(h.selectAll.getAttribute('aria-checked')).toBe('true')
    expect(h.selectAll.getAttribute('data-state')).toBe('checked')
  })

  it('单选与 none 下全选把手转 aria-disabled 且点不动', () => {
    for (const mode of ['none', 'single'] as const) {
      document.body.innerHTML = ''
      const h = mount({ selectionMode: mode })
      expect(h.selectAll.getAttribute('aria-disabled')).toBe('true')
      expect(h.selectAll.getAttribute('data-disabled')).toBe('')
      click(h.selectAll)
      expect(h.selection()).toEqual([])
    }
  })

  it('行内两个把手退出可及树与 Tab 序列：行自己已经报过这两件事', () => {
    const h = mount({ selectionMode: 'multiple' })
    const a = h.row('a')
    for (const el of [a.selectTrigger, a.expandTrigger]) {
      expect(el.getAttribute('aria-hidden')).toBe('true')
      expect(el.getAttribute('tabindex')).toBe('-1')
    }
    expect(a.selectTrigger.getAttribute('data-selected')).toBeNull()
    h.api().selectRow('a')
    expect(a.selectTrigger.getAttribute('data-selected')).toBe('')
  })

  it('空态与加载态常挂、互斥、只在表体为空时才显', () => {
    const full = mount()
    expect(full.emptyState.hasAttribute('hidden')).toBe(true)
    expect(full.loadingState.hasAttribute('hidden')).toBe(true)
    expect(full.root.hasAttribute('data-empty')).toBe(false)

    document.body.innerHTML = ''
    const empty = mount({ rows: [] })
    expect(empty.emptyState.hasAttribute('hidden')).toBe(false)
    expect(empty.loadingState.hasAttribute('hidden')).toBe(true)
    expect(empty.root.getAttribute('data-empty')).toBe('')
    expect(empty.root.getAttribute('aria-rowcount')).toBe('1')
    expect(empty.root.getAttribute('aria-busy')).toBeNull()

    document.body.innerHTML = ''
    const busy = mount({ rows: [], loading: true })
    expect(busy.loadingState.hasAttribute('hidden')).toBe(false)
    expect(busy.emptyState.hasAttribute('hidden')).toBe(true)
    expect(busy.root.getAttribute('aria-busy')).toBe('true')
    expect(busy.root.getAttribute('data-loading')).toBe('')

    // 已经有数据还盖一层"加载中"会把用户正在读的表遮掉
    document.body.innerHTML = ''
    const refreshing = mount({ loading: true })
    expect(refreshing.loadingState.hasAttribute('hidden')).toBe(true)
    expect(refreshing.emptyState.hasAttribute('hidden')).toBe(true)
    expect(refreshing.root.getAttribute('aria-busy')).toBe('true')
  })

  it('empty 显式声明压过行数推导', () => {
    const h = mount({ empty: true })
    expect(h.emptyState.hasAttribute('hidden')).toBe(false)
    expect(h.root.getAttribute('data-empty')).toBe('')
  })
})

describe('行级 roving tabindex', () => {
  it('整张表体只有一个 Tab 停靠点，焦点进来后容器让位', () => {
    const h = mount()
    const stops = (): string[] => [...document.querySelectorAll<HTMLElement>('[data-scope="table"]')]
      .filter(el => el.getAttribute('tabindex') === '0')
      .map(el => el.getAttribute('data-part')!)
    // 文档序即 Tab 序：表头的全选与排序把手排在前面（它们不在 roving 行组内，
    // 不自己占位键盘用户就永远够不着），表体整体只贡献一位
    expect(stops()).toEqual(['select-all-trigger', 'sort-trigger', 'sort-trigger', 'body'])

    h.body.focus()
    h.body.dispatchEvent(new FocusEvent('focus', { relatedTarget: null }))
    expect(focused()).toBe('a')
    expect(stops()).toEqual(['select-all-trigger', 'sort-trigger', 'sort-trigger', 'row'])
    expect(h.body.getAttribute('tabindex')).toBe('-1')
  })

  it('焦点进入表体落在选中行上，不是落在首行', () => {
    const h = mount({ selectionMode: 'multiple', defaultSelection: ['d'] })
    expect(h.row('d').row.getAttribute('tabindex')).toBe('0')
    expect(h.row('a').row.getAttribute('tabindex')).toBe('-1')
    expect(h.body.getAttribute('tabindex')).toBe('0')
    h.body.dispatchEvent(new FocusEvent('focus', { relatedTarget: null }))
    expect(focused()).toBe('d')
  })

  it('选中行禁用时退回首个可停留的行', () => {
    const h = mount({ selectionMode: 'multiple', defaultSelection: ['c'] })
    h.body.dispatchEvent(new FocusEvent('focus', { relatedTarget: null }))
    expect(focused()).toBe('a')
  })

  it('焦点离开表体即清锚点，容器重新兜底', () => {
    const h = mount()
    h.row('b').row.focus()
    expect(focused()).toBe('b')
    expect(h.body.getAttribute('tabindex')).toBe('-1')
    h.body.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
    expect(h.body.getAttribute('tabindex')).toBe('0')
    expect(h.api().focusedRow).toBeNull()
    // 体内换行不算离场（换一行来聚焦：对已聚焦的元素再调 focus() 不会派事件）
    h.row('a').row.focus()
    h.body.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: h.row('b').row }))
    expect(h.api().focusedRow).toBe('a')
  })

  it('表头行与脚注行不占 Tab 位、也不进方向键序列', () => {
    const h = mount()
    expect(h.headerRow.hasAttribute('tabindex')).toBe(false)
    expect(h.footerRow.hasAttribute('tabindex')).toBe(false)
    expect(h.headerRow.hasAttribute('data-value')).toBe(false)
    h.row('a').row.focus()
    press(active(), 'ArrowUp')
    expect(focused()).toBe('a')
  })
})

describe('键盘：行间导航', () => {
  it('上下键换行、Home/End 到首末行，loop 默认关所以首尾不回绕', () => {
    const h = mount()
    h.row('a').row.focus()
    press(active(), 'ArrowDown')
    expect(focused()).toBe('b')
    // c 禁用，直接跨过去
    press(active(), 'ArrowDown')
    expect(focused()).toBe('d')
    press(active(), 'ArrowDown')
    expect(focused()).toBe('d')
    press(active(), 'Home')
    expect(focused()).toBe('a')
    press(active(), 'ArrowUp')
    expect(focused()).toBe('a')
    press(active(), 'End')
    expect(focused()).toBe('d')
  })

  it('loop 打开后首尾回绕', () => {
    const h = mount({ loop: true })
    h.row('a').row.focus()
    press(active(), 'ArrowUp')
    expect(focused()).toBe('d')
  })

  it('详情行不是方向键的落点：它承载业务内容，不是数据行', () => {
    const h = mount({ defaultExpanded: ['a'] })
    h.row('a').row.focus()
    press(active(), 'ArrowDown')
    expect(focused()).toBe('b')
  })

  it('禁用行仍可聚焦、仍是方向键起点', () => {
    const h = mount()
    h.row('c').row.focus()
    expect(focused()).toBe('c')
    press(active(), 'ArrowUp')
    expect(focused()).toBe('b')
  })

  it('导航键被吞掉（拦下页面滚动），不归表格管的键放行', () => {
    const h = mount()
    h.row('a').row.focus()
    expect(press(active(), 'ArrowDown').defaultPrevented).toBe(true)
    expect(press(active(), 'Home').defaultPrevented).toBe(true)
    // 带 Ctrl 的组合归浏览器与读屏
    expect(press(active(), 'Home', { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(press(active(), 'a').defaultPrevented).toBe(false)
  })
})

describe('键盘：行级选中与展开', () => {
  it('space 切换焦点行的选中', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.row('a').row.focus()
    expect(press(active(), ' ').defaultPrevented).toBe(true)
    expect(h.selection()).toEqual(['a'])
    press(active(), 'ArrowDown')
    press(active(), ' ')
    expect(h.selection()).toEqual(['a', 'b'])
    press(active(), ' ')
    expect(h.selection()).toEqual(['a'])
  })

  it('选不动就不吞 Space：selectionMode=none 与禁用行都放行给页面滚动', () => {
    const off = mount()
    off.row('a').row.focus()
    expect(press(active(), ' ').defaultPrevented).toBe(false)
    expect(off.selection()).toEqual([])

    document.body.innerHTML = ''
    const h = mount({ selectionMode: 'multiple' })
    h.row('c').row.focus()
    expect(press(active(), ' ').defaultPrevented).toBe(false)
    expect(h.selection()).toEqual([])
  })

  it('右键展开、左键收起，焦点不动', () => {
    const h = mount()
    h.row('a').row.focus()
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(true)
    expect(h.expanded()).toEqual(['a'])
    expect(focused()).toBe('a')
    // 已展开：右键不再归表格管
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(false)
    expect(press(active(), 'ArrowLeft').defaultPrevented).toBe(true)
    expect(h.expanded()).toEqual([])
    // 已收起：左键也不吞
    expect(press(active(), 'ArrowLeft').defaultPrevented).toBe(false)
  })

  it('不可展开与禁用的行上左右键什么都不做、也不吞键', () => {
    const h = mount()
    h.row('b').row.focus()
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(false)
    h.row('c').row.focus()
    expect(press(active(), 'ArrowRight').defaultPrevented).toBe(false)
    expect(h.expanded()).toEqual([])
  })

  it('dir=rtl 把左右键整体对调', () => {
    const h = mount({ dir: 'rtl' })
    h.row('a').row.focus()
    press(active(), 'ArrowLeft')
    expect(h.expanded()).toEqual(['a'])
    press(active(), 'ArrowRight')
    expect(h.expanded()).toEqual([])
  })
})

describe('指针与表头把手', () => {
  it('点行内选择把手：选中并把焦点交给这一行，不留在把手上', () => {
    const h = mount({ selectionMode: 'multiple' })
    click(h.row('b').selectTrigger)
    expect(h.selection()).toEqual(['b'])
    expect(focused()).toBe('b')
  })

  it('点展开把手：切换展开并把焦点交给这一行', () => {
    const h = mount()
    click(h.row('a').expandTrigger)
    expect(h.expanded()).toEqual(['a'])
    expect(focused()).toBe('a')
    click(h.row('a').expandTrigger)
    expect(h.expanded()).toEqual([])
  })

  it('禁用行与不可展开的行上两个把手都点不动', () => {
    const h = mount({ selectionMode: 'multiple' })
    click(h.row('c').selectTrigger)
    click(h.row('c').expandTrigger)
    click(h.row('b').expandTrigger)
    expect(h.selection()).toEqual([])
    expect(h.expanded()).toEqual([])
  })

  it('点全选把手与按确认键等价，且确认键被吞掉（作者写成 button 时不会切两回）', () => {
    const h = mount({ selectionMode: 'multiple' })
    click(h.selectAll)
    expect(h.selection()).toEqual(['a', 'b', 'd'])
    expect(press(h.selectAll, ' ').defaultPrevented).toBe(true)
    expect(h.selection()).toEqual([])
    expect(press(h.selectAll, 'Enter').defaultPrevented).toBe(true)
    expect(h.selection()).toEqual(['a', 'b', 'd'])
    // 点不动的时候也不吞键
    document.body.innerHTML = ''
    const off = mount()
    expect(press(off.selectAll, ' ').defaultPrevented).toBe(false)
  })

  it('排序把手：裸点替换整条链，按住 Shift 追加', () => {
    const h = mount()
    // 作者常把它写成 <span>，没有角色的话读屏只念得到一段文字，听不出这里能按
    expect(h.sortTrigger('name').getAttribute('role')).toBe('button')
    expect(h.sortTrigger('name').getAttribute('tabindex')).toBe('0')
    click(h.sortTrigger('name'))
    expect(h.sort()).toEqual([{ id: 'name', direction: 'asc' }])
    click(h.sortTrigger('size'), { shiftKey: true })
    expect(h.sort()).toEqual([
      { id: 'name', direction: 'asc' },
      { id: 'size', direction: 'asc' },
    ])
    click(h.sortTrigger('size'))
    expect(h.sort()).toEqual([{ id: 'size', direction: 'desc' }])
  })

  it('排序把手的确认键与点击同义，Shift 同样是追加', () => {
    const h = mount()
    expect(press(h.sortTrigger('name'), 'Enter').defaultPrevented).toBe(true)
    expect(h.sort()).toEqual([{ id: 'name', direction: 'asc' }])
    press(h.sortTrigger('size'), ' ', { shiftKey: true })
    expect(h.sort()).toEqual([
      { id: 'name', direction: 'asc' },
      { id: 'size', direction: 'asc' },
    ])
  })

  it('不可排序的列上排序把手退出 Tab 序列、点不动也不吞键', () => {
    const h = mount()
    // select 列没给 sortable，标记里也就没有 sort-trigger；直接验列头自己的声明
    expect(h.columnHeader('select').hasAttribute('aria-sort')).toBe(false)
    const props = h.api().getSortTriggerProps({ value: 'select' }) as Record<string, unknown>
    expect(props.tabindex).toBe(-1)
    expect(props['aria-disabled']).toBe('true')
  })
})

describe('吸附列的偏移与外观开关', () => {
  const STICKY_COLUMNS: TableColumnDef[] = [
    { id: 'select', width: 40, sticky: true },
    { id: 'name', width: 160, sticky: 'start' },
    { id: 'size', width: 100 },
    { id: 'owner' },
    { id: 'ops', width: 120, sticky: 'end' },
  ]

  it('行首侧按前面各列的数字宽度累加：第一列贴边、第二列偏 40', () => {
    const h = mount({ columns: STICKY_COLUMNS })
    const first = h.api().getColumnHeaderProps({ value: 'select' }) as Record<string, unknown>
    const second = h.api().getColumnHeaderProps({ value: 'name' }) as Record<string, unknown>
    expect(first['data-frozen']).toBe('start')
    expect((first.style as Record<string, unknown> | undefined)?.['--xh-table-sticky-inset']).toBeUndefined()
    expect(second['data-frozen']).toBe('start')
    expect((second.style as Record<string, unknown>)['--xh-table-sticky-inset']).toBe('40px')
    // 偏移与列宽同住一个 style，两者都在
    expect((second.style as Record<string, unknown>).inlineSize).toBe('160px')
  })

  it('行尾侧从右往左累加；末列贴边', () => {
    const h = mount({ columns: STICKY_COLUMNS })
    const ops = h.api().getCellProps({ value: 'ops', row: 'a' }) as Record<string, unknown>
    expect(ops['data-frozen']).toBe('end')
    expect((ops.style as Record<string, unknown> | undefined)?.['--xh-table-sticky-inset']).toBeUndefined()
  })

  it('不吸附的列不写 data-frozen', () => {
    const h = mount({ columns: STICKY_COLUMNS })
    const size = h.api().getCellProps({ value: 'size', row: 'a' }) as Record<string, unknown>
    expect(size['data-frozen']).toBeUndefined()
  })

  it('前面有一列宽度不是数字，后面同侧的吸附列算不出偏移就留空', () => {
    const h = mount({
      columns: [
        { id: 'select', width: '3rem', sticky: true },
        { id: 'name', width: 160, sticky: true },
        { id: 'size' },
      ],
    })
    const name = h.api().getColumnHeaderProps({ value: 'name' }) as Record<string, unknown>
    expect(name['data-frozen']).toBe('start')
    expect((name.style as Record<string, unknown> | undefined)?.['--xh-table-sticky-inset']).toBeUndefined()
  })

  it('斑马纹 / 无外框 / 竖线三个开关落到 root 上', () => {
    const h = mount({ striped: true, borderless: true, ruled: true })
    const root = h.api().getRootProps() as Record<string, unknown>
    expect(root['data-striped']).toBe('')
    expect(root['data-borderless']).toBe('')
    expect(root['data-ruled']).toBe('')

    const plain = mount().api().getRootProps() as Record<string, unknown>
    expect(plain['data-striped']).toBeUndefined()
  })
})

describe('范围选与全选快捷键', () => {
  it('按住 Shift 选中锚点到这一行那一段', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.api().selectRow('a')
    h.api().selectRow('d', { extend: true })
    // c 是禁用行，选不上但占着顺序位置
    expect(h.selection()).toEqual(['a', 'b', 'd'])
  })

  it('那一段并进当前选中，先前勾的不被清掉——表格是复选框语义', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.api().selectRow('d')
    h.api().selectRow('a')
    h.api().selectRow('b', { extend: true })
    expect(h.selection()).toEqual(['d', 'a', 'b'])
  })

  it('锚点不动：连着按 Shift 从同一行改这一段的长短', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.api().selectRow('a')
    h.api().selectRow('d', { extend: true })
    expect(h.selection()).toEqual(['a', 'b', 'd'])
    h.api().selectRow('b', { extend: true })
    expect(h.selection()).toEqual(['a', 'b'])
  })

  it('还没有锚点时退化成普通的切换', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.api().selectRow('b', { extend: true })
    expect(h.selection()).toEqual(['b'])
  })

  it('单选不认范围选', () => {
    const h = mount({ selectionMode: 'single' })
    h.api().selectRow('a')
    h.api().selectRow('d', { extend: true })
    expect(h.selection()).toEqual(['d'])
  })

  it('裸点击仍是切换，不是替换——既有语义不变', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.api().selectRow('a')
    h.api().selectRow('b')
    expect(h.selection()).toEqual(['a', 'b'])
  })
})

describe('键盘：落在可编辑单元格里的按键不归表格管', () => {
  /** 往某一行的格子里塞一个输入框，模拟可编辑单元格。 */
  function editableIn(h: ReturnType<typeof mount>, id: string): HTMLInputElement {
    const input = document.createElement('input')
    h.row(id).row.append(input)
    return input
  }

  it('在可编辑单元格里打空格是打字，不是切换这一行的选中', () => {
    const h = mount({ selectionMode: 'multiple' })
    // 先让焦点落过行：focusedRow 留着，这正是这个坑的前提
    h.row('a').row.focus()
    const input = editableIn(h, 'a')
    input.focus()

    expect(press(input, ' ').defaultPrevented).toBe(false)
    expect(h.selection()).toEqual([])
  })

  it('在可编辑单元格里按 Ctrl+A 是全选文本，不是全选行', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.row('a').row.focus()
    const input = editableIn(h, 'a')
    input.focus()

    expect(press(input, 'a', { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(h.selection()).toEqual([])
  })

  it('在可编辑单元格里按方向键是移动光标，不是换行', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.row('a').row.focus()
    const input = editableIn(h, 'a')
    input.focus()

    expect(press(input, 'ArrowDown').defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(input)
  })

  it('输入法组合中的按键是给候选框的', () => {
    const h = mount({ selectionMode: 'multiple' })
    h.row('a').row.focus()
    expect(press(active(), ' ', { isComposing: true } as KeyboardEventInit).defaultPrevented).toBe(false)
    expect(h.selection()).toEqual([])
  })
})
