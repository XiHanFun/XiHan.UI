import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { dateFieldAnatomy, dateFieldKeyboard } from '@xihan-ui/headless'

// 分段日期不在 APG 的模式清单里；每一段都是 role=spinbutton 的节点，规范面落在 spinbutton 上。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction'
const SCOPE = '[data-scope="date-field"]'
// 作者写足六个段位节点：精度用不上的那几个由连接层收起，不卸载
const SEGMENT_NODES = 6

function segments(doc: Document): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="segment"]`)]
}

function expectTexts(doc: Document, want: readonly string[], why: string): void {
  const got = segments(doc).slice(0, want.length).map(el => el.textContent ?? '')
  if (got.join('|') !== want.join('|'))
    throw new Error(`${why}：期望 [${want.join(',')}]，实际 [${got.join(',')}]`)
}

function expectHidden(doc: Document, want: string, why: string): void {
  const got = doc.querySelector<HTMLInputElement>(`${SCOPE}[data-part="hidden-input"]`)?.value ?? ''
  if (got !== want)
    throw new Error(`${why}：隐藏输入期望 "${want}"，实际 "${got}"`)
}

/** 直接往段位上派按键。禁用时段位没有 tabindex，焦点落不上去，只有直接派发才碰得到守卫。 */
async function pressOn(ctx: RawStepContext, index: number, keys: readonly string[]): Promise<void> {
  const el = segments(ctx.doc)[index]
  if (!el)
    throw new Error(`找不到第 ${index} 段`)
  for (const key of keys)
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await ctx.flush()
}

function segment(index: number): FixtureNode {
  return {
    part: 'segment',
    tag: 'div',
    attrs: { index: String(index) },
  }
}

export const dateFieldSuite: ConformanceSuite = {
  component: 'date-field',
  anatomy: dateFieldAnatomy,
  keyboard: dateFieldKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 刻意是 span 不是 label：段位是 div，不是可被 <label for> 标注的控件
      { part: 'label', tag: 'span', text: '截止日期' },
      {
        part: 'control',
        children: Array.from({ length: SEGMENT_NODES }, (_, i) => segment(i)),
      },
      { part: 'hidden-input', tag: 'input' },
    ],
  },
  cases: [
    {
      name: '默认（zh-CN）：control 是 group 并由 label 命名，三段按年月日排，多余的段收起',
      spec: { apg: APG },
      props: { locale: 'zh-CN', name: 'due' },
      initial: {
        order: [
          'root',
          'label',
          'control',
          ...Array.from({ length: SEGMENT_NODES }, (_, i) => `segment[${i}]`),
          'hidden-input',
        ],
        counts: { segment: SEGMENT_NODES },
        parts: {
          'root': {
            'data-empty': '',
            'data-complete': null,
            'data-disabled': null,
            'data-invalid': null,
            'data-out-of-range': null,
          },
          'control': { 'role': 'group', 'aria-labelledby': '@part(label)', 'aria-disabled': 'false' },
          'segment[0]': {
            'role': 'spinbutton',
            'data-segment': 'year',
            'data-index': '0',
            // 整组只占一个 Tab 位
            'tabindex': '0',
            'aria-label': 'year',
            'aria-valuemin': '1',
            'aria-valuemax': '9999',
            // 未填时不给 valuenow：0 会被念成"值是 0"，那和"还没填"是两回事
            'aria-valuenow': null,
            'aria-valuetext': 'yyyy',
            'aria-required': 'false',
            'aria-invalid': 'false',
            'data-placeholder': '',
            'hidden': null,
          },
          'segment[1]': { 'data-segment': 'month', 'tabindex': '-1', 'aria-valuemax': '12', 'aria-valuetext': 'mm' },
          // 年月都还没填，日的上界放宽到 31
          'segment[2]': { 'data-segment': 'day', 'tabindex': '-1', 'aria-valuemax': '31', 'aria-valuetext': 'dd' },
          // 精度用不上的段：收起，且不再自称 spinbutton
          'segment[3]': { 'hidden': '', 'role': null, 'data-segment': null, 'tabindex': null, 'aria-valuemin': null },
          'hidden-input': { type: 'hidden', name: 'due' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段位的文字是文本节点，进不了归一化快照',
          run: ({ doc }) => expectTexts(doc, ['yyyy', 'mm', 'dd', '', '', ''], '未填时逐段显示占位串'),
        },
      ],
    },
    {
      name: 'locale 决定段序：同一份标记在 en-US 下变成月日年',
      spec: { apg: APG },
      props: { locale: 'en-US' },
      initial: {
        parts: {
          'segment[0]': { 'data-segment': 'month', 'aria-valuemax': '12' },
          'segment[1]': { 'data-segment': 'day', 'aria-valuemax': '31' },
          'segment[2]': { 'data-segment': 'year', 'aria-valuemax': '9999' },
        },
      },
    },
    {
      name: 'granularity 决定段数：minute 用到五段，第六段收起',
      spec: { apg: APG },
      props: { locale: 'zh-CN', granularity: 'minute' },
      initial: {
        parts: {
          'segment[3]': { 'data-segment': 'hour', 'aria-valuemin': '0', 'aria-valuemax': '23', 'hidden': null },
          'segment[4]': { 'data-segment': 'minute', 'aria-valuemin': '0', 'aria-valuemax': '59', 'hidden': null },
          'segment[5]': { 'data-segment': null, 'hidden': '' },
        },
      },
    },
    {
      name: '已有值：逐段补零显示，valuenow 与隐藏输入同步',
      spec: { apg: APG },
      props: { locale: 'zh-CN', defaultValue: '2026-07-08', name: 'due' },
      initial: {
        parts: {
          'root': { 'data-complete': '', 'data-empty': null },
          'segment[0]': { 'aria-valuenow': '2026', 'aria-valuetext': '2026', 'data-placeholder': null },
          'segment[1]': { 'aria-valuenow': '7', 'aria-valuetext': '07' },
          'segment[2]': { 'aria-valuenow': '8', 'aria-valuetext': '08', 'aria-valuemax': '31' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property，进不了归一化快照',
          run: ({ doc }) => {
            expectHidden(doc, '2026-07-08', '已有值时隐藏输入应拿到 ISO 串')
            expectTexts(doc, ['2026', '07', '08'], '逐段补零显示')
          },
        },
      ],
    },
    {
      name: '上下键加减当前段，到区间两端回绕',
      spec: { apg: APG },
      covers: ['date-field.kbd.increment', 'date-field.kbd.decrement'],
      props: { locale: 'zh-CN', defaultValue: '2026-12-31' },
      steps: [
        { kind: 'focus', part: 'segment[1]' },
        // 12 月加一回到 1 月，不是停在 12
        { kind: 'key', key: 'ArrowUp', expect: { parts: { 'segment[1]': { 'aria-valuenow': '1' } } } },
        { kind: 'key', key: 'ArrowDown', expect: { parts: { 'segment[1]': { 'aria-valuenow': '12' } } } },
        // 焦点全程不动：上下键改的是值，不是位置
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'segment[1]', exact: true } } },
      ],
    },
    {
      name: '日的上界随当月天数走：2 月只到 28（闰年 29）',
      spec: { apg: APG },
      props: { locale: 'zh-CN', defaultValue: '2026-01-31' },
      steps: [
        { kind: 'focus', part: 'segment[1]' },
        {
          kind: 'key',
          key: 'ArrowUp',
          // 1 月 31 日跳到 2 月：日被日历收敛到 28，上界也跟着变
          expect: { parts: { 'segment[2]': { 'aria-valuenow': '28', 'aria-valuemax': '28' } } },
        },
      ],
    },
    {
      name: '左右键换段，两端停住不回绕；收起的段不算一站',
      spec: { apg: APG },
      covers: ['date-field.kbd.next', 'date-field.kbd.prev'],
      props: { locale: 'zh-CN' },
      steps: [
        { kind: 'focus', part: 'segment[0]' },
        // 首段再往左没有段可去
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'segment[0]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'segment[1]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'segment[2]', exact: true },
            // 锚点跟着焦点走：整组始终只有一个 Tab 位
            parts: { 'segment[0]': { tabindex: '-1' }, 'segment[2]': { tabindex: '0' } },
          },
        },
        // 末段再往右也不许绕到收起的第四段上
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'segment[2]', exact: true } } },
      ],
    },
    {
      name: 'home / End 到首末段',
      spec: { apg: APG },
      covers: ['date-field.kbd.first', 'date-field.kbd.last'],
      props: { locale: 'zh-CN', granularity: 'hour' },
      steps: [
        { kind: 'focus', part: 'segment[1]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'segment[3]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'segment[0]', exact: true } } },
      ],
    },
    {
      name: '数字键直填：月份敲 1 再敲 2 成 12 并跳到下一段',
      spec: { apg: APG },
      covers: ['date-field.kbd.digit'],
      // en-US 段序是月、日、年，首段就是月份
      props: { locale: 'en-US' },
      steps: [
        { kind: 'focus', part: 'segment[0]' },
        {
          kind: 'key',
          key: '1',
          expect: {
            // 还能再接一位（10/11/12），所以先留在本段，显示的是敲进去的原始数字串
            activeElement: { part: 'segment[0]', exact: true },
            parts: { 'segment[0]': { 'aria-valuenow': '1', 'aria-valuetext': '1' } },
          },
        },
        {
          kind: 'key',
          key: '2',
          expect: {
            activeElement: { part: 'segment[1]', exact: true },
            parts: { 'segment[0]': { 'aria-valuenow': '12', 'aria-valuetext': '12' } },
          },
        },
      ],
    },
    {
      name: '再补一位必溢出的那一下当场跳段',
      spec: { apg: APG },
      covers: ['date-field.kbd.digit'],
      props: { locale: 'en-US' },
      steps: [
        { kind: 'focus', part: 'segment[0]' },
        {
          // 7 后面再接一位最小也是 70，越过 12，没有第二位可接了
          kind: 'key',
          key: '7',
          expect: {
            activeElement: { part: 'segment[1]', exact: true },
            parts: { 'segment[0]': { 'aria-valuetext': '07' } },
          },
        },
      ],
    },
    {
      name: '段位填齐才产出值：一路敲完三段才对外报一次',
      spec: { apg: APG },
      covers: ['date-field.kbd.digit'],
      props: { locale: 'en-US', name: 'due' },
      steps: [
        { kind: 'focus', part: 'segment[0]' },
        { kind: 'key', key: '7' },
        // 日敲满两位跳到年
        { kind: 'key', key: '2' },
        { kind: 'key', key: '8', expect: { activeElement: { part: 'segment[2]', exact: true }, events: [] } },
        {
          kind: 'raw',
          why: '"还没填齐就没有值"只能直接读隐藏输入的 value property',
          run: ({ doc }) => expectHidden(doc, '', '年还空着时不该有值'),
        },
        { kind: 'key', key: '2' },
        { kind: 'key', key: '0' },
        { kind: 'key', key: '2' },
        {
          kind: 'key',
          key: '6',
          expect: {
            parts: { root: { 'data-complete': '', 'data-empty': null } },
            events: [{ type: 'value-change', detail: { value: '2026-07-28' } }],
          },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, '2026-07-28', '填齐后隐藏输入应拿到 ISO 串'),
        },
      ],
    },
    {
      name: '两位年份在离开该段时补全',
      spec: { apg: APG },
      covers: ['date-field.kbd.digit'],
      props: { locale: 'zh-CN', defaultValue: '2026-07-28' },
      steps: [
        { kind: 'focus', part: 'segment[0]' },
        { kind: 'key', key: '9' },
        {
          kind: 'key',
          key: '9',
          // 还在这一段里：用户可能接着敲第三位，此刻不该擅自当成 1999
          expect: { parts: { 'segment[0]': { 'aria-valuenow': '99', 'aria-valuetext': '99' } } },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'segment[1]', exact: true },
            parts: { 'segment[0]': { 'aria-valuenow': '1999', 'aria-valuetext': '1999' } },
          },
        },
      ],
    },
    {
      name: 'backspace 清掉当前段：焦点不动，整份值退回空',
      spec: { apg: APG },
      covers: ['date-field.kbd.clear'],
      props: { locale: 'zh-CN', defaultValue: '2026-07-28', name: 'due' },
      steps: [
        { kind: 'focus', part: 'segment[1]' },
        {
          kind: 'key',
          key: 'Backspace',
          expect: {
            activeElement: { part: 'segment[1]', exact: true },
            parts: {
              'root': { 'data-complete': null },
              'segment[1]': { 'aria-valuenow': null, 'aria-valuetext': 'mm', 'data-placeholder': '' },
              // 只清本段：年与日一个都不许被抹掉
              'segment[0]': { 'aria-valuenow': '2026' },
              'segment[2]': { 'aria-valuenow': '28' },
            },
            events: [{ type: 'value-change', detail: { value: null } }],
          },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, '', '缺一段就没有值可提交'),
        },
      ],
    },
    {
      name: '点标题把焦点送进首段',
      spec: { apg: APG },
      props: { locale: 'zh-CN' },
      steps: [
        { kind: 'click', part: 'label', expect: { activeElement: { part: 'segment[0]', exact: true } } },
      ],
    },
    {
      name: 'required / invalid：逐段标注',
      spec: { apg: APG },
      props: { locale: 'zh-CN', required: true, invalid: true },
      initial: {
        parts: {
          'root': { 'data-invalid': '' },
          'segment[0]': { 'aria-required': 'true', 'aria-invalid': 'true', 'data-invalid': '' },
          // 收起的段不参与标注
          'segment[3]': { 'aria-required': null, 'aria-invalid': null },
        },
      },
    },
    {
      name: '落在 min / max 之外时标出来，并一并按 invalid 报给读屏',
      spec: { apg: APG },
      props: { locale: 'zh-CN', defaultValue: '2020-01-01', min: '2026-01-01' },
      initial: {
        parts: {
          'root': { 'data-out-of-range': '' },
          'segment[0]': { 'aria-invalid': 'true', 'aria-valuemin': '2026' },
        },
      },
    },
    {
      name: '只读：可聚焦、可换段，但改不动',
      spec: { apg: APG },
      props: { locale: 'zh-CN', defaultValue: '2026-07-28', readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          // 只读仍可聚焦：改不动不等于读不到
          'segment[0]': { 'aria-readonly': 'true', 'tabindex': '0' },
        },
      },
      steps: [
        { kind: 'focus', part: 'segment[1]' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { parts: { 'segment[1]': { 'aria-valuenow': '7' } }, events: [] },
        },
        { kind: 'key', key: 'Backspace', expect: { parts: { 'segment[1]': { 'aria-valuenow': '7' } } } },
        // 换段照旧可用
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'segment[2]', exact: true } } },
      ],
    },
    {
      name: 'disabled：整组退出 Tab 序，隐藏输入不参与提交，值推不动',
      spec: { apg: APG },
      props: { locale: 'zh-CN', defaultValue: '2026-07-28', disabled: true, name: 'due' },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'control': { 'aria-disabled': 'true' },
          'segment[0]': { 'aria-disabled': 'true', 'tabindex': null, 'data-disabled': '' },
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 禁用的段位没有 tabindex，焦点落不上去，必须直接往节点上派事件才碰得到守卫
          why: '禁用时焦点落不到段位上，只有直接派发才碰得到守卫',
          run: async (ctx) => {
            await pressOn(ctx, 1, ['ArrowUp', '9', 'Backspace'])
            expectHidden(ctx.doc, '2026-07-28', 'disabled 下值不该动')
          },
          expect: { events: [] },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则界面纹丝不动，回调照发；宿主写回才跟着走',
      spec: { apg: APG },
      props: { locale: 'zh-CN', value: '2026-07-28' },
      steps: [
        { kind: 'focus', part: 'segment[2]' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            // 受控且宿主未写回：段位不该自作主张
            parts: { 'segment[2]': { 'aria-valuenow': '28' } },
            events: [{ type: 'value-change', detail: { value: '2026-07-29' } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: '2030-01-02' },
          expect: {
            parts: {
              'segment[0]': { 'aria-valuenow': '2030' },
              'segment[1]': { 'aria-valuenow': '1' },
              'segment[2]': { 'aria-valuenow': '2' },
            },
          },
        },
      ],
    },
    {
      name: '受控且当前为空：半份日期留在段位里继续编辑，凑齐了才报出去',
      spec: { apg: APG },
      // 段位不完整时算不出 ISO 串，那种半份日期宿主根本表达不了，也就无所谓接受不接受
      props: { locale: 'en-US', value: '' },
      steps: [
        { kind: 'focus', part: 'segment[0]' },
        {
          kind: 'key',
          key: '7',
          expect: {
            parts: { 'segment[0]': { 'aria-valuenow': '7' } },
            events: [],
          },
        },
        { kind: 'key', key: '2' },
        {
          kind: 'key',
          key: '8',
          // 月与日都还留着，年空着，所以还是没有值
          expect: {
            parts: {
              'segment[0]': { 'aria-valuenow': '7' },
              'segment[1]': { 'aria-valuenow': '28' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '段集决定段序与段数：写 year + quarter 就只剩两段，其余收起',
      spec: { apg: APG },
      // 段集给了就以它为准，granularity 让路；段序不随 locale 变
      props: { locale: 'en-US', segments: ['quarter', 'year'] },
      initial: {
        parts: {
          'segment[0]': { 'data-segment': 'year', 'aria-valuemax': '9999', 'hidden': null, 'tabindex': '0' },
          'segment[1]': { 'data-segment': 'quarter', 'aria-valuemin': '1', 'aria-valuemax': '4', 'hidden': null },
          'segment[2]': { 'data-segment': null, 'hidden': '', 'role': null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段位的文字是文本节点，进不了归一化快照',
          run: ({ doc }) => expectTexts(doc, ['yyyy', 'Qq', '', '', '', ''], '未填时季度显示 Qq'),
        },
      ],
    },
    {
      name: '季度：一位就敲满，值落在那一季的头一天',
      spec: { apg: APG },
      covers: ['date-field.kbd.digit'],
      props: { locale: 'zh-CN', segments: ['year', 'quarter'], defaultValue: '2026-01-01', name: 'q' },
      initial: {
        parts: { 'segment[1]': { 'aria-valuenow': '1', 'aria-valuetext': 'Q1' } },
      },
      steps: [
        { kind: 'focus', part: 'segment[1]' },
        {
          kind: 'key',
          key: '2',
          expect: {
            parts: { 'segment[1]': { 'aria-valuenow': '2', 'aria-valuetext': 'Q2' } },
            events: [{ type: 'value-change', detail: { value: '2026-04-01' } }],
          },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => {
            expectTexts(doc, ['2026', 'Q2'], '季度段带上 Q')
            expectHidden(doc, '2026-04-01', '季度落在那一季的头一天')
          },
        },
      ],
    },
    {
      name: '周：上界随年报给读屏，值落在那一周的周首日',
      spec: { apg: APG },
      covers: ['date-field.kbd.digit'],
      props: { locale: 'zh-CN', segments: ['year', 'week'], defaultValue: '2026-01-05', name: 'w' },
      initial: {
        // 2026 有 53 周（周一起算）
        parts: { 'segment[1]': { 'data-segment': 'week', 'aria-valuemax': '53', 'aria-valuenow': '2' } },
      },
      steps: [
        { kind: 'focus', part: 'segment[1]' },
        { kind: 'key', key: '3' },
        {
          kind: 'key',
          key: '3',
          expect: { parts: { 'segment[1]': { 'aria-valuenow': '33', 'aria-valuetext': '33' } } },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => expectHidden(doc, '2026-08-10', '第 33 周的周首日'),
        },
      ],
    },
    {
      name: '上下午：a / p 直接指定，改写的是小时；数字键不归它',
      spec: { apg: APG },
      covers: ['date-field.kbd.day-period'],
      props: {
        locale: 'zh-CN',
        segments: ['year', 'month', 'day', 'hour', 'dayPeriod'],
        defaultValue: '2026-08-17T09',
        name: 'at',
      },
      initial: {
        parts: {
          // 段集里带上下午，小时段收的是 12 时制的那个数
          'segment[3]': { 'data-segment': 'hour', 'aria-valuemin': '1', 'aria-valuemax': '12', 'aria-valuenow': '9' },
          'segment[4]': { 'data-segment': 'dayPeriod', 'aria-valuemin': '0', 'aria-valuemax': '1', 'aria-valuenow': '0' },
        },
      },
      steps: [
        { kind: 'focus', part: 'segment[4]' },
        {
          kind: 'key',
          key: 'p',
          expect: {
            parts: {
              // 小时段上显示的数不动，改的是整份值
              'segment[3]': { 'aria-valuenow': '9' },
              'segment[4]': { 'aria-valuenow': '1', 'aria-valuetext': '下午' },
            },
            events: [{ type: 'value-change', detail: { value: '2026-08-17T21' } }],
          },
        },
        {
          kind: 'raw',
          why: '隐藏输入的 value 是 property',
          run: ({ doc }) => {
            expectTexts(doc, ['2026', '08', '17', '09', '下午'], '小时是 12 时制的那个数')
            expectHidden(doc, '2026-08-17T21', '下午 9 点是 21 点')
          },
        },
        {
          kind: 'key',
          key: 'a',
          expect: { events: [{ type: 'value-change', detail: { value: '2026-08-17T09' } }] },
        },
        {
          // 上下午没有数字位：这一下什么都不该发生
          kind: 'key',
          key: '1',
          expect: { parts: { 'segment[4]': { 'aria-valuenow': '0' } }, events: [] },
        },
      ],
    },
    {
      name: '段集换掉时照当前值重新派生：月换成季度',
      spec: { apg: APG },
      props: { locale: 'zh-CN', segments: ['year', 'month'], defaultValue: '2026-08-01' },
      initial: {
        parts: { 'segment[1]': { 'data-segment': 'month', 'aria-valuenow': '8' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { segments: ['year', 'quarter'] },
          expect: {
            // 值没动，但要哪几块变了：8 月落在第 3 季
            parts: { 'segment[1]': { 'data-segment': 'quarter', 'aria-valuenow': '3', 'aria-valuetext': 'Q3' } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'placeholder / translations 逐段覆盖内置默认',
      spec: { apg: APG },
      props: {
        locale: 'zh-CN',
        placeholder: { year: '年', month: '月', day: '日' },
        translations: { year: '年份' },
      },
      initial: {
        parts: {
          'segment[0]': { 'aria-label': '年份', 'aria-valuetext': '年' },
          // 没覆盖到的段落回内置默认
          'segment[1]': { 'aria-label': 'month', 'aria-valuetext': '月' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '段位的文字是文本节点，进不了归一化快照',
          run: ({ doc }) => expectTexts(doc, ['年', '月', '日'], '占位串逐段覆盖'),
        },
      ],
    },
  ],
}
