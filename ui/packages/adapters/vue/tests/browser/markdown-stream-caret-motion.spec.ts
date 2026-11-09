// 流式光标挂在外壳上：出字后贴在正文最后一个字后面，块定稿、换到下一块都是同一个光标；
// 收尾时在最后一个字后面原地淡出、播完才藏起。在播的动画与伪元素的落点只有真实浏览器量得出来。
import type { MarkdownBlock } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhMarkdownStreamContent, XhMarkdownStreamRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  document.body.innerHTML = ''
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

const live = (html: string): MarkdownBlock => ({ key: 'live', kind: 'markdown', html, complete: false })
const done = (key: string, html: string): MarkdownBlock => ({ key, kind: 'markdown', html, complete: true })

async function mount(initial: readonly MarkdownBlock[]): Promise<{ root: HTMLElement, blocks: { value: readonly MarkdownBlock[] }, streaming: { value: boolean } }> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  for (const name of ['enter', 'exit'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  const blocks = ref<readonly MarkdownBlock[]>(initial)
  const streaming = ref(true)
  app = createApp({
    render: () => h(XhMarkdownStreamRoot, { blocks: blocks.value, streaming: streaming.value }, () => h(XhMarkdownStreamContent)),
  })
  app.mount(host)
  await frames(3)
  return { root: host.querySelector<HTMLElement>(`[data-scope='markdown-stream'][data-part='root']`)!, blocks, streaming }
}

/** 正文最后一个字的矩形。 */
function lastChar(root: HTMLElement): DOMRect {
  const blocks = root.querySelectorAll(`[data-part='block']`)
  const walker = document.createTreeWalker(blocks[blocks.length - 1]!, NodeFilter.SHOW_TEXT)
  const node = walker.lastChild() as Text
  const range = document.createRange()
  range.setStart(node, node.data.length - 1)
  range.setEnd(node, node.data.length)
  return range.getBoundingClientRect()
}

/** 光标（外壳的 ::after）的行首缘与下缘，按计算样式里的定位换回屏幕坐标。 */
function caret(root: HTMLElement): { start: number, bottom: number, position: string, visibility: string } {
  const style = getComputedStyle(root, '::after')
  const box = root.getBoundingClientRect()
  const borderBlockEnd = root.offsetHeight - root.clientHeight - root.clientTop
  return {
    start: box.left + root.clientLeft + Number.parseFloat(style.left),
    bottom: box.bottom - borderBlockEnd - Number.parseFloat(style.bottom),
    position: style.position,
    visibility: style.visibility,
  }
}

function caretAnimations(root: HTMLElement): Animation[] {
  return root.getAnimations({ subtree: true }).filter(a => (a.effect as KeyframeEffect | null)?.pseudoElement === '::after')
}

function scripted(root: HTMLElement): Animation | undefined {
  return caretAnimations(root).find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

describe('流式光标挂在外壳上', () => {
  it('一个字都还没到时光标留在文档流里撑起一行，闪着等', async () => {
    const { root, blocks } = await mount([])
    expect(root.hasAttribute('data-caret')).toBe(true)
    expect(root.hasAttribute('data-empty')).toBe(true)
    expect(caret(root).position).toBe('static')
    expect(root.offsetHeight).toBeGreaterThan(0)
    expect(caretAnimations(root).map(a => (a as CSSAnimation).animationName)).toContain('xh-markdown-stream-caret')
    blocks.value = [live('<p>第一个字</p>')]
    await frames(1)
    expect(root.hasAttribute('data-empty')).toBe(false)
    expect(caret(root).position).toBe('absolute')
  })

  it('出字后贴在最后一个字后面；块定稿、换到下一块还是同一个光标', async () => {
    const { root, blocks } = await mount([live('<p>第一段正在写</p>')])
    const block = root.querySelector(`[data-part='block']`)!
    expect(block.hasAttribute('data-caret'), '光标不再挂在块上').toBe(false)
    let glyph = lastChar(root)
    expect(Math.abs(caret(root).start - glyph.right)).toBeLessThan(1)
    expect(Math.abs(caret(root).bottom - glyph.bottom)).toBeLessThan(1.5)
    const entering = caretAnimations(root).find(a => a instanceof CSSAnimation)!
    expect(entering).toBeDefined()

    blocks.value = [done('b0', '<p>第一段正在写完了</p>'), live('<h2>第二段</h2>')]
    await frames(1)
    glyph = lastChar(root)
    expect(Math.abs(caret(root).start - glyph.right), '跟到下一块的末字').toBeLessThan(1)
    expect(Math.abs(caret(root).bottom - glyph.bottom)).toBeLessThan(1.5)
    expect(caretAnimations(root).find(a => a instanceof CSSAnimation), '进场不重播').toBe(entering)
  })

  it('收尾时在最后一个字后面原地淡出、播完才藏起', async () => {
    const { root, blocks, streaming } = await mount([live('<p>快写完了</p>')])
    for (const animation of caretAnimations(root))
      animation.finish()
    blocks.value = [done('b0', '<p>快写完了，收尾</p>')]
    streaming.value = false
    await frames(1)
    expect(root.hasAttribute('data-caret')).toBe(false)
    const leaving = scripted(root)!
    expect(leaving).toBeDefined()
    expect(caret(root).visibility).toBe('visible')
    expect(Math.abs(caret(root).start - lastChar(root).right), '落在定稿后的末字后面').toBeLessThan(1)
    leaving.finish()
    await frames(1)
    expect(caret(root).visibility).toBe('hidden')
  })
})
