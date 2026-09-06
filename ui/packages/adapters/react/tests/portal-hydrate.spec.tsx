// @vitest-environment jsdom
//
// 服务端就地渲染、客户端首帧也就地渲染、搬迁推迟到效应里——这三件凑齐水合才不失配。
// 首帧就搬会让客户端首次渲染与服务端标记对不上，React 会整棵丢弃重渲。
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { XhPortal } from '../src'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

describe('浮层的水合', () => {
  it('服务端标记与客户端首帧一致，水合不报错，随后搬进 body', () => {
    const tree = <div><XhPortal><span data-part="content">正文</span></XhPortal></div>
    const html = renderToString(tree)
    expect(html).toContain('正文')

    host = document.createElement('div')
    host.innerHTML = html
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

    expect(errors).toEqual([])
    // 效应跑完之后内容已经搬到 body 上
    expect(document.querySelector('[data-part="content"]')!.parentElement).toBe(document.body)
    act(() => root.unmount())
  })
})
