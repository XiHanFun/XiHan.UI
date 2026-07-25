// VirtualizerPort：虚拟滚动端口（§4.3.11）。M1 只落类型，实现在 M5.5。
// core 只承诺契约，DataTable / VirtualList 在各自适配器接线。

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
