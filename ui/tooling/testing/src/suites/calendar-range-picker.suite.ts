// 提供 calendar-range-picker.suite 相关实现。

import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { buildMonthGrid, buildWeekDays, calendarRangePickerAnatomy, calendarRangePickerKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'
import { heldPress, heldPressIgnored } from './shared/press-channel'

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
const DAYS = GRID.weeks.flat().map(d => d.start)

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
                attrs: { value: day.start },
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

/**
 * 把标题里的文字换成「年 + 月」两个可点的钮。标题壳子留着——它仍是网格的可及名字来源。
 * 只有要验它们的用例用这一版：其余用例照旧写一条不可点的 heading，两条路都得能走。
 */
function withHeadingTriggers(base: FixtureNode): FixtureNode {
  const children = base.children
  const header = children?.[0]
  if (!children || !header?.children)
    throw new Error('fixture 的头一个子节点该是 header')
  return {
    ...base,
    children: children.map((child, index) => (index !== 0
      ? child
      : {
          ...header,
          children: header.children!.map(node => (node.part !== 'heading'
            ? node
            : {
                part: 'heading',
                children: [
                  { part: 'heading-year-trigger', tag: 'button' },
                  { part: 'heading-month-trigger', tag: 'button' },
                ],
              })),
        })),
  }
}

/** 在翻月钮两侧各加一颗翻年钮：与翻月钮同一副长相，只是步子大；只有验它们的用例用这一版。 */
function withYearTriggers(base: FixtureNode): FixtureNode {
  const children = base.children
  const header = children?.[0]
  if (!children || !header?.children)
    throw new Error('fixture 的头一个子节点该是 header')
  return {
    ...base,
    children: children.map((child, index) => (index !== 0
      ? child
      : {
          ...header,
          children: [
            { part: 'prev-year-trigger', tag: 'button', text: '上一年' },
            ...header.children!,
            { part: 'next-year-trigger', tag: 'button', text: '下一年' },
          ],
        })),
  }
}

/**
 * 逐格写全某几天的选中态：只写关心的那一格会漏掉"另一天也被选中了"。
 * aria-selected 报在 gridcell 那一层，cell-trigger 只留 data-selected 供皮肤挂钩。
 */
function selection(...values: readonly string[]): Record<string, Record<string, string | null>> {
  const out: Record<string, Record<string, string | null>> = {}
  for (const day of [...new Set([...values, '2024-02-15', '2024-02-16', '2024-02-18'])]) {
    const selected = values.includes(day)
    out[`cell[${at(day)}]`] = {
      'aria-selected': selected ? 'true' : 'false',
      'data-selected': selected ? '' : null,
    }
    out[`cell-trigger[${at(day)}]`] = {
      'aria-selected': null,
      'data-selected': selected ? '' : null,
    }
  }
  return out
}

export const calendarRangePickerSuite: ConformanceSuite = {
  component: 'calendar-range-picker',
  anatomy: calendarRangePickerAnatomy,
  keyboard: calendarRangePickerKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：grid 是 grid 且报 aria-multiselectable，区间还没落时没有一格带轨道标记',
      spec: { apg: `${APG}#rps_label` },
      props: BASE_PROPS,
      initial: {
        counts: {
          'root': 1,
          'grid': 1,
          'cell': DAYS.length,
          'cell-trigger': DAYS.length,
        },
        parts: {
          root: { 'data-disabled': null, 'data-readonly': null, 'data-invalid': null },
          grid: {
            'role': 'grid',
            'aria-labelledby': '@part(heading)',
            // 区间两端之间的格子都算选中，网格因此恒报可多选
            'aria-multiselectable': 'true',
            'aria-disabled': 'false',
            'aria-readonly': 'false',
            'data-dragging': null,
          },
          [`cell[${at(ANCHOR)}]`]: { 'role': 'gridcell', 'aria-selected': 'false', 'data-in-range': null },
          // 方向钮接 Action Control icon ghost sm 档，日期格接 text ghost 档（几何由网格给）
          'prev-trigger': { 'data-xh-action-control': '', 'data-xh-action-profile': 'icon', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'sm' },
          [`cell-trigger[${at(ANCHOR)}]`]: {
            'role': 'button',
            'tabindex': '0',
            'data-focus': '',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'sm',
            'data-in-range': null,
            'data-range-start': null,
            'data-range-end': null,
            'data-range-preview': null,
            // 聚焦格上提示这一下是开始挑一段
            'aria-description': 'Click to start selecting date range',
          },
        },
      },
    },
    {
      name: 'roving tabindex 与方向键：与日历选择器同一套走法，只搬焦点不落值',
      spec: { apg: APG },
      props: BASE_PROPS,
      covers: ['calendar-range-picker.kbd.tab', 'calendar-range-picker.kbd.prev-day', 'calendar-range-picker.kbd.next-day', 'calendar-range-picker.kbd.prev-week', 'calendar-range-picker.kbd.next-week', 'calendar-range-picker.kbd.week-start', 'calendar-range-picker.kbd.week-end'],
      steps: [
        singleTabStop('calendar-range-picker', 'cell-trigger', 'grid'),
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        { kind: 'key', key: 'ArrowRight' },
        singleTabStop('calendar-range-picker', 'cell-trigger', 'grid'),
        {
          kind: 'settle',
          until: { activeElement: `cell-trigger[${at('2024-02-16')}]` },
          expect: {
            activeElement: { part: `cell-trigger[${at('2024-02-16')}]`, exact: true },
            parts: {
              [`cell-trigger[${at('2024-02-16')}]`]: { 'tabindex': '0', 'data-focus': '' },
              [`cell-trigger[${at(ANCHOR)}]`]: { 'tabindex': '-1', 'data-focus': null },
            },
          },
        },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: `cell-trigger[${at('2024-02-23')}]` } },
        { kind: 'key', key: 'ArrowLeft' },
        { kind: 'settle', until: { activeElement: `cell-trigger[${at('2024-02-22')}]` } },
        { kind: 'key', key: 'ArrowUp' },
        { kind: 'settle', until: { activeElement: `cell-trigger[${at(ANCHOR)}]` } },
        { kind: 'key', key: 'Home' },
        { kind: 'settle', until: { activeElement: `cell-trigger[${at('2024-02-12')}]` } },
        {
          kind: 'key',
          key: 'End',
          expect: { events: [], parts: selection() },
        },
        { kind: 'settle', until: { activeElement: `cell-trigger[${at('2024-02-18')}]` } },
      ],
    },
    {
      // fixture 钉死在二月：换月后二月的格子转成邻月，一月的尾巴变成本月
      name: 'PageUp/PageDown 翻月、加 Shift 翻年：展示月跟着聚焦日走',
      spec: { apg: `${APG}#kbd_label` },
      props: BASE_PROPS,
      covers: ['calendar-range-picker.kbd.prev-month', 'calendar-range-picker.kbd.next-month', 'calendar-range-picker.kbd.prev-year', 'calendar-range-picker.kbd.next-year'],
      steps: [
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        {
          kind: 'key',
          key: 'PageUp',
          expect: {
            parts: {
              'cell[0]': { 'data-value': '2024-01-29', 'data-outside-month': null },
              [`cell[${at('2024-02-01')}]`]: { 'data-outside-month': '' },
              [`cell-trigger[${at(ANCHOR)}]`]: { 'tabindex': '-1', 'data-focus': null },
            },
          },
        },
        {
          kind: 'key',
          key: 'PageDown',
          expect: {
            parts: {
              'cell[0]': { 'data-outside-month': '' },
              [`cell-trigger[${at(ANCHOR)}]`]: { 'tabindex': '0', 'data-focus': '' },
            },
          },
        },
        {
          kind: 'key',
          key: 'PageUp',
          modifiers: ['Shift'],
          expect: { parts: { [`cell-trigger[${at(ANCHOR)}]`]: { tabindex: '-1' } } },
        },
        {
          kind: 'key',
          key: 'PageDown',
          modifiers: ['Shift'],
          expect: { parts: { [`cell-trigger[${at(ANCHOR)}]`]: { 'tabindex': '0', 'data-focus': '' } } },
        },
      ],
    },
    {
      name: '区间：先落起点再落终点，中间态就有 range-start / in-range / range-end 三件套',
      spec: { apg: APG },
      props: BASE_PROPS,
      steps: [
        {
          kind: 'click',
          part: `cell-trigger[${at(ANCHOR)}]`,
          expect: {
            parts: {
              // 只落了起点，两端重合：起点自己既是首也是尾；起点只记在机器里，值不动
              [`cell-trigger[${at(ANCHOR)}]`]: { 'data-range-start': '', 'data-range-end': '', 'data-in-range': '', 'data-selected': '' },
              [`cell[${at(ANCHOR)}]`]: { 'aria-selected': 'true' },
              [`cell-trigger[${at('2024-02-16')}]`]: { 'data-in-range': null },
            },
            events: [],
          },
        },
        {
          kind: 'click',
          part: `cell-trigger[${at('2024-02-18')}]`,
          expect: {
            parts: {
              [`cell-trigger[${at(ANCHOR)}]`]: { 'data-range-start': '', 'data-range-end': null, 'data-in-range': '' },
              // 两端之间的每一格都算选中
              [`cell-trigger[${at('2024-02-16')}]`]: { 'data-in-range': '', 'data-range-start': null, 'data-selected': '' },
              [`cell[${at('2024-02-16')}]`]: { 'aria-selected': 'true' },
              [`cell-trigger[${at('2024-02-18')}]`]: { 'data-range-end': '', 'data-in-range': '' },
              [`cell-trigger[${at('2024-02-19')}]`]: { 'data-in-range': null },
            },
            events: [{ type: 'value-change', detail: { value: [ANCHOR, '2024-02-18'] } }],
          },
        },
        {
          // 区间已完成，再点一下重新开一段：旧区间的值先留着，亮的换成新起点
          kind: 'click',
          part: `cell-trigger[${at('2024-02-12')}]`,
          expect: {
            parts: {
              [`cell-trigger[${at('2024-02-12')}]`]: { 'data-range-start': '', 'data-range-end': '' },
              [`cell-trigger[${at('2024-02-16')}]`]: { 'data-in-range': null },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '区间：Escape 撤掉起点，原来的区间原样还在',
      spec: { apg: `${APG}#kbd_label` },
      props: { ...BASE_PROPS, defaultValue: ['2024-02-05', '2024-02-07'] },
      covers: ['calendar-range-picker.kbd.cancel-range'],
      steps: [
        {
          kind: 'click',
          part: `cell-trigger[${at(ANCHOR)}]`,
          expect: {
            parts: {
              [`cell-trigger[${at(ANCHOR)}]`]: { 'data-range-start': '' },
              [`cell-trigger[${at('2024-02-06')}]`]: { 'data-in-range': null },
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: {
              [`cell-trigger[${at(ANCHOR)}]`]: { 'data-range-start': null, 'data-in-range': null },
              [`cell-trigger[${at('2024-02-06')}]`]: { 'data-in-range': '' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '区间：Tab 要离开网格时把区间收在起点到聚焦日',
      spec: { apg: `${APG}#kbd_label` },
      props: BASE_PROPS,
      covers: ['calendar-range-picker.kbd.select', 'calendar-range-picker.kbd.commit-range'],
      steps: [
        { kind: 'focus', part: `cell-trigger[${at(ANCHOR)}]` },
        // 确认键落起点后焦点自动前进一格
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              [`cell-trigger[${at(ANCHOR)}]`]: { 'data-range-start': '' },
              [`cell-trigger[${at('2024-02-16')}]`]: { 'data-focus': '', 'tabindex': '0', 'data-range-end': '' },
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Tab',
          expect: { events: [{ type: 'value-change', detail: { value: [ANCHOR, '2024-02-16'] } }] },
        },
      ],
    },
    {
      // 翻月钮是原生按钮，Space 与 Enter 都是激活键
      name: 'Space / Enter 按住与触屏按下：翻月钮投影 data-pressed，抬起、失焦或指针取消撤下',
      spec: { adr: 'press-channel' },
      covers: ['calendar-range-picker.kbd.press'],
      props: BASE_PROPS,
      steps: [
        heldPress('calendar-range-picker', 'prev-trigger'),
        heldPress('calendar-range-picker', 'next-trigger'),
      ],
    },
    {
      // 落起点那一下焦点会挪到旁边一格，按压面随焦点走、看不到按住的中间帧；
      // 把可选日夹成一天，旁边没有可挪的格子，焦点留在原地才看得见按住到抬起的整段
      name: '日期格：按住投影 data-pressed，起点与终点都在这一格落下时焦点留在原地；区间与按压互相独立',
      spec: { adr: 'press-channel' },
      props: { ...BASE_PROPS, min: ANCHOR, max: ANCHOR },
      steps: [
        heldPress('calendar-range-picker', 'cell-trigger', { value: ANCHOR }),
        {
          kind: 'settle',
          until: { attr: { part: `cell-trigger[${at(ANCHOR)}]`, name: 'data-pressed', value: null } },
          expect: { parts: { [`cell-trigger[${at(ANCHOR)}]`]: { 'data-pressed': null, 'data-selected': '' } } },
        },
      ],
    },
    {
      name: '翻年钮与标题两截同样接按压：按住投影 data-pressed，抬起撤下',
      spec: { adr: 'press-channel' },
      props: BASE_PROPS,
      fixture: base => withHeadingTriggers(withYearTriggers(base)),
      steps: [
        heldPress('calendar-range-picker', 'prev-year-trigger'),
        heldPress('calendar-range-picker', 'next-year-trigger'),
        heldPress('calendar-range-picker', 'heading-month-trigger'),
        heldPress('calendar-range-picker', 'heading-year-trigger'),
      ],
    },
    {
      name: '不可选的格子与到界的翻月钮不进按压面',
      spec: { adr: 'press-channel' },
      props: { ...BASE_PROPS, min: '2024-02-10', max: '2024-02-20' },
      steps: [
        heldPressIgnored('calendar-range-picker', 'cell-trigger', 'min 之前的日子不接受按压', { value: '2024-02-01' }),
        heldPressIgnored('calendar-range-picker', 'prev-trigger', '到界的上一月按不动'),
        heldPressIgnored('calendar-range-picker', 'next-trigger', '到界的下一月按不动'),
      ],
    },
    {
      name: '只读只挡格子，翻月照常；整张禁用谁都不进',
      spec: { adr: 'press-channel' },
      props: { ...BASE_PROPS, readOnly: true },
      steps: [
        heldPressIgnored('calendar-range-picker', 'cell-trigger', '只读时格子不接受按压', { value: ANCHOR }),
        heldPress('calendar-range-picker', 'next-trigger'),
        { kind: 'setProps', props: { readOnly: false, disabled: true } },
        heldPressIgnored('calendar-range-picker', 'cell-trigger', '整张禁用时格子不接受按压', { value: ANCHOR }),
        heldPressIgnored('calendar-range-picker', 'next-trigger', '整张禁用时翻月钮不接受按压'),
      ],
    },
  ],
}
