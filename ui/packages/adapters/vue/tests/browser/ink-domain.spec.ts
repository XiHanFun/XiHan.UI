// 墨色域：彩色面声明自身底色的极性，域内的中性描边与淡底取墨色按比例透明。
//
// 钉住五件事：比例在缺省面上与原中性色对比度相等；同一条描边在任何底色上显著度一致；
// dark / light 域同时是主题边界；auto 域按底色选墨；真组件在域内取到墨色。
// 判据全部取计算样式，颜色经画布转成 sRGB 后按 WCAG 相对亮度比较。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhButton, XhSwitch, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function container(): HTMLElement {
  if (!host) {
    host = document.createElement('div')
    document.body.append(host)
  }
  return host
}

/** 任意 CSS 颜色 → sRGB 0–1 分量与透明度。 */
function rgba(color: string): [number, number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const d = context.getImageData(0, 0, 1, 1).data
  return [d[0]! / 255, d[1]! / 255, d[2]! / 255, d[3]! / 255]
}

const decode = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const luminance = (c: number[]) => 0.2126 * decode(c[0]!) + 0.7152 * decode(c[1]!) + 0.0722 * decode(c[2]!)
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

/** 把一个可能半透明的颜色按浏览器的做法合成到不透明底色上，返回对底色的对比度。 */
function contrastOn(color: string, backdrop: string): number {
  const [r, g, b, a] = rgba(color)
  const base = rgba(backdrop)
  const mixed = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)]
  return ratio(luminance(mixed), luminance(base))
}

interface Probe {
  border: string
  subtle: string
  fg: string
  muted: string
  scheme: string
  danger: string
}

/** 在一块底色上建域，读出域内的描边、淡底、正文与弱化文字。 */
function domain(backdrop: string, attrs: Record<string, string>, style = ''): Probe {
  const surface = document.createElement('section')
  surface.style.cssText = `background:${backdrop};padding:8px;${style}`
  for (const [k, v] of Object.entries(attrs))
    surface.setAttribute(k, v)
  surface.innerHTML = `
    <i data-k="border" style="display:block;border:1px solid var(--xh-border-default)"></i>
    <i data-k="subtle" style="display:block;background:var(--xh-bg-subtle)"></i>
    <i data-k="fg" style="color:var(--xh-fg-default)"></i>
    <i data-k="muted" style="color:var(--xh-fg-muted)"></i>
    <i data-k="danger" style="color:var(--xh-fg-danger)"></i>`
  container().append(surface)
  const pick = (k: string) => getComputedStyle(surface.querySelector(`[data-k="${k}"]`)!)
  return {
    border: pick('border').borderTopColor,
    subtle: pick('subtle').backgroundColor,
    fg: pick('fg').color,
    muted: pick('muted').color,
    scheme: getComputedStyle(surface).colorScheme,
    danger: pick('danger').color,
  }
}

/** 某主题缺省面上的原色：不进域，直接在主题边界上读。 */
function themed(theme: 'light' | 'dark'): Probe & { surface: string } {
  const probe = domain('var(--xh-bg-surface)', { 'data-theme': theme })
  const el = document.createElement('i')
  el.dataset.theme = theme
  el.style.background = 'var(--xh-bg-surface)'
  container().append(el)
  return { ...probe, surface: getComputedStyle(el).backgroundColor }
}

describe('墨色比例与缺省面对比度等价', () => {
  it('黑墨域落在浅色面上，描边与淡底和浅色档的原中性色对比度相等', () => {
    const light = themed('light')
    const ink = domain(light.surface, { 'data-xh-ink': 'dark' })
    expect(rgba(ink.border).slice(0, 3)).toEqual([0, 0, 0])
    expect(contrastOn(ink.border, light.surface)).toBeCloseTo(contrastOn(light.border, light.surface), 1)
    expect(contrastOn(ink.subtle, light.surface)).toBeCloseTo(contrastOn(light.subtle, light.surface), 1)
  })

  it('白墨域落在深色面上，描边与淡底和深色档的原中性色对比度相等', () => {
    const dark = themed('dark')
    const ink = domain(dark.surface, { 'data-xh-ink': 'light' })
    expect(rgba(ink.border).slice(0, 3)).toEqual([1, 1, 1])
    expect(contrastOn(ink.border, dark.surface)).toBeCloseTo(contrastOn(dark.border, dark.surface), 1)
    expect(contrastOn(ink.subtle, dark.surface)).toBeCloseTo(contrastOn(dark.subtle, dark.surface), 1)
  })
})

