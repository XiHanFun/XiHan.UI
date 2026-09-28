// 图表取数中、还没有可画的数据：空态部件里那枚环走加载环配方，与 Spinner 环档同一副画法。
// 判据是伪元素的计算样式，jsdom 不给伪元素。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhPieChartRoot } from '../../src'
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

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhPieChartRoot, { data: [], nameField: 'channel', valueField: 'visits', pending: true, animated: false }, { caption: () => '访问来源' }),
  })
  app.mount(host)
  await nextTick()
  const empty = document.querySelector<HTMLElement>(`[data-scope='pie-chart'][data-part='empty']`)
  if (!empty)
    throw new Error('找不到 pie-chart/empty')
  return empty
}

describe('图表取数中的环', () => {
  it('空态部件投影加载环配方，环一整圈轨道、转着、看得见', async () => {
    const empty = await mount()
    expect(empty.getAttribute('data-state')).toBe('loading')
    expect(empty.hasAttribute('data-xh-loading-ring')).toBe(true)
    expect(empty.hasAttribute('data-loading')).toBe(true)
    const ring = getComputedStyle(empty, '::before')
    expect(ring.animationName).toBe('xh-spin')
    expect(ring.animationPlayState).toBe('running')
    expect(ring.borderRadius).toBe('50%')
    expect(ring.borderRightStyle).toBe('solid')
    await expect.poll(() => getComputedStyle(empty, '::before').opacity).toBe('1')
  })

  it('减弱动效：环停下、换成点线', async () => {
    document.documentElement.dataset.motion = 'reduce'
    try {
      const empty = await mount()
      const ring = getComputedStyle(empty, '::before')
      expect(ring.animationName).toBe('none')
      expect(ring.borderTopStyle).toBe('dotted')
    }
    finally {
      delete document.documentElement.dataset.motion
    }
  })
})
