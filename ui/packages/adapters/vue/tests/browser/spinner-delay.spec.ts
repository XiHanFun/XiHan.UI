// Spinner 的 delay：等待期间整块藏起但位置照留、读屏摘掉，等够时长才露面。
// 显隐与占位是计算样式与布局上的事实，只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSpinner, XhSpinnerLabel } from '../../src'
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

async function mount(delay?: number): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhSpinner, { label: '正在加载', delay }, () => h(XhSpinnerLabel)) })
  app.mount(host)
  await nextTick()
  return document.querySelector<HTMLElement>('[data-scope="spinner"][data-part="root"]')!
}

function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('加载指示器的 delay（Chromium）', () => {
  it('等待期间藏起、文案一并藏起，但占着露面后的那块位置', async () => {
    const root = await mount(200)
    const label = root.querySelector<HTMLElement>('[data-part="label"]')!
    expect(getComputedStyle(root).visibility).toBe('hidden')
    expect(getComputedStyle(label).visibility).toBe('hidden')
    const waiting = root.getBoundingClientRect()
    expect(waiting.width).toBeGreaterThan(0)
    expect(waiting.height).toBeGreaterThan(0)
    await waitFor(260)
    await nextTick()
    expect(root.dataset.state).toBe('visible')
    expect(getComputedStyle(root).visibility).toBe('visible')
    expect(getComputedStyle(label).visibility).toBe('visible')
    const shown = root.getBoundingClientRect()
    expect(shown.width).toBe(waiting.width)
    expect(shown.height).toBe(waiting.height)
  })

  it('不写 delay 即刻露面', async () => {
    const root = await mount()
    expect(root.dataset.state).toBe('visible')
    expect(getComputedStyle(root).visibility).toBe('visible')
  })
})
