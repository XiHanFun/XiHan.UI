// 代码折叠与关系图键盘缩放的动效：点开过的折叠块里的行从收起变回露出时播入场，挂载时就展开着的不播；
// 关系图按 + / - / 0 时视图从此刻补到目标，不一步跳过去，滚轮跟手当场落定。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot, XhGraphChartRoot } from '../../src'
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

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

const CODE = 'function outer() {\n  if (ok) {\n    run()\n    done()\n  }\n}\nconst tail = 1'

describe('代码折叠', () => {
  it('首帧的行直接呈现；收起再点开时块里的行播入场，块外的行不动', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '480px'
    host.style.setProperty('--xh-motion-duration-enter', '10s')
    document.body.append(host)
    app = createApp({
      render: () => h(XhCodeViewRoot, { code: CODE, complete: true, blockFolding: true, highlighter: null }, () => h(XhCodeViewPre, null, () => h(XhCodeViewCode))),
    })
    app.mount(host)
    await frames(3)
    const lines = (): HTMLElement[] => [...host!.querySelectorAll<HTMLElement>(`[data-scope='code-view'][data-part='line']`)]
    for (const line of lines())
      expect(running(line)).toEqual([])
    const trigger = host.querySelector<HTMLElement>(`[data-scope='code-view'][data-part='line-fold-trigger']`)!
    await userEvent.click(trigger)
    await frames(1)
    expect(lines()[1]!.hidden).toBe(true)
    await userEvent.click(trigger)
    await frames(1)
    expect(lines()[1]!.hidden).toBe(false)
    expect(running(lines()[1]!)).toEqual(['xh-drop-in'])
    expect(running(lines()[0]!)).toEqual([])
    expect(running(lines().at(-1)!)).toEqual([])
  })
})

describe('关系图键盘缩放', () => {
  it('按 + 时视图从此刻补到目标，补间途中缩放介于两档之间', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '480px'
    host.style.setProperty('--xh-motion-duration-move', '10s')
    document.body.append(host)
    app = createApp({
      render: () => h(XhGraphChartRoot, {
        'nodes': [{ id: 'a', name: '网关' }, { id: 'b', name: '认证' }, { id: 'c', name: '订单' }],
        'links': [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }],
        'zoom': true,
        'animated': false,
        'aria-label': '服务拓扑',
      }),
    })
    app.mount(host)
    await frames(4)
    const plot = host.querySelector<HTMLElement>(`[data-scope='graph-chart'][data-part='plot']`)!
    // 视图算进节点坐标里：量首末两个节点的间距，缩放一档是 1.25 倍
    const spread = (): number => {
      const nodes = [...host!.querySelectorAll(`[data-scope='graph-chart'][data-part='node']`)].map(el => el.getBoundingClientRect())
      const a = nodes[0]!
      const c = nodes.at(-1)!
      return Math.hypot(c.left + c.width / 2 - a.left - a.width / 2, c.top + c.height / 2 - a.top - a.height / 2)
    }
    const before = spread()
    expect(before).toBeGreaterThan(1)
    plot.focus()
    await userEvent.keyboard('+')
    // 补间按真实时钟走：等画面离开起点（慢机器上头几帧的位移可能小于布局精度），10 秒的时长保证这时还没到一整档
    await expect.poll(() => spread() / before, { timeout: 5000 }).toBeGreaterThan(1.001)
    expect(spread() / before).toBeLessThan(1.249)
  })
})
