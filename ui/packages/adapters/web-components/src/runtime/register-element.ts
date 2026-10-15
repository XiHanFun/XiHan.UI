/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 注册第三方自定义元素：同一构造器重复注册不报错，标签被别的构造器占用时抛错，没有 customElements 的环境跳过。

/** 把 ctor 注册为 tag；不写任何全局登记表。 */
export function registerElement(tag: string, ctor: CustomElementConstructor): void {
  if (typeof customElements === 'undefined')
    return
  const existing = customElements.get(tag)
  if (existing === ctor)
    return
  if (existing)
    throw new Error(`[xihan-ui] 标签 ${tag} 已被另一个构造器注册`)
  customElements.define(tag, ctor)
}
