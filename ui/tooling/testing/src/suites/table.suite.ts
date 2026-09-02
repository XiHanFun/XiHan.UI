import type { TableColumnDef, TableRowDef } from '@xihan-ui/headless'
import type { AttrExpectation, ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { tableAnatomy, tableKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/'

/**
 * 列定义：列号与列总数的事实源。
 * select 列只放把手也声明一条；name 可排序且横向吸附；size 可排序。
 */
const COLUMNS: TableColumnDef[] = [
  { id: 'select', label: 'Select', width: 40 },
  { id: 'name', label: 'Name', sortable: true, sticky: true },
  { id: 'size', label: 'Size', sortable: true },
]

/** 列宽用例专用：name 列给了数字宽度并开可改宽，键盘那一步才算得出新宽度。 */
const RESIZABLE_COLUMNS: TableColumnDef[] = [
  { id: 'select', label: 'Select', width: 40 },
  { id: 'name', label: 'Name', sortable: true, sticky: true, width: 200, resizable: true },
  { id: 'size', label: 'Size', sortable: true },
]

/** 列换位用例专用：三列都可换位、都不冻结，可拖的那一段就是这三列。 */
const REORDERABLE_COLUMNS: TableColumnDef[] = [
  { id: 'select', label: 'Select', width: 40, reorderable: true },
  { id: 'name', label: 'Name', sortable: true, reorderable: true },
  { id: 'size', label: 'Size', sortable: true, reorderable: true },
]

/** 给 name 列的表头挂一个把手。改宽与换位两组用例各挂各的。 */
function withHeaderHandle(base: FixtureNode, part: string): FixtureNode {
  return {
    ...base,
    children: base.children?.map(child => mapColumnHeader(child, part)),
  }
}

function mapColumnHeader(node: FixtureNode, part: string): FixtureNode {
  if (node.part === 'column-header' && node.attrs?.value === 'name') {
    return {
      ...node,
      children: [...(node.children ?? []), { part, tag: 'span', attrs: { value: 'name' } }],
    }
  }
  return node.children?.length ? { ...node, children: node.children.map(child => mapColumnHeader(child, part)) } : node
}

/**
 * 行定义：a/c/d 可展开，b 是普通行；
 * c 禁用（方向键跳过但仍可聚焦，也不算进全选基数）。
 */
const ROWS: TableRowDef[] = [
  { id: 'a', expandable: true },
  { id: 'b' },
  { id: 'c', disabled: true, expandable: true },
  { id: 'd', expandable: true },
]

/**
 * 行换位用例专用：四行都在根层、都不禁用。
 * 一行都不带 parentId 就是平表，落点只有前后两档；禁用行不该拿来当起点。
 */
const REORDERABLE_ROWS: TableRowDef[] = [
  { id: 'a' },
  { id: 'b' },
  { id: 'c' },
  { id: 'd' },
]

/**
 * 树形行换位用例专用：b、c 挂在 a 底下，d 与 a 同在根层。
 * 行值仍是 a/b/c/d，展开 a 之后的可见序与基准 fixture 里那四个数据行一一对上。
 */
const TREE_ROWS: TableRowDef[] = [
  { id: 'a' },
  { id: 'b', parentId: 'a' },
  { id: 'c', parentId: 'a' },
  { id: 'd' },
]

/** 给用例补上同一份行列定义与 footer 声明。 */
function props(extra: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return { columns: COLUMNS, rows: ROWS, footer: true, ...extra }
}

/**
 * 数据行。触屏拖动把手占着行首那一格，排在所有格子之前：身份取裹着它的那一行。
 * 它对读屏隐藏，不进这一行的可及子节点集合，格子的构成照旧只有格子。
 */
function dataRow(value: string): FixtureNode {
  return {
    part: 'row',
    attrs: { value },
    children: [
      { part: 'row-drag-trigger', tag: 'span' },
      {
        part: 'cell',
        attrs: { value: 'select' },
        children: [
          { part: 'expand-trigger', tag: 'span', text: '▸' },
          { part: 'row-select-trigger', tag: 'span', text: '✓' },
        ],
      },
      { part: 'cell', attrs: { value: 'name' }, text: `${value} name` },
      { part: 'cell', attrs: { value: 'size' }, text: `${value} size` },
    ],
  }
}

// 详情行也是一条 row，行里必须有格子；这一格从第一列起铺满三列
function detailRow(value: string): FixtureNode {
  return {
    part: 'expanded-row',
    attrs: { value },
    children: [{ part: 'cell', attrs: { value: 'select', colspan: '3' }, text: `${value} 详情` }],
  }
}

function columnHeader(value: string, text: string): FixtureNode {
  return {
    part: 'column-header',
    attrs: { value },
    children: [{ part: 'sort-trigger', tag: 'span', text }],
  }
}

// 文档序下标：
// row      = [表头, a, b, c, d, 脚注]
// cell     = [a×3, a 详情×1, b×3, c×3, c 详情×1, d×3, d 详情×1, 脚注×3]
// 其余集合 = column-header [select, name, size]、sort-trigger [name, size]、
//            row-drag-trigger / expand-trigger / row-select-trigger [a, b, c, d]、
//            expanded-row [a, c, d]
const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'caption', text: '文件列表' },
    {
      part: 'header',
      children: [
        {
          part: 'row',
          children: [
            {
              part: 'column-header',
              attrs: { value: 'select' },
              children: [{ part: 'select-all-trigger', tag: 'span', text: '✓' }],
            },
            columnHeader('name', 'Name'),
            columnHeader('size', 'Size'),
          ],
        },
      ],
    },
    {
      part: 'body',
      children: [
        dataRow('a'),
        detailRow('a'),
        dataRow('b'),
        dataRow('c'),
        detailRow('c'),
        dataRow('d'),
        detailRow('d'),
      ],
    },
    {
      part: 'footer',
      children: [
        {
          part: 'row',
          children: [
            { part: 'cell', attrs: { value: 'select' } },
            { part: 'cell', attrs: { value: 'name' }, text: '合计' },
            { part: 'cell', attrs: { value: 'size' }, text: '4 项' },
          ],
        },
      ],
    },
    { part: 'empty', text: '暂无数据' },
    { part: 'loading-state', text: '加载中' },
  ],
}