describe('同一条描边在任何底色上显著度一致', () => {
  const colored = ['oklch(0.9 0.18 100)', 'oklch(0.72 0.19 150)', 'oklch(0.7 0.19 50)', 'oklch(1 0 0)']

  it('黑墨描边在黄、绿、橙、白底上的对比度彼此相差不到 0.1，而不透明灰在黄底上几乎消失', () => {
    const inked = colored.map(bg => contrastOn(domain(bg, { 'data-xh-ink': 'dark' }).border, bg))
    expect(Math.max(...inked) - Math.min(...inked)).toBeLessThan(0.1)
    for (const value of inked)
      expect(value).toBeGreaterThan(1.15)
    const opaque = domain(colored[0]!, {}).border
    expect(contrastOn(opaque, colored[0]!)).toBeLessThan(1.1)
  })
})

describe('域是主题边界', () => {
  it('白墨域在浅色页面里取深色档的语气色与原生控件配色', () => {
    const dark = themed('dark')
    const ink = domain('oklch(0.3 0.1 258)', { 'data-xh-ink': 'light' })
    expect(ink.scheme).toBe('dark')
    expect(ink.danger).toBe(dark.danger)
  })

  it('黑墨域在深色页面里取浅色档的语气色与原生控件配色', () => {
    const outer = document.createElement('div')
    outer.dataset.theme = 'dark'
    container().append(outer)
    const light = themed('light')
    const surface = document.createElement('section')
    surface.dataset.xhInk = 'dark'
    surface.innerHTML = '<i style="color:var(--xh-fg-danger)"></i>'
    outer.append(surface)
    expect(getComputedStyle(surface).colorScheme).toBe('light')
    expect(getComputedStyle(surface.firstElementChild!).color).toBe(light.danger)
  })
})

describe('正文与弱化文字', () => {
  it('正文取纯黑 / 纯白；未声明余量时弱化文字等于墨色，声明 ample 后取墨色 72%', () => {
    const tight = domain('oklch(0.72 0.19 150)', { 'data-xh-ink': 'dark' })
    expect(rgba(tight.fg)).toEqual([0, 0, 0, 1])
    expect(rgba(tight.muted)).toEqual([0, 0, 0, 1])
    const ample = domain('oklch(0.97 0.02 100)', { 'data-xh-ink': 'dark', 'data-xh-ink-margin': 'ample' })
    expect(rgba(ample.muted)[3]).toBeCloseTo(0.72, 2)
    expect(rgba(domain('oklch(0.2 0.02 258)', { 'data-xh-ink': 'light' }).fg)).toEqual([1, 1, 1, 1])
  })
})

describe('auto 域按底色选墨', () => {
  it('浅底取黑墨、深底取白墨，描边比例随墨色取浅深两档之一', () => {
    const light = themed('light')
    const dark = themed('dark')
    const yellow = domain('oklch(0.9 0.18 100)', { 'data-xh-ink': 'auto' }, '--xh-ink-surface: oklch(0.9 0.18 100)')
    const navy = domain('oklch(0.3 0.1 258)', { 'data-xh-ink': 'auto' }, '--xh-ink-surface: oklch(0.3 0.1 258)')
    expect(rgba(yellow.fg)).toEqual([0, 0, 0, 1])
    expect(rgba(navy.fg)).toEqual([1, 1, 1, 1])
    const explicitLight = domain(light.surface, { 'data-xh-ink': 'dark' })
    const explicitDark = domain(dark.surface, { 'data-xh-ink': 'light' })
    expect(rgba(yellow.border)[3]).toBeCloseTo(rgba(explicitLight.border)[3], 2)
    expect(rgba(navy.border)[3]).toBeCloseTo(rgba(explicitDark.border)[3], 2)
  })

  it('浅底离分界足够远时弱化文字取墨色 72%，靠近分界时等于墨色', () => {
    const far = domain('oklch(0.97 0.02 100)', { 'data-xh-ink': 'auto' }, '--xh-ink-surface: oklch(0.97 0.02 100)')
    const near = domain('oklch(0.62 0.2 258)', { 'data-xh-ink': 'auto' }, '--xh-ink-surface: oklch(0.62 0.2 258)')
    expect(rgba(far.muted)[3]).toBeCloseTo(0.72, 2)
    expect(rgba(near.muted)[3]).toBe(1)
  })

  it('引用了描边与焦点环的派生令牌在 auto 域里一并重算', () => {
    const surface = document.createElement('section')
    surface.dataset.xhInk = 'auto'
    surface.style.cssText = '--xh-ink-surface: oklch(0.3 0.1 258); background: oklch(0.3 0.1 258)'
    surface.innerHTML = `
      <i data-k="control" style="display:block;border:1px solid var(--xh-border-control)"></i>
      <i data-k="focus" style="display:block;border:1px solid var(--xh-border-control-focus)"></i>
      <i data-k="thumb" style="display:block;background:var(--xh-fg-scrollbar-thumb)"></i>`
    const outer = document.createElement('div')
    outer.dataset.theme = 'light'
    outer.append(surface)
    container().append(outer)
    const pick = (k: string) => getComputedStyle(surface.querySelector(`[data-k="${k}"]`)!)
    expect(rgba(pick('control').borderTopColor).slice(0, 3)).toEqual([1, 1, 1])
    expect(rgba(pick('focus').borderTopColor)).toEqual([1, 1, 1, 1])
    expect(rgba(pick('thumb').backgroundColor).slice(0, 3)).toEqual([1, 1, 1])
  })

  it('未提供底色时按外层主题的面选墨，不让域内令牌失效', () => {
    const probe = domain('var(--xh-bg-surface)', { 'data-xh-ink': 'auto' })
    expect(rgba(probe.fg)).toEqual([0, 0, 0, 1])
    expect(rgba(probe.border)[3]).toBeGreaterThan(0)
  })
})

