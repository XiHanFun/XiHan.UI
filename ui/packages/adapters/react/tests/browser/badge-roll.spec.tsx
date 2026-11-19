// 角标换数：变了的位滚过去，多出、少掉的一位宽度补间；播完各位回到不动的写法。
// React 提交之后机器才去等各位身上的动画，节点没到位就会当场落定、一帧都不滚。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhBadge } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

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

async function settle(): Promise<void> {
  for (let index = 0; index < 4; index++) {
    await inAct(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
  }
}

async function render(count: number): Promise<HTMLElement> {
  await inAct(() => root!.render(<XhBadge count={count} size="sm"><button type="button">消息</button></XhBadge>))
  await settle()
  return host!.querySelector<HTMLElement>(`[data-scope='badge'][data-part='indicator']`)!
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
})

describe('badge 换数滚动（React）', () => {
  it('9 → 10：十位从无到有、个位换字，都在滚；播完各位回到不动的写法', async () => {
    host = document.createElement('div')
    // 拉长滚动，确认提交之后它真的在播
    host.style.setProperty('--xh-motion-duration-move', '10s')
    document.body.append(host)
    root = createRoot(host)
    await render(9)
    const indicator = await render(10)

    expect(indicator.hasAttribute('data-animating')).toBe(true)
    const [tens, ones] = Array.from(indicator.querySelectorAll<HTMLElement>(`[data-part='glyph']`))
    expect(tens!.dataset.presence).toBe('enter')
    expect(ones!.dataset).toMatchObject({ roll: 'up', from: '9' })
    expect(ones!.getAnimations().map(animation => (animation as CSSAnimation).animationName)).toEqual(['xh-badge-roll-up'])
    expect(ones!.getAnimations()[0]!.playState).toBe('running')

    for (const animation of indicator.getAnimations({ subtree: true }))
      animation.finish()
    await expect.poll(async () => {
      await settle()
      return indicator.hasAttribute('data-animating')
    }, { timeout: 2000 }).toBe(false)
    expect(Array.from(indicator.querySelectorAll<HTMLElement>(`[data-part='glyph']`)).map(glyph => glyph.dataset.roll)).toEqual([undefined, undefined])
    expect(indicator.textContent).toBe('10')
  })
})
