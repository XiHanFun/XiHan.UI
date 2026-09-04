// 聚焦环由公共层统一画：键盘焦点落在任何一个库节点上都出环，组件只在需要时改偏移或撤掉环。
// 三档各查一个代表：默认档（外沿）、内收档（组件把 --xh-_ring-offset 灌成内收值）、
// 撤掉档（组件自己写 outline: none）。
//
// 判据只看级联算出来的取值，所以直接摆带 data-scope / data-part 的裸节点：皮肤是纯 CSS，
// 认的就是这两个属性。焦点用真实的 Tab 键送过去——:focus-visible 只在键盘模态下匹配，
// 程序化 focus() 命不命中要看引擎的启发式。
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 摆一个带解剖属性的裸节点，用 Tab 把焦点送上去。 */
async function focusVisible(scope: string, part: string, tag = 'button'): Promise<HTMLElement> {
  host = document.createElement('div')
  const el = document.createElement(tag)
  el.dataset.scope = scope
  el.dataset.part = part
  el.tabIndex = 0
  host.append(el)
  document.body.append(host)

  await userEvent.tab()
  if (document.activeElement !== el)
    throw new Error(`Tab 没落到探针上，落在了 ${document.activeElement?.tagName}`)
  return el
}

/** --xh-ring-focus 算完之后的那个颜色串，用来与 outline-color 对拍。 */
function ringFocusColor(): string {
  const probe = document.createElement('span')
  probe.style.color = 'var(--xh-ring-focus)'
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('聚焦环公共层', () => {
  it('默认档：任何库节点键盘落焦都出环，粗细与颜色走令牌，偏移在外沿', async () => {
    const el = await focusVisible('button', 'root')
    const style = getComputedStyle(el)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineWidth).toBe('2px')
    expect(style.outlineOffset).toBe('2px')
    expect(style.outlineColor).toBe(ringFocusColor())
  })

  it('公共层管到没有自己写过聚焦规则的部件', async () => {
    const el = await focusVisible('card', 'root', 'div')
    const style = getComputedStyle(el)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineOffset).toBe('2px')
  })

  it('内收档：组件灌了 --xh-_ring-offset，环画在内沿，环本身仍来自公共层', async () => {
    const el = await focusVisible('menu', 'item', 'div')
    const style = getComputedStyle(el)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineWidth).toBe('2px')
    expect(style.outlineOffset).toBe('-2px')
    expect(style.outlineColor).toBe(ringFocusColor())
  })

  it('撤掉档：组件自己写的 outline: none 压得过公共层', async () => {
    const el = await focusVisible('menu', 'content', 'div')
    expect(getComputedStyle(el).outlineStyle).toBe('none')
  })
})
