// 浮层与提示类组件只引用作者渲染了的标题与说明：用一致性套件的夹具各挂一次带标题与说明的、两者都去掉的、
// 说明留空的，引用的每个 id 都查得回节点，axe 不报无效引用。
import type { ConformanceSuite, FixtureNode } from '@xihan-ui/testing'
import { allSuites } from '@xihan-ui/testing'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { createWcHarness } from '../harness'
import { wcSuites } from '../suites'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const COMPONENTS = ['dialog', 'drawer', 'popover', 'popconfirm', 'alert', 'approval', 'tour']

type Variant = 'full' | 'drop' | 'empty-description'

/** 挂载用的 props：收起时内容不渲染，部件也就无从登记，这几个要先展开。 */
const MOUNT_PROPS: Record<string, (suite: ConformanceSuite, variant: Variant) => Record<string, unknown>> = {
  dialog: () => ({ defaultOpen: true }),
  drawer: () => ({ defaultOpen: true }),
  popover: () => ({ defaultOpen: true }),
  popconfirm: () => ({ defaultOpen: true }),
  tour: (suite, variant) => {
    const props = suite.cases.find(c => c.props?.defaultOpen)?.props ?? {}
    if (variant !== 'empty-description')
      return props
    const steps = props.steps as Array<Record<string, unknown>>
    return { ...props, steps: steps.map(({ description: _, ...step }) => step) }
  },
}

const harness = createWcHarness()

afterEach(async () => {
  await harness.unmount()
})

/** 改写套件自己那个组件的 title / description 部件：drop 去掉，empty 留节点、清掉文字。 */
function rewrite(node: FixtureNode, component: string, mode: Exclude<Variant, 'full'>): FixtureNode {
  if (!node.children)
    return node
  const own = (child: FixtureNode): boolean => (child.component ?? component) === component
  return {
    ...node,
    children: node.children
      .filter(child => !(mode === 'drop' && own(child) && (child.part === 'title' || child.part === 'description')))
      .map(child => mode === 'empty-description' && own(child) && child.part === 'description'
        ? { ...child, text: undefined, children: undefined }
        : rewrite(child, component, mode)),
  }
}

async function mountTree(suite: ConformanceSuite, variant: Variant): Promise<HTMLElement> {
  const tree = variant === 'full' ? suite.fixture : rewrite(suite.fixture, suite.component, variant)
  const props = { ...suite.defaultProps, ...MOUNT_PROPS[suite.component]?.(suite, variant) }
  const { root } = await harness.mount({ component: suite.component, props, tree })
  await harness.flush()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  await harness.flush()
  return root
}

function refIds(attr: string): string[] {
  return [...document.querySelectorAll(`[${attr}]`)].flatMap(el => (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean))
}

/** 文档里每条 aria-labelledby / aria-describedby 引用的 id 都要能找到节点。 */
function danglingRefs(): string[] {
  const out: string[] = []
  for (const el of document.querySelectorAll('[aria-labelledby], [aria-describedby]')) {
    for (const attr of ['aria-labelledby', 'aria-describedby']) {
      for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id))
          out.push(`${el.localName}[${attr}] → ${id}`)
      }
    }
  }
  return out
}

async function invalidRefs(): Promise<string[]> {
  const { violations } = await runAxe(document.body)
  return violations.filter(v => v.id === 'aria-valid-attr-value').map(v => v.id)
}

describe('只引用在场的标题与说明', () => {
  // 不在 WC 套件清单里的组件取共用套件：根节点在 WC 侧不是角色节点，换成不带部件的包裹
  const suites = COMPONENTS.flatMap((component): ConformanceSuite[] => {
    const own = wcSuites.find(suite => suite.component === component)
    if (own)
      return [own]
    const shared = allSuites.find(suite => suite.component === component)
    return shared ? [{ ...shared, fixture: { tag: 'div', children: shared.fixture.children } }] : []
  })

  it('每个组件都取到了套件', () => {
    expect(suites.map(suite => suite.component).sort()).toEqual([...COMPONENTS].sort())
  })

  for (const component of COMPONENTS) {
    it(`${component}：写了标题与说明时引用它们，去掉后不留落空的引用，说明留空时不进描述链`, async () => {
      const suite = suites.find(s => s.component === component)!
      const part = (name: string): string => `[data-scope="${component}"][data-part="${name}"]`

      await mountTree(suite, 'full')
      const title = document.querySelector(part('title'))
      expect(title?.id).toBeTruthy()
      expect(refIds('aria-labelledby')).toContain(title!.id)
      const description = document.querySelector(part('description'))
      expect(description?.id).toBeTruthy()
      expect(refIds('aria-describedby')).toContain(description!.id)
      expect(danglingRefs()).toEqual([])
      await harness.unmount()

      await mountTree(suite, 'drop')
      expect(document.querySelector(part('title'))).toBeNull()
      expect(document.querySelector(part('description'))).toBeNull()
      expect(danglingRefs()).toEqual([])
      expect(await invalidRefs()).toEqual([])
      await harness.unmount()

      await mountTree(suite, 'empty-description')
      const empty = document.querySelector(part('description'))
      expect(empty?.id).toBeTruthy()
      expect(refIds('aria-describedby')).not.toContain(empty!.id)
      expect(danglingRefs()).toEqual([])
    })
  }
})
