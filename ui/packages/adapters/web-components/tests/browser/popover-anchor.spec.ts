import type { XhPopoverElement } from '../../src/elements/popover'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

async function frames(count = 3): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

function positioner(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='popover'][data-part='positioner']`)
}

async function positioned(): Promise<DOMRect> {
  // 宿主首轮提交之后部件才带 data-scope，等它出现并落位
  for (let i = 0; i < 20 && !positioner()?.hasAttribute('data-positioned'); i++)
    await frames(1)
  expect(positioner()?.hasAttribute('data-positioned')).toBe(true)
  return positioner()!.getBoundingClientRect()
}

function anchorButton(text: string, left: number, top: number): HTMLButtonElement {
  const el = document.createElement('button')
  el.textContent = text
  el.style.cssText = `position:fixed;left:${left}px;top:${top}px;width:96px;height:32px`
  document.body.append(el)
  return el
}

function mount(anchor: HTMLElement): XhPopoverElement {
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-popover placement="bottom">
      <div data-xh-part="positioner">
        <div data-xh-part="content" aria-label="页面设置"><button>保存</button></div>
      </div>
    </xh-popover>
  `
  const element = host.firstElementChild as XhPopoverElement
  element.anchor = anchor
  document.body.append(host)
  return element
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('popover · anchor（真实布局）', () => {
  // 测试视口窄，浮层在行内轴上会被夹回可视区，只断言块轴：两颗锚点上下错开，浮层顶边跟着贴到当前锚点的下边
  it('没有 trigger：浮层贴着外部锚点的下边，换锚点后跟着挪过去', async () => {
    const first = anchorButton('页面设置', 40, 40)
    const second = anchorButton('更多', 40, 240)
    const element = mount(first)
    element.open = true
    const rect = await positioned()
    const a = first.getBoundingClientRect()
    expect(rect.top).toBeGreaterThanOrEqual(a.bottom)
    expect(rect.top - a.bottom).toBeLessThanOrEqual(12)

    element.anchor = second
    await frames()
    const moved = positioner()!.getBoundingClientRect()
    const b = second.getBoundingClientRect()
    expect(moved.top).toBeGreaterThanOrEqual(b.bottom)
    expect(moved.top - b.bottom).toBeLessThanOrEqual(12)
    expect(first.hasAttribute('aria-expanded')).toBe(false)
    expect(second.getAttribute('aria-expanded')).toBe('true')
  })

  it('真实指针点外部锚点不收起；Escape 收起后焦点回到外部锚点', async () => {
    const anchor = anchorButton('页面设置', 40, 40)
    const element = mount(anchor)
    const changes: boolean[] = []
    element.addEventListener('open-change', event => changes.push((event as CustomEvent<{ open: boolean }>).detail.open))
    // 受控：宿主按 open-change 写回，模拟命令切换
    element.addEventListener('open-change', event => void (element.open = (event as CustomEvent<{ open: boolean }>).detail.open))
    element.open = true
    await positioned()
    await userEvent.click(anchor)
    await frames()
    expect(changes).toEqual([])
    expect(element.open).toBe(true)

    await userEvent.keyboard('{Escape}')
    await frames()
    expect(changes).toEqual([false])
    expect(document.activeElement).toBe(anchor)
    expect(anchor.hasAttribute('aria-controls')).toBe(false)
  })
})
