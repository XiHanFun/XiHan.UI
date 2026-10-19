// 拖拽把手的真实鼠标拖动：按下报一次 drag-start、松手报一次 drag-end，都带指针位置（clientX / clientY），
// 松手时 canceled 为 false；面板跟着走到新位置。键盘平移不报拖动起止。
import type { FloatingPanelDragEndDetails, FloatingPanelDragStartDetails } from '@xihan-ui/headless'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import {
  XhFloatingPanelBody,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
} from '../../src'
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

async function frames(n = 2): Promise<void> {
  for (let i = 0; i < n; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** CDP 的鼠标坐标与页面 CSS 像素之间的比例（缩放了的页面不是 1）。 */
async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

/** 按住把手中心，分八步拖动 (dx, dy)，松开；返回按下与松手处的页面坐标。 */
async function dragBy(handle: HTMLElement, dx: number, dy: number): Promise<{ start: { x: number, y: number }, end: { x: number, y: number } }> {
  const scale = await mouseScale()
  const at = (x: number, y: number) => ({ x: x / scale, y: y / scale })
  const box = handle.getBoundingClientRect()
  const start = { x: Math.round(box.left + box.width / 2), y: Math.round(box.top + box.height / 2) }
  const end = { x: start.x + dx, y: start.y + dy }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...at(start.x, start.y) })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...at(start.x, start.y) })
  for (let i = 1; i <= 8; i++) {
    await frames(1)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', ...at(start.x + (dx * i) / 8, start.y + (dy * i) / 8) })
  }
  await frames(1)
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...at(end.x, end.y) })
  await frames()
  return { start, end }
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='floating-panel'][data-part='${name}']`)!
}

const near = (actual: number, expected: number): boolean => Math.abs(actual - expected) <= 1

interface Log { starts: FloatingPanelDragStartDetails[], ends: FloatingPanelDragEndDetails[] }

async function mount(): Promise<Log> {
  const log: Log = { starts: [], ends: [] }
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(
    <XhFloatingPanelRoot
      defaultOpen
      defaultPosition={{ x: 120, y: 80 }}
      defaultDimensions={{ width: 320, height: 240 }}
      onDragStart={details => log.starts.push(details)}
      onDragEnd={details => log.ends.push(details)}
    >
      <XhFloatingPanelPositioner>
        <XhFloatingPanelContent>
          <XhFloatingPanelHeader>
            <XhFloatingPanelTitle>调试面板</XhFloatingPanelTitle>
            <XhFloatingPanelDragTrigger />
          </XhFloatingPanelHeader>
          <XhFloatingPanelBody>正文</XhFloatingPanelBody>
        </XhFloatingPanelContent>
      </XhFloatingPanelPositioner>
    </XhFloatingPanelRoot>,
  ))
  await act(() => frames())
  await Promise.all(part('positioner').getAnimations().map(a => a.finished))
  return log
}

describe('floating-panel 拖动起止事件（React）', () => {
  it('真实鼠标拖动把手：按下报一次 drag-start，松手报一次 drag-end，都带指针位置；面板跟着走', async () => {
    const log = await mount()
    const before = part('positioner').getBoundingClientRect()
    const { start, end } = await dragBy(part('drag-trigger'), 60, 40)
    expect(log.starts).toHaveLength(1)
    expect(near(log.starts[0]!.clientX, start.x) && near(log.starts[0]!.clientY, start.y)).toBe(true)
    expect(log.ends).toHaveLength(1)
    expect(log.ends[0]!.canceled).toBe(false)
    expect(near(log.ends[0]!.clientX, end.x) && near(log.ends[0]!.clientY, end.y)).toBe(true)
    const after = part('positioner').getBoundingClientRect()
    expect(near(after.left - before.left, 60) && near(after.top - before.top, 40)).toBe(true)
  })

  it('键盘平移把手不报拖动起止', async () => {
    const log = await mount()
    part('drag-trigger').focus()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}')
    await frames()
    expect([log.starts, log.ends]).toEqual([[], []])
  })
})
