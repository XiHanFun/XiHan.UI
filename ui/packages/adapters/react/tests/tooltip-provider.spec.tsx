// @vitest-environment jsdom
// XhTooltipProvider 把子树里的提示放进同一组：没写 openDelay 的取组的缺省，组内另一个开着时下一个直接接替；
// followCursor 让 trigger 听指针移动、定位层带上跟随标记。计时用假时钟，几何交给浏览器用例。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhTooltipContent, XhTooltipPositioner, XhTooltipProvider, XhTooltipRoot, XhTooltipTrigger } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
  vi.useRealTimers()
})

function mount(node: React.ReactNode): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

function tip(label: string, props: Record<string, unknown> = {}): React.ReactNode {
  return (
    <XhTooltipRoot key={label} {...props}>
      <XhTooltipTrigger>{label}</XhTooltipTrigger>
      <XhTooltipPositioner>
        <XhTooltipContent>{`${label}的说明`}</XhTooltipContent>
      </XhTooltipPositioner>
    </XhTooltipRoot>
  )
}

function part(label: string, name: 'trigger' | 'content' | 'positioner'): HTMLElement {
  const triggers = [...document.querySelectorAll<HTMLElement>(`[data-scope='tooltip'][data-part='trigger']`)]
  const trigger = triggers.find(el => el.textContent === label)!
  if (name === 'trigger')
    return trigger
  const content = document.getElementById(trigger.getAttribute('aria-describedby') ?? '')
    ?? [...document.querySelectorAll<HTMLElement>(`[data-scope='tooltip'][data-part='content']`)].find(el => el.textContent?.startsWith(label))!
  return name === 'content' ? content : content.closest<HTMLElement>(`[data-scope='tooltip'][data-part='positioner']`)!
}

function enter(el: HTMLElement): void {
  act(() => {
    el.dispatchEvent(new Event('pointerenter'))
  })
}

describe('xhTooltipProvider', () => {
  it('组内提示取组的 openDelay；组内另一个开着时下一个直接接替，上一个收起', () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 60_000)
    mount(
      <XhTooltipProvider openDelay={150} skipDelayDuration={300}>
        {tip('保存')}
        {tip('撤销')}
      </XhTooltipProvider>,
    )
    enter(part('保存', 'trigger'))
    act(() => vi.advanceTimersByTime(149))
    expect(part('保存', 'content').dataset.state).toBe('closed')
    act(() => vi.advanceTimersByTime(1))
    expect(part('保存', 'content').dataset.state).toBe('open')

    enter(part('撤销', 'trigger'))
    act(() => vi.advanceTimersByTime(0))
    expect(part('撤销', 'content').dataset.state).toBe('open')
    expect(part('保存', 'content').dataset.state).toBe('closed')
  })

  it('提示自己写的 openDelay 压过组的缺省', () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 120_000)
    mount(<XhTooltipProvider openDelay={150} skipDelayDuration={0}>{tip('导出', { openDelay: 400 })}</XhTooltipProvider>)
    enter(part('导出', 'trigger'))
    act(() => vi.advanceTimersByTime(150))
    expect(part('导出', 'content').dataset.state).toBe('closed')
    act(() => vi.advanceTimersByTime(250))
    expect(part('导出', 'content').dataset.state).toBe('open')
  })
})

describe('followCursor', () => {
  it('开了跟随鼠标：定位层带跟随标记；没开时不带', () => {
    mount(
      <>
        {tip('跟随', { followCursor: true })}
        {tip('锚定')}
      </>,
    )
    expect(part('跟随', 'positioner').hasAttribute('data-follow-cursor')).toBe(true)
    expect(part('锚定', 'positioner').hasAttribute('data-follow-cursor')).toBe(false)
  })
})
