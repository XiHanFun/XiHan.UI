import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { timeFieldAnatomy, timeFieldKeyboard } from '@xihan-ui/headless'

// 分段时间输入在 APG 里最贴近的模式是 spinbutton：每一段都是一个可加减的数。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction'
const SCOPE = '[data-scope="time-field"]'

/** fixture 里段的排布顺序，与下标寻址一一对应。 */
const SEGMENTS = ['hour', 'minute', 'second', 'dayPeriod'] as const
const HOUR = 'segment[0]'
const MINUTE = 'segment[1]'
const SECOND = 'segment[2]'
const DAY_PERIOD = 'segment[3]'

const segment = (name: string): FixtureNode => ({ part: 'segment', tag: 'span', attrs: { segment: name } })

function segmentTexts(doc: Document): string[] {
  return [...doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="segment"]`)]
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

export const timeFieldSuite: ConformanceSuite = {
  component: 'time-field',
  anatomy: timeFieldAnatomy,
  keyboard: timeFieldKeyboard,
  // 四段全写出来：granularity / hourCycle 关掉的那些由连接层打 hidden 收起，不删作者节点
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'label', text: '开始时间' },
      {
        part: 'control',
        children: [
          { part: 'segment-group', children: SEGMENTS.map(s => segment(s)) },
          { part: 'clear-trigger', tag: 'button' },
        ],
      },
      { part: 'hidden-input', tag: 'input' },
    ],
  },
  cases: [
    {
      name: '默认：control 是 group 并由 label 命名，每段是 spinbutton；秒与上下午段收起',
      spec: { apg: APG },
      props: { name: 'start' },
      initial: {
        order: ['root', 'label', 'control', 'segment-group', HOUR, MINUTE, SECOND, DAY_PERIOD, 'clear-trigger', 'hidden-input'],
        counts: { segment: 4 },
        parts: {
          'root': {
            'data-empty': '',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
            'data-out-of-range': null,
          },
          'control': {
            'role': 'group',
            'aria-labelledby': '@part(label)',
            // group 只支持全局属性：禁用与非法显式写 true/false，只读与必填不落在这里
            'aria-disabled': 'false',
            'aria-invalid': 'false',
            'aria-readonly': null,
            'aria-required': null,
          },
          [HOUR]: {
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
          [MINUTE]: { 'data-value': 'minute', 'tabindex': '-1', 'hidden': null },
          // 精度默认到分，秒段收起；收起的段连 -1 都不给，不然它还在 Tab 之外占着一个可聚焦位
          [SECOND]: { 'data-value': 'second', 'hidden': '', 'tabindex': null },
          // 24 小时制下没有上下午段
          [DAY_PERIOD]: { 'data-value': 'dayPeriod', 'hidden': '', 'tabindex': null },
          // 空时清空钮收起（不是禁用）：不占 Tab 位，但不对读屏隐藏
          'clear-trigger': { 'tabindex': '-1', 'aria-hidden': null, 'aria-label': 'Clear', 'hidden': '', 'disabled': null, 'data-disabled': null },
          'hidden-input': { type: 'hidden', name: 'start' },
        },
      },
    },
    {
      name: 'defaultValue 拆进各段，隐藏输入承载完整 ISO 串',
      spec: { apg: APG },
      props: { defaultValue: '13:45', name: 'start' },
      initial: {
        parts: {
          root: { 'data-empty': null },
          [HOUR]: { 'aria-valuenow': '13', 'aria-valuetext': '13', 'data-placeholder': null },
          [MINUTE]: { 'aria-valuenow': '45', 'aria-valuetext': '45' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段上的文字是文本节点、隐藏输入的 value 是 property，两者都进不了归一化快照',
          run: ({ doc }) => {
            expectTexts(doc, ['13', '45'], '拆进各段')
            expectHidden(doc, '13:45', '隐藏输入承载完整串')
          },
        },
      ],
    },
    {
      name: '上下键加减本段，到头回绕并对外报一次值变化',
      spec: { apg: APG },
      covers: ['time-field.kbd.increment', 'time-field.kbd.decrement'],
      props: { defaultValue: '23:59' },
      steps: [
        { kind: 'focus', part: HOUR },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { [HOUR]: { 'aria-valuenow': '0' } },
            events: [{ type: 'value-change', detail: { value: '00:59' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: { [HOUR]: { 'aria-valuenow': '23' } },
            events: [{ type: 'value-change', detail: { value: '23:59' } }],
          },
        },
      ],
    },
    {
      name: '空段加减落到该段的边界上',
      spec: { apg: APG },
      covers: ['time-field.kbd.increment', 'time-field.kbd.decrement'],
      steps: [
        { kind: 'focus', part: MINUTE },
        // 分段下界是 0，上键从它起步
        { kind: 'key', key: 'ArrowUp', expect: { parts: { [MINUTE]: { 'aria-valuenow': '0' } } } },
        { kind: 'focus', part: HOUR },
        // 时段上界是 23，下键从它起步
        { kind: 'key', key: 'ArrowDown', expect: { parts: { [HOUR]: { 'aria-valuenow': '23' } } } },
      ],
    },
    {
      name: '左右键换段，两端停住不回绕；roving tabindex 跟着焦点走',
      spec: { apg: APG },
      covers: ['time-field.kbd.next', 'time-field.kbd.prev'],
      props: { granularity: 'second', defaultValue: '13:45:30' },
      steps: [
        { kind: 'focus', part: HOUR },
        // 首段再往左没有段可去，不回绕到末段
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: HOUR, exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: MINUTE, exact: true },
            parts: { [HOUR]: { 'tabindex': '-1', 'data-focus': null }, [MINUTE]: { 'tabindex': '0', 'data-focus': '' } },
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: SECOND, exact: true } } },
        // 末段再往右同样停住
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: SECOND, exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: MINUTE, exact: true } } },
      ],
    },
    {
      name: '换段跳过被收起的段',
      spec: { apg: APG },
      covers: ['time-field.kbd.next'],
      props: { hourCycle: 12 },
      steps: [
        { kind: 'focus', part: HOUR },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: MINUTE, exact: true } } },
        // 秒段收起了，下一站是上下午段
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: DAY_PERIOD, exact: true } } },
      ],
    },
    {
      name: 'home / End 到首末段',
      spec: { apg: APG },
      covers: ['time-field.kbd.first', 'time-field.kbd.last'],
      props: { granularity: 'second' },
      steps: [
        { kind: 'focus', part: MINUTE },
        { kind: 'key', key: 'End', expect: { activeElement: { part: SECOND, exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: HOUR, exact: true } } },
      ],
    },
    {
      name: '数字直输：填满本段自动跳下一段',
      spec: { apg: APG },
      covers: ['time-field.kbd.digit'],
      steps: [
        { kind: 'focus', part: HOUR },
        // type 每一下都打在当下持有焦点的段上，自动跳段因此接得上
        { kind: 'type', text: '1345', expect: { activeElement: { part: MINUTE, exact: true } } },
        {
          kind: 'raw',
          why: '段上的文字是文本节点，进不了归一化快照',
          run: ({ doc }) => {
            expectTexts(doc, ['13', '45'], '逐位敲进两段')
            expectHidden(doc, '13:45', '填满后隐藏输入应拿到整串')
          },
        },
      ],
    },
    {
      name: '一位就填满的数字当场跳段；拼上去越界的第二位另起一段',
      spec: { apg: APG },
      covers: ['time-field.kbd.digit'],
      steps: [
        { kind: 'focus', part: HOUR },
        // 5 之后再吃一位必越界（50 > 23），这一段当场收工
        { kind: 'key', key: '5', expect: { activeElement: { part: MINUTE, exact: true } } },
        { kind: 'focus', part: HOUR },
        { kind: 'key', key: '2', expect: { parts: { [HOUR]: { 'aria-valuenow': '2' } } } },
        // 25 填不进时段，落到的是 5
        {
          kind: 'key',
          key: '5',
          expect: {
            parts: { [HOUR]: { 'aria-valuenow': '5' } },
            activeElement: { part: MINUTE, exact: true },
          },
        },
      ],
    },
    {
      name: 'backspace / Delete 清掉本段，焦点不动，值退回空串',
      spec: { apg: APG },
      covers: ['time-field.kbd.clear'],
      props: { defaultValue: '13:45' },
      steps: [
        { kind: 'focus', part: MINUTE },
        {
          kind: 'key',
          key: 'Backspace',
          expect: {
            activeElement: { part: MINUTE, exact: true },
            parts: {
              root: { 'data-empty': '' },
              [MINUTE]: { 'aria-valuenow': null, 'data-placeholder': '' },
              // 时段没被碰到
              [HOUR]: { 'aria-valuenow': '13' },
            },
            events: [{ type: 'value-change', detail: { value: '' } }],
          },
        },
        {
          kind: 'key',
          key: 'Delete',
          // 本来就空了，再清一次什么都不该发生
          expect: { events: [] },
        },
      ],
    },
    {
      name: '12 小时制：多出上下午段，0 点显示 12 AM',
      spec: { apg: APG },
      props: { hourCycle: 12, defaultValue: '00:30' },
      initial: {
        parts: {
          [HOUR]: { 'aria-valuemin': '1', 'aria-valuemax': '12', 'aria-valuenow': '12' },
          [DAY_PERIOD]: {
            'hidden': null,
            'aria-valuemin': '0',
            'aria-valuemax': '1',
            'aria-valuenow': '0',
            'aria-valuetext': 'AM',
            'aria-label': 'AM/PM',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段上的文字是文本节点，进不了归一化快照',
          run: ({ doc }) => expectTexts(doc, ['12', '30', 'AM'], '0 点在 12 小时制显示 12 AM'),
        },
      ],
    },
    {
      name: '12 小时制：12 点显示 12 PM',
      spec: { apg: APG },
      props: { hourCycle: 12, defaultValue: '12:30' },
      initial: { parts: { [DAY_PERIOD]: { 'aria-valuenow': '1', 'aria-valuetext': 'PM' } } },
      steps: [
        {
          kind: 'raw',
          why: '段上的文字是文本节点，进不了归一化快照',
          run: ({ doc }) => expectTexts(doc, ['12', '30', 'PM'], '12 点在 12 小时制显示 12 PM'),
        },
      ],
    },
    {
      name: '上下午段：a / p 直接指定，上下键翻面',
      spec: { apg: APG },
      covers: ['time-field.kbd.period'],
      props: { hourCycle: 12, defaultValue: '09:30' },
      steps: [
        { kind: 'focus', part: DAY_PERIOD },
        {
          kind: 'key',
          key: 'p',
          expect: {
            parts: { [DAY_PERIOD]: { 'aria-valuenow': '1' } },
            events: [{ type: 'value-change', detail: { value: '21:30' } }],
          },
        },
        {
          kind: 'key',
          key: 'a',
          expect: {
            parts: { [DAY_PERIOD]: { 'aria-valuenow': '0' } },
            events: [{ type: 'value-change', detail: { value: '09:30' } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { events: [{ type: 'value-change', detail: { value: '21:30' } }] },
        },
      ],
    },
    {
      name: 'granularity=second：秒段显出并参与值',
      spec: { apg: APG },
      props: { granularity: 'second', defaultValue: '13:45:30' },
      initial: {
        parts: {
          [SECOND]: { 'hidden': null, 'aria-valuenow': '30', 'aria-valuemax': '59' },
          root: { 'data-empty': null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, '13:45:30', '精度到秒时整串带秒'),
        },
      ],
    },
    {
      name: 'granularity=hour：只剩时段可编辑，宿主给的分数原样留着',
      spec: { apg: APG },
      props: { granularity: 'hour', defaultValue: '13:45' },
      initial: { parts: { [MINUTE]: { hidden: '' }, [HOUR]: { 'aria-valuenow': '13' } } },
      steps: [
        { kind: 'focus', part: HOUR },
        {
          kind: 'key',
          key: 'ArrowUp',
          // 分位不归用户编辑，但也不该在他改时段时被悄悄清零
          expect: { events: [{ type: 'value-change', detail: { value: '14:45' } }] },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, '14:45', '只改时段，分位跟着原样带过来'),
        },
      ],
    },
    {
      name: 'granularity=hour：字段为空时只填时段即成一个值，分位补 00',
      spec: { apg: APG },
      props: { granularity: 'hour' },
      steps: [
        { kind: 'focus', part: HOUR },
        {
          kind: 'type',
          text: '13',
          expect: {
            parts: { root: { 'data-empty': null } },
            events: [{ type: 'value-change', detail: { value: '01:00' } }, { type: 'value-change', detail: { value: '13:00' } }],
          },
        },
      ],
    },
    {
      name: 'min/max 越界只做标注，不改写值',
      spec: { apg: APG },
      props: { defaultValue: '08:00', min: '09:00', max: '18:00' },
      initial: {
        parts: {
          root: { 'data-out-of-range': '', 'data-invalid': '' },
          control: { 'aria-invalid': 'true' },
          [HOUR]: { 'aria-invalid': 'true', 'aria-valuenow': '8' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, '08:00', '越界的值不该被改写'),
        },
      ],
    },
    {
      name: 'invalid 落到 control 与各段上，required 只落到段上',
      spec: { apg: APG },
      props: { invalid: true, required: true },
      initial: {
        parts: {
          root: { 'data-invalid': '' },
          control: { 'aria-invalid': 'true', 'aria-required': null },
          [HOUR]: { 'aria-invalid': 'true', 'aria-required': 'true', 'data-invalid': '' },
        },
      },
    },
    {
      name: '清空钮：有值才显形，按完各段回到占位符、值退回空串、焦点回到第一段',
      spec: { apg: APG },
      props: { defaultValue: '13:45' },
      initial: {
        parts: { 'clear-trigger': { hidden: null, disabled: null } },
      },
      steps: [
        { kind: 'focus', part: MINUTE },
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              'root': { 'data-empty': '' },
              [HOUR]: { 'aria-valuenow': null, 'data-placeholder': '' },
              [MINUTE]: { 'aria-valuenow': null, 'data-placeholder': '' },
              'clear-trigger': { hidden: '', disabled: null },
            },
            // 这个按钮不占 Tab 位，清完必须把焦点送回第一段
            activeElement: { part: HOUR, exact: true },
            events: [{ type: 'value-change', detail: { value: '' } }],
          },
        },
        {
          kind: 'raw',
          why: '段上的文字是文本节点',
          run: ({ doc }) => {
            expectTexts(doc, ['--', '--'], '清空后各段回到占位符')
            expectHidden(doc, '', '清空后隐藏输入退回空串')
          },
        },
      ],
    },
    {
      name: '清空钮：translations.clearTrigger 换可及名',
      spec: { apg: APG },
      props: { defaultValue: '13:45', translations: { hour: '时', minute: '分', second: '秒', dayPeriod: '上下午', clearTrigger: '清空' } },
      initial: {
        parts: { 'clear-trigger': { 'aria-label': '清空', 'hidden': null } },
      },
    },
    {
      name: 'disabled：整组退出 Tab 序列，隐藏输入不参与提交，键盘推不动值',
      spec: { apg: APG },
      props: { defaultValue: '13:45', disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'control': { 'aria-disabled': 'true' },
          // 禁用时连 -1 都不给：节点彻底不可聚焦，与原生 disabled 控件一致
          [HOUR]: { 'aria-disabled': 'true', 'tabindex': null, 'data-disabled': '' },
          // 禁用时有值也清不得：清空钮收起
          'clear-trigger': { hidden: '' },
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 段上没有 tabindex，焦点落不进去，必须直接往节点上派事件才碰得到守卫
          why: '禁用时段不可聚焦，只有直接派发才碰得到守卫',
          run: async (ctx) => {
            const hour = ctx.doc.querySelector<HTMLElement>(`${SCOPE}[data-part="segment"]`)!
            for (const key of ['ArrowUp', 'Backspace', '9', 'ArrowRight'])
              hour.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
            await ctx.flush()
            expectHidden(ctx.doc, '13:45', 'disabled 下值不该动')
          },
          expect: { events: [], activeElement: null },
        },
      ],
    },
    {
      name: 'readOnly：仍占 Tab 位、仍能换段，只是改不动',
      spec: { apg: APG },
      props: { defaultValue: '13:45', readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          // 只读态在 control 上只留 data 属性，aria-readonly 落在每个段上
          'control': { 'data-readonly': '', 'aria-readonly': null },
          [HOUR]: { 'aria-readonly': 'true', 'tabindex': '0' },
          // 只读时有值也清不得：清空钮收起
          'clear-trigger': { hidden: '' },
        },
      },
      steps: [
        { kind: 'focus', part: HOUR },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: MINUTE, exact: true } } },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { parts: { [MINUTE]: { 'aria-valuenow': '45' } }, events: [] },
        },
      ],
    },
    {
      name: 'placeholder 落到每个空段上',
      spec: { apg: APG },
      props: { placeholder: 'h' },
      initial: { parts: { [HOUR]: { 'aria-valuetext': 'hh' }, [MINUTE]: { 'aria-valuetext': 'hh' } } },
      steps: [
        {
          kind: 'raw',
          why: '段上的文字是文本节点，进不了归一化快照',
          run: ({ doc }) => expectTexts(doc, ['hh', 'hh'], '占位字符按段宽重复'),
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则界面纹丝不动，回调照发；宿主写回才跟着走',
      spec: { apg: APG },
      props: { value: '13:45' },
      steps: [
        { kind: 'focus', part: HOUR },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { [HOUR]: { 'aria-valuenow': '13' } },
            events: [{ type: 'value-change', detail: { value: '14:45' } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: '09:05' },
          expect: { parts: { [HOUR]: { 'aria-valuenow': '9' }, [MINUTE]: { 'aria-valuenow': '5' } } },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => {
            expectTexts(doc, ['09', '05'], '宿主写回后界面应跟着走')
            expectHidden(doc, '09:05', '同上')
          },
        },
      ],
    },
    {
      name: '点标题把焦点送到第一段（段不是能被 label for 指向的原生控件）',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'label', expect: { activeElement: { part: HOUR, exact: true } } },
      ],
    },
  ],
}
