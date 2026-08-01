// 输入法组合态探测。

/** 组合期间的按键属于候选词框，组件一律不接。 */
export interface ComposingLike {
  readonly isComposing?: boolean
  /** 不上报 isComposing 的输入法（Safari 与旧 WebKit）在组合期间统一给 229。 */
  readonly keyCode?: number
}

export function isComposingEvent(event: ComposingLike): boolean {
  return event.isComposing === true || event.keyCode === 229
}
