// 跑马灯的速度是每秒像素数：一圈的行程 ÷ 一圈的时长 = speed，窗口宽窄不改变它。
// 行程取自实测的轨道长度，只有真实浏览器排得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhMarqueeContent, XhMarqueeRoot } from '../../src'
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

function content(): HTMLElement {
  return host!.querySelector<HTMLElement>('[data-scope="marquee"][data-part="content"]')!
}

/** 每秒实际走过的像素：一份时一圈走两倍轨道长，铺两份时走一份的长度（半条轨道）。 */
async function pixelsPerSecond(width: number, autoFill: boolean): Promise<number> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  app = createApp({
    render: () => h(XhMarqueeRoot, { speed: 100, autoFill }, () => h(XhMarqueeContent, null, () => '通知：系统将于今晚进行维护，届时部分功能暂不可用')),
  })
  app.mount(host)
  // 挂载后量一次、写回根上，再过一帧样式落定
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  const track = content()
  const seconds = Number.parseFloat(getComputedStyle(track).animationDuration)
  const travel = autoFill ? track.offsetWidth / 2 : track.offsetWidth * 2
  app.unmount()
  app = null
  host.remove()
  host = null
  return travel / seconds
}

describe('marquee 速度按每秒像素数', () => {
  it('一份内容：窄窗与宽窗每秒走过的像素相同，都等于 speed', async () => {
    const narrow = await pixelsPerSecond(375, false)
    const wide = await pixelsPerSecond(1200, false)
    expect(narrow).toBeCloseTo(100, 0)
    expect(wide).toBeCloseTo(100, 0)
  })

  it('铺两份：一圈走一份的长度，速度同样等于 speed', async () => {
    expect(await pixelsPerSecond(375, true)).toBeCloseTo(100, 0)
    expect(await pixelsPerSecond(1200, true)).toBeCloseTo(100, 0)
  })
})
