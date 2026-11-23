// 引导气泡整块留在视口里：目标几乎与视口等高、上下都放不下时，沿主轴挪进视口盖住目标的一部分，
// 标题与按钮不伸到视口外。与 Vue、React 同一份 headless 定位，越没越界只有真实 Chromium 量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='${name}']`)!
}

/** 等气泡落定：进场动画播完、连续两帧量到同一个矩形。 */
async function settle(): Promise<DOMRect> {
  let previous = ''
  let stable = 0
  for (let i = 0; i < 60; i++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    for (const el of [part('spotlight'), part('positioner'), part('content')]) {
      for (const animation of el?.getAnimations() ?? [])
        animation.finish()
    }
    const rect = part('content').getBoundingClientRect()
    const key = [rect.x, rect.y, rect.width, rect.height].map(Math.round).join(',')
    if (key === previous && part('positioner').hasAttribute('data-positioned')) {
      stable += 1
      if (stable >= 2)
        return rect
    }
    else {
      stable = 0
      previous = key
    }
  }
  throw new Error('气泡 60 帧内没有落定')
}

describe('wc 引导气泡整块留在视口里', () => {
  it('目标几乎与视口等高、上下都放不下：沿主轴挪进视口，标题与按钮都看得见', async () => {
    const host = document.createElement('div')
    host.innerHTML = `
      <div id="tour-fit-target" style="position: fixed; inset-inline: 16px; top: 56px; bottom: 16px"></div>
      <xh-tour><div data-xh-part="root">
        <div data-xh-part="spotlight"></div>
        <div data-xh-part="positioner"><div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <h2 data-xh-part="title"></h2>
          <p data-xh-part="description"></p>
          <div style="display: flex; align-items: center; gap: 8px">
            <span data-xh-part="progress-text"></span>
            <button type="button" data-xh-part="skip-trigger">跳过</button>
            <button type="button" data-xh-part="prev-trigger">上一步</button>
            <button type="button" data-xh-part="next-trigger">下一步</button>
          </div>
        </div></div>
      </div></xh-tour>`
    document.body.append(host)
    const tour = host.querySelector<HTMLElement & { steps?: unknown }>('xh-tour')!
    tour.steps = [
      {
        id: 'a',
        target: '#tour-fit-target',
        placement: 'top',
        title: '内容区',
        description: '当前页面在这里展开。列表页第一次打开时，还会接着介绍列表的通用操作。',
      },
      { id: 'b', title: '收尾' },
    ]
    tour.setAttribute('open', '')
    const rect = await settle()

    const height = document.documentElement.clientHeight
    const width = document.documentElement.clientWidth
    expect(rect.top, `气泡上沿伸出视口：top=${rect.top.toFixed(1)}`).toBeGreaterThanOrEqual(-1)
    expect(rect.bottom).toBeLessThanOrEqual(height + 1)
    expect(rect.left).toBeGreaterThanOrEqual(-1)
    expect(rect.right).toBeLessThanOrEqual(width + 1)
    expect(part('title').getBoundingClientRect().top).toBeGreaterThanOrEqual(rect.top - 1)
    expect(part('next-trigger').getBoundingClientRect().bottom).toBeLessThanOrEqual(rect.bottom + 1)
  })
})
