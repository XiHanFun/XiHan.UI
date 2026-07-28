import type { TreeNode } from '@xihan-ui/headless'
import type { AttrExpectation, ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { treeSelectAnatomy, treeSelectKeyboard } from '@xihan-ui/headless'

// 触发器扮演 combobox（收起态的键盘入口、展开收起、值回显都照这一份），
// 展开之后焦点进的是一棵 role=tree，行内导航照 treeview 那一份。
const APG_COMBOBOX = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/'
const APG_TREE = 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/'

const SCOPE = '[data-scope="tree-select"]'

/**
 * 树数据是层级元信息、显示文本与节点禁用的唯一事实源，作者标记只管长相，两者必须同源。
 *
 * src 下面还套着 utils（两层嵌套才验得出 aria-level 逐层重算）；readme 禁用
 * （方向键与连打都跳过它，但它仍可聚焦、仍是导航起点）；docs 的 children 是空数组——
 * 「暂时没有子项的目录」也得算分支，否则它报不出 aria-expanded。
 * label 用拉丁字母，连打检索按首字母匹配得上。
 *
 * 禁用写在这份数据里而不是写成标记上的属性：连接层判禁用只查 collection，
 * 标记上补一个原生 disabled 既不会被读到，又会留在 DOM 里顶掉「集合条目绝不输出原生
 * disabled」那条守卫，还让禁用行变得聚不了焦（它还得当方向键的起点）。
 */
const COLLECTION: TreeNode[] = [
  {
    value: 'src',
    label: 'Source',
    children: [
      { value: 'index', label: 'Index' },
      { value: 'utils', label: 'Utils', children: [{ value: 'dom', label: 'Dom' }] },
      { value: 'readme', label: 'Readme', disabled: true },
    ],
  },
  { value: 'docs', label: 'Docs', children: [] },
  { value: 'license', label: 'License' },
]

/** 每个用例都得带上同一份 collection：没有它，标记里的节点一个也报不出层级与文本。 */
function props(extra: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return { collection: COLLECTION, ...extra }
}

function leaf(value: string, text: string): FixtureNode {
  return {
    part: 'item',
    attrs: { value },
    children: [
      { part: 'item-indicator', tag: 'span' },
      { part: 'item-text', tag: 'span', text },
    ],
  }
}

function branchNode(value: string, text: string, children: readonly FixtureNode[]): FixtureNode {
  return {
    part: 'branch',
    attrs: { value },
    children: [
      {
        part: 'branch-control',
        children: [
          { part: 'branch-trigger', tag: 'span' },
          { part: 'branch-indicator', tag: 'span' },
          { part: 'branch-text', tag: 'span', text },
        ],
      },
      { part: 'branch-content', children },
    ],
  }
}

/**
 * 触发器必须是原生 button：Vue 侧组件自己渲染成 button，WC 侧由 fixture 的 tag 决定，
 * 渲染成 div 就不可聚焦，「收起后焦点归还 trigger」在 WC 上永远等不到。
 * 清空按钮同理——它虽退出了 Tab 序列，清完仍要靠原生禁用把自己关掉。
 *
 * 文档序下标：branch = [src, utils, docs]，item = [index, dom, readme, license]。
 */
const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'span', text: '目录' },
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
              part: 'tree',
              children: [
                branchNode('src', 'Source', [
                  leaf('index', 'Index'),
                  branchNode('utils', 'Utils', [leaf('dom', 'Dom')]),
                  leaf('readme', 'Readme'),
                ]),
                branchNode('docs', 'Docs', []),
                leaf('license', 'License'),
              ],
            },
          ],
        },
      ],
    },
    { part: 'hidden-input', tag: 'input' },
  ],
}

/** 四个叶子的选中期望，逐个写全——只写关心的那个会漏掉「另一个也被选中了」。 */
function itemsSelected(...values: readonly string[]): readonly AttrExpectation[] {
  return ['index', 'dom', 'readme', 'license'].map(v => ({
    'aria-selected': values.includes(v) ? 'true' : 'false',
    'data-selected': values.includes(v) ? '' : null,
  }))
}

function branchesSelected(...values: readonly string[]): readonly AttrExpectation[] {
  return ['src', 'utils', 'docs'].map(v => ({
    'aria-selected': values.includes(v) ? 'true' : 'false',
    'data-selected': values.includes(v) ? '' : null,
  }))
}

