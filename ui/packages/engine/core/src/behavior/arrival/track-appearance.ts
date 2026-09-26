/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 单个节点的出现：随页面首屏就在的直接呈现，之后的每一次出现才播进场。
//
// 节点出现有两条来路：挂载进来（条件渲染、脚本插入），或从收起翻成显出（hidden、祖先的 display 切换）。
// 页面首屏上就可见的节点不算出现——页面加载完成之前挂上的、服务端渲染后水合的，都保持 data-instant
// 直接呈现，直到它第一次不再生成盒；此后再显出，就是用户操作或新数据带来的。
// 页面加载完成之后挂上、或挂上时本就不可见，当场放开。
//
// 「页面加载完成」取文档的 readyState：它同步可读、与字体加载和绘制时机无关，服务端渲染与脚本插入的判定都确定。
// 放开由调用方落实（机器写状态，连接层撤掉 data-instant）。放开只发生在首帧绘制之前或节点不可见期间，
// 皮肤的进场关键帧因此从第一帧起播，不会先露出终态再跳回起帧。

export interface TrackAppearanceOptions {
  /**
   * 节点来自服务端渲染的 HTML（水合）。这样的节点即使在页面加载完成之后才挂上，也属于首屏。
   */
  adopted?: boolean
}

/** 节点此刻是否生成盒：自身或祖先 display: none、不在文档中时都没有。 */
function rendered(el: Element): boolean {
  return el.getClientRects().length > 0
}

/**
 * 盯住一个节点的出现。节点属于首屏时保持现状，直到它第一次不再生成盒才调用 release；
 * 不属于首屏（页面加载完成之后挂上、且不是水合来的）或挂上时本就不可见，当场调用 release。
 *
 * release 只调用一次。返回停止观察的函数。
 */
export function trackAppearance(el: HTMLElement, release: () => void, options: TrackAppearanceOptions = {}): () => void {
  if (!rendered(el) || (!options.adopted && el.ownerDocument.readyState === 'complete')) {
    release()
    return () => {}
  }
  // 首屏就可见：收起时盒的尺寸归零，观察器在那一刻回调。生成盒就说明在某个窗口的文档里
  const win = el.ownerDocument.defaultView as Window
  const observer = new win.ResizeObserver(() => {
    if (rendered(el))
      return
    observer.disconnect()
    release()
  })
  observer.observe(el)
  return () => observer.disconnect()
}
