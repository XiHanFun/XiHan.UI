// 字段里的内嵌钮（清空、显示密码、展开……）悬停时浮出的那块面，不贴着字段的聚焦环。
//
// 钮的命中盒比字段盒矮一档（28 / 32 / 36 的字段里是 24 / 28 / 32），上下各离盒沿 2px——正好是一个环宽。
// 面若铺满命中盒，字段聚焦时它的上下沿就顶在环上：圆面像被环夹住，方面的圆角也与字段盒不同心。
// 面要比命中盒再内收一圈：环之内留出与环同宽的一道空，命中盒不变。
// 量的是截图：从字段盒的上沿往下数，环、空、面依次各有几个像素。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../../src'
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
  if (scale < 1)
    throw new Error(`截图按 ${scale} 缩小过，量不准：把 page.viewport 调小`)
  return { data, width: bitmap.width, height: bitmap.height, scale }
}

function pixel(shot: Shot, x: number, y: number): Rgb {
  const i = (Math.round(y) * shot.width + Math.round(x)) * 4
  return [shot.data[i]!, shot.data[i + 1]!, shot.data[i + 2]!]
}

function sameColor(a: Rgb, b: Rgb): boolean {
  return a.every((channel, i) => Math.abs(channel - b[i]!) <= 4)
}

/** 一列像素的读数：断言不过时附在报错里。 */
function column(shot: Shot, x: number): string {
  return Array.from({ length: shot.height }, (_, y) => pixel(shot, x, y).join(',')).join(' | ')
}

async function settle(element: HTMLElement): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await expect.poll(() => element.getAnimations({ subtree: true }).length, { timeout: 2000 }).toBe(0)
}

type Size = 'sm' | 'md' | 'lg'

async function mount(render: () => VNode): Promise<{ control: HTMLElement, input: HTMLInputElement }> {
  await page.viewport(640, 360)
  host = document.createElement('div')
  host.style.inlineSize = '260px'
  host.style.padding = '16px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  const input = host.querySelector<HTMLInputElement>('input')!
  const control = host.querySelector<HTMLElement>('[data-xh-field-chrome]')!
  input.focus()
  await settle(control)
  return { control, input }
}

/**
 * 指针停在钮上之后，沿钮的正中一列从字段盒上沿往下量：环有多厚、环与面之间空了多少、面有多高。
 * 底色取字段盒里远离钮的一点（聚焦后是承载面的白）。
 */
async function measure(control: HTMLElement, trigger: HTMLElement): Promise<{ ring: number, clear: number, face: number, scale: number, readout: string }> {
  await userEvent.hover(trigger)
  await settle(control)
  const shot = await shoot(control)
  const box = control.getBoundingClientRect()
  const hit = trigger.getBoundingClientRect()
  const x = Math.round((hit.left - box.left + hit.width / 2) * shot.scale)
  // 钮与输入区之间的那一点：既不在钮上也不在字上
  const surface = pixel(shot, Math.round((hit.left - box.left - 2) * shot.scale), Math.round(shot.height / 2))
  let y = 0
  while (y < shot.height && !sameColor(pixel(shot, x, y), surface))
    y++
  const ring = y
  while (y < shot.height && sameColor(pixel(shot, x, y), surface))
    y++
  const clear = y - ring
  // 面的高度：从这里量到下面再回到底色为止（面正中是字形，颜色不同但不是底色）
  let bottom = shot.height - 1
  while (bottom > y && !sameColor(pixel(shot, x, bottom), surface))
    bottom--
  while (bottom > y && sameColor(pixel(shot, x, bottom), surface))
    bottom--
  return { ring, clear, face: bottom - y + 1, scale: shot.scale, readout: column(shot, x) }
}

/** 字段盒高、命中盒边长、面的边长：三档各一行。 */
const SIZES: Array<[Size, number, number, number]> = [
  ['sm', 28, 24, 20],
  ['md', 32, 28, 24],
  ['lg', 36, 32, 28],
]

describe('字段内嵌钮的面不贴聚焦环', () => {
  for (const [size, boxHeight, hitSize, faceSize] of SIZES) {
    it(`清空钮（${size}）：命中盒 ${hitSize}，圆面 ${faceSize}，环之内空出一个环宽`, async () => {
      const { control } = await mount(() => h(XhTextFieldRoot, { defaultValue: 'admin', clearable: true, size }, () =>
        h(XhTextFieldControl, null, () => [
          h(XhTextFieldInput, { 'aria-label': '账号' }),
          h(XhTextFieldClearTrigger),
        ])))
      const trigger = control.querySelector<HTMLElement>('[data-part="clear-trigger"]')!
      expect(control.getBoundingClientRect().height).toBe(boxHeight)
      // 命中盒不变：指针够得着的范围不因为面内收而变小
      const hit = trigger.getBoundingClientRect()
      expect([hit.width, hit.height]).toEqual([hitSize, hitSize])

      const { ring, clear, face, scale, readout } = await measure(control, trigger)
      // 聚焦环是一个环宽（2px）
      expect(ring, readout).toBe(Math.round(2 * scale))
      // 环与面之间空出不少于一个环宽
      expect(clear, readout).toBeGreaterThanOrEqual(Math.round(2 * scale))
      // 面比命中盒小一圈（圆的上下两端各有一个像素的抗锯齿）
      expect(Math.abs(face - faceSize * scale), readout).toBeLessThanOrEqual(2)
    })
  }

  it('方形的内嵌钮（显示密码）同一条：面内收之后圆角仍是内嵌档，与字段盒同心', async () => {
    const { control } = await mount(() => h(XhPasswordInputRoot, { defaultValue: 'secret' }, () =>
      h(XhPasswordInputControl, null, () => [
        h(XhPasswordInputInput, { 'aria-label': '密码' }),
        h(XhPasswordInputVisibilityTrigger, { 'aria-label': '显示密码' }),
      ])))
    const trigger = control.querySelector<HTMLElement>('[data-part="visibility-trigger"]')!
    const hit = trigger.getBoundingClientRect()
    expect([hit.width, hit.height]).toEqual([28, 28])
    const { ring, clear, face, scale, readout } = await measure(control, trigger)
    expect(ring, readout).toBe(Math.round(2 * scale))
    expect(clear, readout).toBeGreaterThanOrEqual(Math.round(2 * scale))
    expect(Math.abs(face - 24 * scale), readout).toBeLessThanOrEqual(1)
    // 面的四角：外接方框的角上是底色（圆角 4px），往里 4px 的对角线上已经是面
    const shot = await shoot(control)
    const box = control.getBoundingClientRect()
    const left = Math.round((hit.left - box.left + 2) * shot.scale)
    const top = Math.round((hit.top - box.top + 2) * shot.scale)
    const surface = pixel(shot, Math.round((hit.left - box.left - 2) * shot.scale), Math.round(shot.height / 2))
    expect(sameColor(pixel(shot, left, top), surface), '面的左上角该被圆角切掉').toBe(true)
    expect(sameColor(pixel(shot, left + Math.round(2 * shot.scale), top + Math.round(2 * shot.scale)), surface), '圆角不该大过内嵌档').toBe(false)
  })
})