describe('高对比档', () => {
  it('祖先要求高对比时，域内描边回到实色', () => {
    const outer = document.createElement('div')
    outer.dataset.contrast = 'more'
    container().append(outer)
    const surface = document.createElement('section')
    surface.dataset.xhInk = 'dark'
    surface.innerHTML = '<i style="display:block;border:1px solid var(--xh-border-default)"></i>'
    outer.append(surface)
    expect(rgba(getComputedStyle(surface.firstElementChild!).borderTopColor)[3]).toBe(1)
  })
})

describe('真组件在域内取墨色', () => {
  async function mount(render: () => VNode, backdrop: string, ink: string): Promise<HTMLElement> {
    const surface = document.createElement('section')
    surface.style.cssText = `background:${backdrop};padding:16px`
    surface.dataset.xhInk = ink
    container().append(surface)
    app = createApp({ render })
    app.mount(surface)
    await nextTick()
    return surface
  }

  it('白墨域里的按钮：缺省实心是白底黑字，描边档是白墨描边', async () => {
    const surface = await mount(() => h('div', [
      h(XhButton, { 'data-testid': 'solid' }, () => '发布'),
      h(XhButton, { 'data-testid': 'outline', 'variant': 'outline' }, () => '取消'),
    ]), 'oklch(0.3 0.1 258)', 'light')
    const solid = getComputedStyle(surface.querySelector('[data-testid="solid"]')!)
    const outline = getComputedStyle(surface.querySelector('[data-testid="outline"]')!)
    expect(rgba(solid.backgroundColor)).toEqual([1, 1, 1, 1])
    expect(rgba(solid.color)).toEqual([0, 0, 0, 1])
    expect(rgba(outline.borderTopColor).slice(0, 3)).toEqual([1, 1, 1])
    expect(rgba(outline.borderTopColor)[3]).toBeLessThan(0.3)
    expect(rgba(outline.color)).toEqual([1, 1, 1, 1])
  })

  it('开关打开时轨道取墨色', async () => {
    const surface = await mount(() => h(XhSwitch, { 'data-testid': 's', 'defaultChecked': true, 'aria-label': '通知' }), 'oklch(0.9 0.18 100)', 'dark')
    const root = surface.querySelector<HTMLElement>('[data-testid="s"][data-part="root"]') ?? surface.querySelector<HTMLElement>('[data-scope="switch"][data-part="root"]')!
    expect(rgba(getComputedStyle(root).backgroundColor)).toEqual([0, 0, 0, 1])
  })

  it('文本字段的控件描边是墨色按比例透明，输入文字是墨色', async () => {
    const surface = await mount(() => h(XhTextFieldRoot, null, () => h(XhTextFieldControl, null, () => h(XhTextFieldInput, { 'aria-label': '搜索' }))), 'oklch(0.72 0.19 150)', 'dark')
    const control = getComputedStyle(surface.querySelector('[data-scope="text-field"][data-part="control"]')!)
    const input = getComputedStyle(surface.querySelector('input')!)
    expect(rgba(control.borderTopColor).slice(0, 3)).toEqual([0, 0, 0])
    expect(rgba(control.borderTopColor)[3]).toBeLessThan(0.2)
    expect(rgba(input.color)).toEqual([0, 0, 0, 1])
  })
})
