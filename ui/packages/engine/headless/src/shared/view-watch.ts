/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 页面可见性与视口进出共用一份监听。
//
// 按时刷新的部件（相对时间一类）要在页面隐藏、元素滚出视口时停表，各自挂一份的话，表格里几百个
// 「3 分钟前」就是几百个 visibilitychange 监听与几百个交叉观察器，滚动时浏览器要为每个观察器各算一遍
// 交叉；每次刷新重入还要各拆各建一遍。这里按文档 / 窗口各留一份，订阅方共用。

import type { Cleanup } from '@xihan-ui/core'

interface VisibilityWatch {
  listeners: Set<(visible: boolean) => void>
  onChange: () => void
}

const visibilityWatches = new WeakMap<Document, VisibilityWatch>()

/** 页面可见性变化时回调（隐藏为假）；整份文档只挂一个 visibilitychange 监听。 */
export function watchPageVisibility(doc: Document, listener: (visible: boolean) => void): Cleanup {
  let watch = visibilityWatches.get(doc)
  if (!watch) {
    const listeners = new Set<(visible: boolean) => void>()
    const onChange = (): void => {
      const visible = doc.visibilityState !== 'hidden'
      for (const fn of [...listeners]) fn(visible)
    }
    watch = { listeners, onChange }
    visibilityWatches.set(doc, watch)
    doc.addEventListener('visibilitychange', onChange)
  }
  const current = watch
  current.listeners.add(listener)
  return () => {
    current.listeners.delete(listener)
    if (current.listeners.size === 0 && visibilityWatches.get(doc) === current) {
      doc.removeEventListener('visibilitychange', current.onChange)
      visibilityWatches.delete(doc)
    }
  }
}

interface ViewWatch {
  observer: IntersectionObserver
  targets: Map<Element, Set<(inView: boolean) => void>>
}

const viewWatches = new WeakMap<Window, ViewWatch>()

/**
 * 元素进出视口时回调；整个窗口共用一个 IntersectionObserver。
 * 订阅后浏览器先报一次当前状态，回调照常收到，算不算变化由调用方自己比对。
 * 环境没有 IntersectionObserver 时返回 null，调用方按一直在视口里处理。
 */
export function watchInView(win: Window & typeof globalThis, el: Element, listener: (inView: boolean) => void): Cleanup | null {
  const Observer = win.IntersectionObserver as typeof IntersectionObserver | undefined
  if (typeof Observer !== 'function')
    return null
  let watch = viewWatches.get(win)
  if (!watch) {
    const targets = new Map<Element, Set<(inView: boolean) => void>>()
    const observer = new Observer((entries) => {
      for (const entry of entries) {
        const listeners = targets.get(entry.target)
        if (listeners) {
          for (const fn of [...listeners]) fn(entry.isIntersecting)
        }
      }
    })
    watch = { observer, targets }
    viewWatches.set(win, watch)
  }
  const current = watch
  let listeners = current.targets.get(el)
  if (!listeners) {
    listeners = new Set()
    current.targets.set(el, listeners)
  }
  else {
    // 同一节点已在观察中：重新观察一次，让新订阅方也收到那一次当前状态
    current.observer.unobserve(el)
  }
  listeners.add(listener)
  current.observer.observe(el)
  return () => {
    const set = current.targets.get(el)
    if (!set?.delete(listener) || set.size > 0)
      return
    current.targets.delete(el)
    current.observer.unobserve(el)
    if (current.targets.size === 0 && viewWatches.get(win) === current) {
      current.observer.disconnect()
      viewWatches.delete(win)
    }
  }
}
