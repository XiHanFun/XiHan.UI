// 换图的交叉淡变：头像与图片换了 src、新图还在载入时，旧图的替身原样盖在原处；新图载好那一刻替身淡出、播完即移除。
// React 的宿主先提交新 src、后跑机器：替身的 src 取上一回载好的那一张，不取 DOM 里此刻的。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot, XhImageFallback, XhImageImage, XhImageRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import './hidden-important-host'

let root: Root | null = null
let host: HTMLElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

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

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
})

function swatch(color: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="${color}"/></svg>`)}`
}

let setSrc: (src: string) => void = () => {}

function Swap({ scope }: { scope: 'avatar' | 'image' }): ReactNode {
  const [src, set] = useState(swatch('red'))
  setSrc = set
  return scope === 'avatar'
    ? (
        <XhAvatarRoot src={src} alt="头像">
          <XhAvatarImage />
          <XhAvatarFallback>AB</XhAvatarFallback>
        </XhAvatarRoot>
      )
    : (
        <XhImageRoot src={src} alt="图片" style={{ inlineSize: '64px', blockSize: '64px' }}>
          <XhImageImage />
          <XhImageFallback>失败</XhImageFallback>
        </XhImageRoot>
      )
}

describe.each(['avatar', 'image'] as const)('react %s 换图', (scope) => {
  it('换了 src：旧图的替身盖在原处；新图载好那一刻替身淡出，播完即移除', async () => {
    host = document.createElement('div')
    host.style.setProperty('--xh-motion-duration-exit', '10s')
    document.body.append(host)
    root = createRoot(host)
    await inAct(() => root!.render(<Swap scope={scope} />))
    const image = (): HTMLElement => host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='image']:not([data-xh-ghost])`)!
    await expect.poll(() => image().getAttribute('data-state')).toBe('loaded')
    await inAct(() => setSrc(swatch('blue')))
    await expect.poll(() => host!.querySelector(`[data-scope='${scope}'][data-part='image'][data-xh-ghost]`) !== null).toBe(true)
    const ghost = host!.querySelector<HTMLImageElement>(`[data-scope='${scope}'][data-part='image'][data-xh-ghost]`)!
    expect(ghost.getAttribute('src')).toBe(swatch('red'))
    await expect.poll(() => image().getAttribute('data-state')).toBe('loaded')
    await expect.poll(() => ghost.getAttribute('data-state')).toBe('closed')
    expect(ghost.getAnimations().map(a => (a as CSSAnimation).animationName)).toEqual(['xh-fade-out'])
    for (const animation of ghost.getAnimations())
      animation.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })
})
