// 带可选 label 的控件只在作者渲染了 label 时引用它：用一致性套件的夹具各挂一次带 label 与去掉 label 的，
// 去掉后引用的每个 id 都查得回节点，axe 不报无效引用。
import type { ConformanceSuite, FixtureNode } from '@xihan-ui/testing'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { createWcHarness } from '../harness'
import { wcSuites } from '../suites'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const CONTROLS = ['clipboard', 'color-slider', 'color-picker', 'date-field', 'editable', 'file-upload', 'grid-list', 'listbox', 'signature-pad', 'tag-group', 'time-field', 'tree']

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

async function mountTree(suite: ConformanceSuite, tree: FixtureNode): Promise<HTMLElement> {
  const { root } = await harness.mount({ component: suite.component, props: suite.defaultProps ?? {}, tree })
  await harness.flush()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  await harness.flush()
  return root
}

function labelledbyIds(doc: Document): string[] {
  return [...doc.querySelectorAll('[aria-labelledby]')].flatMap(el => (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean))
}

/** 文档里每条 aria-labelledby / aria-describedby 引用的 id 都要能找到节点。 */
function danglingRefs(doc: Document): string[] {
  const out: string[] = []
  for (const el of doc.querySelectorAll('[aria-labelledby], [aria-describedby]')) {
    for (const attr of ['aria-labelledby', 'aria-describedby']) {
      for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
        if (!doc.getElementById(id))
          out.push(`${el.localName}[${attr}] → ${id}`)
      }
    }
  }
  return out
}

async function invalidRefs(root: HTMLElement): Promise<string[]> {
  const { violations } = await runAxe(root)
  return violations.filter(v => v.id === 'aria-valid-attr-value').map(v => v.id)
}

describe('带可选 label 的控件只引用在场的 label', () => {
  const suites = wcSuites.filter(suite => CONTROLS.includes(suite.component))

  it('十二个控件都取到了套件', () => {
    expect(suites.map(suite => suite.component).sort()).toEqual([...CONTROLS].sort())
  })

  for (const component of CONTROLS) {
    it(`${component}：写了 label 时引用它，去掉 label 后不留落空的引用`, async () => {
      const suite = suites.find(s => s.component === component)!
      const labelSelector = `[data-scope="${component}"][data-part="label"]`

      const labelled = await mountTree(suite, suite.fixture)
      const label = labelled.querySelector(labelSelector)
      expect(label?.id).toBeTruthy()
      expect(labelledbyIds(document)).toContain(label!.id)
      expect(danglingRefs(document)).toEqual([])

      const bare = await mountTree(suite, withoutLabel(suite.fixture, component))
      expect(bare.querySelector(labelSelector)).toBeNull()
      expect(danglingRefs(document)).toEqual([])
      expect(await invalidRefs(bare)).toEqual([])
    })
  }

  it('color-picker：只有内嵌的色相滑块与色板写了 label 时，各自引用自己的，取色器自己不写引用', async () => {
    const suite = suites.find(s => s.component === 'color-picker')!
    const NESTED: Record<string, FixtureNode> = {
      'hue-slider': { part: 'label', component: 'color-slider', tag: 'span', text: '色相' },
      'swatch-picker': { part: 'label', component: 'color-swatch-picker', tag: 'span', text: '预设' },
    }
    const withNestedLabels = (node: FixtureNode): FixtureNode => node.part && NESTED[node.part]
      ? { ...node, children: [NESTED[node.part]!, ...(node.children ?? [])] }
      : { ...node, children: node.children?.map(withNestedLabels) }
    const root = await mountTree(suite, withNestedLabels(withoutLabel(suite.fixture, 'color-picker')))
    const sliderLabel = document.querySelector('[data-scope="color-slider"][data-part="label"]')
    expect(sliderLabel?.id).toBeTruthy()
    const thumbs = [...document.querySelectorAll('[data-scope="color-slider"][data-part="thumb"]')]
    expect(thumbs.map(el => el.getAttribute('aria-labelledby'))).toEqual([sliderLabel!.id, null])
    const swatchLabel = document.querySelector('[data-scope="color-swatch-picker"][data-part="label"]')
    expect(swatchLabel?.id).toBeTruthy()
    expect(labelledbyIds(document)).toContain(swatchLabel!.id)
    expect(root.querySelector('[data-scope="color-picker"][data-part="label"]')).toBeNull()
    expect(danglingRefs(document)).toEqual([])
  })
})
