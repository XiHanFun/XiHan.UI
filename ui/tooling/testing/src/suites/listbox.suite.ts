import type { AttrExpectation, ConformanceSuite, FixtureNode } from '../conformance/types'
import { listboxAnatomy, listboxKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'

/**
 * 四个条目分两组：banana 禁用（方向键与连打都跳过它，但它仍可聚焦、仍是导航起点），
 * durian 落在第二组里——分组是集合查询最容易漏掉的一层，条目与 content 之间隔着 item-group，
 * 归属判据写歪就会一个条目也查不到。
 * 条目文本用拉丁字母，连打检索按首字母匹配得上。
 */
function item(value: string, text: string, disabled = false): FixtureNode {
  const attrs: Record<string, string> = { value }
  if (disabled)
    attrs.disabled = ''
  return {
    part: 'item',
    attrs,
    children: [
      { part: 'item-text', tag: 'span', text },
      { part: 'item-indicator', tag: 'span' },
    ],
  }
}

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'span', text: '水果' },
    {
      part: 'content',
      children: [
        {
          part: 'item-group',
          attrs: { value: 'common' },
          children: [
            { part: 'item-group-label', tag: 'span', text: '常见' },
            item('apple', 'Apple'),
            item('banana', 'Banana', true),
            item('cherry', 'Cherry'),
          ],
        },
        {
          part: 'item-group',
          attrs: { value: 'rare' },
          children: [
            { part: 'item-group-label', tag: 'span', text: '少见' },
            item('durian', 'Durian'),
          ],
        },
      ],
    },
  ],
}

/** 四个条目的 aria-selected 期望，逐个写全——只写关心的那个会漏掉"另一个也被选中了"。 */
function selected(...values: readonly string[]): readonly AttrExpectation[] {
  return ['apple', 'banana', 'cherry', 'durian'].map(v => ({
    'aria-selected': values.includes(v) ? 'true' : 'false',
    'data-state': values.includes(v) ? 'checked' : 'unchecked',
  }))
}

