/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 输入框里某个字符位置的光标矩形：用与输入框同字体、同内边距、同换行规则的离屏镜像量出来，扣掉输入框自己的滚动。

import type { PositionRect } from '../../kernel/types/position'

/** 镜像复制的属性：决定字形宽度、行盒高度与软换行位置的那些。只量横向书写。 */
const MIRRORED_PROPERTIES = [
  'border-top-style',
  'border-top-width',
  'border-right-style',
  'border-right-width',
  'border-bottom-style',
  'border-bottom-width',
  'border-left-style',
  'border-left-width',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-optical-sizing',
  'font-size',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-variation-settings',
  'font-weight',
  'hyphens',
  'letter-spacing',
  'line-height',
  'overflow-wrap',
  'tab-size',
  'text-indent',
  'text-rendering',
  'text-transform',
  'word-break',
  'word-spacing',
  'direction',
  'unicode-bidi',
] as const

/** 零宽空格：光标在末尾时给标记一个行盒。 */
const ZERO_WIDTH = '​'

function px(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * 输入框里第 `index` 个 UTF-16 位置的光标矩形，视口坐标：宽度为 0，纵向是光标所在那一行的行盒（行高是像素值时取行高，否则取字形高度）。
 *
 * - `<textarea>` 按它当前的内容宽度软换行（扣掉滚动条），光标落在哪一行就给哪一行的位置；
 * - `<input>` 不换行，纵向取内容区里居中的那一行；
 * - 两者都扣掉输入框自己的横向与纵向滚动，光标滚出可见区时矩形也在可见区之外；
 * - `index` 超出范围时夹到 `0` 与值的长度之间；密码框按明文量。
 *
 * 量法是在同一文档里建一个离屏镜像，复制字体、内边距、边框与换行相关的计算样式，
 * 写入光标之前的文本、光标处的一个标记与其后的文本，读标记的位置后立即移除，不留痕迹。
 *
 * 元素不在文档里、或没有布局（`display: none`、无渲染环境）时返回 null。
 * 典型用法是给浮层当虚拟锚点：`{ getBoundingClientRect: () => caretClientRect(el, el.selectionEnd ?? 0) ?? fallback }`。
 */
export function caretClientRect(element: HTMLInputElement | HTMLTextAreaElement, index: number): PositionRect | null {
  const doc = element.ownerDocument
  const view = doc.defaultView
  if (!element.isConnected || view === null || element.getClientRects().length === 0)
    return null
  const style = view.getComputedStyle(element)
  const multiline = element.tagName === 'TEXTAREA'
  const value = element.value
  const at = Math.min(Math.max(Number.isFinite(index) ? Math.trunc(index) : 0, 0), value.length)

  const mirror = doc.createElement('div')
  for (const name of MIRRORED_PROPERTIES)
    mirror.style.setProperty(name, style.getPropertyValue(name))
  const paddingInline = px(style.paddingLeft) + px(style.paddingRight)
  mirror.style.setProperty('position', 'absolute')
  mirror.style.setProperty('inset', '0 auto auto 0')
  mirror.style.setProperty('visibility', 'hidden')
  mirror.style.setProperty('box-sizing', 'content-box')
  mirror.style.setProperty('overflow', 'hidden')
  mirror.style.setProperty('white-space', multiline ? 'pre-wrap' : 'pre')
  mirror.style.setProperty('inline-size', multiline ? `${Math.max(element.clientWidth - paddingInline, 0)}px` : 'max-content')
  if (multiline && style.getPropertyValue('overflow-wrap') === 'normal')
    mirror.style.setProperty('overflow-wrap', 'break-word')

  const marker = doc.createElement('span')
  marker.textContent = value.slice(at, at + 1) || ZERO_WIDTH
  mirror.append(doc.createTextNode(value.slice(0, at)), marker, doc.createTextNode(value.slice(at + 1)))
  doc.body.append(mirror)
  const frame = mirror.getBoundingClientRect()
  const mark = marker.getBoundingClientRect()
  mirror.remove()

  const box = element.getBoundingClientRect()
  const height = style.lineHeight.endsWith('px') ? px(style.lineHeight) : mark.height
  const x = box.left + mark.left - frame.left - element.scrollLeft
  if (multiline)
    return { x, y: box.top + mark.top - frame.top - (height - mark.height) / 2 - element.scrollTop, width: 0, height }
  const content = element.clientHeight - px(style.paddingTop) - px(style.paddingBottom)
  const y = box.top + px(style.borderTopWidth) + px(style.paddingTop) + (content - height) / 2
  return { x, y, width: 0, height }
}
