// tag-group 叠在标签上的三档状态（悬停、键盘锚点、选中）落在实心标签上时，字得读得出来。
//
// 悬停与锚点的中性灰轻档只给淡底 / 描边 / 缺省档：实心档的字是实心底上配对的那支前景色，
// 换成灰底就糊了；实心档在这两档里面不换、字不换。选中在实心档上靠面配对的前景色描边，
// 字仍是那支前景色。淡底 / 描边 / 缺省档进轻档时底换成 --xh-bg-subtle-hover，与从前一致。
// 六族语气 × 浅深主题逐档量：算出来的颜色是级联的结果，只有真实浏览器量得出来。
import type { Tone } from '@xihan-ui/core'
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTagGroupRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Variant = 'solid' | 'subtle' | 'outline'
type Theme = 'light' | 'dark'

const TONES: (Tone | undefined)[] = [undefined, 'brand', 'neutral', 'danger', 'success', 'warning', 'info']
const THEMES: Theme[] = ['light', 'dark']

/** WCAG 2.2 SC 1.4.3：正文字与底的最低对比。 */
const TEXT_MIN = 4.5
/** WCAG 2.2 SC 1.4.11：非文字（描边）与相邻面的最低对比。 */
const NON_TEXT_MIN = 3

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

/** 元素自己这块面下面那一摞底色：从最外层祖先到它自己，透的那几层由下面一层透上来。 */
function faceStack(el: Element): string[] {
  const stack: string[] = []
  for (let node: Element | null = el; node; node = node.parentElement)
    stack.push(getComputedStyle(node).backgroundColor)
  return stack.reverse()
}

function faceOf(el: Element): [number, number, number] {
  return composite(faceStack(el))
}

/** 字压在面上的对比。 */
function textContrast(el: HTMLElement): number {
  return contrast(composite([...faceStack(el), getComputedStyle(el).color]), faceOf(el))
}

/** 把在跑的过渡推到终点：状态一换，面与字正在皮肤给的那段过渡里，读到的会是插值中的那一帧。 */
function settle(): void {
  for (const animation of document.getAnimations()) {
    try {
      animation.finish()
    }
    catch {}
  }
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

let app: App | null = null
let host: HTMLElement | null = null

/** 指针停回角落那块 fixture，免得它留在上一条用例的节点上。 */
async function park(): Promise<void> {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
}

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
  await park()
})

const ITEMS = [{ value: 'vue', label: 'Vue' }, { value: 'react', label: 'React' }, { value: 'svelte', label: 'Svelte' }]

async function mount(variant: Variant, tone: Tone | undefined, theme: Theme): Promise<void> {
  document.documentElement.dataset.theme = theme
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhTagGroupRoot, { collection: ITEMS, selectionMode: 'multiple', variant, ...(tone ? { tone } : {}) }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function tags(): HTMLElement[] {
  return Array.from(host!.querySelectorAll<HTMLElement>(`[data-scope='tag-group'][data-part='list'] > [data-scope='tag'][data-part='root']`))
}

function label(variant: Variant, tone: Tone | undefined, theme: Theme): string {
  return `${variant} · ${tone ?? '无语气'} · ${theme}`
}

const CASES = THEMES.flatMap(theme => TONES.map(tone => ({ tone, theme })))

describe('实心标签在组里的三档状态', () => {
  it.each(CASES)('悬停：面不换、字仍读得出（$tone · $theme）', async ({ tone, theme }) => {
    await mount('solid', tone, theme)
    const [first] = tags()
    const resting = getComputedStyle(first!).backgroundColor
    await userEvent.hover(first!)
    settle()
    const 说明 = label('solid', tone, theme)
    expect(first!.matches(':hover'), `${说明}｜指针没停上去`).toBe(true)
    expect(getComputedStyle(first!).backgroundColor, `${说明}｜实心档悬停不该换底`).toBe(resting)
    expect(textContrast(first!), `${说明}｜悬停时字压在面上`).toBeGreaterThanOrEqual(TEXT_MIN)
  })

  it.each(CASES)('键盘锚点：面不换、字仍读得出（$tone · $theme）', async ({ tone, theme }) => {
    await mount('solid', tone, theme)
    const [first] = tags()
    const resting = getComputedStyle(first!).backgroundColor
    await userEvent.tab()
    settle()
    const 说明 = label('solid', tone, theme)
    expect(first!.hasAttribute('data-highlighted'), `${说明}｜Tab 进组后第一枚不是锚点`).toBe(true)
    expect(getComputedStyle(first!).backgroundColor, `${说明}｜实心档做锚点不该换底`).toBe(resting)
    expect(textContrast(first!), `${说明}｜锚点时字压在面上`).toBeGreaterThanOrEqual(TEXT_MIN)
  })

  it.each(CASES)('选中：字仍读得出，描边与面分得开（$tone · $theme）', async ({ tone, theme }) => {
    await mount('solid', tone, theme)
    const [, second] = tags()
    await userEvent.click(second!)
    await park()
    settle()
    const 说明 = label('solid', tone, theme)
    expect(second!.hasAttribute('data-selected'), `${说明}｜点了没选中`).toBe(true)
    expect(textContrast(second!), `${说明}｜选中后字压在面上`).toBeGreaterThanOrEqual(TEXT_MIN)
    const style = getComputedStyle(second!)
    expect(contrast(composite([...faceStack(second!), style.borderTopColor]), faceOf(second!)), `${说明}｜选中的描边糊在面里`).toBeGreaterThanOrEqual(NON_TEXT_MIN)
  })
})

describe('非实心标签在组里仍进中性灰轻档', () => {
  it.each<Variant | undefined>(['subtle', 'outline', undefined])('variant=%s 悬停时底换成 --xh-bg-subtle-hover', async (variant) => {
    document.documentElement.dataset.theme = 'light'
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      setup: () => () => h(XhTagGroupRoot, { collection: ITEMS, selectionMode: 'multiple', ...(variant ? { variant } : {}) }),
    })
    app.mount(host)
    await nextTick()
    await nextTick()
    const [first] = tags()
    await userEvent.hover(first!)
    settle()
    expect(getComputedStyle(first!).backgroundColor).toBe(resolve('var(--xh-bg-subtle-hover)'))
  })
})
