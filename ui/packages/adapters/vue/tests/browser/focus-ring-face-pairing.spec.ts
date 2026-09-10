// 环画在实心面上时，取的是那块面自己配对的前景色。
//
// 这一份钉三档：环压着的那块面，现成的档位表都推不出来。
//   · 开关的选中轨道 —— 轨道是 <button>，皮肤不写 color 时 currentColor 取到的是 UA 的
//     buttontext，不是面上的前景色；那是一支不随主题也不随语气走的色
//   · 气泡确认的取消钮 —— 常态的淡底刚过线，掉线的是悬停与按下两档，
//     而 :hover / :active 挂不进档位表
//   · 标签输入的删除叉 —— 叉自己的面透明，环内侧是整颗标签反白之后的实心语气底
//
// 每一档量两样：环色与面按 WCAG 2.2 SC 1.4.11 的非文本对比要过 3:1；
// 环色要与那块面配对的前景色同值——同值才保证换了语气、换了主题它跟着走。
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
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

/** 一个值在某个节点下算完之后的取值：语气槽只在挂了 data-tone 的子树里有定义。 */
function resolveIn(host: Element, value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  host.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

// ── 挂载 ──

const TONES = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const
const THEMES = ['light', 'dark'] as const

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
})

/** 铺上本主题的底与字：透空的面透到最后透出来的是这块底。 */
function paintPage(theme: string): void {
  document.documentElement.dataset.theme = theme
  document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
  document.body.style.color = 'var(--xh-fg-default)'
}

function mount(html: string, theme: string): HTMLElement {
  host?.remove()
  paintPage(theme)
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host
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
}

/** 落焦之后量环与它内侧那块面。 */
function ringVsFace(el: HTMLElement): { ratio: number, ring: string, face: string } {
  const style = getComputedStyle(el)
  const stack = insideStack(el)
  return {
    ratio: contrast(composite([...stack, style.outlineColor]), composite(stack)),
    ring: style.outlineColor,
    face: `rgb(${composite(stack).join(', ')})`,
  }
}

const 组合 = THEMES.flatMap(theme => TONES.map(tone => ({ theme, tone })))

describe('实心面上的环取面自己的前景色', () => {
  describe('开关的选中轨道', () => {
    it.each(组合)('$theme · $tone', async ({ theme, tone }) => {
      const stage = mount(
        `<div data-tone="${tone}"><button data-scope="switch" data-part="root" data-state="checked"></button></div>`,
        theme,
      )
      const track = stage.querySelector<HTMLElement>('[data-part=\'root\']')!
      await focus(track)
      expect(track.matches(':focus-visible'), '焦点没落上去').toBe(true)

      const { ratio, ring, face } = ringVsFace(track)
      expect(ratio, `环 ${ring}｜面 ${face}`).toBeGreaterThanOrEqual(3)
      expect(ring, '环色要与语气的配对前景色同值，不是 UA 的 buttontext')
        .toBe(resolveIn(track.parentElement!, 'var(--xh-_tone-on, var(--xh-fg-on-brand))'))
    })

    it.each(THEMES)('%s · 只读的选中轨道换成中性底，环仍读得出', async (theme) => {
      const stage = mount(
        '<div data-tone="warning"><button data-scope="switch" data-part="root" data-state="checked" data-readonly></button></div>',
        theme,
      )
      const track = stage.querySelector<HTMLElement>('[data-part=\'root\']')!
      await focus(track)
      const { ratio, ring, face } = ringVsFace(track)
      expect(ratio, `环 ${ring}｜面 ${face}`).toBeGreaterThanOrEqual(3)
    })
  })

  describe('气泡确认的取消钮', () => {
    // 常态、悬停、按下三档的底：:hover / :active 在这里挂不出来，
    // 底色改用皮肤那三支令牌直接算，环色取这颗钮落焦时算出来的那一支
    const 三档底 = [
      ['常态', 'var(--xh-bg-subtle)'],
      ['悬停', 'var(--xh-bg-subtle-hover)'],
      ['按下', 'var(--xh-bg-subtle-active)'],
    ] as const

    it.each(THEMES)('%s · 环取的是这颗钮自己的前景色', async (theme) => {
      const stage = mount(
        '<div data-scope="popconfirm" data-part="content"><button data-scope="popconfirm" data-part="cancel-trigger">取消</button></div>',
        theme,
      )
      const cancel = stage.querySelector<HTMLElement>('[data-part=\'cancel-trigger\']')!
      await focus(cancel)
      expect(cancel.matches(':focus-visible'), '焦点没落上去').toBe(true)
      expect(getComputedStyle(cancel).outlineColor).toBe(getComputedStyle(cancel).color)
    })

    it.each(THEMES.flatMap(theme => 三档底.map(([名, 底]) => [theme, 名, 底] as const)))(
      '%s · %s 的底压着环',
      async (theme, _名, 底) => {
        const stage = mount(
          '<div data-scope="popconfirm" data-part="content"><button data-scope="popconfirm" data-part="cancel-trigger">取消</button></div>',
          theme,
        )
        const cancel = stage.querySelector<HTMLElement>('[data-part=\'cancel-trigger\']')!
        await focus(cancel)
        const ring = composite([getComputedStyle(cancel).outlineColor])
        const face = composite([resolveIn(cancel, 底)])
        expect(contrast(ring, face), `环 ${getComputedStyle(cancel).outlineColor}｜面 ${底}`).toBeGreaterThanOrEqual(3)
      },
    )
  })

  describe('标签输入里反白标签上的删除叉', () => {
    it.each(组合)('$theme · $tone', async ({ theme, tone }) => {
      const stage = mount(
        `<div data-scope="tags-input" data-part="root" data-tone="${tone}">`
        + '<span data-scope="tags-input" data-part="item" data-highlighted>'
        + '<span data-scope="tags-input" data-part="item-text">标签</span>'
        + '<button data-scope="tags-input" data-part="item-delete-trigger" data-highlighted></button>'
        + '</span></div>',
        theme,
      )
      const del = stage.querySelector<HTMLElement>('[data-part=\'item-delete-trigger\']')!
      await focus(del)
      expect(del.matches(':focus-visible'), '焦点没落上去').toBe(true)

      const { ratio, ring, face } = ringVsFace(del)
      expect(ratio, `环 ${ring}｜面 ${face}`).toBeGreaterThanOrEqual(3)
      expect(ring, '环色要与反白档换过的字同值').toBe(getComputedStyle(del).color)
    })
  })
})
