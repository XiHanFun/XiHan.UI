// 图标底框：框画在 <svg> 自己的盒上，sm / md / lg 三档与头像同档，图元按档位取字形直径居中。
//
// 框的直径、内衬换算出的图元内容盒、圆形与四种配色都要层叠真正算过一遍：
// jsdom 不排版也不解析 calc 与 var() 链，只有真实浏览器量得出盒子多大、图元落在哪。
import type { IconRecord, Size } from '@xihan-ui/core'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhAvatarFallback, XhAvatarRoot, XhIcon } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const CHECK: IconRecord = {
  name: 'check',
  viewBox: '0 0 24 24',
  attrs: { 'fill': 'none', 'stroke': 'currentColor', 'stroke-width': '2' },
  nodes: [{ tag: 'path', attrs: { d: 'M4 12.5 9.5 18 20 6' } }],
}

const SIZES: readonly Size[] = ['sm', 'md', 'lg']

/** 两档密度下三档框（= 头像）的直径与框里图元的直径。 */
const EXPECTED = {
  comfortable: { box: { sm: 32, md: 36, lg: 40 }, glyph: { sm: 16, md: 20, lg: 24 } },
  compact: { box: { sm: 28, md: 32, lg: 36 }, glyph: { sm: 16, md: 20, lg: 24 } },
} as const

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function mount(render: () => VNode, attrs: Record<string, string> = {}): void {
  host = document.createElement('div')
  for (const [name, value] of Object.entries(attrs))
    host.setAttribute(name, value)
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function icons(): SVGSVGElement[] {
  return [...host!.querySelectorAll<SVGSVGElement>('[data-scope="icon"][data-part="root"]')]
}

function avatars(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>('[data-scope="avatar"][data-part="root"]')]
}

/** 框里图元占的内容盒：边框盒减去两侧内衬与描边。 */
function contentBox(el: Element): { width: number, height: number } {
  const style = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const px = (value: string): number => Number.parseFloat(value)
  return {
    width: rect.width - px(style.paddingLeft) - px(style.paddingRight) - px(style.borderLeftWidth) - px(style.borderRightWidth),
    height: rect.height - px(style.paddingTop) - px(style.paddingBottom) - px(style.borderTopWidth) - px(style.borderBottomWidth),
  }
}

/** 在宿主里放一枚探针，按同一处的作用域把令牌求成计算值。 */
function resolve(property: 'backgroundColor' | 'borderTopColor' | 'color', token: string, attrs: Record<string, string> = {}): string {
  const probe = document.createElement('span')
  for (const [name, value] of Object.entries(attrs))
    probe.setAttribute(name, value)
  probe.style.borderStyle = 'solid'
  probe.style[property] = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe)[property]
  probe.remove()
  return value
}

