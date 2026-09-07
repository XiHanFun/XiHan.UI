// @vitest-environment jsdom
//
// 触发器的 asChild：借用作者的节点当触发器，不再自己渲染 <button> 包裹。
// 触发器默认渲染 <button>，作者想用自己的按钮当触发器时只能往 <button> 里再套一个——
// 那是非法嵌套，浏览器会把它拆开，事件与焦点都不对。
import { onDiagnostic, resetDiagnostics } from '@xihan-ui/core'
import { act, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhDialogRoot, XhDialogTrigger } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  resetDiagnostics()
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
  resetDiagnostics()
})

function mount(node: React.ReactNode): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

function triggers(): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>('[data-scope="dialog"][data-part="trigger"]')]
}

describe('触发器的 asChild', () => {
  it('借用作者的元素：不再有自己的 <button> 包裹，整套属性落到作者那个节点上', () => {
    mount(
      <XhDialogRoot>
        <XhDialogTrigger asChild><a href="#x" data-testid="own">打开</a></XhDialogTrigger>
      </XhDialogRoot>,
    )
    expect(host!.querySelectorAll('button')).toHaveLength(0)
    const own = host!.querySelector<HTMLElement>('[data-testid="own"]')!
    expect(own.tagName).toBe('A')
    expect(own.dataset.part).toBe('trigger')
    expect(own.getAttribute('aria-haspopup')).toBe('dialog')
  })

  it('不开 asChild 时照常渲染自己的 <button>', () => {
    mount(
      <XhDialogRoot>
        <XhDialogTrigger>打开</XhDialogTrigger>
      </XhDialogRoot>,
    )
    expect(triggers()[0]!.tagName).toBe('BUTTON')
  })

  // 同名处理器串起来依次跑，两条路的顺序刚好相反：不开 asChild 时部件在前，
  // 开了 asChild 时作者在前。这不是这一侧自己定的——Vue 侧两条路本来就是这个顺序
  // （实测过），三家要对得上就照它，不另立一套。顺序一旦分叉，作者在 asChild 上
  // 拦得住的事在另一条路上拦不住，而两边看着是同一个 prop。
  it('开 asChild：写在作者节点上的处理器先跑，部件的后跑', () => {
    const seen: string[] = []
    mount(
      <XhDialogRoot onOpenChange={() => seen.push('机器')}>
        <XhDialogTrigger asChild>
          <button type="button" onClick={() => seen.push('作者')}>打开</button>
        </XhDialogTrigger>
      </XhDialogRoot>,
    )
    act(() => triggers()[0]!.click())
    expect(seen).toEqual(['作者', '机器'])
  })

  it('写在部件上的处理器：部件的先跑，作者的后跑（两条路都一样）', () => {
    for (const asChild of [false, true]) {
      const seen: string[] = []
      mount(
        <XhDialogRoot onOpenChange={() => seen.push('机器')}>
          <XhDialogTrigger asChild={asChild} onClick={() => seen.push('作者')}>
            {asChild ? <button type="button">打开</button> : '打开'}
          </XhDialogTrigger>
        </XhDialogRoot>,
      )
      act(() => triggers()[0]!.click())
      expect(seen, `asChild=${asChild}`).toEqual(['机器', '作者'])
      act(() => root!.unmount())
      host!.remove()
    }
  })

  it('作者的 ref 与部件的 ref 都拿得到节点', () => {
    let seen: HTMLElement | null = null
    function Probe(): React.ReactNode {
      const own = useRef<HTMLButtonElement | null>(null)
      return (
        <XhDialogRoot>
          <XhDialogTrigger asChild>
            <button
              type="button"
              ref={(el) => {
                own.current = el
                seen = el
              }}
            >
              打开
            </button>
          </XhDialogTrigger>
        </XhDialogRoot>
      )
    }
    mount(<Probe />)
    expect(seen).not.toBeNull()
    expect((seen as unknown as HTMLElement).dataset.part).toBe('trigger')
  })

  it('子节点不是恰好一个时报诊断并退回默认渲染', () => {
    const records: unknown[] = []
    onDiagnostic(r => void records.push(r))
    mount(
      <XhDialogRoot>
        <XhDialogTrigger asChild>
          <span>一</span>
          <span>二</span>
        </XhDialogTrigger>
      </XhDialogRoot>,
    )
    // 退回默认渲染：自己那颗 <button> 还在
    expect(triggers()[0]!.tagName).toBe('BUTTON')
    expect(records.length).toBeGreaterThan(0)
  })

  it('作者的 className 与部件的合起来，不是后者盖前者', () => {
    mount(
      <XhDialogRoot>
        <XhDialogTrigger asChild className="from-part">
          <button type="button" className="from-author">打开</button>
        </XhDialogTrigger>
      </XhDialogRoot>,
    )
    const cls = triggers()[0]!.className.split(/\s+/)
    expect(cls).toContain('from-author')
    expect(cls).toContain('from-part')
  })
})
