import type { AttrExpectation, ConformanceSuite, FixtureNode } from '../conformance/types'
import { tagGroupAnatomy, tagGroupKeyboard } from '@xihan-ui/headless'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'

/**
 * 四枚标签：react 禁用（方向键与连打都跳过它，但它仍可聚焦、仍是导航起点）。
 * 文字用拉丁字母，连打检索按首字母匹配得上；四枚首字母互不相同。
 */
function item(value: string, text: string, disabled = false): FixtureNode {
  const attrs: Record<string, string> = { value }
  if (disabled)
    attrs.disabled = ''
  return {
    part: 'item',
    tag: 'span',
    attrs,
    children: [
      {
        part: 'cell',
        tag: 'span',
        children: [
          { part: 'item-text', tag: 'span', text },
          { part: 'item-delete-trigger', tag: 'button' },
        ],
      },
    ],
  }
}

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'span', text: '技术栈' },
    {
      part: 'list',
      children: [
        item('vue', 'Vue'),
        item('react', 'React', true),
        item('svelte', 'Svelte'),
        item('angular', 'Angular'),
      ],
    },
  ],
}

/** 四枚标签的 aria-selected 期望，逐个写全——只写关心的那个会漏掉「另一枚也被选中了」。 */
function selected(...values: readonly string[]): readonly AttrExpectation[] {
  return ['vue', 'react', 'svelte', 'angular'].map(v => ({
    'aria-selected': values.includes(v) ? 'true' : 'false',
    'data-state': values.includes(v) ? 'checked' : 'unchecked',
  }))
}