describe('icon 底框的尺寸', () => {
  for (const density of ['comfortable', 'compact'] as const) {
    it(`${density}：sm / md / lg 三档框与同档头像一样大，图元按档位取字形直径`, async () => {
      mount(() => h('div', null, SIZES.flatMap(size => [
        h(XhIcon, { icon: CHECK, frame: 'subtle', size }),
        h(XhAvatarRoot, { size }, () => h(XhAvatarFallback, null, () => '曦')),
      ])), { 'data-density': density })
      await nextTick()

      SIZES.forEach((size, index) => {
        const icon = icons()[index]!.getBoundingClientRect()
        const avatar = avatars()[index]!.getBoundingClientRect()
        const box = EXPECTED[density].box[size as 'sm' | 'md' | 'lg']
        const glyph = EXPECTED[density].glyph[size as 'sm' | 'md' | 'lg']
        expect([icon.width, icon.height], `${size} 框`).toEqual([box, box])
        expect([icon.width, icon.height], `${size} 与头像同档`).toEqual([avatar.width, avatar.height])
        expect(contentBox(icons()[index]!), `${size} 图元`).toEqual({ width: glyph, height: glyph })
      })
    })
  }

  it('三档之外的档位：框沿用 md 档的内衬厚度，直径跟着图元走', async () => {
    mount(() => h('div', null, [
      h(XhIcon, { icon: CHECK, frame: 'subtle', size: 'md' }),
      h(XhIcon, { icon: CHECK, frame: 'subtle', size: 'xl' }),
      h(XhIcon, { icon: CHECK, frame: 'subtle', size: '4xl' }),
    ]))
    await nextTick()
    const [md, xl, huge] = icons()
    const ring = md!.getBoundingClientRect().width - contentBox(md!).width
    expect(contentBox(xl!)).toEqual({ width: 32, height: 32 })
    expect(xl!.getBoundingClientRect().width).toBe(32 + ring)
    expect(contentBox(huge!)).toEqual({ width: 72, height: 72 })
    expect(huge!.getBoundingClientRect().width).toBe(72 + ring)
  })

  it('框是圆：四角圆角取一半，宽高相等', async () => {
    mount(() => h(XhIcon, { icon: CHECK, frame: 'outline' }))
    await nextTick()
    const [icon] = icons()
    expect(getComputedStyle(icon!).borderRadius).toBe('50%')
  })

  it('框不读外层下发的 --xh-icon-size：落在统一图元直径的容器里，框与图元都按自己的档位', async () => {
    mount(() => h('div', { style: { '--xh-icon-size': '12px' } }, [
      h(XhIcon, { icon: CHECK, size: 'lg' }),
      h(XhIcon, { icon: CHECK, size: 'lg', frame: 'subtle' }),
    ]))
    await nextTick()
    const [plain, framed] = icons()
    // 不加框的图标照旧跟随外层通道
    expect(plain!.getBoundingClientRect().width).toBe(12)
    expect(framed!.getBoundingClientRect().width).toBe(40)
    expect(contentBox(framed!)).toEqual({ width: 24, height: 24 })
  })

  it('不加框的图标尺寸不受影响：没有内衬、没有描边', async () => {
    mount(() => h(XhIcon, { icon: CHECK, size: 'lg' }))
    await nextTick()
    const style = getComputedStyle(icons()[0]!)
    expect(icons()[0]!.getBoundingClientRect().width).toBe(24)
    expect(style.paddingTop).toBe('0px')
    expect(style.borderTopWidth).toBe('0px')
  })
})

describe('icon 底框的配色', () => {
  it('四种底框：实心品牌底 + 反白前景、淡底、描边透明底、无壳', async () => {
    mount(() => h('div', null, (['solid', 'subtle', 'outline', 'ghost'] as const).map(frame =>
      h(XhIcon, { icon: CHECK, frame }),
    )))
    await nextTick()
    const [solid, subtle, outline, ghost] = icons().map(el => getComputedStyle(el))

    expect(solid!.backgroundColor).toBe(resolve('backgroundColor', '--xh-bg-brand'))
    expect(solid!.color).toBe(resolve('color', '--xh-fg-on-brand'))
    expect(subtle!.backgroundColor).toBe(resolve('backgroundColor', '--xh-bg-subtle'))
    expect(subtle!.color).toBe(resolve('color', '--xh-fg-default'))
    expect(outline!.backgroundColor).toBe(TRANSPARENT)
    expect(outline!.borderTopColor).toBe(resolve('borderTopColor', '--xh-border-default'))
    expect(ghost!.backgroundColor).toBe(TRANSPARENT)
    expect(ghost!.borderTopColor).toBe(TRANSPARENT)
  })

  it('语气只认自己身上的 data-tone：写了取语气色，放在语气容器里的无语气框保持中性', async () => {
    mount(() => h('div', { 'data-tone': 'danger' }, [
      h(XhIcon, { icon: CHECK, frame: 'subtle' }),
      h(XhIcon, { icon: CHECK, frame: 'subtle', tone: 'success' }),
      h(XhIcon, { icon: CHECK, frame: 'solid' }),
      h(XhIcon, { icon: CHECK, frame: 'solid', tone: 'success' }),
    ]))
    await nextTick()
    const [plainSubtle, toneSubtle, plainSolid, toneSolid] = icons().map(el => getComputedStyle(el))
    const success = { 'data-tone': 'success' }

    expect(plainSubtle!.backgroundColor).toBe(resolve('backgroundColor', '--xh-bg-subtle'))
    expect(toneSubtle!.backgroundColor).toBe(resolve('backgroundColor', '--xh-tone-subtle', success))
    expect(toneSubtle!.color).toBe(resolve('color', '--xh-tone-fg', success))
    expect(plainSolid!.backgroundColor).toBe(resolve('backgroundColor', '--xh-bg-brand'))
    expect(toneSolid!.backgroundColor).toBe(resolve('backgroundColor', '--xh-tone-solid', success))
    expect(toneSolid!.color).toBe(resolve('color', '--xh-tone-on', success))
  })
})
