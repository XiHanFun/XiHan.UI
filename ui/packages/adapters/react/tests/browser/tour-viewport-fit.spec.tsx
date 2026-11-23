// 引导气泡整块留在视口里：目标几乎与视口等高、上下都放不下时，沿主轴挪进视口盖住目标的一部分，
// 标题与按钮不伸到视口外。与 Vue、Web Components 同一份 headless 定位，越没越界只有真实 Chromium 量得出来。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  XhTourArrow,
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourPositioner,
  XhTourPrevTrigger,
  XhTourProgressText,
  XhTourRoot,
  XhTourSkipTrigger,
  XhTourSpotlight,
  XhTourTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))
afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='${name}']`)!
}

/** 等气泡落定：进场动画播完、连续两帧量到同一个矩形。 */
async function settle(): Promise<DOMRect> {
  let previous = ''
  let stable = 0
  for (let i = 0; i < 60; i++) {
    await act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
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

describe('react 引导气泡整块留在视口里', () => {
  it('目标几乎与视口等高、上下都放不下：沿主轴挪进视口，标题与按钮都看得见', async () => {
    const target = document.createElement('div')
    target.id = 'tour-fit-target'
    target.style.cssText = 'position: fixed; inset-inline: 16px; top: 56px; bottom: 16px'
    const host = document.createElement('div')
    document.body.append(target, host)
    root = createRoot(host)
    act(() => root!.render(
      <XhTourRoot
        open
        steps={[
          {
            id: 'a',
            target: '#tour-fit-target',
            placement: 'top',
            title: '内容区',
            description: '当前页面在这里展开。列表页第一次打开时，还会接着介绍列表的通用操作。',
          },
          { id: 'b', title: '收尾' },
        ]}
      >
        <XhTourSpotlight />
        <XhTourPositioner>
          <XhTourContent>
            <XhTourArrow />
            <XhTourTitle />
            <XhTourDescription />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <XhTourProgressText />
              <XhTourSkipTrigger>跳过</XhTourSkipTrigger>
              <XhTourPrevTrigger>上一步</XhTourPrevTrigger>
              <XhTourNextTrigger>下一步</XhTourNextTrigger>
            </div>
          </XhTourContent>
        </XhTourPositioner>
      </XhTourRoot>,
    ))
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
