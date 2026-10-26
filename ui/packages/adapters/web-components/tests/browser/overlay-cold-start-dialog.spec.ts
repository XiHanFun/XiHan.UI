import { getLayerRegistry, overlayKit } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 本文件不预取浮层按需块（见 tests/browser/setup.ts）：量的是第一次打开时按需块还没到的那条路径。
// 按需块一页只到一次，所以整条路径写在一条用例里：开两个对话框，其中一个在等的时候关掉。
;

(globalThis as { __xhColdOverlay?: boolean }).__xhColdOverlay = true

defineXhElements()

type DialogHost = HTMLElement & { open?: boolean }

afterEach(() => {
  document.body.innerHTML = ''
})

async function frames(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await Promise.resolve()
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

/** 等宿主排的更新跑完：更新排在微任务里，按需块要走一趟网络，这几拍里到不了。 */
async function microtasks(): Promise<void> {
  for (let i = 0; i < 5; i++)
    await Promise.resolve()
}

function dialog(title: string): DialogHost {
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-dialog>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content"><h2 data-xh-part="title">${title}</h2><button>${title}的按钮</button></div>
      </div>
    </xh-dialog>`
  document.body.append(host)
  const el = host.querySelector<DialogHost>('xh-dialog')!
  el.open = false
  el.addEventListener('open-change', (event) => {
    el.open = (event as CustomEvent<{ open: boolean }>).detail.open
  })
  return el
}

function shown(node: HTMLElement): boolean {
  return node.getClientRects().length > 0
}

describe('xh-dialog 第一次打开时按需块还没到', () => {
  it('内容等按需块到了才露出；等的时候关掉的不露、不入层、不抢焦点；到了之后焦点进去、滚动锁上', async () => {
    const outside = document.createElement('button')
    outside.textContent = '页面按钮'
    document.body.append(outside)
    outside.focus()

    const kept = dialog('保留')
    const dropped = dialog('中途关掉')
    await frames(2)
    // 内容节点由作者写、常驻：开之前先记下，开了之后模态内容会被搬到落点
    const keptContent = kept.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const droppedContent = dropped.querySelector<HTMLElement>('[data-xh-part="content"]')!
    expect(overlayKit()).toBeNull()

    kept.open = true
    dropped.open = true
    await microtasks()

    expect(overlayKit()).toBeNull()
    expect(shown(keptContent)).toBe(false)
    expect(shown(droppedContent)).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(document.activeElement).toBe(outside)
    expect(document.body.style.overflow).not.toBe('hidden')

    dropped.open = false
    await microtasks()

    await vi.waitFor(() => expect(overlayKit()).not.toBeNull())
    await frames(3)

    expect(shown(keptContent)).toBe(true)
    expect(shown(droppedContent)).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    await expect.poll(() => keptContent.contains(document.activeElement)).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')

    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await frames(2)
    expect(kept.open).toBe(false)
  })
})
