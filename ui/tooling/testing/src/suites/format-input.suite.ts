// 格式输入的三端一致性套件：作者只写 root，三端都照 formatInputStructure 铺出种类、参数行、样例与行内说明。
// 里面的下拉、分段切换、数字框、开关与组合框是库内组件的实例，它们自己的部件不进本套件的快照，
// 由 raw 步骤按 scope 查到后断言角色、名字与状态。

import type { ConformanceSuite, FixtureNode, RawStepContext, StepWithExpect } from '../conformance/types'
import { formatInputAnatomy, formatInputKeyboard } from '@xihan-ui/headless'
import { documentTabbables } from '../conformance/tab-sequence'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/'

const ROOT: FixtureNode = { part: 'root', defaultStructure: true }

/** 一个参数行（按 value 取）里某个内嵌组件的部件。 */
function inner(doc: Document, row: string | null, scope: string, part: string): HTMLElement {
  const host = row === null
    ? doc.querySelector<HTMLElement>('[data-scope="format-input"][data-part="kind"]')
    : doc.querySelector<HTMLElement>(`[data-scope="format-input"][data-part="item"][data-value="${row}"]`)
  if (!host)
    throw new Error(`找不到 ${row === null ? '种类控件' : `参数行 ${row}`}`)
  const el = host.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)
  if (!el)
    throw new Error(`${row === null ? '种类控件' : `参数行 ${row}`}里没有 ${scope} 的 ${part}`)
  return el
}