export const tagGroupSuite: ConformanceSuite = {
  component: 'tag-group',
  anatomy: tagGroupAnatomy,
  keyboard: tagGroupKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：list 是 grid、标签是 row、格子是 gridcell；不接选中即不出 aria-selected，摘除钮收起且不占 Tab 位',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: [
          'root',
          'label',
          'list',
          'item[0]',
          'cell[0]',
          'item-text[0]',
          'item-delete-trigger[0]',
          'item[1]',
          'cell[1]',
          'item-text[1]',
          'item-delete-trigger[1]',
          'item[2]',
          'cell[2]',
          'item-text[2]',
          'item-delete-trigger[2]',
          'item[3]',
          'cell[3]',
          'item-text[3]',
          'item-delete-trigger[3]',
        ],
        counts: {
          'root': 1,
          'label': 1,
          'list': 1,
          'item': 4,
          'cell': 4,
          'item-text': 4,
          'item-delete-trigger': 4,
        },
        parts: {
          'root': { 'data-orientation': 'horizontal', 'data-disabled': null, 'data-readonly': null },
          'label': { id: '@self' },
          'list': {
            'id': '@self',
            'role': 'grid',
            'aria-labelledby': '@part(label)',
            // 省略与显式 false 不是一回事：前者是「没说」，后者是「明确说了不是多选」
            'aria-multiselectable': 'false',
            'aria-disabled': 'false',
            'aria-readonly': 'false',
            // 焦点还在组外：容器兜底进 Tab 序列
            'tabindex': '0',
          },
          // 摘除钮可聚焦，只有落在 gridcell 下面才是合法嵌套
          'cell[0]': { 'role': 'gridcell', 'data-state': 'unchecked' },
          'item[0]': {
            'role': 'row',
            // selectionMode 缺省是 none，一排纯标记标签报「未选中」是句假话
            'aria-selected': null,
            'aria-disabled': 'false',
            'data-value': 'vue',
            'data-state': 'unchecked',
            'data-selectable': null,
            'data-deletable': null,
            'data-disabled': null,
            'data-highlighted': null,
            'tabindex': '-1',
            // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
            'disabled': null,
          },
          'item[1]': { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null, 'tabindex': '-1' },
          'item[3]': { 'data-value': 'angular', 'tabindex': '-1' },
          // 整组没开放摘除：连按钮一起收起，不留一个按不动的叉
          'item-delete-trigger[0]': {
            'type': 'button',
            'aria-label': 'Delete vue',
            'tabindex': '-1',
            'hidden': '',
            'disabled': '',
            'data-disabled': '',
          },
        },
      },
    },
    {
      // 整组只占一个 Tab 位；无锚点时须由容器兜底
      name: 'roving tabindex：整排标签只有一个 Tab 停靠点，焦点进来后容器让位',
      spec: { apg: APG },
      covers: ['tag-group.kbd.tab'],
      steps: [
        singleTabStop('tag-group', 'item', 'list'),
        {
          kind: 'focus',
          part: 'list',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'list': { tabindex: '-1' }, 'item[0]': { tabindex: '0' } },
          },
        },
        singleTabStop('tag-group', 'item', 'list'),
      ],
    },
    {
      name: '方向键：横向排布走左右键，跳过禁用项、尽头回绕，Home/End 到端点，一路不改选中值',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'multiple' },
      covers: ['tag-group.kbd.next', 'tag-group.kbd.prev', 'tag-group.kbd.first', 'tag-group.kbd.last'],
      steps: [
        { kind: 'focus', part: 'list', expect: { activeElement: { part: 'item[0]', exact: true } } },
        // react 禁用，直接跨过去
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { 'item[2]': { 'tabindex': '0', 'data-highlighted': '' }, 'item[0]': { 'tabindex': '-1', 'data-highlighted': null } },
            events: [],
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[3]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'item[3]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'item[3]', exact: true } } },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            // 方向键只搬焦点：走了这么一圈，一枚标签都不该被选中
            parts: { item: selected() },
            events: [],
          },
        },
      ],
    },
    {
      name: '连打检索把焦点移到首字母匹配的标签，不改选中值',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'multiple' },
      covers: ['tag-group.kbd.typeahead'],
      steps: [
        { kind: 'focus', part: 'list', expect: { activeElement: { part: 'item[0]', exact: true } } },
        {
          kind: 'key',
          key: 's',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { item: selected() },
            events: [],
          },
        },
      ],
    },
    {
      name: '单选：Enter / Space 选中焦点标签并替换原有选中',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'single' },
      covers: ['tag-group.kbd.select'],
      initial: { parts: { 'list': { 'aria-multiselectable': 'false' }, 'item[0]': { 'data-selectable': '' } } },
      steps: [
        { kind: 'focus', part: 'list' },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: selected('vue') },
            events: [{ type: 'value-change', detail: { value: ['vue'] } }],
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { events: [] } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { item: selected('svelte') },
            events: [{ type: 'value-change', detail: { value: ['svelte'] } }],
          },
        },
      ],
    },
    {
      name: '复选：Enter 切换而不是替换，grid 报 aria-multiselectable',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'multiple' },
      covers: ['tag-group.kbd.toggle'],
      initial: { parts: { list: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'focus', part: 'list' },
        { kind: 'key', key: 'Enter', expect: { parts: { item: selected('vue') } } },
        { kind: 'key', key: 'ArrowRight' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { item: selected('vue', 'svelte') },
            events: [{ type: 'value-change', detail: { value: ['vue', 'svelte'] } }],
          },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { item: selected('vue') },
            events: [{ type: 'value-change', detail: { value: ['vue'] } }],
          },
        },
      ],
    },
    {
      name: 'Ctrl+A 全选可选标签（禁用项不进集合），再按一次取消',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { selectionMode: 'multiple' },
      covers: ['tag-group.kbd.select-all'],
      steps: [
        { kind: 'focus', part: 'list' },
        {
          kind: 'key',
          key: 'a',
          modifiers: ['Control'],
          expect: {
            parts: { item: selected('vue', 'svelte', 'angular') },
            events: [{ type: 'value-change', detail: { value: ['vue', 'svelte', 'angular'] } }],
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
      name: 'Delete 摘掉焦点标签，焦点交给前一枚；只报意图，条目的去留归宿主',
      spec: { apg: APG },
      props: { deletable: true },
      covers: ['tag-group.kbd.delete'],
      initial: {
        parts: {
          'item[0]': { 'data-deletable': '' },
          'item-delete-trigger[0]': { hidden: null, disabled: null },
        },
      },
      steps: [
        { kind: 'focus', part: 'list', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowRight' },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[3]', exact: true } } },
        {
          kind: 'key',
          key: 'Delete',
          expect: {
            // 落点取前一枚：摘完之后它在文档里的位置原样不动
            activeElement: { part: 'item[2]', exact: true },
            parts: { 'item[2]': { 'data-highlighted': '' } },
            events: [{ type: 'item-delete', detail: { value: 'angular' } }],
          },
        },
      ],
    },
    {
      name: 'Backspace 摘掉首枚：前面没有标签了，焦点交给后一枚',
      spec: { apg: APG },
      props: { deletable: true },
      steps: [
        { kind: 'focus', part: 'list', expect: { activeElement: { part: 'item[0]', exact: true } } },
        {
          kind: 'key',
          key: 'Backspace',
          expect: {
            activeElement: { part: 'item[1]', exact: true },
            events: [{ type: 'item-delete', detail: { value: 'vue' } }],
          },
        },
      ],
    },
    {
      name: '点摘除钮：报摘除意图，焦点同样交给前一枚标签，不会掉回页面开头',
      spec: { apg: APG },
      props: { deletable: true },
      steps: [
        {
          kind: 'click',
          part: 'item-delete-trigger[3]',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            events: [{ type: 'item-delete', detail: { value: 'angular' } }],
          },
        },
      ],
    },
    {
      name: '禁用的标签摘不掉：那颗叉留在原地但按不动，Delete 也不认',
      spec: { apg: APG },
      props: { deletable: true },
      initial: {
        parts: {
          'item-delete-trigger[1]': { 'disabled': '', 'data-disabled': '', 'hidden': null },
        },
      },
      steps: [
        // 方向键与连打都跳过禁用项，只能直接把焦点放上去——禁用标签仍可聚焦、仍是导航起点
        { kind: 'focus', part: 'item[1]', expect: { parts: { 'item[1]': { 'data-highlighted': '' } } } },
        { kind: 'key', key: 'Delete', expect: { events: [] } },
      ],
    },
    {
      name: '只读：可聚焦、可导航，但选不动也摘不掉',
      spec: { adr: 'controlled-uncontrolled' },
      props: { selectionMode: 'multiple', deletable: true, readOnly: true },
      initial: {
        parts: {
          root: { 'data-readonly': '' },
          list: { 'aria-readonly': 'true' },
        },
      },
      steps: [
        { kind: 'focus', part: 'list', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'Enter', expect: { parts: { item: selected() }, events: [] } },
        { kind: 'key', key: 'Delete', expect: { events: [] } },
      ],
    },
    {
      name: '整组禁用：标签全转 aria-disabled，键盘一律不响应',
      spec: { apg: APG },
      props: { selectionMode: 'multiple', deletable: true, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'list': { 'aria-disabled': 'true', 'data-disabled': '' },
          'item[0]': { 'aria-disabled': 'true', 'data-disabled': '' },
          'item-delete-trigger[0]': { disabled: '' },
        },
      },
      steps: [
        { kind: 'focus', part: 'item[0]' },
        { kind: 'key', key: 'Enter', expect: { parts: { item: selected() }, events: [] } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'item[0]', exact: true }, events: [] } },
      ],
    },
    {
      name: '受控 value：点选只发 value-change 不自改 DOM，父写回后才变',
      spec: { adr: 'controlled-uncontrolled' },
      props: { selectionMode: 'multiple', value: [] },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { item: selected() },
            events: [{ type: 'value-change', detail: { value: ['vue'] } }],
          },
        },
        { kind: 'setProps', props: { value: ['vue'] } },
        {
          kind: 'settle',
          until: { attr: { part: 'item[0]', name: 'data-state', value: 'checked' } },
          expect: { parts: { item: selected('vue') } },
        },
      ],
    },
  ],
}
