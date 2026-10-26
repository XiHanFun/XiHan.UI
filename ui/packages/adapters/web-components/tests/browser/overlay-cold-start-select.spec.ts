import type { SelectNode } from '@xihan-ui/headless'
import { getLayerRegistry, overlayKit } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 本文件不预取浮层按需块（见 tests/browser/setup.ts）：量的是第一次打开时按需块还没到的那条路径。
// 按需块一页只到一次，所以整条路径写在一条用例里。
;

(globalThis as { __xhColdOverlay?: boolean }).__xhColdOverlay = true

defineXhElements()

const ITEMS: SelectNode[] = Array.from({ length: 30 }, (_, i) => ({ value: `item-${i}`, label: `条目 ${i}` }))

type SelectHost = HTMLElement & { collection?: SelectNode[], open?: boolean }

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

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="select"][data-part="${name}"]`)
}

describe('xh-select 第一次打开时按需块还没到', () => {
  it('展开态当场生效、面板落位前藏着；到了之后落位、入层、焦点进去、自绘条接上，Escape 照常收起', async () => {
    const outside = document.createElement('button')
    outside.textContent = '页面按钮'
    document.body.append(outside)
    outside.focus()

    const host = document.createElement('div')
    host.innerHTML = '<xh-select aria-label="类别"><div data-xh-part="root"></div></xh-select>'
    document.body.append(host)
    const select = host.querySelector<SelectHost>('xh-select')!
    select.collection = ITEMS
    select.open = false
    select.addEventListener('open-change', (event) => {
      select.open = (event as CustomEvent<{ open: boolean }>).detail.open
    })
    await frames(2)
    expect(overlayKit()).toBeNull()

    select.open = true
    await microtasks()

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
    // 自绘条的实现是另一块，浮层呈现时开始取：到了排一轮更新，接在定位层上
    await vi.waitFor(() => expect(part('positioner')!.querySelector('[data-scope="scrollbar"]')).not.toBeNull())

    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await frames(2)
    expect(select.open).toBe(false)
  })
})
