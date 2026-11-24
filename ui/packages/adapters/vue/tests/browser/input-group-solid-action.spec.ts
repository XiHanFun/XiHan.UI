// 输入组里的实心按钮：面铺到组的外沿，组壳那道中性描边不压在它上面。
//
// 组壳的描边画在一层盖住各段的伪元素上。实心按钮的面是有颜色的，半透明的中性描边压上去，
// 按钮的上、下与外侧就多出一圈发暗的边：看上去按钮比旁边的输入区高出一个像素，颜色也脏。
// 悬停时按钮本来就抬到描边之上；静息时也该如此，前后一致。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhButton, XhInputGroupRoot, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
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

function column(shot: Shot, x: number): string {
  return Array.from({ length: shot.height }, (_, y) => pixel(shot, x, y).join(',')).join(' | ')
}

async function mount(buttonProps: Record<string, unknown> = {}): Promise<{ group: HTMLElement, button: HTMLElement, input: HTMLInputElement }> {
  await page.viewport(640, 360)
  host = document.createElement('div')
  // 灰底：输入区的白与按钮的色都分得出来，描边压没压在按钮上一眼可见
  host.setAttribute('style', 'inline-size: 320px; padding: 16px; background: rgb(240, 242, 245)')
  document.body.append(host)
  app = createApp({
    render: () => h(XhInputGroupRoot, null, () => [
      h(XhTextFieldRoot, { placeholder: '搜索文档' }, () =>
        h(XhTextFieldControl, null, () => h(XhTextFieldInput, { 'aria-label': '搜索文档' }))),
      h(XhButton, { variant: 'solid', ...buttonProps }, () => '搜索'),
    ]),
  })
  app.mount(host)
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  const group = host.querySelector<HTMLElement>('[data-scope="input-group"][data-part="root"]')!
  await expect.poll(() => group.getAnimations({ subtree: true }).length, { timeout: 2000 }).toBe(0)
  return {
    group,
    button: group.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')!,
    input: group.querySelector<HTMLInputElement>('input')!,
  }
}

describe('输入组里的实心按钮压在组壳描边之上', () => {
  it('静息：按钮的面从上沿到下沿是同一个颜色，没有被中性描边压出一圈暗边', async () => {
    const { group, button } = await mount()
    const shot = await shoot(group)
    const box = group.getBoundingClientRect()
    const hit = button.getBoundingClientRect()
    expect(hit.height).toBe(box.height)
    // 按钮起始侧往里 4px 的一列：离字远，离圆角也远
    const x = Math.round((hit.left - box.left + 4) * shot.scale)
    const fill = pixel(shot, x, Math.round(shot.height / 2))
    expect(sameColor(pixel(shot, x, 0), fill), column(shot, x)).toBe(true)
    expect(sameColor(pixel(shot, x, shot.height - 1), fill), column(shot, x)).toBe(true)
    // 输入区那一段照旧有描边：上沿那一个像素不是输入区里面的底色
    const overInput = Math.round(40 * shot.scale)
    expect(sameColor(pixel(shot, overInput, 0), pixel(shot, overInput, Math.round(shot.height / 2))), column(shot, overInput)).toBe(false)
  })

  it('输入框聚焦：组壳的聚焦环同样不压在按钮上', async () => {
    const { group, button, input } = await mount()
    input.focus()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    await expect.poll(() => group.getAnimations({ subtree: true }).length, { timeout: 2000 }).toBe(0)
    const shot = await shoot(group)
    const box = group.getBoundingClientRect()
    const hit = button.getBoundingClientRect()
    const x = Math.round((hit.left - box.left + 4) * shot.scale)
    const fill = pixel(shot, x, Math.round(shot.height / 2))
    expect(sameColor(pixel(shot, x, 0), fill), column(shot, x)).toBe(true)
    expect(sameColor(pixel(shot, x, Math.round(1 * shot.scale)), fill), column(shot, x)).toBe(true)
  })

  it('按钮包在宿主元素里一层（Web Components 的 <xh-button>）：抬的是组的那个直接子节点', () => {
    host = document.createElement('div')
    const markup = (attrs: string) => `
      <div data-scope="input-group" class="xh-scope-input-group" data-part="root">
        <span data-wrapper>
          <button data-scope="button" class="xh-scope-button" data-part="root" data-xh-action-control
            data-xh-action-profile="text" data-xh-action-size="md" data-xh-action-variant="solid" ${attrs}>搜索</button>
        </span>
      </div>`
    host.innerHTML = markup('') + markup('data-disabled disabled')
    document.body.append(host)
    const [lifted, flat] = [...host.querySelectorAll<HTMLElement>('[data-wrapper]')]
    // 与组壳描边那一层同号、排在它后面：压在描边之上
    expect(getComputedStyle(lifted!).zIndex).toBe('2')
    expect(getComputedStyle(flat!).zIndex).toBe('auto')
  })

  it('禁用的实心按钮退成中性面，不抬到描边之上：组壳的外轮廓在它那一段照旧画着', async () => {
    const { group, button } = await mount({ disabled: true })
    const shot = await shoot(group)
    const box = group.getBoundingClientRect()
    const hit = button.getBoundingClientRect()
    const x = Math.round((hit.left - box.left + 4) * shot.scale)
    const fill = pixel(shot, x, Math.round(shot.height / 2))
    expect(sameColor(pixel(shot, x, 0), fill), column(shot, x)).toBe(false)
  })
})
