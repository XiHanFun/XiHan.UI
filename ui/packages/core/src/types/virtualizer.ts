// VirtualizerPort：虚拟滚动端口的类型契约，实现由各适配器提供。

export interface VirtualItem {
  index: number
  start: number
  size: number
}

export interface VirtualizerOptions {
  count: number
  /** 每项估计尺寸（px）。 */
  estimateSize: (index: number) => number
  overscan?: number
}

export interface VirtualizerPort {
  getVirtualItems: () => VirtualItem[]
  getTotalSize: () => number
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void
  /** 视口/内容尺寸变化时通知重算。 */
  measure: () => void
}
