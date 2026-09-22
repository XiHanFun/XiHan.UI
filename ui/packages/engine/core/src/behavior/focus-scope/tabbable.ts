/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tabbable 相关实现。

import type { FocusableElement } from '../../kernel/types'
import { isDocument, isHTMLElement, isShadowRoot } from '../../kernel/guards'
import { createRenderedProbe } from '../../kernel/utils/rendered'

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
].join(',')

/** 容器内按 DOM 顺序排列的可 tab 元素。 */
export function getTabbables(container: Element): FocusableElement[] {
  const els = Array.from(container.querySelectorAll<FocusableElement>(FOCUSABLE))
  const rendered = createRenderedProbe()
  return els.filter(el => el.tabIndex >= 0 && rendered(el))
}

/**
 * 容器内首尾两个可 tab 元素。Tab 边界回绕每按一次键只要这两个，从两端各扫到第一个命中即止，
 * 不必把整屏候选都判一遍渲染状态。没有可 tab 元素时返回 null。
 */
export function tabbableEdges(container: Element): { first: FocusableElement, last: FocusableElement } | null {
  const els = Array.from(container.querySelectorAll<FocusableElement>(FOCUSABLE))
  const rendered = createRenderedProbe()
  const tabbable = (el: FocusableElement): boolean => el.tabIndex >= 0 && rendered(el)
  let first: FocusableElement | null = null
  for (const el of els) {
    if (tabbable(el)) {
      first = el
      break
    }
  }
  if (!first)
    return null
  let last = first
  for (let index = els.length - 1; index >= 0; index--) {
    const el = els[index]!
    if (el === first || tabbable(el)) {
      last = el
      break
    }
  }
  return { first, last }
}

/** 过滤掉 <a> 元素。 */
export function removeLinks<T extends FocusableElement>(els: T[]): T[] {
  return els.filter(el => el.localName !== 'a')
}

export interface FocusOptions {
  select?: boolean
}

/** 元素所在根（document 或 shadow root）此刻的 activeElement。 */
export function activeElementInRoot(el: FocusableElement): Element | null {
  const root = el.getRootNode()
  return isDocument(root) || isShadowRoot(root)
    ? root.activeElement
    : el.ownerDocument.activeElement
}

function isSelectableTextControl(el: FocusableElement): el is HTMLInputElement | HTMLTextAreaElement {
  return isHTMLElement(el)
    && el.namespaceURI === HTML_NAMESPACE
    && (el.localName === 'input' || el.localName === 'textarea')
}

/** 安全聚焦：不滚动；对输入类可选中文本。已聚焦则跳过。 */
export function focusSafely(el: FocusableElement | null | undefined, opts: FocusOptions = {}): void {
  if (!el || el === activeElementInRoot(el))
    return
  el.focus({ preventScroll: true })
  if (opts.select && isSelectableTextControl(el))
    el.select()
}

/** 依次尝试聚焦，成功（变成 activeElement）即返回 true。 */
export function focusFirst(els: FocusableElement[], opts: FocusOptions = {}): boolean {
  for (const el of els) {
    focusSafely(el, opts)
    if (activeElementInRoot(el) === el)
      return true
  }
  return false
}
