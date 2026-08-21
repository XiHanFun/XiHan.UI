import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { timePickerAnatomy, timePickerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

// 浮层里是几列并排的 listbox；输入行里的分段按 spinbutton 那一套。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'
const SPINBUTTON = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction'
// 触发器是原生按钮，Enter/Space 的激活按 button 那一套（由平台翻成 click）
const BUTTON = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'
const SCOPE = '[data-scope="time-picker"]'

/**
 * 全部用例共用的界与步进。
 *
 * 可选值是纯函数按 min/max/step 生成的，作者只该渲染那一份；
 * fixture 是静态的，所以反过来把界设成正好长出这几格——
 * 让 fixture 与生成结果逐格对齐，锚点才不会指向一个 fixture 里没有的值。
 */
const BASE = { min: '08:00', max: '11:00', step: 30 } as const

/** fixture 里段的排布顺序，与下标寻址一一对应。 */
const HOUR_SEG = 'input[0]'
const MINUTE_SEG = 'input[1]'
const SECOND_SEG = 'input[2]'
const DAY_PERIOD_SEG = 'input[3]'

/** 列与格的下标寻址：时列 4 格（08-11）、分列 2 格（00/30）、秒列 2 格（00/30）、上下午列 2 格。 */
const HOUR_COL = 'column[0]'
const MINUTE_COL = 'column[1]'
const SECOND_COL = 'column[2]'
const DAY_PERIOD_COL = 'column[3]'
const HOUR_08 = 'item[0]'
const HOUR_09 = 'item[1]'
const HOUR_10 = 'item[2]'
const HOUR_11 = 'item[3]'
const MINUTE_00 = 'item[4]'
const MINUTE_30 = 'item[5]'
const SECOND_00 = 'item[6]'
const PERIOD_AM = 'item[8]'
const PERIOD_PM = 'item[9]'

const segment = (name: string): FixtureNode => ({ part: 'input', tag: 'span', attrs: { segment: name } })
const item = (value: string): FixtureNode => ({ part: 'item', attrs: { value } })
function column(unit: string, values: readonly string[]): FixtureNode {
  return {
    part: 'column',
    attrs: { unit },
    children: values.map(item),
  }
}

function segmentTexts(doc: Document): string[] {
  return [...doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="input"]`)]
    .filter(el => !el.hasAttribute('hidden'))
    .map(el => el.textContent ?? '')
}

function expectTexts(doc: Document, want: readonly string[], why: string): void {
  const got = segmentTexts(doc)
  if (got.join('|') !== want.join('|'))
    throw new Error(`${why}：期望 [${want.join(',')}]，实际 [${got.join(',')}]`)
}

function expectHidden(doc: Document, want: string, why: string): void {
  const got = doc.querySelector<HTMLInputElement>(`${SCOPE}[data-part="hidden-input"]`)?.value ?? ''
  if (got !== want)
    throw new Error(`${why}：隐藏输入期望 "${want}"，实际 "${got}"`)
}

/** 快捷选项写死在 min/max 之内，断言不随运行时刻改口。 */
const PRESETS = [
  { value: '08:30', label: '开工' },
  { value: '09:00', label: '早会' },
  { value: '10:30', label: '茶歇' },
] as const

/** 快捷选项列排在时分秒那几列前面，只有用到它的那条用例派生这一份。 */
function presetsFixture(base: FixtureNode): FixtureNode {
  const list: FixtureNode = {
    part: 'presets',
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

/** 快捷选项条目，文档序。 */
function presetItems(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="preset"]`)]
}

/** 往某一条快捷选项上直接派按键；处理器挂在 presets 那一层，靠冒泡收。 */
async function pressOnPreset(ctx: RawStepContext, el: HTMLElement, key: string): Promise<void> {
  // 显式 cancelable，否则 preventDefault 是空操作
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await ctx.flush()
}

