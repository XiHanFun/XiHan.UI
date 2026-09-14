// @vitest-environment jsdom
//
// heatmap 的 connect 派了三个不冒泡的事件：网格自己得焦时的 focus、格子上的 focus 与
// pointerenter / pointerleave。共用的一致性套件里，指针那两个本就是直接派到节点上的，
// 聚焦那两路却走真实 el.focus()——focusin 会冒泡，React 的合成事件照样收得到，核不到
// 改装的这一路。这里按 DOM 的送达路径直接派 focus，核的是「处理器装在它自己点名的那个事件上」。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhHeatmapRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

function parts(part: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="heatmap"][data-part="${part}"]`)]
}

/** 按 DOM 的送达路径派：focus 不冒泡。 */
async function fire(el: HTMLElement, event: Event): Promise<void> {
  await act(async () => {
    el.dispatchEvent(event)
  })
  await settle()
}

// 一周的区间：2024-01-01 是星期一，周首日也定死在星期一，七行各一格，文档序即星期一到星期日
const TREE = (
  <XhHeatmapRoot startDate="2024-01-01" endDate="2024-01-07" firstDayOfWeek={1} locale="zh-CN" />
)

describe('heatmap 的不冒泡事件按 DOM 语义送达', () => {
  it('网格自己得焦：焦点转投给锚点那一格', async () => {
    await mount(TREE)
    const grid = parts('grid')[0]!
    expect(grid.getAttribute('tabindex')).toBe('-1')

    await fire(grid, new Event('focus'))

    expect(document.activeElement).toBe(parts('cell')[0])
    expect(parts('cell')[0]!.dataset.value).toBe('2024-01-01')
  })

  it('格子自己得焦：锚点改记它，roving tabindex 跟着换人', async () => {
    await mount(TREE)
    const cells = parts('cell')
    expect(cells[0]!.getAttribute('tabindex')).toBe('0')

    await fire(cells[3]!, new Event('focus'))

    expect(cells[3]!.getAttribute('tabindex')).toBe('0')
    expect(cells[0]!.getAttribute('tabindex')).toBe('-1')
  })
})
