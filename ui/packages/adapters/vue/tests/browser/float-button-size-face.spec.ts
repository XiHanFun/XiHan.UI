// 悬浮按钮的尺与淡底面：触发器与展开组里的原生动作项同一张尺寸表、同一块面。
// 盒子尺寸、伪元素字形与真实叠色只有浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
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

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
  for (const animation of document.getAnimations()) {
    try {
      animation.finish()
    }
    catch {}
  }
  await nextTick()
}

async function mount(props: Record<string, unknown>): Promise<{ trigger: HTMLElement, item: HTMLElement }> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFloatButtonRoot, { defaultOpen: true, ...props }, () => [
      h(XhFloatButtonTrigger),
      h(XhFloatButtonList, null, () => h('button', { 'type': 'button', 'aria-label': '编辑' })),
    ]),
  })
  app.mount(host)
  await settle()
  return {
    trigger: document.querySelector<HTMLElement>('[data-scope=\'float-button\'][data-part=\'trigger\']')!,
    item: document.querySelector<HTMLElement>('[data-scope=\'float-button\'][data-part=\'list\'] > button')!,
  }
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

describe('float-button 的尺寸表', () => {
  it.each([
    ['sm', 28, '16px'],
    ['md', 40, '16px'],
    ['lg', 44, '20px'],
  ] as const)('%s 档：触发器与原生动作项都是 %ipx，兜底字形 %s', async (size, px, glyph) => {
    const { trigger, item } = await mount({ size })
    expect([trigger.getBoundingClientRect().width, trigger.getBoundingClientRect().height]).toEqual([px, px])
    expect([item.getBoundingClientRect().width, item.getBoundingClientRect().height]).toEqual([px, px])
    expect(getComputedStyle(trigger, '::before').width).toBe(glyph)
  })

  it('不写尺寸时取 md：40px', async () => {
    const { trigger } = await mount({})
    expect(trigger.getBoundingClientRect().width).toBe(40)
  })
})

describe('float-button 的 subtle 档', () => {
  it('触发器三态的面都是不透明的淡底，与原生动作项同一块面、同一支字色', async () => {
    const { trigger, item } = await mount({ variant: 'subtle' })
    const restBg = getComputedStyle(trigger).backgroundColor
    expect(alpha(restBg)).toBe(255)
    expect(restBg).toBe(getComputedStyle(item).backgroundColor)
    expect(getComputedStyle(trigger).color).toBe(getComputedStyle(item).color)

    await userEvent.hover(trigger)
    await expect.poll(() => alpha(getComputedStyle(trigger).backgroundColor)).toBe(255)
    await expect.poll(() => getComputedStyle(trigger).backgroundColor).not.toBe(restBg)
  })
})
