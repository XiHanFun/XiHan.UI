// 结算模型：token 用量与费用。
// 全部只读且全部可选——不同供应商给的字段集不一样，缺项是常态而非异常。

export interface TokenUsage {
  readonly inputTokens?: number
  readonly outputTokens?: number
  readonly totalTokens?: number
  readonly reasoningTokens?: number
  readonly cachedInputTokens?: number
}

export interface CostBreakdown {
  /** ISO 4217，如 'CNY' / 'USD'。 */
  readonly currency: string
  readonly input?: number
  readonly output?: number
  readonly total?: number
}

/** 一次运行的结算信息。只读，流结束时一次性写入，中途不可见。 */
export interface MessageMetadata {
  readonly usage?: TokenUsage
  readonly cost?: CostBreakdown
  readonly modelId?: string
  readonly finishReason?: string
}
