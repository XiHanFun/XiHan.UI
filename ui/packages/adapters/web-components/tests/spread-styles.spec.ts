// @vitest-environment jsdom
// 连接层写的内联样式按「写过才撤」对账：这一帧不再给的撤掉，节点换了宿主由接管方撤掉前一台留下的，
// 交还时一并撤掉；作者自己写在节点上的内联样式始终不碰。
import { describe, expect, it } from 'vitest'
import { createSpreader } from '../src/dom/spread'

function node(style = ''): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('style', style)
  return el
}

describe('spread 的内联样式对账', () => {
  it('上一帧写过、这一帧给 undefined 的样式撤掉：位移归零时节点不该停在旧位移上', () => {
    const spreader = createSpreader()
    const el = node()
    spreader.spread(el, { style: { translate: '0px 48px', zIndex: '1' } })
    expect(el.style.translate).toBe('0px 48px')
    spreader.spread(el, { style: { translate: undefined, zIndex: undefined } })
    expect(el.style.translate).toBe('')
    expect(el.style.zIndex).toBe('')
  })

  it('没写过的键给 undefined 时不碰作者自己的内联样式', () => {
    const spreader = createSpreader()
    const el = node('inline-size: 200px')
    spreader.spread(el, { style: { inlineSize: undefined, translate: undefined } })
    expect(el.style.inlineSize).toBe('200px')
  })

  it('自定义属性同一条规则', () => {
    const spreader = createSpreader()
    const el = node()
    spreader.spread(el, { style: { '--xh-_x': '10px' } })
    expect(el.style.getPropertyValue('--xh-_x')).toBe('10px')
    spreader.spread(el, { style: { '--xh-_x': undefined } })
    expect(el.style.getPropertyValue('--xh-_x')).toBe('')
  })

  it('节点被挪进另一台宿主：接管方撤掉前一台留下、自己不再写的样式', () => {
    const from = createSpreader()
    const to = createSpreader()
    const el = node()
    from.spread(el, { style: { translate: '300px 0px' } })
    to.spread(el, { style: { translate: undefined } })
    expect(el.style.translate).toBe('')
    // 前一台随后交还：节点已归接管方，不再动它
    to.spread(el, { style: { translate: '4px' } })
    from.release(el)
    expect(el.style.translate).toBe('4px')
  })

  it('仍归自己时交还：写过的样式一并撤掉，作者的留着', () => {
    const spreader = createSpreader()
    const el = node('inline-size: 200px')
    spreader.spread(el, { style: { translate: '0px 48px' } })
    spreader.release(el)
    expect(el.style.translate).toBe('')
    expect(el.style.inlineSize).toBe('200px')
  })
})
