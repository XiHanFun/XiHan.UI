// 区块与面板标题（heading-3：16 / 500）的行高同一支令牌 --xh-text-heading-3-leading（1.5，行框 24px）。
//
// 面板角上的关闭钮、通知的类型字形都按「标题那一行」的中线对齐；行高各取各的（1.25 / 1.5 / 1.625 / 继承），
// 同一档标题在 Card 里 20px、在 Dialog 里 24px、在 Descriptions 里 26px，换个容器就差一截。
import { afterEach, describe, expect, it } from 'vitest'
import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 取 heading-3 的标题部件：scope → 部件名。 */
const TITLES: Record<string, string> = {
  alert: 'title',
  card: 'title',
  descriptions: 'title',
  dialog: 'title',
  drawer: 'title',
  fieldset: 'legend',
  notification: 'item-title',
  tour: 'title',
}

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

describe('区块与面板标题的行高', () => {
  it.each(Object.entries(TITLES))('%s：16px 一行，行框 24px', (scope, part) => {
    host = document.createElement('div')
    host.innerHTML = `<div data-scope="${scope}" class="xh-scope-${scope}" data-part="${part}">账户安全</div>`
    document.body.append(host)
    const style = getComputedStyle(host.firstElementChild!)
    const size = tokenLength('--xh-text-heading-3-size')
    expect(style.fontSize).toBe(`${size}px`)
    expect(Number.parseFloat(style.lineHeight)).toBeCloseTo(size * 1.5, 2)
  })
})
