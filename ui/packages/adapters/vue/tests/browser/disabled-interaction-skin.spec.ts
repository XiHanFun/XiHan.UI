// 禁用与挂起件的交互伪类。这些件的禁用不走原生 disabled 而是 aria-disabled / data-disabled，
// 节点始终是可命中的，:hover 与 :active 照样命中；皮肤不在选择器里挡掉，
// 置灰的那颗悬停照样换底、按下照样缩，看着还能点。
// 判据必须用真实指针：合成事件不改伪类状态，getComputedStyle 读不到 :hover 的效果。
import type { App, VNode } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhButton,
  XhNavigationMenuItem,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤算出来的取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

/** 指针停回角落那块 fixture，免得它留在上一条用例的节点上。 */
async function park(): Promise<void> {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
}

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await park()
})

function mount(render: () => VNode[]): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function parts(scope: string, part: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)]
}

/** 停在角落时的底色，与真实指针压在它身上时的底色。 */
async function bgAtRestAndHover(el: HTMLElement): Promise<[string, string]> {
  await park()
  const rest = getComputedStyle(el).backgroundColor
  await userEvent.hover(el)
  return [rest, getComputedStyle(el).backgroundColor]
}

/**
 * 皮肤里落在该部件上的 :active 规则，去掉 :active 之后剩下的选择器。
 * 拿它去 matches 一颗置灰的件：还能匹配上，就说明按下时那条规则会生效。
 * :active 没法用真实指针按住不放来验，改从装好的样式表反推。
 */
function activeSelectors(scope: string, part: string): string[] {
  const scopeRe = new RegExp(`\\[data-scope=["']?${scope}["']?\\]`)
  const partRe = new RegExp(`\\[data-part=["']?${part}["']?\\]`)
  const found: string[] = []

  const walk = (rules: CSSRuleList): void => {
    for (let i = 0; i < rules.length; i++) {
      const rule = rules.item(i) as CSSStyleRule & CSSGroupingRule
      const selector = typeof rule.selectorText === 'string' ? rule.selectorText : ''
      if (selector.includes(':active')) {
        for (const one of selector.split(',')) {
          if (scopeRe.test(one) && partRe.test(one))
            found.push(one.trim().replaceAll(':active', ''))
        }
      }
      // @layer / @media 里的规则要往里走；样式规则自身也可能嵌套
      if (rule.cssRules)
        walk(rule.cssRules)
    }
  }

  for (const sheet of document.styleSheets) {
    // 跨源样式表读 cssRules 会抛，这里装的都是同源的，抛了就是别的问题，让它抛出去
    walk(sheet.cssRules)
  }
  return found
}

describe('按钮：置灰与挂起时不该有交互反馈', () => {
  function mountThree(): { idle: HTMLElement, loading: HTMLElement, off: HTMLElement } {
    mount(() => [
      h(XhButton, { variant: 'solid' }, () => '可按'),
      h(XhButton, { variant: 'solid', loading: true }, () => '挂起'),
      h(XhButton, { variant: 'solid', disabled: true }, () => '置灰'),
    ])
    const [idle, loading, off] = parts('button', 'root')
    return { idle: idle!, loading: loading!, off: off! }
  }

  it('可按的那颗悬停要换底', async () => {
    const { idle } = mountThree()
    const [rest, hovered] = await bgAtRestAndHover(idle)
    // 这条是对照：它不成立就说明真实指针根本没压上去，下面两条的"没变"毫无意义
    expect(hovered).not.toBe(rest)
  })

  it('挂起的那颗悬停不换底', async () => {
    const { loading } = mountThree()
    const [rest, hovered] = await bgAtRestAndHover(loading)
    expect(hovered).toBe(rest)
  })

  it('置灰的那颗悬停不换底', async () => {
    const { off } = mountThree()
    const [rest, hovered] = await bgAtRestAndHover(off)
    expect(hovered).toBe(rest)
  })

  it('按下换底的规则匹配不到置灰与挂起的那两颗', () => {
    const { idle, loading, off } = mountThree()
    const selectors = activeSelectors('button', 'root')
    expect(selectors.length).toBeGreaterThan(0)
    for (const selector of selectors) {
      expect(idle.matches(selector), `${selector} 连可按的那颗都匹配不上`).toBe(true)
      expect(loading.matches(selector), `${selector} 会落在挂起的那颗上`).toBe(false)
      expect(off.matches(selector), `${selector} 会落在置灰的那颗上`).toBe(false)
    }
  })
})

