/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层按需块的加载器。
//
// 消解层、焦点域、滚动锁、背景失活、Portal 视觉桥与标签动效只在浮层第一次打开时才用得上，
// 它们住在单独的一块（src/overlay-kit.ts）里，由这里第一次要用时 import()。消费方的打包器
// （Vite / Rollup / webpack）会把它切成按需块，首屏不下载；size-limit 的首屏条目同样不算它，按需块另记一条。
//
// 加载过一次之后整页都同步取用，行为与静态引入一模一样；还没到的那段时间，调用方经 whenOverlayKit 排队，
// 到了再接。按需块要下载，第一次打开会晚一拍：浮层用 prefetchOverlayKit 在文档上第一次有交互时就在后台取，
// 真打开时多半已经到了。
//
// 加载器是 kernel 里唯一回指上层的地方，而且只是 import() 与类型：按需块本身照旧从 kernel 与 behavior 往下引。

import type { overlayKit as kit } from '../../overlay-kit'
import type { Cleanup } from '../types'
import { onFirstInteraction } from '../utils/first-interaction'

/** 浮层按需块里的那几件。 */
export type OverlayKit = typeof kit

let loaded: OverlayKit | null = null
let loading: Promise<OverlayKit> | null = null
const waiting = new Set<(kit: OverlayKit) => void>()
/** 已经报过失败的那几次加载：同一次失败只报一遍，不管排了多少个调用方。 */
const reported = new WeakSet<Promise<OverlayKit>>()

/** 回调与加载的异常挪到下一个微任务里抛出：照样进控制台与错误上报，又不打断别的排队者、不让加载本身失败。 */
function rethrowLater(error: unknown): void {
  queueMicrotask(() => {
    throw error
  })
}

function settle(next: OverlayKit): OverlayKit {
  loaded = next
  const queued = [...waiting]
  waiting.clear()
  for (const run of queued) {
    try {
      run(next)
    }
    catch (error) {
      rethrowLater(error)
    }
  }
  return next
}

/**
 * 加载浮层按需块，可以重复调用：已经到了直接给，正在下就等同一次。
 * 失败不缓存，下一次调用重新取；浮层要用时会再调，所以一次网络抖动不会让整页的浮层从此失灵。
 */
export function loadOverlayKit(): Promise<OverlayKit> {
  if (loaded)
    return Promise.resolve(loaded)
  loading ??= import('../../overlay-kit').then(
    module => settle(module.overlayKit),
    (error: unknown) => {
      loading = null
      throw error
    },
  )
  return loading
}

/** 按需块已经到了就给，还没到给 null。 */
export function overlayKit(): OverlayKit | null {
  return loaded
}

/**
 * 按需块已经到了就给；还没到抛错。只给「已经确认到了」的路径用（whenOverlayKit 的回调里、
 * 闸门放行之后），不是取用的常规写法。
 */
export function requireOverlayKit(): OverlayKit {
  if (!loaded)
    throw new Error('[xh] 浮层按需块还没加载：先经 whenOverlayKit 排队，或先 await loadOverlayKit()')
  return loaded
}

/**
 * 按需块到了就调 run：已经到了当场调，还没到就排队并开始加载。返回的清理撤掉还在排的那一次，
 * 已经调过就是空操作。加载失败报一次错，排着的调用方继续等下一次加载。
 */
export function whenOverlayKit(run: (kit: OverlayKit) => void): Cleanup {
  if (loaded) {
    run(loaded)
    return () => {}
  }
  const entry = (next: OverlayKit): void => run(next)
  waiting.add(entry)
  const attempt = loadOverlayKit()
  if (!reported.has(attempt)) {
    reported.add(attempt)
    attempt.catch(rethrowLater)
  }
  return () => {
    waiting.delete(entry)
  }
}

/** 预取不报错：真要用时还会再取一次，到那时再报。 */
function prefetch(): void {
  loadOverlayKit().catch(() => {})
}

/**
 * 文档上第一次有交互时在后台取浮层按需块；已经交互过就当场取。浮层挂载时登记，
 * 同一文档只登记一次，取过之后为空操作。
 */
export function prefetchOverlayKit(doc: Document): void {
  if (!loaded)
    onFirstInteraction(doc, prefetch)
}
