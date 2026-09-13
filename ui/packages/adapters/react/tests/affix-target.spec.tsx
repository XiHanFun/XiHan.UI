/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 affix target 相关行为。

// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { act, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhAffixContent, XhAffixRoot } from '../src'

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

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    top,
    right: left + width,
    bottom: top + height,
    left,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect
}

function Demo(): ReactNode {
  const target = useRef<HTMLDivElement>(null)
  return (
    <div ref={target} data-testid="target">
      <XhAffixRoot target={() => target.current}>
        <XhAffixContent>工具栏</XhAffixContent>
      </XhAffixRoot>
    </div>
  )
}

describe('affix 自定义滚动容器', () => {
  it('挂载效应通过 getter 取得已提交的容器并监听它', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

    await act(async () => root!.render(<Demo />))
    await settle()

    const target = host.querySelector<HTMLElement>('[data-testid="target"]')!
    const placeholder = host.querySelector<HTMLElement>('[data-scope="affix"][data-part="root"]')!
    const content = host.querySelector<HTMLElement>('[data-scope="affix"][data-part="content"]')!
    target.getBoundingClientRect = () => rect(100, 0, 300, 200)
    placeholder.getBoundingClientRect = () => rect(80, 20, 200, 40)
    Object.defineProperties(target, {
      scrollTop: { configurable: true, value: 20 },
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 500 },
    })

    await act(async () => target.dispatchEvent(new Event('scroll')))
    await settle()

    expect(content.hasAttribute('data-fixed')).toBe(true)
    expect(content.style.top).toBe('100px')
    expect(content.style.left).toBe('20px')
    expect(content.style.width).toBe('200px')
  })
})
