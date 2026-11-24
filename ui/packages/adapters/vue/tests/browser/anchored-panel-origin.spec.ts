// 锚定面板的缩放原点：主轴贴着锚点那条边，交叉轴按 placement 的对齐取——start / end 对齐时
// 面板的起始缘 / 结束缘与锚点齐平，缩放从那一端涨开；居中对齐才从中线。
// 上下两侧的 start / end 是逻辑方向，RTL 下起始缘在右。transform-origin 的解析值只有真实浏览器算得出。
// 弹层只有一套进出场，原点也只有一套：落位到原点的映射写在定位层公共层里，全部锚定弹层共用。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 锚定弹层：scope → 播进场的那个部件（缺省 content）与它身上要带的属性。 */
const SCOPES: Array<[scope: string, part: string, attrs: Record<string, string>]> = [
  ['popover', 'content', {}],
  ['hover-card', 'content', {}],
  ['popconfirm', 'content', {}],
  ['tooltip', 'content', {}],
  ['menu', 'content', {}],
  ['context-menu', 'content', {}],
  ['menubar', 'content', {}],
  ['select', 'content', {}],
  ['combobox', 'content', {}],
  ['tree-select', 'content', {}],
  ['cascader', 'content', {}],
  ['mention', 'content', {}],
  ['expression-input', 'content', {}],
  ['date-picker', 'content', {}],
  ['date-range-picker', 'content', {}],
  ['time-picker', 'content', {}],
  ['time-range-picker', 'content', {}],
  ['color-picker', 'content', {}],
  ['pagination', 'content', {}],
  ['citation', 'preview', { previewMode: 'hover' }],
  ['side-nav', 'branch-content', { popout: '' }],
]
let positioner: HTMLElement | null = null

/** 搭一层定位层 + 面板：面板定尺 200 × 100，原点的解析值直接读成像素。 */
function mount([scope, part, attrs]: (typeof SCOPES)[number], placement: string, dir: 'ltr' | 'rtl'): HTMLElement {
  positioner = document.createElement('div')
  positioner.dataset.scope = scope
  positioner.classList.add(`xh-scope-${scope}`)
  positioner.dataset.part = 'positioner'
  positioner.dataset.placement = placement
  positioner.dir = dir
  const content = document.createElement('div')
  content.dataset.scope = scope
  content.classList.add(`xh-scope-${scope}`)
  content.dataset.part = part
  Object.assign(content.dataset, attrs)
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

describe.each(SCOPES)('%s：缩放原点按落定的那一侧与对齐取', (...entry) => {
  it.each(EXPECTED)('%s', (placement, ltr, rtl) => {
    expect(getComputedStyle(mount(entry, placement, 'ltr')).transformOrigin).toBe(ltr)
    positioner!.remove()
    expect(getComputedStyle(mount(entry, placement, 'rtl')).transformOrigin).toBe(rtl)
  })
})
