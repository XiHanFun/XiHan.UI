import type { ConformanceSuite, StepWithExpect } from '../conformance/types'
import { jsonViewerAnatomy, jsonViewerKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/'

/**
 * 演示值：三种标量、一个数组、一个对象，深度够两层。
 * 根层有两个分支（tags 与 meta），'*' 那一条才验得出「同级一起展开」。
 */
const VALUE = {
  name: 'xihan',
  count: 2,
  tags: ['a'],
  meta: { ok: true },
}

const ROOT = '$'
const NAME = '$["name"]'
const COUNT = '$["count"]'
const TAGS = '$["tags"]'
const META = '$["meta"]'

/** 每个用例都得带上同一份数据：没有它，一行也摊不出来。 */
function props(extra: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return { value: VALUE, ...extra }
}

/**
 * roving tabindex：整棵树只留一个 Tab 停靠点，没有锚点时由容器兜底。
 * 停靠点可能落在 item 也可能落在 branch，共享助手只数一种 part，只好就地写一个。
 */
function singleTreeTabStop(): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；锚点在 item 与 branch 两种 part 上都可能出现',
    run: ({ doc }) => {
      const rows = [...doc.querySelectorAll<HTMLElement>(
        '[data-scope="json-viewer"][data-part="item"],[data-scope="json-viewer"][data-part="branch"]',
      )]
      const container = doc.querySelector<HTMLElement>('[data-scope="json-viewer"][data-part="tree"]')
      const stops = rows.filter(el => el.getAttribute('tabindex') === '0')
      const containerStop = container?.getAttribute('tabindex') === '0'
      if (stops.length > 1)
        throw new Error(`树里有 ${stops.length} 个 Tab 停靠点，应当只有一个`)
      if (stops.length === 0 && !containerStop)
        throw new Error('树里一个 Tab 停靠点都没有，且容器也没兜底——键盘再也进不来')
      if (stops.length === 1 && containerStop)
        throw new Error('已有锚点行占着 Tab 位，容器不该再占一个')
    },
  }
}

