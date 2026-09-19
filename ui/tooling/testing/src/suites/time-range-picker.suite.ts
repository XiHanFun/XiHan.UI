import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { timeRangePickerAnatomy, timeRangePickerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'
import { heldPress, heldPressIgnored } from './shared/press-channel'

// 浮层里是起止两组、每组几列并排的 listbox；输入行里的两组分段按 spinbutton 那一套。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'
const SPINBUTTON = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction'
const SCOPE = '[data-scope="time-range-picker"]'

/**
 * 全部用例共用的界与步进。
 *
 * 可选值是纯函数按 min/max/step 与另一端生成的，作者只该渲染那一份；
 * fixture 是静态的，所以反过来把界设成正好长出这几格——
 * 让 fixture 与生成结果逐格对齐，锚点才不会指向一个 fixture 里没有的值。
 */
const BASE = { min: '08:00', max: '11:00', step: 30 } as const

/** fixture 里段的排布顺序：起点那组四段在前，终点那组四段在后。 */
const S_HOUR = 'segment[0]'
const S_MINUTE = 'segment[1]'
const S_SECOND = 'segment[2]'
const S_PERIOD = 'segment[3]'
const E_HOUR = 'segment[4]'
const E_MINUTE = 'segment[5]'

/** 列与格的下标寻址：每组时列 4 格（08-11）、分列 2 格（00/30）、秒列 2 格、上下午列 2 格；终点那组接在后面。 */
const S_HOUR_COL = 'column[0]'
const S_MINUTE_COL = 'column[1]'
const S_SECOND_COL = 'column[2]'
const S_PERIOD_COL = 'column[3]'
const E_HOUR_COL = 'column[4]'
const S_HOUR_08 = 'item[0]'
const S_HOUR_09 = 'item[1]'
const S_HOUR_10 = 'item[2]'
const S_HOUR_11 = 'item[3]'
const S_MINUTE_00 = 'item[4]'
const S_MINUTE_30 = 'item[5]'
const E_HOUR_08 = 'item[10]'
const E_HOUR_09 = 'item[11]'
const E_HOUR_10 = 'item[12]'
const E_HOUR_11 = 'item[13]'
const E_MINUTE_00 = 'item[14]'
const E_MINUTE_30 = 'item[15]'

const segment = (name: string): FixtureNode => ({ part: 'segment', tag: 'span', attrs: { segment: name } })
const item = (value: string): FixtureNode => ({ part: 'item', attrs: { value } })
function column(unit: string, values: readonly string[]): FixtureNode {
  return {
    part: 'column',
    attrs: { unit },
    children: values.map(item),
  }
}

/** 一端的段位容器：四段全写出来，granularity / hourCycle 关掉的由连接层打 hidden。 */
function segmentGroup(index: 0 | 1): FixtureNode {
  return {
    part: 'segment-group',
    attrs: { index: String(index) },
    children: [segment('hour'), segment('minute'), segment('second'), segment('dayPeriod')],
  }
}

/** 一端的时列外壳：小标题在前，四列在后。 */
function columnGroup(index: 0 | 1, label: string): FixtureNode {
  return {
    part: 'column-group',
    attrs: { index: String(index) },
    children: [
      { part: 'column-group-label', text: label },
      column('hour', ['08', '09', '10', '11']),
      column('minute', ['00', '30']),
      column('second', ['00', '30']),
      column('dayPeriod', ['00', '01']),
    ],
  }
}

/** 某一组内此刻显出的段位文字，文档序。 */
function segmentTexts(doc: Document, group: number): string[] {
  const groupEl = doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="segment-group"]`)[group]
  return [...(groupEl?.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="segment"]`) ?? [])]
    .filter(el => !el.hasAttribute('hidden'))
    .map(el => el.textContent ?? '')
}

function expectTexts(doc: Document, group: number, want: readonly string[], why: string): void {
  const got = segmentTexts(doc, group)
  if (got.join('|') !== want.join('|'))
    throw new Error(`${why}：第 ${group} 组期望 [${want.join(',')}]，实际 [${got.join(',')}]`)
}

function expectHidden(doc: Document, want: readonly [string, string], why: string): void {
  const got = [...doc.querySelectorAll<HTMLInputElement>(`${SCOPE}[data-part="hidden-input"]`)].map(el => el.value)
  if (got.join('|') !== want.join('|'))
    throw new Error(`${why}：两份隐藏输入期望 [${want.join(',')}]，实际 [${got.join(',')}]`)
}

/** 快捷选项写死在 min/max 之内，断言不随运行时刻改口。 */
const PRESETS = [
  { value: '08:30/10:30', label: '早班' },
  { value: '09:00', label: '单个时刻' },
  { value: '10:30/09:00', label: '颠倒' },
  { value: '08:00/11:00', label: '全天' },
] as const

