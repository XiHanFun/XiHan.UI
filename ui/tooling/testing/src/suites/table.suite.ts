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

/** 给用例补上同一份行列定义与 footer 声明。 */
function props(extra: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return { columns: COLUMNS, rows: ROWS, footer: true, ...extra }
}

function dataRow(value: string): FixtureNode {
  return {
    part: 'row',
    attrs: { value },
    children: [
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
//            expand-trigger / row-select-trigger [a, b, c, d]、expanded-row [a, c, d]
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
            'aria-busy': 'false',
            'data-empty': null,
            'data-loading': null,
          },
          'caption': { id: '@self' },
          'header': { 'role': 'rowgroup', 'data-sticky': null },
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
            'data-sticky': null,
          },
          'column-header[1]': {
            'aria-colindex': '2',
            'data-value': 'name',
            // 可排序但没在排：报 none
            'aria-sort': 'none',
            'data-sortable': '',
            'data-sticky': '',
          },
          'column-header[2]': { 'aria-colindex': '3', 'data-value': 'size', 'aria-sort': 'none' },
          'cell[0]': { 'role': 'gridcell', 'aria-colindex': '1', 'data-sticky': null, 'aria-colspan': null },
          'cell[1]': { 'aria-colindex': '2', 'data-sticky': '' },
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
            'data-state': 'none',
          },
          // 行内两个把手退出可及树与 Tab 序列
          'row-select-trigger[0]': { 'aria-hidden': 'true', 'tabindex': '-1' },
          'expand-trigger[0]': { 'aria-hidden': 'true', 'tabindex': '-1' },
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
          'select-all-trigger': { 'aria-checked': 'false', 'aria-disabled': 'false', 'data-state': 'none' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'row-select-trigger[0]',
          expect: {
            parts: {
              'row': rowsSelected('a'),
              'select-all-trigger': { 'aria-checked': 'mixed', 'data-state': 'some' },
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
              'select-all-trigger': { 'aria-checked': 'true', 'data-state': 'all' },
            },
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: {
              'row': rowsSelected(),
              'select-all-trigger': { 'aria-checked': 'false', 'data-state': 'none' },
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
          'root': { 'role': 'grid', 'data-empty': '', 'aria-busy': 'false', 'aria-rowcount': '2' },
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
