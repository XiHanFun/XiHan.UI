// @vitest-environment jsdom
//
// 触发器的 asChild：借用作者的节点当触发器，不再自己渲染 <button> 包裹。
// 触发器默认渲染 <button>，作者想用自己的按钮当触发器时只能往 <button> 里再套一个——
// 那是非法嵌套，浏览器会把它拆开，事件与焦点都不对。
import { resetDiagnostics } from '@xihan-ui/core'
import { act, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhDialogRoot, XhDialogTrigger } from '../src'
import { mergeIntoChild, renderAsChild } from '../src/runtime/as-child'
import { mergePartProps, mergeReactProps } from '../src/runtime/merge-props'

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

  // 同名处理器串起来依次跑，作者的排在部件的前面。写在子节点上还是写在部件上、
  // 开不开 asChild，都是同一个先后：先后一旦跟着写法反转，作者在一种写法里拦得住的事
  // 在另一种写法里拦不住，而两边看着是同一个 prop。
  it('开 asChild：写在作者节点上的处理器先跑，部件的后跑', () => {
    const seen: string[] = []
    mount(
      <XhDialogRoot onOpenChange={() => seen.push('部件')}>
        <XhDialogTrigger asChild>
          <button type="button" onClick={() => seen.push('作者')}>打开</button>
        </XhDialogTrigger>
      </XhDialogRoot>,
    )
    act(() => triggers()[0]!.click())
    expect(seen).toEqual(['作者', '部件'])
  })

  it('写在部件上的处理器：作者的先跑，部件的后跑（两条路都一样）', () => {
    for (const asChild of [false, true]) {
      const seen: string[] = []
      mount(
        <XhDialogRoot onOpenChange={() => seen.push('部件')}>
          <XhDialogTrigger asChild={asChild} onClick={() => seen.push('作者')}>
            {asChild ? <button type="button">打开</button> : '打开'}
          </XhDialogTrigger>
        </XhDialogRoot>,
      )
      act(() => triggers()[0]!.click())
      expect(seen, `asChild=${asChild}`).toEqual(['作者', '部件'])
      act(() => root!.unmount())
      host!.remove()
    }
  })

  it('作者写在部件上的普通值仍然盖过部件的，className 两边都留', () => {
    mount(
      <XhDialogRoot>
        <XhDialogTrigger className="mine" type="submit" aria-label="我的名字">打开</XhDialogTrigger>
      </XhDialogRoot>,
    )
    const trigger = triggers()[0]!
    expect(trigger.getAttribute('type')).toBe('submit')
    expect(trigger.getAttribute('aria-label')).toBe('我的名字')
    expect(trigger.className.split(/\s+/)).toContain('mine')
    // 部件的接线属性没被顺手丢掉
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
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

  it('非法 asChild 抛出明确错误，不运行默认节点生成器', () => {
    const multiple = (
      <>
        <span>一</span>
        <span>二</span>
      </>
    )
    for (const children of [null, '文字', multiple]) {
      let fallbackCalled = false
      expect(() => renderAsChild(true, children, {}, 'dialog', () => {
        fallbackCalled = true
        return <button />
      })).toThrow(/dialog asChild 需要恰好一个可挂载子节点/)
      expect(fallbackCalled).toBe(false)
    }
    expect(mergeIntoChild(<><button type="button">唯一节点</button></>, {}, 'dialog').type).toBe('button')
  })

  it.each(['可见文本', 0, 42])('拒绝与唯一元素并列的可见内容：%s', (text) => {
    expect(() => mergeIntoChild([text, <button key="host" />], {}, 'dialog')).toThrow(/不能包含非空文本/)
    const nested = (
      <>
        {text}
        <button />
      </>
    )
    expect(() => mergeIntoChild(nested, {}, 'dialog')).toThrow(/不能包含非空文本/)
  })

  it('空白与条件占位不影响唯一组合宿主', () => {
    const child = mergeIntoChild([' \n\t', false, true, null, undefined, <button key="host" />], {}, 'dialog')
    expect(child.type).toBe('button')
  })

  it('仅从 React 19 props 读取双方 ref，挂载与清理均保留', () => {
    const authorCleanup = vi.fn()
    const internalCleanup = vi.fn()
    const author = vi.fn(() => authorCleanup)
    const internal = vi.fn(() => internalCleanup)
    const child = { ...<button type="button" ref={author}>操作</button> }
    Object.defineProperty(child, 'ref', {
      get() { throw new Error('禁止读取 React 19 已废弃的 element.ref') },
    })
    mount(mergeIntoChild(child, { ref: internal }, 'dialog'))
    const button = host!.querySelector('button')!
    expect(author).toHaveBeenCalledExactlyOnceWith(button)
    expect(internal).toHaveBeenCalledExactlyOnceWith(button)
    act(() => root!.unmount())
    root = null
    expect(authorCleanup).toHaveBeenCalledTimes(1)
    expect(internalCleanup).toHaveBeenCalledTimes(1)
  })

  it.each(['默认部件', '组合部件', '组合子节点'] as const)('%s 的作者取消点击后不打开对话框', (location) => {
    const seen: string[] = []
    const cancel = (event: React.MouseEvent) => {
      seen.push('作者')
      event.preventDefault()
    }
    mount(
      <XhDialogRoot onOpenChange={() => seen.push('部件')}>
        <XhDialogTrigger asChild={location !== '默认部件'} onClick={location === '组合子节点' ? undefined : cancel}>
          {location === '默认部件' ? '打开' : <button type="button" onClick={location === '组合子节点' ? cancel : undefined}>打开</button>}
        </XhDialogTrigger>
      </XhDialogRoot>,
    )
    act(() => triggers()[0]!.click())
    expect(seen).toEqual(['作者'])
    expect(triggers()[0]!.getAttribute('aria-expanded')).toBe('false')
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

  it('组合子节点取消键盘事件后不运行部件键盘动作', () => {
    const action = vi.fn()
    mount(mergeIntoChild(<button type="button" onKeyDown={event => event.preventDefault()}>操作</button>, { onKeyDown: action }, 'dialog'))
    act(() => host!.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })))
    expect(action).not.toHaveBeenCalled()
  })

  it('普通多参数回调与通用 props 合并保留原来的连续执行语义', () => {
    const author = vi.fn()
    const internal = vi.fn()
    const detail = { source: '作者' }
    const merged = mergePartProps({ onValueChange: internal }, { onValueChange: author })
    merged.onValueChange('新值', detail)
    expect(author).toHaveBeenCalledWith('新值', detail)
    expect(internal).toHaveBeenCalledWith('新值', detail)

    const event = new Event('click', { cancelable: true })
    const general = mergeReactProps({ onClick: (e: Event) => e.preventDefault() }, { onClick: internal })
    general.onClick(event)
    expect(internal).toHaveBeenLastCalledWith(event)
  })
})