/** 三个分支的展开期望；子层容器的 hidden 与它逐一对应，一起写才拦得住「标了开却没露出来」。 */
function branchesExpanded(...values: readonly string[]): readonly AttrExpectation[] {
  return ['src', 'utils', 'docs'].map(v => ({
    'aria-expanded': values.includes(v) ? 'true' : 'false',
    'data-state': values.includes(v) ? 'open' : 'closed',
  }))
}

function branchContentsShown(...values: readonly string[]): readonly AttrExpectation[] {
  return ['src', 'utils', 'docs'].map(v => ({ hidden: values.includes(v) ? null : '' }))
}

/** 显示文字不进归一化快照（快照只采属性），只能直接读 DOM。 */
function assertValueText(doc: Document, expected: string): void {
  const actual = doc.querySelector<HTMLElement>(`${SCOPE}[data-part="value-text"]`)?.textContent?.trim() ?? null
  if (actual !== expected)
    throw new Error(`value-text 文本不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/** name 会反射成属性，value 只落 DOM property；表单出口的两个值一起读才说得清它提交出去的是什么。 */
function assertHiddenInput(doc: Document, name: string, value: string): void {
  const el = doc.querySelector<HTMLInputElement>(`${SCOPE}[data-part="hidden-input"]`)
  const actual = el ? ([el.name, el.value] as const) : null
  const expected = [name, value] as const
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`表单出口的 name/value 不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/**
 * 整个控件在 Tab 序列里的停靠点数目。
 * 多一个会让用户按 Tab 在树里反复停留，展开着却一个都没有则键盘再也进不来。
 */
function expectTabStops(expected: number): StepWithExpect {
  return {
    kind: 'raw',
    why: '停靠点数目是跨节点的计数，逐部件的属性期望表达不了；且锚点可能落在 item、branch 与 tree 三种 part 上，共用的计数助手只数得了一种',
    run: ({ doc }) => {
      const stops = [...doc.querySelectorAll<HTMLElement>(SCOPE)]
        .filter(el => el.getAttribute('tabindex') === '0')
        .map(el => el.getAttribute('data-part') ?? '?')
      if (stops.length !== expected)
        throw new Error(`Tab 停靠点应为 ${expected} 个，实际 ${stops.length} 个：${stops.join(', ') || '无'}`)
    },
  }
}

// content 与 branch-content 始终在 DOM，显隐靠 hidden 属性，不卸载作者节点。
// 浮层坐标由定位引擎异步回填，快照不采 style；data-placement / data-hidden 只在
// 「从没展开过」的那一帧才确定得下来（收起不会把上一次的定位结果清回 null），
// 因此这两个属性只在初始帧断言。
export const treeSelectSuite: ConformanceSuite = {
  component: 'tree-select',
  anatomy: treeSelectAnatomy,
  keyboard: treeSelectKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始收起：trigger 是 combobox 指向 role=tree，层级三件套取自 collection，全树退出 Tab 序列',
      spec: { apg: `${APG_COMBOBOX}#roles_states_properties` },
      props: props({ placeholder: '请选择', name: 'dir' }),
      initial: {
        order: [
          'root',
          'label',
          'trigger',
          'value-text',
          'indicator',
          'clear-trigger',
          'positioner',
          'content',
          'tree',
          'branch[0]',
          'branch-control[0]',
          'branch-trigger[0]',
          'branch-indicator[0]',
          'branch-text[0]',
          'branch-content[0]',
          'item[0]',
          'item-indicator[0]',
          'item-text[0]',
          'branch[1]',
          'branch-control[1]',
          'branch-trigger[1]',
          'branch-indicator[1]',
          'branch-text[1]',
          'branch-content[1]',
          'item[1]',
          'item-indicator[1]',
          'item-text[1]',
          'item[2]',
          'item-indicator[2]',
          'item-text[2]',
          'branch[2]',
          'branch-control[2]',
          'branch-trigger[2]',
          'branch-indicator[2]',
          'branch-text[2]',
          'branch-content[2]',
          'item[3]',
          'item-indicator[3]',
          'item-text[3]',
          'hidden-input',
        ],
        counts: {
          'root': 1,
          'label': 1,
          'trigger': 1,
          'value-text': 1,
          'indicator': 1,
          'clear-trigger': 1,
          'positioner': 1,
          'content': 1,
          'tree': 1,
          'hidden-input': 1,
          'branch': 3,
          'branch-control': 3,
          'branch-trigger': 3,
          'branch-indicator': 3,
          'branch-text': 3,
          'branch-content': 3,
          'item': 4,
          'item-text': 4,
          'item-indicator': 4,
        },
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
            // 按钮扮演 combobox，展开的是一棵树，读屏据此播报「折叠的树」而不是「按钮」
            'role': 'combobox',
            'aria-haspopup': 'tree',
            'aria-expanded': 'false',
            // 指向真正被展开的那个部件（role=tree），不是它外面那层浮层壳
            'aria-controls': '@part(tree)',
            // 名字 = 标签 + 当前值：只指 label 的话读屏永远念不出用户选了什么
            'aria-labelledby': '@part(label) @part(value-text)',
            'aria-invalid': 'false',
            'aria-readonly': 'false',
            'data-state': 'closed',
            'data-placeholder': '',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
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
            // 浮层壳既不是 tree 也不是 listbox，只是焦点域与消解层的根节点
            'role': null,
            'tabindex': '-1',
            'hidden': '',
            'data-state': 'closed',
            'data-placement': 'bottom-start',
          },
          'tree': {
            'id': '@self',
            'role': 'tree',
            'aria-labelledby': '@part(label)',
            // 省略与显式 false 不是一回事：前者是「没说」，后者是「明确说了不是多选」
            'aria-multiselectable': 'false',
            'aria-disabled': 'false',
            // 收起态没有锚点，容器也不该占 Tab 位：节点连同 content 一起 hidden，本就不可达
            'tabindex': '-1',
            'data-state': 'closed',
            'data-disabled': null,
          },
          'branch[0]': {
            'role': 'treeitem',
            'aria-level': '1',
            'aria-posinset': '1',
            'aria-setsize': '3',
            'aria-expanded': 'false',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            // 分支裹着整棵子树，名字从内容算会把所有子孙的文字念进去，必须显式给
            'aria-label': 'Source',
            'data-value': 'src',
            'data-state': 'closed',
            'data-selected': null,
            'data-disabled': null,
            'data-highlighted': null,
            'tabindex': '-1',
            // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
            'disabled': null,
          },
          // 嵌在 src 里的分支：层级号与同层序号都按它自己那一层算
          'branch[1]': {
            'aria-level': '2',
            'aria-posinset': '2',
            'aria-setsize': '3',
            'aria-label': 'Utils',
            'data-value': 'utils',
          },
          'branch[2]': {
            'aria-level': '1',
            'aria-posinset': '2',
            'aria-setsize': '3',
            'aria-expanded': 'false',
            'data-value': 'docs',
          },
          'branch-content[0]': { 'role': 'group', 'hidden': '', 'data-state': 'closed' },
          // 展开箭头只重复了分支自己的左右方向键语义：退出可及树，也不占 Tab 位
          'branch-trigger[0]': { 'aria-hidden': 'true', 'tabindex': '-1' },
          'item[0]': {
            'role': 'treeitem',
            'aria-level': '2',
            'aria-posinset': '1',
            'aria-setsize': '3',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            // 叶子不报 aria-expanded：那是「能展开却没展开」的意思
            'aria-expanded': null,
            'data-value': 'index',
            'tabindex': '-1',
            'disabled': null,
          },
          // 收起分支里的节点只是 hidden，没被卸载，层级属性照发
          'item[1]': { 'aria-level': '3', 'aria-posinset': '1', 'aria-setsize': '1', 'data-value': 'dom' },
          'item[2]': { 'aria-disabled': 'true', 'data-disabled': '', 'data-value': 'readme', 'disabled': null },
          'item[3]': { 'aria-level': '1', 'aria-posinset': '3', 'aria-setsize': '3', 'data-value': 'license' },
          'item-indicator[0]': { 'aria-hidden': 'true', 'data-selected': null },
          // 表单出口对键盘与读屏都不存在，交互全由 trigger 与节点承担
          'hidden-input': { type: 'hidden', name: 'dir', disabled: null },
        },
        activeElement: null,
      },
      steps: [
        expectTabStops(0),
        {
          kind: 'raw',
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, '请选择')
            assertHiddenInput(doc, 'dir', '')
          },
        },
      ],
    },
    {
      name: '点击 trigger 展开：content 去掉 hidden、trigger 报展开，焦点锚点落到首个可见行',
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
              // 有锚点时 Tab 位归锚点节点，容器让位
              'tree': { tabindex: '-1' },
              'branch[0]': { 'tabindex': '0', 'data-highlighted': '' },
              'branch[2]': { 'tabindex': '-1', 'data-highlighted': null },
              // src 还收着：它的子树一行不出，也不该有谁认领 Tab 位
              'item[0]': { 'tabindex': '-1', 'data-highlighted': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'branch[0]' },
          expect: { activeElement: { part: 'branch[0]', exact: true }, events: [] },
        },
        expectTabStops(1),
      ],
    },
    {
      name: 'Enter 从 trigger 展开：不被按钮默认激活合成的 click 反手关掉',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props(),
      covers: ['tree-select.kbd.open'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true' },
              content: { hidden: null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'branch[0]' },
          expect: { activeElement: { part: 'branch[0]', exact: true } },
        },
      ],
    },
    {
      name: 'ArrowUp 从 trigger 展开并把焦点落到选中行的上一个可见行',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props({ defaultExpandedValue: ['src'], defaultValue: 'index' }),
      covers: ['tree-select.kbd.open-prev'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              // index 的上一可见行是它的父分支 src
              'trigger': { 'aria-expanded': 'true' },
              'branch[0]': { 'tabindex': '0', 'data-highlighted': '' },
              'item[0]': { 'tabindex': '-1', 'aria-selected': 'true' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'branch[0]' },
          expect: { activeElement: { part: 'branch[0]', exact: true } },
        },
      ],
    },
    {
      name: 'ArrowDown 从 trigger 展开落到选中行的下一行；树内上下键走可见行，禁用行跳过、首尾不回绕',
      spec: { apg: `${APG_TREE}#keyboardinteraction` },
      props: props({ defaultExpandedValue: ['src'], defaultValue: 'index' }),
      covers: [
        'tree-select.kbd.open-next',
        'tree-select.kbd.next',
        'tree-select.kbd.prev',
        'tree-select.kbd.first',
        'tree-select.kbd.last',
      ],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            // index 的下一可见行是 utils
            parts: { 'branch[1]': { 'tabindex': '0', 'data-highlighted': '' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'settle', until: { activeElement: 'branch[1]' } },
        // readme 禁用，直接跨过去
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'branch[2]', exact: true },
            parts: {
              'item[2]': { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null, 'tabindex': '-1' },
              'branch[2]': { 'tabindex': '0', 'data-highlighted': '' },
              'branch[1]': { 'tabindex': '-1', 'data-highlighted': null },
            },
            // 移焦点不改选中值，一个事件也不发
            events: [],
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[3]', exact: true }, events: [] } },
        // 末行不回绕
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[3]', exact: true }, events: [] } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch[2]', exact: true }, events: [] } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'branch[0]', exact: true }, events: [] } },
        // 首行不回绕
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch[0]', exact: true }, events: [] } },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'item[3]', exact: true },
            // 走了这么一圈，展开与选中都不该动
            parts: {
              'branch': branchesExpanded('src'),
              'branch-content': branchContentsShown('src'),
              'item': itemsSelected('index'),
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '右键展开、再右键进子层；左键收起、再左键回父层；叶子与根层上不吞键',
      spec: { apg: `${APG_TREE}#keyboardinteraction` },
      props: props(),
      covers: ['tree-select.kbd.expand', 'tree-select.kbd.collapse'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 展开只改展开态，焦点留在分支上
            activeElement: { part: 'branch[0]', exact: true },
            parts: { 'branch': branchesExpanded('src'), 'branch-content': branchContentsShown('src') },
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // 叶子上的右键什么都不做
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // 叶子上的左键回父层
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            activeElement: { part: 'branch[0]', exact: true },
            parts: { 'branch': branchesExpanded(), 'branch-content': branchContentsShown() },
          },
        },
        // 根层的行没有父，什么也不做
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            activeElement: { part: 'branch[0]', exact: true },
            // 一路走下来浮层没被关掉，选中值也没被碰过
            parts: { content: { hidden: null }, item: itemsSelected() },
            events: [],
          },
        },
      ],
    },
    {
      name: 'dir=rtl 把左右键整体对调：展开永远是「往子层去」的那个方向',
      spec: { apg: `${APG_TREE}#keyboardinteraction` },
      props: props({ dir: 'rtl' }),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { parts: { 'branch': branchesExpanded('src'), 'branch-content': branchContentsShown('src') } },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { 'branch': branchesExpanded(), 'branch-content': branchContentsShown() } },
        },
      ],
    },
    {
      name: '* 展开与焦点行同一父级的全部分支，别层不动',
      spec: { apg: `${APG_TREE}#keyboardinteraction` },
      props: props(),
      covers: ['tree-select.kbd.expand-siblings'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        {
          kind: 'key',
          key: '*',
          expect: {
            // 根层的 src 与 docs 一起开；utils 在下一层，不归这一下管
            parts: {
              'branch': branchesExpanded('src', 'docs'),
              'branch-content': branchContentsShown('src', 'docs'),
              'item': itemsSelected(),
            },
          },
        },
      ],
    },
    {
      name: 'Enter 选中焦点行：先发 value-change 后发 open-change，浮层收起、焦点归还 trigger、value-text 换成选中项文本',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props({ defaultExpandedValue: ['src'], placeholder: '请选择', name: 'dir' }),
      covers: ['tree-select.kbd.select'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'false', 'data-state': 'closed', 'data-placeholder': null },
              'value-text': { 'data-placeholder': null },
              'content': { 'hidden': '', 'data-state': 'closed' },
              'item': itemsSelected('index'),
              // 收起即丢焦点锚点：没有节点该继续认领 Tab 位
              'item[0]': { 'tabindex': '-1', 'data-highlighted': null },
              // 选中不改展开集合
              'branch': branchesExpanded('src'),
            },
            // 先值后开合
            events: [
              { type: 'value-change', detail: { value: ['index'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        expectTabStops(0),
        {
          kind: 'raw',
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, 'Index')
            assertHiddenInput(doc, 'dir', 'index')
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
      name: '多选：确认键切换而不是替换，浮层不收起、焦点留在树里，tree 报 aria-multiselectable',
      spec: { apg: `${APG_TREE}#keyboardinteraction` },
      props: props({ multiple: true, defaultExpandedValue: ['src'] }),
      initial: { parts: { tree: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // 空格与 Enter 同义
        {
          kind: 'key',
          key: 'Space',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: {
              'trigger': { 'aria-expanded': 'true' },
              'content': { hidden: null },
              'item': itemsSelected('index'),
              'item-indicator[0]': { 'data-selected': '' },
            },
            events: [{ type: 'value-change', detail: { value: ['index'] } }],
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch[1]', exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { item: itemsSelected('index'), branch: branchesSelected('utils') },
            events: [{ type: 'value-change', detail: { value: ['index', 'utils'] } }],
          },
        },
        // 再按一次就取消掉
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { item: itemsSelected('index'), branch: branchesSelected() },
            events: [{ type: 'value-change', detail: { value: ['index'] } }],
          },
        },
        {
          kind: 'raw',
          why: '显示文字不进属性快照，只能直接读 DOM',
          run: ({ doc }) => assertValueText(doc, 'Index'),
        },
      ],
    },
    {
      name: '连打检索：按 label 首字母在可见行上搬焦点，走不进收起的子树，也不改选中与展开',
      spec: { apg: `${APG_TREE}#keyboardinteraction` },
      props: props({ defaultExpandedValue: ['src'] }),
      covers: ['tree-select.kbd.typeahead'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        {
          kind: 'type',
          text: 'd',
          expect: {
            // Dom 在文档序里排在 Docs 前面，但 utils 收着、它不是可见行；
            // 按文档序检索会落到 item[1]（Dom）上
            activeElement: { part: 'branch[2]', exact: true },
            parts: {
              'branch[2]': { 'data-highlighted': '' },
              'item[1]': { 'data-highlighted': null },
              'branch': branchesExpanded('src'),
              'item': itemsSelected(),
            },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Escape 收起：content 复位 hidden，选中值与展开集合都不变，焦点归还 trigger',
      spec: { apg: `${APG_COMBOBOX}#keyboardinteraction` },
      props: props({ defaultExpandedValue: ['src'], defaultValue: 'index' }),
      covers: ['tree-select.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
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
              'trigger': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'content': { 'hidden': '', 'data-state': 'closed' },
              'item': itemsSelected('index'),
              'branch': branchesExpanded('src'),
              'branch-content': branchContentsShown('src'),
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
      covers: ['tree-select.kbd.tab'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        {
          kind: 'key',
          key: 'Tab',
          expect: { events: [{ type: 'open-change', detail: { open: false } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false' },
              content: { hidden: '' },
            },
          },
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
      name: '点击：点分支行只选中不展开，点箭头只切展开且不冒泡成一次点行，点叶子选中',
      spec: { apg: APG_TREE },
      props: props({ multiple: true }),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        // 先把焦点挪开：branch-control 自己不占 tabindex，点它时浏览器不会移动焦点，
        // 焦点若本来就停在 branch[0] 上，下一步那条落点断言无论实现改不改焦点都成立
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch[2]', exact: true } } },
        {
          kind: 'click',
          part: 'branch-control[0]',
          expect: {
            // 分支行只是 treeitem 里的一层内容，焦点该落在 branch 上
            activeElement: { part: 'branch[0]', exact: true },
            parts: {
              // 点行只选中不展开：单选选完浮层就收起了，顺带切一下展开态用户根本看不见
              'branch': branchesSelected('src'),
              'branch-content': branchContentsShown(),
            },
            events: [{ type: 'value-change', detail: { value: ['src'] } }],
          },
        },
        {
          kind: 'click',
          part: 'branch-trigger[0]',
          expect: {
            // 箭头长在 branch-control 里：不掐断冒泡就会再跑一遍「点行」，
            // 一次点击既展开又把选中切掉
            activeElement: { part: 'branch[0]', exact: true },
            parts: {
              'branch-content': branchContentsShown('src'),
              'branch': branchesSelected('src'),
            },
            events: [],
          },
        },
        {
          kind: 'click',
          part: 'item[3]',
          expect: {
            activeElement: { part: 'item[3]', exact: true },
            parts: { item: itemsSelected('license'), branch: branchesSelected('src') },
            events: [{ type: 'value-change', detail: { value: ['src', 'license'] } }],
          },
        },
      ],
    },
    {
      name: '禁用节点点不动，但它仍可聚焦、仍是方向键起点',
      spec: { apg: APG_TREE },
      props: props({ defaultExpandedValue: ['src'], defaultValue: 'index' }),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        // 节点用 aria-disabled 表达禁用，click 不会被激活行为短路，事件真派得出去，
        // 因此这一步碰得到连接层里的禁用守卫
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { item: itemsSelected('index'), content: { hidden: null } },
            events: [],
          },
        },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch[1]', exact: true } } },
      ],
    },
    {
      name: '整控件禁用：trigger 用原生 disabled、节点一律 aria-disabled，浮层展不开、选中值也改不动',
      spec: { apg: APG_TREE },
      props: props({ disabled: true, defaultExpandedValue: ['src'], defaultValue: 'index' }),
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'trigger': { 'disabled': '', 'data-disabled': '' },
          'label': { 'data-disabled': '' },
          'tree': { 'aria-disabled': 'true', 'data-disabled': '' },
          // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
          'branch[0]': { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
          'item[0]': { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
          // 禁用的控件不该提交出值
          'hidden-input': { disabled: '' },
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
          part: 'branch-control[0]',
          expect: {
            parts: {
              'branch': branchesSelected(),
              'branch-content': branchContentsShown('src'),
              'item': itemsSelected('index'),
              'content': { hidden: '' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '只读：浮层照常展开、分支照常展开收起，但选中值改不动、也清不掉',
      spec: { apg: APG_TREE },
      props: props({ readOnly: true, defaultValue: 'license' }),
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
        // 焦点落在选中的 license 上
        { kind: 'settle', until: { activeElement: 'item[3]' } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { 'branch': branchesExpanded('src'), 'branch-content': branchContentsShown('src') } },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { item: itemsSelected('license'), branch: branchesSelected(), content: { hidden: null } },
            events: [],
          },
        },
        {
          kind: 'click',
          part: 'branch-control[2]',
          expect: {
            parts: { item: itemsSelected('license'), branch: branchesSelected() },
            events: [],
          },
        },
      ],
    },
    {
      name: '清空按钮：按下不把焦点从 trigger 挪走，清完值归零、焦点还给 trigger，按钮自己也就按不动了',
      spec: { apg: `${APG_COMBOBOX}#roles_states_properties` },
      props: props({ defaultValue: 'license', placeholder: '请选择', name: 'dir' }),
      initial: {
        parts: {
          'clear-trigger': { 'disabled': null, 'data-disabled': null, 'tabindex': '-1', 'aria-hidden': 'true' },
          'trigger': { 'data-placeholder': null },
          'value-text': { 'data-placeholder': null },
          'item': itemsSelected('license'),
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
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, '请选择')
            assertHiddenInput(doc, 'dir', '')
          },
        },
      ],
    },
    {
      name: '受控 value：点节点只发 value-change 不自改选中态，宿主写回后才切换',
      spec: { adr: 'controlled-uncontrolled' },
      props: props({ value: 'src', name: 'dir' }),
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'branch[0]' },
          // 焦点落在受控选中项上
          expect: { parts: { 'branch[0]': { 'aria-selected': 'true', 'tabindex': '0' } } },
        },
        {
          kind: 'click',
          part: 'item[3]',
          expect: {
            parts: {
              branch: branchesSelected('src'),
              item: itemsSelected(),
              // 开合不受控，浮层照常收起
              content: { hidden: '' },
            },
            events: [
              { type: 'value-change', detail: { value: ['license'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        { kind: 'setProps', props: { value: 'license' } },
        {
          kind: 'settle',
          until: { attr: { part: 'item[3]', name: 'aria-selected', value: 'true' } },
          expect: {
            parts: { branch: branchesSelected(), item: itemsSelected('license') },
            // 宿主写回不是新的用户意图，不再发一次
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, 'License')
            assertHiddenInput(doc, 'dir', 'license')
          },
        },
      ],
    },
    {
      name: '受控 expandedValue：宿主不写回则纹丝不动',
      spec: { adr: 'controlled-uncontrolled' },
      props: props({ expandedValue: [] }),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'branch[0]' } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { 'branch': branchesExpanded(), 'branch-content': branchContentsShown() } },
        },
        {
          kind: 'setProps',
          props: { expandedValue: ['src'] },
          expect: { parts: { 'branch': branchesExpanded('src'), 'branch-content': branchContentsShown('src') } },
        },
      ],
    },
    {
      name: 'roving tabindex：收起态整个控件只剩 trigger 一个入口，展开后恰好一个节点认领 Tab 位',
      spec: { apg: APG_TREE },
      props: props({ defaultValue: 'license' }),
      initial: {
        parts: {
          'tree': { tabindex: '-1' },
          'item[3]': { 'aria-selected': 'true', 'tabindex': '-1' },
          'trigger': { tabindex: null },
        },
      },
      steps: [
        expectTabStops(0),
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'item[3]' },
          expect: {
            activeElement: { part: 'item[3]', exact: true },
            parts: { 'item[3]': { 'tabindex': '0', 'data-highlighted': '' }, 'tree': { tabindex: '-1' } },
          },
        },
        expectTabStops(1),
      ],
    },
    {
      name: '选中值藏在收起的分支里：它聚不了焦，展开时焦点退回首个可停留行',
      spec: { apg: APG_TREE },
      props: props({ defaultValue: 'dom' }),
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'branch[0]' },
          expect: {
            activeElement: { part: 'branch[0]', exact: true },
            parts: {
              // 锚点若落在 hidden 的节点上，它认领了 tabindex=0 却聚不了焦，
              // 而树容器又判自己「焦点在树内」让了位——整棵树零个停靠点
              'item[1]': { 'aria-selected': 'true', 'tabindex': '-1' },
              'branch[0]': { 'tabindex': '0', 'aria-selected': 'false' },
              'tree': { tabindex: '-1' },
            },
          },
        },
        expectTabStops(1),
        {
          kind: 'raw',
          why: '显示文字不进属性快照；这里要验的是收起子树里的选中值照样报得出名字（文本取自 collection 而不是活 DOM）',
          run: ({ doc }) => assertValueText(doc, 'Dom'),
        },
      ],
    },
  ],
}
