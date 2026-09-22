/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 rendered 相关实现。

import { isHTMLElement } from '../guards'

/** 判「元素在渲染树里且自身可见」的探针；一次查询里共享祖先判定。 */
export type RenderedProbe = (el: Element) => boolean

/**
 * 建一枚探针。同一个容器里的候选元素祖先高度重合：`display: none` 沿祖先链查到第一个
 * 已有答案的层即可停，整棵链的结论顺手记下。一屏 400 个控件、15 层容器时，逐个从头查是
 * 400 × 16 次计算样式，共享之后是 400 + 层数。
 *
 * 探针只在一次查询内有效，不跨查询留存：DOM 与样式随时会变，缓存久了就会说谎。
 */
export function createRenderedProbe(): RenderedProbe {
  const displayed = new Map<Element, boolean>()
  return (el) => {
    const win = el.ownerDocument.defaultView
    const own = win?.getComputedStyle(el)
    if (own && (own.visibility === 'hidden' || own.visibility === 'collapse'))
      return false
    const pending: Element[] = []
    let rendered = true
    for (let node: Element | null = el; node; node = node.parentElement) {
      const known = displayed.get(node)
      if (known !== undefined) {
        rendered = known
        break
      }
      pending.push(node)
      const style = node === el ? own : win?.getComputedStyle(node)
      if ((isHTMLElement(node) && node.hidden) || style?.display === 'none') {
        rendered = false
        break
      }
    }
    // 记下整条链：命中 false 时链上每一层都在同一棵退出渲染树的子树里；命中 true 时每一层都已逐一验过。
    for (const node of pending)
      displayed.set(node, rendered)
    return rendered
  }
}

/**
 * 元素处于渲染树里且自身可见：祖先链上没有 hidden 或 display: none，自身的 visibility
 * 不是 hidden / collapse。visibility 会继承、也能被后代改回 visible，只看自身的计算值；
 * display: none 让整棵子树退出渲染树，后代的计算值仍是自己的声明，要沿祖先链查。
 * 浏览器只让处于渲染树里的可见元素接住 focus()；jsdom 不做排版，把这条判据显式补上，
 * 两处运行时对「能不能聚焦」才有同一个答案。
 *
 * 一批元素一起判时用 createRenderedProbe，别逐个调用这里。
 */
export function isRendered(el: Element): boolean {
  return createRenderedProbe()(el)
}
