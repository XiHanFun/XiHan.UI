// 下拉候选的高亮只用底色，不画环。
//
// 焦点恒在输入框上（这几家走 aria-activedescendant），候选并不真的持有焦点，
// 所以候选上那圈环画的不是「焦点在这儿」，而是把一个焦点记号借去当高亮用。
// 全库 21 份带候选的皮肤里，select / listbox / menu / command / tree 等 18 份一直只用底色，
// 只有这三份另画一圈——这一条钉住三家与其余同族一致。
// 四家的候选行都已接入 Collection Item 家族：高亮底与环由家族按 data-highlighted 解算，
// 皮肤只把环槽映射成透明，所以夹具要带家族属性，环的判据是「看不见」（style none 或颜色全透明）。
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
  host.innerHTML = `<div data-scope="${scope}" data-part="${part}" data-xh-collection-item data-xh-collection-size="md" data-xh-collection-context="overlay" data-highlighted>候选</div>`
  document.body.append(host)
  return getComputedStyle(host.firstElementChild!)
}

/** 环看不见：没画，或者画了但颜色全透明。 */
function 无环(cs: CSSStyleDeclaration): boolean {
  if (cs.outlineStyle === 'none' || Number.parseFloat(cs.outlineWidth) === 0)
    return true
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = cs.outlineColor
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3] === 0
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
    expect(无环(cs)).toBe(true)
  })

  it.each(同族)('%s 的 %s 高亮仍看得出来：底色变了', (scope, part) => {
    expect(有底色(highlighted(scope, part))).toBe(true)
  })

  it('与 select 同一口径：底色有、环没有', () => {
    const cs = highlighted('select', 'item')
    expect(有底色(cs)).toBe(true)
    expect(无环(cs)).toBe(true)
  })
})
