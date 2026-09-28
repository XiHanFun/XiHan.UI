// 可交互卡片：标题里的 trigger 把点击区铺满整张卡片，悬停抬起一档海拔、按下换面，焦点环画在卡片外沿；
// liquid 档悬停时描边扫过一道交互光。几何、计算样式与真指针只在 Chromium 验证。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhCardContent, XhCardFooter, XhCardHeader, XhCardRoot, XhCardTitle, XhCardTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.removeAttribute('data-material')
})

interface MountOptions {
  variant?: 'outline' | 'subtle' | 'ghost'
  interactive?: boolean
  onPress?: () => void
  onFooter?: () => void
}

async function mount(options: MountOptions = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 40px; inline-size: 320px'
  document.body.append(host)
  app = createApp({
    render: (): VNode => h(XhCardRoot, { variant: options.variant, interactive: options.interactive ?? true }, () => [
      h(XhCardHeader, null, () => [
        h(XhCardTitle, null, () => [h(XhCardTrigger, { onClick: options.onPress }, () => '季度报告')]),
      ]),
      h(XhCardContent, null, () => '营收同比增长 12%，毛利率持平。'),
      h(XhCardFooter, null, () => [h('button', { type: 'button', onClick: options.onFooter }, '收藏')]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]')!
}

function trigger(): HTMLElement {
  return host!.querySelector<HTMLElement>('[data-scope="card"][data-part="trigger"]')!
}

/** 页面坐标换算到 CDP 的 CSS 像素：测试页可能整体缩放过，先用一次移动量出比例。 */
async function pointerScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

async function moveTo(x: number, y: number): Promise<number> {
  const scale = await pointerScale()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x / scale, y: y / scale })
  return scale
}

/** 在页面坐标上真按一下：点在被点击区盖住的内容上，Playwright 的可点性检查会把它当成被遮住 */
async function clickAt(x: number, y: number): Promise<void> {
  const scale = await moveTo(x, y)
  const at = { x: x / scale, y: y / scale, button: 'left' as const, clickCount: 1 }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', ...at })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...at })
}

/** 把令牌解析成这台浏览器上的最终取值，用来与卡片的计算值对账。 */
function tokenValue(property: 'box-shadow' | 'background-color', token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  document.body.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

describe('可交互卡片', () => {
  it('trigger 是原生按钮；卡片里任一处（含内容区的空白）点下去命中的都是 trigger', async () => {
    let presses = 0
    const card = await mount({ onPress: () => presses++ })
    expect(trigger().tagName).toBe('BUTTON')
    expect(trigger().getAttribute('type')).toBe('button')
    const content = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="content"]')!.getBoundingClientRect()
    const hit = document.elementFromPoint(content.right - 4, content.bottom - 2)
    expect(hit).toBe(trigger())
    // 描边上也算卡片
    const rect = card.getBoundingClientRect()
    expect(document.elementFromPoint(rect.left + 0.5, rect.top + rect.height / 2)).toBe(trigger())
    await clickAt(content.left + 8, content.top + content.height / 2)
    expect(presses).toBe(1)
  })

  it('footer 叠在点击区之上：里面的按钮照常可点，不触发整卡，按住时卡片也不换面', async () => {
    let presses = 0
    let footer = 0
    const card = await mount({ onPress: () => presses++, onFooter: () => footer++ })
    const button = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="footer"] button')!
    const rect = button.getBoundingClientRect()
    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)).toBe(button)
    const rest = getComputedStyle(card).backgroundColor
    const scale = await moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
    const at = { x: (rect.left + rect.width / 2) / scale, y: (rect.top + rect.height / 2) / scale, button: 'left' as const, clickCount: 1 }
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', ...at })
    await expect.poll(() => card.matches(':active')).toBe(true)
    expect(getComputedStyle(card).backgroundColor).toBe(rest)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...at })
    expect(footer).toBe(1)
    expect(presses).toBe(0)
  })

  it('不写 interactive 时 trigger 只是标题里的一个按钮，点击区不铺开', async () => {
    const card = await mount({ interactive: false })
    const content = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="content"]')!
    const rect = content.getBoundingClientRect()
    expect(document.elementFromPoint(rect.left + 4, rect.top + rect.height / 2)).not.toBe(trigger())
    expect(card.hasAttribute('data-interactive')).toBe(false)
  })

  it('outline 悬停抬高一档海拔，按下换到白底阶梯的 200', async () => {
    const card = await mount()
    const rest = getComputedStyle(card).boxShadow
    expect(rest).toBe(tokenValue('box-shadow', '--xh-elevation-raised'))
    const rect = card.getBoundingClientRect()
    const scale = await moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
    await expect.poll(() => card.matches(':hover')).toBe(true)
    await expect.poll(() => getComputedStyle(card).boxShadow).toBe(tokenValue('box-shadow', '--xh-elevation-lifted'))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', x: (rect.left + rect.width / 2) / scale, y: (rect.top + rect.height / 2) / scale, button: 'left', clickCount: 1 })
    await expect.poll(() => getComputedStyle(card).backgroundColor).toBe(tokenValue('background-color', '--xh-bg-subtle-hover-opaque'))
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: (rect.left + rect.width / 2) / scale, y: (rect.top + rect.height / 2) / scale, button: 'left', clickCount: 1 })
  })

  it('subtle 悬停换到淡底 200，不抬起', async () => {
    const card = await mount({ variant: 'subtle' })
    const rect = card.getBoundingClientRect()
    await moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
    await expect.poll(() => getComputedStyle(card).backgroundColor).toBe(tokenValue('background-color', '--xh-bg-subtle-hover'))
    expect(getComputedStyle(card).boxShadow).toBe('none')
  })

  it('键盘聚焦：trigger 自己不画环，环画在整张卡片外沿', async () => {
    const card = await mount()
    await userEvent.keyboard('{Tab}')
    await expect.poll(() => document.activeElement).toBe(trigger())
    expect(trigger().matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(trigger()).outlineStyle).toBe('none')
    const ring = getComputedStyle(trigger(), '::after')
    expect(ring.outlineStyle).toBe('solid')
    expect(Number.parseFloat(ring.outlineWidth)).toBeGreaterThan(0)
    // 点击区与环的外沿就是卡片的边框外沿
    const cardRect = card.getBoundingClientRect()
    expect(Number.parseFloat(ring.width)).toBeCloseTo(cardRect.width, 0)
    expect(Number.parseFloat(ring.height)).toBeCloseTo(cardRect.height, 0)
  })

  it('liquid 档悬停：描边扫过一道交互光，只播一遍；standard 档与不可交互的卡片不播', async () => {
    document.documentElement.setAttribute('data-material', 'liquid')
    const card = await mount()
    const rect = card.getBoundingClientRect()
    await moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
    await expect.poll(() => card.matches(':hover')).toBe(true)
    const light = getComputedStyle(card, '::after')
    expect(light.animationName).toBe('xh-glint')
    expect(light.animationIterationCount).toBe('1')
    expect(light.borderTopWidth).toBe('1px')
    expect(light.pointerEvents).toBe('none')
    // ltr 不镜像：光从左缘扫向右缘
    expect(light.scale).toBe('1')
    app!.unmount()
    host!.remove()

    // rtl：这一圈按方向符号水平镜像，光从行首（右缘）扫起
    document.documentElement.dir = 'rtl'
    const mirrored = await mount()
    const mirroredRect = mirrored.getBoundingClientRect()
    await moveTo(mirroredRect.left + mirroredRect.width / 2, mirroredRect.top + mirroredRect.height / 2)
    await expect.poll(() => mirrored.matches(':hover')).toBe(true)
    expect(getComputedStyle(mirrored, '::after').scale).toBe('-1 1')
    document.documentElement.removeAttribute('dir')
    app!.unmount()
    host!.remove()

    document.documentElement.setAttribute('data-material', 'standard')
    const standard = await mount()
    const standardRect = standard.getBoundingClientRect()
    await moveTo(standardRect.left + standardRect.width / 2, standardRect.top + standardRect.height / 2)
    await expect.poll(() => standard.matches(':hover')).toBe(true)
    expect(getComputedStyle(standard, '::after').animationName).toBe('none')
    app!.unmount()
    host!.remove()

    document.documentElement.setAttribute('data-material', 'liquid')
    const still = await mount({ interactive: false })
    const stillRect = still.getBoundingClientRect()
    await moveTo(stillRect.left + stillRect.width / 2, stillRect.top + stillRect.height / 2)
    await expect.poll(() => still.matches(':hover')).toBe(true)
    expect(getComputedStyle(still, '::after').animationName).toBe('none')
  })
})
