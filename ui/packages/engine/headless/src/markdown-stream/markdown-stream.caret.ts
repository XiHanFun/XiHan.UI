/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 流式光标的落点与收尾。
//
// 光标是外壳的 ::after，整段流式期间是同一个：块定稿、换到下一块都不换节点，收尾时才接得住退场。
// 出字之后它绝对定位到正文最后一个字后面，落点从字的矩形量出、写进外壳上的私有槽；
// 量字不往已消毒的 html 里注入节点，「原生 HTML 一律不透传」照样成立。

import type { AnimationHandle } from '@xihan-ui/motion'
import { readDirection } from '@xihan-ui/core'
import { animate, motionEasings, readMotion } from '@xihan-ui/motion'
import { graphemes } from '../shared/grapheme'
import { markdownStreamAnatomy } from './markdown-stream.anatomy'

const parts = markdownStreamAnatomy.build()

/** 外壳上写光标落点的私有槽，皮肤从这里读。 */
const SLOTS = {
  position: '--xh-_markdown-stream-caret-position',
  x: '--xh-_markdown-stream-caret-x',
  y: '--xh-_markdown-stream-caret-y',
  font: '--xh-_markdown-stream-caret-font',
} as const

/** 从块尾往回找字时最多看几个文本节点：块尾的空白节点就几个，看到这么多还没字就当没有。 */
const SCAN_LIMIT = 64

/** 取末字时切多长的尾巴：最长的组合 emoji 也在这之内。 */
const TAIL = 32

interface Glyph {
  /** 末字的矩形。 */
  rect: DOMRect
  /** 末字所在块露出来的矩形：块横滚时末字可能滚出了块。 */
  view: DOMRect
  /** 末字的字号，光标按它缩放，标题后面的光标跟标题一样高。 */
  font: number
}

/** 块里最后一个排出来的字；块里没有字时返回 undefined。 */
function lastGlyphIn(block: HTMLElement): Glyph | undefined {
  const doc = block.ownerDocument
  const walker = doc.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  const range = doc.createRange()
  let node = walker.lastChild() as Text | null
  for (let scanned = 0; node && scanned < SCAN_LIMIT; scanned++, node = walker.previousNode() as Text | null) {
    const text = node.data.trimEnd()
    if (!text)
      continue
    const last = graphemes(text.slice(-TAIL)).at(-1) ?? ''
    range.setStart(node, text.length - last.length)
    range.setEnd(node, text.length)
    const rects = range.getClientRects()
    const rect = rects[rects.length - 1]
    // 藏起来的节点排不出矩形
    if (!rect || (rect.width === 0 && rect.height === 0))
      continue
    const font = Number.parseFloat(doc.defaultView?.getComputedStyle(node.parentElement ?? block).fontSize ?? '')
    return { rect, view: block.getBoundingClientRect(), font: Number.isFinite(font) ? font : 0 }
  }
  return undefined
}

/** 外壳里最后一个字：从最后一块往前找，嵌套在块里的别的流式正文不算。 */
function lastGlyph(root: HTMLElement): Glyph | undefined {
  const blocks = root.querySelectorAll<HTMLElement>(parts.block.selector)
  for (let index = blocks.length - 1; index >= 0; index--) {
    const block = blocks[index]!
    if (block.closest(parts.root.selector) !== root)
      continue
    const glyph = lastGlyphIn(block)
    if (glyph)
      return glyph
  }
  return undefined
}

function px(value: number): string {
  return `${Math.round(value * 100) / 100}px`
}

/** 取过渡曲线令牌的 CSS 串，读不到时退回 JS 侧的同名缓动。 */
function easeOf(el: Element, name: 'exit'): string {
  return el.ownerDocument.defaultView?.getComputedStyle(el).getPropertyValue(`--xh-motion-ease-${name}`).trim() || motionEasings[name]
}

/**
 * 把光标贴到正文最后一个字后面：量末字相对外壳内衬盒的位置，写进私有槽。
 * 还没有字时撤掉落点，光标留在文档流里撑起一行。外壳没排版时不动。
 */
