/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 派发自定义事件：库内元素都经这一处，冒泡并穿过 shadow 边界。

export interface EmitEventOptions {
  /**
   * 是否冒泡并穿过 shadow 边界，缺省 true。只有与原生事件同名、冒泡会被祖先误认的事件写 false，
   * 如 `submit`：一冒泡就被祖先 `<form>` 当成自身的提交。
   */
  readonly bubbles?: boolean
  /** 事件能否被 preventDefault，缺省 false。 */
  readonly cancelable?: boolean
}

/** 在 target 上派发 CustomEvent，detail 原样带出（不给时为 null）；返回值为 false 表示事件被 preventDefault。 */
export function emitEvent<T>(target: EventTarget, type: string, detail?: T, options: EmitEventOptions = {}): boolean {
  const bubbles = options.bubbles ?? true
  return target.dispatchEvent(new CustomEvent<T | undefined>(type, {
    detail,
    bubbles,
    composed: bubbles,
    cancelable: options.cancelable ?? false,
  }))
}
