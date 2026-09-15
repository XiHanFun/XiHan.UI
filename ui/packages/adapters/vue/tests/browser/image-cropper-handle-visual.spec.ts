import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(radius: string, shape: 'rect' | 'round' = 'rect') {
  host?.remove()
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="image-cropper" data-part="root" style="--xh-_image-cropper-zoom: 1; inline-size: 320px">
      <div data-scope="image-cropper" data-part="crop-area" data-shape="${shape}" style="position: relative; inline-size: 200px; block-size: 120px; border-radius: ${radius}">
        <span data-scope="image-cropper" data-part="crop-handle" data-position="n"></span>
        <span data-scope="image-cropper" data-part="crop-handle" data-position="e" tabindex="0"></span>
        <span data-scope="image-cropper" data-part="crop-handle" data-position="se" tabindex="0"></span>
      </div>
    </div>`
  document.body.append(host)

  return {
    cropArea: host.querySelector<HTMLElement>('[data-part="crop-area"]')!,
    north: host.querySelector<HTMLElement>('[data-position="n"]')!,
    east: host.querySelector<HTMLElement>('[data-position="e"]')!,
    corner: host.querySelector<HTMLElement>('[data-position="se"]')!,
  }
}

describe('image-cropper 把手视觉', () => {
  it('边缘短条贴住裁切框边框，并与 resizable 使用相同的厚度和圆端', () => {
    const cropper = mount('12px')
    const cropRect = cropper.cropArea.getBoundingClientRect()
    const northRect = cropper.north.getBoundingClientRect()
    const eastRect = cropper.east.getBoundingClientRect()
    const cornerRect = cropper.corner.getBoundingClientRect()
    const cropStyle = getComputedStyle(cropper.cropArea)
    const northIndicator = getComputedStyle(cropper.north, '::after')
    const eastIndicator = getComputedStyle(cropper.east, '::after')
    const cornerIndicator = getComputedStyle(cropper.corner, '::after')

    expect(northRect.top + Number.parseFloat(northIndicator.top)).toBeCloseTo(
      cropRect.top + Number.parseFloat(cropStyle.borderTopWidth),
      5,
    )
    expect(eastRect.right - Number.parseFloat(eastIndicator.right)).toBeCloseTo(
      cropRect.right - Number.parseFloat(cropStyle.borderRightWidth),
      5,
    )
    expect(Number.parseFloat(northIndicator.inlineSize)).toBe(32)
    expect(Number.parseFloat(northIndicator.blockSize)).toBe(3)
    expect(Number.parseFloat(eastIndicator.inlineSize)).toBe(3)
    expect(Number.parseFloat(eastIndicator.blockSize)).toBe(32)
    expect(northIndicator.borderRadius).toBe('9999px')
    expect(eastIndicator.borderRadius).toBe('9999px')
    expect(northIndicator.outlineStyle).toBe('none')
    expect(eastIndicator.outlineStyle).toBe('none')
    expect(cornerRect.left + Number.parseFloat(cornerIndicator.inlineSize)).toBeCloseTo(
      cropRect.right - Number.parseFloat(cropStyle.borderRightWidth),
      5,
    )
    expect(cornerRect.top + Number.parseFloat(cornerIndicator.blockSize)).toBeCloseTo(
      cropRect.bottom - Number.parseFloat(cropStyle.borderBottomWidth),
      5,
    )
  })

  it('角部折角只圆对应的外侧拐角，矩形与圆形裁切各用自己的形状', () => {
    const rounded = mount('50%', 'round')
    const roundedIndicator = getComputedStyle(rounded.corner, '::after')
    expect(roundedIndicator.borderTopLeftRadius).toBe('0px')
    expect(roundedIndicator.borderBottomRightRadius).toBe('50%')

    const square = mount('0px')
    const squareIndicator = getComputedStyle(square.corner, '::after')
    expect(squareIndicator.borderTopLeftRadius).toBe('0px')
    expect(squareIndicator.borderBottomRightRadius).toBe('4px')
  })

  it('聚焦时高亮指示器本身，不给透明命中盒或伪元素画外框', async () => {
    const cropper = mount('0px')
    const edgeIdle = getComputedStyle(cropper.east, '::after').backgroundColor
    const cornerIdle = getComputedStyle(cropper.corner, '::after').borderBottomColor

    await userEvent.tab()
    await new Promise(resolve => setTimeout(resolve, 150))
    const edgeIndicator = getComputedStyle(cropper.east, '::after')
    expect(document.activeElement).toBe(cropper.east)
    expect(getComputedStyle(cropper.east).outlineStyle).toBe('none')
    expect(edgeIndicator.outlineStyle).toBe('none')
    expect(edgeIndicator.backgroundColor).not.toBe(edgeIdle)

    await userEvent.tab()
    await new Promise(resolve => setTimeout(resolve, 150))
    const cornerIndicator = getComputedStyle(cropper.corner, '::after')
    expect(document.activeElement).toBe(cropper.corner)
    expect(getComputedStyle(cropper.corner).outlineStyle).toBe('none')
    expect(cornerIndicator.outlineStyle).toBe('none')
    expect(cornerIndicator.borderBottomColor).not.toBe(cornerIdle)
    expect(cornerIndicator.borderBottomRightRadius).toBe('4px')
  })
})