/** 经原生 setter 改输入框的值再派发 input：React 的受控输入框只认这条路径。 */
function inputText(el: HTMLElement, text: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(el, text)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function raw(why: string, run: (ctx: RawStepContext) => void | Promise<void>, expect?: StepWithExpect['expect']): StepWithExpect {
  return { kind: 'raw', why, run, ...(expect ? { expect } : null) }
}

function expectEqual(actual: unknown, expected: unknown, what: string): void {
  if (actual !== expected)
    throw new Error(`${what}：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

const NUMBER = { kind: 'number', decimals: 2, grouping: true }

export const formatInputSuite: ConformanceSuite = {
  component: 'format-input',
  anatomy: formatInputAnatomy,
  keyboard: formatInputKeyboard,
  fixture: ROOT,
  cases: [
    {
      name: '作者只写 root、不设格式：根是 group，种类控件是下拉，没有参数行、样例与行内说明',
      spec: { apg: `${APG}#group` },
      fixture: (): FixtureNode => ROOT,
      initial: {
        order: ['root', 'kind'],
        counts: { 'label': 0, 'kind': 1, 'field-group': 0, 'item': 0, 'item-label': 0, 'pattern-description': 0, 'preview': 0, 'error-text': 0 },
        parts: {
          root: { 'role': 'group', 'data-kind': 'none', 'aria-labelledby': null, 'aria-invalid': null, 'aria-describedby': null },
        },
      },
      steps: [
        raw('种类下拉是 select 组件的实例，它的部件不在本组件的 anatomy 里', ({ doc }) => {
          const trigger = inner(doc, null, 'select', 'trigger')
          if (!trigger.getAttribute('aria-labelledby'))
            throw new Error('种类下拉没有名字：它的标题应当经组合节点的 label 传进去')
        }),
      ],
    },
    {
      name: '数字种类：参数行按种类铺开；分段切换那一行带 legend，开关那一行的名字在 label 里，样例是 status',
      spec: { apg: `${APG}#group` },
      props: { defaultValue: NUMBER },
      initial: {
        order: ['root', 'kind', 'field-group', 'item[0]', 'item-label[0]', 'item[1]', 'item[2]', 'item-label[1]', 'item[3]', 'preview'],
        counts: { 'item': 4, 'item-label': 2, 'pattern-description': 0, 'preview': 1, 'error-text': 0 },
        parts: {
          'root': { 'role': 'group', 'data-kind': 'number', 'aria-invalid': null },
          'item': [{ 'data-value': 'decimals-mode' }, { 'data-value': 'decimals' }, { 'data-value': 'grouping' }, { 'data-value': 'rounding' }],
          'item-label': [{ 'data-value': 'decimals-mode' }, { 'data-value': 'grouping' }],
          'preview': { 'role': 'status', 'aria-live': 'polite', 'hidden': null },
        },
      },
      steps: [
        raw('行与名字的标签名、内嵌组件的状态都落在组件外的节点上', ({ doc }) => {
          const rows = [...doc.querySelectorAll<HTMLElement>('[data-scope="format-input"][data-part="item"]')]
          expectEqual(rows.map(row => row.tagName.toLowerCase()).join(','), 'fieldset,div,label,div', '参数行的标签名')
          expectEqual(rows[0]!.firstElementChild?.tagName.toLowerCase(), 'legend', '分段切换那一行的名字')
          expectEqual((inner(doc, 'decimals', 'number-field', 'input') as HTMLInputElement).value, '2', '位数输入框的值')
          expectEqual(inner(doc, 'grouping', 'switch', 'root').getAttribute('aria-checked'), 'true', '千位分隔开关')
        }),
      ],
    },
    {
      name: '点千位分隔开关：派发 value-change，携带改过的格式说明',
      spec: { adr: 'controlled-uncontrolled' },
      props: { defaultValue: NUMBER },
      steps: [
        raw('开关是 switch 组件的实例，点的是它的按钮', async ({ doc, flush }) => {
          inner(doc, 'grouping', 'switch', 'root').click()
          await flush()
          expectEqual(inner(doc, 'grouping', 'switch', 'root').getAttribute('aria-checked'), 'false', '千位分隔开关')
        }, {
          events: [{ type: 'value-change', detail: { value: { kind: 'number', decimals: 2 } } }],
        }),
      ],
    },
    {
      name: '焦点在里面的数字框上：ArrowUp 交给数字框步进，位数加一并派发 value-change',
      spec: { apg: `${APG}spinbutton/` },
      covers: ['format-input.kbd.controls'],
      props: { defaultValue: NUMBER },
      steps: [
        raw('数字框是 number-field 组件的实例，焦点要落进它的输入框', ({ doc }) => {
          inner(doc, 'decimals', 'number-field', 'input').focus()
        }),
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            events: [{ type: 'value-change', detail: { value: { kind: 'number', decimals: 3, grouping: true } } }],
          },
        },
      ],
    },
    {
      name: '种类不超过三项时是分段切换；换种类后参数行整组换，焦点留在种类控件上，样例与说明不进 Tab 序',
      spec: { apg: `${APG}#group` },
      covers: ['format-input.kbd.tab'],
      props: { kinds: ['number', 'date'], clearable: false, defaultValue: { kind: 'number' } },
      initial: {
        counts: { 'kind': 1, 'item-label': 3 },
        parts: { 'item-label': [{ 'data-value': 'kind' }, { 'data-value': 'decimals-mode' }, { 'data-value': 'grouping' }] },
      },
      steps: [
        raw('种类分段切换是 toggle-group 组件的实例，点的是它的条目', async ({ doc, flush }) => {
          const kind = doc.querySelector<HTMLElement>('[data-scope="format-input"][data-part="kind"]')!
          expectEqual(kind.tagName.toLowerCase(), 'fieldset', '种类控件的外包')
          const date = [...kind.querySelectorAll<HTMLElement>('[data-scope="toggle-group"][data-part="item"]')][1]
          if (!date)
            throw new Error('种类分段切换里没有第二项')
          date.focus()
          date.click()
          await flush()
          const items = [...kind.querySelectorAll<HTMLElement>('[data-scope="toggle-group"][data-part="item"]')]
          if (doc.activeElement !== items[1])
            throw new Error('换种类后焦点没有留在种类控件上')
        }, {
          counts: { 'item': 1, 'pattern-description': 1 },
          parts: { root: { 'data-kind': 'date' }, item: { 'data-value': 'pattern' } },
          events: [{ type: 'value-change' }],
        }),
        raw('Tab 序只经过种类与参数行里的控件，样例与占位符说明不可聚焦', ({ doc }) => {
          const root = doc.querySelector<HTMLElement>('[data-scope="format-input"][data-part="root"]')!
          const stops = documentTabbables(doc).filter(el => root.contains(el))
          if (stops.length === 0)
            throw new Error('组里一个 Tab 停靠点都没有')
          for (const el of stops) {
            if (!el.closest('[data-scope="format-input"]:is([data-part="kind"], [data-part="item"])'))
              throw new Error(`Tab 停靠点落在种类与参数行之外：<${el.tagName.toLowerCase()} data-part="${el.dataset.part}">`)
          }
        }),
      ],
    },
    {
      name: '草稿不完整（清空位数）：不派发，根标 aria-invalid，行内说明出现并进描述链',
      spec: { adr: 'controlled-uncontrolled' },
      props: { defaultValue: { kind: 'number', decimals: 2 } },
      steps: [
        raw('位数输入框是 number-field 组件的实例，清空它的文字', async ({ doc, flush }) => {
          inputText(inner(doc, 'decimals', 'number-field', 'input'), '')
          await flush()
        }, {
          counts: { 'error-text': 1 },
          parts: {
            'root': { 'aria-invalid': 'true', 'data-invalid': '', 'aria-describedby': '@part(error-text)' },
            'error-text': { hidden: null },
          },
          events: [],
        }),
      ],
    },
    {
      name: 'mixed（几个对象取值不同）：种类下拉显示「多个值」，没有参数行与样例；选了种类即派发',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: null, mixed: true },
      initial: {
        counts: { 'kind': 1, 'field-group': 0, 'item': 0, 'preview': 0 },
        parts: { root: { 'data-kind': null } },
      },
      steps: [
        raw('种类下拉是 select 组件的实例，占位写在它的 value-text 上', ({ doc }) => {
          const text = inner(doc, null, 'select', 'value-text')
          expectEqual(text.textContent?.trim(), 'Multiple values', '种类下拉的占位')
          expectEqual(text.hasAttribute('data-placeholder'), true, '种类下拉无选中')
        }),
      ],
    },
    {
      name: '禁用：根标 data-disabled，里面的控件一并禁用',
      spec: { adr: 'controlled-uncontrolled' },
      props: { disabled: true, defaultValue: NUMBER },
      initial: {
        parts: { root: { 'data-disabled': '' } },
      },
      steps: [
        raw('禁用落在内嵌组件自己的根上', ({ doc }) => {
          for (const [row, scope] of [[null, 'select'], ['decimals-mode', 'toggle-group'], ['decimals', 'number-field'], ['grouping', 'switch'], ['rounding', 'select']] as const) {
            if (!inner(doc, row, scope, 'root').hasAttribute('data-disabled'))
              throw new Error(`${row ?? 'kind'} 里的 ${scope} 没有禁用`)
          }
        }),
      ],
    },
    {
      name: '受控 value：改参数只派发 value-change；宿主写回另一份格式说明时，种类与参数行按它改写',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: NUMBER },
      steps: [
        raw('开关是 switch 组件的实例，点的是它的按钮', async ({ doc, flush }) => {
          inner(doc, 'grouping', 'switch', 'root').click()
          await flush()
        }, {
          parts: { root: { 'data-kind': 'number' } },
          events: [{ type: 'value-change', detail: { value: { kind: 'number', decimals: 2 } } }],
        }),
        {
          kind: 'setProps',
          props: { value: { kind: 'date', pattern: 'yyyy-MM-dd' } },
          expect: {
            counts: { 'item': 1, 'pattern-description': 1 },
            parts: { root: { 'data-kind': 'date' }, item: { 'data-value': 'pattern' } },
            events: [],
          },
        },
        raw('日期模式的组合框是 combobox 组件的实例，文字取宿主写回的模式', ({ doc }) => {
          expectEqual((inner(doc, 'pattern', 'combobox', 'input') as HTMLInputElement).value, 'yyyy-MM-dd', '日期模式输入框的值')
        }),
      ],
    },
  ],
}
