// 库内表单控件的 ariaLabel：用一致性套件的夹具逐个挂载，只给 ariaLabel 时承担名字的那个部件念它，
// 同时渲染了 label 部件时名字归 label；只给 ariaLabel 时 axe 不报命名类问题。
import type { ConformanceSuite, FixtureNode } from '@xihan-ui/testing'
import { allSuites } from '@xihan-ui/testing'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createWcHarness } from '../harness'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 控件 → 承担名字的部件（与字段标签接到的是同一个）。 */
const TARGETS: Record<string, string> = {
  'text-field': 'input',
  'checkbox': 'root',
  'switch': 'root',
  'radio-group': 'root',
  'number-field': 'input',
  'select': 'trigger',
  'cascader': 'trigger',
  'combobox': 'input',
  'tree-select': 'trigger',
  'date-picker': 'trigger',
  'date-range-picker': 'trigger',
  'time-picker': 'trigger',
  'time-range-picker': 'trigger',
  'color-picker': 'trigger',
  'color-field': 'input',
  'color-slider': 'thumb',
  'color-swatch-picker': 'root',
  'mention': 'input',
  'expression-input': 'input',
  'password-input': 'input',
  'pin-input': 'root',
  'date-field': 'control',
  'time-field': 'control',
  'editable': 'root',
  'tags-input': 'input',
  'checkbox-group': 'root',
  'slider': 'thumb',
  'rating': 'control',
  'toggle-group': 'root',
  'transfer': 'root',
  'field-array': 'table',
  'file-upload': 'dropzone',
  'image-cropper': 'crop-area',
  'signature-pad': 'control',
  'listbox': 'content',
  'tag-group': 'list',
  'format-input': 'root',
}

const NAME = '自定名字'

/** 命名类的 axe 规则：只给 ariaLabel 时这些都不该报。 */
const NAMING_RULES = new Set([
  'aria-allowed-attr',
  'aria-command-name',
  'aria-input-field-name',
  'aria-prohibited-attr',
  'aria-toggle-field-name',
  'aria-valid-attr-value',
  'button-name',
  'label',
  'select-name',
])

const harness = createWcHarness()

afterEach(async () => {
  await harness.unmount()
})

/** 去掉套件自己那个组件的 label 部件，内嵌组件的 label 留着。 */
function withoutLabel(node: FixtureNode, component: string): FixtureNode {
  if (!node.children)
    return node
  return {
    ...node,
    children: node.children
      .filter(child => !(child.part === 'label' && (child.component ?? component) === component))
      .map(child => withoutLabel(child, component)),
  }
}

/** 作者直接写在承担名字的部件上的名字归作者，测 ariaLabel 时先拿掉。 */
function withoutAuthoredName(node: FixtureNode, component: string): FixtureNode {
  const own = node.part === TARGETS[component] && (node.component ?? component) === component
  const attrs = own && node.attrs ? Object.fromEntries(Object.entries(node.attrs).filter(([key]) => key !== 'aria-label' && key !== 'aria-labelledby')) : node.attrs
  return { ...node, attrs, children: node.children?.map(child => withoutAuthoredName(child, component)) }
}

function hasOwnLabel(node: FixtureNode, component: string): boolean {
  return (node.part === 'label' && (node.component ?? component) === component) || (node.children ?? []).some(child => hasOwnLabel(child, component))
}

/** field-array 的名字只在表格排布下有落点：取套件里表格排布那一例的夹具与属性。 */
function setup(suite: ConformanceSuite): { tree: FixtureNode, props: Record<string, unknown> } {
  if (suite.component === 'field-array') {
    const table = suite.cases.find(c => c.props?.layout === 'table')!
    return { tree: table.fixture!(suite.fixture), props: { ...table.props } }
  }
  return { tree: suite.fixture, props: { ...suite.defaultProps } }
}

async function mountTree(suite: ConformanceSuite, tree: FixtureNode, props: Record<string, unknown>): Promise<HTMLElement> {
  const { root } = await harness.mount({ component: suite.component, props, tree })
  await harness.flush()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  await harness.flush()
  return root
}

function target(component: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="${component}"][data-part="${TARGETS[component]}"]`)
  expect(el, `${component} 的 ${TARGETS[component]} 部件不在场`).not.toBeNull()
  return el!
}

describe('库内表单控件的 ariaLabel', () => {
  const suites = Object.keys(TARGETS).map(component => allSuites.find(suite => suite.component === component)!)

  it('三十七个控件都取到了套件', () => {
    expect(suites.filter(Boolean).map(suite => suite.component).sort()).toEqual(Object.keys(TARGETS).sort())
  })

  for (const component of Object.keys(TARGETS)) {
    it(`${component}：只给 ariaLabel 时 ${TARGETS[component]} 念它，axe 不报命名类问题`, async () => {
      const suite = suites.find(s => s.component === component)!
      const { tree, props } = setup(suite)
      const root = await mountTree(suite, withoutAuthoredName(withoutLabel(tree, component), component), { ...props, label: undefined, ariaLabel: NAME })
      await expect.element(page.elementLocator(target(component))).toHaveAccessibleName(new RegExp(`^${NAME}`))
      const { violations } = await runAxe(root)
      expect(violations.filter(v => NAMING_RULES.has(v.id)).map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }

  for (const component of Object.keys(TARGETS)) {
    const suite = allSuites.find(s => s.component === component)
    const labelled = suite != null && (hasOwnLabel(setup(suite).tree, component) || setup(suite).props.label != null)
    if (!labelled)
      continue
    it(`${component}：渲染了 label 部件时名字归 label，ariaLabel 不进名字`, async () => {
      const { tree, props } = setup(suite)
      await mountTree(suite, withoutAuthoredName(tree, component), { ...props, ariaLabel: NAME })
      const label = document.querySelector<HTMLElement>(`[data-scope="${component}"][data-part="label"]`)!
      const text = (label.textContent ?? '').trim()
      expect(text).not.toBe('')
      const name = page.elementLocator(target(component))
      await expect.element(name).toHaveAccessibleName(new RegExp(`^${text}`))
      await expect.element(name).not.toHaveAccessibleName(new RegExp(NAME))
    })
  }
})
