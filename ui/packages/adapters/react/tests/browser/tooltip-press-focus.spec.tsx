// 按下带提示的按钮：提示收起、让位给真正的操作；点击把焦点带到按钮上，这次聚焦不该再把提示打开（React）。
// 指针移开再回来、或用键盘聚焦时照常出现。真实点击里 pointerdown、focus、pointerup 的先后只有浏览器里有。
import type { Root } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhTooltipContent, XhTooltipPositioner, XhTooltipRoot, XhTooltipTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null

// 不走 act：量的是 React 按自己的调度提交时真实事件的先后
beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false))
afterEach(async () => {
  await userEvent.hover(park())
  flushSync(() => root?.unmount())
  root = null
  host?.remove()
  host = null
  vi.unstubAllGlobals()
})

function park(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-test-park-pointer]')!
}

/** 一颗普通按钮在前、带提示的按钮在后：键盘从前一颗 Tab 过来。 */
function mount(): void {
  host = document.createElement('div')
  host.style.cssText = 'display:flex;gap:40px;padding:120px 40px'
  document.body.append(host)
  root = createRoot(host)
  flushSync(() => root!.render(
    <>
      <button type="button" data-test="before">新增</button>
      <XhTooltipRoot openDelay={0} closeDelay={0}>
        <XhTooltipTrigger data-test="tip-trigger">查询</XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent data-test="tip-content">按条件查询</XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </>,
  ))
}

function test(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-test="${name}"]`)!
}

const tipState = (): string | undefined => test('tip-content').dataset.state

/** 等一小段再看：提示要是会被重新打开，这段时间里早就开了（开延时为 0）。 */
function pause(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 300))
}

describe('react 提示：按下之后的聚焦', () => {
  it('悬停出现后点按钮：提示收起，焦点落在按钮上也不再打开', async () => {
    mount()
    await userEvent.hover(test('tip-trigger'))
    await expect.poll(tipState).toBe('open')

    await userEvent.click(test('tip-trigger'))

    await expect.poll(tipState).toBe('closed')
    expect(document.activeElement).toBe(test('tip-trigger'))
    await pause()
    expect(tipState()).toBe('closed')
  })

  it('点过之后指针移开再回来：照常出现', async () => {
    mount()
    await userEvent.click(test('tip-trigger'))
    await pause()
    expect(tipState()).toBe('closed')

    await userEvent.hover(park())
    await userEvent.hover(test('tip-trigger'))

    await expect.poll(tipState).toBe('open')
  })

  it('点过之后用键盘离开再回来：聚焦照常打开', async () => {
    mount()
    await userEvent.click(test('tip-trigger'))
    await pause()
    expect(tipState()).toBe('closed')

    // 指针还停在按钮上：Shift+Tab 走到前一颗，再 Tab 回来
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(document.activeElement).toBe(test('before'))
    await userEvent.keyboard('{Tab}')

    expect(document.activeElement).toBe(test('tip-trigger'))
    await expect.poll(tipState).toBe('open')
  })
})
