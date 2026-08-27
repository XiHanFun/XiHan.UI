// 指针会话的类型契约。

/** 一次指针位置，只带会话用得上的两个坐标。 */
export interface PointerPoint {
  clientX: number
  clientY: number
}

/** 会话每次回送的信息。 */
export interface PointerSessionDetails {
  point: PointerPoint
  pointerId: number
  /** 压感，无压感设备恒为 0.5（浏览器给的值，会话不加工）。 */
  pressure: number
  event: PointerEvent
}

/** 会话是怎么结束的：手抬起来，还是被系统收走。 */
export type PointerEndReason = 'pointerup' | 'pointercancel'

export interface PointerEndDetails extends PointerSessionDetails {
  reason: PointerEndReason
}

export interface PointerSessionOptions {
  /**
   * 会话跟随的文档。
   * 给 null（无 DOM 的纯逻辑测试）时会话退化成空操作，`dispose` 照常可调。
   */
  doc: Document | null
  /**
   * 只跟这根指针。
   * 给了值就把别的指针的事件全滤掉——多指同时按下时，第二根手指不会劫持正在进行的那一场。
   * 不给则不过滤。
   */
  pointerId?: number
  /** 指针移动。 */
  onMove: (details: PointerSessionDetails) => void
  /** 手抬起来或被系统收走。两种情形都只回送一次。 */
  onEnd: (details: PointerEndDetails) => void
}

export interface PointerSession {
  /** 摘掉监听。调用方必须在拆卸路径上调它，重复调用是安全的。 */
  dispose: () => void
}
