import type { TransferItem, TransferSide } from '@xihan-ui/headless'
import type { AttrExpectation, ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { transferAnatomy, transferKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

// Transfer 无对应 APG 模式，列表部分对齐 listbox 规格。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'

/** 条目全集。banana 禁用：导航跳过、勾不动、搬不动，但仍可聚焦、仍是方向键起点。 */
const ITEMS: readonly TransferItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian' },
]

const VALUES = ITEMS.map(i => i.value)

/** 一侧的条目节点：两侧各挂一份全集，不属于本侧的那一份由组件打上 hidden。 */
function itemNodes(): FixtureNode[] {
  return ITEMS.map(spec => ({
    part: 'item',
    attrs: { value: spec.value },
    children: [
      { part: 'item-checkbox', tag: 'span' },
      { part: 'item-text', tag: 'span', text: spec.label },
    ],
  }))
}

function panel(part: 'source-panel' | 'target-panel', title: string): FixtureNode {
  return {
    part,
    children: [
      {
        part: 'panel-header',
        children: [
          { part: 'panel-title', tag: 'span', text: title },
          { part: 'panel-count', tag: 'span' },
          { part: 'select-all-trigger', tag: 'button', text: '全选' },
        ],
      },
      { part: 'search', tag: 'input' },
      { part: 'list', children: itemNodes() },
    ],
  }
}

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    panel('source-panel', '待选'),
    { part: 'to-target-trigger', tag: 'button', text: '→' },
    { part: 'to-source-trigger', tag: 'button', text: '←' },
    panel('target-panel', '已选'),
  ],
}

/** 条目的标签与禁用只由 collection 决定，标记里没有第二份，每个用例都要给全集。 */
const BASE = { collection: ITEMS }

/** 八个条目节点（左四右四）的期望；逐个写全才咬得住另一侧同值节点。 */
function itemsOn(right: readonly string[], checked: readonly string[]): readonly AttrExpectation[] {
  const out: AttrExpectation[] = []
  for (const side of ['source', 'target'] as const) {
    for (const value of VALUES) {
      const belongs = (right.includes(value) ? 'target' : 'source') === side
      const on = belongs && checked.includes(value)
      out.push({
        'data-value': value,
        'data-side': side,
        'aria-selected': on ? 'true' : 'false',
        'data-state': on ? 'checked' : 'unchecked',
        // 不属于本侧的那一份只隐去，不卸载：两个适配器都得产出同一个节点
        'hidden': belongs ? null : '',
      })
    }
  }
  return out
}

/** 每一侧各是一组 roving tabindex，各留一个 Tab 停靠点；共享的 singleTabStop 按 scope 数全文档条目，这里用不了。 */
function sideTabStop(side: TransferSide): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；两侧各是一组，要分开数',
    run: ({ doc }) => {
      const panelEl = doc.querySelector<HTMLElement>(`[data-scope="transfer"][data-part="${side}-panel"]`)
      if (!panelEl)
        throw new Error(`找不到 transfer 的 ${side}-panel 部件`)
      const list = panelEl.querySelector<HTMLElement>('[data-scope="transfer"][data-part="list"]')
      const stops = [...panelEl.querySelectorAll<HTMLElement>('[data-scope="transfer"][data-part="item"]')]
        .filter(el => el.getAttribute('tabindex') === '0')
      const containerStop = list?.getAttribute('tabindex') === '0'
      if (stops.length > 1)
        throw new Error(`transfer ${side} 侧有 ${stops.length} 个 Tab 停靠点，应当只有一个`)
      if (stops.length === 0 && !containerStop)
        throw new Error(`transfer ${side} 侧一个 Tab 停靠点都没有，且列表也没兜底——键盘再也进不来`)
      if (stops.length === 1 && containerStop)
        throw new Error(`transfer ${side} 侧已有锚点条目占着 Tab 位，列表不该再占一个`)
      if (stops.some(el => el.hasAttribute('hidden')))
        throw new Error(`transfer ${side} 侧的 Tab 停靠点落在已隐去的条目上——它不可聚焦，等于没有停靠点`)
    },
  }
}

