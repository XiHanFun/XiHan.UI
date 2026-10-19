// 触发区包着自带 Tab 位的画布（设计器的做法）：真实键盘从起点 Tab 一下直接落到画布，触发区不再多停一下；
// 画布上按 Shift+F10 展开菜单，Esc 关掉后焦点回到画布；触发区里只有文字时照旧自带 Tab 位。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhContextMenuContent, XhContextMenuItem, XhContextMenuItemText, XhContextMenuPositioner, XhContextMenuRoot, XhContextMenuTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++)
    await act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
}

const ITEMS = [{ value: 'copy', label: '复制' }, { value: 'paste', label: '粘贴' }]

const CANVAS = <div tabIndex={0} aria-label="画布" data-test-canvas="" style={{ blockSize: '120px' }}>销售额 ¥217,664 占比 8.8%</div>

async function mount(content: ReactNode, onSelect?: (details: { value: string }) => void): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  root = createRoot(host)
  await act(async () => root!.render(
    <div>
      <button type="button" data-test-start="">起点</button>
      <XhContextMenuRoot onSelect={onSelect}>
        <XhContextMenuTrigger>{content}</XhContextMenuTrigger>
        <XhContextMenuPositioner>
          <XhContextMenuContent>
            {ITEMS.map(item => (
              <XhContextMenuItem key={item.value} value={item.value}>
                <XhContextMenuItemText>{item.label}</XhContextMenuItemText>
              </XhContextMenuItem>
            ))}
          </XhContextMenuContent>
        </XhContextMenuPositioner>
      </XhContextMenuRoot>
      <button type="button" data-test-end="">终点</button>
    </div>,
  ))
  await settle()
}

function el(selector: string): HTMLElement {
  return document.querySelector<HTMLElement>(selector)!
}

function trigger(): HTMLElement {
  return el('[data-scope="context-menu"][data-part="trigger"]')
}

describe('context-menu 触发区里已有 Tab 位', () => {
  it('从起点 Tab 一下直接落到画布，再 Tab 一下到终点；Shift + Tab 原路回去', async () => {
    await mount(CANVAS)
    expect(trigger().hasAttribute('tabindex')).toBe(false)
    el('[data-test-start]').focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(el('[data-test-canvas]'))
    await userEvent.tab()
    expect(document.activeElement).toBe(el('[data-test-end]'))
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(el('[data-test-start]'))
  })

  it('画布上按 Shift + F10 展开、焦点落到首条；Esc 关掉后焦点回到画布', async () => {
    await mount(CANVAS)
    el('[data-test-start]').focus()
    await userEvent.tab()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    const first = el('[data-scope="context-menu"][data-part="item"][data-value="copy"]')
    expect(document.activeElement).toBe(first)
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(el('[data-scope="context-menu"][data-part="content"]').hidden).toBe(true)
    expect(document.activeElement).toBe(el('[data-test-canvas]'))
  })

  it('选中条目关掉后焦点同样回到画布', async () => {
    const picked: string[] = []
    await mount(CANVAS, details => picked.push(details.value))
    el('[data-test-canvas]').focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await settle()
    expect(picked).toEqual(['paste'])
    expect(document.activeElement).toBe(el('[data-test-canvas]'))
  })

  it('触发区里只有文字：照旧自带 Tab 位，Esc 后焦点回到触发区', async () => {
    await mount('右键这块区域')
    el('[data-test-start]').focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger())
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await settle()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.activeElement).toBe(trigger())
  })
})
