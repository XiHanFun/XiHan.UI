// 条件树编辑器的三端一致性套件：作者只写 root，三端都照 filterBuilderStructure 按值铺出组、条件行与组尾。
// 行里的下拉、输入框、数字框、分段切换与开关是库内组件的实例，它们自己的部件不进本套件的快照，
// 由 raw 步骤按 scope 查到后断言名字与状态。

import type { ConformanceSuite, FixtureNode, RawStepContext, StepWithExpect } from '../conformance/types'
import { filterBuilderAnatomy, filterBuilderKeyboard } from '@xihan-ui/headless'
import { documentTabbables } from '../conformance/tab-sequence'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/'

const ROOT: FixtureNode = { part: 'root', defaultStructure: true }

const FIELDS = [
  { name: 'region', type: 'string', label: 'Region' },
  { name: 'amount', type: 'number', label: 'Amount' },
]

const TREE = {
  logic: 'and',
  conditions: [
    { field: 'region', operator: 'eq', value: 'East' },
    { logic: 'or', conditions: [{ field: 'amount', operator: 'gt', value: 10 }] },
  ],
}

const FLAT = {
  logic: 'and',
  conditions: [
    { field: 'region', operator: 'eq', value: 'East' },
    { field: 'amount', operator: 'gt', value: 10 },
  ],
}

/** 第 n 个条件行（0 起）里某个内嵌组件的部件。 */
function inner(doc: Document, row: number, scope: string, part: string): HTMLElement {
  const condition = doc.querySelectorAll<HTMLElement>('[data-scope="filter-builder"][data-part="condition"]')[row]
  if (!condition)
    throw new Error(`找不到第 ${row + 1} 个条件`)
  const el = condition.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)
  if (!el)
    throw new Error(`第 ${row + 1} 个条件里没有 ${scope} 的 ${part}`)
  return el
}

function raw(why: string, run: (ctx: RawStepContext) => void | Promise<void>, expect?: StepWithExpect['expect']): StepWithExpect {
  return { kind: 'raw', why, run, ...(expect ? { expect } : null) }
}

