import type { AttrExpectation, ConformanceSuite, FixtureNode } from '../conformance/types'
import { gridListAnatomy, gridListKeyboard } from '@xihan-ui/headless'
import { nativeActivation, singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/'

/**
 * 行的禁用用 `disabled` 属性声明（Vue 侧它是组件 prop、不落 DOM）；
 * WC 侧接线时把它摘掉、改由 aria-disabled 与 data-disabled 表达——row 不是表单控件，原生 disabled 在它上面不是有效属性。
 */
function row(value: string, label: string, disabled = false, action = false): FixtureNode {
  return {
    part: 'row',
    attrs: { value, ...(disabled ? { disabled: '' } : {}) },
    children: [
      { part: 'row-selection-indicator', tag: 'span' },
      {
        part: 'row-content',
        children: [
          { part: 'row-text', tag: 'span', text: label },
          { part: 'row-description', tag: 'span', text: `${label}说明` },
        ],
      },
      {
        part: 'row-actions',
        children: action ? [{ part: 'row-action', tag: 'button', text: '编辑' }] : [],
      },
    ],
  }
}

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'span', text: '项目' },
    row('a', 'Alpha', false, true),
    row('b', 'Beta'),
    row('c', 'Charlie', true),
    { part: 'empty', text: '暂无项目' },
    { part: 'loading', text: '加载中' },
  ],
}

function selected(...values: string[]): readonly AttrExpectation[] {
  return ['a', 'b', 'c'].map(value => ({
    'aria-selected': values.includes(value) ? 'true' : 'false',
    'data-state': values.includes(value) ? 'checked' : 'unchecked',
  }))
}

export const gridListSuite: ConformanceSuite = {
  component: 'grid-list',
  anatomy: gridListAnatomy,
  keyboard: gridListKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：根是 grid，行是可选择 row，主要内容与操作区是 gridcell',
      spec: { apg: APG },
      initial: {
        counts: { 'root': 1, 'label': 1, 'row': 3, 'row-content': 3, 'row-actions': 3, 'row-action': 1 },
        parts: {
          'root': {
            'role': 'grid',
            'aria-labelledby': '@part(label)',
            'aria-disabled': 'false',
            'aria-readonly': 'false',
            'data-variant': 'outline',
            'tabindex': '0',
          },
          'row[0]': {
            'role': 'row',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            'data-value': 'a',
            'tabindex': '-1',
          },
          'row[2]': { 'aria-disabled': 'true', 'data-disabled': '', 'disabled': null },
          'row-content[0]': { role: 'gridcell' },
          'row-actions[0]': { role: 'gridcell' },
          'row-action[0]': { 'type': 'button', 'data-xh-action-control': '' },
          'row-selection-indicator[0]': { 'aria-hidden': 'true', 'data-state': 'unchecked' },
        },
      },
    },
    {
      name: 'roving 与纵向导航：进入首行、跳过禁用行、Home/End 到端点',
      spec: { apg: `${APG}#keyboardinteractionforlayoutgrids` },
      covers: ['grid-list.kbd.tab', 'grid-list.kbd.next', 'grid-list.kbd.prev', 'grid-list.kbd.first', 'grid-list.kbd.last'],
      steps: [
        singleTabStop('grid-list', 'row', 'root'),
        { kind: 'focus', part: 'root', expect: { activeElement: { part: 'row[0]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'row[0]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'row[1]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'row[0]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'row[1]', exact: true } } },
      ],
    },
    {
      name: '单选与主操作：Space 选择，Enter 只派发行主操作',
      spec: { apg: `${APG}#keyboardinteractionforlayoutgrids` },
      covers: ['grid-list.kbd.select', 'grid-list.kbd.action'],
      steps: [
        { kind: 'focus', part: 'root' },
        {
          kind: 'key',
          key: ' ',
          expect: { parts: { row: selected('a') }, events: [{ type: 'value-change', detail: { value: ['a'] } }] },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: { parts: { row: selected('a') }, events: [{ type: 'action', detail: { value: 'a' } }] },
        },
      ],
    },
    {
      name: '多选：Space 逐行切换，Ctrl+A 选中全部可用行',
      spec: { apg: `${APG}#keyboardinteractionforlayoutgrids` },
      covers: ['grid-list.kbd.select-all'],
      props: { selectionMode: 'multiple' },
      steps: [
        { kind: 'focus', part: 'root' },
        { kind: 'key', key: ' ', expect: { parts: { row: selected('a') } } },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'key', key: ' ', expect: { parts: { row: selected('a', 'b') } } },
        { kind: 'key', key: 'a', modifiers: ['Control'], expect: { parts: { row: selected() } } },
      ],
    },
    {
      name: '连打检索按行标题移动焦点',
      spec: { apg: `${APG}#keyboardinteractionforlayoutgrids` },
      covers: ['grid-list.kbd.typeahead'],
      steps: [
        { kind: 'focus', part: 'root' },
        { kind: 'key', key: 'b', expect: { activeElement: { part: 'row[1]', exact: true }, events: [] } },
      ],
    },
    {
      name: '行内按钮保留原生激活，不改变行选择',
      spec: { apg: `${APG}#keyboardinteractionforlayoutgrids` },
      covers: ['grid-list.kbd.inline-action'],
      steps: [
        nativeActivation('grid-list', 'row-action'),
        { kind: 'focus', part: 'row-action' },
        { kind: 'key', key: 'Enter', expect: { parts: { row: selected() }, events: [] } },
        { kind: 'key', key: 'Space', expect: { parts: { row: selected() }, events: [] } },
      ],
    },
  ],
}
