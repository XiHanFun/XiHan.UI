// 拖起与禁用的透明度只取状态令牌：拖起 --xh-state-dragging-opacity，禁用与「停下来的不定态」--xh-state-disabled-opacity。
// 组件不写自己的透明度散值：Sortable 此前拖起取 0.9、Splitter 禁用取 0.6、Progress 不定态的静态替代取 0.5，
// 同一种状态在不同组件里浓淡不一。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(markup: string, selector: string): Element {
  host = document.createElement('div')
  host.innerHTML = markup
  document.body.append(host)
  return host.querySelector(selector)!
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

describe('拖起与禁用的透明度', () => {
  it('sortable：拖起的那一项取拖起透明度', () => {
    const item = mount('<div data-scope="sortable" class="xh-scope-sortable" data-part="item" data-dragging></div>', '[data-part="item"]')
    expect(getComputedStyle(item).opacity).toBe(token('--xh-state-dragging-opacity'))
  })

  it('splitter：禁用的整块取禁用透明度', () => {
    const root = mount('<div data-scope="splitter" class="xh-scope-splitter" data-part="root" data-disabled></div>', '[data-part="root"]')
    expect(getComputedStyle(root).opacity).toBe(token('--xh-state-disabled-opacity'))
  })

  it('progress：减弱动效下不定态停成一条静态条，取禁用透明度', () => {
    const range = mount(`<div data-motion="reduce"><div data-scope="progress" class="xh-scope-progress" data-part="track">
      <div data-scope="progress" class="xh-scope-progress" data-part="range" data-state="indeterminate"></div></div></div>`, '[data-part="range"]')
    expect(getComputedStyle(range).opacity).toBe(token('--xh-state-disabled-opacity'))
  })
})
