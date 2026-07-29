import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { buildMonthGrid, buildWeekDays, calendarAnatomy, calendarKeyboard } from '@xihan-ui/headless'
import { nativeActivation, singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/'

/**
 * 固定挑 2024 年 2 月：闰年（29 天）、zh-CN 下从 1 月 29 日起算，
 * 首尾两行都带着邻月的日子——邻月格子是最容易被漏掉的一层。
 * 用例一律显式给 defaultFocusedValue 与 timeZone，"今天"因此永远落在这个月之外，
 * 断言不会随运行日期改口。
 */
const ANCHOR = '2024-02-15'
const LOCALE = 'zh-CN'
const BASE_PROPS = { defaultFocusedValue: ANCHOR, locale: LOCALE, timeZone: 'UTC' } as const

const GRID = buildMonthGrid(ANCHOR, { locale: LOCALE })
const WEEK_DAYS = buildWeekDays({ reference: GRID.monthStart, locale: LOCALE, timeZone: 'UTC' })
/** 网格里全部日期，文档序；下标即 cell/cell-trigger 的 part 下标。 */
const DAYS = GRID.weeks.flat().map(d => d.value)

/** 日期 → part 下标。写死数字没人看得懂，也经不起换月份。 */
function at(value: string): number {
  const i = DAYS.indexOf(value)
  if (i < 0)
    throw new Error(`${value} 不在 ${ANCHOR} 那个月的网格里`)
  return i
}

/**
 * 网格由作者渲染（连接层只给数据、不生成节点），fixture 因此就是"作者照 weeks 写出来的那棵树"。
 * 日期身份只写在 cell 上，cell-trigger 跟着它所在的 cell 走。
 */
function buildFixture(fixedWeeks = false): FixtureNode {
  const grid = fixedWeeks ? buildMonthGrid(ANCHOR, { locale: LOCALE, fixedWeeks: true }) : GRID
  return {
    part: 'root',
    children: [
      {
        part: 'header',
        children: [
          { part: 'prev-trigger', tag: 'button', text: '上个月' },
          { part: 'heading', text: '2024年2月' },
          { part: 'next-trigger', tag: 'button', text: '下个月' },
        ],
      },
      {
        part: 'grid',
        children: [
          {
            part: 'grid-head',
            children: [{
              // 列头得待在一行里：columnheader 直接挂在 rowgroup 下，grid 的行列语义从表头就断了
              part: 'week-row',
              children: WEEK_DAYS.map(d => ({
                part: 'week-day',
                tag: 'span',
                attrs: { value: String(d.value) },
                text: d.label,
              })),
            }],
          },
          {
            part: 'grid-body',
            children: grid.weeks.map(week => ({
              part: 'week-row',
              children: week.map(day => ({
                part: 'cell',
                attrs: { value: day.value },
                children: [{ part: 'cell-trigger', text: String(day.day) }],
              })),
            })),
          },
        ],
      },
    ],
  }
}

const FIXTURE = buildFixture()

/** 逐格写全某几天的选中态：只写关心的那一格会漏掉"另一天也被选中了"。 */
function selection(...values: readonly string[]): Record<string, { 'aria-selected': string, 'data-selected': string | null }> {
  const out: Record<string, { 'aria-selected': string, 'data-selected': string | null }> = {}
  for (const day of [...new Set([...values, '2024-02-15', '2024-02-16', '2024-02-18'])]) {
    out[`cell-trigger[${at(day)}]`] = {
      'aria-selected': values.includes(day) ? 'true' : 'false',
      'data-selected': values.includes(day) ? '' : null,
    }
  }
  return out
}

export const calendarSuite: ConformanceSuite = {
  component: 'calendar',
  anatomy: calendarAnatomy,
  keyboard: calendarKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：grid 是 grid 且三态显式给出，cell 只担 gridcell，选中/禁用标在 cell-trigger 上',
      spec: { apg: `${APG}#rps_label` },
      props: BASE_PROPS,
      initial: {
        counts: {
          'root': 1,
          'header': 1,
          'prev-trigger': 1,
          'next-trigger': 1,
          'heading': 1,
          'grid': 1,
          'grid-head': 1,
          'week-day': 7,
          'grid-body': 1,
          // 表头一行 + 五个周行
          'week-row': 6,
          'cell': DAYS.length,
          'cell-trigger': DAYS.length,
        },
        parts: {
          'root': { 'data-disabled': null, 'data-readonly': null },
          'heading': { id: '@self' },
          'grid': {
            'role': 'grid',
            'aria-labelledby': '@part(heading)',
            // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了不是"
            'aria-multiselectable': 'false',
            'aria-disabled': 'false',
            'aria-readonly': 'false',
            'data-disabled': null,
          },
          'grid-head': { role: 'rowgroup' },
          'grid-body': { role: 'rowgroup' },
          'week-row[0]': { role: 'row' },
          'week-row[1]': { role: 'row' },
          'week-day[0]': { 'role': 'columnheader', 'aria-label': '星期一', 'data-value': '0' },
          'week-day[6]': { 'role': 'columnheader', 'aria-label': '星期日', 'data-value': '6' },
          'prev-trigger': { 'type': 'button', 'disabled': null, 'data-disabled': null },
          'next-trigger': { 'type': 'button', 'disabled': null, 'data-disabled': null },
          [`cell[${at(ANCHOR)}]`]: {
            'role': 'gridcell',
            'data-value': ANCHOR,
            'data-focused': '',
            'data-outside-month': null,
            // 选中与禁用不标在 gridcell 上：用户停不到这一层
            'aria-selected': null,
            'aria-disabled': null,
          },
          [`cell-trigger[${at(ANCHOR)}]`]: {
            'role': 'button',
            'data-value': ANCHOR,
            'aria-selected': 'false',
            'aria-disabled': 'false',
            'data-focused': '',
            'data-today': null,
            // roving tabindex：聚焦日那一格是整张网格唯一的 Tab 停靠点
            'tabindex': '0',
            // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
            'disabled': null,
          },
          // 首行是上个月的尾巴，照样是真格子
          'cell-trigger[0]': { 'data-value': '2024-01-29', 'data-outside-month': '', 'tabindex': '-1' },
          [`cell-trigger[${DAYS.length - 1}]`]: { 'data-value': '2024-03-03', 'data-outside-month': '' },
          [`cell-trigger[${at('2024-02-29')}]`]: { 'data-value': '2024-02-29', 'data-outside-month': null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '可及名字是逐格算出来的文案，属性期望表里挨个写 35 条只会把用例淹掉',
          run: ({ doc }) => {
            const triggers = [...doc.querySelectorAll<HTMLElement>('[data-scope="calendar"][data-part="cell-trigger"]')]
            const naked = triggers.filter(el => !el.getAttribute('aria-label'))
            if (naked.length)
              throw new Error(`${naked.length} 个日期格没有可及名字：只念一个数字，读屏用户不知道是哪一天`)
            // 每格各不相同才说明名字是按本格日期算的，而不是抄了聚焦日
            if (new Set(triggers.map(el => el.getAttribute('aria-label'))).size !== triggers.length)
              throw new Error('日期格的可及名字有重复：名字没按本格的日期算')
          },
        },
      ],
    },
    {
      // 整张网格只占一个 Tab 位
      name: 'roving tabindex：整张网格只有聚焦日那一格占 Tab 位，方向键把它整个搬走',
      spec: { apg: APG },
      props: BASE_PROPS,
      covers: ['calendar.kbd.tab'],
      steps: [
        singleTabStop('calendar', 'cell-trigger', 'grid'),
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        { kind: 'key', key: 'ArrowRight' },
        singleTabStop('calendar', 'cell-trigger', 'grid'),
        {
          kind: 'settle',
          until: { activeElement: `cell-trigger[${at('2024-02-16')}]` },
          expect: {
            activeElement: { part: `cell-trigger[${at('2024-02-16')}]`, exact: true },
            parts: {
              [`cell-trigger[${at('2024-02-16')}]`]: { 'tabindex': '0', 'data-focused': '' },
              [`cell-trigger[${at(ANCHOR)}]`]: { 'tabindex': '-1', 'data-focused': null },
            },
          },
        },
      ],
    },
    {
      name: '方向键：左右走天、上下走周，一路只搬焦点不改选中值',
      spec: { apg: `${APG}#kbd_label` },
      props: BASE_PROPS,
      covers: ['calendar.kbd.prev-day', 'calendar.kbd.next-day', 'calendar.kbd.prev-week', 'calendar.kbd.next-week'],
      steps: [
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { [`cell-trigger[${at('2024-02-16')}]`]: { 'data-focused': '', 'tabindex': '0' } }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { [`cell-trigger[${at('2024-02-23')}]`]: { 'data-focused': '', 'tabindex': '0' } }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { parts: { [`cell-trigger[${at('2024-02-16')}]`]: { 'data-focused': '' } }, events: [] },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: { [`cell-trigger[${at(ANCHOR)}]`]: { 'data-focused': '' }, ...selection() },
            // 方向键走了一圈，一天都不该被选中
            events: [],
          },
        },
      ],
    },
    {
      name: 'Home/End 到本周首末：周界随 locale 变（zh-CN 周一起）',
      spec: { apg: `${APG}#kbd_label` },
      props: BASE_PROPS,
      covers: ['calendar.kbd.week-start', 'calendar.kbd.week-end'],
      steps: [
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        {
          kind: 'key',
          key: 'Home',
          expect: { parts: { [`cell-trigger[${at('2024-02-12')}]`]: { 'data-focused': '', 'tabindex': '0' } } },
        },
        {
          kind: 'key',
          key: 'End',
          expect: { parts: { [`cell-trigger[${at('2024-02-18')}]`]: { 'data-focused': '', 'tabindex': '0' } } },
        },
      ],
    },
    {
      // fixture 钉死在二月：换月后二月的格子转成邻月，一月的尾巴变成本月
      name: 'PageUp/PageDown 翻月：展示月跟着聚焦日走，邻月标记整体翻面',
      spec: { apg: `${APG}#kbd_label` },
      props: BASE_PROPS,
      covers: ['calendar.kbd.prev-month', 'calendar.kbd.next-month', 'calendar.kbd.select'],
      steps: [
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        {
          kind: 'key',
          key: 'PageUp',
          expect: {
            parts: {
              // 一月的日子这下成了本月
              'cell[0]': { 'data-value': '2024-01-29', 'data-outside-month': null },
              // 二月的日子成了邻月，连聚焦日那一格也不再认领 Tab 位（1 月 15 日没画出来）
              [`cell[${at('2024-02-01')}]`]: { 'data-outside-month': '' },
              [`cell-trigger[${at(ANCHOR)}]`]: { 'tabindex': '-1', 'data-focused': null },
            },
          },
        },
        {
          // 聚焦日确实落到了一月：确认键选中的是它，而不是原来那天
          kind: 'key',
          key: 'Enter',
          expect: { events: [{ type: 'value-change', detail: { value: ['2024-01-15'] } }] },
        },
        {
          kind: 'key',
          key: 'PageDown',
          expect: {
            parts: {
              'cell[0]': { 'data-outside-month': '' },
              [`cell-trigger[${at(ANCHOR)}]`]: { 'tabindex': '0', 'data-focused': '' },
            },
          },
        },
      ],
    },
    {
      name: 'Shift+PageUp/PageDown 翻年',
      spec: { apg: `${APG}#kbd_label` },
      props: BASE_PROPS,
      covers: ['calendar.kbd.prev-year', 'calendar.kbd.next-year'],
      steps: [
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        { kind: 'key', key: 'PageUp', modifiers: ['Shift'] },
        {
          kind: 'key',
          key: 'Enter',
          expect: { events: [{ type: 'value-change', detail: { value: ['2023-02-15'] } }] },
        },
        { kind: 'key', key: 'PageDown', modifiers: ['Shift'] },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: selection(ANCHOR),
            events: [{ type: 'value-change', detail: { value: [ANCHOR] } }],
          },
        },
      ],
    },
    {
      name: '单选：Enter / Space 选中聚焦日并替换原有选中',
      spec: { apg: `${APG}#kbd_label` },
      props: BASE_PROPS,
      covers: ['calendar.kbd.select'],
      steps: [
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        {
          kind: 'key',
          key: 'Space',
          expect: { parts: selection(ANCHOR), events: [{ type: 'value-change', detail: { value: [ANCHOR] } }] },
        },
        { kind: 'key', key: 'ArrowRight', expect: { events: [] } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: selection('2024-02-16'),
            events: [{ type: 'value-change', detail: { value: ['2024-02-16'] } }],
          },
        },
      ],
    },
    {
      name: '点击：单选替换；点邻月的日子会连带把展示月翻过去',
      spec: { apg: APG },
      props: BASE_PROPS,
      steps: [
        {
          kind: 'click',
          part: `cell-trigger[${at(ANCHOR)}]`,
          expect: { parts: selection(ANCHOR), events: [{ type: 'value-change', detail: { value: [ANCHOR] } }] },
        },
        {
          kind: 'click',
          part: 'cell-trigger[0]',
          expect: {
            // 点了一月 29 日：选中换成它，展示月一并翻到一月（二月的格子转成邻月）
            parts: {
              'cell-trigger[0]': { 'aria-selected': 'true', 'data-outside-month': null, 'tabindex': '0' },
              [`cell[${at('2024-02-01')}]`]: { 'data-outside-month': '' },
            },
            events: [{ type: 'value-change', detail: { value: ['2024-01-29'] } }],
          },
        },
      ],
    },
    {
      name: '多选：点击切换而不是替换，集合按日期升序，grid 报 aria-multiselectable',
      spec: { apg: APG },
      props: { ...BASE_PROPS, selectionMode: 'multiple' },
      initial: { parts: { grid: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'click', part: `cell-trigger[${at('2024-02-18')}]` },
        {
          kind: 'click',
          part: `cell-trigger[${at(ANCHOR)}]`,
          expect: {
            parts: selection(ANCHOR, '2024-02-18'),
            // 点的顺序是 18 → 15，回传的却是升序：宿主不必自己排
            events: [{ type: 'value-change', detail: { value: ['2024-02-15', '2024-02-18'] } }],
          },
        },
        {
          kind: 'click',
          part: `cell-trigger[${at('2024-02-18')}]`,
          expect: {
            parts: selection(ANCHOR),
            events: [{ type: 'value-change', detail: { value: [ANCHOR] } }],
          },
        },
      ],
    },
    {
      name: '区间：先落起点再落终点，中间态就有 range-start / in-range / range-end 三件套',
      spec: { apg: APG },
      props: { ...BASE_PROPS, selectionMode: 'range' },
      steps: [
        {
          kind: 'click',
          part: `cell-trigger[${at(ANCHOR)}]`,
          expect: {
            parts: {
              // 只落了起点，两端重合：起点自己既是首也是尾
              [`cell-trigger[${at(ANCHOR)}]`]: { 'data-range-start': '', 'data-range-end': '', 'data-in-range': '' },
              [`cell-trigger[${at('2024-02-16')}]`]: { 'data-in-range': null },
            },
            // 半成品也如实通知：宿主要能显示"起 2 月 15 日"
            events: [{ type: 'value-change', detail: { value: [ANCHOR] } }],
          },
        },
        {
          kind: 'click',
          part: `cell-trigger[${at('2024-02-18')}]`,
          expect: {
            parts: {
              [`cell-trigger[${at(ANCHOR)}]`]: { 'data-range-start': '', 'data-range-end': null, 'data-in-range': '' },
              [`cell-trigger[${at('2024-02-16')}]`]: { 'data-in-range': '', 'data-range-start': null },
              [`cell-trigger[${at('2024-02-18')}]`]: { 'data-range-end': '', 'data-in-range': '' },
              [`cell-trigger[${at('2024-02-19')}]`]: { 'data-in-range': null },
            },
            events: [{ type: 'value-change', detail: { value: [ANCHOR, '2024-02-18'] } }],
          },
        },
        {
          // 区间已完成，再点一下重新开一段
          kind: 'click',
          part: `cell-trigger[${at('2024-02-12')}]`,
          expect: { events: [{ type: 'value-change', detail: { value: ['2024-02-12'] } }] },
        },
      ],
    },
    {
      name: 'min/max 之外的日子转 aria-disabled：仍可聚焦、仍是方向键起点，但选不动',
      spec: { apg: APG },
      props: { ...BASE_PROPS, min: '2024-02-10', max: '2024-02-20' },
      initial: {
        parts: {
          // 整个上一月都在 min 之前、整个下一月都在 max 之后：两个按钮都走不通
          'prev-trigger': { 'disabled': '', 'data-disabled': '' },
          'next-trigger': { 'disabled': '', 'data-disabled': '' },
          [`cell-trigger[${at('2024-02-01')}]`]: { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
          [`cell-trigger[${at('2024-02-10')}]`]: { 'aria-disabled': 'false', 'data-disabled': null },
          [`cell-trigger[${at('2024-02-25')}]`]: { 'aria-disabled': 'true' },
        },
      },
      steps: [
        // 用 aria-disabled 表达禁用，click 不被激活行为短路，事件派得出去才碰得到连接层守卫
        {
          kind: 'click',
          part: `cell-trigger[${at('2024-02-01')}]`,
          expect: { parts: selection(), events: [] },
        },
        // 焦点照样落在那一格，方向键从它起步
        {
          kind: 'focus',
          part: `cell-trigger[${at('2024-02-09')}]`,
          expect: { activeElement: { part: `cell-trigger[${at('2024-02-09')}]`, exact: true } },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { [`cell-trigger[${at('2024-02-10')}]`]: { 'data-focused': '', 'tabindex': '0' } } },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: { events: [{ type: 'value-change', detail: { value: ['2024-02-10'] } }] },
        },
      ],
    },
    {
      name: '只读：焦点与翻月照常，就是选不动',
      spec: { apg: APG },
      props: { ...BASE_PROPS, readOnly: true },
      initial: { parts: { root: { 'data-readonly': '' }, grid: { 'aria-readonly': 'true' } } },
      steps: [
        {
          kind: 'click',
          part: `cell-trigger[${at('2024-02-16')}]`,
          expect: {
            // 值不动，但焦点锚点跟着点击走
            parts: { ...selection(), [`cell-trigger[${at('2024-02-16')}]`]: { 'data-focused': '', 'tabindex': '0' } },
            events: [],
          },
        },
        { kind: 'key', key: 'Enter', expect: { parts: selection(), events: [] } },
      ],
    },
    {
      name: '整张禁用：翻月按钮转原生 disabled，格子全转 aria-disabled，键盘与点击都改不了值',
      spec: { apg: APG },
      props: { ...BASE_PROPS, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'grid': { 'aria-disabled': 'true', 'data-disabled': '' },
          'prev-trigger': { disabled: '' },
          'next-trigger': { disabled: '' },
          [`cell-trigger[${at(ANCHOR)}]`]: { 'aria-disabled': 'true', 'disabled': null },
          [`cell-trigger[${at('2024-02-16')}]`]: { 'aria-disabled': 'true' },
        },
      },
      steps: [
        { kind: 'click', part: `cell-trigger[${at('2024-02-16')}]`, expect: { parts: selection(), events: [] } },
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { [`cell-trigger[${at(ANCHOR)}]`]: { 'data-focused': '' } }, events: [] },
        },
        { kind: 'key', key: 'Enter', expect: { parts: selection(), events: [] } },
      ],
    },
    {
      name: '翻月按钮：改展示月但不抢焦点（抢了就再也连点不了下一月）',
      spec: { apg: APG },
      props: BASE_PROPS,
      steps: [
        nativeActivation('calendar', 'prev-trigger'),
        nativeActivation('calendar', 'next-trigger'),
        {
          kind: 'click',
          part: 'next-trigger',
          expect: {
            // 展示月成了三月：二月的日子转成邻月，三月 1 日反过来成了本月
            parts: {
              [`cell[${at('2024-02-01')}]`]: { 'data-outside-month': '' },
              [`cell[${at('2024-03-01')}]`]: { 'data-outside-month': null },
            },
            activeElement: { part: 'next-trigger', exact: true },
            events: [],
          },
        },
        {
          kind: 'click',
          part: 'prev-trigger',
          expect: {
            parts: { [`cell[${at('2024-02-01')}]`]: { 'data-outside-month': null } },
            activeElement: { part: 'prev-trigger', exact: true },
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则选中纹丝不动，回调照发',
      spec: { apg: APG },
      props: { ...BASE_PROPS, value: ANCHOR },
      initial: { parts: selection(ANCHOR) },
      steps: [
        {
          kind: 'click',
          part: `cell-trigger[${at('2024-02-16')}]`,
          expect: {
            parts: selection(ANCHOR),
            events: [{ type: 'value-change', detail: { value: ['2024-02-16'] } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: '2024-02-16' },
          expect: { parts: selection('2024-02-16') },
        },
      ],
    },
    {
      name: 'fixedWeeks：恒六行四十二格，翻月时网格高度不跳',
      spec: { apg: APG },
      props: { ...BASE_PROPS, fixedWeeks: true },
      fixture: () => buildFixture(true),
      initial: {
        counts: { 'cell': 42, 'cell-trigger': 42, 'week-row': 7 },
        // 补出来的第六行是三月的真日子，不是空占位
        parts: { 'cell[41]': { 'data-value': '2024-03-10', 'data-outside-month': '' } },
      },
    },
  ],
}
