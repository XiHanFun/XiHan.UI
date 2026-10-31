import { afterEach, describe, expect, it } from 'vitest'
// 聚焦环由公共层统一画（设计真源 §7.2 第 5 条）：一道 2px 品牌实线（outline，偏移负一个环宽），画在元素自己的盒内，
// 外沿与边框外沿重合。环外侧贴着承载面，实心面上也不换环色，改在环内侧衬一道 1px 底色间隔线（inset box-shadow）。
// 这一份各查一个代表：默认档、没写过聚焦规则的部件、实心动作控件（间隔线；悬停与按下时不让位）、关环档、
// 字段外壳（换色的描边加内侧 inset 线合起来一个环宽，盒里的输入框不另画环）。
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

/** 实心按钮：与连接层投影一致带上 Action Control 家族标记与实心面标记。 */
const SOLID_BUTTON = `<button type="button" data-scope="button" data-part="root" class="xh-scope-button" data-variant="solid"
  data-xh-action-control data-xh-action-profile="text" data-xh-action-display="always" data-xh-action-size="md" data-xh-action-variant="solid" data-xh-ink-surface>发布</button>`

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
/** 实心动作控件的间隔线：inset 从 1px 描边以内铺起，铺满环宽加线宽、扣掉描边宽，正好落在环的正内侧。 */
const actionGap = (): string => resolved('box-shadow', 'inset 0 0 0 calc(var(--xh-ring-width) + var(--xh-ring-gap-width) - var(--xh-stroke-thin)) var(--xh-ring-gap)')
/** 字段外壳的环：描边换色，内侧补一道 inset 线，两者合起来一个环宽。 */
const fieldRing = (): string => resolved('box-shadow', 'inset 0 0 0 calc(var(--xh-ring-width) - var(--xh-stroke-thin)) var(--xh-border-control-focus)')

describe('聚焦环公共层', () => {
  it('默认档：2px 品牌实线画在盒内，外沿与边框外沿重合；落焦前后盒子一样大，非实心面不衬间隔线', async () => {
    host = document.createElement('div')
    host.innerHTML = '<button type="button" data-scope="button" data-part="root" class="xh-scope-button">取消</button>'
    document.body.append(host)
    const el = host.querySelector('button')!
    const before = el.getBoundingClientRect()
    host.remove()
    const focused = await focusVisible('<button type="button" data-scope="button" data-part="root" class="xh-scope-button">取消</button>')
    const style = getComputedStyle(focused)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineWidth).toBe('2px')
    expect(style.outlineOffset).toBe('-2px')
    expect(style.outlineColor).toBe(ringColor())
    // 公共层那道间隔线没开时是透明的
    expect(style.boxShadow).toMatch(/^rgba\(0, 0, 0, 0\) /)
    const after = focused.getBoundingClientRect()
    expect([after.width, after.height]).toEqual([before.width, before.height])
  })

  it('公共层管到没有自己写过聚焦规则的部件', async () => {
    const el = await focusVisible('<kbd data-scope="kbd" data-part="root" class="xh-scope-kbd" tabindex="0">Ctrl</kbd>')
    const style = getComputedStyle(el)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineWidth).toBe('2px')
    expect(style.outlineOffset).toBe('-2px')
  })

  it('实心面上环色不变，环内侧衬一道底色间隔线', async () => {
    const el = await focusVisible(SOLID_BUTTON)
    const style = getComputedStyle(el)
    expect(style.outlineColor).toBe(ringColor())
    expect(style.outlineColor).not.toBe(style.color)
    expect(style.boxShadow).toBe(actionGap())
  })

  it('动作控件悬停与按下照常换面，间隔线不让位', async () => {
    const el = await focusVisible(SOLID_BUTTON)
    await userEvent.hover(el)
    expect(getComputedStyle(el).boxShadow).toBe(actionGap())
    el.setAttribute('data-pressed', '')
    expect(getComputedStyle(el).boxShadow).toBe(actionGap())
  })

  it('间隔线只作用于写它的那个节点：实心面里的后代落焦时不衬', async () => {
    const el = await focusVisible(`<div data-scope="tag" data-part="root" class="xh-scope-tag" data-variant="solid" data-xh-ink-surface>
      <button type="button" data-scope="tag" data-part="close-trigger" class="xh-scope-tag">×</button>
    </div>`, 'button')
    expect(getComputedStyle(el.parentElement!).getPropertyValue('--xh-_ring-gap').trim(), '实心标签自己没开间隔线').not.toBe('')
    expect(getComputedStyle(el).getPropertyValue('--xh-_ring-gap').trim()).toBe('')
    expect(getComputedStyle(el).boxShadow).not.toBe(actionGap())
  })

  it('关环档：组件写的 outline: none 压得过公共层', async () => {
    const el = await focusVisible('<div data-scope="menu" data-part="content" class="xh-scope-menu" tabindex="0">菜单</div>')
    expect(getComputedStyle(el).outlineStyle).toBe('none')
  })

  it('字段外壳：描边换成聚焦色、内侧补一道 inset 线，合起来一个环宽；盒里的输入框不另画环', async () => {
    const input = await focusVisible(`<div data-scope="text-field" data-part="control" class="xh-scope-text-field" data-xh-field-chrome data-xh-field-size="md" data-variant="outline">
      <input data-scope="text-field" data-part="input" class="xh-scope-text-field" data-xh-field-input>
    </div>`, 'input')
    const chrome = input.parentElement!
    // 描边换色走 micro 淡变（inset 线即时出现），等它走完再读终值
    await new Promise(resolve => setTimeout(resolve, 250))
    expect(getComputedStyle(chrome).borderTopColor).toBe(resolved('color', 'var(--xh-border-control-focus)'))
    expect(getComputedStyle(chrome).boxShadow).toBe(fieldRing())
    expect(getComputedStyle(chrome).outlineStyle).toBe('none')
    expect(getComputedStyle(input).outlineStyle).toBe('none')
    expect(getComputedStyle(input).boxShadow).toBe('none')
  })

  it('字段外壳校验失败又聚焦：聚焦态胜出，描边与 inset 线都是聚焦色', async () => {
    const input = await focusVisible(`<div data-scope="text-field" data-part="control" class="xh-scope-text-field" data-xh-field-chrome data-xh-field-size="md" data-variant="outline" data-invalid>
      <input data-scope="text-field" data-part="input" class="xh-scope-text-field" data-xh-field-input>
    </div>`, 'input')
    const chrome = input.parentElement!
    await new Promise(resolve => setTimeout(resolve, 250))
    expect(getComputedStyle(chrome).borderTopColor).toBe(resolved('color', 'var(--xh-border-control-focus)'))
    expect(getComputedStyle(chrome).boxShadow).toBe(fieldRing())
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
