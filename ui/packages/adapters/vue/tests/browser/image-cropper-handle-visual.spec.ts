import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(radius: string) {
  host?.remove()
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="image-cropper" data-part="root" style="--xh-_image-cropper-zoom: 1; inline-size: 320px">
      <div data-scope="image-cropper" data-part="crop-area" style="position: relative; inline-size: 200px; block-size: 120px; border-radius: ${radius}">
        <span data-scope="image-cropper" data-part="crop-handle" data-position="n"></span>
        <span data-scope="image-cropper" data-part="crop-handle" data-position="e"></span>
        <span data-scope="image-cropper" data-part="crop-handle" data-position="se"></span>
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
  it('边缘短条和角部折角只向裁切框内部绘制', () => {
    const cropper = mount('12px')
    const cropRect = cropper.cropArea.getBoundingClientRect()
    const northRect = cropper.north.getBoundingClientRect()
    const eastRect = cropper.east.getBoundingClientRect()
    const cornerRect = cropper.corner.getBoundingClientRect()
    const cropStyle = getComputedStyle(cropper.cropArea)
    const northIndicator = getComputedStyle(cropper.north, '::after')
    const eastIndicator = getComputedStyle(cropper.east, '::after')
    const cornerIndicator = getComputedStyle(cropper.corner, '::after')

    expect(northRect.top + northRect.height / 2).toBeCloseTo(
      cropRect.top + Number.parseFloat(cropStyle.borderTopWidth),
      5,
    )
    expect(eastRect.left + eastRect.width / 2).toBeCloseTo(
      cropRect.right - Number.parseFloat(cropStyle.borderRightWidth),
      5,
    )
    expect(Number.parseFloat(northIndicator.inlineSize)).toBe(32)
    expect(Number.parseFloat(northIndicator.blockSize)).toBe(2)
    expect(Number.parseFloat(eastIndicator.inlineSize)).toBe(2)
    expect(Number.parseFloat(eastIndicator.blockSize)).toBe(32)
    expect(cornerRect.left + Number.parseFloat(cornerIndicator.inlineSize)).toBeCloseTo(
      cropRect.right - Number.parseFloat(cropStyle.borderRightWidth),
      5,
    )
    expect(cornerRect.top + Number.parseFloat(cornerIndicator.blockSize)).toBeCloseTo(
      cropRect.bottom - Number.parseFloat(cropStyle.borderBottomWidth),
      5,
    )
  })

  it('角部折角继承矩形或圆形裁切框的形状', () => {
    const rounded = mount('50%')
    expect(getComputedStyle(rounded.corner).borderBottomRightRadius).toBe('50%')
    expect(getComputedStyle(rounded.corner, '::after').borderBottomRightRadius).toBe('50%')

    const square = mount('0px')
    expect(getComputedStyle(square.corner).borderBottomRightRadius).toBe('0px')
    expect(getComputedStyle(square.corner, '::after').borderBottomRightRadius).toBe('0px')
  })
})
