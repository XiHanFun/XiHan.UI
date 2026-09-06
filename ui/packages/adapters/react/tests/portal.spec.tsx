// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhPortal } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
  document.querySelectorAll('[data-testid="tank"]').forEach(n => n.remove())
})

function mount(node: React.ReactNode): void {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

describe('浮层落点', () => {
  it('缺省搬到 body', () => {
    mount(<XhPortal><span data-testid="paint">x</span></XhPortal>)
    const node = document.querySelector('[data-testid="paint"]')!
    expect(node.parentElement).toBe(document.body)
    expect(host!.contains(node)).toBe(false)
  })

  it('不推迟那一档在首帧就已经搬走：拆建会让机器刚放进去的焦点丢掉', () => {
    let firstPaintParent: Element | null | undefined
    function Probe(): React.ReactNode {
      return (
        <XhPortal deferUntilMounted={false}>
          <span
            data-testid="paint"
            ref={(el) => {
              firstPaintParent ??= el?.parentElement
            }}
          >
            x
          </span>
        </XhPortal>
      )
    }
    mount(<Probe />)
    expect(firstPaintParent).toBe(document.body)
  })

  it('实例上写了容器就搬到那儿', () => {
    const tank = document.createElement('div')
    tank.dataset.testid = 'tank'
    document.body.append(tank)
    mount(<XhPortal container={() => tank}><span data-testid="paint">x</span></XhPortal>)
    expect(document.querySelector('[data-testid="paint"]')!.parentElement).toBe(tank)
  })
})
