// 锚定面板的缩放原点：主轴贴着锚点那条边，交叉轴按 placement 的对齐取——start / end 对齐时
// 面板的起始缘 / 结束缘与锚点齐平，缩放从那一端涨开；居中对齐才从中线。
// 上下两侧的 start / end 是逻辑方向，RTL 下起始缘在右。transform-origin 的解析值只有真实浏览器算得出。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const scopes = ['popover', 'hover-card', 'popconfirm']
let positioner: HTMLElement | null = null

/** 搭一层定位层 + 面板：面板定尺 200 × 100，原点的解析值直接读成像素。 */
function mount(scope: string, placement: string, dir: 'ltr' | 'rtl'): HTMLElement {
  positioner = document.createElement('div')
  positioner.dataset.scope = scope
  positioner.classList.add(`xh-scope-${scope}`)
  positioner.dataset.part = 'positioner'
  positioner.dataset.placement = placement
  positioner.dir = dir
  const content = document.createElement('div')
  content.dataset.scope = scope
  content.classList.add(`xh-scope-${scope}`)
  content.dataset.part = 'content'
  content.style.cssText = 'width:200px;height:100px'
  positioner.append(content)
  document.body.append(positioner)
  return content
}

afterEach(() => {
  positioner?.remove()
  positioner = null
})

const EXPECTED: Array<[placement: string, ltr: string, rtl: string]> = [
  ['bottom-start', '0px 0px', '200px 0px'],
  ['bottom', '100px 0px', '100px 0px'],
  ['bottom-end', '200px 0px', '0px 0px'],
  ['top-start', '0px 100px', '200px 100px'],
  ['top-end', '200px 100px', '0px 100px'],
  ['right-start', '0px 0px', '0px 0px'],
  ['right', '0px 50px', '0px 50px'],
  ['right-end', '0px 100px', '0px 100px'],
  ['left-start', '200px 0px', '200px 0px'],
  ['left-end', '200px 100px', '200px 100px'],
]

describe.each(scopes)('%s：缩放原点按落定的那一侧与对齐取', (scope) => {
  it.each(EXPECTED)('%s', (placement, ltr, rtl) => {
    expect(getComputedStyle(mount(scope, placement, 'ltr')).transformOrigin).toBe(ltr)
    positioner!.remove()
    expect(getComputedStyle(mount(scope, placement, 'rtl')).transformOrigin).toBe(rtl)
  })
})
