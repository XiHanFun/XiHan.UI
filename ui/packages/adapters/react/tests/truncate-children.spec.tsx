// @vitest-environment jsdom
//
// 函数式 children 那条路与量测口的接线，共享一致性套件都咬不到：
// 套件的 fixture 只递静态子节点，载荷一次都没取过；而量测口（refs.getRootEl）
// 若没在建机器那一刻交出去，观察器挂上时读到的是 null，量测整条链静默不跑。
import type { ReactNode } from 'react'
import type { TruncateSlotProps } from '../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhTruncate } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: ReactNode): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

function rootEl(): HTMLElement {
  return host!.querySelector<HTMLElement>('[data-scope="truncate"][data-part="root"]')!
}

/** 无布局环境四个尺寸恒是 0，把这一刻量到的结果原地伪造出来。 */
function measuredAs(scroll: number, client: number): void {
  const el = rootEl()
  for (const name of ['scrollWidth', 'clientWidth', 'scrollHeight', 'clientHeight']) {
    Object.defineProperty(el, name, {
      configurable: true,
      value: name.startsWith('scroll') ? scroll : client,
    })
  }
}

describe('truncate 的函数式 children', () => {
  it('载荷四样都交到手上：展开态、溢出结论与两个方法', () => {
    let seen: TruncateSlotProps | null = null
    mount(
      <XhTruncate>
        {(payload) => {
          seen = payload
          return '一段字'
        }}
      </XhTruncate>,
    )
    expect(seen!.open).toBe(false)
    expect(seen!.overflowing).toBe(false)
    expect(typeof seen!.setOpen).toBe('function')
    expect(typeof seen!.measure).toBe('function')
  })

  it('静态 children 照常渲染：不是函数就原样当子节点', () => {
    mount(<XhTruncate><span>一段字</span></XhTruncate>)
    expect(rootEl().innerHTML).toBe('<span>一段字</span>')
  })

  it('载荷里的 setOpen 走的是同一条路：展开态当场翻面', () => {
    let toggle: (next: boolean) => void = () => {}
    mount(
      <XhTruncate expandable>
        {({ setOpen }) => {
          toggle = setOpen
          return '一段字'
        }}
      </XhTruncate>,
    )
    act(() => toggle(true))
    expect(rootEl().getAttribute('data-state')).toBe('open')
  })
})

describe('truncate 的量测口', () => {
  it('measure 量的是根节点：伪造成放不下之后，溢出结论与载荷一起翻面', () => {
    let payload: TruncateSlotProps | null = null
    mount(
      <XhTruncate>
        {(next) => {
          payload = next
          return '一段字'
        }}
      </XhTruncate>,
    )
    expect(rootEl().getAttribute('data-overflowing')).toBe(null)

    measuredAs(400, 100)
    act(() => payload!.measure())
    expect(rootEl().getAttribute('data-overflowing')).toBe('')
    expect(payload!.overflowing).toBe(true)
  })

  it('量出被裁会经 onOverflowChange 报一次', async () => {
    const seen: boolean[] = []
    mount(<XhTruncate onOverflowChange={({ overflowing }) => seen.push(overflowing)}>一段字</XhTruncate>)
    measuredAs(400, 100)
    // 观察器盯的是盒内的内容，改一下它把量测拉起来
    await act(async () => {
      rootEl().append(document.createTextNode(''))
      await Promise.resolve()
    })
    expect(seen).toEqual([true])
  })
})
