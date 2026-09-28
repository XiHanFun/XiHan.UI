// 浮层内搜索框排在树上方：树长到要滚时，搜索框与底部操作区得钉在树的上下沿不随行滚走，
// 所以滚动面是树、面板只是外壳；框自己不画边不画底，只在底下画一道分隔线，字号与行文字同档。
//
// 只有真实浏览器量得出来：谁在滚、框与页脚的位置、分隔线的粗细都是布局与计算样式的结果。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectFooter,
  XhTreeSelectInput,
  XhTreeSelectItem,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

// 四十个城市平铺，远超浮层封顶高度
const CITIES = Array.from({ length: 40 }, (_, index) => ({ value: `c${index}`, label: `城市 ${index}` }))

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='tree-select'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少树选择部件：${name}`)
  return element
}

async function mount(searchable: boolean): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '280px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhTreeSelectRoot, { collection: CITIES, searchable, defaultOpen: true }, () => [
      h(XhTreeSelectControl, null, () => h(XhTreeSelectTrigger, null, () => '选择城市')),
      h(XhTreeSelectPositioner, null, () => h(XhTreeSelectContent, null, () => [
        h(XhTreeSelectInput, { 'aria-label': '搜索城市' }),
        h(XhTreeSelectTree, null, () => CITIES.map(city => h(XhTreeSelectItem, { key: city.value, value: city.value }, () => city.label))),
        h(XhTreeSelectFooter, null, () => '共 40 个城市'),
      ])),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await expect.poll(() => part('content').getBoundingClientRect().height).toBeGreaterThan(0)
  await new Promise(resolve => requestAnimationFrame(resolve))
}

async function frame(): Promise<void> {
  await new Promise(resolve => requestAnimationFrame(resolve))
}

describe('树选择浮层内搜索', () => {
  it('树是滚动面：滚到底时搜索框与页脚钉在树的上下沿，面板自己不滚', async () => {
    await mount(true)
    const content = part('content')
    const tree = part('tree')
    const input = part('input')
    const footer = part('footer')

    expect(input.hidden).toBe(false)
    expect(input.getBoundingClientRect().bottom).toBeLessThanOrEqual(tree.getBoundingClientRect().top)
    expect(tree.scrollHeight).toBeGreaterThan(tree.clientHeight)

    const inputTop = input.getBoundingClientRect().top
    const footerTop = footer.getBoundingClientRect().top
    tree.scrollTop = tree.scrollHeight
    await frame()

    expect(tree.scrollTop).toBeGreaterThan(0)
    expect(content.scrollTop).toBe(0)
    expect(input.getBoundingClientRect().top).toBe(inputTop)
    expect(footer.getBoundingClientRect().top).toBe(footerTop)
    // 三段都在面板里：页脚底缘不越过面板底缘
    expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(content.getBoundingClientRect().bottom)
  })

  it('框不画边不画底，只在底下画一道分隔线；字号与行文字同档', async () => {
    await mount(true)
    const input = getComputedStyle(part('input'))
    const row = getComputedStyle(part('item'))

    expect(input.borderInlineStartWidth).toBe('0px')
    expect(input.borderBlockStartWidth).toBe('0px')
    expect(Number.parseFloat(input.borderBlockEndWidth)).toBeGreaterThan(0)
    expect(input.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(input.fontSize).toBe(row.fontSize)
  })

  it('没开搜索时搜索框带 hidden 不占位，滚动面仍是树', async () => {
    await mount(false)
    const content = part('content')
    const tree = part('tree')

    expect(part('input').getBoundingClientRect().height).toBe(0)
    expect(tree.scrollHeight).toBeGreaterThan(tree.clientHeight)
    expect(content.scrollHeight).toBe(content.clientHeight)
  })
})
