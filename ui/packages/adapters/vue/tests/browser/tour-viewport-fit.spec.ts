// 引导气泡整块留在视口里：目标贴着视口顶缘、几乎与视口等高、或比视口还高且页面正滚在它中段时，
// 落位那一侧放不下就翻到对侧；两侧都放不下就沿主轴挪进视口，宁可盖住目标的一部分，也不让标题或按钮伸到视口外。
// 越没越界只有真实 Chromium 量得出来。
import type { TourStep } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
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

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
  window.scrollTo(0, 0)
  const root = document.documentElement
  delete root.dataset.theme
  delete root.dataset.density
  delete root.dataset.motion
  root.removeAttribute('dir')
})

const DESCRIPTION = '当前页面在这里展开。列表页第一次打开时，还会接着介绍列表的通用操作。'

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='${name}']`)!
}

async function frame(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等气泡落定：进场动画播完、连续两帧量到同一个矩形。 */
async function settle(): Promise<DOMRect> {
  let previous = ''
  let stable = 0
  for (let i = 0; i < 60; i++) {
    await frame()
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

/** 目标另放一处：挂载会清空宿主节点里原有的内容。 */
function putTarget(css: string): HTMLElement {
  const target = document.createElement('div')
  target.id = 'tour-fit-target'
  target.style.cssText = css
  document.body.append(target)
  return target
}

function mount(step: Omit<TourStep, 'id' | 'target'>): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTourRoot, {
      open: true,
      steps: [
        { id: 'a', target: '#tour-fit-target', title: '内容区', description: DESCRIPTION, ...step },
        { id: 'b', title: '收尾' },
      ],
    }, () => [
      h(XhTourSpotlight),
      h(XhTourPositioner, null, () => h(XhTourContent, null, () => [
        h(XhTourArrow),
        h(XhTourTitle),
        h(XhTourDescription),
        h('div', { style: 'display: flex; align-items: center; gap: 8px' }, [
          h(XhTourProgressText),
          h(XhTourSkipTrigger, null, () => '跳过'),
          h(XhTourPrevTrigger, null, () => '上一步'),
          h(XhTourNextTrigger, null, () => '下一步'),
        ]),
      ])),
    ]),
  })
  app.mount(host)
}

/** 气泡四条边都在视口里（容 1px 亚像素）。 */
function expectInsideViewport(rect: DOMRect): void {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  expect(rect.top, `气泡上沿伸出视口：top=${rect.top.toFixed(1)}`).toBeGreaterThanOrEqual(-1)
  expect(rect.bottom, `气泡下沿伸出视口：bottom=${rect.bottom.toFixed(1)}，视口高 ${height}`).toBeLessThanOrEqual(height + 1)
  expect(rect.left, `气泡左缘伸出视口：left=${rect.left.toFixed(1)}`).toBeGreaterThanOrEqual(-1)
  expect(rect.right, `气泡右缘伸出视口：right=${rect.right.toFixed(1)}，视口宽 ${width}`).toBeLessThanOrEqual(width + 1)
}

describe('tour 气泡整块留在视口里', () => {
  it('目标贴着视口顶缘、落位在上方：翻到下方', async () => {
    putTarget('position: fixed; left: 40px; top: 4px; inline-size: 120px; block-size: 32px')
    mount({ placement: 'top' })
    const rect = await settle()
    expect(part('positioner').dataset.placement).toBe('bottom')
    expectInsideViewport(rect)
  })

  const environments: Array<[string, () => void]> = [
    ['亮色', () => {}],
    ['暗色', () => { document.documentElement.dataset.theme = 'dark' }],
    ['RTL', () => { document.documentElement.setAttribute('dir', 'rtl') }],
    ['compact', () => { document.documentElement.dataset.density = 'compact' }],
    ['减弱动效', () => { document.documentElement.dataset.motion = 'reduce' }],
  ]

  for (const [name, apply] of environments) {
    it(`目标几乎与视口等高、上下都放不下（${name}）：沿主轴挪进视口，标题与按钮都看得见`, async () => {
      apply()
      // 后台壳的内容区：顶上让出一条顶栏，往下铺到视口底，上下各只剩几十像素
      putTarget('position: fixed; inset-inline: 16px; top: 56px; bottom: 16px')
      mount({ placement: 'top' })
      const rect = await settle()
      expectInsideViewport(rect)
      // 正文挤不下时在面内滚，标题与按钮不被裁
      const title = part('title').getBoundingClientRect()
      const next = part('next-trigger').getBoundingClientRect()
      expect(title.top).toBeGreaterThanOrEqual(rect.top - 1)
      expect(next.bottom).toBeLessThanOrEqual(rect.bottom + 1)
    })
  }

  it('目标比视口还高、页面正滚在它中段：气泡仍整块留在视口里', async () => {
    const height = document.documentElement.clientHeight
    putTarget(`margin-block-start: 80px; inline-size: 240px; block-size: ${height * 3}px`)
    window.scrollTo(0, height)
    mount({ placement: 'bottom' })
    const rect = await settle()
    expectInsideViewport(rect)
  })
})
