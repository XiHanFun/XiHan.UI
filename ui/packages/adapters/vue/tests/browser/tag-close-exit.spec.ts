// 标签关闭的退场：jsdom 没有动画，看不出标签是不是播完才藏起。
// 点关闭钮后标签原地淡出（途中仍占位、不可交互），播完才写 hidden。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTagCloseTrigger, XhTagRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.style.removeProperty('--xh-motion-duration-exit')
})

function frames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number): void => {
      if (left <= 0)
        resolve()
      else
        requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

describe('tag 关闭退场', () => {
  it('点关闭钮：标签先淡出、仍占位，播完才藏起', async () => {
    document.documentElement.style.setProperty('--xh-motion-duration-exit', '400ms')
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhTagRoot, { closable: true }, () => ['前端', h(XhTagCloseTrigger)]),
    })
    app.mount(host)
    await nextTick()
    const root = host.querySelector<HTMLElement>(`[data-scope='tag'][data-part='root']`)!
    expect(root.id).not.toBe('')
    const width = root.getBoundingClientRect().width

    host.querySelector<HTMLElement>(`[data-scope='tag'][data-part='close-trigger']`)!.click()
    await nextTick()
    await frames(4)
    expect(root.dataset.state).toBe('closed')
    expect(root.hidden).toBe(false)
    expect(root.inert).toBe(true)
    expect(root.getBoundingClientRect().width).toBe(width)
    expect(Number(getComputedStyle(root).opacity)).toBeLessThan(1)

    await Promise.all(root.getAnimations().map(animation => animation.finished))
    await nextTick()
    await nextTick()
    expect(root.hidden).toBe(true)
  })
})
