// 不能悬停的设备上评分星的放大：点过之后残留的 :hover 不算悬停。要开触屏仿真，单独成份：
// Linux 无头 Chromium 关过一次触屏仿真，同一页面的 (hover) 就再也回不到 hover，悬停放大那几条在 rating-label-press-visual.spec.ts。
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
  host?.remove()
  host = null
})

/** 星接 Action Control icon 档，连接层投影的家族属性在静态夹具里照抄 */
const STAR = 'data-xh-action-control data-xh-action-profile="icon" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="xs"'

function mountStar(): HTMLElement {
  host = document.createElement('div')
  // 断言读的是终值：按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  host.innerHTML = `
    <div data-scope="rating" class="xh-scope-rating" data-part="root">
      <div data-scope="rating" class="xh-scope-rating" data-part="control">
        <span data-scope="rating" class="xh-scope-rating" data-part="item" data-highlighted ${STAR}></span>
      </div>
    </div>`
  document.body.append(host)
  return host.querySelector<HTMLElement>('[data-part="item"]')!
}

describe('rating 粗指针', () => {
  it('不能悬停的设备：点过之后残留的 :hover 不把星停在放大态，按下仍放大', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    const item = mountStar()
    const emphasis = getComputedStyle(document.documentElement).getPropertyValue('--xh-motion-scale-emphasis').trim()
    expect(Number(emphasis)).toBeGreaterThan(1)
    expect(matchMedia('(hover: hover)').matches).toBe(false)
    await userEvent.hover(item)
    expect(item.matches(':hover')).toBe(true)
    expect(getComputedStyle(item).scale).toBe('none')
    item.setAttribute('data-pressed', '')
    expect(getComputedStyle(item).scale).toBe(emphasis)
    item.removeAttribute('data-pressed')
    await userEvent.unhover(item)
  })
})