const DATA_ROWS = ['a', 'b', 'c', 'd'] as const
const EXPANDABLE = ['a', 'c', 'd']
const DETAIL_ROWS = ['a', 'c', 'd']

/** 四个数据行的选中期望，逐个写全；头尾补空期望对应表头行与脚注行。 */
function rowsSelected(...values: readonly string[]): readonly AttrExpectation[] {
  return [
    {},
    ...DATA_ROWS.map(v => ({
      'aria-selected': values.includes(v) ? 'true' : 'false',
      'data-selected': values.includes(v) ? '' : null,
    })),
    {},
  ]
}

/** 展开期望；不可展开的行一个展开属性都不提。 */
function rowsExpanded(...values: readonly string[]): readonly AttrExpectation[] {
  return [
    {},
    ...DATA_ROWS.map(v => (EXPANDABLE.includes(v)
      ? {
          'aria-expanded': values.includes(v) ? 'true' : 'false',
          'data-state': values.includes(v) ? 'open' : 'closed',
        }
      : { 'aria-expanded': null, 'data-state': null })),
    {},
  ]
}

/** 详情行的显隐，与展开态逐一对应。 */
function detailsShown(...values: readonly string[]): readonly AttrExpectation[] {
  return DETAIL_ROWS.map(v => ({ hidden: values.includes(v) ? null : '' }))
}

/** 三列的排序期望，逐列写全。 */
function columnsSorted(...entries: readonly (readonly [string, 'ascending' | 'descending'])[]): readonly AttrExpectation[] {
  const at = (id: string): number => entries.findIndex(e => e[0] === id)
  return ['select', 'name', 'size'].map((id) => {
    // select 列没声明 sortable
    if (id === 'select')
      return { 'aria-sort': null, 'data-sort': null, 'data-sort-index': null }
    const i = at(id)
    if (i < 0)
      return { 'aria-sort': 'none', 'data-sort': null, 'data-sort-index': null }
    return {
      'aria-sort': entries[i]![1],
      'data-sort': entries[i]![1] === 'ascending' ? 'asc' : 'desc',
      'data-sort-index': String(i + 1),
    }
  })
}

/**
 * 三列的列号期望。参数是此刻的列序，产出按 DOM 里 select / name / size 的固定次序排：
 * 表头节点在 DOM 里不动，换位只改它们报出的 aria-colindex。
 */
function columnsAt(...order: readonly string[]): readonly AttrExpectation[] {
  return ['select', 'name', 'size'].map(id => ({ 'aria-colindex': String(order.indexOf(id) + 1) }))
}

/** 行级 roving：断言整个表体只留一个 Tab 停靠点，没有锚点时由 body 兜底。 */
function singleBodyTabStop(): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；表头行与脚注行也是 row 部件，得一并数进来才看得出有没有多占位',
    run: ({ doc }) => {
      const rows = [...doc.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"]')]
      const body = doc.querySelector<HTMLElement>('[data-scope="table"][data-part="body"]')
      const stops = rows.filter(el => el.getAttribute('tabindex') === '0')
      const bodyStop = body?.getAttribute('tabindex') === '0'
      if (stops.length > 1)
        throw new Error(`表体里有 ${stops.length} 个 Tab 停靠点，应当只有一个`)
      if (stops.length === 0 && !bodyStop)
        throw new Error('表体里一个 Tab 停靠点都没有，且容器也没兜底——键盘再也进不来')
      if (stops.length === 1 && bodyStop)
        throw new Error('已有锚点行占着 Tab 位，body 不该再占一个')
    },
  }
}

