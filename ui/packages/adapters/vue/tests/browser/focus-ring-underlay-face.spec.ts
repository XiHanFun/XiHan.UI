// 环内侧那块面不长在部件自己身上的那几档。
//
// 聚焦环往内收一个环宽（--xh-ring-offset = 负一个环宽），外沿与元素边框外沿重合，
// 环内侧紧挨着的就是「这块地方画出来的底」。部件自己 background: transparent 时，
// 那块底来自别处，两种来路都在 focus-ring-face-contrast 的量法之外——那一份只顺着
// parentElement 往上叠底色：
//   · 分段控件的选中段：底是指示器，一个绝对定位、与选中段同一块矩形的兄弟节点
//   · 标签组里实心标签上的摘除钮：标签是 tag 的 root，叉是它的 close-trigger，底是外面那枚标签，
//     祖先链上叠得到，但那一份没有「同一个元素上形态与状态两条规则叠出来的档」这种组合
//
// 量法与 focus-ring-face-contrast 一致：把环色叠在环内侧那一摞底上，按 WCAG 2.2
// SC 1.4.11 的非文本对比算比值，阈值 3:1。
import { userEvent } from '@vitest/browser/context'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// ── 颜色 ──

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

/** 把一串颜色按从下到上的顺序叠在白底上，返回叠完的 sRGB 三分量。 */
function composite(layers: readonly string[]): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 1, 1)
  for (const layer of layers) {
    // 取值解析不了时 fillStyle 保持不变，先置透明，免得把上一层重画一遍
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

/** 任意 CSS 颜色写法（含 var()）算完之后的取值：画布不认变量，先让引擎算一遍。 */
function resolve(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/**
 * 环内侧那一摞色，从下往上：祖先链的底色、垫在自己与父节点之间的那几层、自己的底色。
 * 描边不计——环往内收一个环宽，正好把与环同厚或更细的那圈描边盖在底下。
 */
function insideStack(el: Element, underlay: readonly Element[] = []): string[] {
  const chain: string[] = []
  for (let node: Element | null = el.parentElement; node; node = node.parentElement)
    chain.push(getComputedStyle(node).backgroundColor)
  return [
    ...chain.reverse(),
    ...underlay.map(node => getComputedStyle(node).backgroundColor),
    getComputedStyle(el).backgroundColor,
  ]
}

/** 环压着面的比值，连同一句写明两侧取值的说明。 */
function 环压面(el: HTMLElement, underlay: readonly Element[] = []): { ratio: number, 说明: string } {
  const stack = insideStack(el, underlay)
  const face = composite(stack)
  const style = getComputedStyle(el)
  const ring = composite([...stack, style.outlineColor])
  return {
    ratio: contrast(ring, face),
    说明: `环 ${style.outlineColor}｜环内侧算完是 rgb(${face})`,
  }
}

// ── 挂载 ──

const TONES = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const
const THEMES = ['light', 'dark'] as const
type Theme = (typeof THEMES)[number]

let host: HTMLElement | null = null

/** 给页面铺上本主题的底与字：透空的面透到最后透出来的就是这块底。 */
function paintPage(): void {
  document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
  document.body.style.color = 'var(--xh-fg-default)'
}

/** 把在跑的过渡推到终点：面与指示器的几何都带过渡，读到的不该是插值中的那一帧。 */
function settle(): void {
  for (const animation of document.getAnimations()) {
    try {
      animation.finish()
    }
    catch {}
  }
}

/** 先按一次真实按键把浏览器切进键盘模态，:focus-visible 才认后面的程序化聚焦。 */
let keyboardModality = false
async function focus(el: HTMLElement): Promise<void> {
  if (!keyboardModality) {
    await userEvent.tab()
    keyboardModality = true
  }
  el.focus()
  settle()
}

function mount(html: string): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

beforeEach(() => {
  paintPage()
})

afterEach(() => {
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
})

/**
 * 一条分段控件，指示器按选中段的矩形摆好。
 * 位置与尺寸在真实组件里由连接层量出来写成内联样式（resolveSegmentedIndicator 取的就是
 * 选中段的 rect），皮肤只给了没量到时的落点；这里照同一条做一遍。
 */
function 分段(tone: string | null, 带指示器 = true): { root: HTMLElement, item: HTMLElement, indicator: HTMLElement | null } {
  const root = mount(`
    <div data-scope="segmented" data-part="root" data-orientation="horizontal"${tone ? ` data-tone="${tone}"` : ''}>
      ${带指示器 ? '<span data-scope="segmented" data-part="indicator"></span>' : ''}
      <button type="button" data-scope="segmented" data-part="item" data-state="checked">甲</button>
      <button type="button" data-scope="segmented" data-part="item">乙</button>
    </div>`)
  const item = root.querySelector<HTMLElement>('[data-part=\'item\'][data-state=\'checked\']')!
  const indicator = root.querySelector<HTMLElement>('[data-part=\'indicator\']')
  if (!indicator) {
    settle()
    return { root, item, indicator }
  }
  const box = item.getBoundingClientRect()
  const track = root.getBoundingClientRect()
  // 绝对定位的偏移量的起算点是包含块的内边距盒，轨道那圈描边要减掉
  indicator.style.setProperty('--xh-_segmented-indicator-x', `${box.left - track.left - root.clientLeft}px`)
  indicator.style.setProperty('--xh-_segmented-indicator-y', `${box.top - track.top - root.clientTop}px`)
  indicator.style.setProperty('--xh-_segmented-indicator-w', `${box.width}px`)
  indicator.style.setProperty('--xh-_segmented-indicator-h', `${box.height}px`)
  settle()
  return { root, item, indicator }
}

/** 标签组里的一枚实心标签（tag 的 root），标签里带一颗摘除钮（tag 的 close-trigger）。 */
function 标签(attrs: string): { item: HTMLElement, 叉: HTMLElement } {
  const root = mount(`
    <div data-scope="tag-group" data-part="root">
      <div data-scope="tag-group" data-part="list">
        <span data-scope="tag" data-part="root" data-variant="solid" data-selectable data-deletable ${attrs} tabindex="0">
          <span data-scope="tag-group" data-part="cell">
            <span data-scope="tag" data-part="label">甲</span>
            <button type="button" data-scope="tag" data-part="close-trigger"></button>
          </span>
        </span>
      </div>
    </div>`)
  return {
    item: root.querySelector<HTMLElement>('[data-scope=\'tag\'][data-part=\'root\']')!,
    叉: root.querySelector<HTMLElement>('[data-part=\'close-trigger\']')!,
  }
}

const 档位: { theme: Theme, tone: string | null }[] = THEMES.flatMap(theme =>
  [null, ...TONES].map(tone => ({ theme, tone })),
)
const 标注 = ({ theme, tone }: { theme: Theme, tone: string | null }) => `${tone ?? '无语气'} · ${theme}`

describe('环内侧那块面不长在部件自己身上', () => {
  it('量得准：一对已知的色算出来就是已知的比值', () => {
    // brand-500 的环压在 brand-600 的实心面上，环整根看不出来
    expect(contrast(composite([resolve('var(--xh-color-brand-500)')]), composite([resolve('var(--xh-color-brand-600)')]))).toBeLessThan(2)
    // 同一块面上换成配对的前景色，环立刻读得出来
    expect(contrast(composite([resolve('var(--xh-fg-on-brand)')]), composite([resolve('var(--xh-color-brand-600)')]))).toBeGreaterThanOrEqual(3)
  })

  it('判据前提：指示器与选中段占同一块矩形，选中段自己透空', () => {
    const { item, indicator } = 分段(null)
    const a = item.getBoundingClientRect()
    const b = indicator!.getBoundingClientRect()
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    for (const [名, x, y] of [['left', a.left, b.left], ['top', a.top, b.top], ['width', a.width, b.width], ['height', a.height, b.height]] as const)
      expect(Math.abs(x - y), `指示器与选中段的 ${名} 对不上`).toBeLessThan(1)
  })

  it.each(档位)('分段控件的选中段压着指示器那块底 · $tone · $theme', async ({ theme, tone }) => {
    document.documentElement.dataset.theme = theme
    const { item, indicator } = 分段(tone)
    await focus(item)
    expect(item.matches(':focus-visible'), '焦点没落上去').toBe(true)
    const { ratio, 说明 } = 环压面(item, [indicator!])
    expect(ratio, `${标注({ theme, tone })}｜${说明}`).toBeGreaterThanOrEqual(3)
  })

  // 指示器是可选部件：作者写默认插槽自己铺部件时可以不渲染它，选中段就直接坐在轨道底上。
  // 那一档的面不是指示器那块实心底，环不跟着选中段的前景走
  it.each(档位)('没渲染指示器时选中段坐在轨道底上 · $tone · $theme', async ({ theme, tone }) => {
    document.documentElement.dataset.theme = theme
    const { item } = 分段(tone, false)
    await focus(item)
    const { ratio, 说明 } = 环压面(item)
    expect(getComputedStyle(item).outlineColor, 说明).toBe(resolve('var(--xh-ring-focus)'))
    expect(ratio, `${标注({ theme, tone })}｜${说明}`).toBeGreaterThanOrEqual(3)
  })

  it.each(档位)('实心标签上的摘除钮压着标签那块底 · $tone · $theme', async ({ theme, tone }) => {
    document.documentElement.dataset.theme = theme
    const { 叉 } = 标签(tone ? `data-tone="${tone}"` : '')
    await focus(叉)
    expect(叉.matches(':focus-visible'), '焦点没落上去').toBe(true)
    const { ratio, 说明 } = 环压面(叉)
    expect(ratio, `${标注({ theme, tone })}｜${说明}`).toBeGreaterThanOrEqual(3)
  })
})

describe('实心标签的置灰档与轻档', () => {
  // 置灰档把底换成静默色、字换成置灰色：面不是实心语气底，环不跟着字走，退回 --xh-ring-focus。
  it.each(THEMES)('置灰档：标签与叉的环都退回默认那一支 · %s', async (theme) => {
    document.documentElement.dataset.theme = theme
    const { item, 叉 } = 标签('data-disabled')
    const 默认环 = resolve('var(--xh-ring-focus)')
    for (const el of [item, 叉]) {
      await focus(el)
      expect(getComputedStyle(el).outlineColor).toBe(默认环)
      const { ratio, 说明 } = 环压面(el)
      expect(ratio, `${theme}｜${说明}`).toBeGreaterThanOrEqual(3)
    }
  })

  // 轻档（键盘锚点）不落到实心标签上：面仍是实心语气底，环照旧取字色，压在那块底上仍读得出
  it.each(THEMES)('轻档：实心标签的面不换，标签与叉的环仍取字色 · %s', async (theme) => {
    document.documentElement.dataset.theme = theme
    const 静息 = getComputedStyle(标签('').item).backgroundColor
    const { item, 叉 } = 标签('data-highlighted')
    expect(getComputedStyle(item).backgroundColor, '轻档不该把实心底换掉').toBe(静息)
    for (const el of [item, 叉]) {
      await focus(el)
      expect(getComputedStyle(el).outlineColor).toBe(getComputedStyle(el).color)
      const { ratio, 说明 } = 环压面(el)
      expect(ratio, `${theme}｜${说明}`).toBeGreaterThanOrEqual(3)
    }
  })
})
