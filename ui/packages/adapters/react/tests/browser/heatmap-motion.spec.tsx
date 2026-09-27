import type { HeatmapDatum } from '@xihan-ui/headless'
import type { CSSProperties } from 'react'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhHeatmapRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const value: HeatmapDatum[] = [
  { date: '2024-01-01', count: 3 },
  { date: '2024-01-14', count: 5 },
]

const slowMotion = {
  '--xh-motion-duration-reveal': '4s',
  '--xh-motion-duration-enter': '4s',
} as CSSProperties

let host: HTMLElement | null = null
let root: Root | null = null

// 本用例刻意观察 act 包裹之前的真实首次提交；打开 act 环境会把这段时序折叠掉。
beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false))
afterEach(() => {
  root?.unmount()
  root = null
  host?.remove()
  host = null
  vi.unstubAllGlobals()
})

async function nextFrame(): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function firstVisibleFrame(animated?: boolean): Promise<{ colored: number, drawing: number } | null> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  root.render(
    <XhHeatmapRoot
      value={value}
      startDate="2024-01-01"
      endDate="2024-01-14"
      animated={animated}
      style={slowMotion}
    />,
  )

  for (let frame = 0; frame < 20; frame++) {
    await nextFrame()
    const cells = [...host.querySelectorAll<HTMLElement>('[data-scope="heatmap"][data-part="cell"]')]
    if (!cells.length)
      continue
    const colored = cells.filter(cell => cell.getAttribute('data-level') !== '0')
    return {
      colored: colored.length,
      drawing: colored.filter(cell => cell.hasAttribute('data-drawing')).length,
    }
  }
  return null
}

describe('heatmap React 入场', () => {
  it('首次可见帧已经处于填色起点，不先闪出完整终态', async () => {
    const firstVisible = await firstVisibleFrame()
    expect(firstVisible).not.toBeNull()
    expect(firstVisible!.drawing).toBe(firstVisible!.colored)
  })

  it('animated=false 的首次可见帧直接画终态', async () => {
    const firstVisible = await firstVisibleFrame(false)
    expect(firstVisible).not.toBeNull()
    expect(firstVisible!.colored).toBe(2)
    expect(firstVisible!.drawing).toBe(0)
  })
})
