/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 元素替作者补的状态反馈节点：懒分支的在途、失败、重试与空结果，整树的空态与在途占位。
// 作者写了同名部件就用作者的，并撤掉此前补的那个；作者没写时在容器末尾补一个。
// 文字只在节点原本为空时由元素写入缺省文案，作者自己写的文字不动。

import { PART_ATTR } from './parts'

export class FeedbackNodes {
  private readonly ownsText = new WeakMap<HTMLElement, boolean>()
  private readonly generated = new WeakSet<HTMLElement>()

  /**
   * 找到或补出 parent 里名为 name 的反馈部件。给了 owner 时只认最近的 owner 正是 parent 的那些：
   * 嵌套分支里，子分支的反馈不算作父分支的。
   */
  ensure(parent: HTMLElement | null, name: string, tag = 'div', owner?: string): HTMLElement | null {
    if (!parent)
      return null
    const candidates = [...parent.querySelectorAll<HTMLElement>(`[${PART_ATTR}="${name}"]`)]
      .filter(el => owner == null || el.closest(owner) === parent)
    const authored = candidates.find(el => !this.generated.has(el))
    if (authored) {
      for (const generated of candidates) {
        if (this.generated.has(generated))
          generated.remove()
      }
      return authored
    }
    if (candidates[0])
      return candidates[0]
    const el = parent.ownerDocument.createElement(tag)
    el.setAttribute(PART_ATTR, name)
    this.generated.add(el)
    parent.append(el)
    return el
  }

  /** 节点第一次经手时原本为空，文字就归元素，之后照缺省文案改写；原本有字的归作者，不动。 */
  fillText(el: HTMLElement, text: string): void {
    let owned = this.ownsText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsText.set(el, owned)
    }
    if (owned && el.textContent !== text)
      el.textContent = text
  }
}