function expectEqual(actual: unknown, expected: unknown, what: string): void {
  if (actual !== expected)
    throw new Error(`${what}：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

export const filterBuilderSuite: ConformanceSuite = {
  component: 'filter-builder',
  anatomy: filterBuilderAnatomy,
  keyboard: filterBuilderKeyboard,
  fixture: ROOT,
  cases: [
    {
      name: '作者只写 root、没有条件：根是 group，根组里是逻辑切换与组尾的两颗加钮，空态出现',
      spec: { apg: `${APG}#group` },
      fixture: (): FixtureNode => ROOT,
      props: { fields: FIELDS },
      initial: {
        order: ['root', 'group', 'group-header', 'logic', 'group-items', 'group-footer', 'add-condition-trigger', 'add-group-trigger', 'empty', 'live-region'],
        counts: { 'label': 0, 'group': 1, 'group-delete-trigger': 0, 'condition': 0, 'empty': 1 },
        parts: {
          'root': { 'role': 'group', 'data-empty': '', 'aria-labelledby': null, 'aria-invalid': null },
          'group': { 'role': 'group', 'aria-label': 'Match all of the following', 'data-depth': '0', 'data-logic': 'and' },
          'add-condition-trigger': { type: 'button', disabled: null },
          'empty': { hidden: null },
          'live-region': { 'role': 'status', 'aria-live': 'polite' },
        },
      },
      steps: [
        raw('逻辑切换是 toggle-group 组件的实例，名字经组合节点的 ariaLabel 传进去', ({ doc }) => {
          const logic = doc.querySelector<HTMLElement>('[data-scope="filter-builder"][data-part="logic"] [data-scope="toggle-group"][data-part="root"]')
          if (!logic)
            throw new Error('逻辑切换里没有 toggle-group 的 root')
          expectEqual(logic.getAttribute('aria-label'), 'Match', '逻辑切换的名字')
        }),
      ],
    },
    {
      name: '有值：条件与子组按树铺开，行与子组都是 group、名字带序号与逻辑；行内控件以「条件 n 的…」为名',
      spec: { apg: `${APG}#group` },
      props: { fields: FIELDS, defaultValue: TREE },
      initial: {
        counts: { 'group': 2, 'group-delete-trigger': 1, 'condition': 2, 'condition-delete-trigger': 2, 'empty': 0 },
        parts: {
          'root': { 'data-empty': null },
          'group': [{ 'data-depth': '0' }, { 'data-depth': '1', 'aria-label': 'Match any of the following', 'data-logic': 'or' }],
          'condition': [{ 'role': 'group', 'aria-label': 'Condition 1' }, { 'role': 'group', 'aria-label': 'Condition 2' }],
          'condition-delete-trigger': [{ 'aria-label': 'Remove condition 1' }, { 'aria-label': 'Remove condition 2' }],
          'group-delete-trigger': { 'aria-label': 'Remove group' },
          'condition-operand': [{ 'data-shape': 'single' }, { 'data-shape': 'single' }],
        },
      },
      steps: [
        raw('字段、运算符与值的控件是 select、text-field、number-field 的实例，名字落在它们自己的部件上', ({ doc }) => {
          expectEqual(inner(doc, 0, 'select', 'trigger').getAttribute('aria-label'), 'Field of condition 1', '第一行字段下拉的名字')
          const operator = doc.querySelectorAll<HTMLElement>('[data-scope="filter-builder"][data-part="condition-operator"]')[1]!
          expectEqual(operator.querySelector('[data-scope="select"][data-part="trigger"]')?.getAttribute('aria-label'), 'Operator of condition 2', '第二行运算符下拉的名字')
          expectEqual(inner(doc, 0, 'text-field', 'input').getAttribute('aria-label'), 'Value of condition 1', '第一行值输入框的名字')
          expectEqual((inner(doc, 1, 'number-field', 'input') as HTMLInputElement).value, '10', '第二行数字框的值')
        }),
      ],
    },
    {
      name: '点「加条件」：派发 value-change，新条件取第一个字段与它的第一个运算符，空态收起',
      spec: { adr: 'controlled-uncontrolled' },
      props: { fields: FIELDS },
      steps: [
        {
          kind: 'click',
          part: 'add-condition-trigger',
          expect: {
            counts: { condition: 1, empty: 0 },
            parts: { root: { 'data-empty': null } },
            events: [{ type: 'value-change', detail: { value: { logic: 'and', conditions: [{ field: 'region', operator: 'eq' }] } } }],
          },
        },
      ],
    },
    {
      name: '行里 Ctrl+Delete 删除这一行：派发少了这一行的树',
      spec: { apg: `${APG}#group` },
      covers: ['filter-builder.kbd.remove'],
      props: { fields: FIELDS, defaultValue: FLAT },
      steps: [
        { kind: 'focus', part: 'condition-delete-trigger[0]' },
        {
          kind: 'key',
          key: 'Delete',
          modifiers: ['Control'],
          expect: {
            counts: { condition: 1 },
            events: [{ type: 'value-change', detail: { value: { logic: 'and', conditions: [{ field: 'amount', operator: 'gt', value: 10 }] } } }],
          },
        },
      ],
    },
    {
      name: '行里 Alt+Shift+ArrowDown 在同组里把这一行往后挪一位',
      spec: { apg: `${APG}#group` },
      covers: ['filter-builder.kbd.move'],
      props: { fields: FIELDS, defaultValue: FLAT },
      steps: [
        { kind: 'focus', part: 'condition-delete-trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Alt', 'Shift'],
          expect: {
            events: [{ type: 'value-change', detail: { value: { logic: 'and', conditions: [{ field: 'amount', operator: 'gt', value: 10 }, { field: 'region', operator: 'eq', value: 'East' }] } } }],
          },
        },
      ],
    },
    {
      name: '焦点在数字框上：ArrowUp 交给数字框步进，值加一并派发 value-change；Tab 序只经过行里的控件与组尾的加钮',
      spec: { apg: `${APG}spinbutton/` },
      covers: ['filter-builder.kbd.controls', 'filter-builder.kbd.tab'],
      props: { fields: FIELDS, defaultValue: FLAT },
      steps: [
        raw('数字框是 number-field 组件的实例，焦点要落进它的输入框', ({ doc }) => {
          inner(doc, 1, 'number-field', 'input').focus()
        }),
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            events: [{ type: 'value-change', detail: { value: { logic: 'and', conditions: [{ field: 'region', operator: 'eq', value: 'East' }, { field: 'amount', operator: 'gt', value: 11 }] } } }],
          },
        },
        raw('Tab 停靠点都在条件行或组尾里，播报与空态不可聚焦', ({ doc }) => {
          const root = doc.querySelector<HTMLElement>('[data-scope="filter-builder"][data-part="root"]')!
          const stops = documentTabbables(doc).filter(el => root.contains(el))
          if (stops.length === 0)
            throw new Error('根里一个 Tab 停靠点都没有')
          for (const el of stops) {
            if (!el.closest('[data-scope="filter-builder"]:is([data-part="condition"], [data-part="group-header"], [data-part="group-footer"])'))
              throw new Error(`Tab 停靠点落在条件行与组头组尾之外：<${el.tagName.toLowerCase()} data-part="${el.dataset.part}">`)
          }
        }),
      ],
    },
    {
      name: '禁用：根标 data-disabled，加删钮与里面的控件一并禁用',
      spec: { adr: 'controlled-uncontrolled' },
      props: { fields: FIELDS, defaultValue: FLAT, disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'add-condition-trigger': { 'disabled': '', 'data-disabled': '' },
          'condition-delete-trigger': [{ 'disabled': '', 'data-disabled': '' }, { 'disabled': '', 'data-disabled': '' }],
        },
      },
      steps: [
        raw('禁用落在内嵌组件自己的根上', ({ doc }) => {
          for (const [row, scope] of [[0, 'select'], [0, 'text-field'], [1, 'number-field']] as const) {
            if (!inner(doc, row, scope, 'root').hasAttribute('data-disabled'))
              throw new Error(`第 ${row + 1} 行的 ${scope} 没有禁用`)
          }
        }),
      ],
    },
    {
      name: '不完整的条件：行标 aria-invalid，行内说明出现并进行的描述链，根标无效',
      spec: { adr: 'controlled-uncontrolled' },
      props: { fields: FIELDS, defaultValue: { logic: 'and', conditions: [{ field: 'region', operator: 'eq' }] } },
      initial: {
        counts: { 'condition-error': 1 },
        parts: {
          root: { 'aria-invalid': 'true', 'data-invalid': '' },
          condition: { 'aria-invalid': 'true', 'data-invalid': '', 'aria-describedby': '@part(condition-error)' },
        },
      },
    },
    {
      name: '受控 value：点「加条件」只派发 value-change；宿主写回后才铺出新行',
      spec: { adr: 'controlled-uncontrolled' },
      props: { fields: FIELDS, value: { logic: 'and', conditions: [] } },
      steps: [
        {
          kind: 'click',
          part: 'add-condition-trigger',
          expect: {
            counts: { condition: 0 },
            events: [{ type: 'value-change', detail: { value: { logic: 'and', conditions: [{ field: 'region', operator: 'eq' }] } } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: { logic: 'or', conditions: [{ field: 'amount', operator: 'gt', value: 1 }] } },
          expect: {
            counts: { condition: 1 },
            parts: { group: { 'data-logic': 'or' } },
            events: [],
          },
        },
      ],
    },
  ],
}
