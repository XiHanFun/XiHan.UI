/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 派发自定义事件：与库内元素同一约定，冒泡并穿过 shadow 边界。

export interface EmitEventOptions {
  /** 事件能否被 preventDefault，缺省 false。 */
  readonly cancelable?: boolean
}

/** 在 target 上派发 CustomEvent，detail 原样带出；返回值为 false 表示事件被 preventDefault。 */
export function emitEvent<T>(target: EventTarget, type: string, detail: T, options: EmitEventOptions = {}): boolean {
  return target.dispatchEvent(new CustomEvent<T>(type, {
    detail,
    bubbles: true,
    composed: true,
    cancelable: options.cancelable ?? false,
  }))
}
