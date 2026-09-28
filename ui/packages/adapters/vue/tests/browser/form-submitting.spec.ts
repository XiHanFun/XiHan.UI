// 提交在途的提交钮：加载环配方把环压在钮正中、不进排布，与其余动作钮的在途同一种画法；
// 不置灰（焦点与对比度都保持），在途指针由家族给；减弱动效时圆环停下换成虚线，静止的形状仍读得出「还没好」。
//
// 只有真实浏览器量得出来：伪元素的盒子、动画名与计算出的边框样式都是计算样式。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFormRoot, XhFormSubmitTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mountPending(): Promise<HTMLButtonElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFormRoot, { defaultValues: { a: '有' }, onSubmit: () => new Promise(() => {}) }, {
      default: () => [h(XhFormSubmitTrigger, null, () => '保存')],
    }),
  })
  app.mount(host)
  await nextTick()
  const trigger = host.querySelector<HTMLButtonElement>(`[data-scope='form'][data-part='submit-trigger']`)!
  trigger.click()
  await expect.poll(() => trigger.hasAttribute('data-loading')).toBe(true)
  return trigger
}

describe('表单提交在途', () => {
  it('提交钮正中压一枚加载环、不进排布，不置灰，指针报在途', async () => {
    const trigger = await mountPending()
    const ring = getComputedStyle(trigger, '::before')
    expect(ring.content).not.toBe('none')
    expect(ring.position).toBe('absolute')
    expect(trigger.getAttribute('data-xh-loading-ring')).toBe('overlay')
    expect(Number.parseFloat(ring.inlineSize)).toBeGreaterThan(0)
    expect(ring.animationName).toBe('xh-spin')
    expect(getComputedStyle(trigger).cursor).toBe('progress')
    expect(getComputedStyle(trigger).opacity).toBe('1')
    expect(document.activeElement === trigger || trigger.tabIndex >= 0).toBe(true)
  })

  it('减弱动效：圆环停下换成虚线', async () => {
    const trigger = await mountPending()
    host!.dataset.motion = 'reduce'
    const ring = getComputedStyle(trigger, '::before')
    expect(ring.animationName).toBe('none')
    expect(ring.borderTopStyle).toBe('dotted')
  })
})
