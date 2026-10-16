// 渲染成 button 的部件自带重置：本页只引令牌与皮肤，没有任何全局 reset。浏览器给 <button> 的缺省内衬、
// 边框、外边距与底色都不得留在库内按钮部件上，定尺小钮里的字形不被挤扁。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

const px = (value: string): number => Number.parseFloat(value)

async function render(node: ReactNode, font?: string): Promise<HTMLElement> {
  host = document.createElement('div')
  if (font)
    host.style.font = font
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(node))
  unmount = () => act(() => root.unmount())
  await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  return host
}

describe('按钮部件不吃浏览器缺省样式（React）', () => {
  it.each(['sm', 'md', 'lg'] as const)('%s 档标签的关闭钮：内衬为 0，叉按字号铺满，不被挤扁', async (size) => {
    const box0 = await render(
      <XhTagRoot size={size} closable open>
        <XhTagLabel>北京</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>,
    )
    const close = box0.querySelector<HTMLElement>('[data-scope="tag"][data-part="close-trigger"]')!
    const cs = getComputedStyle(close)
    expect([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]).toEqual(['0px', '0px', '0px', '0px'])
    const box = close.getBoundingClientRect()
    expect(box.width).toBeCloseTo(box.height, 1)
    const glyph = getComputedStyle(close, '::before')
    expect(px(glyph.width)).toBeCloseTo(px(cs.fontSize), 1)
    expect(px(glyph.width)).toBeLessThanOrEqual(box.width)
  })

  it('库内的裸按钮部件拿到重置后的基线：无内衬、无边框、无外边距、透明底、字体随页面', async () => {
    const box0 = await render(<button type="button" data-scope="probe" data-part="trigger">按钮</button>, '15px/1.6 serif')
    const cs = getComputedStyle(box0.querySelector('button')!)
    expect([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]).toEqual(['0px', '0px', '0px', '0px'])
    expect([cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth]).toEqual(['0px', '0px', '0px', '0px'])
    expect([cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft]).toEqual(['0px', '0px', '0px', '0px'])
    expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(cs.fontFamily).toBe(getComputedStyle(box0).fontFamily)
    expect(cs.fontSize).toBe('15px')
  })
})
