// 双击分隔条折叠它一侧可折叠的面板，再双击回到折叠前的尺寸：左右两侧可折叠的三栏，
// 左边那条管前一块，右边那条前一块不可折叠、管后一块。真实指针双击会先按下两次（各起一场零位移的拖拽），
// 要在浏览器里看这两场拖拽不挡双击、按下的 preventDefault 也不吞掉 dblclick。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhSplitterPanel, XhSplitterResizeTrigger, XhSplitterRoot } from '../../src'
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

function parts(name: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='splitter'][data-part='${name}']`)]
}

async function settled(): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await expect.poll(() => parts('root')[0]!.hasAttribute('data-animating')).toBe(false)
}

function widths(): number[] {
  return parts('panel').map(panel => Math.round(panel.getBoundingClientRect().width))
}

const PANELS = [{ id: 'nav', min: 10, collapsible: true }, { id: 'main' }, { id: 'side', min: 10, collapsible: true }]

describe('splitter 双击折叠', () => {
  it('双击左边那条折叠前一块、再双击还原；右边那条管可折叠的后一块', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    act(() => root!.render(
      <XhSplitterRoot defaultSizes={[25, 50, 25]} panels={PANELS} style={{ inlineSize: '400px', blockSize: '120px' }}>
        <XhSplitterPanel index={0}>导航</XhSplitterPanel>
        <XhSplitterResizeTrigger index={0} />
        <XhSplitterPanel index={1}>正文</XhSplitterPanel>
        <XhSplitterResizeTrigger index={1} />
        <XhSplitterPanel index={2}>属性</XhSplitterPanel>
      </XhSplitterRoot>,
    ))
    await settled()
    const [first, second] = parts('resize-trigger')
    const before = widths()

    await userEvent.dblClick(first!)
    await settled()
    expect(parts('panel')[0]!.hasAttribute('data-collapsed')).toBe(true)
    expect(widths()[0]).toBeLessThan(2)
    expect(document.activeElement).toBe(first)
    expect(parts('root')[0]!.hasAttribute('data-dragging')).toBe(false)

    await userEvent.dblClick(first!)
    await settled()
    expect(parts('panel')[0]!.hasAttribute('data-collapsed')).toBe(false)
    expect(widths()).toEqual(before)

    await userEvent.dblClick(second!)
    await settled()
    expect(parts('panel')[2]!.hasAttribute('data-collapsed')).toBe(true)
    expect(widths()[2]).toBeLessThan(2)
    expect(widths()[0]).toBe(before[0])

    await userEvent.dblClick(second!)
    await settled()
    expect(widths()).toEqual(before)
  })
})
