import type { CascaderNode } from '@xihan-ui/headless'
import type { AttrExpectation, ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { cascaderAnatomy, cascaderKeyboard } from '@xihan-ui/headless'

// 触发器扮演 combobox（收起态的键盘入口、展开收起、值回显都照这一份）；
// 展开之后是并排的若干列，每一列都是一个 listbox，列内导航照 listbox 那一份。
// APG 没有级联这个模式，两端各取其一。
const APG_COMBOBOX = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/'
const APG_LISTBOX = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'

const SCOPE = '[data-scope="cascader"]'

/**
 * 树数据是所在列、整条路径、显示文本与条目禁用的唯一事实源，作者标记只管长相，两者必须同源。
 *
 * 三层深（zhejiang/hangzhou/xihu 走得到底）；wenzhou 禁用（方向键跳过它，但它仍可聚焦、
 * 仍是导航起点）；taiwan 的 children 是空数组——级联里那算叶子（右边开一列空的没有意义），
 * 这一条与 Tree 刚好相反。
 *
 * 禁用写在这份数据里而不是写成标记上的属性：连接层判禁用只查 collection，
 * 标记上补一个原生 disabled 既不会被读到，又会让禁用条目变得聚不了焦（它还得当方向键的起点）。
 */
const COLLECTION: CascaderNode[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'Xihu' },
          { value: 'yuhang', label: 'Yuhang' },
        ],
      },
      { value: 'ningbo', label: 'Ningbo', children: [{ value: 'jiangbei', label: 'Jiangbei' }] },
      { value: 'wenzhou', label: 'Wenzhou', disabled: true },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [{ value: 'nanjing', label: 'Nanjing', children: [{ value: 'xuanwu', label: 'Xuanwu' }] }],
  },
  { value: 'taiwan', label: 'Taiwan', children: [] },
  { value: 'macau', label: 'Macau' },
]

/** 每个用例都得带上同一份 collection：没有它，标记里的条目一个也报不出路径与文本。 */
function props(extra: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return { collection: COLLECTION, ...extra }
}

/**
 * 条目在标记里的文档序，与下面 fixture 逐字对应。
 * 列是按树的深度写死的静态结构（第 L 列装第 L 层的全部节点），
 * 当下露哪些由连接层加 hidden 收口——因此下标从头到尾稳定，用例可以直接按位寻址。
 */
const ITEM_ORDER = [
  'zhejiang',
  'jiangsu',
  'taiwan',
  'macau',
  'hangzhou',
  'ningbo',
  'wenzhou',
  'nanjing',
  'xihu',
  'yuhang',
  'jiangbei',
  'xuanwu',
] as const

function item(value: string, text: string): FixtureNode {
  return {
    part: 'item',
    attrs: { value },
    children: [
      { part: 'item-indicator', tag: 'span' },
      { part: 'item-text', tag: 'span', text },
    ],
  }
}

/**
 * 触发器必须是原生 button：Vue 侧组件自己渲染成 button，WC 侧由 fixture 的 tag 决定，
 * 渲染成 div 就不可聚焦，「收起后焦点归还 trigger」在 WC 上永远等不到。
 * 清空按钮同理——它虽退出了 Tab 序列，清完仍要靠原生禁用把自己关掉。
 */
const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'span', text: '归属地' },
    {
      part: 'trigger',
      tag: 'button',
      children: [
        { part: 'value-text', tag: 'span' },
        { part: 'indicator', tag: 'span' },
      ],
    },
    { part: 'clear-trigger', tag: 'button' },
    {
      part: 'positioner',
      children: [
        {
          part: 'content',
          children: [
            {
              part: 'column',
              attrs: { level: '0' },
              children: [
                item('zhejiang', 'Zhejiang'),
                item('jiangsu', 'Jiangsu'),
                item('taiwan', 'Taiwan'),
                item('macau', 'Macau'),
              ],
            },
            {
              part: 'column',
              attrs: { level: '1' },
              children: [
                item('hangzhou', 'Hangzhou'),
                item('ningbo', 'Ningbo'),
                item('wenzhou', 'Wenzhou'),
                item('nanjing', 'Nanjing'),
              ],
            },
            {
              part: 'column',
              attrs: { level: '2' },
              children: [
                item('xihu', 'Xihu'),
                item('yuhang', 'Yuhang'),
                item('jiangbei', 'Jiangbei'),
                item('xuanwu', 'Xuanwu'),
              ],
            },
          ],
        },
      ],
    },
  ],
}

