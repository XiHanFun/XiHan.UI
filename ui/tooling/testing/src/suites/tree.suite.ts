import type { TreeNode } from '@xihan-ui/headless'
import type { AttrExpectation, ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { treeAnatomy, treeKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/'

/**
 * 树数据是层级元信息的唯一事实源，作者标记只管长相，两者必须同源。
 *
 * src 下面还套着 utils（两层嵌套才验得出 aria-level 逐层重算）；readme 禁用
 * （方向键与连打都跳过它，但它仍可聚焦、仍是导航起点）；docs 的 children 是空数组——
 * 「暂时没有子项的目录」也得算分支，否则它报不出 aria-expanded。
 * label 用拉丁字母，连打检索按首字母匹配得上。
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

/** 每个用例都得带上同一份 collection：没有它，标记里的节点一个也报不出层级。 */
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

// 文档序下标：branch = [src, utils, docs]，item = [index, dom, readme, license]
const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'span', text: '文件' },
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
}

/** 四个叶子的选中期望，逐个写全——只写关心的那个会漏掉"另一个也被选中了"。 */
function itemsSelected(...values: readonly string[]): readonly AttrExpectation[] {
  return ['index', 'dom', 'readme', 'license'].map(v => ({
    'aria-selected': values.includes(v) ? 'true' : 'false',
    'data-selected': values.includes(v) ? '' : null,
  }))
}

function branchesSelected(...values: readonly string[]): readonly AttrExpectation[] {
  return ['src', 'utils', 'docs'].map(v => ({
    'aria-selected': values.includes(v) ? 'true' : 'false',
  }))
}

/** 三个分支的展开期望；子层容器的 hidden 与它逐一对应，一起写才拦得住"标了开却没露出来"。 */
function branchesExpanded(...values: readonly string[]): readonly AttrExpectation[] {
  return ['src', 'utils', 'docs'].map(v => ({
    'aria-expanded': values.includes(v) ? 'true' : 'false',
    'data-state': values.includes(v) ? 'open' : 'closed',
  }))
}

function contentsShown(...values: readonly string[]): readonly AttrExpectation[] {
  return ['src', 'utils', 'docs'].map(v => ({ hidden: values.includes(v) ? null : '' }))
}

/**
 * roving tabindex：整棵树只留一个 Tab 停靠点，没有锚点时由容器兜底。
 * 共用助手只数一种 part，而树的停靠点可能落在 item 也可能落在 branch，只好就地写一个。
 */
function singleTreeTabStop(): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；树的锚点在 item 与 branch 两种 part 上都可能出现',
    run: ({ doc }) => {
      const nodes = [...doc.querySelectorAll<HTMLElement>(
        '[data-scope="tree"][data-part="item"],[data-scope="tree"][data-part="branch"]',
      )]
      const container = doc.querySelector<HTMLElement>('[data-scope="tree"][data-part="tree"]')
      const stops = nodes.filter(el => el.getAttribute('tabindex') === '0')
      const containerStop = container?.getAttribute('tabindex') === '0'
      if (stops.length > 1)
        throw new Error(`tree 内有 ${stops.length} 个 Tab 停靠点，应当只有一个`)
      if (stops.length === 0 && !containerStop)
        throw new Error('tree 内一个 Tab 停靠点都没有，且容器也没兜底——键盘再也进不来')
      if (stops.length === 1 && containerStop)
        throw new Error('tree 已有锚点节点占着 Tab 位，容器不该再占一个')
    },
  }
}

