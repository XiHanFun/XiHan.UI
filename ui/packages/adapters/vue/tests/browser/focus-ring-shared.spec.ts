import { afterEach, describe, expect, it } from 'vitest'
// 聚焦环由公共层统一画，两层（设计真源 §7.2 第 5 条）：1px 品牌内圈（outline，偏移 0，贴着边框外沿）
// + 3px 品牌 30% 光环（box-shadow）。环压在承载面上，实心面上也不换环色；关环的部件连光环一起关。
// 这一份各查一个代表：默认档、没写过聚焦规则的部件、实心动作控件（悬停与按下时光环不让位）、关环档、
// 字段外壳（描边就是内圈，再画光环，盒里的输入框不另画环）。
//
// 判据只看级联算出来的取值，所以直接摆带 data-scope / data-part 的裸节点：皮肤是纯 CSS，
// 认的就是这两个属性。焦点用真实的 Tab 键送过去——:focus-visible 只在键盘模态下匹配，
// 程序化 focus() 命不命中要看引擎的启发式。
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** 摆一段带解剖属性的标记，用 Tab 把焦点送到 target 选中的那个节点上。 */
async function focusVisible(html: string, target = '[tabindex], button, input'): Promise<HTMLElement> {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  const el = host.querySelector<HTMLElement>(target)!
  await userEvent.tab()
  if (document.activeElement !== el)
    throw new Error(`Tab 没落到探针上，落在了 ${document.activeElement?.tagName}`)
  return el
}

/** 实心按钮：与连接层投影一致带上 Action Control 家族标记。 */
const SOLID_BUTTON = `<button type="button" data-scope="button" data-part="root" class="xh-scope-button" data-variant="solid"
  data-xh-action-control data-xh-action-profile="text" data-xh-action-display="always" data-xh-action-size="md" data-xh-action-variant="solid">发布</button>`

/** 令牌写进某个属性后算出来的值，与 getComputedStyle 读回的同一格式。 */
function resolved(property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  document.body.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

const ringColor = (): string => resolved('color', 'var(--xh-ring-focus)')
/** 公共层与动作控件的光环：从边框外沿铺开，扩散 = 内圈宽 + 光环宽。 */
const halo = (): string => resolved('box-shadow', '0 0 0 calc(var(--xh-ring-width) + var(--xh-ring-halo-width)) var(--xh-ring-halo)')
/** 字段外壳的光环：内圈就是描边，光环直接从描边外沿铺开。 */
const fieldHalo = (): string => resolved('box-shadow', '0 0 0 var(--xh-ring-halo-width) var(--xh-ring-halo)')

describe('聚焦环公共层', () => {
  it('默认档：1px 品牌内圈贴着边框外沿画，外面一圈 30% 品牌光环；落焦前后盒子一样大', async () => {
    host = document.createElement('div')
    host.innerHTML = '<button type="button" data-scope="button" data-part="root" class="xh-scope-button">取消</button>'
    document.body.append(host)
    const el = host.querySelector('button')!
    const before = el.getBoundingClientRect()
    host.remove()
    const focused = await focusVisible('<button type="button" data-scope="button" data-part="root" class="xh-scope-button">取消</button>')
    const style = getComputedStyle(focused)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineWidth).toBe('1px')
    expect(style.outlineOffset).toBe('0px')
    expect(style.outlineColor).toBe(ringColor())
    expect(style.boxShadow).toBe(halo())
    const after = focused.getBoundingClientRect()
    expect([after.width, after.height]).toEqual([before.width, before.height])
  })

  it('公共层管到没有自己写过聚焦规则的部件', async () => {
    const el = await focusVisible('<kbd data-scope="kbd" data-part="root" class="xh-scope-kbd" tabindex="0">Ctrl</kbd>')
    const style = getComputedStyle(el)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineOffset).toBe('0px')
    expect(style.boxShadow).toBe(halo())
  })

  it('实心面上环色不变：内圈压在承载面上，仍是库环，不随面取前景色', async () => {
    const el = await focusVisible(SOLID_BUTTON)
    const style = getComputedStyle(el)
    expect(style.outlineColor).toBe(ringColor())
    expect(style.outlineColor).not.toBe(style.color)
    expect(style.boxShadow).toBe(halo())
  })

  it('动作控件悬停与按下照常换面，光环不让位', async () => {
    const el = await focusVisible(SOLID_BUTTON)
    await userEvent.hover(el)
    expect(getComputedStyle(el).boxShadow).toBe(halo())
    el.setAttribute('data-pressed', '')
    expect(getComputedStyle(el).boxShadow).toBe(halo())
  })

  it('关环档：组件写的 outline: none 压得过公共层，光环一起关掉', async () => {
    const el = await focusVisible('<div data-scope="menu" data-part="content" class="xh-scope-menu" tabindex="0">菜单</div>')
    const style = getComputedStyle(el)
    expect(style.outlineStyle).toBe('none')
    expect(style.boxShadow).not.toBe(halo())
  })

  it('字段外壳：描边换成聚焦色就是内圈，再画光环；盒里的输入框不另画环', async () => {
    const input = await focusVisible(`<div data-scope="text-field" data-part="control" class="xh-scope-text-field" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
      <input data-scope="text-field" data-part="input" class="xh-scope-text-field" data-xh-field-input>
    </div>`, 'input')
    const chrome = input.parentElement!
    // 描边换色走 micro 淡变（光环与内圈即时出现），等它走完再读终值
    await new Promise(resolve => setTimeout(resolve, 250))
    expect(getComputedStyle(chrome).borderTopColor).toBe(resolved('color', 'var(--xh-border-control-focus)'))
    expect(getComputedStyle(chrome).boxShadow).toBe(fieldHalo())
    expect(getComputedStyle(chrome).outlineStyle).toBe('none')
    expect(getComputedStyle(input).outlineStyle).toBe('none')
    expect(getComputedStyle(input).boxShadow).toBe('none')
  })

  it('字段静息是白底：缺省与承载面同色，边界由字段描边承担', () => {
    host = document.createElement('div')
    host.innerHTML = '<div data-scope="text-field" data-part="control" class="xh-scope-text-field" data-xh-field-chrome data-xh-field-size="md"></div>'
    document.body.append(host)
    const chrome = host.firstElementChild!
    expect(getComputedStyle(chrome).backgroundColor).toBe(resolved('background-color', 'var(--xh-bg-surface)'))
    expect(getComputedStyle(chrome).borderTopColor).toBe(resolved('color', 'var(--xh-border-control)'))
  })
})
