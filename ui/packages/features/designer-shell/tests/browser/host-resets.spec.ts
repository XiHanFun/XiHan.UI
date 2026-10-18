// 宿主按标签名重置排版（不分层、把 p、ul、li 这些标签的边距、列表样式退回浏览器缺省）时，零件自己生成的结构照样按零件的样式排：
// 问题列表的空提示与条目、物料面板的空提示、属性面板的空提示与说明都留着零件给的边距，列表不出圆点。
import type { DesignerIssueItem, XhDesignerIssuesElement, XhDesignerPaletteElement, XhDesignerPropertiesElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '../../style.css'

defineDesignerShell()

const RESET = `.host-prose :where(h1, h2, h3, h4, h5, h6, p, blockquote, ul, ol, li, table, tr, th, td, hr, a, code) {
  margin: revert; padding: revert; list-style: revert; display: revert;
}`

const items: DesignerIssueItem[] = [
  { issue: { code: 'required', path: ['nodes', 0, 'label'], target: { kind: 'node', id: 'n1' } }, message: '名称必填', subject: '开始' },
  { issue: { code: 'node.unreachable', path: ['nodes', 1], target: { kind: 'node', id: 'n2' }, severity: 'warning' }, message: '无法到达', subject: '审批' },
]

let host: HTMLElement
let style: HTMLStyleElement

beforeEach(() => {
  style = document.createElement('style')
  style.textContent = RESET
  document.head.append(style)
  host = document.createElement('div')
  host.className = 'host-prose'
  host.style.cssText = 'position:fixed;inset:0 auto auto 0;display:flex;gap:24px;width:1200px'
  document.body.prepend(host)
})

afterEach(() => {
  host.remove()
  style.remove()
})

/** 令牌折成像素。 */
function px(token: string): string {
  const probe = document.createElement('div')
  probe.style.paddingLeft = `var(${token})`
  host.append(probe)
  const value = getComputedStyle(probe).paddingLeft
  probe.remove()
  return value
}

function box(element: Element): string[] {
  const s = getComputedStyle(element)
  return [s.paddingInlineStart, s.marginBlockStart, s.marginBlockEnd]
}

async function mount<T extends HTMLElement & { updateComplete: Promise<unknown> }>(tag: string, setup: (element: T) => void = () => {}): Promise<T> {
  const element = document.createElement(tag) as T
  element.style.cssText = 'width:320px'
  setup(element)
  host.append(element)
  await element.updateComplete
  return element
}

describe('宿主按标签名重置排版', () => {
  it('问题列表：空提示留着零件的内边距；条目列表没有缺省缩进与外边距，条目不出圆点', async () => {
    const empty = await mount<XhDesignerIssuesElement>('xh-designer-issues')
    expect(box(empty.querySelector('[data-part="empty"]')!)).toEqual([px('--xh-space-3'), '0px', '0px'])

    const flat = await mount<XhDesignerIssuesElement>('xh-designer-issues', (element) => {
      element.items = items
    })
    const list = flat.querySelector('[data-part="list"]')!
    expect(box(list)).toEqual([px('--xh-space-1'), '0px', '0px'])
    expect(Array.from(list.children, child => getComputedStyle(child).display)).toEqual(['block', 'block'])

    const grouped = await mount<XhDesignerIssuesElement>('xh-designer-issues', (element) => {
      element.items = items
      element.groupBy = 'target'
    })
    const groups = Array.from(grouped.querySelectorAll('[data-part="group"]'))
    expect(groups.map(group => getComputedStyle(group).display)).toEqual(['block', 'block'])
    for (const nested of grouped.querySelectorAll('[data-part="group-items"]')) {
      expect(box(nested)).toEqual(['0px', '0px', '0px'])
      expect(Array.from(nested.children, child => getComputedStyle(child).display)).toEqual(['block'])
    }
  })

  it('物料面板与属性面板：空提示与字段说明没有缺省外边距，物料的空提示留着零件的内边距', async () => {
    const palette = await mount<XhDesignerPaletteElement>('xh-designer-palette')
    expect(box(palette.querySelector('[data-part="empty"]')!)).toEqual([px('--xh-space-3'), '0px', '0px'])

    const empty = await mount<XhDesignerPropertiesElement>('xh-designer-properties')
    expect(box(empty.querySelector('[data-part="empty"]')!).slice(1)).toEqual(['0px', '0px'])

    const properties = await mount<XhDesignerPropertiesElement>('xh-designer-properties', (element) => {
      element.hintOf = descriptor => `${descriptor.label} 的说明`
      element.targets = [{
        kind: 'node',
        id: 'n1',
        value: { name: '开始', open: true },
        descriptors: [
          { path: ['name'], control: { kind: 'text' }, label: '名称' },
          { path: ['open'], control: { kind: 'boolean' }, label: '开启' },
        ],
      }]
    })
    const hints = Array.from(properties.querySelectorAll('[data-xh-part="description"], [data-part="property-hint"]'))
    expect(hints.length).toBeGreaterThan(0)
    for (const hint of hints)
      expect(box(hint).slice(1)).toEqual(['0px', '0px'])
  })
})