/** 往某一侧的搜索框里打字。按键事件不改输入框的值（jsdom 不做默认输入行为），只能直接写值再派 input。 */
function typeSearch(index: number, text: string, expect?: StepWithExpect['expect']): StepWithExpect {
  return {
    kind: 'raw',
    why: '搜索走的是 input 事件里输入框的实际值；jsdom 不做默认输入行为，按键事件改不动它',
    run: async ({ doc, flush }) => {
      const el = [...doc.querySelectorAll<HTMLInputElement>('[data-scope="transfer"][data-part="search"]')][index]
      if (!el)
        throw new Error(`找不到第 ${index} 个 transfer search 部件`)
      el.value = text
      el.dispatchEvent(new Event('input', { bubbles: true }))
      await flush()
    },
    expect,
  }
}

/** 往禁用控件直接派发 click（el.click() 在禁用表单控件上不派发事件）；共享的 dispatchClickOnDisabled 指定不了下标。 */
function clickDisabled(part: string, index: number, expect: StepWithExpect['expect']): StepWithExpect {
  return {
    kind: 'raw',
    why: '禁用控件上 el.click() 会被激活行为短路、事件不派发，断言恒成立；必须直接派发才验得到守卫',
    run: ({ doc }) => {
      const el = [...doc.querySelectorAll<HTMLElement>(`[data-scope="transfer"][data-part="${part}"]`)][index]
      if (!el)
        throw new Error(`找不到第 ${index} 个 transfer ${part} 部件`)
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    },
    expect,
  }
}

