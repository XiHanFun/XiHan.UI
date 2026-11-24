// 图片裁切的缩放与旋转两根滑杆：行为归原生 range，样子由皮肤自己画，不留给浏览器。
// 浏览器各画各的那一套（各家的轨道、拇指、强调色与聚焦环都不一样）一旦漏回来，这里量得出：
// 拇指不再是品牌描边的白底圆、轨道不再是居中的细槽、聚焦环回到整条输入盒上。
// 拇指与轨道是浏览器内部的节点，脚本读不到它们的计算样式，只能量截图。
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

/** scale：截图里一个 CSS 像素占几个图上的像素。 */
interface Shot { data: Uint8ClampedArray, width: number, height: number, scale: number }
type Rgb = readonly [number, number, number]

async function shoot(element: HTMLElement): Promise<Shot> {
  const base64 = await page.screenshot({ element, save: false })
  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob()
  const bitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext('2d')!
  context.drawImage(bitmap, 0, 0)
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height)
  const scale = bitmap.width / element.getBoundingClientRect().width
  // 测试页比运行器的窗口大时会被整体缩小，细线经重采样糊掉——视口要留在窗口以内
  if (scale < 1)
    throw new Error(`截图按 ${scale} 缩小过，量不准：把 page.viewport 调小`)
  return { data, width: bitmap.width, height: bitmap.height, scale }
}

function pixel(shot: Shot, x: number, y: number): Rgb {
  const i = (Math.round(y) * shot.width + Math.round(x)) * 4
  return [shot.data[i]!, shot.data[i + 1]!, shot.data[i + 2]!]
}

function sameColor(a: Rgb, b: Rgb): boolean {
  return a.every((channel, i) => Math.abs(channel - b[i]!) <= 6)
}

/** 某一列上，从 y 出发向上下两头数，连续满足条件的像素有几个（y 自己不满足就是 0）。 */
function runAt(shot: Shot, x: number, y: number, test: (color: Rgb) => boolean): number {
  if (!test(pixel(shot, x, y)))
    return 0
  let top = Math.round(y)
  let bottom = Math.round(y)
  while (top > 0 && test(pixel(shot, x, top - 1)))
    top--
  while (bottom < shot.height - 1 && test(pixel(shot, x, bottom + 1)))
    bottom++
  return bottom - top + 1
}

/** 一列像素的读数：断言不过时附在报错里，看得出是画错了还是量错了。 */
function column(shot: Shot, x: number): string {
  return Array.from({ length: shot.height }, (_, y) => pixel(shot, x, y).join(',')).join(' | ')
}

/** 一块令牌色在这张页面上画出来是什么颜色：与滑杆同一条渲染路径取，不去换算色值。 */
async function colorOf(token: string): Promise<Rgb> {
  const probe = host!.querySelector<HTMLElement>(`[data-probe="${token}"]`)!
  const shot = await shoot(probe)
  return pixel(shot, shot.width / 2, shot.height / 2)
}

// 取一个与白底、品牌色及两者的抗锯齿过渡色都拉得开的颜色：浅灰蓝会与白底、品牌圈交界那一像素撞上
const BACKDROP: Rgb = [196, 228, 196]

async function mount(attrs = ''): Promise<HTMLInputElement> {
  await page.viewport(640, 360)
  host = document.createElement('div')
  // 底色取一个既不是表面白、也不是品牌色的颜色：拇指的白底与品牌圈都分得出来
  host.setAttribute('style', `inline-size: 200px; padding: 16px; background: rgb(${BACKDROP.join(', ')})`)
  host.innerHTML = `
    <input type="range" min="0" max="100" value="50" aria-label="缩放" ${attrs}
      data-scope="image-cropper" class="xh-scope-image-cropper" data-part="zoom-slider">
    <div data-probe="brand" style="inline-size: 16px; block-size: 16px; background: var(--xh-bg-brand)"></div>
    <div data-probe="surface" style="inline-size: 16px; block-size: 16px; background: var(--xh-bg-surface)"></div>`
  document.body.append(host)
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  return host.querySelector<HTMLInputElement>('input')!
}

/** 值在正中时拇指的圆心：盒的正中。 */
function center(shot: Shot): { x: number, y: number } {
  return { x: Math.floor(shot.width / 2), y: Math.floor(shot.height / 2) }
}

