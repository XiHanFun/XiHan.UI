/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 anchor scroll element 相关行为。

// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { act, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhAnchorItem, XhAnchorLink, XhAnchorList, XhAnchorRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  root = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

function rect(top: number): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    right: 320,
    bottom: top + 80,
    left: 0,
    width: 320,
    height: 80,
    toJSON: () => ({}),
  } as DOMRect
}

function Demo(): ReactNode {
  const scrollEl = useRef<HTMLDivElement>(null)
  return (
    <div ref={scrollEl} data-testid="scroller">
      <XhAnchorRoot collection={['anchor-target']} scrollElement={() => scrollEl.current}>
        <XhAnchorList>
          <XhAnchorItem>
            <XhAnchorLink value="anchor-target">目标章节</XhAnchorLink>
          </XhAnchorItem>
        </XhAnchorList>
      </XhAnchorRoot>
      <section id="anchor-target">内容</section>
    </div>
  )
}

describe('anchor 自定义滚动容器', () => {
  it('挂载效应通过 getter 取得已提交的容器并监听它', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

    await act(async () => root!.render(<Demo />))
    await settle()

    const scroller = host.querySelector<HTMLElement>('[data-testid="scroller"]')!
    const target = host.querySelector<HTMLElement>('#anchor-target')!
    const link = host.querySelector<HTMLAnchorElement>('[data-scope="anchor"][data-part="link"]')!
    scroller.getBoundingClientRect = () => rect(100)
    Object.defineProperties(scroller, {
      scrollTop: { configurable: true, value: 0 },
      clientHeight: { configurable: true, value: 240 },
      scrollHeight: { configurable: true, value: 600 },
    })

    target.getBoundingClientRect = () => rect(180)
    await act(async () => scroller.dispatchEvent(new Event('scroll')))
    await settle()
    expect(link.hasAttribute('aria-current')).toBe(false)

    target.getBoundingClientRect = () => rect(80)
    await act(async () => scroller.dispatchEvent(new Event('scroll')))
    await settle()
    expect(link.getAttribute('aria-current')).toBe('location')
  })
})
