import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { buildHeatmapGrid, buildHeatmapMonthGrid, heatmapAnatomy, heatmapKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/'

/**
 * 固定挑 2024 年 1 月：1 号正好是星期一，周首日也定死在星期一，
 * 于是各行都不错列，行首那一格就是这个星期几在区间里最早的一天。
 * 起止日期与周首日全部显式给出，断言不会随运行日期改口。
 */
const RANGE = { startDate: '2024-01-01', endDate: '2024-01-31', firstDayOfWeek: 1, locale: 'zh-CN' } as const

const GRID = buildHeatmapGrid(RANGE)
/** 文档序的全部日期（行优先）；下标即 cell 的 part 下标。 */
const DAYS = GRID.rows.flatMap(row => row.cells.map(cell => cell.date))

/** 日期 → part 下标。写死数字没人看得懂，也经不起换区间。 */
function at(date: string): number {
  const index = DAYS.indexOf(date)
  if (index < 0)
    throw new Error(`${date} 不在 ${RANGE.startDate} 到 ${RANGE.endDate} 的网格里`)
  return index
}

/**
 * 网格由作者渲染（连接层只给数据、不生成节点），fixture 因此就是「作者照网格模型写出来的那棵树」。
 * 月份行排在网格之外：它只是一条对齐用的坐标轴，进了网格就得冒充表格行。
 * 各角色节点的身份一律写在 value 上：行与星期名是行序，格子是 ISO 日期，月份名是 YYYY-MM。
 */
function buildFixture(): FixtureNode {
  return {
    part: 'root',
    children: [
      {
        part: 'row',
        children: [
          // 行首占位：与下面各行的星期名同宽，月份才对得上列
          { part: 'week-day-label', tag: 'span' },
          ...GRID.months.map(month => ({
            part: 'month-label',
            tag: 'span',
            attrs: { value: month.value },
            text: month.label,
          })),
        ],
      },
      {
        part: 'grid',
        children: GRID.rows.map(row => ({
          part: 'row',
          attrs: { value: String(row.weekDay) },
          children: [
            {
              part: 'week-day-label',
              tag: 'span',
              attrs: { value: String(row.weekDay) },
              text: GRID.weekDays[row.weekDay]?.label ?? '',
            },
            ...row.cells.map(cell => ({ part: 'cell', attrs: { value: cell.date } })),
          ],
        })),
      },
      legendNode(GRID.levels),
    ],
  }
}

/**
 * 月历形态挑一段跨月的短区间：2024-01-29 是星期一，2 月 1 日是星期四，
 * 两个月块各只有一行，既演得出跨块走格，节点又少得能逐个断言。
 */
const MONTH_RANGE = { variant: 'month', startDate: '2024-01-29', endDate: '2024-02-04', firstDayOfWeek: 1, locale: 'zh-CN' } as const

const MONTH_GRID = buildHeatmapMonthGrid(MONTH_RANGE)
/** 月历形态文档序的全部日期；下标即 cell 的 part 下标。 */
const MONTH_DAYS = MONTH_GRID.weeks.flatMap(row => row.cells.map(cell => cell.date))

function monthAt(date: string): number {
  const index = MONTH_DAYS.indexOf(date)
  if (index < 0)
    throw new Error(`${date} 不在 ${MONTH_RANGE.startDate} 到 ${MONTH_RANGE.endDate} 的月历里`)
  return index
}

/** 矩阵形态：行列都由作者给，两行三列足够演出行列走格与两条表头。 */
const MATRIX_RANGE = {
  variant: 'matrix',
  rows: ['甲', '乙'],
  columns: ['上午', '下午', '夜里'],
  value: [
    { row: '甲', column: '上午', value: 2 },
    { row: '乙', column: '夜里', value: 8 },
  ],
} as const

/** 矩阵里一格的 part 下标：整张网格铺满，行优先。 */
function matrixAt(row: string, column: string): number {
  const r = MATRIX_RANGE.rows.indexOf(row as never)
  const c = MATRIX_RANGE.columns.indexOf(column as never)
  if (r < 0 || c < 0)
    throw new Error(`${row} × ${column} 不在矩阵的行列里`)
  return r * MATRIX_RANGE.columns.length + c
}

/** 色阶对照条：三种形态共用同一段结构，两端各一个字。 */
function legendNode(levels: number): FixtureNode {
  return {
    part: 'legend',
    children: [
      { part: 'legend-label', tag: 'span', attrs: { value: 'low' }, text: '少' },
      ...Array.from({ length: levels }, (_, level) => ({
        part: 'legend-item',
        tag: 'span',
        attrs: { value: String(level) },
      })),
      { part: 'legend-label', tag: 'span', attrs: { value: 'high' }, text: '多' },
    ],
  }
}

/**
 * 月历形态的树：网格里一个自然月一块，块内先一条星期名坐标轴，再逐周一行。
 * 块的月份身份写在 month-block 的 value 上，块里的行只写月内周序。
 */
function buildMonthFixture(): FixtureNode {
  return {
    part: 'root',
    children: [
      {
        part: 'grid',
        children: MONTH_GRID.blocks.map(block => ({
          part: 'month-block',
          attrs: { value: block.value },
          children: [
            { part: 'month-label', tag: 'span', attrs: { value: block.value }, text: block.label },
            {
              part: 'row',
              children: MONTH_GRID.weekDays.map(day => ({
                part: 'week-day-label',
                tag: 'span',
                attrs: { value: String(day.weekDay) },
                text: day.label,
              })),
            },
            ...block.weeks.map(row => ({
              part: 'row',
              attrs: { value: String(row.week) },
              children: row.cells.map(cell => ({ part: 'cell', attrs: { value: cell.date } })),
            })),
          ],
        })),
      },
      { part: 'tooltip' },
      legendNode(MONTH_GRID.levels),
    ],
  }
}

/** 矩阵形态的树：头一行是角落占位加列名，其余每行行首一个行名、其后逐列一格。 */
function buildMatrixFixture(): FixtureNode {
  return {
    part: 'root',
    children: [
      {
        part: 'grid',
        children: [
          {
            part: 'row',
            children: [
              { part: 'row-label', tag: 'span' },
              ...MATRIX_RANGE.columns.map(column => ({
                part: 'column-label',
                tag: 'span',
                attrs: { value: column },
                text: column,
              })),
            ],
          },
          ...MATRIX_RANGE.rows.map(row => ({
            part: 'row',
            attrs: { value: row },
            children: [
              { part: 'row-label', tag: 'span', attrs: { value: row }, text: row },
              ...MATRIX_RANGE.columns.map(column => ({ part: 'cell', attrs: { value: column } })),
            ],
          })),
        ],
      },
      { part: 'tooltip' },
      legendNode(5),
    ],
  }
}

/** 日历形态的树末尾再挂一条详情条：不写 tooltip 部件时整棵树与从前逐字一致。 */
function withTooltip(base: FixtureNode): FixtureNode {
  return { ...base, children: [...(base.children ?? []), { part: 'tooltip' }] }
}

/** 指针进出没有对应的步骤类型，只能直接派事件；处理器只用 currentTarget，普通事件够用。 */
function pointer(index: number, type: 'pointerenter' | 'pointerleave') {
  return (ctx: { doc: Document }): void => {
    const cells = ctx.doc.querySelectorAll<HTMLElement>('[data-scope="heatmap"][data-part="cell"]')
    const cell = cells[index]
    if (!cell)
      throw new Error(`第 ${index} 格不在文档里`)
    cell.dispatchEvent(new Event(type))
  }
}

export const heatmapSuite: ConformanceSuite = {
  component: 'heatmap',
  anatomy: heatmapAnatomy,
  keyboard: heatmapKeyboard,
  fixture: buildFixture(),
  cases: [
    {
      name: '默认：网格是只读的 grid，星期行是 row、格子是 gridcell，月份行不冒充表格行',
      spec: { apg: `${APG}#roles_states_properties` },
      props: RANGE,
      initial: {
        counts: {
          'root': 1,
          'grid': 1,
          // 七行星期加一条月份行
          'row': 8,
          // 每行行首一个，月份行行首那个占位也算一个
          'week-day-label': 8,
          'month-label': 1,
          'cell': 31,
          'legend': 1,
          // 两端各一个字
          'legend-label': 2,
          'legend-item': 5,
        },
        parts: {
          'grid': {
            'role': 'grid',
            'aria-readonly': 'true',
            'aria-rowcount': '7',
            'aria-colcount': '5',
            // 有格子认领 Tab 位时容器让位
            'tabindex': '-1',
          },
          // 月份行在网格之外，既无 role 也无行号
          'row[0]': { 'role': null, 'aria-rowindex': null, 'data-week-day': null, 'aria-label': null },
          // 星期名是隔行画的，哪一行是星期几改由行自己念出来
          'row[1]': { 'role': 'row', 'aria-rowindex': '1', 'data-week-day': '0', 'aria-label': '星期一' },
          'row[7]': { 'role': 'row', 'aria-rowindex': '7', 'data-week-day': '6', 'aria-label': '星期日' },
          // 星期名与月份名都是给眼睛看的坐标轴，一律藏起来
          'week-day-label[0]': { 'aria-hidden': 'true', 'data-week-day': null },
          'week-day-label[1]': { 'aria-hidden': 'true', 'data-week-day': '0' },
          'month-label[0]': { 'aria-hidden': 'true', 'data-value': '2024-01' },
          // 图例容器不藏：两端那两个字要念得到，藏起来的是色块本身
          'legend': { 'aria-hidden': null, 'role': 'group', 'aria-label': 'Activity level' },
          'legend-label[0]': { 'aria-hidden': null, 'data-bound': 'low' },
          'legend-label[1]': { 'aria-hidden': null, 'data-bound': 'high' },
          'legend-item[2]': { 'aria-hidden': 'true', 'data-level': '2' },
        },
        activeElement: null,
      },
    },
    {
      name: '每格是 gridcell，带日期身份、档位与列号；各行格子数不齐时列号才对得上',
      spec: { apg: `${APG}#roles_states_properties` },
      props: {
        ...RANGE,
        value: [
          { date: '2024-01-01', count: 1 },
          { date: '2024-01-02', count: 10 },
        ],
      },
      initial: {
        parts: {
          [`cell[${at('2024-01-01')}]`]: {
            'role': 'gridcell',
            'aria-label': '1 on 2024-01-01',
            'aria-colindex': '1',
            'data-value': '2024-01-01',
            'data-level': '1',
            'tabindex': '0',
            // 格子不是控件，绝不输出原生 disabled
            'disabled': null,
          },
          [`cell[${at('2024-01-02')}]`]: {
            'aria-label': '10 on 2024-01-02',
            'aria-colindex': '1',
            'data-level': '4',
            'tabindex': '-1',
          },
          [`cell[${at('2024-01-08')}]`]: {
            'aria-label': '0 on 2024-01-08',
            'aria-colindex': '2',
            'data-level': '0',
          },
        },
      },
    },
    {
      name: '文案整条可换：格子里没有文字，可及名字只能从 translations 出',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      props: {
        ...RANGE,
        value: [{ date: '2024-01-01', count: 3 }],
        translations: {
          gridLabel: '活跃度',
          cellLabel: (details: { date: string, count: number }) => `${details.date} 共 ${details.count} 次`,
          legendLabel: '活跃度色阶',
        },
      },
      initial: {
        parts: {
          grid: { 'aria-label': '活跃度' },
          [`cell[${at('2024-01-01')}]`]: { 'aria-label': '2024-01-01 共 3 次' },
          // 一排色块的名字也从文案出：作者不换它，读屏听到的就是英文缺省
          legend: { 'aria-label': '活跃度色阶' },
        },
      },
    },
    {
      name: 'roving tabindex：整张网格只有一个 Tab 停靠点，锚点默认落在文档序头一格',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.tab'],
      props: RANGE,
      steps: [singleTabStop('heatmap', 'cell', 'grid')],
    },
    {
      name: '左右键走相邻的周、上下键走相邻的一天，锚点跟着焦点搬',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.prev-week', 'heatmap.kbd.next-week', 'heatmap.kbd.prev-day', 'heatmap.kbd.next-day'],
      props: RANGE,
      steps: [
        { kind: 'focus', part: `cell[${at('2024-01-01')}]` },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: `cell[${at('2024-01-08')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { activeElement: { part: `cell[${at('2024-01-09')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: `cell[${at('2024-01-02')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            activeElement: { part: `cell[${at('2024-01-01')}]`, exact: true },
            // 锚点跟着焦点走，Tab 位也跟着搬
            parts: { [`cell[${at('2024-01-01')}]`]: { tabindex: '0' } },
          },
        },
      ],
    },
    {
      name: '走到区间边界原地不动，但按键照样拦下：不然页面会跟着滚',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: RANGE,
      steps: [
        { kind: 'focus', part: `cell[${at('2024-01-01')}]` },
        {
          kind: 'raw',
          why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象',
          run: ({ doc }) => {
            const cell = doc.querySelectorAll<HTMLElement>('[data-scope="heatmap"][data-part="cell"]')[0]!
            const blocked = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
            cell.dispatchEvent(blocked)
            if (!blocked.defaultPrevented)
              throw new Error('走到边界时方向键没被拦下：页面会跟着一起滚')
            // 不归导航管的键必须放行，否则页面再也滚不动
            const free = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true })
            cell.dispatchEvent(free)
            if (free.defaultPrevented)
              throw new Error('网格把 Space 吞掉了：页面滚动会跟着一起没')
          },
          expect: { activeElement: { part: `cell[${at('2024-01-01')}]`, exact: true } },
        },
      ],
    },
    {
      name: 'Home/End 走本行的首末格：行首行尾按本行实际有的格子取，不按日历上的周界取',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.row-start', 'heatmap.kbd.row-end'],
      props: RANGE,
      steps: [
        { kind: 'focus', part: `cell[${at('2024-01-17')}]` },
        {
          kind: 'key',
          key: 'Home',
          expect: { activeElement: { part: `cell[${at('2024-01-03')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'End',
          expect: { activeElement: { part: `cell[${at('2024-01-31')}]`, exact: true } },
        },
      ],
    },
    {
      name: 'Ctrl 加持的 Home/End 跳到整张网格文档序的两端',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.grid-start', 'heatmap.kbd.grid-end'],
      props: RANGE,
      steps: [
        { kind: 'focus', part: `cell[${at('2024-01-17')}]` },
        {
          kind: 'key',
          key: 'Home',
          modifiers: ['Control'],
          expect: { activeElement: { part: `cell[${at('2024-01-01')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'End',
          modifiers: ['Control'],
          expect: { activeElement: { part: `cell[${at('2024-01-28')}]`, exact: true } },
        },
      ],
    },
    {
      name: 'dir=rtl：列的视觉次序整体翻转，左右键语义跟着对调，上下键不受影响',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.prev-week', 'heatmap.kbd.next-week'],
      props: { ...RANGE, dir: 'rtl' },
      steps: [
        { kind: 'focus', part: `cell[${at('2024-01-08')}]` },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: `cell[${at('2024-01-15')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: `cell[${at('2024-01-08')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { activeElement: { part: `cell[${at('2024-01-09')}]`, exact: true } },
        },
      ],
    },
    {
      name: '三轴只落在 root 上，子部件不重复标注',
      spec: { adr: 'visual-axes' },
      props: { ...RANGE, tone: 'success', size: 'lg' },
      initial: {
        parts: {
          'root': { 'data-tone': 'success', 'data-size': 'lg' },
          'grid': { 'data-tone': null, 'data-size': null },
          'cell[0]': { 'data-tone': null, 'data-size': null },
        },
      },
    },
    {
      name: '月历形态：一个自然月一块，块是 rowgroup，块内的星期名坐标轴整条藏起来',
      spec: { apg: `${APG}#roles_states_properties` },
      fixture: buildMonthFixture,
      props: MONTH_RANGE,
      initial: {
        counts: {
          'root': 1,
          'grid': 1,
          'month-block': 2,
          // 每块一条星期名轴加它自己的周行
          'row': 4,
          'week-day-label': 14,
          'month-label': 2,
          'cell': 7,
          'tooltip': 1,
          'legend': 1,
          // 两端各一个字
          'legend-label': 2,
          'legend-item': 5,
        },
        parts: {
          'root': { 'data-variant': 'month' },
          // 行数是所有月块的周行之和，列数恒是七
          'grid': { 'role': 'grid', 'aria-readonly': 'true', 'aria-rowcount': '2', 'aria-colcount': '7' },
          'month-block[0]': { 'role': 'rowgroup', 'data-value': '2024-01' },
          // 块里的星期名轴：整条藏起来，读屏看到的这一块就只剩合法的几行
          'row[0]': { 'aria-hidden': 'true', 'role': null },
          'row[1]': { 'role': 'row', 'aria-rowindex': '1' },
          'row[3]': { 'role': 'row', 'aria-rowindex': '2' },
          'month-label[0]': { 'aria-hidden': 'true', 'data-value': '2024-01' },
        },
      },
    },
    {
      name: '月历形态：格子的列号是星期几，1 号那一行按它真实的星期几往后错列',
      spec: { apg: `${APG}#roles_states_properties` },
      fixture: buildMonthFixture,
      props: { ...MONTH_RANGE, value: [{ date: '2024-02-01', count: 4 }] },
      initial: {
        parts: {
          // 2024-01-29 是星期一
          [`cell[${monthAt('2024-01-29')}]`]: { 'aria-colindex': '1', 'aria-label': '0 on 2024-01-29', 'tabindex': '0' },
          // 2024-02-01 是星期四
          [`cell[${monthAt('2024-02-01')}]`]: { 'aria-colindex': '4', 'aria-label': '4 on 2024-02-01' },
        },
      },
    },
    {
      name: '月历形态：横着走一天、竖着走一周，走到月末落进下一块',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.prev-week', 'heatmap.kbd.next-week', 'heatmap.kbd.prev-day', 'heatmap.kbd.next-day'],
      fixture: buildMonthFixture,
      props: MONTH_RANGE,
      steps: [
        { kind: 'focus', part: `cell[${monthAt('2024-01-31')}]` },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: `cell[${monthAt('2024-02-01')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: `cell[${monthAt('2024-01-31')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          // 竖着一步是一周：1 月 31 日往下就是 2 月 7 日，已出区间，原地不动
          expect: { activeElement: { part: `cell[${monthAt('2024-01-31')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { activeElement: { part: `cell[${monthAt('2024-01-31')}]`, exact: true } },
        },
      ],
    },
    {
      name: '月历形态：Home/End 走本周行在本块里的首末格，Ctrl 加持的两键跳到整段区间两端',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.row-start', 'heatmap.kbd.row-end', 'heatmap.kbd.grid-start', 'heatmap.kbd.grid-end'],
      fixture: buildMonthFixture,
      props: MONTH_RANGE,
      steps: [
        { kind: 'focus', part: `cell[${monthAt('2024-02-02')}]` },
        {
          kind: 'key',
          key: 'Home',
          expect: { activeElement: { part: `cell[${monthAt('2024-02-01')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'End',
          expect: { activeElement: { part: `cell[${monthAt('2024-02-04')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'Home',
          modifiers: ['Control'],
          expect: { activeElement: { part: `cell[${monthAt('2024-01-29')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'End',
          modifiers: ['Control'],
          expect: { activeElement: { part: `cell[${monthAt('2024-02-04')}]`, exact: true } },
        },
      ],
    },
    {
      name: '矩阵形态：行名是 rowheader、列名是 columnheader，角落占位不进读屏',
      spec: { apg: `${APG}#roles_states_properties` },
      fixture: buildMatrixFixture,
      props: MATRIX_RANGE,
      initial: {
        counts: {
          'root': 1,
          'grid': 1,
          // 表头行加两条数据行
          'row': 3,
          // 角落占位加两个行名
          'row-label': 3,
          'column-label': 3,
          'cell': 6,
          'tooltip': 1,
          'legend': 1,
          // 两端各一个字
          'legend-label': 2,
          'legend-item': 5,
        },
        parts: {
          'root': { 'data-variant': 'matrix' },
          // 两条表头也算进行列总数，读屏报的行列号才对得上
          'grid': { 'role': 'grid', 'aria-readonly': 'true', 'aria-rowcount': '3', 'aria-colcount': '4' },
          'row[0]': { 'role': 'row', 'aria-rowindex': '1' },
          'row[1]': { 'role': 'row', 'aria-rowindex': '2', 'data-value': '甲' },
          'row-label[0]': { 'aria-hidden': 'true', 'role': null },
          'row-label[1]': { 'role': 'rowheader', 'aria-colindex': '1', 'data-value': '甲' },
          'column-label[2]': { 'role': 'columnheader', 'aria-colindex': '4', 'data-value': '夜里' },
        },
      },
    },
    {
      name: '矩阵形态：一格的身份是行加列两个属性，可及名字走矩阵那条文案',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      fixture: buildMatrixFixture,
      props: MATRIX_RANGE,
      initial: {
        parts: {
          [`cell[${matrixAt('甲', '上午')}]`]: {
            'role': 'gridcell',
            'aria-label': '2 at 甲 上午',
            'aria-colindex': '2',
            'data-value': '上午',
            'data-row': '甲',
            'data-level': '2',
            'tabindex': '0',
          },
          [`cell[${matrixAt('乙', '夜里')}]`]: {
            'aria-label': '8 at 乙 夜里',
            'aria-colindex': '4',
            'data-row': '乙',
            'data-level': '4',
            'tabindex': '-1',
          },
          [`cell[${matrixAt('乙', '下午')}]`]: { 'aria-label': '0 at 乙 下午', 'data-level': '0' },
        },
      },
    },
    {
      name: '矩阵形态：方向键按行列走，四面到边就停住但按键照样拦下',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.prev-week', 'heatmap.kbd.next-week', 'heatmap.kbd.prev-day', 'heatmap.kbd.next-day', 'heatmap.kbd.row-start', 'heatmap.kbd.row-end'],
      fixture: buildMatrixFixture,
      props: MATRIX_RANGE,
      steps: [
        { kind: 'focus', part: `cell[${matrixAt('甲', '上午')}]` },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { activeElement: { part: `cell[${matrixAt('甲', '下午')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { activeElement: { part: `cell[${matrixAt('乙', '下午')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { activeElement: { part: `cell[${matrixAt('乙', '下午')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'End',
          expect: { activeElement: { part: `cell[${matrixAt('乙', '夜里')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: { activeElement: { part: `cell[${matrixAt('乙', '上午')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: `cell[${matrixAt('乙', '上午')}]`, exact: true } },
        },
      ],
    },
    {
      name: '详情条：指针进到某一格就打开，离开即收起',
      spec: { adr: 'visual-axes' },
      fixture: withTooltip,
      props: { ...RANGE, value: [{ date: '2024-01-02', count: 9 }] },
      initial: {
        // 没有活跃的格子时整条收起，落点与摆放方向都不写
        parts: { tooltip: { 'hidden': '', 'aria-hidden': 'true', 'data-placement': null } },
      },
      steps: [
        {
          kind: 'raw',
          why: '指针进出没有对应的步骤类型，只能直接派事件',
          run: pointer(at('2024-01-02'), 'pointerenter'),
          expect: { parts: { tooltip: { 'hidden': null, 'data-placement': 'block-end' } } },
        },
        {
          kind: 'raw',
          why: '同上：指针离开也只能直接派事件',
          run: pointer(at('2024-01-02'), 'pointerleave'),
          expect: { parts: { tooltip: { hidden: '' } } },
        },
      ],
    },
    {
      name: '详情条：键盘聚焦一样打开，焦点走出网格才收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      fixture: withTooltip,
      props: RANGE,
      steps: [
        {
          kind: 'focus',
          part: `cell[${at('2024-01-02')}]`,
          expect: { parts: { tooltip: { hidden: null } } },
        },
        {
          // 网格内换一格不算离场，详情跟着焦点继续显示
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: `cell[${at('2024-01-03')}]`, exact: true },
            parts: { tooltip: { hidden: null } },
          },
        },
        {
          // 焦点整个离开网格：详情收起，锚点留着
          kind: 'blur',
          expect: { parts: { tooltip: { hidden: '' } } },
        },
      ],
    },
    {
      name: '详情条：Escape 收起但焦点不动，再走一格又打开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['heatmap.kbd.dismiss'],
      fixture: withTooltip,
      props: RANGE,
      steps: [
        {
          kind: 'focus',
          part: `cell[${at('2024-01-02')}]`,
          expect: { parts: { tooltip: { hidden: null } } },
        },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { tooltip: { hidden: '' } },
            activeElement: { part: `cell[${at('2024-01-02')}]`, exact: true },
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: `cell[${at('2024-01-03')}]`, exact: true },
            parts: { tooltip: { hidden: null } },
          },
        },
      ],
    },
    {
      name: '不写 variant 时 root 上不产出 data-variant：默认那一档的行为逐字不变',
      spec: { adr: 'visual-axes' },
      props: RANGE,
      initial: {
        parts: { root: { 'data-variant': null } },
      },
    },
  ],
}