describe('image-cropper 滑杆视觉', () => {
  it('样子不交给浏览器：原生外观收掉，输入盒高是细指针的命中下限、铺满所在的行', async () => {
    const slider = await mount()
    const style = getComputedStyle(slider)
    expect(style.appearance).toBe('none')
    expect(style.margin).toBe('0px')
    const box = slider.getBoundingClientRect()
    expect(box.height).toBe(24)
    expect(box.width).toBe(200)
  })

  it('拇指是品牌描边的白底圆，轨道是居中的细槽', async () => {
    const slider = await mount()
    const brand = await colorOf('brand')
    const surface = await colorOf('surface')
    const shot = await shoot(slider)
    const { x, y } = center(shot)
    const px = shot.scale

    // 拇指：直径 12，正中一列从上到下是 2 品牌圈 + 8 白底 + 2 品牌圈
    const thumb = runAt(shot, x, y, color => !sameColor(color, BACKDROP))
    expect(Math.abs(thumb - 12 * px), column(shot, x)).toBeLessThanOrEqual(1)
    // 白底与品牌圈交界的那一个像素是两色各半的抗锯齿，上下各让一个
    const face = runAt(shot, x, y, color => sameColor(color, surface))
    expect(Math.abs(face - 8 * px), column(shot, x)).toBeLessThanOrEqual(2)
    expect(sameColor(pixel(shot, x, y - 5 * px), brand), column(shot, x)).toBe(true)
    expect(sameColor(pixel(shot, x, y + 5 * px - 1), brand), column(shot, x)).toBe(true)
    // 圆的：外接方框的四角是底色，不是品牌色
    expect(pixel(shot, x - 6 * px, y - 6 * px), '外接方框的左上角').toEqual(BACKDROP)
    expect(pixel(shot, x + 6 * px - 1, y + 6 * px - 1), '外接方框的右下角').toEqual(BACKDROP)

    // 轨道：2px 的细槽，落在盒的中线上，颜色既不是底色也不是品牌色
    const trackX = 20 * px
    const track = runAt(shot, trackX, y, color => !sameColor(color, BACKDROP))
    expect(track, column(shot, trackX)).toBe(Math.round(2 * px))
    expect(sameColor(pixel(shot, trackX, y), brand), column(shot, trackX)).toBe(false)
    expect(pixel(shot, trackX, y - 3 * px), column(shot, trackX)).toEqual(BACKDROP)
    expect(pixel(shot, trackX, y + 3 * px), column(shot, trackX)).toEqual(BACKDROP)
  })

  it('焦点标在拇指上：输入盒自己不画环，拇指的白底缩小一圈', async () => {
    const slider = await mount()
    const surface = await colorOf('surface')
    slider.focus()
    expect(slider.matches(':focus-visible')).toBe(true)
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    expect(getComputedStyle(slider).outlineStyle).toBe('none')

    const shot = await shoot(slider)
    const { x, y } = center(shot)
    const px = shot.scale
    // 环画在品牌圈的内侧、仍在拇指自己的盒内：拇指还是 12，白底从 8 缩到 4
    const thumb = runAt(shot, x, y, color => !sameColor(color, BACKDROP))
    expect(Math.abs(thumb - 12 * px), column(shot, x)).toBeLessThanOrEqual(1)
    const face = runAt(shot, x, y, color => sameColor(color, surface))
    expect(Math.abs(face - 4 * px), column(shot, x)).toBeLessThanOrEqual(2)
    // 不聚焦时白底有 8 个像素高，这里量到的必须明显更小：环确实画上去了
    expect(face, column(shot, x)).toBeLessThan(6 * px)
    // 输入盒的四角没有环：盒的左上角与右下角仍是底色
    expect(sameColor(pixel(shot, 0, 0), BACKDROP)).toBe(true)
    expect(sameColor(pixel(shot, shot.width - 1, shot.height - 1), BACKDROP)).toBe(true)
  })

  it('禁用：拇指的描边退成中性色，不再是品牌色', async () => {
    const slider = await mount('disabled data-disabled')
    const brand = await colorOf('brand')
    const shot = await shoot(slider)
    const { x, y } = center(shot)
    const px = shot.scale
    const ring = pixel(shot, x, y - 5 * px)
    expect(sameColor(ring, brand)).toBe(false)
    expect(sameColor(ring, BACKDROP)).toBe(false)
    expect(getComputedStyle(slider).cursor).toBe('not-allowed')
  })

  it('粗指针：真实的盒放大到粗指针的命中下限（规则在样式表里，这里核它写的是哪一档）', () => {
    const found: string[] = []
    const collect = (rules: CSSRuleList, coarse: boolean): void => {
      for (const rule of rules) {
        if (rule instanceof CSSMediaRule)
          collect(rule.cssRules, coarse || /pointer:\s*coarse/.test(rule.conditionText))
        else if (rule instanceof CSSStyleRule && coarse && /xh-scope-image-cropper.*zoom-slider/.test(rule.selectorText))
          found.push(rule.style.getPropertyValue('min-block-size'))
        else if ('cssRules' in rule)
          collect((rule as CSSGroupingRule).cssRules, coarse)
      }
    }
    for (const sheet of document.styleSheets)
      collect(sheet.cssRules, false)
    expect(found).toEqual(['var(--xh-control-hit-coarse)'])
  })
})
