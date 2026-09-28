// 发送钮在发送与停止两种身份间切换时，兜底字形不再瞬换：换上来的那一枚淡入，与按钮换面同一拍；
// 首帧就在的字形直接呈现。伪元素上的动画只有真实浏览器算得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhPromptInputControl, XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.motion
})

const loading = ref(false)

async function mount(): Promise<HTMLElement> {
  loading.value = false
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhPromptInputRoot, { loading: loading.value, defaultValue: '你好' }, () => [
      h(XhPromptInputControl, null, () => [h(XhPromptInputInput), h(XhPromptInputSubmitTrigger)]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>(`[data-scope='prompt-input'][data-part='submit-trigger']`)!
}

const glyph = (el: HTMLElement): CSSStyleDeclaration => getComputedStyle(el, '::before')

async function flip(next: boolean): Promise<void> {
  loading.value = next
  await nextTick()
  await nextTick()
}

describe('prompt-input 发送 / 停止字形', () => {
  it('首帧的发送字形直接呈现；切到停止与切回发送时，换上来的字形淡入', async () => {
    const trigger = await mount()
    expect(trigger.dataset.mode).toBe('send')
    expect(glyph(trigger).animationName).toBe('none')

    await flip(true)
    expect(trigger.dataset.mode).toBe('stop')
    expect(glyph(trigger).animationName).not.toBe('none')

    await flip(false)
    expect(trigger.dataset.mode).toBe('send')
    expect(glyph(trigger).animationName).not.toBe('none')
  })

  it('减弱动效下只剩淡变，不缩放', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const trigger = await mount()
    await flip(true)
    const [enter] = trigger.getAnimations({ subtree: true }).filter(a => (a.effect as KeyframeEffect).pseudoElement === '::before')
    enter!.pause()
    enter!.currentTime = 0
    expect(Number(glyph(trigger).opacity)).toBeLessThan(0.5)
    expect(['none', '1']).toContain(glyph(trigger).scale)
  })
})