/** 十二个条目的选中期望，逐个写全——只写关心的那个会漏掉「另一个也被选中了」。 */
function itemsSelected(...values: readonly string[]): readonly AttrExpectation[] {
  return ITEM_ORDER.map(v => ({
    'aria-selected': values.includes(v) ? 'true' : 'false',
    'data-selected': values.includes(v) ? '' : null,
  }))
}

/**
 * 当下露着面的条目。级联的核心就在这一条上：选了靠左的一列，它右边原有的列里的条目
 * 必须整批消失。逐个写全才拦得住「新的露出来了，旧的也还在」。
 */
function itemsShown(...values: readonly string[]): readonly AttrExpectation[] {
  return ITEM_ORDER.map(v => ({ hidden: values.includes(v) ? null : '' }))
}

/** 展开路径上的那一串条目（它们的子列开着）。 */
function itemsActive(...values: readonly string[]): readonly AttrExpectation[] {
  return ITEM_ORDER.map(v => ({ 'data-active': values.includes(v) ? '' : null }))
}

/** 三列各自的显隐；列数 = 展开路径走得通的段数 + 1。 */
function columnsShown(count: number): readonly AttrExpectation[] {
  return [0, 1, 2].map(level => ({ hidden: level < count ? null : '' }))
}

/** 显示文字不进归一化快照（快照只采属性），只能直接读 DOM。 */
function assertValueText(doc: Document, expected: string): void {
  const actual = doc.querySelector<HTMLElement>(`${SCOPE}[data-part="value-text"]`)?.textContent?.trim() ?? null
  if (actual !== expected)
    throw new Error(`value-text 文本不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/**
 * 整个控件在 Tab 序列里的停靠点数目。
 * 多一个会让用户按 Tab 在列里反复停留，展开着却一个都没有则键盘再也进不来。
 */
function expectTabStops(expected: number): StepWithExpect {
  return {
    kind: 'raw',
    why: '停靠点数目是跨节点的计数，逐部件的属性期望表达不了；且锚点可能落在 item 与 content 两种 part 上，共用的计数助手只数得了一种',
    run: ({ doc }) => {
      const stops = [...doc.querySelectorAll<HTMLElement>(SCOPE)]
        .filter(el => el.getAttribute('tabindex') === '0')
        .map(el => el.getAttribute('data-part') ?? '?')
      if (stops.length !== expected)
        throw new Error(`Tab 停靠点应为 ${expected} 个，实际 ${stops.length} 个：${stops.join(', ') || '无'}`)
    },
  }
}

// content、column 与 item 始终在 DOM，显隐靠 hidden 属性，不卸载作者节点。
// 浮层坐标由定位引擎异步回填，快照不采 style；data-placement / data-hidden 只在
// 「从没展开过」的那一帧才确定得下来（收起不会把上一次的定位结果清回 null），
// 因此这两个属性只在初始帧断言。
export const cascaderSuite: ConformanceSuite = {
  component: 'cascader',
  anatomy: cascaderAnatomy,
  keyboard: cascaderKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始收起：trigger 是 combobox 指向浮层壳，列是 listbox，只有根列的条目露面且全体退出 Tab 序列',
      spec: { apg: `${APG_COMBOBOX}#roles_states_properties` },
      props: props({ placeholder: '请选择' }),
      initial: {
        counts: { 'root': 1, 'label': 1, 'trigger': 1, 'value-text': 1, 'indicator': 1, 'clear-trigger': 1, 'positioner': 1, 'content': 1, 'column': 3, 'item': 12, 'item-text': 12, 'item-indicator': 12 },
        parts: {
          'root': {
            'data-state': 'closed',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'label': { 'id': '@self', 'data-disabled': null },
          'trigger': {
            'type': 'button',
            // 按钮扮演 combobox，展开的是若干并排的列表框
            'role': 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            // 指向浮层壳而不是某一列：列是随展开路径增减的，指着其中一列会时不时悬空
            'aria-controls': '@part(content)',
            // 名字 = 标签 + 当前值：只指 label 的话读屏永远念不出用户选了什么
            'aria-labelledby': '@part(label) @part(value-text)',
            'aria-invalid': 'false',
            'aria-readonly': 'false',
            'data-state': 'closed',
            'data-placeholder': '',
            'disabled': null,
            // 原生 button 本就在 Tab 序列里，不靠 tabindex 表达
            'tabindex': null,
          },
          'value-text': { 'id': '@self', 'data-placeholder': '', 'data-disabled': null },
          'indicator': { 'aria-hidden': 'true', 'data-state': 'closed' },
          // 整个控件只占一个 Tab 位（就是 trigger）：清空按钮既不进 Tab 序列也不进可及树；
          // 无选中时它按不动，用的是原生 disabled（单体控件，与集合条目相反）
          'clear-trigger': {
            'type': 'button',
            'tabindex': '-1',
            'aria-hidden': 'true',
            'disabled': '',
            'data-disabled': '',
          },
          'positioner': { 'data-state': 'closed', 'data-placement': 'bottom-start', 'data-hidden': null },
          'content': {
            'id': '@self',
            // 浮层壳自身没有集合语义（列表框语义在每一列上），只是焦点域与消解层的根节点
            'role': null,
            'tabindex': '-1',
            'hidden': '',
            'data-state': 'closed',
            'data-placement': 'bottom-start',
          },
          'column[0]': {
            'role': 'listbox',
            'aria-orientation': 'vertical',
            // 省略与显式 false 不是一回事：前者是「没说」，后者是「明确说了不是多选」
            'aria-multiselectable': 'false',
            'aria-disabled': 'false',
            'aria-labelledby': '@part(label)',
            'data-level': '0',
            'tabindex': '-1',
            'hidden': null,
          },
          // 展开路径是空的，右边两列都还没有父条目，名字退回组件标题（不能指一个不存在的 id）
          'column[1]': { 'hidden': '', 'aria-labelledby': '@part(label)', 'data-level': '1' },
          'column[2]': { 'hidden': '', 'aria-labelledby': '@part(label)', 'data-level': '2' },
          'item[0]': {
            'role': 'option',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            // 分支报展开态；此刻它的子列没开
            'aria-expanded': 'false',
            'data-value': 'zhejiang',
            'data-level': '0',
            'data-active': null,
            'data-highlighted': null,
            'tabindex': '-1',
            // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
            'disabled': null,
            'hidden': null,
          },
          // children 是空数组的 taiwan 与没有 children 的 macau 都是叶子：不报 aria-expanded
          'item[2]': { 'aria-expanded': null, 'data-value': 'taiwan' },
          'item[3]': { 'aria-expanded': null, 'data-value': 'macau' },
          // 第 1、2 层的条目常挂在 DOM 里，只是随它们的列一起收着
          'item[4]': { 'hidden': '', 'data-level': '1', 'data-value': 'hangzhou' },
          'item[6]': { 'hidden': '', 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
          'item[8]': { 'hidden': '', 'data-level': '2', 'data-value': 'xihu' },
          'item-indicator[0]': { 'aria-hidden': 'true', 'data-selected': null },
          'item': itemsShown('zhejiang', 'jiangsu', 'taiwan', 'macau'),
        },
        activeElement: null,
      },
      steps: [
        expectTabStops(0),
        {
          kind: 'raw',
          why: '显示文字不进属性快照，只能直接读 DOM',
          run: ({ doc }) => assertValueText(doc, '请选择'),
        },
      ],
    },
    {
      name: '点 trigger 展开：焦点落到首个条目，它的子列随之开着（焦点在哪儿，开着的就是哪一串列）',
      spec: { apg: `${APG_COMBOBOX}#roles_states_properties` },
      props: props(),
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true', 'data-state': 'open' },
              'indicator': { 'data-state': 'open' },
              'content': { 'hidden': null, 'data-state': 'open' },
              'column': columnsShown(2),
              // 第 1 列的名字改指展开它的那个条目，读屏才播报得出「Zhejiang，列表」
              'column[1]': { 'aria-labelledby': '@part(item[0])' },
              'item[0]': { 'tabindex': '0', 'data-highlighted': '', 'data-active': '', 'aria-expanded': 'true' },
              'item[1]': { 'tabindex': '-1', 'data-highlighted': null, 'data-active': null },
              // jiangsu 的子节点 nanjing 不属于当前这一列，照样收着
              'item': itemsShown('zhejiang', 'jiangsu', 'taiwan', 'macau', 'hangzhou', 'ningbo', 'wenzhou'),
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'item[0]' },
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
        expectTabStops(1),
      ],
    },
    {
      name: '点靠左那一列的另一个条目：它右边原有的列整批换掉，更深的列直接消失',
      spec: { apg: APG_LISTBOX },
      props: props(),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        // 走到第 1 列的 hangzhou：第 2 列露出它的两个子节点
        {
          kind: 'click',
          part: 'item[4]',
          expect: {
            parts: {
              'column': columnsShown(3),
              'column[2]': { 'aria-labelledby': '@part(item[4])' },
              'item': itemsShown('zhejiang', 'jiangsu', 'taiwan', 'macau', 'hangzhou', 'ningbo', 'wenzhou', 'xihu', 'yuhang'),
              'item[4]': { 'data-active': '', 'aria-expanded': 'true' },
            },
            // 分支不落值（changeOnSelect 关着），一个事件也不发
            events: [],
          },
        },
        // 回到第 1 列另选 ningbo：第 2 列换成它的子节点，xihu/yuhang 整批收起
        {
          kind: 'click',
          part: 'item[5]',
          expect: {
            parts: {
              'column': columnsShown(3),
              'item': itemsShown('zhejiang', 'jiangsu', 'taiwan', 'macau', 'hangzhou', 'ningbo', 'wenzhou', 'jiangbei'),
              'item[4]': { 'data-active': null, 'aria-expanded': 'false' },
              'item[5]': { 'data-active': '', 'aria-expanded': 'true' },
            },
            events: [],
          },
        },
        // 回到第 0 列另选 jiangsu：第 1 列换内容，第 2 列整列消失
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              column: columnsShown(2),
              item: itemsShown('zhejiang', 'jiangsu', 'taiwan', 'macau', 'nanjing'),
            },
            events: [],
          },
        },
        {
          kind: 'click',
          part: 'item[7]',
          expect: {
            parts: {
              column: columnsShown(3),
              item: itemsActive('jiangsu', 'nanjing'),
            },
          },
        },
        // 叶子右边不开列：taiwan 的 children 是空数组，级联里那算叶子
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              column: columnsShown(1),
              item: itemsShown('zhejiang', 'jiangsu', 'taiwan', 'macau'),
            },
          },
        },
      ],
    },
    {
      name: '键盘：上下键只在当前列内走（禁用条目跳过、首尾回绕），右键进子列、左键回上一列并收掉当前列',
      spec: { apg: `${APG_LISTBOX}#keyboardinteraction` },
      props: props(),
      covers: [
        'cascader.kbd.next',
        'cascader.kbd.prev',
        'cascader.kbd.first',
        'cascader.kbd.last',
        'cascader.kbd.into',
        'cascader.kbd.back',
      ],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[1]', exact: true },
            // 焦点挪到 jiangsu，第 1 列跟着换成它的子节点
            parts: { item: itemsShown('zhejiang', 'jiangsu', 'taiwan', 'macau', 'nanjing') },
            events: [],
          },
        },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[3]', exact: true } } },
        // loop 默认开：末项回绕到首项
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // 进第 1 列
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'item[4]', exact: true },
            parts: { 'column': columnsShown(3), 'item[4]': { tabindex: '0' }, 'item[0]': { tabindex: '-1' } },
          },
        },
        // 列内往下：wenzhou 禁用，跳过它回绕到 hangzhou
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[5]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[4]', exact: true },
            parts: { 'item[6]': { 'aria-disabled': 'true', 'disabled': null, 'tabindex': '-1' } },
          },
        },
        // 回第 0 列：第 1 列右边的那一列被收掉
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { column: columnsShown(2), item: itemsActive('zhejiang') },
          },
        },
        expectTabStops(1),
      ],
    },
    {
      name: '叶子上的右键与根列上的左键都不吞，也不改任何列',
      spec: { apg: `${APG_LISTBOX}#keyboardinteraction` },
      props: props(),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'item[0]', exact: true }, parts: { column: columnsShown(2) } },
        },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[3]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'item[3]', exact: true },
            parts: { content: { hidden: null }, column: columnsShown(1) },
            events: [],
          },
        },
      ],
    },
    {
      name: 'dir=rtl 把左右键整体对调：进子列永远是「往右边那一列去」的那个方向',
      spec: { apg: `${APG_LISTBOX}#keyboardinteraction` },
      props: props({ dir: 'rtl' }),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[4]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      // 收起态的上下键既要展开、又要把焦点落到根列里选中项的相邻条目上，
      // 与 select 的同名两行是一套语义。只验"展开了且焦点落在根列的哪一格"，
      // 具体落哪一格随 defaultValue 而定，这里不给初值，落点就是首/末个可用条目
      name: 'ArrowDown 从 trigger 展开并把焦点落到根列首个可用条目',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props(),
      covers: ['cascader.kbd.open-next'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: { trigger: { 'aria-expanded': 'true' }, content: { hidden: null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'settle', until: { activeElement: 'item[0]' }, expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: 'ArrowUp 从 trigger 展开并把焦点落到根列末个可用条目',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props(),
      covers: ['cascader.kbd.open-prev'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { trigger: { 'aria-expanded': 'true' }, content: { hidden: null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'settle', until: { activeElement: 'item[3]' }, expect: { activeElement: { part: 'item[3]', exact: true } } },
      ],
    },
    {
      name: 'Enter 选中叶子：先发 value-change 后发 open-change，浮层收起、焦点归还 trigger、value-text 换成整条路径',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props({ placeholder: '请选择' }),
      covers: ['cascader.kbd.open', 'cascader.kbd.select'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { trigger: { 'aria-expanded': 'true' }, content: { hidden: null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[4]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[8]', exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'false', 'data-state': 'closed', 'data-placeholder': null },
              'value-text': { 'data-placeholder': null },
              'content': { hidden: '' },
              'item': itemsSelected('xihu'),
              // 收起即丢焦点锚点：没有条目该继续认领 Tab 位
              'item[8]': { 'tabindex': '-1', 'data-highlighted': null },
            },
            // 先值后开合
            events: [
              { type: 'value-change', detail: { value: [['zhejiang', 'hangzhou', 'xihu']] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        expectTabStops(0),
        {
          kind: 'raw',
          why: '显示文字不进属性快照，只能直接读 DOM；这里要验的正是「回显的是整条路径而不是末项」',
          run: ({ doc }) => assertValueText(doc, 'Zhejiang / Hangzhou / Xihu'),
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      name: '再次展开时列一路铺到选中路径上，焦点停在末项',
      spec: { apg: `${APG_COMBOBOX}#roles_states_properties` },
      props: props({ value: ['zhejiang', 'hangzhou', 'xihu'], separator: ' > ' }),
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'item[8]' },
          expect: {
            activeElement: { part: 'item[8]', exact: true },
            parts: {
              'column': columnsShown(3),
              'item': itemsActive('zhejiang', 'hangzhou', 'xihu'),
              'item[8]': { 'tabindex': '0', 'aria-selected': 'true', 'data-selected': '' },
            },
          },
        },
        {
          kind: 'raw',
          why: '显示文字不进属性快照；这里顺带验分隔符换得掉',
          run: ({ doc }) => assertValueText(doc, 'Zhejiang > Hangzhou > Xihu'),
        },
      ],
    },
    {
      name: 'changeOnSelect 关（缺省）：点分支只展开子列、一个值都不落；打开后同时落值且浮层仍不收起',
      spec: { adr: 'cascader-change-on-select' },
      props: props(),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { item: itemsSelected(), content: { hidden: null } },
            events: [],
          },
        },
        { kind: 'setProps', props: { changeOnSelect: true } },
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              item: itemsSelected('jiangsu'),
              // 还要接着往右挑，浮层不收起
              content: { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: [['jiangsu']] } }],
          },
        },
        {
          kind: 'click',
          part: 'item[7]',
          expect: {
            parts: { item: itemsSelected('nanjing'), content: { hidden: null } },
            events: [{ type: 'value-change', detail: { value: [['jiangsu', 'nanjing']] } }],
          },
        },
      ],
    },
    {
      name: 'expandTrigger=hover：指针划过条目就换列，但不把键盘焦点抢走',
      spec: { adr: 'cascader-expand-trigger' },
      props: props({ expandTrigger: 'hover' }),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'raw',
          why: 'pointerenter 不在声明式步骤的动作集合里（只有 click/key/focus），只能手工派一次',
          run: async (ctx) => {
            const target = ctx.doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="item"]`)[1]
            target?.dispatchEvent(new MouseEvent('pointerenter', { bubbles: true, cancelable: true }))
            await ctx.flush()
            const nanjing = ctx.doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="item"]`)[7]
            if (nanjing?.hasAttribute('hidden'))
              throw new Error('悬停没有把子列换成 jiangsu 的子节点')
            // 焦点仍在 zhejiang 上：鼠标划过不该把键盘焦点抢走
            const first = ctx.doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="item"]`)[0]
            if (ctx.doc.activeElement !== first)
              throw new Error('悬停把键盘焦点抢走了')
          },
        },
      ],
    },
    {
      name: '多选：点条目切换而不是替换，浮层不收起，列报 aria-multiselectable',
      spec: { apg: `${APG_LISTBOX}#roles_states_properties` },
      props: props({ multiple: true }),
      initial: { parts: { 'column[0]': { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'click',
          part: 'item[3]',
          expect: {
            parts: {
              'item': itemsSelected('macau'),
              'item-indicator[3]': { 'data-selected': '' },
              'content': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: [['macau']] } }],
          },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: { item: itemsSelected('macau', 'taiwan') },
            events: [{ type: 'value-change', detail: { value: [['macau'], ['taiwan']] } }],
          },
        },
        // 再点一次就取消掉
        {
          kind: 'click',
          part: 'item[3]',
          expect: {
            parts: { item: itemsSelected('taiwan') },
            events: [{ type: 'value-change', detail: { value: [['taiwan']] } }],
          },
        },
      ],
    },
    {
      name: 'Escape 收起：列与选中值都不变，焦点归还 trigger',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props({ value: ['macau'] }),
      covers: ['cascader.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[3]' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: { events: [{ type: 'open-change', detail: { open: false } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { hidden: '' },
              item: itemsSelected('macau'),
            },
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      // 这条守着两件事：Tab 不被吞（要让焦点按序列自然离开），以及收起后不把焦点
      // 从用户刚 Tab 过去的控件上抢回 trigger
      name: 'Tab 收起：浮层让开但焦点不归还 trigger',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props(),
      covers: ['cascader.kbd.tab'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Tab',
          expect: { events: [{ type: 'open-change', detail: { open: false } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: { parts: { trigger: { 'aria-expanded': 'false' }, content: { hidden: '' } } },
        },
        {
          kind: 'raw',
          why: '「焦点没被抢回」是个否定断言，只能直读 activeElement；且归还焦点排在收起之后的微任务里，要等过那一拍才算数',
          run: async ({ doc }) => {
            await new Promise(r => setTimeout(r, 40))
            const trigger = doc.querySelector(`${SCOPE}[data-part="trigger"]`)
            if (doc.activeElement === trigger)
              throw new Error('Tab 收起后焦点被抢回了 trigger')
          },
        },
      ],
    },
    {
      name: '禁用条目点不动，但它仍可聚焦、仍是方向键起点',
      spec: { apg: APG_LISTBOX },
      props: props({ changeOnSelect: true }),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        // 条目用 aria-disabled 表达禁用，click 不会被激活行为短路，事件真派得出去，
        // 因此这一步碰得到连接层里的禁用守卫
        {
          kind: 'click',
          part: 'item[6]',
          expect: {
            activeElement: { part: 'item[6]', exact: true },
            parts: { item: itemsSelected(), content: { hidden: null } },
            events: [],
          },
        },
        // 焦点是事实不是许可：停上去之后方向键从它起步
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[5]', exact: true } } },
      ],
    },
    {
      name: '整控件禁用：trigger 用原生 disabled、条目一律 aria-disabled，浮层展不开、选中值也改不动',
      spec: { apg: APG_LISTBOX },
      props: props({ disabled: true, value: ['macau'] }),
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'trigger': { 'disabled': '', 'data-disabled': '' },
          'label': { 'data-disabled': '' },
          'column[0]': { 'aria-disabled': 'true' },
          // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
          'item[0]': { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
          'clear-trigger': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '原生 disabled 的按钮上 el.click() 会被激活行为短路、事件根本不派发，声明式 click 步骤在这里是空转；只有手工派一次 click 才碰得到连接层的守卫',
          run: async (ctx) => {
            const trigger = ctx.doc.querySelector(`${SCOPE}[data-part="trigger"]`)
            trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
            await ctx.flush()
            const content = ctx.doc.querySelector(`${SCOPE}[data-part="content"]`)
            if (!content?.hasAttribute('hidden'))
              throw new Error('整控件禁用时浮层仍被展开了')
          },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: { item: itemsSelected('macau'), content: { hidden: '' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '只读：浮层照常展开、列照常浏览，但选中值改不动、也清不掉',
      spec: { apg: APG_LISTBOX },
      props: props({ readOnly: true, value: ['macau'], changeOnSelect: true }),
      initial: {
        parts: {
          'root': { 'data-readonly': '', 'data-disabled': null },
          // 只读与禁用的分界就在这里：禁用连键盘入口都没有，只读仍可聚焦、仍能展开来看
          'trigger': { 'disabled': null, 'aria-readonly': 'true', 'data-readonly': '' },
          'clear-trigger': { 'disabled': '', 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { trigger: { 'aria-expanded': 'true' }, content: { hidden: null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'settle', until: { activeElement: 'item[3]' } },
        // 浏览不受影响：列照样跟着焦点走
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { column: columnsShown(2) },
          },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { item: itemsSelected('macau'), content: { hidden: null } },
            events: [],
          },
        },
      ],
    },
    {
      name: '清空按钮：按下不把焦点从 trigger 挪走，清完值归零、焦点还给 trigger，按钮自己也就按不动了',
      spec: { apg: `${APG_COMBOBOX}#roles_states_properties` },
      props: props({ defaultValue: ['zhejiang', 'hangzhou'], placeholder: '请选择' }),
      initial: {
        parts: {
          'clear-trigger': { 'disabled': null, 'data-disabled': null, 'tabindex': '-1', 'aria-hidden': 'true' },
          'trigger': { 'data-placeholder': null },
          'value-text': { 'data-placeholder': null },
          'item': itemsSelected('hangzhou'),
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'defaultPrevented 不是 DOM 属性、快照采不到；而合成事件默认 cancelable=false，必须显式建成可取消的，preventDefault 才不是空操作',
          run: async (ctx) => {
            const clear = ctx.doc.querySelector(`${SCOPE}[data-part="clear-trigger"]`)
            const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 })
            clear?.dispatchEvent(event)
            await ctx.flush()
            if (!event.defaultPrevented)
              throw new Error('清空按钮没拦住 pointerdown：按下时焦点会从 trigger 挪到这个隐身按钮上')
          },
        },
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            // pointerdown 那条只挡指针，键盘与程序化激活这一路要主动把焦点送回 trigger
            activeElement: 'trigger',
            parts: {
              'item': itemsSelected(),
              'trigger': { 'data-placeholder': '' },
              'value-text': { 'data-placeholder': '' },
              // 清完就按不动了
              'clear-trigger': { 'disabled': '', 'data-disabled': '' },
            },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
        {
          kind: 'raw',
          why: '显示文字不进属性快照，只能直接读 DOM',
          run: ({ doc }) => assertValueText(doc, '请选择'),
        },
      ],
    },
    {
      name: '受控 value：点条目只发 value-change 不自改选中态，宿主写回后才切换',
      spec: { adr: 'controlled-uncontrolled' },
      props: props({ value: ['macau'] }),
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'item[3]' },
          // 焦点落在受控选中项上
          expect: { parts: { 'item[3]': { 'aria-selected': 'true', 'tabindex': '0' } } },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: itemsSelected('macau'),
              // 开合不受控，浮层照常收起
              content: { hidden: '' },
            },
            events: [
              { type: 'value-change', detail: { value: [['taiwan']] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        { kind: 'setProps', props: { value: ['taiwan'] } },
        {
          kind: 'settle',
          until: { attr: { part: 'item[2]', name: 'aria-selected', value: 'true' } },
          expect: {
            parts: { item: itemsSelected('taiwan') },
            // 宿主写回不是新的用户意图，不再发一次
            events: [],
          },
        },
      ],
    },
    {
      name: '受控 open：宿主不写回则纹丝不动',
      spec: { adr: 'controlled-uncontrolled' },
      props: props({ open: false }),
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { trigger: { 'aria-expanded': 'false' }, content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'setProps',
          props: { open: true },
          expect: {
            parts: { trigger: { 'aria-expanded': 'true' }, content: { hidden: null } },
            events: [],
          },
        },
      ],
    },
  ],
}
