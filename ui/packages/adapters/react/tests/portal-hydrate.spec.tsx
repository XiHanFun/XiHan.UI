// @vitest-environment jsdom
//
// 服务端直出过、又要搬到浮层落点的那一屏，水合时两条路都验一遍。
//
// 缺省是首帧就搬。担心的是重影——服务端那份留在原地、客户端又在落点上渲一份，正文出现两遍；
// 实测 React 19 会把原位那份收掉，只剩落点上的一份，也不报错。
// 推迟那一档留着是给「首帧必须与服务端标记逐字一致」的场合，代价是搬迁时子树被拆建一次、
// 机器放进去的焦点跟着丢，所以不作缺省。
//
// 服务端那一半在 portal-ssr.spec.tsx 里（那份跑在真的没有 document 的宿主上，
// 是唯一测得出服务端行为的地方）：浮层在服务端一律就地渲染。这里拿那份产出的形状来水合。
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhPortal } from '../src'

/** 服务端直出的形状：内容就地，没有搬走。 */
const SERVER_HTML = '<div><template data-xh-portal-source=""></template><div data-xh-portal-shell="" style="display:contents"><span data-part="content">正文</span></div></div>'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function hydrateWith(tree: React.ReactElement): { errors: unknown[][], root: ReturnType<typeof hydrateRoot> } {
  host = document.createElement('div')
  host.innerHTML = SERVER_HTML
  document.body.append(host)

  const errors: unknown[][] = []
  const original = console.error
  console.error = (...args: unknown[]) => void errors.push(args)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  let root!: ReturnType<typeof hydrateRoot>
  try {
    act(() => {
      root = hydrateRoot(host!, tree)
    })
  }
  finally {
    console.error = original
  }
  return { errors, root }
}

describe('浮层的水合', () => {
  it('推迟那一档：与服务端标记对齐，水合零报错，随后才搬进 body', () => {
    const tree = <div><XhPortal deferUntilMounted><span data-part="content">正文</span></XhPortal></div>
    const { errors, root } = hydrateWith(tree)
    expect(errors).toEqual([])
    expect(document.querySelector('[data-part="content"]')!.parentElement?.parentElement).toBe(document.body)
    act(() => root.unmount())
  })

  it('缺省那一档：首帧就搬，服务端那一份不会留下重影', () => {
    const tree = <div><XhPortal><span data-part="content">正文</span></XhPortal></div>
    const { errors, root } = hydrateWith(tree)
    // 真正会伤人的是重影：服务端那份留在原地、客户端又在 body 上渲一份，正文出现两遍
    const found = document.querySelectorAll('[data-part="content"]')
    expect(found).toHaveLength(1)
    expect(found[0]!.parentElement?.parentElement).toBe(document.body)
    expect(errors).toEqual([])
    act(() => root.unmount())
  })
})
