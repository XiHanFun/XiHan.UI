// 渲染成 button 的部件自带重置：本页只引令牌与皮肤，没有任何全局 reset。浏览器给 <button> 的缺省内衬、
// 边框、外边距与底色都不得留在库内按钮部件上，定尺小钮里的字形不被挤扁。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(): Promise<void> {
  await Promise.resolve()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

const px = (value: string): number => Number.parseFloat(value)

describe('按钮部件不吃浏览器缺省样式（Web Components）', () => {
  it.each(['sm', 'md', 'lg'])('%s 档标签的关闭钮：内衬为 0，叉按字号铺满，不被挤扁', async (size) => {
    host = document.createElement('div')
    host.innerHTML = `
      <xh-tag size="${size}" closable open>
        <span data-xh-part="root"><span data-xh-part="label">北京</span><button data-xh-part="close-trigger"></button></span>
      </xh-tag>`
    document.body.append(host)
    await settle()
    const close = host.querySelector<HTMLElement>('[data-scope="tag"][data-part="close-trigger"]')!
    const cs = getComputedStyle(close)
    expect([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]).toEqual(['0px', '0px', '0px', '0px'])
    const box = close.getBoundingClientRect()
    expect(box.width).toBeCloseTo(box.height, 1)
    const glyph = getComputedStyle(close, '::before')
    expect(px(glyph.width)).toBeCloseTo(px(cs.fontSize), 1)
    expect(px(glyph.width)).toBeLessThanOrEqual(box.width)
  })

  it('库内的裸按钮部件拿到重置后的基线：无内衬、无边框、无外边距、透明底、字体随页面', async () => {
    host = document.createElement('div')
    host.style.font = '15px/1.6 serif'
    host.innerHTML = '<button data-scope="probe" data-part="trigger">按钮</button>'
    document.body.append(host)
    const button = host.querySelector('button')!
    const cs = getComputedStyle(button)
    expect([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]).toEqual(['0px', '0px', '0px', '0px'])
    expect([cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth]).toEqual(['0px', '0px', '0px', '0px'])
    expect([cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft]).toEqual(['0px', '0px', '0px', '0px'])
    expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(cs.fontFamily).toBe(getComputedStyle(host).fontFamily)
    expect(cs.fontSize).toBe('15px')
    expect(cs.lineHeight).toBe(getComputedStyle(host).lineHeight)
  })

  it('宿主页面自己的按钮不受影响：没有 data-scope 的 <button> 保留浏览器缺省', async () => {
    host = document.createElement('div')
    host.innerHTML = '<button>页面自己的按钮</button>'
    document.body.append(host)
    const cs = getComputedStyle(host.querySelector('button')!)
    expect(cs.paddingLeft).not.toBe('0px')
    expect(cs.borderTopStyle).not.toBe('none')
  })
})
