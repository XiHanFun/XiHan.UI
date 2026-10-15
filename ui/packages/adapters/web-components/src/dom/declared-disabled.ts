/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 declared disabled 相关实现。

/** 作者在标记里对条目的禁用声明。 */
export interface DisabledDeclarations {
  /**
   * 读作者对条目的禁用声明：写了原生 disabled 为 true；否则取 aria-disabled，没写为 undefined。
   * 与本元素上一帧写回之后相同的属性视为作者没动过，沿用此前读到的声明，
   * 所以 connect 写回的 aria-disabled（或 disabled）不会被当成作者的声明，作者随时增删也都认得出。
   */
  readonly read: (el: Element) => boolean | undefined
  /** 本帧把 connect 的产出写到条目上之后调用：记下条目此刻的 disabled 与 aria-disabled。 */
  readonly commit: (el: Element) => void
}

interface Declared {
  readonly native: boolean
  readonly aria: boolean | undefined
}

interface Written {
  readonly native: boolean
  readonly aria: string | null
}

/** 创建条目禁用声明的读取器，按元素分别记下作者声明与上一帧写回的值。 */
export function createDisabledDeclarations(): DisabledDeclarations {
  const declared = new WeakMap<Element, Declared>()
  const written = new WeakMap<Element, Written>()
  return {
    read(el) {
      const native = el.hasAttribute('disabled')
      const aria = el.getAttribute('aria-disabled')
      const last = written.get(el)
      const previous = declared.get(el)
      const next: Declared = {
        native: last === undefined || previous === undefined || native !== last.native ? native : previous.native,
        aria: last === undefined || previous === undefined || aria !== last.aria
          ? (aria === null ? undefined : aria === 'true')
          : previous.aria,
      }
      declared.set(el, next)
      return next.native ? true : next.aria
    },
    commit(el) {
      written.set(el, { native: el.hasAttribute('disabled'), aria: el.getAttribute('aria-disabled') })
    },
  }
}
