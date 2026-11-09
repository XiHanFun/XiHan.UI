// 流式光标挂在外壳上：出字后贴在正文最后一个字后面，块定稿、换到下一块都是同一个光标；
// 收尾时在最后一个字后面原地淡出、播完才藏起。宿主带着 [hidden]{display:none!important}（Tailwind preflight 同款）。
import type { MarkdownBlock } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from '../../src'
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

async function settle(count = 4): Promise<void> {
  for (let index = 0; index < count; index++) {
    await inAct(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
  }
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

const live = (html: string): MarkdownBlock => ({ key: 'live', kind: 'markdown', html, complete: false })
const done = (key: string, html: string): MarkdownBlock => ({ key, kind: 'markdown', html, complete: true })

let setBlocks: (blocks: readonly MarkdownBlock[]) => void = () => {}
let setStreaming: (streaming: boolean) => void = () => {}

function Stream({ initial }: { initial: readonly MarkdownBlock[] }): ReactNode {
  const [blocks, set] = useState(initial)
  const [streaming, flip] = useState(true)
  setBlocks = set
  setStreaming = flip
  return (
    <XhMarkdownStreamRoot blocks={blocks} streaming={streaming}>
      <XhMarkdownStreamContent />
    </XhMarkdownStreamRoot>
  )
}

async function mount(initial: readonly MarkdownBlock[]): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  for (const name of ['enter', 'exit'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(<Stream initial={initial} />))
  await settle()
  return host.querySelector<HTMLElement>(`[data-scope='markdown-stream'][data-part='root']`)!
}

/** 正文最后一个字的矩形。 */
function lastChar(el: HTMLElement): DOMRect {
  const blocks = el.querySelectorAll(`[data-part='block']`)
  const walker = document.createTreeWalker(blocks[blocks.length - 1]!, NodeFilter.SHOW_TEXT)
  const node = walker.lastChild() as Text
  const range = document.createRange()
  range.setStart(node, node.data.length - 1)
  range.setEnd(node, node.data.length)
  return range.getBoundingClientRect()
}

/** 光标（外壳的 ::after）的行首缘与下缘，按计算样式里的定位换回屏幕坐标。 */
function caret(el: HTMLElement): { start: number, bottom: number, position: string, visibility: string } {
  const style = getComputedStyle(el, '::after')
  const box = el.getBoundingClientRect()
  const borderBlockEnd = el.offsetHeight - el.clientHeight - el.clientTop
  return {
    start: box.left + el.clientLeft + Number.parseFloat(style.left),
    bottom: box.bottom - borderBlockEnd - Number.parseFloat(style.bottom),
    position: style.position,
    visibility: style.visibility,
  }
}

function caretAnimations(el: HTMLElement): Animation[] {
  return el.getAnimations({ subtree: true }).filter(a => (a.effect as KeyframeEffect | null)?.pseudoElement === '::after')
}

function scripted(el: HTMLElement): Animation | undefined {
  return caretAnimations(el).find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

describe('react 流式光标挂在外壳上', () => {
  it('一个字都还没到时光标留在文档流里撑起一行，闪着等', async () => {
    const el = await mount([])
    expect(el.hasAttribute('data-caret')).toBe(true)
    expect(el.hasAttribute('data-empty')).toBe(true)
    expect(caret(el).position).toBe('static')
    expect(el.offsetHeight).toBeGreaterThan(0)
    await inAct(() => setBlocks([live('<p>第一个字</p>')]))
    await settle(1)
    expect(el.hasAttribute('data-empty')).toBe(false)
    expect(caret(el).position).toBe('absolute')
  })

  it('出字后贴在最后一个字后面；块定稿、换到下一块还是同一个光标', async () => {
    const el = await mount([live('<p>第一段正在写</p>')])
    expect(el.querySelector(`[data-part='block']`)!.hasAttribute('data-caret')).toBe(false)
    let glyph = lastChar(el)
    expect(Math.abs(caret(el).start - glyph.right)).toBeLessThan(1)
    expect(Math.abs(caret(el).bottom - glyph.bottom)).toBeLessThan(1.5)
    const entering = caretAnimations(el).find(a => a instanceof CSSAnimation)!
    expect(entering).toBeDefined()
    await inAct(() => setBlocks([done('b0', '<p>第一段正在写完了</p>'), live('<h2>第二段</h2>')]))
    await settle(1)
    glyph = lastChar(el)
    expect(Math.abs(caret(el).start - glyph.right)).toBeLessThan(1)
    expect(Math.abs(caret(el).bottom - glyph.bottom)).toBeLessThan(1.5)
    expect(caretAnimations(el).find(a => a instanceof CSSAnimation)).toBe(entering)
  })

  it('收尾时在最后一个字后面原地淡出、播完才藏起', async () => {
    const el = await mount([live('<p>快写完了</p>')])
    for (const animation of caretAnimations(el))
      animation.finish()
    await inAct(() => {
      setBlocks([done('b0', '<p>快写完了，收尾</p>')])
      setStreaming(false)
    })
    await settle(1)
    expect(el.hasAttribute('data-caret')).toBe(false)
    const leaving = scripted(el)!
    expect(leaving).toBeDefined()
    expect(caret(el).visibility).toBe('visible')
    expect(Math.abs(caret(el).start - lastChar(el).right)).toBeLessThan(1)
    leaving.finish()
    await settle(1)
    expect(caret(el).visibility).toBe('hidden')
  })
})
