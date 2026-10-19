// 两个浮动面板叠着：后展开的在上面；真实鼠标点下面那个、或焦点进到它里面，它提到最上，
// 重叠处命中的换成它；收起最上面的那个，下面的回到最上；叠放序不高过模态层。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
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

/** 真实鼠标在页面坐标 (x, y) 点一下。 */
async function clickAt(x: number, y: number): Promise<void> {
  const scale = await mouseScale()
  const point = { x: x / scale, y: y / scale }
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point })
  await frames()
}

/** 等进退场播完。 */
async function settle(): Promise<void> {
  await frames()
  await Promise.all([...document.querySelectorAll<HTMLElement>(`[data-scope='floating-panel'][data-part='positioner']`)].flatMap(el => el.getAnimations().map(a => a.finished)))
}

/** 标题是 title 的那个面板的某个部件。 */
function part(title: string, name: string): HTMLElement {
  const positioner = [...document.querySelectorAll<HTMLElement>(`[data-scope='floating-panel'][data-part='positioner']`)].find(el => el.textContent?.includes(title))!
  return name === 'positioner' ? positioner : positioner.querySelector<HTMLElement>(`[data-scope='floating-panel'][data-part='${name}']`)!
}

const zIndex = (title: string): number => Number(getComputedStyle(part(title, 'positioner')).zIndex)

/** 重叠处 (196, 170) 命中的是哪个面板。 */
function hitAtOverlap(): string | undefined {
  const hit = document.elementFromPoint(196, 170)
  return hit?.closest<HTMLElement>(`[data-scope='floating-panel'][data-part='content']`)?.querySelector('[data-part="title"]')?.textContent ?? undefined
}

function Panel({ title, x, y }: { title: string, x: number, y: number }) {
  return (
    <XhFloatingPanelRoot defaultOpen defaultPosition={{ x, y }} defaultDimensions={{ width: 240, height: 180 }}>
      <XhFloatingPanelPositioner>
        <XhFloatingPanelContent>
          <XhFloatingPanelHeader>
            <XhFloatingPanelTitle>{title}</XhFloatingPanelTitle>
            <XhFloatingPanelDragTrigger />
            <XhFloatingPanelCloseTrigger />
          </XhFloatingPanelHeader>
          <XhFloatingPanelBody>正文</XhFloatingPanelBody>
        </XhFloatingPanelContent>
      </XhFloatingPanelPositioner>
    </XhFloatingPanelRoot>
  )
}

/** 甲占 (16, 40)–(256, 220)，乙占 (136, 120)–(376, 300)，重叠一块。 */
async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(
    <>
      <Panel title="甲" x={16} y={40} />
      <Panel title="乙" x={136} y={120} />
    </>,
  ))
  await act(() => settle())
}

describe('floating-panel 窗口叠放序（React）', () => {
  it('后展开的在上面；真实鼠标点下面那个，它提到最上，重叠处命中换成它', async () => {
    await mount()
    expect(hitAtOverlap()).toBe('乙')
    expect(zIndex('乙')).toBeGreaterThan(zIndex('甲'))
    // 甲独占的一角
    await clickAt(40, 200)
    expect(hitAtOverlap()).toBe('甲')
    expect(zIndex('甲')).toBeGreaterThan(zIndex('乙'))
  })

  it('焦点进到下面那个里面，它提到最上', async () => {
    await mount()
    part('甲', 'drag-trigger').focus()
    await frames()
    expect(hitAtOverlap()).toBe('甲')
  })

  it('收起最上面的那个，下面的回到最上；最上面那个不高过模态层', async () => {
    await mount()
    const modal = Number(getComputedStyle(document.documentElement).getPropertyValue('--xh-z-modal'))
    expect(zIndex('乙')).toBeLessThanOrEqual(modal)
    const below = zIndex('甲')
    const close = part('乙', 'close-trigger').getBoundingClientRect()
    await clickAt(close.left + close.width / 2, close.top + close.height / 2)
    await settle()
    expect(zIndex('甲')).toBeGreaterThan(below)
    expect(zIndex('甲')).toBeLessThanOrEqual(modal)
  })
})
