// 代码折叠与关系图键盘缩放的动效：点开过的折叠块里的行从收起变回露出时播入场，挂载时就展开着的不播；
// 关系图按 + 时视图从此刻补到目标，不一步跳过去。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type XhElement = HTMLElement & { updateComplete: Promise<unknown>, [key: string]: unknown }

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  setDiagnosticsLevel('warn')
})

async function settle(el: XhElement, count = 2): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    await el.updateComplete
  }
  for (let i = 0; i < count; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(tag: string, setup: (el: XhElement) => void, markup: string, slow: string): Promise<XhElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.style.setProperty(slow, '10s')
  document.body.append(host)
  const el = document.createElement(tag) as XhElement
  el.innerHTML = markup
  setup(el)
  host.append(el)
  await settle(el)
  return el
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

const CODE = 'function outer() {\n  if (ok) {\n    run()\n    done()\n  }\n}\nconst tail = 1'

describe('xh-code-view 折叠与 xh-graph-chart 键盘缩放', () => {
  it('收起再点开时块里的行播入场，块外的行不动', async () => {
    const view = await mount('xh-code-view', (el) => {
      el.code = CODE
      el.setAttribute('complete', '')
      el.setAttribute('block-folding', '')
      el.highlighter = null
    }, `<div data-xh-part="root"><pre data-xh-part="pre"><code data-xh-part="code"></code></pre></div>`, '--xh-motion-duration-enter')
    const lines = (): HTMLElement[] => [...host!.querySelectorAll<HTMLElement>(`[data-scope='code-view'][data-part='line']`)]
    for (const line of lines())
      expect(running(line)).toEqual([])
    const trigger = (): HTMLElement => host!.querySelector<HTMLElement>(`[data-scope='code-view'][data-part='line-fold-trigger']`)!
    await userEvent.click(trigger())
    await settle(view, 1)
    expect(getComputedStyle(lines()[1]!).display).toBe('none')
    await userEvent.click(trigger())
    await settle(view, 1)
    expect(running(lines()[1]!)).toEqual(['xh-drop-in'])
    expect(running(lines()[0]!)).toEqual([])
  })

  it('按 + 时视图从此刻补到目标：补间途中的间距介于原距与放大一档之间', async () => {
    const chart = await mount('xh-graph-chart', (el) => {
      el.nodes = [{ id: 'a', name: '网关' }, { id: 'b', name: '认证' }, { id: 'c', name: '订单' }]
      el.links = [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }]
      el.setAttribute('zoom', '')
      el.setAttribute('animated', 'false')
    }, `<figure data-xh-part="root"><figcaption data-xh-part="caption">服务拓扑</figcaption><div data-xh-part="viewport"><svg data-xh-part="plot"></svg></div></figure>`, '--xh-motion-duration-move')
    await settle(chart, 3)
    const spread = (): number => {
      const nodes = [...host!.querySelectorAll(`[data-scope='graph-chart'][data-part='node']`)].map(el => el.getBoundingClientRect())
      const a = nodes[0]!
      const c = nodes.at(-1)!
      return Math.hypot(c.left + c.width / 2 - a.left - a.width / 2, c.top + c.height / 2 - a.top - a.height / 2)
    }
    const before = spread()
    expect(before).toBeGreaterThan(1)
    host!.querySelector<HTMLElement>(`[data-scope='graph-chart'][data-part='plot']`)!.focus()
    await userEvent.keyboard('+')
    // 补间按真实时钟走：等画面离开起点（慢机器上头几帧的位移可能小于布局精度），10 秒的时长保证这时还没到一整档
    await expect.poll(() => spread() / before, { timeout: 5000 }).toBeGreaterThan(1.001)
    expect(spread() / before).toBeLessThan(1.249)
  })
})