export const tableSuite: ConformanceSuite = {
  component: 'table',
  anatomy: tableAnatomy,
  keyboard: tableKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：有可展开的行时 root 是 role=treegrid，行列总数与行号列号都取自 rows/columns',
      spec: { apg: `${APG}#roles_states_properties` },
      props: props(),
      initial: {
        counts: {
          'root': 1,
          'caption': 1,
          'header': 1,
          'body': 1,
          'footer': 1,
          'row': 6,
          'column-header': 3,
          // 四行数据 ×3 + 三条详情行各 1 格 + 脚注 ×3
          'cell': 18,
          'select-all-trigger': 1,
          'row-select-trigger': 4,
          'sort-trigger': 2,
          'expand-trigger': 4,
          // 四个数据行各一个；表头行与脚注行不是拖动源，不出把手
          'row-drag-trigger': 4,
          'expanded-row': 3,
          'empty': 1,
          'loading-state': 1,
        },
        parts: {
          'root': {
            // a/c/d 可展开：整张表是 treegrid
            'role': 'treegrid',
            'aria-labelledby': '@part(caption)',
            // 表头 1 行 + 四个数据行 + 脚注 1 行
            'aria-rowcount': '6',
            'aria-colcount': '3',
            // 显式 false，不省略
            'aria-multiselectable': 'false',
            'aria-busy': null,
            'data-empty': null,
            'data-loading': null,
          },
          'caption': { id: '@self' },
          'header': { 'role': 'rowgroup', 'data-fixed': null },
          'body': {
            // 焦点还在表外：容器兜底进 Tab 序列
            'role': 'rowgroup',
            'tabindex': '0',
            'data-empty': null,
          },
          'footer': { role: 'rowgroup' },
          // 表头行占第 1 行，且不进方向键序列、不占 Tab 位
          'row[0]': {
            'role': 'row',
            'aria-rowindex': '1',
            'tabindex': null,
            'data-value': null,
            'data-section': 'header',
            'aria-selected': null,
            // 层级只报给数据行，表头行不在那棵树里
            'aria-level': null,
            'aria-posinset': null,
          },
          'row[1]': {
            'role': 'row',
            'aria-rowindex': '2',
            'data-value': 'a',
            'data-section': 'body',
            // selectionMode 默认 none：选中属性一个都不出
            'aria-selected': null,
            'aria-expanded': 'false',
            'aria-controls': '@part(expanded-row[0])',
            'aria-disabled': 'false',
            'tabindex': '-1',
            'data-state': 'closed',
            // 数据行都在第一层，序号按四行数据算
            'aria-level': '1',
            'aria-posinset': '1',
            'aria-setsize': '4',
            // 集合条目不输出原生 disabled
            'disabled': null,
          },
          // b 不可展开：aria-expanded / aria-controls / data-state 一个都不出
          'row[2]': {
            'aria-rowindex': '3',
            'data-value': 'b',
            'aria-expanded': null,
            'aria-controls': null,
            'data-state': null,
          },
          'row[3]': {
            'aria-rowindex': '4',
            'data-value': 'c',
            'aria-disabled': 'true',
            'data-disabled': '',
            'disabled': null,
          },
          'row[4]': { 'aria-rowindex': '5', 'data-value': 'd', 'aria-posinset': '4', 'aria-setsize': '4' },
          // 脚注排在行号空间的最后一行
          'row[5]': { 'aria-rowindex': '6', 'data-section': 'footer', 'data-value': null },
          'column-header[0]': {
            'role': 'columnheader',
            'aria-colindex': '1',
            'data-value': 'select',
            // 没声明 sortable 的列一个排序属性都不出
            'aria-sort': null,
            'data-sortable': null,
            'data-frozen': null,
          },
          'column-header[1]': {
            'aria-colindex': '2',
            'data-value': 'name',
            // 可排序但没在排：报 none
            'aria-sort': 'none',
            'data-sortable': '',
            'data-frozen': 'start',
          },
          'column-header[2]': { 'aria-colindex': '3', 'data-value': 'size', 'aria-sort': 'none' },
          'cell[0]': { 'role': 'gridcell', 'aria-colindex': '1', 'data-frozen': null, 'aria-colspan': null },
          'cell[1]': { 'aria-colindex': '2', 'data-frozen': 'start' },
          'cell[2]': { 'aria-colindex': '3' },
          // 详情行那一格从第一列起铺满三列
          'cell[3]': { 'aria-colindex': '1', 'aria-colspan': '3' },
          // 脚注的格子不属于任何数据行，没有选中/禁用可言
          'cell[15]': { 'aria-colindex': '1', 'data-selected': null, 'data-disabled': null },
          'select-all-trigger': {
            'role': 'checkbox',
            'aria-checked': 'false',
            // 默认 none：全选把手仍可聚焦
            'aria-disabled': 'true',
            'tabindex': '0',
            'data-state': 'unchecked',
          },
          // 行内三个把手都退出可及树与 Tab 序列
          'row-select-trigger[0]': { 'aria-hidden': 'true', 'tabindex': '-1' },
          'expand-trigger[0]': { 'aria-hidden': 'true', 'tabindex': '-1' },
          'row-drag-trigger[0]': {
            // 键盘换位由表体上的 Alt + 上下键承担，把手只管指针那一路
            'aria-hidden': 'true',
            'tabindex': '-1',
            'data-value': 'a',
            // rowReorderable 默认关：把手照样在场，只是报自己拖不动
            'data-disabled': '',
            'data-dragging': null,
          },
          'sort-trigger[0]': { 'role': 'button', 'tabindex': '0', 'aria-disabled': 'false' },
          'expanded-row': detailsShown(),
          // 详情行是所属数据行的下一层，那一层只有它自己
          'expanded-row[0]': {
            'role': 'row',
            'id': '@self',
            'aria-rowindex': null,
            'data-state': 'closed',
            'aria-level': '2',
            'aria-posinset': '1',
            'aria-setsize': '1',
          },
          // 表体有数据：两个状态节点都收着
          'empty': { hidden: '' },
          'loading-state': { hidden: '' },
        },
      },
    },
    {
      name: 'roving tabindex：表体只有一个 Tab 停靠点，焦点进来后容器让位',
      spec: { apg: APG },
      props: props(),
      covers: ['table.kbd.tab'],
      steps: [
        singleBodyTabStop(),
        {
          kind: 'focus',
          part: 'body',
          expect: {
            activeElement: { part: 'row[1]', exact: true },
            parts: { 'body': { tabindex: '-1' }, 'row[1]': { tabindex: '0' } },
          },
        },
        singleBodyTabStop(),
      ],
    },
    {
      name: '焦点进入表体落在选中行上，不是落在首行',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ selectionMode: 'multiple', defaultSelection: ['d'] }),
      initial: {
        // 焦点还在表外：锚点行认领 Tab 位
        parts: { 'row[4]': { tabindex: '0' }, 'row[1]': { tabindex: '-1' }, 'body': { tabindex: '0' } },
      },
      steps: [
        { kind: 'focus', part: 'body', expect: { activeElement: { part: 'row[4]', exact: true } } },
      ],
    },
    {
      name: '上下键走可见数据行：禁用行跳过，详情行不是落点，loop 默认关所以首尾不回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ defaultExpanded: ['a'] }),
      covers: ['table.kbd.next', 'table.kbd.prev', 'table.kbd.first', 'table.kbd.last'],
      initial: {
        parts: { 'row': rowsExpanded('a'), 'expanded-row': detailsShown('a') },
      },
      steps: [
        { kind: 'focus', part: 'body', expect: { activeElement: { part: 'row[1]', exact: true } } },
        // a 展开着，但详情行不是数据行：下一步落在 b 上
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[2]', exact: true } } },
        // c 禁用，直接跨过去
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[4]', exact: true } } },
        // 末行不回绕
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[4]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'row[2]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'row[1]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'row[1]', exact: true } } },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'row[4]', exact: true },
            // 走完一圈，选中与展开都没动
            parts: { row: rowsExpanded('a') },
          },
        },
      ],
    },
    {
      name: '禁用行仍可聚焦、仍是方向键起点，但确认键与展开键都不认它',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ selectionMode: 'multiple' }),
      steps: [
        { kind: 'focus', part: 'row[3]', expect: { activeElement: { part: 'row[3]', exact: true } } },
        { kind: 'key', key: 'Space', expect: { parts: { row: rowsSelected() } } },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { row: rowsExpanded() } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'row[2]', exact: true } } },
      ],
    },
    {
      name: 'Space 切换焦点行的选中；selectionMode=none 时连键都不吞',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ selectionMode: 'multiple' }),
      covers: ['table.kbd.select'],
      steps: [
        { kind: 'focus', part: 'body', expect: { activeElement: { part: 'row[1]', exact: true } } },
        { kind: 'key', key: 'Space', expect: { parts: { row: rowsSelected('a') } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[2]', exact: true } } },
        { kind: 'key', key: 'Space', expect: { parts: { row: rowsSelected('a', 'b') } } },
        { kind: 'key', key: 'Space', expect: { parts: { row: rowsSelected('a') } } },
      ],
    },
    {
      name: '单选：Space 换一行即替换，再按一次取消',
      spec: { apg: APG },
      props: props({ selectionMode: 'single' }),
      initial: { parts: { root: { 'aria-multiselectable': 'false' } } },
      steps: [
        { kind: 'focus', part: 'body' },
        { kind: 'key', key: 'Space', expect: { parts: { row: rowsSelected('a') } } },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'key', key: 'Space', expect: { parts: { row: rowsSelected('b') } } },
        { kind: 'key', key: 'Space', expect: { parts: { row: rowsSelected() } } },
      ],
    },
    {
      name: 'selectionMode=none：行不报 aria-selected，把手与 Space 一概不生效',
      spec: { apg: APG },
      props: props(),
      steps: [
        { kind: 'focus', part: 'body' },
        {
          kind: 'key',
          key: 'Space',
          expect: { parts: { 'row[1]': { 'aria-selected': null, 'data-selected': null } } },
        },
        {
          kind: 'click',
          part: 'row-select-trigger[0]',
          expect: { parts: { 'row[1]': { 'aria-selected': null, 'data-selected': null } } },
        },
      ],
    },
    {
      name: '右键展开、左键收起，焦点留在原行；不可展开与已到头的方向都不吞键',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: ['table.kbd.expand', 'table.kbd.collapse'],
      steps: [
        { kind: 'focus', part: 'body', expect: { activeElement: { part: 'row[1]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 展开只改展开态，焦点不动
            activeElement: { part: 'row[1]', exact: true },
            parts: { 'row': rowsExpanded('a'), 'expanded-row': detailsShown('a') },
          },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            activeElement: { part: 'row[1]', exact: true },
            parts: { 'row': rowsExpanded(), 'expanded-row': detailsShown() },
          },
        },
        // b 不可展开：右键什么都不做
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[2]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { row: rowsExpanded() } } },
      ],
    },
    {
      name: 'dir=rtl 把左右键整体对调',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ dir: 'rtl' }),
      steps: [
        { kind: 'focus', part: 'body' },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { row: rowsExpanded('a') } } },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { row: rowsExpanded() } } },
      ],
    },
    {
      name: '展开会把它后面所有行的行号整体后移一位，详情行占的是真实行号',
      spec: { apg: `${APG}#roles_states_properties` },
      props: props(),
      steps: [
        {
          kind: 'click',
          part: 'expand-trigger[0]',
          expect: {
            // 把手自己 tabindex=-1，点它把焦点交给这一行
            activeElement: { part: 'row[1]', exact: true },
            parts: {
              'root': { 'aria-rowcount': '7' },
              'row[1]': { 'aria-rowindex': '2' },
              'expanded-row[0]': { 'aria-rowindex': '3', 'hidden': null, 'data-state': 'open' },
              'row[2]': { 'aria-rowindex': '4' },
              'row[5]': { 'aria-rowindex': '7' },
            },
          },
        },
        {
          kind: 'click',
          part: 'expand-trigger[0]',
          expect: {
            parts: {
              'root': { 'aria-rowcount': '6' },
              'row[2]': { 'aria-rowindex': '3' },
              'expanded-row[0]': { hidden: '' },
            },
          },
        },
      ],
    },
    {
      name: '排序：点一次循环一档，aria-sort 只在参与排序的列上给方向',
      spec: { apg: `${APG}#roles_states_properties` },
      props: props(),
      covers: ['table.kbd.sort'],
      steps: [
        {
          kind: 'click',
          part: 'sort-trigger[0]',
          expect: { parts: { 'column-header': columnsSorted(['name', 'ascending']) } },
        },
        {
          kind: 'click',
          part: 'sort-trigger[0]',
          expect: { parts: { 'column-header': columnsSorted(['name', 'descending']) } },
        },
        // 第三下循环回"不排序"
        {
          kind: 'click',
          part: 'sort-trigger[0]',
          expect: { parts: { 'column-header': columnsSorted() } },
        },
      ],
    },
    {
      name: '列宽：方向键一次一步，Shift 加方向键走大步；往行尾侧推是加宽',
      spec: { apg: `${APG}#roles_states_properties` },
      covers: ['table.kbd.column-resize', 'table.kbd.column-resize-large'],
      // 只在这个用例里给第一列挂改宽把手：加进基准 fixture 会动到其余用例的
      // order 与 counts 断言，而它们跟列宽没关系
      fixture: (base: FixtureNode): FixtureNode => withHeaderHandle(base, 'column-resize-trigger'),
      props: props({ columns: RESIZABLE_COLUMNS }),
      steps: [
        { kind: 'focus', part: 'column-resize-trigger' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { events: [{ type: 'column-preference-change', detail: { value: { widths: { name: 208 } } } }] },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { events: [{ type: 'column-preference-change', detail: { value: { widths: { name: 200 } } } }] },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          modifiers: ['Shift'],
          expect: { events: [{ type: 'column-preference-change', detail: { value: { widths: { name: 240 } } } }] },
        },
      ],
    },
    {
      name: '列换位：方向键一次挪一位，焦点留在把手上；挪到段首再往前就不动，也不回绕',
      spec: { apg: `${APG}#roles_states_properties` },
      covers: ['table.kbd.column-move'],
      // 只在换位用例里给 name 列挂拖拽把手：加进基准 fixture 会动到其余用例的
      // order 与 counts 断言，而它们跟换位没关系
      fixture: (base: FixtureNode): FixtureNode => withHeaderHandle(base, 'column-drag-trigger'),
      props: props({ columns: REORDERABLE_COLUMNS }),
      initial: {
        parts: {
          'column-drag-trigger': {
            'role': 'button',
            'aria-label': 'Reorder column Name',
            'aria-roledescription': 'draggable column',
            'aria-disabled': 'false',
            'tabindex': '0',
            'data-disabled': null,
            'data-dragging': null,
          },
          'column-header': columnsAt('select', 'name', 'size'),
        },
      },
      steps: [
        { kind: 'focus', part: 'column-drag-trigger' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 按一下就提交完，不进拖动态，焦点也不交给别人
            activeElement: { part: 'column-drag-trigger', exact: true },
            parts: {
              'column-header': columnsAt('select', 'size', 'name'),
              'column-drag-trigger': { 'data-dragging': null },
            },
            events: [{ type: 'column-preference-change', detail: { value: { order: ['select', 'size', 'name'] } } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: { 'column-header': columnsAt('select', 'name', 'size') },
            events: [{ type: 'column-preference-change', detail: { value: { order: ['select', 'name', 'size'] } } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: { 'column-header': columnsAt('name', 'select', 'size') },
            events: [{ type: 'column-preference-change', detail: { value: { order: ['name', 'select', 'size'] } } }],
          },
        },
        // 已经在段首：列序不动，也不发事件
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: { 'column-header': columnsAt('name', 'select', 'size') },
            events: [],
          },
        },
      ],
    },
    {
      name: '列换位：Home / End 直接挪到可拖那一段的段首 / 段末，已经在那儿就不动',
      spec: { apg: `${APG}#roles_states_properties` },
      covers: ['table.kbd.column-move-edge'],
      fixture: (base: FixtureNode): FixtureNode => withHeaderHandle(base, 'column-drag-trigger'),
      props: props({ columns: REORDERABLE_COLUMNS }),
      steps: [
        { kind: 'focus', part: 'column-drag-trigger' },
        {
          kind: 'key',
          key: 'End',
          expect: {
            parts: { 'column-header': columnsAt('select', 'size', 'name') },
            events: [{ type: 'column-preference-change', detail: { value: { order: ['select', 'size', 'name'] } } }],
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            parts: { 'column-header': columnsAt('name', 'select', 'size') },
            events: [{ type: 'column-preference-change', detail: { value: { order: ['name', 'select', 'size'] } } }],
          },
        },
        // 已经是段首那一列：不动也不发事件
        {
          kind: 'key',
          key: 'Home',
          expect: {
            parts: { 'column-header': columnsAt('name', 'select', 'size') },
            events: [],
          },
        },
      ],
    },
    {
      name: '行换位：Alt + 上下键一次挪一位，只报事件不动 DOM；到头不回绕，裸方向键仍是导航',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['table.kbd.row-move'],
      // 键盘那一路不碰把手：整行就是拖动源。行换成平的那一份，
      // 落点只有前后两档，报出来的父行恒是 null
      props: props({ rows: REORDERABLE_ROWS, rowReorderable: true }),
      initial: {
        parts: {
          // 表头行与脚注行不是拖动源
          'row[0]': { 'data-draggable': null },
          'row[1]': { 'data-draggable': '', 'data-dragging': null, 'data-drop': null },
          'row[5]': { 'data-draggable': null },
          // 开着换位时把手才报得动
          'row-drag-trigger[0]': { 'data-disabled': null, 'data-dragging': null },
        },
      },
      steps: [
        { kind: 'focus', part: 'body', expect: { activeElement: { part: 'row[1]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Alt'],
          expect: {
            // 按一下就提交完，不进拖动态；焦点锚点留在搬走的那一行上
            activeElement: { part: 'row[1]', exact: true },
            parts: { 'row[1]': { 'data-dragging': null, 'data-drop': null } },
            // 行序是 rows prop，库没有一份自己的行序可写：DOM 里 a 仍排在最前，
            // 只有这条事件说得出新位置——落在根层第 2 位（下标 1）
            events: [{ type: 'row-move', detail: { id: 'a', parent: null, index: 1, ids: ['b', 'a', 'c', 'd'] } }],
          },
        },
        // 宿主没把新行序写回 rows，a 还在首位：往前挪不动，也不回绕
        { kind: 'key', key: 'ArrowUp', modifiers: ['Alt'], expect: { events: [] } },
        // 不带 Alt 的方向键照旧是行间导航，一个换位事件都不发
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { activeElement: { part: 'row[2]', exact: true }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Alt'],
          expect: {
            activeElement: { part: 'row[2]', exact: true },
            events: [{ type: 'row-move', detail: { id: 'b', parent: null, index: 2, ids: ['a', 'c', 'b', 'd'] } }],
          },
        },
      ],
    },
    {
      name: '树形行换位：Alt + 左右键改一层缩进，报出新的父与新层里的位次；到边界不动也不发事件',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['table.kbd.row-indent'],
      // 树形那一份行只给这个用例：行值仍是 a/b/c/d，基准 fixture 一个节点都不用改，
      // 展开 a 之后可见序是 a、b、c、d，与 DOM 里那四个数据行一一对上
      props: props({ rows: TREE_ROWS, rowReorderable: true, defaultExpanded: ['a'] }),
      initial: {
        parts: {
          // b、c 是 a 的子行：层级与位次都在第二层上算
          'row[1]': { 'aria-level': '1', 'aria-posinset': '1', 'aria-setsize': '2', 'aria-expanded': 'true' },
          'row[2]': { 'aria-level': '2', 'aria-posinset': '1', 'aria-setsize': '2' },
          'row[3]': { 'aria-level': '2', 'aria-posinset': '2', 'aria-setsize': '2' },
          'row[4]': { 'aria-level': '1', 'aria-posinset': '2', 'aria-setsize': '2' },
        },
      },
      steps: [
        { kind: 'focus', part: 'body', expect: { activeElement: { part: 'row[1]', exact: true } } },
        // a 已经在根层：没得再往外
        { kind: 'key', key: 'ArrowLeft', modifiers: ['Alt'], expect: { events: [] } },
        // a 是根层头一个：没有上一个兄弟可认作父，也就缩不进去
        { kind: 'key', key: 'ArrowRight', modifiers: ['Alt'], expect: { events: [] } },
        // 裸方向键仍是行间导航
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[2]', exact: true }, events: [] } },
        {
          kind: 'key',
          key: 'ArrowLeft',
          modifiers: ['Alt'],
          expect: {
            // 焦点锚点跟着搬走的那一行
            activeElement: { part: 'row[2]', exact: true },
            // b 退到根层，落在 a 的下一位；c 还挂在 a 底下，所以 b 排到了 c 之后
            events: [{ type: 'row-move', detail: { id: 'b', parent: null, index: 1, ids: ['a', 'c', 'b', 'd'] } }],
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[3]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          modifiers: ['Alt'],
          expect: {
            activeElement: { part: 'row[3]', exact: true },
            // c 认上一个兄弟 b 当爹，落在 b 底下第一位；b 名下本来一个孩子都没有，
            // 数组顺序反倒一个字都不用改——换的是父，不是位次
            events: [{ type: 'row-move', detail: { id: 'c', parent: 'b', index: 0, ids: ['a', 'b', 'c', 'd'] } }],
          },
        },
        // 换成一行都不带 parentId 的那份行：平表没有层级，同一个键不再归表格管
        { kind: 'setProps', props: { rows: REORDERABLE_ROWS } },
        { kind: 'key', key: 'ArrowRight', modifiers: ['Alt'], expect: { events: [] } },
      ],
    },
    {
      name: '行换位：排序中的表格拖不动行，Alt + 上下键一并不认',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ rows: REORDERABLE_ROWS, rowReorderable: true, defaultSort: [{ id: 'name', direction: 'asc' }] }),
      initial: {
        // 行序由排序说了算，手排就没有落脚处：整行与把手一起失效
        parts: {
          'row[1]': { 'data-draggable': null },
          'row-drag-trigger[0]': { 'data-disabled': '' },
        },
      },
      steps: [
        { kind: 'focus', part: 'body', expect: { activeElement: { part: 'row[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', modifiers: ['Alt'], expect: { events: [] } },
      ],
    },
    {
      name: '多字段排序：按住 Shift 点是追加到链尾，裸点是整条链换成这一列',
      spec: { apg: APG },
      props: props(),
      steps: [
        {
          kind: 'click',
          part: 'sort-trigger[0]',
          expect: { parts: { 'column-header': columnsSorted(['name', 'ascending']) } },
        },
        {
          kind: 'click',
          part: 'sort-trigger[1]',
          modifiers: ['Shift'],
          expect: {
            parts: { 'column-header': columnsSorted(['name', 'ascending'], ['size', 'ascending']) },
          },
        },
        // 追加时改方向不挪位置
        {
          kind: 'click',
          part: 'sort-trigger[0]',
          modifiers: ['Shift'],
          expect: {
            parts: { 'column-header': columnsSorted(['name', 'descending'], ['size', 'ascending']) },
          },
        },
        // 裸点把整条链换掉
        {
          kind: 'click',
          part: 'sort-trigger[1]',
          expect: { parts: { 'column-header': columnsSorted(['size', 'descending']) } },
        },
      ],
    },
    {
      name: '排序把手的确认键与点击同义，且不会因为浏览器合成 click 而切两回',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      steps: [
        { kind: 'focus', part: 'sort-trigger[0]' },
        {
          kind: 'key',
          key: 'Enter',
          expect: { parts: { 'column-header': columnsSorted(['name', 'ascending']) } },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: { parts: { 'column-header': columnsSorted(['name', 'descending']) } },
        },
      ],
    },
    {
      name: '全选三态：半选报 aria-checked=mixed，禁用行不算进基数',
      spec: { apg: APG },
      props: props({ selectionMode: 'multiple' }),
      covers: ['table.kbd.select-all'],
      initial: {
        parts: {
          'root': { 'aria-multiselectable': 'true' },
          'select-all-trigger': { 'aria-checked': 'false', 'aria-disabled': 'false', 'data-state': 'unchecked' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'row-select-trigger[0]',
          expect: {
            parts: {
              'row': rowsSelected('a'),
              'select-all-trigger': { 'aria-checked': 'mixed', 'data-state': 'indeterminate' },
            },
          },
        },
        {
          kind: 'click',
          part: 'select-all-trigger',
          expect: {
            // c 禁用选不上；全选把手的基数只算可选行，仍报全选
            parts: {
              'row': rowsSelected('a', 'b', 'd'),
              'select-all-trigger': { 'aria-checked': 'true', 'data-state': 'checked' },
            },
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: {
              'row': rowsSelected(),
              'select-all-trigger': { 'aria-checked': 'false', 'data-state': 'unchecked' },
            },
          },
        },
      ],
    },
    {
      name: '表体里 Ctrl / Cmd + A 与全选把手同义：先整段选上，再按一次整段清空',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ selectionMode: 'multiple' }),
      covers: ['table.kbd.select-all-body'],
      steps: [
        { kind: 'focus', part: 'body', expect: { activeElement: { part: 'row[1]', exact: true } } },
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Control'],
          expect: {
            parts: {
              // c 禁用选不上，也不算进全选把手的基数
              'row': rowsSelected('a', 'b', 'd'),
              'select-all-trigger': { 'aria-checked': 'true', 'data-state': 'checked' },
            },
          },
        },
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Meta'],
          expect: {
            parts: {
              'row': rowsSelected(),
              'select-all-trigger': { 'aria-checked': 'false', 'data-state': 'unchecked' },
            },
          },
        },
      ],
    },
    {
      name: '受控 sort / selection / expanded：宿主不写回则纹丝不动',
      spec: { apg: APG },
      props: props({ selectionMode: 'multiple', sort: [], selection: [], expanded: [] }),
      steps: [
        {
          kind: 'click',
          part: 'sort-trigger[0]',
          expect: { parts: { 'column-header': columnsSorted() } },
        },
        {
          kind: 'click',
          part: 'row-select-trigger[0]',
          expect: { parts: { row: rowsSelected() } },
        },
        {
          kind: 'click',
          part: 'expand-trigger[0]',
          expect: { parts: { 'row': rowsExpanded(), 'expanded-row': detailsShown() } },
        },
        {
          kind: 'setProps',
          props: {
            sort: [{ id: 'name', direction: 'desc' }],
            selection: ['a'],
            expanded: ['a'],
          },
          expect: {
            parts: {
              'column-header': columnsSorted(['name', 'descending']),
              'row': rowsSelected('a'),
              'expanded-row': detailsShown('a'),
            },
          },
        },
      ],
    },
    {
      name: '空态与加载态：常挂、互斥，且只在表体为空时才显',
      spec: { apg: APG },
      props: props({ rows: [] }),
      initial: {
        parts: {
          // 一行都没有，也就没有可展开的行：平表格报 grid
          'root': { 'role': 'grid', 'data-empty': '', 'aria-busy': null, 'aria-rowcount': '2' },
          'body': { 'data-empty': '' },
          'empty': { hidden: null },
          'loading-state': { hidden: '' },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { loading: true },
          expect: {
            parts: {
              'root': { 'data-empty': '', 'data-loading': '', 'aria-busy': 'true' },
              'empty': { hidden: '' },
              'loading-state': { hidden: null },
            },
          },
        },
        {
          kind: 'setProps',
          props: { rows: ROWS },
          expect: {
            parts: {
              // 装进可展开的行，角色跟着换
              'root': { 'role': 'treegrid', 'data-empty': null, 'aria-busy': 'true' },
              'empty': { hidden: '' },
              'loading-state': { hidden: '' },
            },
          },
        },
      ],
    },
  ],
}