export const listboxSuite: ConformanceSuite = {
  component: 'listbox',
  anatomy: listboxAnatomy,
  keyboard: listboxKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：content 是 listbox，条目 role=option 且选中/禁用两态都显式给出，分组各自认领标题',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: [
          'root',
          'label',
          'content',
          'item-group[0]',
          'item-group-label[0]',
          'item[0]',
          'item-text[0]',
          'item-indicator[0]',
          'item[1]',
          'item-text[1]',
          'item-indicator[1]',
          'item[2]',
          'item-text[2]',
          'item-indicator[2]',
          'item-group[1]',
          'item-group-label[1]',
          'item[3]',
          'item-text[3]',
          'item-indicator[3]',
        ],
        counts: {
          'root': 1,
          'label': 1,
          'content': 1,
          'item-group': 2,
          'item-group-label': 2,
          'item': 4,
          'item-text': 4,
          'item-indicator': 4,
        },
        parts: {
          'root': { 'data-orientation': 'vertical', 'data-disabled': null },
          'label': { id: '@self' },
          'content': {
            'id': '@self',
            'role': 'listbox',
            'aria-labelledby': '@part(label)',
            // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了不是多选"
            'aria-multiselectable': 'false',
            'aria-orientation': 'vertical',
            'aria-disabled': 'false',
            'data-orientation': 'vertical',
            // 焦点还在列表外：容器兜底进 Tab 序列
            'tabindex': '0',
          },
          'item[0]': {
            'role': 'option',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            'data-value': 'apple',
            'data-state': 'unchecked',
            'data-disabled': null,
            'data-highlighted': null,
            'tabindex': '-1',
            // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
            'disabled': null,
          },
          'item[1]': { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null, 'tabindex': '-1' },
          'item[3]': { 'data-value': 'durian', 'tabindex': '-1' },
          'item-group[0]': { 'role': 'group', 'aria-labelledby': '@part(item-group-label[0])' },
          'item-group[1]': { 'role': 'group', 'aria-labelledby': '@part(item-group-label[1])' },
          'item-group-label[0]': { id: '@self' },
          'item-indicator[0]': { 'aria-hidden': 'true', 'data-state': 'unchecked' },
        },
      },
    },
    {
      // 整组只占一个 Tab 位；无锚点时须由容器兜底
      name: 'roving tabindex：整个列表只有一个 Tab 停靠点，焦点进来后容器让位',
      spec: { apg: APG },
      covers: ['listbox.kbd.tab'],
      steps: [
        singleTabStop('listbox', 'item', 'content'),
        {
          kind: 'focus',
          part: 'content',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'content': { tabindex: '-1' }, 'item[0]': { tabindex: '0' } },
          },
        },
        singleTabStop('listbox', 'item', 'content'),
      ],
    },
    {
      name: '焦点进入列表落在选中项上，不是落在首项',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: 'cherry' },
      initial: {
        // 焦点还在列表外：锚点条目认领 Tab 位
        parts: { 'item[2]': { tabindex: '0' }, 'item[0]': { tabindex: '-1' } },
      },
      steps: [
        { kind: 'focus', part: 'content', expect: { activeElement: { part: 'item[2]', exact: true } } },
      ],
    },
    {
      name: '选中项禁用时焦点退回首个可停留条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: 'banana' },
      steps: [
        { kind: 'focus', part: 'content', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
    {
      name: '方向键：跳过禁用项、跨分组、尽头回绕，Home/End 到端点，且一路不改选中值',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['listbox.kbd.next', 'listbox.kbd.prev', 'listbox.kbd.first', 'listbox.kbd.last'],
      steps: [
        { kind: 'focus', part: 'content', expect: { activeElement: { part: 'item[0]', exact: true } } },
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
        // 下一个条目在另一个分组里
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[3]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[3]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[3]', exact: true } } },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            // 方向键只搬焦点：走了这么一圈，一个条目都不该被选中
            parts: { item: selected() },
            events: [],
          },
        },
      ],
    },
    {
      name: '单选：Enter / Space 选中焦点条目并替换原有选中',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['listbox.kbd.select'],
      steps: [
        { kind: 'focus', part: 'content' },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: selected('apple') },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { events: [] } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { item: selected('cherry') },
            events: [{ type: 'value-change', detail: { value: ['cherry'] } }],
          },
        },
      ],
    },
    {
      name: '复选：Space 切换而不是替换，content 报 aria-multiselectable',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['listbox.kbd.toggle'],
      props: { selectionMode: 'multiple' },
      initial: { parts: { content: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'focus', part: 'content' },
        { kind: 'key', key: 'Space', expect: { parts: { item: selected('apple') } } },
        { kind: 'key', key: 'ArrowDown' },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: selected('apple', 'cherry') },
            events: [{ type: 'value-change', detail: { value: ['apple', 'cherry'] } }],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: selected('apple') },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
      ],
    },
    {
      name: 'Shift+方向键扩选：焦点移动并切换落点，往回走即把刚扩进来的摘掉',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['listbox.kbd.extend'],
      props: { selectionMode: 'multiple', defaultValue: 'apple' },
      steps: [
        { kind: 'focus', part: 'content', expect: { activeElement: { part: 'item[0]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Shift'],
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { item: selected('apple', 'cherry') },
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          modifiers: ['Shift'],
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { item: selected('cherry') },
          },
        },
      ],
    },
    {
      name: 'Ctrl+A 全选可选条目（禁用项不进集合），再按一次取消',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['listbox.kbd.select-all'],
      props: { selectionMode: 'multiple' },
      steps: [
        { kind: 'focus', part: 'content' },
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Control'],
          expect: {
            parts: { item: selected('apple', 'cherry', 'durian') },
            events: [{ type: 'value-change', detail: { value: ['apple', 'cherry', 'durian'] } }],
          },
        },
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Control'],
          expect: {
            parts: { item: selected() },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
      ],
    },
    {
      name: '连打检索：按首字母搬焦点，跳过禁用条目，且不改选中值',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['listbox.kbd.typeahead'],
      steps: [
        { kind: 'focus', part: 'content', expect: { activeElement: { part: 'item[0]', exact: true } } },
        {
          kind: 'type',
          text: 'c',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { item: selected() },
            events: [],
          },
        },
      ],
    },
    {
      name: '连打检索匹配不到禁用条目：敲 b 焦点原地不动',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'focus', part: 'content' },
        // banana 以 b 开头，但禁用条目不进检索结果
        { kind: 'type', text: 'b', expect: { activeElement: { part: 'item[0]', exact: true }, events: [] } },
      ],
    },
    {
      // 一律用 Enter 而不是 Space：先敲过字母时空格会被连打缓冲当成查询串里的字符
      name: '禁用条目仍可聚焦、仍是方向键起点，但确认键不认它',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'focus', part: 'item[1]', expect: { activeElement: { part: 'item[1]', exact: true } } },
        { kind: 'key', key: 'Enter', expect: { parts: { item: selected() }, events: [] } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'Enter', expect: { parts: { item: selected('cherry') } } },
      ],
    },
    {
      name: '点击：单选替换、禁用条目点不动',
      spec: { apg: APG },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { item: selected('apple') },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
        // 条目用 aria-disabled 表达禁用，click 不被短路，事件派得出去才碰得到 connect 的守卫
        { kind: 'click', part: 'item[1]', expect: { parts: { item: selected('apple') }, events: [] } },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: { item: selected('cherry') },
            events: [{ type: 'value-change', detail: { value: ['cherry'] } }],
          },
        },
      ],
    },
    {
      name: 'extended：裸点替换、Shift 点选区间、Ctrl 点选加选',
      spec: { apg: APG },
      props: { selectionMode: 'extended' },
      initial: { parts: { content: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'click', part: 'item[0]', expect: { parts: { item: selected('apple') } } },
        // 区间起点是上一次非区间选中（apple）；段内的禁用条目不进选中集合
        {
          kind: 'click',
          part: 'item[3]',
          modifiers: ['Shift'],
          expect: { parts: { item: selected('apple', 'cherry', 'durian') } },
        },
        // 往回点即收窄：区间是替换不是并集
        {
          kind: 'click',
          part: 'item[2]',
          modifiers: ['Shift'],
          expect: { parts: { item: selected('apple', 'cherry') } },
        },
        {
          kind: 'click',
          part: 'item[3]',
          modifiers: ['Control'],
          expect: { parts: { item: selected('apple', 'cherry', 'durian') } },
        },
      ],
    },
    {
      name: '整列禁用：条目全转 aria-disabled，键盘与点击都改不了选中值，焦点也落不进条目',
      spec: { apg: APG },
      props: { defaultValue: 'apple', disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'content': { 'aria-disabled': 'true', 'data-disabled': '' },
          'item[0]': { 'aria-disabled': 'true', 'disabled': null },
          'item[2]': { 'aria-disabled': 'true', 'disabled': null },
        },
      },
      steps: [
        // 一个可停留条目都没有：焦点留在容器上
        { kind: 'focus', part: 'content', expect: { activeElement: { part: 'content', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'content', exact: true }, events: [] } },
        { kind: 'click', part: 'item[2]', expect: { parts: { item: selected('apple') }, events: [] } },
      ],
    },
    {
      name: '受控 value：宿主不写回则选中纹丝不动，回调照发',
      spec: { apg: APG },
      props: { value: 'apple' },
      initial: { parts: { item: selected('apple') } },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: { item: selected('apple') },
            events: [{ type: 'value-change', detail: { value: ['cherry'] } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: 'cherry' },
          expect: { parts: { item: selected('cherry') } },
        },
      ],
    },
    {
      name: 'orientation=horizontal：轴外的上下键不归导航管；dir=rtl 时左右键语义互换',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { orientation: 'horizontal', dir: 'rtl' },
      initial: {
        parts: {
          root: { 'data-orientation': 'horizontal' },
          content: { 'aria-orientation': 'horizontal', 'data-orientation': 'horizontal' },
        },
      },
      steps: [
        { kind: 'focus', part: 'content', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // 横向列表里的上下键要放行给页面滚动与读屏，焦点不动
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // rtl 下 ArrowLeft 才是"下一个"
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
      ],
    },
  ],
}
