// 浏览器自动填充（密码管理器、表单历史的预览与填入）时，皮肤在输入框里铺一整块底，盖掉浏览器强加的底色。
// 这块底若一直铺到输入框的上下沿，就把外框聚焦环内侧那条线在输入框范围内盖住：环在这一段只剩一半粗，
// 行尾按钮那一段却是完整的。
//
// :autofill 这个状态脚本造不出来。这里把皮肤给它的那几条声明原样抄到输入框上（浏览器自己那层底色在这块底下面，
// 抄不抄都一样），量截图里上下沿的环有几个像素厚：输入框那一段与行尾那一段必须一样。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTextFieldClearTrigger, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

/** scale：截图里一个 CSS 像素占几个图上的像素（设备像素比，或运行器把页面整体缩放过）。 */
interface Shot { data: Uint8ClampedArray, width: number, height: number, scale: number }

async function shoot(element: HTMLElement): Promise<Shot> {
  const base64 = await page.screenshot({ element, save: false })
  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob()
  const bitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const context = canvas.getContext('2d')!
  context.drawImage(bitmap, 0, 0)
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height)
  const scale = bitmap.width / element.getBoundingClientRect().width
  // 测试页比运行器的窗口高时会被整体缩小，一像素的线经重采样糊掉、颜色也对不上——视口要留在窗口以内
  if (scale < 1)
    throw new Error(`截图按 ${scale} 缩小过，环的厚度量不准：把 page.viewport 调小`)
  return { data, width: bitmap.width, height: bitmap.height, scale }
}

function pixel(shot: Shot, x: number, y: number): [number, number, number] {
  const i = (y * shot.width + x) * 4
  return [shot.data[i]!, shot.data[i + 1]!, shot.data[i + 2]!]
}

function sameColor(a: readonly number[], b: readonly number[]): boolean {
  return a.every((channel, i) => Math.abs(channel - b[i]!) <= 6)
}

/**
 * 皮肤给自动填充态的全部声明：套在外壳里的输入框会同时命中好几条规则，按出现次序全抄上。
 * 规则住在 @layer 里，逐层往下找。
 */
function autofillDeclarations(): string {
  const found: string[] = []
  const collect = (rules: CSSRuleList): void => {
    for (const rule of rules) {
      // 强制色档里另有一组同名规则，不取
      if (rule instanceof CSSMediaRule)
        continue
      if (rule instanceof CSSStyleRule && /\[data-xh-field-input\]:(?:-webkit-)?autofill$/.test(rule.selectorText))
        found.push(rule.style.cssText)
      else if ('cssRules' in rule)
        collect((rule as CSSGroupingRule).cssRules)
    }
  }
  for (const sheet of document.styleSheets)
    collect(sheet.cssRules)
  if (found.length === 0)
    throw new Error('样式表里找不到自动填充态的规则')
  return found.join(';')
}

async function mountFocused(): Promise<{ control: HTMLElement, input: HTMLInputElement }> {
  await page.viewport(640, 360)
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  host.style.padding = '8px'
  // 换色不过渡：量的是落定之后的环
  host.style.setProperty('--xh-motion-duration-color', '0s')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTextFieldRoot, { defaultValue: 'admin', clearable: true }, () =>
      h(XhTextFieldControl, null, () => [
        h(XhTextFieldInput, { 'aria-label': '账号' }),
        h(XhTextFieldClearTrigger),
      ])),
  })
  app.mount(host)
  await nextTick()
  const input = host.querySelector<HTMLInputElement>('input')!
  input.focus()
  const control = host.querySelector<HTMLElement>('[data-scope="text-field"][data-part="control"]')!
  // 聚焦换环有过渡：等它播完再量，过渡途中的环色对不上
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await expect.poll(() => control.getAnimations().length, { timeout: 2000 }).toBe(0)
  return { control, input }
}

/** 某一列上，从上沿（或下沿）往里数，连续有几个像素是环的颜色。 */
function ringDepth(shot: Shot, x: number, from: 'top' | 'bottom', ring: readonly number[]): number {
  let depth = 0
  for (let step = 0; step < 12; step++) {
    const y = from === 'top' ? step : shot.height - 1 - step
    if (!sameColor(pixel(shot, x, y), ring))
      break
    depth++
  }
  return depth
}

describe('自动填充时聚焦环不被输入框里那块底盖住', () => {
  it('上下沿的环在输入框那一段与行尾那一段一样厚', async () => {
    const { control, input } = await mountFocused()
    input.style.cssText += autofillDeclarations()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

    const shot = await shoot(control)
    const box = control.getBoundingClientRect()
    const inputBox = input.getBoundingClientRect()
    // 环的颜色取左沿正中：那里左右没有输入框，怎么都是完整的环
    const ring = pixel(shot, 0, Math.floor(shot.height / 2))
    const overInput = Math.round((inputBox.left - box.left + inputBox.width / 2) * shot.scale)
    const overTail = Math.round(((inputBox.right - box.left + box.width) / 2) * shot.scale)

    const tail = ringDepth(shot, overTail, 'top', ring)
    // 一个环宽是两个 CSS 像素：描边一个，内侧线一个
    expect(tail).toBeGreaterThanOrEqual(Math.floor(2 * shot.scale))
    expect(ringDepth(shot, overInput, 'top', ring)).toBe(tail)
    expect(ringDepth(shot, overInput, 'bottom', ring)).toBe(ringDepth(shot, overTail, 'bottom', ring))
  })

  it('不在自动填充态时本来就一样厚（对照）', async () => {
    const { control, input } = await mountFocused()
    const shot = await shoot(control)
    const box = control.getBoundingClientRect()
    const inputBox = input.getBoundingClientRect()
    const ring = pixel(shot, 0, Math.floor(shot.height / 2))
    const overInput = Math.round((inputBox.left - box.left + inputBox.width / 2) * shot.scale)
    const overTail = Math.round(((inputBox.right - box.left + box.width) / 2) * shot.scale)
    const tail = ringDepth(shot, overTail, 'top', ring)
    expect(tail).toBeGreaterThanOrEqual(Math.floor(2 * shot.scale))
    expect(ringDepth(shot, overInput, 'top', ring)).toBe(tail)
  })
})
