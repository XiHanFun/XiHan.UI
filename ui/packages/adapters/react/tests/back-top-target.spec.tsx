// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { act, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhBackTopRoot, XhBackTopTrigger } from '../src'

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

function Demo(): ReactNode {
  const target = useRef<HTMLDivElement>(null)
  return (
    <div ref={target} data-testid="target">
      <XhBackTopRoot target={() => target.current} visibilityHeight={40}>
        <XhBackTopTrigger>回到顶部</XhBackTopTrigger>
      </XhBackTopRoot>
    </div>
  )
}

describe('back-top 自定义滚动容器', () => {
  it('挂载效应通过 getter 取得已提交的容器并监听它', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

    await act(async () => root!.render(<Demo />))
    await settle()

    const target = host.querySelector<HTMLElement>('[data-testid="target"]')!
    const backTop = host.querySelector<HTMLElement>('[data-scope="back-top"][data-part="root"]')!
    const trigger = host.querySelector<HTMLButtonElement>('[data-scope="back-top"][data-part="trigger"]')!
    const scrollTo = vi.fn()
    target.scrollTo = scrollTo
    Object.defineProperties(target, {
      scrollTop: { configurable: true, value: 80 },
      clientHeight: { configurable: true, value: 240 },
      scrollHeight: { configurable: true, value: 600 },
    })

    await act(async () => target.dispatchEvent(new Event('scroll')))
    await settle()
    expect(backTop.dataset.state).toBe('visible')
    expect(trigger.hidden).toBe(false)

    await act(async () => trigger.click())
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
