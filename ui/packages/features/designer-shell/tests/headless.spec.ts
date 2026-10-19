// @vitest-environment jsdom

// 零件放进外框卡片时的 headless：物料、属性、问题三个零件不画自己的标题，标题仍作正文的可访问名；
// 物料的搜索框、属性的页头插槽、问题的严重程度过滤照旧显示。
import type { XhDesignerIssuesElement, XhDesignerPaletteElement, XhDesignerPropertiesElement } from '../src'
import { afterEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../src'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
})

async function mount<T extends HTMLElement & { updateComplete: Promise<unknown> }>(tag: string, setup: (element: T) => void): Promise<T> {
  const element = document.createElement(tag) as T
  setup(element)
  document.body.append(element)
  await element.updateComplete
  return element
}

function part(element: Element, name: string): HTMLElement {
  return element.querySelector<HTMLElement>(`[data-part="${name}"]`)!
}

describe('headless', () => {
  it('物料：标题收起，正文不再是地标（外框的区已是）；不搜索时整个页头收起，可搜索时只留搜索框；不再 headless 时正文回到以标题命名的地标', async () => {
    const palette = await mount<XhDesignerPaletteElement>('xh-designer-palette', (element) => {
      element.headless = true
      element.groups = [{ id: 'basic', label: '基础', items: [{ id: 'text', label: '文本' }] }]
    })
    const title = part(palette, 'title')
    const body = part(palette, 'body')
    expect([title.hidden, part(palette, 'header').hidden, body.hasAttribute('role'), body.hasAttribute('aria-labelledby')]).toEqual([true, true, false, false])
    palette.searchable = true
    await palette.updateComplete
    expect([title.hidden, part(palette, 'header').hidden, part(palette, 'search').hidden]).toEqual([true, false, false])
    palette.headless = false
    await palette.updateComplete
    expect([title.hidden, body.getAttribute('role'), body.getAttribute('aria-labelledby')]).toEqual([false, 'region', title.id])
  })

  it('属性：标题与副标题收起；页头插槽有内容时页头照旧显示', async () => {
    const properties = await mount<XhDesignerPropertiesElement>('xh-designer-properties', (element) => {
      element.headless = true
      element.heading = '审批'
    })
    expect([part(properties, 'title').hidden, part(properties, 'heading').hidden, part(properties, 'header').hidden]).toEqual([true, true, true])
    const nav = document.createElement('nav')
    nav.slot = 'header'
    properties.append(nav)
    await new Promise(resolve => setTimeout(resolve))
    properties.requestUpdate()
    await properties.updateComplete
    expect([part(properties, 'title').hidden, part(properties, 'header').hidden]).toEqual([true, false])
    properties.headless = false
    await properties.updateComplete
    expect([part(properties, 'title').hidden, part(properties, 'heading').hidden]).toEqual([false, false])
  })

  it('问题：标题收起，严重程度过滤照旧显示，列表仍以标题为名', async () => {
    const issues = await mount<XhDesignerIssuesElement>('xh-designer-issues', (element) => {
      element.headless = true
      element.items = []
    })
    const title = part(issues, 'title')
    expect([title.hidden, part(issues, 'filter').hidden, part(issues, 'list').getAttribute('aria-labelledby')]).toEqual([true, false, title.id])
  })
})