function place(root: HTMLElement, written: Map<string, string>): void {
  const write = (name: string, value: string | null): void => {
    if ((written.get(name) ?? null) === value)
      return
    if (value === null) {
      written.delete(name)
      root.style.removeProperty(name)
    }
    else {
      written.set(name, value)
      root.style.setProperty(name, value)
    }
  }
  if (!root.offsetWidth || !root.offsetHeight)
    return
  const glyph = lastGlyph(root)
  if (!glyph) {
    for (const name of Object.values(SLOTS))
      write(name, null)
    return
  }
  const box = root.getBoundingClientRect()
  // 祖先的缩放（对话框进场）把屏幕矩形一起缩了，换回外壳自己的排布尺度
  const sx = box.width / root.offsetWidth || 1
  const sy = box.height / root.offsetHeight || 1
  const { rect, view, font } = glyph
  const clamp = (edge: number): number => Math.min(Math.max(edge, view.left), view.right)
  const borderInlineEnd = root.offsetWidth - root.clientWidth - root.clientLeft
  const borderBlockEnd = root.offsetHeight - root.clientHeight - root.clientTop
  // 行内一轴从内衬盒的行首量到字尾；块向从内衬盒的下缘量到字的下缘，光标底边与字底对齐
  const x = readDirection(root) === 'rtl'
    ? (box.right - clamp(rect.left)) / sx - borderInlineEnd
    : (clamp(rect.right) - box.left) / sx - root.clientLeft
  const y = (box.bottom - rect.bottom) / sy - borderBlockEnd
  write(SLOTS.position, 'absolute')
  write(SLOTS.x, px(x))
  write(SLOTS.y, px(y))
  write(SLOTS.font, font > 0 ? px(font) : null)
}

/**
 * 接上外壳的流式光标：跟着正文贴到最后一个字后面，收尾时原地淡出。返回释放函数。
 *
 * 外壳带 data-caret 时光标在场。正文增删、外壳尺寸变化、块内横滚、字体加载完成都重量一次；
 * 观察器回调在框架提交之后、绘制之前，光标与新字同一帧落定。data-caret 撤下那一轮还要量一次：
 * 定稿的块常与收尾同一轮提交，淡出得落在最后一个字后面。退场是播在 ::after 上的脚本动画，
 * 播的时候光标保持可见，播完回到皮肤里不在场的样子；又开始流式时撤掉淡出，进场归皮肤。
 */
export function trackMarkdownStreamCaret(root: HTMLElement): () => void {
  const win = root.ownerDocument.defaultView
  const MutationObserverCtor = win?.MutationObserver
  if (!win || typeof MutationObserverCtor !== 'function')
    return () => {}
  const written = new Map<string, string>()
  let showing = root.hasAttribute('data-caret')
  let leaving: AnimationHandle | null = null

  const sync = (): void => {
    const next = root.hasAttribute('data-caret')
    if (next || showing)
      place(root, written)
    if (showing && !next) {
      leaving?.cancel()
      leaving = animate(root, [{ opacity: 1, visibility: 'visible' }, { opacity: 0, visibility: 'visible' }], {
        pseudoElement: '::after',
        duration: readMotion(root).duration('exit'),
        easing: easeOf(root, 'exit'),
      })
    }
    else if (next && !showing) {
      leaving?.cancel()
      leaving = null
    }
    showing = next
  }

  const mutationObserver = new MutationObserverCtor(sync)
  mutationObserver.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-caret'] })
  const ResizeObserverCtor = win.ResizeObserver
  const resizeObserver = typeof ResizeObserverCtor === 'function' ? new ResizeObserverCtor(sync) : null
  resizeObserver?.observe(root)
  // 块各自横滚，滚动不冒泡，在外壳上按捕获接
  root.addEventListener('scroll', sync, { capture: true, passive: true })
  const fonts = root.ownerDocument.fonts as FontFaceSet | undefined
  fonts?.addEventListener?.('loadingdone', sync)
  if (showing)
    place(root, written)

  return () => {
    mutationObserver.disconnect()
    resizeObserver?.disconnect()
    root.removeEventListener('scroll', sync, { capture: true })
    fonts?.removeEventListener?.('loadingdone', sync)
    leaving?.cancel()
    leaving = null
  }
}