export const jsonViewerSuite: ConformanceSuite = {
  component: 'json-viewer',
  anatomy: jsonViewerAnatomy,
  keyboard: jsonViewerKeyboard,
  // 行由组件按数据铺出来，作者只写根容器
  fixture: { part: 'root' },
  cases: [
    {
      name: '初始：默认展开根行，树是 role=tree，每一行是 treeitem，层级三件套取自摊平结果',
      spec: { apg: `${APG}#roles_states_properties` },
      props: props(),
      initial: {
        order: [
          'root',
          'tree',
          'branch[0]',
          'branch-control[0]',
          'branch-trigger[0]',
          'branch-indicator[0]',
          'preview[0]',
          'branch-content',
          'item[0]',
          'item-key[0]',
          'item-value[0]',
          'item[1]',
          'item-key[1]',
          'item-value[1]',
          'branch[1]',
          'branch-control[1]',
          'branch-trigger[1]',
          'branch-indicator[1]',
          'branch-text[0]',
          'preview[1]',
          'branch[2]',
          'branch-control[2]',
          'branch-trigger[2]',
          'branch-indicator[2]',
          'branch-text[1]',
          'preview[2]',
        ],
        counts: {
          'root': 1,
          'tree': 1,
          'branch': 3,
          'branch-control': 3,
          'branch-trigger': 3,
          'branch-indicator': 3,
          'branch-text': 2,
          'branch-content': 1,
          'preview': 3,
          'item': 2,
          'item-key': 2,
          'item-value': 2,
        },
        parts: {
          'root': { 'data-size': null },
          'tree': {
            // 这一片行没有可见标题，名字必须自己给
            'role': 'tree',
            'aria-label': 'JSON',
            // 焦点还在树外：容器兜底进 Tab 序列
            'tabindex': '0',
          },
          'branch[0]': {
            'role': 'treeitem',
            'aria-level': '1',
            'aria-posinset': '1',
            'aria-setsize': '1',
            'aria-expanded': 'true',
            // 分支裹着整棵子层，名字从内容算会把子孙的文字一并念出来，必须显式给；
            // 根行没有键名，用文案里的称呼
            'aria-label': 'root',
            'data-value': ROOT,
            'data-value-type': 'object',
            'data-state': 'open',
            'data-highlighted': null,
            'tabindex': '-1',
            // 行绝不输出原生 disabled：那样就不可聚焦、也当不成方向键起点
            'disabled': null,
          },
          'branch[1]': {
            'aria-level': '2',
            'aria-posinset': '3',
            'aria-setsize': '4',
            'aria-expanded': 'false',
            // 收起时成员数折进名字：括号摘要那个部件对读屏是隐藏的
            'aria-label': 'tags, 1 item',
            'data-value': TAGS,
            'data-value-type': 'array',
            'data-state': 'closed',
          },
          'branch[2]': { 'aria-label': 'meta, 1 item', 'data-value': META, 'data-value-type': 'object' },
          'branch-content': { role: 'group' },
          // 展开箭头只是重复了分支自己的语义：退出可及树。
          // 它铺成 span，本来就不在 Tab 序列里，绝不能再给 tabindex——
          // aria-hidden 的节点一旦可聚焦就是 axe aria-hidden-focus 那一条
          'branch-trigger[0]': { 'aria-hidden': 'true', 'tabindex': null },
          // 摘要是排版记号，念出来只有噪音
          'preview[0]': { 'aria-hidden': 'true' },
          'item[0]': {
            'role': 'treeitem',
            'aria-level': '2',
            'aria-posinset': '1',
            'aria-setsize': '4',
            // 标量行不报 aria-expanded：那是「能展开却没展开」的意思
            'aria-expanded': null,
            // 也不另给 aria-label：那会盖掉值本身，只剩键名念得出来
            'aria-label': null,
            'data-value': NAME,
            'data-value-type': 'string',
            'tabindex': '-1',
            'disabled': null,
          },
          'item[1]': { 'data-value': COUNT, 'data-value-type': 'number', 'aria-posinset': '2' },
          'item-value[0]': { 'data-value-type': 'string' },
          'item-value[1]': { 'data-value-type': 'number' },
        },
        activeElement: null,
      },
    },
    {
      name: 'roving tabindex：整棵树只有一个 Tab 停靠点，焦点进来后容器让位',
      spec: { apg: APG },
      props: props(),
      covers: ['json-viewer.kbd.tab'],
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
      name: '焦点离场：锚点留在上次那一行（Tab 回来落回它），高亮跟着焦点一起走',
      spec: { apg: APG },
      props: props(),
      steps: [
        {
          kind: 'focus',
          part: 'branch[1]',
          expect: {
            activeElement: { part: 'branch[1]', exact: true },
            parts: {
              'tree': { tabindex: '-1' },
              'branch[0]': { tabindex: '-1' },
              'branch[1]': { 'tabindex': '0', 'data-highlighted': '' },
            },
          },
        },
        {
          kind: 'blur',
          expect: {
            parts: {
              // Tab 位留在原地：焦点回来时落回这一行，而不是每次都从头开始
              'tree': { tabindex: '-1' },
              'branch[0]': { tabindex: '-1' },
              // 高亮是「焦点此刻在这里」，焦点走了就得落下
              'branch[1]': { 'tabindex': '0', 'data-highlighted': null },
            },
          },
        },
        singleTreeTabStop(),
      ],
    },
    {
      name: '上下键走可见行：收起的子层一行不算，loop 默认关所以首尾不回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: [
        'json-viewer.kbd.next',
        'json-viewer.kbd.prev',
        'json-viewer.kbd.first',
        'json-viewer.kbd.last',
      ],
      steps: [
        { kind: 'focus', part: 'tree', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'item[0]': { 'tabindex': '0', 'data-highlighted': '' }, 'branch[0]': { 'tabindex': '-1', 'data-highlighted': null } },
          },
        },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        // 首行不回绕
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        // tags 与 meta 都收着，末行是 meta 那一行
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'branch[2]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch[2]', exact: true } } },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'branch[0]', exact: true },
            // 走了这么一圈，展开态一个都不该动
            parts: { 'branch[1]': { 'data-state': 'closed' }, 'branch[2]': { 'data-state': 'closed' } },
          },
        },
      ],
    },
    {
      name: '右键展开、再右键进子层；左键收起、再左键回父层；标量行与根行上不吞键',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: ['json-viewer.kbd.expand', 'json-viewer.kbd.collapse'],
      steps: [
        { kind: 'focus', part: 'branch[1]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 展开只改展开态，焦点留在分支上
            activeElement: { part: 'branch[1]', exact: true },
            // 展开之后成员数由子行的 aria-setsize 报，名字不再带它
            parts: { 'branch[1]': { 'aria-expanded': 'true', 'aria-label': 'tags', 'data-state': 'open' } },
          },
        },
        // 展开之后 tags 的子行插在它下面，item 的下标随之重排
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[2]', exact: true } } },
        // 标量行上的右键什么都不做
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[2]', exact: true } } },
        // 标量行上的左键回父层
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'branch[1]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            activeElement: { part: 'branch[1]', exact: true },
            parts: { 'branch[1]': { 'aria-expanded': 'false', 'data-state': 'closed' } },
          },
        },
        // 收起的分支再按一次左键，跳回父行（根行）
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'branch[0]', exact: true } } },
        // 根行此刻是展开的，这一下先把它收起来
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { parts: { 'branch[0]': { 'aria-expanded': 'false' } } },
        },
        // 收起之后没有父可回，什么也不做
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { activeElement: { part: 'branch[0]', exact: true }, counts: { branch: 1, item: 0 } },
        },
      ],
    },
    {
      name: '确认键切换分支展开态；标量行上没有可切换的东西',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: ['json-viewer.kbd.toggle'],
      steps: [
        { kind: 'focus', part: 'branch[1]' },
        { kind: 'key', key: 'Enter', expect: { parts: { 'branch[1]': { 'aria-expanded': 'true' } } } },
        { kind: 'key', key: 'Space', expect: { parts: { 'branch[1]': { 'aria-expanded': 'false' } } } },
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'branch[0]': { 'aria-expanded': 'true' }, 'branch[1]': { 'aria-expanded': 'false' } },
          },
        },
      ],
    },
    {
      name: '* 展开与焦点行同一父级的全部分支',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props(),
      covers: ['json-viewer.kbd.expand-siblings'],
      steps: [
        { kind: 'focus', part: 'branch[1]' },
        {
          kind: 'key',
          key: '*',
          expect: {
            parts: { 'branch[1]': { 'aria-expanded': 'true' }, 'branch[2]': { 'aria-expanded': 'true' } },
          },
        },
      ],
    },
    {
      name: '点分支行切展开态并把焦点交给分支；点箭头只切一次',
      spec: { apg: APG },
      props: props(),
      steps: [
        {
          kind: 'click',
          part: 'branch-control[1]',
          expect: {
            // 分支行只是 treeitem 里的一层内容，焦点该落在 branch 上
            activeElement: { part: 'branch[1]', exact: true },
            parts: { 'branch[1]': { 'aria-expanded': 'true' } },
          },
        },
        {
          kind: 'click',
          part: 'branch-trigger[1]',
          expect: {
            // 箭头长在 branch-control 里：不掐断冒泡会再跑一遍点行，展开态被切两回
            activeElement: { part: 'branch[1]', exact: true },
            parts: { 'branch[1]': { 'aria-expanded': 'false' } },
          },
        },
      ],
    },
    {
      name: '受控 expandedValue：宿主不写回则纹丝不动',
      spec: { adr: 'controlled-uncontrolled' },
      props: props({ expandedValue: [ROOT] }),
      steps: [
        {
          kind: 'click',
          part: 'branch-control[1]',
          expect: { parts: { 'branch[1]': { 'aria-expanded': 'false', 'data-state': 'closed' } } },
        },
        { kind: 'setProps', props: { expandedValue: [ROOT, TAGS] } },
        {
          kind: 'settle',
          until: { attr: { part: 'branch[1]', name: 'aria-expanded', value: 'true' } },
          expect: { parts: { 'branch[1]': { 'data-state': 'open' } } },
        },
      ],
    },
    {
      name: 'defaultExpandedDepth 决定初始摊到第几层',
      spec: { apg: APG },
      props: props({ defaultExpandedDepth: 2 }),
      initial: {
        parts: {
          'branch[0]': { 'aria-expanded': 'true' },
          'branch[1]': { 'aria-expanded': 'true' },
          'branch[2]': { 'aria-expanded': 'true' },
        },
        counts: { 'branch-content': 3 },
      },
    },
    {
      name: 'defaultExpandedDepth=0：整棵树收成一行，容器仍能进 Tab 序列',
      spec: { apg: APG },
      props: props({ defaultExpandedDepth: 0 }),
      initial: {
        counts: { branch: 1, item: 0 },
        parts: { 'tree': { tabindex: '0' }, 'branch[0]': { 'aria-expanded': 'false' } },
      },
    },
    {
      name: 'maxItems 折掉多余成员并补一行占位，占位算进同层总数',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { value: { list: [1, 2, 3, 4] }, defaultExpandedDepth: 2, maxItems: 2 },
      initial: {
        counts: { item: 3 },
        parts: {
          'item[0]': { 'aria-posinset': '1', 'aria-setsize': '3', 'data-truncated': null },
          'item[2]': { 'aria-posinset': '3', 'aria-setsize': '3', 'data-truncated': '', 'data-value-type': 'array' },
        },
      },
    },
    {
      name: '尺寸轴只落在 root 上，子部件不重复标注',
      spec: { apg: APG },
      props: props({ size: 'sm' }),
      initial: {
        parts: {
          'root': { 'data-size': 'sm' },
          'tree': { 'data-size': null },
          'branch[0]': { 'data-size': null },
        },
      },
    },
    {
      name: 'dir=rtl 把左右键整体对调',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: props({ dir: 'rtl' }),
      steps: [
        { kind: 'focus', part: 'branch[1]' },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { 'branch[1]': { 'aria-expanded': 'true' } } } },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'branch[1]': { 'aria-expanded': 'false' } } } },
      ],
    },
  ],
}