export const treeSuite: ConformanceSuite = {
  component: 'tree',
  anatomy: treeAnatomy,
  keyboard: treeKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：tree 是 role=tree，叶子与分支都是 treeitem，层级三件套取自 collection',
      spec: { apg: `${APG}#roles_states_properties` },
      props: props(),
      initial: {
        order: [
          'root',
          'label',
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
        ],
        counts: {
          'root': 1,
          'label': 1,
          'tree': 1,
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
          'root': { 'data-disabled': null },
          'label': { id: '@self' },
          'tree': {
            'id': '@self',
            'role': 'tree',
            'aria-labelledby': '@part(label)',
            // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了不是多选"
            'aria-multiselectable': 'false',
            'aria-disabled': 'false',
            // 焦点还在树外：容器兜底进 Tab 序列
            'tabindex': '0',
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
          // 展开箭头只是重复了分支自己的语义：退出可及树，也不占 Tab 位
          'branch-trigger[0]': { 'aria-hidden': 'true', 'tabindex': '-1' },
          'item[0]': {
            'role': 'treeitem',
            'aria-level': '2',
            'aria-posinset': '1',
            'aria-setsize': '3',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            // 叶子不报 aria-expanded：那是"能展开却没展开"的意思
            'aria-expanded': null,
            'data-value': 'index',
            'tabindex': '-1',
            'disabled': null,
          },
          // 收起分支里的节点只是 hidden，没被卸载，层级属性照发
          'item[1]': { 'aria-level': '3', 'aria-posinset': '1', 'aria-setsize': '1', 'data-value': 'dom' },
          'item[2]': { 'aria-disabled': 'true', 'data-disabled': '', 'data-value': 'readme', 'disabled': null },
          'item[3]': { 'aria-level': '1', 'aria-posinset': '3', 'aria-setsize': '3', 'data-value': 'license' },
          'item-indicator[0]': { 'aria-hidden': 'true' },
        },
      },
    },
    {
      // 整棵树只占一个 Tab 位
      name: 'roving tabindex：整棵树只有一个 Tab 停靠点，焦点进来后容器让位',
      spec: { apg: APG },
      props: props(),
      covers: ['tree.kbd.tab'],
      steps: [
        singleTreeTabStop(),
        {
          kind: 'focus',
          part: 'tree',
          expect: {
            activeElement: { part: 'branch[0]', exact: true },
            parts: { 'tree': { tabindex: '-1' }, 'branch[0]': { tabindex: '0' } },
          },
        },
        singleTreeTabStop(),
      ],
    },
    {
      name: '焦点进入树落在选中节点上，不是落在首行',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ defaultSelection: ['license'] }),
      initial: {
        // 焦点还在树外：锚点节点认领 Tab 位
        parts: { 'item[3]': { tabindex: '0' }, 'branch[0]': { tabindex: '-1' } },
      },
      steps: [
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'item[3]', exact: true } } },
      ],
    },
    {
      name: '选中值藏在收起的分支里：它不可聚焦，容器必须继续兜底',
      spec: { apg: APG },
      props: props({ defaultSelection: ['dom'] }),
      initial: {
        // 锚点落在 hidden 节点上时它认领了 tabindex=0 却聚不了焦，容器须兜底
        parts: { 'item[1]': { tabindex: '-1' }, 'tree': { tabindex: '0' } },
      },
      steps: [
        singleTreeTabStop(),
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'branch[0]', exact: true } } },
      ],
    },
    {
      name: '上下键走可见行：收起的子树一行不算，loop 默认关所以首尾不回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: ['tree.kbd.next', 'tree.kbd.prev', 'tree.kbd.first', 'tree.kbd.last'],
      steps: [
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        // src 收着：下一行是 docs，不是它的子节点 index
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'branch[2]', exact: true },
            parts: { 'branch[2]': { 'tabindex': '0', 'data-highlighted': '' }, 'branch[0]': { 'tabindex': '-1', 'data-highlighted': null } },
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[3]', exact: true } } },
        // 末行不回绕
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[3]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch[2]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'item[3]', exact: true },
            // 走了这么一圈，展开与选中都不该动
            parts: { branch: branchesExpanded(), item: itemsSelected() },
          },
        },
      ],
    },
    {
      name: '展开之后子行进入序列，禁用行跳过',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ defaultExpandedValue: ['src', 'utils'] }),
      initial: {
        parts: { 'branch': branchesExpanded('src', 'utils'), 'branch-content': contentsShown('src', 'utils') },
      },
      steps: [
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[1]', exact: true } } },
        // readme 禁用，直接跨过去
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch[2]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[3]', exact: true } } },
      ],
    },
    {
      name: '禁用行仍可聚焦、仍是方向键起点，但确认键不认它',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ defaultExpandedValue: ['src'] }),
      steps: [
        { kind: 'focus', part: 'item[2]', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'Enter', expect: { parts: { item: itemsSelected() } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch[1]', exact: true } } },
      ],
    },
    {
      name: '右键展开、再右键进子层；左键收起、再左键回父层；叶子与根层上不吞键',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: ['tree.kbd.expand', 'tree.kbd.collapse'],
      steps: [
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 展开只改展开态，焦点留在分支上
            activeElement: { part: 'branch[0]', exact: true },
            parts: { 'branch': branchesExpanded('src'), 'branch-content': contentsShown('src') },
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
            parts: { 'branch': branchesExpanded(), 'branch-content': contentsShown() },
          },
        },
        // 根层的行没有父，什么也不做
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'branch[0]', exact: true } } },
      ],
    },
    {
      name: 'dir=rtl 把左右键整体对调',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ dir: 'rtl' }),
      steps: [
        { kind: 'focus', part: 'tree' },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { branch: branchesExpanded('src') } } },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { branch: branchesExpanded() } } },
      ],
    },
    {
      name: '* 展开与焦点行同一父级的全部分支，别层不动',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: ['tree.kbd.expand-siblings'],
      steps: [
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        {
          kind: 'key',
          key: '*',
          expect: {
            // 根层的 src 与 docs 一起开；utils 在下一层，不归这一下管
            parts: { 'branch': branchesExpanded('src', 'docs'), 'branch-content': contentsShown('src', 'docs') },
          },
        },
      ],
    },
    {
      name: '确认键：叶子选中并替换；分支顺带切换展开态',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ defaultExpandedValue: ['src'] }),
      covers: ['tree.kbd.select'],
      steps: [
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { 'branch': branchesSelected('src'), 'branch-content': contentsShown() },
          },
        },
        // 再按一次：选中不变，展开态切回来
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { 'branch': branchesSelected('src'), 'branch-content': contentsShown('src') },
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: itemsSelected('index'), branch: branchesSelected() },
          },
        },
      ],
    },
    {
      name: 'expandOnClick 关掉后确认键与点行都只选中，不碰展开态',
      spec: { apg: APG },
      props: props({ expandOnClick: false, defaultExpandedValue: ['src'] }),
      steps: [
        { kind: 'focus', part: 'tree' },
        {
          kind: 'key',
          key: 'Enter',
          expect: { parts: { 'branch': branchesSelected('src'), 'branch-content': contentsShown('src') } },
        },
        {
          kind: 'click',
          part: 'branch-control[2]',
          expect: { parts: { 'branch': branchesSelected('docs'), 'branch-content': contentsShown('src') } },
        },
      ],
    },
    {
      name: '复选：确认键切换而不是替换，tree 报 aria-multiselectable',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ selectionMode: 'multiple', expandOnClick: false, defaultExpandedValue: ['src'] }),
      initial: { parts: { tree: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'focus', part: 'tree' },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'Enter', expect: { parts: { item: itemsSelected('index') } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch[1]', exact: true } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: { parts: { item: itemsSelected('index'), branch: branchesSelected('utils') } },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: { parts: { item: itemsSelected('index'), branch: branchesSelected() } },
        },
      ],
    },
    {
      name: '点击：点分支行选中并展开，点箭头只切展开，点叶子替换选中',
      spec: { apg: APG },
      props: props(),
      steps: [
        {
          kind: 'click',
          part: 'branch-control[0]',
          expect: {
            // 分支行只是 treeitem 里的一层内容，焦点该落在 branch 上
            activeElement: { part: 'branch[0]', exact: true },
            parts: { 'branch': branchesExpanded('src'), 'branch-content': contentsShown('src') },
          },
        },
        {
          kind: 'click',
          part: 'branch-trigger[0]',
          expect: {
            // 箭头长在 branch-control 里：不掐断冒泡会再跑一遍点行，展开态被切两回
            activeElement: { part: 'branch[0]', exact: true },
            parts: { 'branch-content': contentsShown(), 'branch': branchesSelected('src') },
          },
        },
        {
          kind: 'click',
          part: 'item[3]',
          expect: {
            activeElement: { part: 'item[3]', exact: true },
            parts: { item: itemsSelected('license'), branch: branchesSelected() },
          },
        },
      ],
    },
    {
      name: '禁用节点点不动',
      spec: { apg: APG },
      props: props({ defaultExpandedValue: ['src'], defaultSelection: ['index'] }),
      steps: [
        // 节点用 aria-disabled 表达禁用，click 不被短路，事件派得出去才碰得到 connect 的守卫
        { kind: 'click', part: 'item[2]', expect: { parts: { item: itemsSelected('index') } } },
      ],
    },
    {
      name: '整棵树禁用：所有节点转 aria-disabled，键盘与点击都改不了展开与选中，焦点也落不进节点',
      spec: { apg: APG },
      props: props({ disabled: true, defaultExpandedValue: ['src'], defaultSelection: ['index'] }),
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'tree': { 'aria-disabled': 'true', 'data-disabled': '' },
          'branch[0]': { 'aria-disabled': 'true', 'disabled': null },
          'item[0]': { 'aria-disabled': 'true', 'disabled': null },
        },
      },
      steps: [
        // 一个可停留的行都没有：焦点留在容器上
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'tree', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'tree', exact: true } } },
        {
          kind: 'click',
          part: 'branch-control[0]',
          expect: { parts: { 'branch': branchesSelected(), 'branch-content': contentsShown('src'), 'item': itemsSelected('index') } },
        },
      ],
    },
    {
      name: '受控 expandedValue / selection：宿主不写回则纹丝不动',
      spec: { apg: APG },
      props: props({ expandedValue: [], selection: [] }),
      steps: [
        {
          kind: 'click',
          part: 'branch-control[0]',
          expect: { parts: { 'branch': branchesExpanded(), 'branch-content': contentsShown() } },
        },
        {
          kind: 'setProps',
          props: { expandedValue: ['src'], selection: ['src'] },
          expect: {
            parts: { 'branch': branchesExpanded('src'), 'branch-content': contentsShown('src') },
          },
        },
      ],
    },
    {
      name: '连打检索：按 label 首字母在可见行上搬焦点，走不进收起的子树',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: ['tree.kbd.typeahead'],
      steps: [
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        {
          kind: 'type',
          text: 'd',
          expect: {
            // Dom 在文档序里排在 Docs 前面，但它藏在收起的 src 里、不是可见行；
            // 按文档序检索会落到 item[1]（Dom）上
            activeElement: { part: 'branch[2]', exact: true },
            parts: { 'branch': branchesExpanded(), 'item': itemsSelected(), 'item[1]': { 'data-highlighted': null } },
          },
        },
      ],
    },
  ],
}