describe('标签页：禁用的标签不该有交互反馈', () => {
  function mountTwo(): { idle: HTMLElement, off: HTMLElement } {
    mount(() => [
      h(XhTabsRoot, { defaultValue: 'a' }, () => [
        h(XhTabsList, null, () => [
          h(XhTabsTrigger, { value: 'b' }, () => '可点'),
          h(XhTabsTrigger, { value: 'c', disabled: true }, () => '禁用'),
        ]),
      ]),
    ])
    const [idle, off] = parts('tabs', 'trigger')
    return { idle: idle!, off: off! }
  }

  it('可点的那条悬停要换底', async () => {
    const { idle } = mountTwo()
    const [rest, hovered] = await bgAtRestAndHover(idle)
    expect(hovered).not.toBe(rest)
  })

  it('禁用的那条悬停不换底', async () => {
    const { off } = mountTwo()
    // 禁用走 aria-disabled，节点仍可命中，:hover 一定命中，只能靠选择器挡
    expect(off.getAttribute('aria-disabled')).toBe('true')
    const [rest, hovered] = await bgAtRestAndHover(off)
    expect(hovered).toBe(rest)
  })

  it('选中且禁用的那条悬停也不换底', async () => {
    mount(() => [
      h(XhTabsRoot, { defaultValue: 'a' }, () => [
        h(XhTabsList, null, () => [
          h(XhTabsTrigger, { value: 'a', disabled: true }, () => '选中且禁用'),
        ]),
      ]),
    ])
    const el = parts('tabs', 'trigger')[0]!
    expect(el.getAttribute('data-state')).toBe('active')
    const [rest, hovered] = await bgAtRestAndHover(el)
    expect(hovered).toBe(rest)
  })
})

describe('导航菜单：禁用项不该有交互反馈，展开项的强档也不能被轻档压回去', () => {
  function mountTwo(open: string | null): { openTrigger: HTMLElement, off: HTMLElement } {
    mount(() => [
      h(XhNavigationMenuRoot, { defaultValue: open }, () => [
        h(XhNavigationMenuList, null, () => [
          h(XhNavigationMenuItem, null, () => h(XhNavigationMenuTrigger, { value: 'a' }, () => '展开')),
          h(XhNavigationMenuItem, null, () => h(XhNavigationMenuTrigger, { value: 'b', disabled: true }, () => '禁用')),
        ]),
      ]),
    ])
    const [openTrigger, off] = parts('navigation-menu', 'trigger')
    return { openTrigger: openTrigger!, off: off! }
  }

  it('禁用的那项悬停不换底', async () => {
    const { off } = mountTwo(null)
    expect(off.getAttribute('aria-disabled')).toBe('true')
    const [rest, hovered] = await bgAtRestAndHover(off)
    expect(hovered).toBe(rest)
  })

  it('展开着的那项悬停仍是展开档的底，不是轻档', async () => {
    // 轻档与展开档同特指度、靠书写顺序分胜负：给轻档加禁用守卫时展开档那条要一起加，
    // 否则轻档特指度高出一档，指针一回到展开项上底色就退回轻档
    const { openTrigger } = mountTwo('a')
    expect(openTrigger.getAttribute('data-state')).toBe('open')
    const [rest, hovered] = await bgAtRestAndHover(openTrigger)
    expect(hovered).toBe(rest)
  })
})
