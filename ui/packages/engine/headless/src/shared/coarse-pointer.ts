/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 粗指针探测共用一个 MediaQueryList。
//
// 自绘滚动条每条轴都要知道当前是不是触屏（粗指针下交给原生滚动），各自 matchMedia 的话，
// 页面上几百条轴（关着的下拉、选择器里也各有一条）就是几百个媒体查询，窗口一缩放浏览器逐个重算。
// 这里按窗口只留一份，订阅方共用。

import type { Cleanup } from '@xihan-ui/core'

const QUERY = '(pointer: coarse)'

interface CoarseWatch {
  query: MediaQueryList
  listeners: Set<(coarse: boolean) => void>
  onChange: () => void
}

const watches = new WeakMap<Window, CoarseWatch>()

/**
 * 订阅「当前主指针是不是粗指针」：订阅时先同步回调一次当前值，之后随设备切换回调。
 * 环境没有 matchMedia 时返回 null，调用方按细指针处理。
 */
export function watchCoarsePointer(win: Window, listener: (coarse: boolean) => void): Cleanup | null {
  if (typeof win.matchMedia !== 'function')
    return null
  let watch = watches.get(win)
  if (!watch) {
    const query = win.matchMedia(QUERY)
    const listeners = new Set<(coarse: boolean) => void>()
    const onChange = (): void => {
      for (const fn of [...listeners]) fn(query.matches)
    }
    watch = { query, listeners, onChange }
    watches.set(win, watch)
    query.addEventListener('change', onChange)
  }
  const current = watch
  current.listeners.add(listener)
  listener(current.query.matches)
  return () => {
    current.listeners.delete(listener)
    if (current.listeners.size === 0) {
      current.query.removeEventListener('change', current.onChange)
      watches.delete(win)
    }
  }
}
