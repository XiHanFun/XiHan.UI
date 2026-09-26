/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 条目到达：首帧就在的内容不播进场，之后同一批新到的条目按到达顺序错开。
//
// 进场只属于「用户操作或新数据带来的出现」。列表首次渲染时已有的条目（历史消息、打开时已有的结果）
// 直接呈现；之后新到的条目播进场，同一批里按到达顺序错开，不按 DOM 位置——排在第 6 位的新通知
// 不该先等 5 个错开步长。

/** 不播进场的标记：皮肤把进场关键帧写在 `:not([data-instant])` 下。 */
export const INSTANT_ATTR = 'data-instant'

/** 同一批新到条目的错开序号，0 起；皮肤写 `animation-delay: calc(var(--xh-_stagger-index, 0) * var(--xh-motion-stagger-step))`。 */
export const STAGGER_INDEX_PROPERTY = '--xh-_stagger-index'

/** 错开序号的封顶：一批来得再多，最后一条也只等这么多个步长。 */
export const STAGGER_CAP = 4

export interface TrackArrivalsOptions {
  /** 条目选择器：容器里匹配它的元素算一个条目，可以不是直接子节点。 */
  item: string
  /**
   * 开始时已在的条目怎么算：`'instant'`（缺省）属于首帧、打上 data-instant 不播进场；
   * `'arrive'` 算作第一批到达，照常进场并按顺序错开——通知这类「每一条都是一件新事」的条目用它。
   */
  initial?: 'instant' | 'arrive'
}

/**
 * 盯住容器里的条目到达。
 *
 * 开始时已在的条目打上 `data-instant`：它们属于首帧，进场不播（`initial: 'arrive'` 时改算第一批到达）。
 * 之后每一批到达——插入 DOM，或撤掉 `hidden` 重新露出来（露出来时 CSS 动画会从头播）——按文档顺序排号，写进私有槽
 * `--xh-_stagger-index`（封顶 {@link STAGGER_CAP}），并撤掉它身上可能带着的 `data-instant`。
 * 同一次 DOM 变更回调收到的算同一批：框架一次提交插入的条目落在同一个微任务里。
 *
 * 标记在插入所在的微任务里写好，赶在样式计算之前，进场动画按新的序号起播。
 * 返回停止观察的函数。
 */
export function trackArrivals(container: Element, options: TrackArrivalsOptions): () => void {
  const { item } = options
  const present = [...container.querySelectorAll(item)]
  if (options.initial === 'arrive')
    arrive(present)
  else present.forEach(el => el.setAttribute(INSTANT_ATTR, ''))

  const win = container.ownerDocument.defaultView
  const Observer = win?.MutationObserver
  if (typeof Observer !== 'function')
    return () => {}

  const observer = new Observer((records) => {
    const arrived = new Set<Element>()
    const collect = (node: Node): void => {
      if (node.nodeType !== 1)
        return
      const el = node as Element
      if (el.matches(item))
        arrived.add(el)
      for (const inner of el.querySelectorAll(item))
        arrived.add(inner)
    }
    for (const record of records) {
      if (record.type === 'childList')
        record.addedNodes.forEach(collect)
      else if (record.oldValue !== null && !(record.target as Element).hasAttribute('hidden'))
        collect(record.target)
    }
    arrive([...arrived]
      .filter(el => el.isConnected && container.contains(el) && !el.closest('[hidden]'))
      .sort((a, b) => (a.compareDocumentPosition(b) & 4 /* DOCUMENT_POSITION_FOLLOWING */ ? -1 : 1)))
  })
  observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'], attributeOldValue: true })
  return () => observer.disconnect()
}

/** 一批到达：按给定顺序排号，撤掉首帧标记。 */
function arrive(batch: readonly Element[]): void {
  batch.forEach((el, index) => {
    el.removeAttribute(INSTANT_ATTR)
    ;(el as HTMLElement).style.setProperty(STAGGER_INDEX_PROPERTY, String(Math.min(index, STAGGER_CAP)))
  })
}

/**
 * 页面上的用户是否已经动过手（点按、按键）。还没有时挂载的内容属于页面载入时就在的内容，不播进场。
 *
 * 读 `navigator.userActivation.hasBeenActive`。宿主没有这个接口时按已动过手算：进场照常播，
 * 与没有这条规则时一致。
 */
export function hasUserActivated(win: Window): boolean {
  const activation = (win.navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
  return activation === undefined || activation.hasBeenActive
}
