// 失效档的聚焦环不取被压过的前景墨；中性选中档同样使用公共环。
//
// 实心面那几档把 --xh-_ring-color 灌成 currentColor，环随面自己的前景色走。
// 同一个部件进了失效档时前景被换掉——行换成灰档、勾选把手换成透明（勾要藏起来）——
// 这时 currentColor 取到的是那支被换掉的墨，环跟着变灰或整根变透明。
// 失效档走 aria-disabled、仍是 roving 的锚点，焦点落得上去，所以这一圈得画得出来。
//
// 这一份把四档挂进页面、用键盘落焦，读算完的 outline-color：
// 失效档要吃公共层的默认环色，没失效的那几档仍取面自己的前景色。
// 通用那份判据（focus-ring-face-contrast）从皮肤推档位，推不出「另一条规则把 color 换掉」
// 这种叠加档，所以这四档在这儿单列。
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

/** 把一串颜色按从下到上的顺序叠在白底上，返回叠完的 sRGB 三分量。 */
function composite(layers: readonly string[]): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 1, 1)
  for (const layer of layers) {
    ctx.fillStyle = 'transparent'
    ctx.fillStyle = layer
    ctx.fillRect(0, 0, 1, 1)
  }
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0]!, d[1]!, d[2]!]
}

function luminance([r, g, b]: readonly [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** 环内侧那一摞色：从最外层祖先到元素自己的底色，透的那几层由下面一层透上来。 */
function insideStack(el: Element): string[] {
  const stack: string[] = []
  for (let node: Element | null = el; node; node = node.parentElement)
    stack.push(getComputedStyle(node).backgroundColor)
  return stack.reverse()
}

/** 任意 CSS 颜色写法（含 var()）算完之后的取值。 */
function resolve(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

let host: HTMLElement | null = null

function mount(markup: string): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  host.innerHTML = markup
  document.body.append(host)
  return host.querySelector<HTMLElement>('[data-anchor]')!
}

/** 先按一次真实按键把浏览器切进键盘模态，:focus-visible 才认后面的程序化聚焦。 */
let keyboardModality = false
async function focus(el: HTMLElement): Promise<void> {
  if (!keyboardModality) {
    await userEvent.tab()
    keyboardModality = true
  }
  el.focus()
  for (const animation of document.getAnimations()) {
    try {
      animation.finish()
    }
    catch {}
  }
  expect(el.matches(':focus-visible'), '焦点没落上去').toBe(true)
}

interface Tier {
  名: string
  markup: string
  /** 这一档吃默认环之后过不过 3:1；过不了的那几档另立一条判据钉住现状。 */
  达标: boolean
}

const 表格根 = (inner: string) => `<div data-scope="table" data-part="root">${inner}</div>`

const 失效档: Tier[] = [
  {
    名: 'table/row 选中且失效',
    markup: 表格根(`<div data-scope="table" data-part="body">
      <div data-scope="table" data-part="row" data-selected data-disabled tabindex="0" data-anchor>文</div>
    </div>`),
    达标: false,
  },
  {
    名: 'table/select-all-trigger 勾选且失效',
    markup: 表格根(`<button data-scope="table" data-part="select-all-trigger"
      data-state="checked" data-disabled aria-disabled="true" data-anchor></button>`),
    达标: true,
  },
  {
    名: 'table/column-visibility-trigger 勾选且失效',
    markup: 表格根(`<button data-scope="table" data-part="column-visibility-trigger"
      data-state="checked" data-disabled aria-disabled="true" data-anchor></button>`),
    达标: true,
  },
  {
    名: 'time-picker/item 失效',
    markup: `<div data-scope="time-picker" data-part="content">
      <div data-scope="time-picker" data-part="column">
        <div data-scope="time-picker" data-part="item" data-disabled data-highlighted
             tabindex="0" data-anchor>01</div>
      </div>
    </div>`,
    达标: true,
  },
]

const 实心档: Tier[] = [
  {
    名: 'table/row 选中未失效',
    markup: 表格根(`<div data-scope="table" data-part="body">
      <div data-scope="table" data-part="row" data-selected tabindex="0" data-anchor>文</div>
    </div>`),
    达标: true,
  },
  {
    名: 'table/select-all-trigger 勾选未失效',
    markup: 表格根(`<button data-scope="table" data-part="select-all-trigger"
      data-state="checked" data-anchor></button>`),
    达标: true,
  },
]

/* TimePicker 选中改由对号表达，落焦时铺中性实体底，不再属于反白实心面。 */
const 中性选中档: Tier[] = [
  {
    名: 'time-picker/item 对号选中',
    markup: `<div data-scope="time-picker" data-part="content">
      <div data-scope="time-picker" data-part="column">
        <div data-scope="time-picker" data-part="item" data-state="checked"
             tabindex="0" data-anchor>01</div>
      </div>
    </div>`,
    达标: true,
  },
]

const THEMES = ['light', 'dark'] as const
const 逐档 = (tiers: Tier[]) => tiers.flatMap(tier => THEMES.map(theme => ({ ...tier, theme, label: `${tier.名} · ${theme}` })))

afterEach(() => {
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
})

/** 落焦、量环：返回环色、这一档自己的前景墨、以及两者各自压在面上的对比。 */
async function measure(markup: string, theme: string) {
  document.documentElement.dataset.theme = theme
  document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
  document.body.style.color = 'var(--xh-fg-default)'
  const el = mount(markup)
  await focus(el)
  const style = getComputedStyle(el)
  const stack = insideStack(el)
  const face = composite(stack)
  return {
    环: style.outlineColor,
    墨: style.color,
    环压面: contrast(composite([...stack, style.outlineColor]), face),
    墨压面: contrast(composite([...stack, style.color]), face),
    默认环: resolve('var(--xh-ring-focus)'),
  }
}

describe('失效档的聚焦环', () => {
  it.each(逐档(失效档))('$label：环取公共层的默认色，不取被压过的前景墨', async ({ markup, theme }) => {
    const m = await measure(markup, theme)
    expect(m.环, `环 ${m.环}｜这一档的前景墨 ${m.墨}`).toBe(m.默认环)
  })

  it.each(逐档(失效档.filter(t => t.达标)))('$label：默认环压在这块面上过 3:1', async ({ markup, theme }) => {
    const m = await measure(markup, theme)
    expect(m.环压面, `环 ${m.环} 压面算出 ${m.环压面.toFixed(2)}`).toBeGreaterThanOrEqual(3)
  })

  it.each(逐档(失效档.filter(t => !t.达标)))('$label：默认环比那支前景墨看得出来，但这块面还差着', async ({ markup, theme }) => {
    const m = await measure(markup, theme)
    expect(m.环压面, `环 ${m.环} ${m.环压面.toFixed(2)}｜墨 ${m.墨} ${m.墨压面.toFixed(2)}`).toBeGreaterThan(m.墨压面)
    // 选中行的面（bg-subtle-active）与默认环之间浅色 2.52、深色 2.89，换环色换不出 3:1，
    // 过线要换这一档的面；这条在过线那天变红，好把它挪进上面那组
    expect(m.环压面).toBeLessThan(3)
  })

  it.each(逐档(中性选中档))('$label：中性焦点面使用公共环且过 3:1', async ({ markup, theme }) => {
    const m = await measure(markup, theme)
    expect(m.环).toBe(m.默认环)
    expect(m.环压面, `环压面算出 ${m.环压面.toFixed(2)}`).toBeGreaterThanOrEqual(3)
  })

  it.each(逐档(实心档))('$label：没失效的实心档仍取面自己的前景色', async ({ markup, theme }) => {
    const m = await measure(markup, theme)
    expect(m.环, `环 ${m.环}｜面自己的前景色 ${m.墨}`).toBe(m.墨)
    expect(m.环压面, `环压面算出 ${m.环压面.toFixed(2)}`).toBeGreaterThanOrEqual(3)
  })
})
