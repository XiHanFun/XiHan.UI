import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { buildHeatmapGrid, heatmapAnatomy, heatmapKeyboard } from '@xihan-ui/headless'
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
      {
        part: 'legend',
        children: Array.from({ length: GRID.levels }, (_, level) => ({
          part: 'legend-item',
          tag: 'span',
          attrs: { value: String(level) },
        })),
      },
    ],
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
          'row[0]': { 'role': null, 'aria-rowindex': null, 'data-week-day': null },
          'row[1]': { 'role': 'row', 'aria-rowindex': '1', 'data-week-day': '0' },
          'row[7]': { 'role': 'row', 'aria-rowindex': '7', 'data-week-day': '6' },
          // 星期名与月份名都是给眼睛看的坐标轴，一律藏起来
          'week-day-label[0]': { 'aria-hidden': 'true', 'data-week-day': null },
          'week-day-label[1]': { 'aria-hidden': 'true', 'data-week-day': '0' },
          'month-label[0]': { 'aria-hidden': 'true', 'data-value': '2024-01' },
          // 图例容器不藏：作者写在色块旁的方向说明要念得到；藏起来的是色块本身
          'legend': { 'aria-hidden': null },
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
        },
      },
      initial: {
        parts: {
          grid: { 'aria-label': '活跃度' },
          [`cell[${at('2024-01-01')}]`]: { 'aria-label': '2024-01-01 共 3 次' },
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
  ],
}
