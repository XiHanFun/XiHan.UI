/** 一个已渲染的顶层块。html 一律已消毒，可直接交给宿主插进 DOM。 */
export interface RenderedBlock {
  /**
   * 稳定 key。生长中的那一块恒为 {@link LIVE_BLOCK_KEY}，定型块由下标与内容摘要拼成。
   *
   * 稳定性是防整段重建的关键：生长块 key 不变，框架才会复用同一份 DOM 只改文本；
   * 每帧换 key 的话，用户每收到一个 token 就要被重建一次节点，选区和滚动位置全丢。
   */
  readonly key: string
  readonly kind: 'markdown' | 'code' | 'math' | 'html'
  /** 已消毒的 HTML。 */
  readonly html: string
  /** 该块是否已闭合。未闭合的块随时会变，宿主据此决定要不要上高亮这类昂贵渲染。 */
  readonly complete: boolean
  /** 围栏语言标注，仅 code 块有。半截或不认识的标注一律留原样，由消费方降级。 */
  readonly lang?: string
}

export interface RenderOpts {
  /**
   * 流是否已经结束。
   *
   * 为真时最后一块也按定型处理：不再做未闭合补全、拿到自己的稳定 key。
   * 不传等同于「还在生长」——宁可多当一帧生长态，也不要把没吐完的内容当成定稿。
   */
  readonly ended?: boolean
}

export interface StreamRenderer {
  /**
   * 幂等：传入截至当前的全文，返回稳定 key 的块列表。
   * 同一份全文调多少次结果都一样；内部按块 memo，已定型的块不会重渲。
   */
  render: (fullText: string, opts?: RenderOpts) => readonly RenderedBlock[]
  dispose: () => void
}

/** 生长块的固定 key。 */
export const LIVE_BLOCK_KEY = 'live'
