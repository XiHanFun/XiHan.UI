// 下拉候选的高亮只用底色，不画环。
//
// 焦点恒在输入框上（这几家走 aria-activedescendant），候选并不真的持有焦点，
// 所以候选上那圈环画的不是「焦点在这儿」，而是把一个焦点记号借去当高亮用。
// 全库 21 份带候选的皮肤里，select / listbox / menu / command / tree 等 18 份一直只用底色，
// 只有这三份另画一圈——这一条钉住三家与其余同族一致。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 挂一个高亮态的候选，返回它算出来的样式。 */
function highlighted(scope: string, part: string): CSSStyleDeclaration {
  host?.remove()
  host = document.createElement('div')
  host.innerHTML = `<div data-scope="${scope}" data-part="${part}" data-highlighted>候选</div>`
  document.body.append(host)
  return getComputedStyle(host.firstElementChild!)
}

/** 底色与面色不同即视为「高亮看得出来」。 */
function 有底色(cs: CSSStyleDeclaration): boolean {
  const bg = cs.backgroundColor
  return bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'
}

const 同族 = [
  ['combobox', 'item'],
  ['mention', 'item'],
  ['cascader', 'search-item'],
] as const

describe('下拉候选的高亮', () => {
  it.each(同族)('%s 的 %s 高亮时不画环', (scope, part) => {
    const cs = highlighted(scope, part)
    expect(cs.outlineStyle).toBe('none')
  })

  it.each(同族)('%s 的 %s 高亮仍看得出来：底色变了', (scope, part) => {
    expect(有底色(highlighted(scope, part))).toBe(true)
  })

  it('与 select 同一口径：底色有、环没有', () => {
    const cs = highlighted('select', 'item')
    expect(有底色(cs)).toBe(true)
    expect(cs.outlineStyle).toBe('none')
  })
})