/** 快捷选项列排在两组时列前面，只有用到它的那条用例派生这一份。 */
function presetGroupFixture(base: FixtureNode): FixtureNode {
  const list: FixtureNode = {
    part: 'preset-group',
    children: PRESETS.map(preset => ({
      part: 'preset',
      attrs: { value: preset.value },
      text: preset.label,
    })),
  }
  return {
    ...base,
    children: base.children?.map((node) => {
      if (node.part !== 'positioner')
        return node
      return {
        ...node,
        children: node.children?.map(content => ({
          ...content,
          children: [list, ...(content.children ?? [])],
        })),
      }
    }),
  }
}

/** 某一端时列里的一格：两端的格子 data-value 同名，要连同所在的列组一起认。 */
function itemIn(index: 0 | 1, value: string): string {
  return `${SCOPE}[data-part="column-group"][data-value="${index}"] [data-part="item"][data-value="${value}"]`
}

/** 某一端的时列容器：格子失焦的落点。 */
function hourColumnIn(index: 0 | 1): string {
  return `${SCOPE}[data-part="column-group"][data-value="${index}"] [data-part="column"][data-value="hour"]`
}

/** 快捷选项条目，文档序。 */
function presetItems(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="preset"]`)]
}

/** 往某一条快捷选项上直接派按键；处理器挂在 preset-group 那一层，靠冒泡收。 */
async function pressOnPreset(ctx: RawStepContext, el: HTMLElement, key: string): Promise<void> {
  // 显式 cancelable，否则 preventDefault 是空操作
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await ctx.flush()
}

/** 往第 group 组的第 index 段上直接派按键。 */
async function pressOnSegment(ctx: RawStepContext, group: number, index: number, keys: readonly string[]): Promise<void> {
  const groupEl = ctx.doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="segment-group"]`)[group]
  const el = groupEl?.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="segment"]`)[index]
  if (!el)
    throw new Error(`第 ${group} 组里找不到第 ${index} 段`)
  el.focus()
  for (const key of keys)
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await ctx.flush()
}

export const timeRangePickerSuite: ConformanceSuite = {
  component: 'time-range-picker',
  anatomy: timeRangePickerAnatomy,
  keyboard: timeRangePickerKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'label', text: '营业时段' },
      {
        part: 'control',
        children: [
          segmentGroup(0),
          { part: 'range-separator', tag: 'span', text: '-' },
          segmentGroup(1),
          // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
          { part: 'trigger', tag: 'button', text: '选择' },
          { part: 'clear-trigger', tag: 'button', text: '清空' },
        ],
      },
      // 表单出口排在浮层之前：浮层可被搬到落点，宿主里剩下的部分要与就地渲染同序
      { part: 'hidden-input', tag: 'input', attrs: { index: '0' } },
      { part: 'hidden-input', tag: 'input', attrs: { index: '1' } },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [columnGroup(0, '开始'), columnGroup(1, '结束')],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: '初始收起：control 是 group，两组段位与两组时列各报各的名字；秒段与秒列收起',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, name: 'from', endName: 'to' },
      initial: {
        order: [
          'root',
          'label',
          'control',
          'segment-group[0]',
          S_HOUR,
          S_MINUTE,
          S_SECOND,
          S_PERIOD,
          'range-separator',
          'segment-group[1]',
          E_HOUR,
          E_MINUTE,
          'segment[6]',
          'segment[7]',
          'trigger',
          'clear-trigger',
          'hidden-input[0]',
          'hidden-input[1]',
          'positioner',
          'content',
          'column-group[0]',
          'column-group-label[0]',
          S_HOUR_COL,
          S_HOUR_08,
          S_HOUR_09,
          S_HOUR_10,
          S_HOUR_11,
          S_MINUTE_COL,
          S_MINUTE_00,
          S_MINUTE_30,
          S_SECOND_COL,
          'item[6]',
          'item[7]',
          S_PERIOD_COL,
          'item[8]',
          'item[9]',
          'column-group[1]',
          'column-group-label[1]',
          E_HOUR_COL,
          E_HOUR_08,
          E_HOUR_09,
          E_HOUR_10,
          E_HOUR_11,
          'column[5]',
          E_MINUTE_00,
          E_MINUTE_30,
          'column[6]',
          'item[16]',
          'item[17]',
          'column[7]',
          'item[18]',
          'item[19]',
        ],
        counts: { 'segment-group': 2, 'segment': 8, 'column-group': 2, 'column': 8, 'item': 20, 'hidden-input': 2 },
        activeElement: null,
        parts: {
          'root': { 'data-state': 'closed', 'data-empty': '', 'data-disabled': null, 'data-invalid': null },
          'control': {
            'role': 'group',
            'aria-labelledby': '@part(label)',
            'aria-disabled': 'false',
            'aria-invalid': 'false',
            // control 是 Field Chrome 视觉盒：形态与家族尺寸档落在它身上（缺省 outline / md）
            'data-xh-field-chrome': '',
            'data-xh-field-size': 'md',
            'data-variant': 'outline',
          },
          'segment-group[0]': { 'role': 'group', 'aria-label': 'Start time', 'data-index': '0', 'data-empty': '' },
          'segment-group[1]': { 'role': 'group', 'aria-label': 'End time', 'data-index': '1', 'data-empty': '' },
          'range-separator': { 'aria-hidden': 'true' },
          [S_HOUR]: { 'role': 'spinbutton', 'tabindex': '0', 'hidden': null, 'data-placeholder': '' },
          [S_MINUTE]: { role: 'spinbutton', tabindex: '-1' },
          [S_SECOND]: { hidden: '' },
          [S_PERIOD]: { hidden: '' },
          [E_HOUR]: { role: 'spinbutton', tabindex: '0', hidden: null },
          [E_MINUTE]: { role: 'spinbutton', tabindex: '-1' },
          // 展开钮常驻、走 field-inset 档；清空钮没值即收起，走 field-inset 档、没值时不带 has-value
          'trigger': { 'type': 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': '@part(content)', 'data-xh-action-profile': 'field-inset', 'data-xh-action-display': 'always' },
          'clear-trigger': { 'hidden': '', 'tabindex': '-1', 'aria-label': 'Clear', 'data-xh-action-profile': 'field-inset', 'data-xh-action-display': 'has-value', 'data-xh-action-has-value': null },
          'hidden-input[0]': { type: 'hidden', name: 'from' },
          'hidden-input[1]': { type: 'hidden', name: 'to' },
          'content': { role: 'dialog', hidden: '', tabindex: '-1' },
          'column-group[0]': { 'role': 'group', 'aria-label': 'Start time', 'data-value': '0', 'data-index': '0' },
          'column-group[1]': { 'role': 'group', 'aria-label': 'End time', 'data-value': '1', 'data-index': '1' },
          'column-group-label[0]': { 'aria-hidden': 'true' },
          [S_HOUR_COL]: { 'role': 'listbox', 'aria-label': 'hour', 'data-value': 'hour', 'hidden': null },
          [S_SECOND_COL]: { hidden: '' },
          [S_PERIOD_COL]: { hidden: '' },
          [E_HOUR_COL]: { role: 'listbox', hidden: null },
          [S_HOUR_08]: { 'role': 'option', 'aria-selected': 'false', 'aria-disabled': 'false' },
          [E_HOUR_08]: { 'role': 'option', 'aria-selected': 'false', 'aria-disabled': 'false' },
        },
      },
    },
    {
      name: 'defaultValue 拆进两组段位，浮层里各组对应的格显示为选中',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: ['09:00', '10:30'] },
      initial: {
        parts: {
          'root': { 'data-empty': null },
          'segment-group[0]': { 'data-complete': '', 'data-empty': null },
          'segment-group[1]': { 'data-complete': '' },
          [S_HOUR]: { 'aria-valuenow': '9', 'data-placeholder': null },
          [E_HOUR]: { 'aria-valuenow': '10' },
          [E_MINUTE]: { 'aria-valuenow': '30' },
          [S_HOUR_09]: { 'aria-selected': 'true', 'tabindex': '0' },
          [S_HOUR_10]: { 'aria-selected': 'false', 'tabindex': '-1' },
          [E_HOUR_10]: { 'aria-selected': 'true', 'tabindex': '0' },
          [E_MINUTE_30]: { 'aria-selected': 'true' },
          [E_MINUTE_00]: { 'aria-selected': 'false' },
          'clear-trigger': { hidden: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段上的文字是文本节点、隐藏输入的 value 是 property',
          run: ({ doc }) => {
            expectTexts(doc, 0, ['09', '00'], '起点拆进段')
            expectTexts(doc, 1, ['10', '30'], '终点拆进段')
            expectHidden(doc, ['09:00', '10:30'], '两份表单出口各拿各的')
          },
        },
      ],
    },
    {
      name: '三轴接线到 root 的 data-*：只落一处，输入行与浮层都从它继承',
      spec: { apg: APG },
      props: { variant: 'subtle', tone: 'success', size: 'lg' },
      initial: {
        parts: { root: { 'data-variant': 'subtle', 'data-tone': 'success', 'data-size': 'lg' } },
      },
    },
    {
      name: 'variant 不给时落 outline，tone/size 不写',
      spec: { apg: APG },
      initial: {
        parts: { root: { 'data-variant': 'outline', 'data-tone': null, 'data-size': null } },
      },
    },
    {
      name: 'Enter / Space 的开合交给原生按钮的激活行为，按键本身一律放行',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction' },
      covers: ['time-range-picker.kbd.toggle'],
      props: BASE,
      steps: [nativeActivation('time-range-picker', 'trigger')],
    },
    {
      name: '点触发器展开：焦点交给起点那组时列的锚点那一格，对外通知一次',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { ...BASE, defaultValue: ['09:30', '10:30'] },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              content: { 'hidden': null, 'data-state': 'open' },
              trigger: { 'aria-expanded': 'true' },
              [S_HOUR_09]: { 'data-highlighted': '', 'tabindex': '0' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: S_HOUR_09 },
          expect: { activeElement: { part: S_HOUR_09, exact: true } },
        },
      ],
    },
    {
      name: '终点那组段位上按 Alt+ArrowDown 展开：焦点落到终点那组时列的锚点上',
      spec: { apg: APG },
      covers: ['time-range-picker.kbd.segment-open'],
      props: { ...BASE, defaultValue: ['09:30', '10:30'] },
      steps: [
        { kind: 'focus', part: E_HOUR },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Alt'],
          expect: { parts: { content: { hidden: null }, [E_HOUR_10]: { 'data-highlighted': '' } } },
        },
        { kind: 'settle', until: { activeElement: E_HOUR_10 } },
      ],
    },
    {
      name: '触发器上按下键展开，锚点落到起点那组的首格',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-range-picker.kbd.open'],
      props: BASE,
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { content: { hidden: null }, [S_HOUR_08]: { 'data-highlighted': '', 'tabindex': '0' } } },
        },
        { kind: 'settle', until: { activeElement: S_HOUR_08 } },
      ],
    },
    {
      name: '上下键在列内走、Home/End 到首末格',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-range-picker.kbd.item-next', 'time-range-picker.kbd.item-prev', 'time-range-picker.kbd.item-first', 'time-range-picker.kbd.item-last'],
      props: { ...BASE, defaultValue: ['09:30', '11:00'] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: S_HOUR_09 } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: S_HOUR_10, exact: true },
            parts: { [S_HOUR_10]: { 'tabindex': '0', 'data-highlighted': '' }, [S_HOUR_09]: { tabindex: '-1' } },
          },
        },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: S_HOUR_09, exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: S_HOUR_11, exact: true } } },
        // 到尾回绕：时分秒天生成环
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: S_HOUR_08, exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: S_HOUR_08, exact: true } } },
      ],
    },
    {
      name: '左右键换列跨组连着走：起点末列再往右进终点首列，落到目标列的锚点上；两端停住不回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-range-picker.kbd.column-next', 'time-range-picker.kbd.column-prev'],
      props: { ...BASE, defaultValue: ['09:30', '10:30'] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: S_HOUR_09 } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: S_MINUTE_30, exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: E_HOUR_10, exact: true }, parts: { 'column-group[1]': { 'data-focus': '' }, 'column-group[0]': { 'data-focus': null } } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: E_MINUTE_30, exact: true } } },
        // 终点的分列已是最后一列，再往右停住
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: E_MINUTE_30, exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: E_HOUR_10, exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: S_MINUTE_30, exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: S_HOUR_09, exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: S_HOUR_09, exact: true } } },
      ],
    },
    {
      name: 'enter 选中焦点所在的格只改那一端的段，浮层不收起；两端各自凑齐才各自出值',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-range-picker.kbd.select'],
      props: { ...BASE, name: 'from', endName: 'to' },
      steps: [
        // 键盘打开才预落锚点：确认键作用在锚点那一格上
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: S_HOUR_08 } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            // 分还没挑，起点凑不成一个时间，因此不该有值变化通知
            events: [],
            parts: { [S_HOUR_08]: { 'aria-selected': 'true' }, content: { hidden: null } },
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: S_MINUTE_00, exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['08:00'] } }],
            parts: { 'root': { 'data-empty': null }, 'segment-group[0]': { 'data-complete': '' }, 'segment-group[1]': { 'data-empty': '' } },
          },
        },
        // 换到终点那组：这一组还空着，落到首个可停留的格
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: E_HOUR_08, exact: true } } },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: E_HOUR_10, exact: true } } },
        { kind: 'key', key: 'Enter', expect: { events: [], parts: { [E_HOUR_10]: { 'aria-selected': 'true' } } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: E_MINUTE_00, exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['08:00', '10:00'] } }],
            parts: { content: { hidden: null } },
          },
        },
        {
          kind: 'raw',
          why: '段上的文字是文本节点、隐藏输入的 value 是 property',
          run: ({ doc }) => {
            expectTexts(doc, 0, ['08', '00'], '浮层里挑的起点要落到段上')
            expectTexts(doc, 1, ['10', '00'], '浮层里挑的终点要落到段上')
            expectHidden(doc, ['08:00', '10:00'], '同上')
          },
        },
      ],
    },
    {
      name: '终点那组以起点为下界：起点之前的格自报 aria-disabled 且方向键跳过；起点那组不受自己影响',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: ['10:00', ''] },
      initial: {
        parts: {
          [E_HOUR_08]: { 'aria-disabled': 'true', 'data-disabled': '' },
          [E_HOUR_09]: { 'aria-disabled': 'true' },
          [E_HOUR_10]: { 'aria-disabled': 'false' },
          [E_HOUR_11]: { 'aria-disabled': 'false' },
          [S_HOUR_08]: { 'aria-disabled': 'false' },
        },
      },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: S_HOUR_10 } },
        { kind: 'key', key: 'ArrowRight' },
        // 终点那组的时列还空着：落到首个可停留的格，即 10
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: E_HOUR_10, exact: true } } },
        // 08 与 09 被裁掉了，列内导航从 10 往上绕到 11
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: E_HOUR_11, exact: true } } },
      ],
    },
    {
      name: '起点那组以终点为上界：终点之后的格自报 aria-disabled',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: ['', '09:00'] },
      initial: {
        parts: {
          [S_HOUR_08]: { 'aria-disabled': 'false' },
          [S_HOUR_09]: { 'aria-disabled': 'false' },
          [S_HOUR_10]: { 'aria-disabled': 'true', 'data-disabled': '' },
          [S_HOUR_11]: { 'aria-disabled': 'true' },
          [E_HOUR_11]: { 'aria-disabled': 'false' },
        },
      },
    },
    {
      name: 'escape 收起并把焦点归还触发器，两端不变',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-range-picker.kbd.escape'],
      props: { ...BASE, defaultValue: ['09:30', '10:30'] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: S_HOUR_09 } },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { content: { hidden: '' }, trigger: { 'aria-expanded': 'false' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        { kind: 'settle', until: { activeElement: 'trigger' }, timeoutMs: 500 },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, ['09:30', '10:30'], '收起不改值'),
        },
      ],
    },
    {
      name: 'tab 收起且不抢回焦点',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-range-picker.kbd.tab'],
      props: { ...BASE, defaultValue: ['09:30', '10:30'] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: S_HOUR_09 } },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: { content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '段上 Enter 收起：段位敲出来的值不触发「选完即收」，这是那条路的收口手势',
      spec: { apg: APG },
      covers: ['time-range-picker.kbd.segment-close'],
      props: { ...BASE, defaultOpen: true },
      steps: [
        {
          kind: 'raw',
          why: '要把键派在真正可聚焦的段位上，而 key 步骤只往 activeElement 上派',
          run: async (ctx) => {
            await pressOnSegment(ctx, 1, 0, ['Enter'])
            const content = ctx.doc.querySelector(`${SCOPE}[data-part="content"]`)
            if (!content?.hasAttribute('hidden'))
              throw new Error('段上按 Enter 没能把浮层收起')
          },
        },
      ],
    },
    {
      name: '终点那组段上敲数字：填满本段自动跳本组下一段，浮层里终点对应的格随即选中；起点原封不动',
      spec: { apg: SPINBUTTON },
      covers: ['time-range-picker.kbd.segment-digit'],
      props: { ...BASE, defaultValue: ['09:00', ''] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: S_HOUR_09 } },
        { kind: 'focus', part: E_HOUR },
        { kind: 'key', key: '1' },
        {
          kind: 'key',
          key: '0',
          expect: {
            activeElement: { part: E_MINUTE, exact: true },
            parts: { [E_HOUR_10]: { 'aria-selected': 'true' }, [S_HOUR_09]: { 'aria-selected': 'true' }, [S_HOUR_10]: { 'aria-selected': 'false' } },
            // 终点的分还空着，值不动
            events: [],
          },
        },
        { kind: 'key', key: '3' },
        {
          kind: 'key',
          key: '0',
          expect: {
            events: [{ type: 'value-change', detail: { value: ['09:00', '10:30'] } }],
            parts: { [E_MINUTE_30]: { 'aria-selected': 'true' } },
          },
        },
        {
          kind: 'raw',
          why: '段上的文字是文本节点',
          run: ({ doc }) => {
            expectTexts(doc, 0, ['09', '00'], '起点一个字都不该动')
            expectTexts(doc, 1, ['10', '30'], '终点敲满')
          },
        },
      ],
    },
    {
      name: '段上左右键换段不跨组：起点末段停住，终点首段停住；上下键加减只改本端',
      spec: { apg: SPINBUTTON },
      covers: ['time-range-picker.kbd.segment-next', 'time-range-picker.kbd.segment-prev', 'time-range-picker.kbd.segment-first', 'time-range-picker.kbd.segment-last', 'time-range-picker.kbd.segment-increment', 'time-range-picker.kbd.segment-decrement'],
      props: { ...BASE, defaultValue: ['09:00', '10:30'] },
      steps: [
        { kind: 'focus', part: S_HOUR },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: S_MINUTE, exact: true } } },
        // 精度到分，起点的分段是本组末段：再往右不跨进终点那组
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: S_MINUTE, exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: S_MINUTE, exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: S_HOUR, exact: true } } },
        { kind: 'focus', part: E_HOUR },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: E_HOUR, exact: true } } },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { [E_HOUR]: { 'aria-valuenow': '11' }, [S_HOUR]: { 'aria-valuenow': '9' } },
            events: [{ type: 'value-change', detail: { value: ['09:00', '11:30'] } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { [E_HOUR]: { 'aria-valuenow': '10' } }, events: [{ type: 'value-change', detail: { value: ['09:00', '10:30'] } }] },
        },
      ],
    },
    {
      name: 'backspace 清掉本段，那一端退回空串，另一端留着',
      spec: { apg: SPINBUTTON },
      covers: ['time-range-picker.kbd.segment-clear'],
      props: { ...BASE, defaultValue: ['09:00', '10:30'] },
      steps: [
        { kind: 'focus', part: E_HOUR },
        {
          kind: 'key',
          key: 'Backspace',
          expect: {
            parts: { [E_HOUR]: { 'aria-valuenow': null, 'data-placeholder': '' }, [E_MINUTE]: { 'aria-valuenow': '30' }, 'segment-group[1]': { 'data-empty': '' } },
            events: [{ type: 'value-change', detail: { value: ['09:00'] } }],
          },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, ['09:00', ''], '终点退回空串，起点留着'),
        },
      ],
    },
    {
      name: '点标题把焦点送到起点那组的第一段',
      spec: { apg: APG },
      props: BASE,
      steps: [
        { kind: 'click', part: 'label', expect: { activeElement: { part: S_HOUR, exact: true } } },
      ],
    },
    {
      name: '清空按钮：按完两组各段回到占位符，两端都退回空串，焦点回起点首段',
      spec: { apg: APG },
      props: { ...BASE, defaultValue: ['09:00', '10:30'] },
      steps: [
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              'root': { 'data-empty': '' },
              'clear-trigger': { hidden: '' },
              [S_HOUR]: { 'aria-valuenow': null, 'data-placeholder': '' },
              [E_HOUR]: { 'aria-valuenow': null, 'data-placeholder': '' },
              [E_MINUTE]: { 'aria-valuenow': null },
            },
            events: [{ type: 'value-change', detail: { value: [] } }],
            activeElement: { part: S_HOUR, exact: true },
          },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, ['', ''], '清空后两端都没有值可提交'),
        },
      ],
    },
    {
      name: '终点早于起点即不合法：根、输入行与两组段位自判 data-invalid，作者不必显式标',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: ['10:00', '09:00'] },
      initial: {
        parts: {
          'root': { 'data-invalid': '' },
          'control': { 'aria-invalid': 'true', 'data-invalid': '' },
          'segment-group[0]': { 'data-invalid': '' },
          'segment-group[1]': { 'data-invalid': '' },
          [S_HOUR]: { 'aria-invalid': 'true' },
          [E_HOUR]: { 'aria-invalid': 'true' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: { parts: { root: { 'data-invalid': null }, control: { 'aria-invalid': 'false' } } },
        },
      ],
    },
    {
      name: 'disabled：两组段位整组退出 Tab 序列、触发器原生 disabled、两组的格全部不可选、两份隐藏输入不参与提交',
      spec: { apg: APG },
      props: { ...BASE, disabled: true, defaultValue: ['09:00', '10:30'], name: 'from', endName: 'to' },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'control': { 'aria-disabled': 'true' },
          'segment-group[0]': { 'aria-disabled': 'true', 'data-disabled': '' },
          'segment-group[1]': { 'aria-disabled': 'true', 'data-disabled': '' },
          [S_HOUR]: { 'tabindex': null, 'aria-disabled': 'true' },
          [E_HOUR]: { 'tabindex': null, 'aria-disabled': 'true' },
          'trigger': { disabled: '' },
          [S_HOUR_09]: { 'aria-disabled': 'true' },
          [E_HOUR_10]: { 'aria-disabled': 'true' },
          'hidden-input[0]': { disabled: '' },
          'hidden-input[1]': { disabled: '' },
          'clear-trigger': { hidden: '' },
        },
      },
    },
    {
      name: 'readOnly：浮层照常展开与浏览，但两端都改不动',
      spec: { apg: APG },
      props: { ...BASE, readOnly: true, defaultValue: ['09:00', '10:30'] },
      initial: { parts: { root: { 'data-readonly': '' }, trigger: { disabled: null }, [S_HOUR]: { 'aria-readonly': 'true' } } },
      steps: [
        { kind: 'click', part: 'trigger', expect: { parts: { content: { hidden: null } } } },
        {
          kind: 'click',
          part: E_HOUR_11,
          expect: { events: [], parts: { [E_HOUR_10]: { 'aria-selected': 'true' }, [E_HOUR_11]: { 'aria-selected': 'false' } } },
        },
      ],
    },
    {
      name: '只给 name：终点那份隐藏输入不带 name，不参与提交',
      spec: { apg: APG },
      props: { ...BASE, defaultValue: ['09:00', '10:30'], name: 'from' },
      initial: { parts: { 'hidden-input[0]': { name: 'from' }, 'hidden-input[1]': { name: null } } },
    },
    {
      name: '受控 value：宿主不写回则界面纹丝不动，回调照发；宿主写回才跟着走',
      spec: { adr: 'controlled-uncontrolled' },
      props: { ...BASE, value: ['09:00', '10:30'], defaultOpen: true },
      steps: [
        {
          kind: 'click',
          part: E_MINUTE_00,
          expect: {
            events: [{ type: 'value-change', detail: { value: ['09:00', '10:00'] } }],
            parts: { [E_MINUTE_30]: { 'aria-selected': 'true' }, [E_MINUTE_00]: { 'aria-selected': 'false' } },
          },
        },
        {
          kind: 'setProps',
          props: { value: ['09:00', '10:00'] },
          expect: { parts: { [E_MINUTE_00]: { 'aria-selected': 'true' }, [E_MINUTE_30]: { 'aria-selected': 'false' } } },
        },
        {
          kind: 'raw',
          why: '段上的文字是文本节点',
          run: ({ doc }) => expectTexts(doc, 1, ['10', '00'], '宿主写回后终点跟着走'),
        },
      ],
    },
    {
      name: '快捷选项列自成一套键盘：只认恰好两端的那条，Enter 把两端整份写进值并收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-range-picker.kbd.preset-move', 'time-range-picker.kbd.preset-pick'],
      fixture: presetGroupFixture,
      props: { ...BASE, presets: [...PRESETS] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'raw',
          why: '这一列的键盘处理器挂在 preset-group 自己身上，按键要从条目上派；条目按 data-value 认，不进快照',
          run: async (ctx) => {
            const items = presetItems(ctx.doc)
            const states = items.map(el => [el.getAttribute('aria-selected'), el.getAttribute('aria-disabled'), el.getAttribute('tabindex')].join('|'))
            // 单个时刻与颠倒的那两条按不下去；没有值时锚点落在头一条按得下的
            const want = ['false|false|0', 'false|true|-1', 'false|true|-1', 'false|false|-1']
            if (states.join(',') !== want.join(','))
              throw new Error(`快捷选项的状态应为 ${want.join(' ')}，实际 ${states.join(' ')}`)
            items[0]!.focus()
            await pressOnPreset(ctx, items[0]!, 'End')
            if (ctx.doc.activeElement !== items[3])
              throw new Error('End 应把焦点移到末条快捷选项')
            await pressOnPreset(ctx, items[3]!, 'Enter')
            expectHidden(ctx.doc, ['08:00', '11:00'], 'Enter 应把这一条的两端整份写进去')
          },
          expect: {
            parts: { content: { hidden: '' } },
            events: [
              { type: 'value-change', detail: { value: ['08:00', '11:00'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: '12 小时制：两组各多出上下午段与上下午列；上下午段上按 a / p 直接指定，改的是那一端背后的 24 时值',
      spec: { apg: `${APG}#roles_states_properties` },
      covers: ['time-range-picker.kbd.segment-period'],
      props: { ...BASE, hourCycle: 12, defaultValue: ['09:00', '10:30'] },
      initial: {
        parts: {
          [S_PERIOD]: { 'hidden': null, 'aria-valuenow': '0' },
          'segment[7]': { hidden: null },
          [S_PERIOD_COL]: { hidden: null },
          'column[7]': { hidden: null },
          [S_HOUR]: { 'aria-valuenow': '9', 'aria-valuemin': '1', 'aria-valuemax': '12' },
        },
      },
      steps: [
        { kind: 'focus', part: S_PERIOD },
        {
          kind: 'key',
          key: 'p',
          expect: {
            parts: { [S_PERIOD]: { 'aria-valuenow': '1' }, 'segment[7]': { 'aria-valuenow': '0' } },
            // 起点翻到下午是 21:00：越界只做标注，不改写
            events: [{ type: 'value-change', detail: { value: ['21:00', '10:30'] } }],
          },
        },
        {
          kind: 'key',
          key: 'A',
          expect: {
            parts: { [S_PERIOD]: { 'aria-valuenow': '0' } },
            events: [{ type: 'value-change', detail: { value: ['09:00', '10:30'] } }],
          },
        },
      ],
    },

    {
      name: 'Space / Enter 按住与触屏按下：触发钮与清空钮投影 data-pressed，抬起、失焦或指针取消撤下；按住本身不开合也不清值',
      spec: { adr: 'press-channel' },
      covers: ['time-range-picker.kbd.press'],
      props: { ...BASE, defaultValue: ['09:00', '10:30'] },
      steps: [
        heldPress('time-range-picker', 'trigger'),
        // 清空钮不占 Tab 位，键盘这一路只在焦点落到它身上时有面；共享步骤直接把焦点送过去
        heldPress('time-range-picker', 'clear-trigger'),
        {
          kind: 'settle',
          until: { attr: { part: 'clear-trigger', name: 'data-pressed', value: null } },
          expect: { parts: { 'content': { hidden: '' }, 'trigger': { 'data-pressed': null }, 'clear-trigger': { hidden: null } }, events: [] },
        },
      ],
    },
    {
      name: '展开后 Space / Enter 按住与触屏按下：两端的时间格各自投影 data-pressed；快捷选项触屏按下投影（Enter 在 keydown 即写值收起，键盘那一路没有可见的按住帧）',
      spec: { adr: 'press-channel' },
      covers: ['time-range-picker.kbd.press'],
      fixture: presetGroupFixture,
      props: { ...BASE, presets: [...PRESETS] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        // 键盘按住会把这一格写进该端的时段（选中不收起），按压面仍在；失焦落到所在列上，三家都只看见格子自己的 blur
        heldPress('time-range-picker', 'item', { selector: itemIn(0, '09'), blurTo: hourColumnIn(0) }),
        heldPress('time-range-picker', 'item', { selector: itemIn(1, '10'), blurTo: hourColumnIn(1) }),
        heldPress('time-range-picker', 'preset', { value: '08:00/11:00', keyboardHost: null }),
        {
          kind: 'settle',
          until: { attr: { part: 'preset', name: 'data-pressed', value: null } },
          expect: { parts: { content: { hidden: null }, [S_HOUR_09]: { 'aria-selected': 'true', 'data-pressed': null }, [E_HOUR_10]: { 'aria-selected': 'true', 'data-pressed': null } } },
        },
      ],
    },
    {
      name: '禁用时触发钮、清空钮、时间格与快捷选项都不进入按压面；只读时触发钮照常有回执，其余不进',
      spec: { adr: 'press-channel' },
      fixture: presetGroupFixture,
      props: { ...BASE, defaultValue: ['09:00', '10:30'], presets: [...PRESETS] },
      steps: [
        // 不用 defaultOpen 起手：那条路两个适配器的挂载落焦时序本就有差；先展开再转禁用，浮层留在原地
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        { kind: 'setProps', props: { disabled: true }, expect: { parts: { root: { 'data-disabled': '' } } } },
        heldPressIgnored('time-range-picker', 'trigger', '禁用时触发钮原生 disabled，不接受按压'),
        heldPressIgnored('time-range-picker', 'clear-trigger', '禁用时清空钮藏着，不接受按压'),
        heldPressIgnored('time-range-picker', 'item', '禁用时格子 aria-disabled，不接受按压', { selector: itemIn(0, '09') }),
        heldPressIgnored('time-range-picker', 'preset', '禁用时快捷选项 aria-disabled，不接受按压', { value: '08:30/10:30', keyboardHost: null }),
        { kind: 'setProps', props: { disabled: false, readOnly: true }, expect: { parts: { root: { 'data-readonly': '' } } } },
        heldPressIgnored('time-range-picker', 'clear-trigger', '只读时清空钮藏着，不接受按压'),
        heldPressIgnored('time-range-picker', 'item', '只读时格子选不中，不接受按压', { selector: itemIn(1, '10') }),
        heldPressIgnored('time-range-picker', 'preset', '只读时快捷选项写不了值，不接受按压', { value: '08:30/10:30', keyboardHost: null }),
        heldPress('time-range-picker', 'trigger'),
      ],
    },
    {
      name: '按不下去的快捷选项（单个时刻、颠倒）与被另一端裁掉的格不进入按压面',
      spec: { adr: 'press-channel' },
      fixture: presetGroupFixture,
      props: { ...BASE, defaultValue: ['09:00', '10:30'], presets: [...PRESETS] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        // 终点早于起点 09:00 的 08 时被裁掉，自报 aria-disabled
        heldPressIgnored('time-range-picker', 'item', '被另一端裁掉的格 aria-disabled，不接受按压', { selector: itemIn(1, '08') }),
        heldPressIgnored('time-range-picker', 'preset', '单个时刻的快捷选项按不下去，不接受按压', { value: '09:00', keyboardHost: null }),
        heldPressIgnored('time-range-picker', 'preset', '颠倒的快捷选项按不下去，不接受按压', { value: '10:30/09:00', keyboardHost: null }),
      ],
    },
  ],
}
