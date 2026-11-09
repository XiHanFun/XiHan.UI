// 代码折叠与关系图键盘缩放的动效：点开过的折叠块里的行从收起变回露出时播入场，挂载时就展开着的不播；
// 关系图按 + 时视图从此刻补到目标，不一步跳过去。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot, XhGraphChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function settle(count = 4): Promise<void> {
  for (let index = 0; index < count; index++) {
    await inAct(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
  }
}

async function mount(node: ReactNode, slow: string): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.style.setProperty(slow, '10s')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(node))
  await settle()
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
})

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
}

const CODE = 'function outer() {\n  if (ok) {\n    run()\n    done()\n  }\n}\nconst tail = 1'

describe('react 代码折叠与关系图键盘缩放', () => {
  it('收起再点开时块里的行播入场，块外的行不动', async () => {
    await mount(<XhCodeViewRoot code={CODE} complete blockFolding highlighter={null}><XhCodeViewPre><XhCodeViewCode /></XhCodeViewPre></XhCodeViewRoot>, '--xh-motion-duration-enter')
    const lines = (): HTMLElement[] => [...host!.querySelectorAll<HTMLElement>(`[data-scope='code-view'][data-part='line']`)]
    for (const line of lines())
      expect(running(line)).toEqual([])
    const trigger = host!.querySelector<HTMLElement>(`[data-scope='code-view'][data-part='line-fold-trigger']`)!
    await userEvent.click(trigger)
    await settle(1)
    expect(lines()[1]!.hidden).toBe(true)
    await userEvent.click(trigger)
    await settle(1)
    expect(running(lines()[1]!)).toEqual(['xh-drop-in'])
    expect(running(lines()[0]!)).toEqual([])
  })

  it('按 + 时视图从此刻补到目标：补间途中的间距介于原距与放大一档之间', async () => {
    await mount(
      <XhGraphChartRoot nodes={[{ id: 'a', name: '网关' }, { id: 'b', name: '认证' }, { id: 'c', name: '订单' }]} links={[{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }]} zoom animated={false} aria-label="服务拓扑" />,
      '--xh-motion-duration-move',
    )
    const spread = (): number => {
      const nodes = [...host!.querySelectorAll(`[data-scope='graph-chart'][data-part='node']`)].map(el => el.getBoundingClientRect())
      const a = nodes[0]!
      const c = nodes.at(-1)!
      return Math.hypot(c.left + c.width / 2 - a.left - a.width / 2, c.top + c.height / 2 - a.top - a.height / 2)
    }
    const before = spread()
    expect(before).toBeGreaterThan(1)
    await inAct(() => host!.querySelector<HTMLElement>(`[data-scope='graph-chart'][data-part='plot']`)!.focus())
    await userEvent.keyboard('+')
    await settle(3)
    const ratio = spread() / before
    expect(ratio).toBeGreaterThan(1)
    expect(ratio).toBeLessThan(1.249)
  })
})
