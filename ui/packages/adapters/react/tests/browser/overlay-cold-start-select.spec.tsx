import type { Root } from 'react-dom/client'
import { getLayerRegistry, overlayKit } from '@xihan-ui/core'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 本文件不预取浮层按需块（见 tests/browser/setup.ts）：量的是第一次打开时按需块还没到的那条路径。
// 按需块一页只到一次，所以整条路径写在一条用例里。
;

(globalThis as { __xhColdOverlay?: boolean }).__xhColdOverlay = true

const ITEMS = Array.from({ length: 30 }, (_, i) => ({ value: `item-${i}`, label: `条目 ${i}` }))

let root: Root | null = null

async function frames(count: number): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="select"][data-part="${name}"]`)
}

// 不走 act：按需块到达是真正的异步，量的就是 React 按自己的调度提交时的时序。act 会把到达之后的
// 提交压到 act 结束才做，焦点域的逐帧重试先用完了，与使用者页面上的行为对不上
beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false))
afterEach(() => {
  flushSync(() => root?.unmount())
  root = null
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('选择器第一次打开时按需块还没到', () => {
  it('展开态当场生效、面板落位前藏着；到了之后落位、入层、焦点进去、自绘条接上，Escape 照常收起', async () => {
    const outside = document.createElement('button')
    outside.textContent = '页面按钮'
    document.body.append(outside)
    outside.focus()

    const host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    let open = false
    const onOpenChange = (details: { open: boolean }): void => {
      open = details.open
    }
    const render = (): void => root!.render(<XhSelectRoot ariaLabel="类别" collection={ITEMS} open={open} onOpenChange={onOpenChange} />)
    flushSync(render)
    await frames(2)
    expect(overlayKit()).toBeNull()

    open = true
    flushSync(render)

    // 按需块要走一趟网络，同步提交里到不了：此刻看到的正是「展开了、资源还没到」
    expect(overlayKit()).toBeNull()
    expect(part('trigger')!.getAttribute('aria-expanded')).toBe('true')
    expect(part('positioner')!.hasAttribute('data-positioned')).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(document.activeElement).toBe(outside)

    await vi.waitFor(() => expect(overlayKit()).not.toBeNull())
    await frames(3)

    expect(part('positioner')!.hasAttribute('data-positioned')).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    await expect.poll(() => part('content')!.contains(document.activeElement)).toBe(true)
    // 自绘条的实现是另一块，浮层呈现时开始取：到了就接在定位层上
    await vi.waitFor(() => expect(part('positioner')!.querySelector('[data-scope="scrollbar"]')).not.toBeNull())

    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await frames(2)
    expect(open).toBe(false)
  })
})
