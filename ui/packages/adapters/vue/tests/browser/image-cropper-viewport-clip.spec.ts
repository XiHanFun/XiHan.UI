// 裁切框的把手骑在框的边界上，框贴着图片边缘时把手有一半伸出视口。
// 视口若是可滚的裁切（overflow: hidden 仍是滚动容器），把手一拿到焦点——按住它时连接层把焦点交给它、或键盘 Tab 到它——
// 浏览器就把视口滚过去好让焦点元素「可见」：整张图与裁切框一起朝左上挪几个像素，右边和下边露出一条底色，
// 看上去像图片缩小了一圈，而且松手也不回来。视口必须是不可滚的裁切。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount() {
  host = document.createElement('div')
  // 裁切框铺满整张图：四个角的把手都有一半伸在视口外面
  host.innerHTML = `
    <div data-scope="image-cropper" class="xh-scope-image-cropper" data-part="root" style="--xh-_image-cropper-zoom: 1; inline-size: 320px">
      <div data-scope="image-cropper" class="xh-scope-image-cropper" data-part="viewport">
        <div data-scope="image-cropper" class="xh-scope-image-cropper" data-part="image" style="block-size: 200px"></div>
        <div data-scope="image-cropper" class="xh-scope-image-cropper" data-part="crop-area" data-shape="rect" style="left: 0%; top: 0%; width: 100%; height: 100%">
          <span data-scope="image-cropper" class="xh-scope-image-cropper" data-part="crop-handle" data-position="nw" tabindex="0"></span>
          <span data-scope="image-cropper" class="xh-scope-image-cropper" data-part="crop-handle" data-position="se" tabindex="0"></span>
        </div>
      </div>
    </div>`
  document.body.append(host)
  return {
    viewport: host.querySelector<HTMLElement>('[data-part="viewport"]')!,
    cropArea: host.querySelector<HTMLElement>('[data-part="crop-area"]')!,
    southEast: host.querySelector<HTMLElement>('[data-position="se"]')!,
  }
}

describe('image-cropper 视口不随把手的焦点滚动', () => {
  it('把手确实有一部分伸在视口外（否则下面两条量不出东西）', () => {
    const { viewport, southEast } = mount()
    const frame = viewport.getBoundingClientRect()
    const handle = southEast.getBoundingClientRect()
    expect(handle.right).toBeGreaterThan(frame.right)
    expect(handle.bottom).toBeGreaterThan(frame.bottom)
  })

  it('把手拿到焦点：视口不滚，裁切框留在原地', () => {
    const { viewport, cropArea, southEast } = mount()
    const before = cropArea.getBoundingClientRect()
    southEast.focus()
    expect(document.activeElement).toBe(southEast)
    expect([viewport.scrollLeft, viewport.scrollTop]).toEqual([0, 0])
    const after = cropArea.getBoundingClientRect()
    expect([after.left, after.top]).toEqual([before.left, before.top])
  })

  it('视口仍然裁切：伸出去的那一半把手不外露，也不撑出页面的滚动区', () => {
    const { viewport } = mount()
    const style = getComputedStyle(viewport)
    expect(style.overflowX).toBe('clip')
    expect(style.overflowY).toBe('clip')
  })
})