export const timePickerSuite: ConformanceSuite = {
  component: 'time-picker',
  anatomy: timePickerAnatomy,
  keyboard: timePickerKeyboard,
  // 四段与四列全写出来：granularity / hourCycle 关掉的那些由连接层打 hidden 收起，不删作者节点
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'label', text: '开始时间' },
      {
        part: 'control',
        children: [
          segment('hour'),
          segment('minute'),
          segment('second'),
          segment('dayPeriod'),
          // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
          { part: 'trigger', tag: 'button', text: '选择' },
          { part: 'clear-trigger', tag: 'button', text: '清空' },
        ],
      },
      // 表单出口排在浮层之前：浮层可被搬到落点，宿主里剩下的部分要与就地渲染同序
      { part: 'hidden-input', tag: 'input' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              column('hour', ['08', '09', '10', '11']),
              column('minute', ['00', '30']),
              column('second', ['00', '30']),
              column('dayPeriod', ['00', '01']),
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: '快捷选项列自成一套键盘：上下键在条目间走，Enter 整份写进值并收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-picker.kbd.preset-move', 'time-picker.kbd.preset-pick'],
      fixture: presetsFixture,
      props: { ...BASE, presets: [...PRESETS] },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'raw',
          why: '这一列的键盘处理器挂在 presets 自己身上，按键要从条目上派；条目按 data-value 认，不进快照',
          run: async (ctx) => {
            const items = presetItems(ctx.doc)
            // 还没有值，锚点落在头一条
            if (items[0]?.getAttribute('tabindex') !== '0')
              throw new Error('没有值时 Tab 落点应停在头一条')
            items[0]!.focus()
            await pressOnPreset(ctx, items[0]!, 'ArrowDown')
            if (ctx.doc.activeElement !== items[1])
              throw new Error('下键应把焦点移到下一条快捷选项')
            await pressOnPreset(ctx, items[1]!, 'Enter')
            expectHidden(ctx.doc, '09:00', 'Enter 应把这一条整份写进值')
            const content = ctx.doc.querySelector(`${SCOPE}[data-part="content"]`)
            if (!content?.hasAttribute('hidden'))
              throw new Error('快捷选项给的是整份时间，写完该收起浮层')
          },
        },
      ],
    },
    {
      name: '段上 Enter 收起：段位敲出来的值不触发「选完即收」，这是那条路的收口手势',
      spec: { apg: APG },
      covers: ['time-picker.kbd.segment-close'],
      props: BASE,
      steps: [
        // 不用 defaultOpen 起手：那条路两个适配器的挂载落焦时序本就有差，会把这个用例的对比噪声放大
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'raw',
          why: '要把键派在真正可聚焦的段位上，而 key 步骤只往 activeElement 上派',
          run: async (ctx) => {
            const seg = ctx.doc.querySelector('[data-scope="time-picker"][data-part="input"]')
            if (!(seg instanceof HTMLElement))
              throw new Error('找不到段位节点')
            seg.focus()
            seg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await ctx.flush()
            const content = ctx.doc.querySelector('[data-scope="time-picker"][data-part="content"]')
            if (!content?.hasAttribute('hidden'))
              throw new Error('段上按 Enter 没能把浮层收起')
          },
        },
      ],
    },
    {
      name: '段上 Alt+ArrowDown 展开：触发钮是可选部件，键盘那条入口不能只挂在它身上',
      spec: { apg: APG },
      covers: ['time-picker.kbd.segment-open'],
      props: BASE,
      steps: [
        { kind: 'focus', part: 'input[0]' },
        { kind: 'key', key: 'ArrowDown', modifiers: ['Alt'], expect: { parts: { content: { hidden: null } } } },
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
      name: '三轴都不给时一个属性都不写出来，皮肤据此走缺省档',
      spec: { apg: APG },
      initial: {
        parts: { root: { 'data-variant': null, 'data-tone': null, 'data-size': null } },
      },
    },
    {
      name: '初始收起：control 是 group、每段是 spinbutton、每列是 listbox；秒段与秒列收起',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, name: 'start' },
      initial: {
        order: [
          'root',
          'label',
          'control',
          HOUR_SEG,
          MINUTE_SEG,
          SECOND_SEG,
          DAY_PERIOD_SEG,
          'trigger',
          'clear-trigger',
          'hidden-input',
          'positioner',
          'content',
          HOUR_COL,
          HOUR_08,
          HOUR_09,
          HOUR_10,
          HOUR_11,
          MINUTE_COL,
          MINUTE_00,
          MINUTE_30,
          SECOND_COL,
          SECOND_00,
          'item[7]',
          DAY_PERIOD_COL,
          PERIOD_AM,
          PERIOD_PM,
        ],
        counts: { input: 4, column: 4, item: 10 },
        activeElement: null,
        parts: {
          'root': { 'data-state': 'closed', 'data-empty': '', 'data-disabled': null, 'data-invalid': null },
          'control': {
            'role': 'group',
            'aria-labelledby': '@part(label)',
            // group 只支持全局属性：禁用与非法显式写 true/false，只读与必填不落在这里
            'aria-disabled': 'false',
            'aria-invalid': 'false',
            'aria-readonly': null,
            'aria-required': null,
          },
          [HOUR_SEG]: {
            'role': 'spinbutton',
            'aria-label': 'hour',
            'aria-valuemin': '0',
            'aria-valuemax': '23',
            // 空段没有当前值：写个 0 会被念成"零点"
            'aria-valuenow': null,
            'aria-valuetext': '--',
            'data-value': 'hour',
            'data-placeholder': '',
            // 整组只占一个 Tab 位，锚点在首段
            'tabindex': '0',
            'hidden': null,
          },
          [MINUTE_SEG]: { 'data-value': 'minute', 'tabindex': '-1', 'hidden': null },
          // 精度默认到分，秒段收起；收起的段连 -1 都不给，不然它还在 Tab 之外占着一个可聚焦位
          [SECOND_SEG]: { 'data-value': 'second', 'hidden': '', 'tabindex': null },
          // 24 小时制下没有上下午段
          [DAY_PERIOD_SEG]: { 'data-value': 'dayPeriod', 'hidden': '', 'tabindex': null },
          'trigger': {
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
          },
          // 键盘用户在段上按退格即可清，这个按钮不占 Tab 位也不报给读屏
          'clear-trigger': { 'tabindex': '-1', 'aria-hidden': 'true', 'disabled': '' },
          // 浮层报的是非模态对话框，与 trigger 的 aria-haspopup="dialog" 对上
          'content': { 'role': 'dialog', 'aria-modal': 'false', 'hidden': '', 'data-state': 'closed' },
          [HOUR_COL]: {
            'role': 'listbox',
            'data-value': 'hour',
            'aria-orientation': 'vertical',
            'aria-multiselectable': 'false',
            'hidden': null,
            // 这一段还空着，没有格子当锚点：Tab 位由列本身兜底
            'tabindex': '0',
          },
          [MINUTE_COL]: { 'data-value': 'minute', 'hidden': null },
          [SECOND_COL]: { 'data-value': 'second', 'hidden': '' },
          // 24 小时制下没有上下午可挑，这一列与上下午段一并收起
          [DAY_PERIOD_COL]: { 'data-value': 'dayPeriod', 'aria-label': 'AM/PM', 'hidden': '' },
          [HOUR_08]: {
            'role': 'option',
            'data-value': '08',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            'data-state': 'unchecked',
            // 无选中就不预落锚点：首格不认领 Tab 位，也不带高亮
            'tabindex': '-1',
            'data-highlighted': null,
          },
          [HOUR_09]: { tabindex: '-1' },
          'hidden-input': { type: 'hidden', name: 'start' },
        },
      },
    },

    {
      name: 'defaultValue 拆进各段，浮层里对应的格显示为选中',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: '09:30', name: 'start' },
      initial: {
        parts: {
          'root': { 'data-empty': null },
          [HOUR_SEG]: { 'aria-valuenow': '9', 'aria-valuetext': '09', 'data-placeholder': null },
          [MINUTE_SEG]: { 'aria-valuenow': '30' },
          [HOUR_09]: { 'aria-selected': 'true', 'data-state': 'checked', 'tabindex': '0' },
          [HOUR_08]: { 'aria-selected': 'false', 'tabindex': '-1' },
          // 有锚点格时列让出 Tab 位
          [HOUR_COL]: { tabindex: '-1' },
          // 焦点不在分列上，它的锚点落在自己选中的那一格
          [MINUTE_30]: { 'aria-selected': 'true', 'tabindex': '0' },
          'clear-trigger': { disabled: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段上的文字是文本节点、隐藏输入的 value 是 property，两者都进不了归一化快照',
          run: ({ doc }) => {
            expectTexts(doc, ['09', '30'], '拆进各段')
            expectHidden(doc, '09:30', '隐藏输入承载完整串')
          },
        },
      ],
    },

    {
      name: '点触发器展开：焦点交给时列的锚点那一格，对外通知一次',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { ...BASE, defaultValue: '09:30' },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { hidden: null },
              root: { 'data-state': 'open' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        // 焦点域要等 content 脱掉 hidden 才交得出去，落点是锚点那一格而不是容器
        { kind: 'settle', until: { activeElement: HOUR_09 } },
      ],
    },

    {
      name: '点触发器展开且这一段还空着：不预落锚点，Tab 位与落焦都归时列容器',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { ...BASE },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              // 指针打开不预落锚点：浮层弹出那一刻一个格子都不高亮
              [HOUR_08]: { 'tabindex': '-1', 'data-highlighted': null },
              [HOUR_COL]: { tabindex: '0' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: HOUR_COL },
          expect: { activeElement: { part: HOUR_COL, exact: true }, events: [] },
        },
        // 第一按方向键才锚定首格，roving tabindex 随之移交
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: HOUR_08, exact: true },
            parts: {
              [HOUR_COL]: { tabindex: '-1' },
              [HOUR_08]: { 'tabindex': '0', 'data-highlighted': '' },
            },
            events: [],
          },
        },
      ],
    },

    {
      name: '触发器上按下键展开，锚点落到首格',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-picker.kbd.open'],
      props: { ...BASE },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true' },
              [HOUR_08]: { 'tabindex': '0', 'data-highlighted': '' },
              [HOUR_COL]: { tabindex: '-1' },
            },
          },
        },
        { kind: 'settle', until: { activeElement: HOUR_08 } },
      ],
    },

    {
      name: '触发器上按上键展开：反向入口从末格进',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { ...BASE },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              [HOUR_11]: { 'tabindex': '0', 'data-highlighted': '' },
              [HOUR_08]: { tabindex: '-1' },
            },
          },
        },
        { kind: 'settle', until: { activeElement: HOUR_11 } },
      ],
    },

    {
      name: 'Enter / Space 翻出来的那次 click 认得出自己是键盘入口，落点补在首格上',
      spec: { apg: BUTTON },
      props: { ...BASE },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 不把 Enter 翻成 click，平台那一步只能手写：keydown 先到，紧接着才是那次 click',
          run: ({ doc }) => {
            const trigger = doc.querySelector<HTMLElement>(`${SCOPE}[data-part="trigger"]`)!
            trigger.focus()
            trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            trigger.click()
          },
          expect: {
            parts: {
              // 键盘入口要有可见落点，与指针点开那一路正相反
              [HOUR_COL]: { tabindex: '-1' },
              [HOUR_08]: { 'tabindex': '0', 'data-highlighted': '' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'settle', until: { activeElement: HOUR_08 } },
      ],
    },

    {
      name: 'Enter / Space 的开合交给原生按钮的激活行为，按键本身一律放行',
      spec: { apg: BUTTON },
      covers: ['time-picker.kbd.toggle'],
      props: { ...BASE },
      steps: [
        // 前提：它确实是 <button type="button">，平台才会替我们把这两个键翻成 click
        nativeActivation('time-picker', 'trigger'),
        {
          kind: 'raw',
          why: 'defaultPrevented 没有归一化快照通道；jsdom 也不把 Enter/Space 翻成 click',
          run: async (ctx) => {
            const trigger = ctx.doc.querySelector<HTMLElement>(`${SCOPE}[data-part="trigger"]`)!
            trigger.focus()
            for (const [key, code] of [['Enter', 'Enter'], [' ', 'Space']] as const) {
              const event = new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true })
              trigger.dispatchEvent(event)
              if (event.defaultPrevented)
                throw new Error(`触发器把 ${code} 吞掉了：平台随后照样合成一次 click，开合会一开一关`)
            }
            await ctx.flush()
          },
          // 按下的当口不该有动静：真正翻面的是平台随后合成的那次 click
          expect: {
            parts: { trigger: { 'aria-expanded': 'false' }, content: { hidden: '' } },
            events: [],
          },
        },
      ],
    },

    {
      name: '上下键在列内走、Home/End 到首末格',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-picker.kbd.item-next', 'time-picker.kbd.item-prev', 'time-picker.kbd.item-first', 'time-picker.kbd.item-last'],
      props: { ...BASE, defaultValue: '09:30' },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: HOUR_09 } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: HOUR_10, exact: true },
            parts: { [HOUR_10]: { 'tabindex': '0', 'data-highlighted': '' }, [HOUR_09]: { tabindex: '-1' } },
          },
        },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: HOUR_09, exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: HOUR_11, exact: true } } },
        // 到尾回绕：时分秒天生成环
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: HOUR_08, exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: HOUR_08, exact: true } } },
      ],
    },

    {
      name: '左右键换列并落到目标列的锚点上，两端停住不回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-picker.kbd.column-next', 'time-picker.kbd.column-prev'],
      props: { ...BASE, defaultValue: '09:30' },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: HOUR_09 } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: MINUTE_30, exact: true } } },
        // 精度到分，分列已是末列，再往右停住
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: MINUTE_30, exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: HOUR_09, exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: HOUR_09, exact: true } } },
      ],
    },

    {
      name: 'enter 选中焦点所在的格，浮层不收起；两列都挑完才凑成一个值',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-picker.kbd.select'],
      props: { ...BASE, name: 'start' },
      steps: [
        // 键盘打开才预落锚点：确认键作用在锚点那一格上
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: HOUR_08 } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            // 分还没挑，值凑不成一个时间，因此不该有值变化通知
            events: [],
            parts: { [HOUR_08]: { 'aria-selected': 'true' }, content: { hidden: null } },
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: MINUTE_00, exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            events: [{ type: 'value-change', detail: { value: '08:00' } }],
            parts: { root: { 'data-empty': null } },
          },
        },
        {
          kind: 'raw',
          why: '段上的文字是文本节点、隐藏输入的 value 是 property',
          run: ({ doc }) => {
            expectTexts(doc, ['08', '00'], '浮层里挑的值要落到段上')
            expectHidden(doc, '08:00', '同上')
          },
        },
      ],
    },

    {
      name: '选了整点之后分列跟着 max 收窄，被裁掉的格自报 aria-disabled 且方向键跳过',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: '11:00' },
      initial: {
        parts: {
          // 上界是 11:00，11 点这一格下面只剩 00 分
          [MINUTE_00]: { 'aria-disabled': 'false' },
          [MINUTE_30]: { 'aria-disabled': 'true', 'data-disabled': '' },
        },
      },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: HOUR_11 } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: MINUTE_00, exact: true } } },
        // 30 分被裁掉了，列内导航绕回 00
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: MINUTE_00, exact: true } } },
      ],
    },

    {
      name: 'escape 收起并把焦点归还触发器，值不变',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-picker.kbd.escape'],
      props: { ...BASE, defaultValue: '09:30' },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: HOUR_09 } },
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
          run: ({ doc }) => expectHidden(doc, '09:30', '收起不改值'),
        },
      ],
    },

    {
      name: 'tab 收起且不抢回焦点',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['time-picker.kbd.tab'],
      props: { ...BASE, defaultValue: '09:30' },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: HOUR_09 } },
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
      name: '段上敲数字：填满本段自动跳下一段，浮层里对应的格随即变成选中',
      spec: { apg: SPINBUTTON },
      covers: ['time-picker.kbd.segment-digit'],
      props: { ...BASE },
      steps: [
        { kind: 'focus', part: HOUR_SEG },
        // type 每一下都打在当下持有焦点的段上，自动跳段因此接得上
        {
          kind: 'type',
          text: '0930',
          expect: {
            activeElement: { part: MINUTE_SEG, exact: true },
            parts: { [HOUR_09]: { 'aria-selected': 'true' }, [MINUTE_30]: { 'aria-selected': 'true' } },
          },
        },
        {
          kind: 'raw',
          why: '段上的文字是文本节点、隐藏输入的 value 是 property',
          run: ({ doc }) => {
            expectTexts(doc, ['09', '30'], '逐位敲进两段')
            expectHidden(doc, '09:30', '两条路写的是同一个值')
          },
        },
      ],
    },

    {
      name: '段上按上下键加减，左右键换段',
      spec: { apg: SPINBUTTON },
      covers: ['time-picker.kbd.segment-increment', 'time-picker.kbd.segment-decrement', 'time-picker.kbd.segment-next', 'time-picker.kbd.segment-prev'],
      props: { ...BASE, defaultValue: '09:30' },
      steps: [
        { kind: 'focus', part: HOUR_SEG },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { [HOUR_SEG]: { 'aria-valuenow': '10' }, [HOUR_10]: { 'aria-selected': 'true' } },
            events: [{ type: 'value-change', detail: { value: '10:30' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: MINUTE_SEG, exact: true },
            parts: { [HOUR_SEG]: { 'tabindex': '-1', 'data-focus': null }, [MINUTE_SEG]: { 'tabindex': '0', 'data-focus': '' } },
          },
        },
        // 首段再往左没有段可去，不回绕
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: HOUR_SEG, exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: HOUR_SEG, exact: true } } },
      ],
    },

    {
      name: '段上 Home / End 直达首末段，收起的段不算末段',
      spec: { apg: SPINBUTTON },
      covers: ['time-picker.kbd.segment-first', 'time-picker.kbd.segment-last'],
      props: { ...BASE, granularity: 'second', defaultValue: '09:30:00' },
      steps: [
        { kind: 'focus', part: MINUTE_SEG },
        {
          kind: 'key',
          key: 'End',
          expect: {
            // 24 小时制下上下午段是收起的，末段因此是秒段而不是它
            activeElement: { part: SECOND_SEG, exact: true },
            parts: {
              [SECOND_SEG]: { 'tabindex': '0', 'data-focus': '' },
              [MINUTE_SEG]: { 'tabindex': '-1', 'data-focus': null },
              [DAY_PERIOD_SEG]: { hidden: '' },
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: HOUR_SEG, exact: true },
            parts: { [HOUR_SEG]: { 'tabindex': '0', 'data-focus': '' }, [SECOND_SEG]: { tabindex: '-1' } },
            events: [],
          },
        },
      ],
    },

    {
      name: 'backspace 清掉本段，值退回空串，其余段留着',
      spec: { apg: SPINBUTTON },
      covers: ['time-picker.kbd.segment-clear'],
      props: { ...BASE, defaultValue: '09:30' },
      steps: [
        { kind: 'focus', part: MINUTE_SEG },
        {
          kind: 'key',
          key: 'Backspace',
          expect: {
            activeElement: { part: MINUTE_SEG, exact: true },
            parts: {
              'root': { 'data-empty': '' },
              [MINUTE_SEG]: { 'aria-valuenow': null, 'data-placeholder': '' },
              [HOUR_SEG]: { 'aria-valuenow': '9' },
              // 时还留着，清空按钮仍该能按
              'clear-trigger': { disabled: null },
            },
            events: [{ type: 'value-change', detail: { value: '' } }],
          },
        },
      ],
    },

    {
      name: '点标题把焦点送到第一段（段不是能被 label for 指向的原生控件）',
      spec: { apg: SPINBUTTON },
      props: { ...BASE },
      steps: [
        { kind: 'click', part: 'label', expect: { activeElement: { part: HOUR_SEG, exact: true } } },
      ],
    },

    {
      name: '清空按钮：按完各段回到占位符，值退回空串',
      spec: { apg: SPINBUTTON },
      props: { ...BASE, defaultValue: '09:30' },
      steps: [
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              'root': { 'data-empty': '' },
              [HOUR_SEG]: { 'data-placeholder': '' },
              'clear-trigger': { hidden: '', disabled: '' },
            },
            // 这个按钮对读屏隐身也不占 Tab 位，清完必须把焦点送回首段
            activeElement: { part: HOUR_SEG, exact: true },
            events: [{ type: 'value-change', detail: { value: '' } }],
          },
        },
        {
          kind: 'raw',
          why: '段上的文字是文本节点',
          run: ({ doc }) => expectTexts(doc, ['--', '--'], '清空后各段回到占位符'),
        },
      ],
    },

    {
      name: 'granularity=second：秒段与秒列一并显出',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, granularity: 'second', defaultValue: '09:30:00' },
      initial: {
        parts: {
          [SECOND_SEG]: { 'hidden': null, 'aria-valuenow': '0', 'aria-valuemax': '59' },
          [SECOND_COL]: { hidden: null },
          [SECOND_00]: { 'aria-selected': 'true' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, '09:30:00', '精度到秒时整串带秒'),
        },
      ],
    },

    {
      name: '12 小时制：多出上下午段，时列写的是显示值',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, hourCycle: 12, defaultValue: '09:30' },
      initial: {
        parts: {
          [HOUR_SEG]: { 'aria-valuemin': '1', 'aria-valuemax': '12', 'aria-valuenow': '9' },
          [DAY_PERIOD_SEG]: {
            'hidden': null,
            'aria-valuemin': '0',
            'aria-valuemax': '1',
            'aria-valuenow': '0',
            'aria-valuetext': 'AM',
            'aria-label': 'AM/PM',
          },
          [HOUR_09]: { 'aria-selected': 'true' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段上的文字是文本节点',
          run: ({ doc }) => expectTexts(doc, ['09', '30', 'AM'], '12 小时制多出上下午段'),
        },
      ],
    },

    {
      // 上界放宽到 23:00：BASE 的 11:00 会把下午整段裁掉，那条由下一个用例专门验
      name: '12 小时制：上下午也成列，浮层里挑它与段上按 a/p 写的是同一个值',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, max: '23:00', hourCycle: 12, defaultValue: '09:30' },
      initial: {
        parts: {
          [DAY_PERIOD_COL]: { 'data-value': 'dayPeriod', 'hidden': null },
          [PERIOD_AM]: { 'role': 'option', 'data-value': '00', 'aria-selected': 'true', 'data-state': 'checked' },
          [PERIOD_PM]: { 'aria-selected': 'false', 'data-state': 'unchecked' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '格上的文字是文本节点，没给 locale 时是 AM / PM',
          run: ({ doc }) => {
            const items = [...doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="item"]`)]
            const texts = [items[8]?.textContent ?? '', items[9]?.textContent ?? '']
            if (texts.join('|') !== 'AM|PM')
              throw new Error(`上下午两格期望 [AM,PM]，实际 [${texts.join(',')}]`)
          },
        },
        { kind: 'click', part: 'trigger' },
        {
          kind: 'click',
          part: PERIOD_PM,
          expect: {
            parts: {
              [PERIOD_PM]: { 'aria-selected': 'true', 'data-state': 'checked' },
              [PERIOD_AM]: { 'aria-selected': 'false' },
              // 时段显示的仍是 09，翻面动的是它背后的那个数
              [DAY_PERIOD_SEG]: { 'aria-valuenow': '1', 'aria-valuetext': 'PM' },
              [HOUR_SEG]: { 'aria-valuenow': '9' },
              // 21:30 仍在 08:00-23:00 之内
              root: { 'data-out-of-range': null },
            },
            events: [{ type: 'value-change', detail: { value: '21:30' } }],
          },
        },
        {
          kind: 'click',
          part: PERIOD_AM,
          expect: {
            parts: {
              [PERIOD_AM]: { 'aria-selected': 'true' },
              [DAY_PERIOD_SEG]: { 'aria-valuenow': '0', 'aria-valuetext': 'AM' },
            },
            events: [{ type: 'value-change', detail: { value: '09:30' } }],
          },
        },
      ],
    },

    {
      // 段上按 p 只是标注越界（值照写），列里则直接裁掉——两条路对越界的处置本就不同
      name: '上下午列跟着界收窄：当前小时翻到下午即出界时，那一格不可选',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, hourCycle: 12, defaultValue: '09:30' },
      initial: {
        parts: {
          [PERIOD_AM]: { 'aria-disabled': 'false' },
          // 上界是 11:00，9 点翻到下午是 21 点，出界
          [PERIOD_PM]: { 'aria-disabled': 'true' },
        },
      },
      steps: [
        { kind: 'click', part: 'trigger' },
        // 不可选的格点了不认，值纹丝不动
        { kind: 'click', part: PERIOD_PM, expect: { events: [], parts: { [DAY_PERIOD_SEG]: { 'aria-valuenow': '0' } } } },
      ],
    },

    {
      name: '上下午段上按 a / p 直接指定（不分大小写），改的是它背后的 24 时值',
      spec: { apg: SPINBUTTON },
      covers: ['time-picker.kbd.segment-period'],
      props: { ...BASE, hourCycle: 12, defaultValue: '09:30' },
      steps: [
        { kind: 'focus', part: DAY_PERIOD_SEG },
        {
          kind: 'key',
          key: 'p',
          expect: {
            parts: {
              [DAY_PERIOD_SEG]: { 'aria-valuenow': '1', 'aria-valuetext': 'PM' },
              // 时段显示的仍是 09（12 小时制写的是显示值），翻面动的是它背后的那个数
              [HOUR_SEG]: { 'aria-valuenow': '9' },
              // 上界是 11:00，翻到下午即出界
              root: { 'data-out-of-range': '' },
            },
            events: [{ type: 'value-change', detail: { value: '21:30' } }],
          },
        },
        {
          kind: 'key',
          // 大写同样认
          key: 'A',
          expect: {
            parts: {
              [DAY_PERIOD_SEG]: { 'aria-valuenow': '0', 'aria-valuetext': 'AM' },
              root: { 'data-out-of-range': null },
            },
            events: [{ type: 'value-change', detail: { value: '09:30' } }],
          },
        },
      ],
    },

    {
      name: 'min/max 之外的格留在列表里但不可选（aria-disabled，不是原生 disabled）',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { min: '09:00', max: '11:00', step: 30 },
      initial: {
        parts: {
          [HOUR_08]: { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null, 'tabindex': '-1' },
          // 这一段还空着，没有格子当锚点，Tab 位归列本身
          [HOUR_09]: { 'aria-disabled': 'false', 'tabindex': '-1' },
          [HOUR_COL]: { tabindex: '0' },
        },
      },
      steps: [
        // 键盘打开：被裁掉的格不算首格，锚点落到首个可选的 09
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: HOUR_09 } },
        // 首格被裁掉了，往上回绕落到末格而不是它
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: HOUR_11, exact: true } } },
      ],
    },

    {
      name: '越界只做标注，不改写值',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: '07:00' },
      initial: {
        parts: {
          root: { 'data-out-of-range': '', 'data-invalid': '' },
          control: { 'aria-invalid': 'true' },
          [HOUR_SEG]: { 'aria-invalid': 'true', 'aria-valuenow': '7' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, '07:00', '越界的值不该被改写'),
        },
      ],
    },

    {
      name: 'invalid 落到 control 与各段上，required 只落到段上',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, invalid: true, required: true },
      initial: {
        parts: {
          root: { 'data-invalid': '' },
          control: { 'aria-invalid': 'true', 'aria-required': null },
          [HOUR_SEG]: { 'aria-invalid': 'true', 'aria-required': 'true', 'data-invalid': '' },
        },
      },
    },

    {
      name: 'disabled：段整组退出 Tab 序列、触发器原生 disabled、格全部不可选、隐藏输入不参与提交',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: '09:30', disabled: true, name: 'start' },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'control': { 'aria-disabled': 'true' },
          // 禁用时连 -1 都不给：节点彻底不可聚焦，与原生 disabled 控件一致
          [HOUR_SEG]: { 'aria-disabled': 'true', 'tabindex': null, 'data-disabled': '' },
          'trigger': { disabled: '' },
          [HOUR_09]: { 'aria-disabled': 'true', 'data-disabled': '' },
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 段上没有 tabindex、按钮是原生 disabled，必须直接往节点上派事件才碰得到守卫
          why: '禁用时段不可聚焦、按钮不派 click，只有直接派发才碰得到守卫',
          run: async (ctx) => {
            const hour = ctx.doc.querySelector<HTMLElement>(`${SCOPE}[data-part="input"]`)!
            for (const key of ['ArrowUp', 'Backspace', '9', 'ArrowRight'])
              hour.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
            ctx.doc.querySelector<HTMLElement>(`${SCOPE}[data-part="trigger"]`)!
              .dispatchEvent(new MouseEvent('click', { bubbles: true }))
            await ctx.flush()
            expectHidden(ctx.doc, '09:30', 'disabled 下值不该动')
          },
          expect: { parts: { content: { hidden: '' } }, events: [], activeElement: null },
        },
      ],
    },

    {
      name: 'readOnly：浮层照常展开与浏览，但值改不动',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: '09:30', readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          // 只读态在 control 上只留 data 属性，aria-readonly 落在每个段上
          'control': { 'data-readonly': '', 'aria-readonly': null },
          [HOUR_SEG]: { 'aria-readonly': 'true', 'tabindex': '0' },
          'clear-trigger': { hidden: '', disabled: '' },
        },
      },
      steps: [
        { kind: 'click', part: 'trigger', expect: { parts: { content: { hidden: null } } } },
        { kind: 'settle', until: { activeElement: HOUR_09 } },
        // 仍能在列里走
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: HOUR_10, exact: true } } },
        // 但选不中
        { kind: 'key', key: 'Enter', expect: { parts: { [HOUR_10]: { 'aria-selected': 'false' } }, events: [] } },
      ],
    },

    {
      name: '受控 value：宿主不写回则界面纹丝不动，回调照发；宿主写回才跟着走',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, value: '09:30' },
      steps: [
        { kind: 'focus', part: HOUR_SEG },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { [HOUR_SEG]: { 'aria-valuenow': '9' }, [HOUR_09]: { 'aria-selected': 'true' } },
            events: [{ type: 'value-change', detail: { value: '10:30' } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: '10:30' },
          expect: {
            parts: { [HOUR_SEG]: { 'aria-valuenow': '10' }, [HOUR_10]: { 'aria-selected': 'true' } },
          },
        },
      ],
    },
  ],
}
