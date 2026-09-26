// liquid 档的交互光：实心按钮进入悬停时，一道光沿 1px 描边环扫过一次。
// 钉住：真指针悬停 liquid 档实心钮时 ::after 播 xh-glint、只播一遍、盒子贴着描边外沿；
// standard 档、非实心形态与禁用时不播；减弱动效下时长归 1ms。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhButton } from '../../src'
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

async function mount(props: Record<string, unknown>, material: 'liquid' | 'standard' = 'liquid'): Promise<HTMLElement> {
  document.documentElement.setAttribute('data-material', material)
  host = document.createElement('div')
  host.style.cssText = 'padding: 40px'
  document.body.append(host)
  app = createApp({ render: () => h(XhButton, props, () => '保存') })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')!
}

async function hover(el: HTMLElement): Promise<void> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  const scale = await seen
  const rect = el.getBoundingClientRect()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: (rect.left + rect.width / 2) / scale, y: (rect.top + rect.height / 2) / scale })
  await expect.poll(() => el.matches(':hover')).toBe(true)
}

const glint = (el: HTMLElement): CSSStyleDeclaration => getComputedStyle(el, '::after')

describe('按钮交互光', () => {
  it('liquid 档实心钮悬停：一道光沿描边扫过一次', async () => {
    const button = await mount({ variant: 'solid' })
    await hover(button)
    const light = glint(button)
    expect(light.animationName).toBe('xh-glint')
    expect(light.animationIterationCount).toBe('1')
    expect(light.animationDuration).toBe('0.64s')
    // 盒子贴着描边外沿，遮罩只留 1px 描边环
    expect(light.position).toBe('absolute')
    expect(light.paddingTop).toBe('1px')
    expect(light.maskComposite || light.getPropertyValue('-webkit-mask-composite')).toMatch(/exclude|xor/)
  })

  it('standard 档、非实心形态与禁用时不播', async () => {
    const standard = await mount({ variant: 'solid' }, 'standard')
    await hover(standard)
    expect(glint(standard).animationName).toBe('none')
    app!.unmount()
    host!.remove()

    const outline = await mount({ variant: 'outline' })
    await hover(outline)
    expect(glint(outline).animationName).toBe('none')
    app!.unmount()
    host!.remove()

    const disabled = await mount({ variant: 'solid', disabled: true })
    await hover(disabled)
    expect(glint(disabled).animationName).toBe('none')
  })

  it('减弱动效：时长归 1ms，一闪即过', async () => {
    const button = await mount({ variant: 'solid' })
    host!.dataset.motion = 'reduce'
    await hover(button)
    expect(glint(button).animationDuration).toBe('0.001s')
  })
})
