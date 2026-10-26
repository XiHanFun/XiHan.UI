import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { getLayerRegistry, overlayKit } from '@xihan-ui/core'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhDialogContent, XhDialogRoot, XhDialogTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 本文件不预取浮层按需块（见 tests/browser/setup.ts）：量的是第一次打开时按需块还没到的那条路径。
// 按需块一页只到一次，所以整条路径写在一条用例里：开两个对话框，其中一个在等的时候关掉。
;

(globalThis as { __xhColdOverlay?: boolean }).__xhColdOverlay = true

let root: Root | null = null

async function frames(count: number): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 标题为 title 的那个对话框的内容：还没露过时不挂载，返回 null。 */
function content(title: string): HTMLElement | null {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="dialog"][data-part="content"]')]
    .find(el => el.textContent?.includes(title)) ?? null
}

/** 露没露出来：没挂载、带 hidden 或内联 display: none 都算没露。 */
function shown(title: string): boolean {
  const el = content(title)
  return el != null && !el.hidden && el.style.display !== 'none' && el.getClientRects().length > 0
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

describe('对话框第一次打开时按需块还没到', () => {
  it('内容等按需块到了才露出；等的时候关掉的不露、不入层、不抢焦点；到了之后焦点进去、滚动锁上', async () => {
    const outside = document.createElement('button')
    outside.textContent = '页面按钮'
    document.body.append(outside)
    outside.focus()

    const host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    const state = { kept: false, dropped: false }
    const dialog = (key: 'kept' | 'dropped', title: string): ReactNode => (
      <XhDialogRoot open={state[key]} onOpenChange={(details) => { state[key] = details.open }}>
        <XhDialogContent>
          <XhDialogTitle>{title}</XhDialogTitle>
          <button type="button">{`${title}的按钮`}</button>
        </XhDialogContent>
      </XhDialogRoot>
    )
    const render = (): void => root!.render(
      <>
        {dialog('kept', '保留')}
        {dialog('dropped', '中途关掉')}
      </>,
    )
    flushSync(render)
    await frames(2)
    expect(overlayKit()).toBeNull()

    state.kept = true
    state.dropped = true
    flushSync(render)

    // 按需块要走一趟网络，同步提交里到不了：此刻看到的正是「展开了、资源还没到」
    expect(overlayKit()).toBeNull()
    expect(shown('保留')).toBe(false)
    expect(shown('中途关掉')).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(document.activeElement).toBe(outside)
    expect(document.body.style.overflow).not.toBe('hidden')

    state.dropped = false
    flushSync(render)

    await vi.waitFor(() => expect(overlayKit()).not.toBeNull())
    await frames(3)

    expect(shown('保留')).toBe(true)
    expect(shown('中途关掉')).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    await expect.poll(() => content('保留')!.contains(document.activeElement)).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')

    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await frames(2)
    expect(state.kept).toBe(false)
  })
})
