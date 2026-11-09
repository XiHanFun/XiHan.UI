// 提示框退场与重新露面的进场：图表提示框与热力图详情条隐去时留着上一回的内容与落点淡出；
// 关掉的警示条再显示时按实测高度展开；加载完的骨架屏再开始加载时淡入。
// 宿主带着 [hidden]{display:none!important}（Tailwind preflight 同款）。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import {
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhHeatmapRoot,
  XhPieChartRoot,
  XhSkeletonItem,
  XhSkeletonRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import './hidden-important-host'

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

async function settle(): Promise<void> {
  for (let index = 0; index < 4; index++) {
    await inAct(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
  }
}

async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['enter', 'exit', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
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

function part(scope: string, name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)!
}

function fading(el: Element): Animation | undefined {
  return el.getAnimations().find(a => a instanceof CSSTransition && (a as CSSTransition).transitionProperty === 'opacity')
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

describe('react 图表提示框隐去', () => {
  it('焦点离开扇区：提示框留着上一回的内容与落点淡出', async () => {
    await mount(
      <div>
        <button type="button" data-test-away="">别处</button>
        <XhPieChartRoot data={[{ c: '搜索', v: 40 }, { c: '直接访问', v: 30 }]} nameField="c" valueField="v" labels="none" animated={false} aria-label="访问来源" />
      </div>,
    )
    const slice = document.querySelector<HTMLElement>(`[data-scope='pie-chart'][data-part='slice']`)!
    await inAct(() => slice.focus())
    await settle()
    const tooltip = part('pie-chart', 'tooltip')
    expect(tooltip.dataset.state).toBe('visible')
    for (const animation of tooltip.getAnimations())
      animation.finish()
    const text = tooltip.textContent
    const x = tooltip.style.getPropertyValue('--xh-_chart-tip-x')
    expect(text).not.toBe('')
    await inAct(() => document.querySelector<HTMLElement>('[data-test-away]')!.focus())
    await settle()
    expect(tooltip.dataset.state).toBe('hidden')
    expect(fading(tooltip)).toBeDefined()
    expect(tooltip.textContent).toBe(text)
    expect(tooltip.style.getPropertyValue('--xh-_chart-tip-x')).toBe(x)
  })

  it('热力图详情条隐去时同样留着上一格淡出', async () => {
    await mount(
      <XhHeatmapRoot
        startDate="2026-01-05"
        endDate="2026-01-18"
        value={[{ date: '2026-01-06', count: 3 }, { date: '2026-01-12', count: 9 }]}
        renderTooltip={(details: { count: number } | null) => <span>{details ? `${details.count} 次` : ''}</span>}
      />,
    )
    const cell = document.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='cell'][data-value='2026-01-12']`)!
    await userEvent.hover(cell)
    const tooltip = part('heatmap', 'tooltip')
    await expect.poll(() => tooltip.dataset.state).toBe('visible')
    for (const animation of tooltip.getAnimations())
      animation.finish()
    expect(tooltip.textContent).toContain('9 次')
    await userEvent.hover(document.body, { position: { x: 1, y: 1 } })
    await expect.poll(() => tooltip.dataset.state).toBe('hidden')
    expect(fading(tooltip)).toBeDefined()
    expect(tooltip.textContent).toContain('9 次')
  })
})

let setOpen: (open: boolean) => void = () => {}
let setLoading: (loading: boolean) => void = () => {}

function Alert(): ReactNode {
  const [open, set] = useState(false)
  setOpen = set
  return (
    <div>
      <XhAlertRoot tone="warning" open={open}>
        <XhAlertContent>
          <XhAlertTitle>存储空间不足</XhAlertTitle>
          <XhAlertDescription>剩余空间低于 10%，请尽快清理</XhAlertDescription>
        </XhAlertContent>
      </XhAlertRoot>
      <p data-test-below="" style={{ margin: 0 }}>下面的内容</p>
    </div>
  )
}

function Skeleton(): ReactNode {
  const [loading, set] = useState(true)
  setLoading = set
  return (
    <XhSkeletonRoot loading={loading} style={{ inlineSize: '260px' }}>
      <XhSkeletonItem />
      <XhSkeletonItem />
    </XhSkeletonRoot>
  )
}

describe('react 警示条与骨架屏重新露面', () => {
  it('警示条关掉之后再显示：按实测高度从 0 展开', async () => {
    await mount(<Alert />)
    const below = document.querySelector<HTMLElement>('[data-test-below]')!
    const top = below.getBoundingClientRect().top
    await inAct(() => setOpen(true))
    await settle()
    const alert = part('alert', 'root')
    const expanding = tween(alert)!
    expect(expanding).toBeDefined()
    expanding.pause()
    expanding.currentTime = 0
    expect(alert.getBoundingClientRect().height).toBeLessThan(1)
    expect(Math.abs(below.getBoundingClientRect().top - top)).toBeLessThan(1)
    expanding.finish()
    expect(below.getBoundingClientRect().top - top).toBeGreaterThan(10)
  })

  it('骨架屏加载完之后再开始加载时淡入', async () => {
    await mount(<Skeleton />)
    const skeleton = part('skeleton', 'root')
    const names = (): string[] => skeleton.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
    expect(names()).toEqual([])
    await inAct(() => setLoading(false))
    await settle()
    for (const animation of skeleton.getAnimations())
      animation.finish()
    await expect.poll(() => skeleton.hidden).toBe(true)
    await inAct(() => setLoading(true))
    await settle()
    expect(names()).toEqual(['xh-fade-in'])
  })
})
