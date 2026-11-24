// 列表型候选面板的底栏：一行次级说明，13px、所在面的次要字色，不随尺寸档变。
//
// 底栏装的是「已选 3 项」「按 ↵ 打开」这类附注，比条目低一级：随档取控件字号（Cascader 此前是 14px）
// 会与条目一样大，取说明档 12px（Command 此前）又比日期面板的快捷项还小。
import { afterEach, describe, expect, it } from 'vitest'
import { tokenLength, tokenValue } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 各家底栏所在面的次要字色：frosted 浮层取材质的 muted，floating 与 sheet 取 --xh-fg-muted。 */
const FOOTERS = {
  'select': '--xh-material-frosted-fg-muted',
  'tree-select': '--xh-material-frosted-fg-muted',
  'cascader': '--xh-fg-muted',
  'command': '--xh-fg-muted',
} as const

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

describe('列表型候选面板的底栏', () => {
  it.each(Object.entries(FOOTERS))('%s：13px、所在面的次要字色', (scope, muted) => {
    host = document.createElement('div')
    host.innerHTML = `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="footer">已选 3 项</div>`
    document.body.append(host)
    const style = getComputedStyle(host.firstElementChild!)
    expect(style.fontSize).toBe(`${tokenLength('--xh-text-secondary-size')}px`)
    expect(style.color).toBe(tokenValue('color', muted))
  })
})
