import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount() {
  host = document.createElement('div')
  host.style.cssText = 'position: relative; block-size: 160px; inline-size: 120px;'
  host.innerHTML = `
    <div data-scope="scrollbar" data-part="root" data-orientation="vertical" data-state="visible">
      <div data-scope="scrollbar" data-part="track">
        <div data-scope="scrollbar" data-part="thumb" data-orientation="vertical" style="inset-block-start: 0; block-size: 64px"></div>
      </div>
    </div>`
  document.body.append(host)

  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    track: host.querySelector<HTMLElement>('[data-part="track"]')!,
    thumb: host.querySelector<HTMLElement>('[data-part="thumb"]')!,
  }
}

describe('scrollbar 默认视觉', () => {
  it('透明轨道只显示内收的细滑块', () => {
    const scrollbar = mount()
    const rootStyle = getComputedStyle(scrollbar.root)
    const trackStyle = getComputedStyle(scrollbar.track)
    const thumbStyle = getComputedStyle(scrollbar.thumb)

    expect(trackStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(thumbStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(thumbStyle.inlineSize)).toBeLessThan(Number.parseFloat(rootStyle.inlineSize))
    expect(Number.parseFloat(thumbStyle.borderRadius)).toBeGreaterThanOrEqual(scrollbar.thumb.offsetWidth / 2)
  })

  it('悬停只增强滑块对比，不显形轨道', async () => {
    const scrollbar = mount()
    const idle = getComputedStyle(scrollbar.thumb).backgroundColor

    await userEvent.hover(scrollbar.thumb)
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(getComputedStyle(scrollbar.thumb).backgroundColor).not.toBe(idle)
    expect(getComputedStyle(scrollbar.track).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })
})