export const transferSuite: ConformanceSuite = {
  component: 'transfer',
  anatomy: transferAnatomy,
  keyboard: transferKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：两侧各是一个 listbox，全集各挂一份、不属于本侧的带 hidden，禁用条目走 aria-disabled',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...BASE, defaultValue: ['durian'] },
      initial: {
        order: [
          'root',
          'source-panel',
          'panel-header[0]',
          'panel-title[0]',
          'panel-count[0]',
          'select-all-trigger[0]',
          'search[0]',
          'list[0]',
          'item[0]',
          'item-checkbox[0]',
          'item-text[0]',
          'item[1]',
          'item-checkbox[1]',
          'item-text[1]',
          'item[2]',
          'item-checkbox[2]',
          'item-text[2]',
          'item[3]',
          'item-checkbox[3]',
          'item-text[3]',
          'to-target-trigger',
          'to-source-trigger',
          'target-panel',
          'panel-header[1]',
          'panel-title[1]',
          'panel-count[1]',
          'select-all-trigger[1]',
          'search[1]',
          'list[1]',
          'item[4]',
          'item-checkbox[4]',
          'item-text[4]',
          'item[5]',
          'item-checkbox[5]',
          'item-text[5]',
          'item[6]',
          'item-checkbox[6]',
          'item-text[6]',
          'item[7]',
          'item-checkbox[7]',
          'item-text[7]',
        ],
        counts: {
          'root': 1,
          'source-panel': 1,
          'target-panel': 1,
          'panel-header': 2,
          'panel-title': 2,
          'panel-count': 2,
          'select-all-trigger': 2,
          'search': 2,
          'list': 2,
          'item': 8,
          'item-text': 8,
          'item-checkbox': 8,
          'to-target-trigger': 1,
          'to-source-trigger': 1,
        },
        parts: {
          'root': { 'data-disabled': null, 'data-one-way': null, 'dir': null },
          'source-panel': { 'data-side': 'source' },
          'target-panel': { 'data-side': 'target' },
          'panel-title[0]': { id: '@self' },
          'list[0]': {
            'id': '@self',
            'role': 'listbox',
            'aria-labelledby': '@part(panel-title[0])',
            // 显式写出，不靠省略
            'aria-multiselectable': 'true',
            'aria-disabled': 'false',
            'data-side': 'source',
            // 焦点还在列表外：容器兜底进 Tab 序列
            'tabindex': '0',
          },
          'list[1]': {
            'aria-labelledby': '@part(panel-title[1])',
            'aria-multiselectable': 'true',
            'data-side': 'target',
            'tabindex': '0',
          },
          // 左三右一：durian 已在右侧
          'panel-count[0]': { 'data-count': '3', 'data-checked-count': '0' },
          'panel-count[1]': { 'data-count': '1', 'data-checked-count': '0' },
          'item': itemsOn(['durian'], []),
          'item[0]': {
            'role': 'option',
            'aria-disabled': 'false',
            'tabindex': '-1',
            // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
            'disabled': null,
          },
          'item[1]': { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
          // 左侧的 durian 那一份隐去了，它绝不能认领 Tab 位
          'item[3]': { hidden: '', tabindex: '-1' },
          'item[7]': { hidden: null },
          'select-all-trigger[0]': {
            'type': 'button',
            'role': 'checkbox',
            'aria-checked': 'false',
            'aria-controls': '@part(list[0])',
            'data-state': 'unchecked',
            'data-side': 'source',
            'disabled': null,
          },
          'to-target-trigger': {
            'type': 'button',
            'aria-controls': '@part(list[1])',
            // 一个都没勾：没什么可搬，按钮退出 Tab 序列
            'disabled': '',
            'data-disabled': '',
          },
          'to-source-trigger': { 'type': 'button', 'aria-controls': '@part(list[0])', 'disabled': '' },
          // searchable 没开：搜索框常挂但隐去
          'search[0]': {
            'type': 'text',
            'hidden': '',
            'aria-controls': '@part(list[0])',
            'aria-labelledby': '@part(panel-title[0])',
            'disabled': null,
          },
        },
      },
    },
    {
      name: 'roving tabindex：两侧各留一个 Tab 停靠点，焦点进来后该侧列表让位、另一侧不受影响',
      spec: { apg: APG },
      covers: ['transfer.kbd.tab'],
      props: { ...BASE, defaultValue: ['durian'] },
      steps: [
        sideTabStop('source'),
        sideTabStop('target'),
        {
          kind: 'focus',
          part: 'list[0]',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: {
              'list[0]': { tabindex: '-1' },
              'item[0]': { tabindex: '0' },
              // 另一侧仍由容器兜底
              'list[1]': { tabindex: '0' },
            },
          },
        },
        sideTabStop('source'),
        sideTabStop('target'),
      ],
    },
    {
      name: '焦点进入列表落在本侧勾中项上，不是落在首项',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { ...BASE, defaultSelection: ['cherry'] },
      initial: {
        // 焦点还在列表外：锚点条目认领 Tab 位
        parts: { 'item[0]': { tabindex: '-1' }, 'item[2]': { tabindex: '0' } },
      },
      steps: [
        { kind: 'focus', part: 'list[0]', expect: { activeElement: { part: 'item[2]', exact: true } } },
      ],
    },
    {
      name: '方向键：跳过禁用项、尽头回绕，Home/End 到端点，一路不改勾选，也绝不跨到对面那一侧',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['transfer.kbd.next', 'transfer.kbd.prev', 'transfer.kbd.first', 'transfer.kbd.last'],
      props: { ...BASE },
      steps: [
        { kind: 'focus', part: 'list[0]', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // banana 禁用，直接跨过去
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { 'item[2]': { 'tabindex': '0', 'data-highlighted': '' }, 'item[0]': { 'tabindex': '-1', 'data-highlighted': null } },
            events: [],
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[3]', exact: true } } },
        // 回绕回本侧首项，不会落到右栏的 item[4]
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[3]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[3]', exact: true } } },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            // 方向键只搬焦点：走了这么一圈，一个条目都不该被勾中
            parts: { item: itemsOn([], []) },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Space / Enter 切换勾选；禁用条目上按了不认',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['transfer.kbd.toggle'],
      props: { ...BASE },
      steps: [
        { kind: 'focus', part: 'list[0]' },
        { kind: 'key', key: 'Space', expect: { parts: { item: itemsOn([], ['apple']) }, events: [] } },
        { kind: 'key', key: 'Space', expect: { parts: { item: itemsOn([], []) } } },
        // 禁用条目仍可聚焦、仍是方向键起点，但确认键不认它
        { kind: 'focus', part: 'item[1]', expect: { activeElement: { part: 'item[1]', exact: true } } },
        { kind: 'key', key: 'Enter', expect: { parts: { item: itemsOn([], []) } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'Enter', expect: { parts: { item: itemsOn([], ['cherry']) } } },
      ],
    },
    {
      name: 'Shift+方向键扩选：移动焦点并切换落点，往回走即把刚扩进来的摘掉',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['transfer.kbd.extend'],
      props: { ...BASE, defaultSelection: ['apple'] },
      steps: [
        { kind: 'focus', part: 'list[0]', expect: { activeElement: { part: 'item[0]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Shift'],
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { item: itemsOn([], ['apple', 'cherry']) },
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          modifiers: ['Shift'],
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { item: itemsOn([], ['cherry']) },
          },
        },
      ],
    },
    {
      name: 'Ctrl+A 勾中本侧全部可操作条目（禁用项不进），再按一次取消；另一侧纹丝不动',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['transfer.kbd.select-all'],
      props: { ...BASE, defaultValue: ['durian'] },
      steps: [
        { kind: 'focus', part: 'list[0]' },
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Control'],
          expect: {
            parts: {
              'item': itemsOn(['durian'], ['apple', 'cherry']),
              'select-all-trigger[0]': { 'aria-checked': 'true', 'data-state': 'checked' },
              'select-all-trigger[1]': { 'aria-checked': 'false', 'data-state': 'unchecked' },
              'panel-count[0]': { 'data-checked-count': '2' },
            },
          },
        },
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Control'],
          expect: { parts: { 'item': itemsOn(['durian'], []), 'select-all-trigger[0]': { 'aria-checked': 'false' } } },
        },
      ],
    },
    {
      name: '全选格三态：空 → 半选 → 全选，半选输出 aria-checked=mixed',
      spec: { apg: 'https://www.w3.org/TR/wai-aria-1.2/#checkbox' },
      covers: ['transfer.kbd.select-all-trigger'],
      props: { ...BASE },
      steps: [
        nativeActivation('transfer', 'select-all-trigger'),
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { 'select-all-trigger[0]': { 'aria-checked': 'mixed', 'data-state': 'indeterminate' } },
          },
        },
        {
          kind: 'click',
          part: 'select-all-trigger[0]',
          expect: {
            parts: {
              'item': itemsOn([], ['apple', 'cherry', 'durian']),
              'select-all-trigger[0]': { 'aria-checked': 'true', 'data-state': 'checked' },
            },
          },
        },
        {
          kind: 'click',
          part: 'select-all-trigger[0]',
          expect: {
            parts: {
              'item': itemsOn([], []),
              'select-all-trigger[0]': { 'aria-checked': 'false', 'data-state': 'unchecked' },
            },
          },
        },
      ],
    },
    {
      name: '搬运：勾中即解禁按钮，搬完两侧集合互换、勾选清空，焦点落到目的地那一侧的列表上',
      spec: { apg: APG },
      covers: ['transfer.kbd.trigger'],
      props: { ...BASE },
      steps: [
        nativeActivation('transfer', 'to-target-trigger'),
        nativeActivation('transfer', 'to-source-trigger'),
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { 'item': itemsOn([], ['apple']), 'to-target-trigger': { 'disabled': null, 'data-disabled': null } },
            events: [],
          },
        },
        {
          // click 步骤先把焦点放到按钮上，搬完按钮随即禁用，焦点必须另有去处
          kind: 'click',
          part: 'to-target-trigger',
          expect: {
            parts: {
              'item': itemsOn(['apple'], []),
              'to-target-trigger': { disabled: '' },
              'panel-count[0]': { 'data-count': '3', 'data-checked-count': '0' },
              'panel-count[1]': { 'data-count': '1' },
            },
            // 右栏原先是空的，焦点没有条目可落，就停在列表容器上
            activeElement: { part: 'list[1]', exact: true },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
        // 再搬回去：右侧勾中 apple，往左搬
        {
          kind: 'click',
          part: 'item[4]',
          expect: { parts: { 'item': itemsOn(['apple'], ['apple']), 'to-source-trigger': { disabled: null } } },
        },
        {
          kind: 'click',
          part: 'to-source-trigger',
          expect: {
            parts: { item: itemsOn([], []) },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
      ],
    },
    {
      name: '列表内横向方向键搬运：ArrowRight 把本侧勾中的搬到右边，焦点跟到右栏',
      spec: { apg: APG },
      covers: ['transfer.kbd.move'],
      props: { ...BASE },
      steps: [
        { kind: 'focus', part: 'list[0]', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'Space', expect: { parts: { item: itemsOn([], ['apple']) } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: { item: itemsOn(['apple'], []) },
            activeElement: { part: 'list[1]', exact: true },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
        // 焦点已离开左栏，那一侧的锚点也跟着作废，容器重新兜底
        sideTabStop('source'),
        sideTabStop('target'),
      ],
    },
    {
      name: '隐去的那一份点不动：同一个值在对面的节点只是没卸载，不是可交互的条目',
      spec: { apg: APG },
      props: { ...BASE, defaultValue: ['durian'] },
      steps: [
        // item[3] 是左栏那份 durian，此刻带着 hidden
        { kind: 'click', part: 'item[3]', expect: { parts: { item: itemsOn(['durian'], []) }, events: [] } },
        { kind: 'click', part: 'item[7]', expect: { parts: { item: itemsOn(['durian'], ['durian']) } } },
      ],
    },
    {
      name: '禁用条目勾不动：aria-disabled 的条目照样派得出 click，守卫才真的挡得住',
      spec: { apg: APG },
      props: { ...BASE },
      steps: [
        { kind: 'click', part: 'item[1]', expect: { parts: { item: itemsOn([], []) }, events: [] } },
      ],
    },
    {
      name: 'searchable：搜索只筛本侧，被筛掉的条目隐去且不再参与三态、全选与搬运',
      spec: { apg: APG },
      props: { ...BASE, searchable: true },
      initial: { parts: { 'search[0]': { hidden: null }, 'search[1]': { hidden: null } } },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: { parts: { 'item': itemsOn([], ['apple']), 'panel-count[0]': { 'data-checked-count': '1' } } },
        },
        typeSearch(0, 'ch', {
          parts: {
            // 左栏只剩 cherry；apple 的勾还在集合里，但隐去的节点不再报自己勾着
            'item[0]': { 'hidden': '', 'aria-selected': 'false' },
            'item[2]': { hidden: null },
            'panel-count[0]': { 'data-count': '1', 'data-checked-count': '0' },
            'select-all-trigger[0]': { 'aria-checked': 'false', 'data-state': 'unchecked' },
            // 勾着的 apple 被筛掉了：此刻没有看得见的东西可搬
            'to-target-trigger': { disabled: '' },
            // 另一侧不受影响（item[4] 是右栏那份 apple，本来就不属于右侧）
            'item[4]': { hidden: '' },
          },
        }),
        {
          kind: 'click',
          part: 'select-all-trigger[0]',
          expect: {
            parts: {
              // 全选只动看得见的那一个
              'item[2]': { 'aria-selected': 'true', 'data-state': 'checked' },
              'item[0]': { 'hidden': '', 'aria-selected': 'false' },
              'panel-count[0]': { 'data-checked-count': '1' },
              'select-all-trigger[0]': { 'aria-checked': 'true', 'data-state': 'checked' },
              'to-target-trigger': { disabled: null },
            },
          },
        },
        {
          kind: 'click',
          part: 'to-target-trigger',
          expect: {
            parts: {
              // 只搬看得见的 cherry；apple 留在左边（仍被搜索藏着），勾也还在集合里
              'item[6]': { 'hidden': null, 'aria-selected': 'false' },
              'item[2]': { hidden: '' },
              'item[0]': { hidden: '' },
              'panel-count[0]': { 'data-count': '0' },
              'panel-count[1]': { 'data-count': '1' },
            },
            events: [{ type: 'value-change', detail: { value: ['cherry'] } }],
          },
        },
        // 清空搜索：apple 重新显形，它那一路的勾选原封不动地回来了
        typeSearch(0, '', {
          parts: {
            'item[0]': { 'hidden': null, 'aria-selected': 'true', 'data-state': 'checked' },
            'panel-count[0]': { 'data-count': '3', 'data-checked-count': '1' },
            'select-all-trigger[0]': { 'aria-checked': 'mixed', 'data-state': 'indeterminate' },
          },
        }),
      ],
    },
    {
      name: 'oneWay：右侧不接受勾选，往回搬那条路恒禁用，右侧的勾选格也不在场',
      spec: { apg: APG },
      props: { ...BASE, oneWay: true, defaultValue: ['durian'] },
      initial: {
        parts: {
          'root': { 'data-one-way': '' },
          'list[0]': { 'aria-multiselectable': 'true' },
          // 右侧选不了，不报 true
          'list[1]': { 'aria-multiselectable': 'false' },
          'to-source-trigger': { 'disabled': '', 'data-disabled': '' },
          'select-all-trigger[1]': { disabled: '' },
          'item-checkbox[7]': { hidden: '' },
          'item-checkbox[0]': { hidden: null },
        },
      },
      steps: [
        { kind: 'click', part: 'item[7]', expect: { parts: { item: itemsOn(['durian'], []) }, events: [] } },
        clickDisabled('select-all-trigger', 1, { parts: { item: itemsOn(['durian'], []) }, events: [] }),
        clickDisabled('to-source-trigger', 0, { parts: { item: itemsOn(['durian'], []) }, events: [] }),
        // 往右照常
        { kind: 'click', part: 'item[0]', expect: { parts: { item: itemsOn(['durian'], ['apple']) } } },
        {
          kind: 'click',
          part: 'to-target-trigger',
          expect: {
            parts: { item: itemsOn(['durian', 'apple'], []) },
            events: [{ type: 'value-change', detail: { value: ['durian', 'apple'] } }],
          },
        },
      ],
    },
    {
      name: '整体禁用：三类按钮都是原生禁用，条目全转 aria-disabled，键盘与点击都改不了任何集合',
      spec: { apg: APG },
      props: { ...BASE, disabled: true, defaultValue: ['durian'], defaultSelection: ['apple'] },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'list[0]': { 'aria-disabled': 'true', 'data-disabled': '' },
          'item[0]': { 'aria-disabled': 'true', 'disabled': null },
          'item[2]': { 'aria-disabled': 'true' },
          'to-target-trigger': { disabled: '' },
          'to-source-trigger': { disabled: '' },
          'select-all-trigger[0]': { disabled: '' },
          'search[0]': { disabled: '' },
        },
      },
      steps: [
        { kind: 'click', part: 'item[2]', expect: { parts: { item: itemsOn(['durian'], ['apple']) }, events: [] } },
        clickDisabled('to-target-trigger', 0, { parts: { item: itemsOn(['durian'], ['apple']) }, events: [] }),
        clickDisabled('select-all-trigger', 0, { parts: { item: itemsOn(['durian'], ['apple']) }, events: [] }),
      ],
    },
    {
      name: '受控 value：宿主不写回则两侧纹丝不动，回调照发',
      spec: { apg: APG },
      props: { ...BASE, value: ['durian'] },
      initial: { parts: { item: itemsOn(['durian'], []) } },
      steps: [
        { kind: 'click', part: 'item[0]', expect: { parts: { item: itemsOn(['durian'], ['apple']) } } },
        {
          kind: 'click',
          part: 'to-target-trigger',
          expect: {
            // 值没写回：右侧仍然只有 durian，但勾选（非受控）已经清掉了
            parts: { item: itemsOn(['durian'], []) },
            events: [{ type: 'value-change', detail: { value: ['durian', 'apple'] } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: ['durian', 'apple'] },
          expect: { parts: { item: itemsOn(['durian', 'apple'], []) } },
        },
      ],
    },
  ],
}
