// @vitest-environment jsdom
//
// 滑块的拇指与分割器的分隔条都在 connect 里派了 DOM 的 focus——它不冒泡。
// React 的同名合成事件挂的是冒泡的 focusin，直接送到节点上的那一种到不了处理器。
// 共用的一致性套件走的是真实 el.focus()（focusin 会冒泡），核不到这一路；
// 这里按 DOM 的送达路径直接派，核的是「处理器装在它自己点名的那个事件上」。
//
// 观察口取「正被推动的是哪一个」：这两家的焦点上报只改活动下标，而活动下标唯一落到 DOM 上的
// 地方就是拖动期间那一份 data-dragging——手在哪一个上，标记就只在哪一个上。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhSliderControl,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from '../src'

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

function parts(scope: string, part: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)]
}

/** 按 DOM 的送达路径派：focus 不冒泡。 */
async function fire(el: HTMLElement, event: Event): Promise<void> {
  await act(async () => {
    el.dispatchEvent(event)
  })
  await settle()
}

/** jsdom 不排版，矩形恒是 0×0；摆一份出来，按下那一刻才量得到。 */
function layout(el: HTMLElement, width: number, height: number): void {
  el.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    toJSON: () => ({}),
  }) as DOMRect
}

describe('slider 的不冒泡事件按 DOM 语义送达', () => {
  it('拇指自己得焦：正被推动的那一个改记它，data-dragging 跟着换人', async () => {
    await mount(
      <XhSliderRoot defaultValue={[20, 80]}>
        <XhSliderControl>
          <XhSliderTrack><XhSliderRange /></XhSliderTrack>
          <XhSliderThumb index={0} />
          <XhSliderThumb index={1} />
        </XhSliderControl>
      </XhSliderRoot>,
    )
    layout(parts('slider', 'track')[0]!, 200, 10)

    // 按在靠近第一个拇指的位置：机器抓住它并进入拖动
    await fire(
      parts('slider', 'control')[0]!,
      new PointerEvent('pointerdown', { clientX: 40, clientY: 5, button: 0, bubbles: true, cancelable: true }),
    )
    const [first, second] = parts('slider', 'thumb')
    expect(first!.getAttribute('data-dragging')).toBe('')
    expect(second!.getAttribute('data-dragging')).toBeNull()

    await fire(second!, new Event('focus'))

    expect(second!.getAttribute('data-dragging')).toBe('')
    expect(first!.getAttribute('data-dragging')).toBeNull()

    await fire(document as unknown as HTMLElement, new PointerEvent('pointerup', { bubbles: true }))
  })
})

describe('splitter 的不冒泡事件按 DOM 语义送达', () => {
  it('分隔条自己得焦：正被推动的那一条改记它，data-dragging 跟着换人', async () => {
    await mount(
      <XhSplitterRoot defaultSizes={[30, 40, 30]}>
        <XhSplitterPanel index={0} />
        <XhSplitterResizeTrigger index={0} />
        <XhSplitterPanel index={1} />
        <XhSplitterResizeTrigger index={1} />
        <XhSplitterPanel index={2} />
      </XhSplitterRoot>,
    )
    layout(parts('splitter', 'root')[0]!, 200, 200)

    const [first, second] = parts('splitter', 'resize-trigger')
    await fire(
      first!,
      new PointerEvent('pointerdown', { clientX: 60, clientY: 60, button: 0, bubbles: true, cancelable: true }),
    )
    expect(first!.getAttribute('data-dragging')).toBe('')
    expect(second!.getAttribute('data-dragging')).toBeNull()

    await fire(second!, new Event('focus'))

    expect(second!.getAttribute('data-dragging')).toBe('')
    expect(first!.getAttribute('data-dragging')).toBeNull()

    await fire(document as unknown as HTMLElement, new PointerEvent('pointerup', { bubbles: true }))
  })
})
