// 粗指针下滑块控件的命中区：伪元素沿交叉轴外扩，补足到粗指针命中下限 44px（--xh-control-hit-coarse）。
// 外扩量按「下限 − 拇指直径」算，最小的 sm 档拇指也要到下限；朝标签那一侧不越过标签与控件之间的间距，
// 点在标签上仍落在标签上，不会直接跳值——少扩的那一截挪到另一侧补齐。
import { afterEach, describe, expect, it } from 'vitest'
import { coarsePointer, finePointer, pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 粗指针命中区下限（WCAG 2.5.5）。 */
const COARSE_MIN = 44

let host: HTMLElement | null = null

afterEach(async () => {
  await finePointer()
  host?.remove()
  host = null
})

/** 带标签的静态滑块：横排时标签在控件上方，竖排时标签仍在上方、控件沿块轴伸长。 */
function mount(size: 'sm' | 'md' | 'lg', orientation: 'horizontal' | 'vertical' = 'horizontal') {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 240px; padding: 64px'
  const sized = size === 'md' ? '' : ` data-size="${size}"`
  host.innerHTML = `
    <div data-scope="slider" class="xh-scope-slider" data-part="root" data-orientation="${orientation}"${sized}>
      <label data-scope="slider" class="xh-scope-slider" data-part="label">音量</label>
      <div data-scope="slider" class="xh-scope-slider" data-part="control" data-orientation="${orientation}">
        <div data-scope="slider" class="xh-scope-slider" data-part="track" data-orientation="${orientation}"></div>
        <div data-scope="slider" class="xh-scope-slider" data-part="thumb" data-orientation="${orientation}" role="slider" tabindex="0" style="${orientation === 'horizontal' ? 'inset-inline-start' : 'inset-block-end'}:90%"></div>
      </div>
    </div>`
  document.body.append(host)
  const part = (name: string) => host!.querySelector<HTMLElement>(`[data-part="${name}"]`)!
  return { root: part('root'), label: part('label'), control: part('control'), thumb: part('thumb') }
}

describe('粗指针下的滑块命中区', () => {
  it.each(['sm', 'md', 'lg'] as const)('%s 档横排：命中区沿块轴补足到粗指针下限', async (size) => {
    await coarsePointer()
    const { control } = mount(size)
    const box = pseudoBox(control, '::before')
    const rect = control.getBoundingClientRect()
    const observed = `::before ${JSON.stringify(box)} control ${JSON.stringify(rect)}`
    expect(box.height, observed).toBeGreaterThanOrEqual(COARSE_MIN)
    expect(box.width, observed).toBe(rect.width)
    // 落指实测：命中区上下两缘内侧一像素都归控件
    const x = rect.left + rect.width / 4
    expect(document.elementFromPoint(x, box.y + 1), observed).toBe(control)
    expect(document.elementFromPoint(x, box.y + box.height - 1), observed).toBe(control)
  })

  it.each(['sm', 'md', 'lg'] as const)('%s 档横排：命中区不越过标签与控件之间的间距，点在标签下缘仍归标签', async (size) => {
    await coarsePointer()
    const { label, control } = mount(size)
    const labelRect = label.getBoundingClientRect()
    const box = pseudoBox(control, '::before')
    expect(box.y, `::before ${JSON.stringify(box)} label ${JSON.stringify(labelRect)}`).toBeGreaterThanOrEqual(labelRect.bottom)
    const hit = document.elementFromPoint(labelRect.left + 4, labelRect.bottom - 1)
    expect(hit === label || label.contains(hit)).toBe(true)
  })

  it.each(['sm', 'md', 'lg'] as const)('%s 档竖排：命中区沿行内轴两侧对称补足到下限', async (size) => {
    await coarsePointer()
    const { control } = mount(size, 'vertical')
    const box = pseudoBox(control, '::before')
    const rect = control.getBoundingClientRect()
    const observed = `::before ${JSON.stringify(box)} control ${JSON.stringify(rect)}`
    expect(box.width, observed).toBeGreaterThanOrEqual(COARSE_MIN)
    expect(box.height, observed).toBe(rect.height)
    expect(Math.abs(box.centerX - (rect.left + rect.width / 2)), observed).toBeLessThanOrEqual(0.5)
    const y = rect.top + rect.height / 2
    expect(document.elementFromPoint(box.x + 1, y), observed).toBe(control)
    expect(document.elementFromPoint(box.x + box.width - 1, y), observed).toBe(control)
  })
})
