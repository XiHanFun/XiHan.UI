// 环画在实心面上时，取的是那块面自己配对的前景色。
//
// 这一份钉三档：环压着的那块面，现成的档位表都推不出来。
//   · 开关的选中轨道 —— 轨道是 <button>，皮肤不写 color 时 currentColor 取到的是 UA 的
//     buttontext，不是面上的前景色；那是一支不随主题也不随语气走的色
//   · 气泡确认的取消钮 —— 常态的淡底过线吃默认环，悬停与按下两档的底更深才灌 currentColor；
//     :hover 用真实指针悬上去、:active 按住空格键，两档都是真的伪类，不用令牌去估
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
    const 取消钮 = (theme: string) => {
      const stage = mount(
        '<div data-scope="popconfirm" data-part="content"><button data-scope="popconfirm" data-part="cancel-trigger">取消</button></div>',
        theme,
      )
      return stage.querySelector<HTMLElement>('[data-part=\'cancel-trigger\']')!
    }

    /** 真实指针挪回视口角落那块停靠区，别停在下一条用例的 fixture 上。 */
    const 归位指针 = async () => {
      const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
      if (park)
        await userEvent.hover(park)
    }

    it.each(THEMES)('%s · 常态的淡底过线，环吃默认那一支', async (theme) => {
      const cancel = 取消钮(theme)
      await focus(cancel)
      expect(cancel.matches(':focus-visible'), '焦点没落上去').toBe(true)
      const { ratio, ring, face } = ringVsFace(cancel)
      expect(ring).toBe(resolveIn(cancel, 'var(--xh-ring-focus)'))
      expect(ratio, `环 ${ring}｜面 ${face}`).toBeGreaterThanOrEqual(3)
    })

    it.each(THEMES)('%s · 悬停档的底更深，环取这颗钮自己的前景色', async (theme) => {
      const cancel = 取消钮(theme)
      await userEvent.hover(cancel)
      await focus(cancel)
      try {
        expect(cancel.matches(':hover'), '真实指针没悬上去').toBe(true)
        expect(cancel.matches(':focus-visible'), '焦点没落上去').toBe(true)
        const { ratio, ring, face } = ringVsFace(cancel)
        expect(ring, '环色要与这颗钮自己的前景色同值').toBe(getComputedStyle(cancel).color)
        expect(ratio, `环 ${ring}｜面 ${face}`).toBeGreaterThanOrEqual(3)
      }
      finally {
        await 归位指针()
      }
    })

    it.each(THEMES)('%s · 按下档的底最深，环取这颗钮自己的前景色', async (theme) => {
      const cancel = 取消钮(theme)
      await focus(cancel)
      await userEvent.keyboard('{Space>}')
      try {
        expect(cancel.matches(':active'), '按住空格键没让钮进入按下态').toBe(true)
        expect(cancel.matches(':focus-visible'), '焦点没落上去').toBe(true)
        const { ratio, ring, face } = ringVsFace(cancel)
        expect(ring, '环色要与这颗钮自己的前景色同值').toBe(getComputedStyle(cancel).color)
        expect(ratio, `环 ${ring}｜面 ${face}`).toBeGreaterThanOrEqual(3)
      }
      finally {
        await userEvent.keyboard('{/Space}')
      }
    })
  })

  describe('标签输入里反白标签上的删除叉', () => {
    const 反白标签 = (tone: string, 叉带高亮: boolean) =>
      `<div data-scope="tags-input" data-part="root" data-tone="${tone}">`
      + '<span data-scope="tags-input" data-part="item" data-highlighted>'
      + '<span data-scope="tags-input" data-part="item-text">标签</span>'
      + `<button data-scope="tags-input" data-part="item-delete-trigger"${叉带高亮 ? ' data-highlighted' : ''}></button>`
      + '</span></div>'

    // 皮肤按叉自己带 data-highlighted 写换色：这一档里环取到的是换过的那支字
    it.each(组合)('$theme · $tone · 叉带 data-highlighted', async ({ theme, tone }) => {
      const stage = mount(反白标签(tone, true), theme)
      const del = stage.querySelector<HTMLElement>('[data-part=\'item-delete-trigger\']')!
      await focus(del)
      expect(del.matches(':focus-visible'), '焦点没落上去').toBe(true)

      const { ratio, ring, face } = ringVsFace(del)
      expect(ratio, `环 ${ring}｜面 ${face}`).toBeGreaterThanOrEqual(3)
      expect(ring, '环色要与反白档换过的字同值').toBe(getComputedStyle(del).color)
    })

    // 连接层的 getItemDeleteTriggerProps 不带 stateAttrs，叉从来拿不到 data-highlighted：
    // 真实 DOM 里叉的字仍是没换过的灰，环跟着取到这支灰，压在反白的实心底上
    it.each(组合)('$theme · $tone · 叉不带 data-highlighted（连接层的真实形态），环取到的是没换过的字', async ({ theme, tone }) => {
      const stage = mount(反白标签(tone, false), theme)
      const del = stage.querySelector<HTMLElement>('[data-part=\'item-delete-trigger\']')!
      await focus(del)
      expect(del.matches(':focus-visible'), '焦点没落上去').toBe(true)
      expect(getComputedStyle(del).outlineColor, '环取的是叉自己没换过的那支字').toBe(getComputedStyle(del).color)
    })

    // 十二档里最低的一档（浅色 neutral）环与面同色、只有 1.00，深色 neutral 擦线 3.02，其余都在线下。
    // 这条在连接层给叉带上状态、或换色规则改锚在标签上的那天变红，好把上面那条并进带 data-highlighted 的那组
    it('叉不带 data-highlighted 时，十二档里有环压不过 3:1 的', async () => {
      const ratios: string[] = []
      let lowest = Number.POSITIVE_INFINITY
      for (const { theme, tone } of 组合) {
        const stage = mount(反白标签(tone, false), theme)
        const del = stage.querySelector<HTMLElement>('[data-part=\'item-delete-trigger\']')!
        await focus(del)
        const { ratio, ring, face } = ringVsFace(del)
        ratios.push(`${theme} · ${tone}：${ratio.toFixed(2)}（环 ${ring}｜面 ${face}）`)
        lowest = Math.min(lowest, ratio)
      }
      expect(lowest, ratios.join('\n')).toBeLessThan(3)
    })
  })
})
