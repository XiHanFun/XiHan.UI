// 滚动区的命令式滚动与两个通知：scrollTo 由函数式 children 交出、滚的是视口；
// onScrollChange 按轴报滚动量，onReachEnd 只在跨过末端那一下报。
import type { ScrollAreaScrollDetails, ScrollAreaScrollToOptions } from '@xihan-ui/headless'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhScrollAreaContent, XhScrollAreaRoot, XhScrollAreaScrollbar, XhScrollAreaViewport } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function frames(): Promise<void> {
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await inAct(async () => Promise.resolve())
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

describe('scroll-area 命令式滚动与通知（Chromium）', () => {
  it('children 拿到的 scrollTo 滚视口；两个通知按轴报、到头只报一次', async () => {
    host = document.createElement('div')
    document.body.append(host)
    const changes: ScrollAreaScrollDetails[] = []
    const ends: ScrollAreaScrollDetails[] = []
    let scrollTo: ((options: ScrollAreaScrollToOptions) => void) | null = null
    root = createRoot(host)
    await inAct(() => root!.render(
      <XhScrollAreaRoot
        style={{ inlineSize: 200, blockSize: 120 }}
        onScrollChange={details => changes.push(details)}
        onReachEnd={details => ends.push(details)}
      >
        {(slot) => {
          scrollTo = slot.scrollTo
          return (
            <>
              <XhScrollAreaViewport style={{ blockSize: '100%' }}>
                <XhScrollAreaContent>
                  <div style={{ inlineSize: 600, blockSize: 1000 }}>长内容</div>
                </XhScrollAreaContent>
              </XhScrollAreaViewport>
              <XhScrollAreaScrollbar orientation="vertical" />
            </>
          )
        }}
      </XhScrollAreaRoot>,
    ))
    await frames()
    const viewport = document.querySelector<HTMLElement>('[data-scope="scroll-area"][data-part="viewport"]')!

    scrollTo!({ top: 50 })
    await frames()
    expect(viewport.scrollTop).toBe(50)
    expect(changes.at(-1)).toMatchObject({ orientation: 'vertical', offset: 50 })

    scrollTo!({ top: 100000 })
    await frames()
    scrollTo!({ top: 100000 })
    await frames()
    expect(ends).toHaveLength(1)
    expect(ends[0]).toMatchObject({ orientation: 'vertical', offset: viewport.scrollHeight - viewport.clientHeight })
  })
})
